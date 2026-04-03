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
      return NextResponse.json({ error: 'chatroomId is required' }, { status: 400 })
    }

    if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
      return NextResponse.json({ error: 'mediaType must be audio or image' }, { status: 400 })
    }

    if (!contentType || !isValidMimeType(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 })
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

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 60,
    })
  } catch (error) {
    console.error('Presign upload route error:', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }
}
