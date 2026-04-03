import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// R2 Configuration - lazy initialization
let r2Client: S3Client | null = null

function getR2Client(): S3Client {
  if (!r2Client) {
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
    const R2_ENDPOINT = process.env.R2_ENDPOINT

    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
      throw new Error('Missing R2 configuration. Please check your environment variables.')
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  }
  
  return r2Client
}

function getR2Bucket(): string {
  return process.env.R2_BUCKET || 'shelivery'
}

/**
 * Infer a proper Content-Type from the storage key extension when the stored
 * metadata is missing or generic ("application/octet-stream").
 * This fixes iOS AVPlayer -11828 (unsupported format) that occurs when the
 * wrong/missing MIME type is served for audio files.
 */
function resolveContentType(key: string, storedType: string | undefined): string {
  if (storedType && storedType !== 'application/octet-stream') {
    return storedType
  }

  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  const extMap: Record<string, string> = {
    'm4a': 'audio/mp4',
    'mp4': 'audio/mp4',
    'mp3': 'audio/mpeg',
    'mpeg': 'audio/mpeg',
    'wav': 'audio/wav',
    'webm': 'audio/webm',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    'caf': 'audio/x-caf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
  }

  return extMap[ext] ?? storedType ?? 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    
    if (!filePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Fetch the full object from R2 (we handle Range slicing ourselves to
    // guarantee correct Content-Range headers — required for iOS AVPlayer)
    const client = getR2Client()
    const bucket = getR2Bucket()

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: filePath,
    })

    const r2Response = await client.send(command)
    
    if (!r2Response.Body) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Stream full object into memory
    const chunks: Uint8Array[] = []
    const reader = r2Response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    const fullBuffer = Buffer.concat(chunks)
    const totalSize = fullBuffer.length

    // Resolve content-type — infer from extension if R2 stored a generic type
    const contentType = resolveContentType(filePath, r2Response.ContentType)

    // ── Range request handling ────────────────────────────────────────────────
    // iOS AVPlayer requires proper 206 responses with Accept-Ranges + Content-Range
    // to stream audio. Without this it throws -11850 (server not configured).
    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/)
      if (match) {
        const rawStart = match[1]
        const rawEnd = match[2]
        const start = rawStart ? parseInt(rawStart, 10) : 0
        const end = rawEnd ? Math.min(parseInt(rawEnd, 10), totalSize - 1) : totalSize - 1
        const chunk = fullBuffer.slice(start, end + 1)

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunk.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    // ── Full response ─────────────────────────────────────────────────────────
    return new NextResponse(fullBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': totalSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Media proxy error:', error)
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 })
  }
}
