import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ENDPOINT = process.env.R2_ENDPOINT ?? ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? ''
const R2_BUCKET = process.env.R2_BUCKET ?? 'shelivery'
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

const ALLOWED_MEDIA_TYPES = new Set(['audio', 'image'])
const ALLOWED_MIME_PREFIXES = ['audio/', 'image/']

let r2Client: S3Client | null = null

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin') ?? ''
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.EXPO_PUBLIC_WEB_URL,
    'http://localhost:8081',
    'http://localhost:3000',
  ].filter(Boolean) as string[]

  if (allowedOrigins.includes(origin)) return origin
  return allowedOrigins[0] ?? '*'
}

function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = getCorsOrigin(request)
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Vary', 'Origin')
  return response
}

function getR2Client(): S3Client {
  if (!r2Client) {
    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new Error('Missing R2 configuration on server environment variables')
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      // Disable automatic checksum injection — required for browser PUT via presigned URLs.
      // AWS SDK v3 adds CRC32 checksums by default which break browser-side uploads
      // because the browser cannot reproduce the same signed headers.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }

  return r2Client
}

function isValidMimeType(contentType: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((prefix) => contentType.startsWith(prefix))
}

function sanitizeExtension(extension: string): string {
  return extension.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
}

function getPublicUrl(key: string): string {
  // Prefer the Next.js image proxy URL so the stored URL is identical
  // to what the PWA generates — this makes messages renderable on both
  // the PWA and the native mobile app via the same absolute URL.
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
  if (appUrl) {
    return `${appUrl}/api/images/${key}`
  }

  // Fallback to custom CDN / direct R2 URL if APP_URL not set
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`
  }

  const trimmedEndpoint = R2_ENDPOINT.replace(/\/$/, '')
  return `${trimmedEndpoint}/${R2_BUCKET}/${key}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const chatroomId = String(body?.chatroomId ?? '').trim()
    const mediaType = String(body?.mediaType ?? '').trim()
    const contentType = String(body?.contentType ?? '').trim().toLowerCase()
    const extension = sanitizeExtension(String(body?.extension ?? 'bin'))

    if (!chatroomId) {
      return withCors(NextResponse.json({ error: 'chatroomId is required' }, { status: 400 }), request)
    }

    if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
      return withCors(NextResponse.json({ error: 'mediaType must be audio or image' }, { status: 400 }), request)
    }

    if (!contentType || !isValidMimeType(contentType)) {
      return withCors(NextResponse.json({ error: 'Invalid contentType' }, { status: 400 }), request)
    }

    const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const key = `chat-media/${chatroomId}/${mediaType}/${uid}.${extension}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    })

    const client = getR2Client()
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 })
    const publicUrl = getPublicUrl(key)

    return withCors(NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 60,
    }), request)
  } catch (error) {
    console.error('Presign upload route error:', error)
    return withCors(NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 }), request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 204 }), request)
}
