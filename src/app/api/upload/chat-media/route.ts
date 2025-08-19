import { NextRequest, NextResponse } from 'next/server'
import { uploadChatMedia } from '@/lib/r2-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const chatroomId = formData.get('chatroomId') as string
    const messageId = formData.get('messageId') as string
    const mediaType = formData.get('mediaType') as 'image' | 'audio'

    if (!file || !chatroomId || !messageId || !mediaType) {
      return NextResponse.json(
        { error: 'File, chatroomId, messageId, and mediaType are required' },
        { status: 400 }
      )
    }

    if (!['image', 'audio'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'mediaType must be either "image" or "audio"' },
        { status: 400 }
      )
    }

    // Upload to R2
    const { url, error } = await uploadChatMedia(chatroomId, messageId, file, mediaType)

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      )
    }

    if (!url) {
      return NextResponse.json(
        { error: 'Upload failed - no URL returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Chat media upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
