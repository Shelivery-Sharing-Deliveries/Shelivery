import { NextRequest, NextResponse } from 'next/server'
import { uploadChatMedia } from '@/lib/r2-storage'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | Blob
    const chatroomId = formData.get('chatroomId') as string
    const messageId = formData.get('messageId') as string
    const mediaType = formData.get('mediaType') as 'image' | 'audio'

    if (!file || !chatroomId || !messageId || !mediaType) {
      return NextResponse.json(
        { error: 'File, chatroomId, messageId, and mediaType are required' },
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

    // Optionally, you could store the media URL in a messages table here
    // For now, we'll just return the URL and let the client handle storing it
    
    return NextResponse.json({ url, messageId })
  } catch (error) {
    console.error('Chat media upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
