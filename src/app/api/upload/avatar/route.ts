import { NextRequest, NextResponse } from 'next/server'
import { uploadAvatar } from '@/lib/r2-storage'
import { supabase } from '@/lib/supabase'
import { compressImage, canCompressImage, getCompressionOptions } from '@/lib/image-compression'

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

    let fileToUpload = file

    // Compress image if it's compressible
    if (canCompressImage(file)) {
      console.log('Compressing avatar image before upload...')
      try {
        const compressionOptions = getCompressionOptions('avatar')
        fileToUpload = await compressImage(file, compressionOptions)
      } catch (compressionError) {
        console.warn('Avatar compression failed, uploading original:', compressionError)
        // Continue with original file if compression fails
        fileToUpload = file
      }
    }

    // Upload to R2
    const { url, error } = await uploadAvatar(userId, fileToUpload)

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
    console.error('Avatar upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
