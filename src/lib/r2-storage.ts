import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

export interface UploadResult {
  url: string | null
  error: string | null
}

/**
 * Upload a file to R2 storage
 */
export async function uploadToR2(
  key: string,
  file: File | Buffer,
  contentType?: string
): Promise<UploadResult> {
  try {
    // Convert File to Buffer if needed
    let body: Buffer
    let type: string

    if (file instanceof File) {
      body = Buffer.from(await file.arrayBuffer())
      type = contentType || file.type
    } else {
      body = file
      type = contentType || 'application/octet-stream'
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: type,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    })

    await r2Client.send(command)

    // Generate public URL
    const publicUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${key}`

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('R2 upload error:', error)
    return { url: null, error: error instanceof Error ? error.message : 'Upload failed' }
  }
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFromR2(key: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })

    await r2Client.send(command)
    return { success: true, error: null }
  } catch (error) {
    console.error('R2 delete error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' }
  }
}

/**
 * Generate a public URL for an R2 object
 */
export function getR2PublicUrl(key: string): string {
  return `${R2_ENDPOINT}/${R2_BUCKET}/${key}`
}

/**
 * Upload user avatar to R2
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'Please select an image file' }
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return { url: null, error: 'File size must be less than 5MB' }
  }

  // Generate key
  const fileExt = file.name.split('.').pop() || 'jpg'
  const key = `avatars/${userId}/avatar.${fileExt}`

  return uploadToR2(key, file)
}

/**
 * Upload shop logo to R2
 */
export async function uploadShopLogo(shopId: string, file: File): Promise<UploadResult> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'Please select an image file' }
  }

  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    return { url: null, error: 'File size must be less than 2MB' }
  }

  // Generate key
  const fileExt = file.name.split('.').pop() || 'jpg'
  const key = `shop-logos/${shopId}/logo.${fileExt}`

  return uploadToR2(key, file)
}

/**
 * Upload chat media (images/audio) to R2
 */
export async function uploadChatMedia(
  chatroomId: string,
  messageId: string,
  file: File | Blob,
  mediaType: 'image' | 'audio'
): Promise<UploadResult> {
  try {
    // Validate file size
    const maxSize = mediaType === 'image' ? 10 * 1024 * 1024 : 5 * 1024 * 1024 // 10MB for images, 5MB for audio
    if (file.size > maxSize) {
      return { 
        url: null, 
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
      }
    }

    // Determine file extension
    let fileExt = 'bin'
    if (file instanceof File && file.name) {
      fileExt = file.name.split('.').pop() || 'bin'
    } else if (file.type) {
      // Determine extension from MIME type
      if (file.type.startsWith('image/')) {
        fileExt = file.type.split('/')[1] || 'jpg'
      } else if (file.type.startsWith('audio/')) {
        fileExt = file.type.includes('webm') ? 'webm' : 'mp3'
      }
    }

    // Generate key
    const key = `chat-media/${chatroomId}/${messageId}.${fileExt}`

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    return uploadToR2(key, buffer, file.type)
  } catch (error) {
    console.error('Chat media upload error:', error)
    return { url: null, error: 'Failed to upload media' }
  }
}

/**
 * Helper functions for generating avatar and shop logo URLs
 */
export const getAvatarUrl = (userId: string, filename = 'avatar.jpg') => {
  return getR2PublicUrl(`avatars/${userId}/${filename}`)
}

export const getShopLogoUrl = (shopId: string, filename = 'logo.jpg') => {
  return getR2PublicUrl(`shop-logos/${shopId}/${filename}`)
}

export const getChatMediaUrl = (chatroomId: string, messageId: string, extension = 'jpg') => {
  return getR2PublicUrl(`chat-media/${chatroomId}/${messageId}.${extension}`)
}
