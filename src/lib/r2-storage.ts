import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

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

    // Generate proxy URL through our Next.js API route
    // This bypasses R2 public access requirements
    const publicUrl = `/api/images/${key}`

    console.log('Generated R2 proxy URL:', publicUrl)
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
 * Clean up old files with the same prefix (for cache busting)
 */
async function cleanupOldFiles(prefix: string, keepLatest = 1): Promise<void> {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
    })

    const response = await r2Client.send(listCommand)
    
    if (!response.Contents || response.Contents.length <= keepLatest) {
      return // Nothing to clean up
    }

    // Sort by LastModified date (newest first)
    const sortedFiles = response.Contents
      .filter(obj => obj.Key && obj.LastModified)
      .sort((a, b) => (b.LastModified!.getTime() - a.LastModified!.getTime()))

    // Delete all but the latest files
    const filesToDelete = sortedFiles.slice(keepLatest)
    
    for (const file of filesToDelete) {
      if (file.Key) {
        await deleteFromR2(file.Key)
        console.log(`Cleaned up old file: ${file.Key}`)
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error)
    // Don't throw error - cleanup failure shouldn't break upload
  }
}

/**
 * Generate a public URL for an R2 object
 */
export function getR2PublicUrl(key: string): string {
  if (R2_ENDPOINT && R2_ENDPOINT.includes('r2.cloudflarestorage.com')) {
    // Extract account ID from endpoint
    const endpointParts = R2_ENDPOINT.split('//')[1]?.split('.')
    if (endpointParts && endpointParts[0]) {
      const accountId = endpointParts[0]
      return `https://${R2_BUCKET}.${accountId}.r2.cloudflarestorage.com/${key}`
    }
  }
  // Fallback to direct endpoint
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

  // Generate key with timestamp for cache busting
  const fileExt = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const key = `avatars/${userId}/avatar-${timestamp}.${fileExt}`

  const result = await uploadToR2(key, file)
  
  // Clean up old avatar files after successful upload
  if (result.url) {
    await cleanupOldFiles(`avatars/${userId}/avatar-`, 1)
  }

  return result
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

  // Generate key with timestamp for cache busting
  const fileExt = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const key = `shop-logos/${shopId}/logo-${timestamp}.${fileExt}`

  const result = await uploadToR2(key, file)
  
  // Clean up old logo files after successful upload
  if (result.url) {
    await cleanupOldFiles(`shop-logos/${shopId}/logo-`, 1)
  }

  return result
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

    // Generate key with timestamp for cache busting
    const timestamp = Date.now()
    const key = `chat-media/${chatroomId}/${messageId}-${timestamp}.${fileExt}`

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
  return `/api/images/avatars/${userId}/${filename}`
}

export const getShopLogoUrl = (shopId: string, filename = 'logo.jpg') => {
  return `/api/images/shop-logos/${shopId}/${filename}`
}

export const getChatMediaUrl = (chatroomId: string, messageId: string, extension = 'jpg') => {
  return `/api/images/chat-media/${chatroomId}/${messageId}.${extension}`
}
