import { NextRequest, NextResponse } from 'next/server'
import { uploadAvatar } from '@/lib/r2-storage'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Upload to R2
    const { url, error } = await uploadAvatar(userId, file)

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

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('user')
      .update({ image: url })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update user profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Avatar upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
