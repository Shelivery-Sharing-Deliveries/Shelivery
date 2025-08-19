import { NextRequest, NextResponse } from 'next/server'
import { uploadShopLogo } from '@/lib/r2-storage'
import { compressImage, canCompressImage, getCompressionOptions } from '@/lib/image-compression'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const shopId = formData.get('shopId') as string

    if (!file || !shopId) {
      return NextResponse.json(
        { error: 'File and shopId are required' },
        { status: 400 }
      )
    }

    let fileToUpload = file

    // Compress image if it's compressible
    if (canCompressImage(file)) {
      console.log('Compressing shop logo image before upload...')
      try {
        const compressionOptions = getCompressionOptions('logo')
        fileToUpload = await compressImage(file, compressionOptions)
      } catch (compressionError) {
        console.warn('Shop logo compression failed, uploading original:', compressionError)
        // Continue with original file if compression fails
        fileToUpload = file
      }
    }

    // Upload to R2
    const { url, error } = await uploadShopLogo(shopId, fileToUpload)

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
    console.error('Shop logo upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
