import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// R2 Configuration
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET || 'shelivery'
const R2_ENDPOINT = process.env.R2_ENDPOINT

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
  throw new Error('Missing R2 configuration. Please check your environment variables.')
}

// Create R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    
    if (!imagePath) {
      return NextResponse.json({ error: 'Image path is required' }, { status: 400 })
    }

    // Get the object from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: imagePath,
    })

    const response = await r2Client.send(command)
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Convert the stream to buffer
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    const buffer = Buffer.concat(chunks)

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    
    // Return a 404 for missing images instead of 500
    if (error && typeof error === 'object' && 'name' in error && error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 })
  }
}
