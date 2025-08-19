/**
 * Image compression utilities for reducing file sizes before upload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeKB?: number;
}

/**
 * Compress an image file to reduce its size
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to meet size requirement
        let currentQuality = quality;
        let attempts = 0;
        const maxAttempts = 5;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const sizeKB = blob.size / 1024;
              
              // If size is acceptable or we've tried enough times, use this version
              if (sizeKB <= maxSizeKB || attempts >= maxAttempts || currentQuality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: blob.type,
                  lastModified: Date.now(),
                });
                
                console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${sizeKB.toFixed(1)}KB (${((1 - sizeKB / (file.size / 1024)) * 100).toFixed(1)}% reduction)`);
                resolve(compressedFile);
              } else {
                // Try with lower quality
                attempts++;
                currentQuality = Math.max(0.1, currentQuality - 0.1);
                tryCompress();
              }
            },
            'image/jpeg', // Always convert to JPEG for better compression
            currentQuality
          );
        };

        tryCompress();
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if a file is an image that can be compressed
 */
export function canCompressImage(file: File): boolean {
  return file.type.startsWith('image/') && 
         ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

/**
 * Get appropriate compression options based on image type and intended use
 */
export function getCompressionOptions(imageType: 'avatar' | 'chat' | 'logo'): CompressionOptions {
  switch (imageType) {
    case 'avatar':
      return {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        maxSizeKB: 200
      };
    case 'chat':
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 800
      };
    case 'logo':
      return {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.9,
        maxSizeKB: 100
      };
    default:
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 500
      };
  }
}
