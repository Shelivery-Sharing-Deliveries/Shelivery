# Supabase Asset Management Documentation

## Overview

This document outlines how to set up and manage assets (avatars, shop logos, images) in Supabase Storage for the Shelivery MVP. We'll use Supabase Storage buckets to store user-generated content and static assets.

## Storage Bucket Setup

### 1. Create Storage Buckets

In your Supabase Dashboard, navigate to Storage and create the following buckets:

#### User Avatars Bucket
- **Bucket Name**: `avatars`
- **Public**: `true` (for easy access without authentication)
- **File Size Limit**: `5MB`
- **Allowed MIME Types**: `image/jpeg, image/png, image/webp`

#### Shop Logos Bucket  
- **Bucket Name**: `shop-logos`
- **Public**: `true`
- **File Size Limit**: `2MB`
- **Allowed MIME Types**: `image/jpeg, image/png, image/svg+xml`

### 2. Storage Policies

#### Avatars Bucket Policies
```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view avatars
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Shop Logos Bucket Policies
```sql
-- Allow public read access to shop logos
CREATE POLICY "Public shop logo access" ON storage.objects
FOR SELECT USING (bucket_id = 'shop-logos');

-- Allow admin users to manage shop logos (optional - for future admin panel)
CREATE POLICY "Admin shop logo management" ON storage.objects
FOR ALL USING (
  bucket_id = 'shop-logos' 
  AND auth.jwt() ->> 'role' = 'admin'
);
```

## Asset Upload Implementation

### 1. Avatar Upload Function

```typescript
// src/utils/avatar-upload.ts
import { supabase } from '@/lib/supabase'

export async function uploadAvatar(
  userId: string, 
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Please select an image file' }
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { url: null, error: 'File size must be less than 5MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace existing avatar
      })

    if (error) {
      return { url: null, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    return { url: null, error: 'Upload failed' }
  }
}
```

### 2. Shop Logo Management

```typescript
// src/utils/shop-logo-upload.ts (for admin use)
import { supabase } from '@/lib/supabase'

export async function uploadShopLogo(
  shopId: number,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${shopId}/logo.${fileExt}`

    const { data, error } = await supabase.storage
      .from('shop-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { url: null, error: error.message }
    }

    const { data: urlData } = supabase.storage
      .from('shop-logos')
      .getPublicUrl(fileName)

    // Update shop table with logo URL
    await supabase
      .from('shop')
      .update({ logo_url: urlData.publicUrl })
      .eq('id', shopId)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    return { url: null, error: 'Upload failed' }
  }
}
```

## Initial Asset Population

### 1. Upload Provided Assets

Use the Supabase CLI or dashboard to upload the provided assets:

#### Shop Logos Upload Script
```bash
# Upload shop logos via Supabase CLI
supabase storage cp ./public/shop-logos/Migros\ Logo.png supabase://shop-logos/1/logo.png
supabase storage cp ./public/shop-logos/Coop\ Logo.png supabase://shop-logos/2/logo.png  
supabase storage cp ./public/shop-logos/Aldi\ Logo.png supabase://shop-logos/3/logo.png
supabase storage cp ./public/shop-logos/Lidl\ Logo.png supabase://shop-logos/4/logo.png
supabase storage cp ./public/shop-logos/Denner\ Logo.png supabase://shop-logos/5/logo.png
```

#### Update Shop Table with Logo URLs
```sql
-- Update shop records with logo URLs
UPDATE public.shop SET logo_url = 'https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/shop-logos/1/logo.png' WHERE name = 'Fresh Market';
UPDATE public.shop SET logo_url = 'https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/shop-logos/2/logo.png' WHERE name = 'QuickMart';
UPDATE public.shop SET logo_url = 'https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/shop-logos/3/logo.png' WHERE name = 'Campus Grocery';
UPDATE public.shop SET logo_url = 'https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/shop-logos/4/logo.png' WHERE name = 'Student Store';
UPDATE public.shop SET logo_url = 'https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/shop-logos/5/logo.png' WHERE name = 'Local Deli';
```

### 2. Add Logo URL Column to Shop Table

```sql
-- Add logo_url column to shop table
ALTER TABLE public.shop ADD COLUMN logo_url TEXT;

-- Create index for faster logo lookups
CREATE INDEX idx_shop_logo_url ON public.shop(logo_url);
```

## Frontend Avatar System

### 1. Avatar Component with Initials Fallback

```typescript
// src/components/ui/Avatar.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm', 
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl'
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const initialsColors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
  ]
  
  const colorIndex = name ? name.charCodeAt(0) % initialsColors.length : 0
  const backgroundColor = initialsColors[colorIndex]

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className={cn(
            'w-full h-full flex items-center justify-center text-white font-medium',
            backgroundColor
          )}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}
```

### 2. Avatar Upload Component

```typescript
// src/components/ui/AvatarUpload.tsx
import { useState, useRef } from 'react'
import { Avatar } from './Avatar'
import { uploadAvatar } from '@/utils/avatar-upload'
import { supabase } from '@/lib/supabase'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userName?: string
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ 
  userId, 
  currentAvatarUrl, 
  userName,
  onUploadComplete 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    const { url, error } = await uploadAvatar(userId, file)
    
    if (error) {
      alert(`Upload failed: ${error}`)
    } else if (url) {
      setAvatarUrl(url)
      onUploadComplete?.(url)
      
      // Update user profile with new avatar URL
      await supabase
        .from('user')
        .update({ 
          profile: { 
            ...currentProfile, 
            avatar_url: url 
          } 
        })
        .eq('id', userId)
    }
    
    setUploading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="relative group"
      >
        <Avatar 
          src={avatarUrl} 
          name={userName} 
          size="xl"
          className="border-4 border-primary-yellow"
        />
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all">
          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
            Change
          </span>
        </div>
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
```

## Asset URLs and Access

### 1. Public URLs Format

```typescript
// Asset URL helpers
export const getAvatarUrl = (userId: string, filename?: string) => {
  const file = filename || 'avatar.png'
  return `https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/avatars/${userId}/${file}`
}

export const getShopLogoUrl = (shopId: number, filename?: string) => {
  const file = filename || 'logo.png'
  return `https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/shop-logos/${shopId}/${file}`
}
```

### 2. Optimized Image Loading

```typescript
// src/components/ui/OptimizedImage.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  fallback?: string
  className?: string
  width?: number
  height?: number
}

export function OptimizedImage({ 
  src, 
  alt, 
  fallback, 
  className,
  width,
  height 
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Supabase image transformation
  const optimizedSrc = width && height 
    ? `${src}?width=${width}&height=${height}&resize=cover&quality=80`
    : src

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={isError && fallback ? fallback : optimizedSrc}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsError(true)
          setIsLoading(false)
        }}
        className={cn(
          'w-full h-full object-cover transition-opacity',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  )
}
```

## Migration Commands

To implement this asset system in your existing Supabase project:

### 1. Create Storage Buckets via SQL
```sql
-- Create buckets (if not using dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true);
```

### 2. Apply Storage Policies
Run the policy SQL statements provided above in your Supabase SQL editor.

### 3. Update Shop Table Schema
```sql
ALTER TABLE public.shop ADD COLUMN IF NOT EXISTS logo_url TEXT;
```

### 4. Populate Initial Shop Logos
Upload the provided shop logos and update the shop table with their URLs.

## Security Considerations

1. **File Size Limits**: Enforced at bucket level and in upload functions
2. **File Type Validation**: Only allow image files
3. **User Authorization**: Users can only upload/modify their own avatars
4. **Public Access**: Shop logos and avatars are publicly accessible for performance
5. **Rate Limiting**: Consider implementing upload rate limiting for production

## Performance Optimization

1. **Image Transformations**: Use Supabase's built-in image transformation
2. **CDN Caching**: Assets are automatically cached via Supabase CDN
3. **Lazy Loading**: Implement lazy loading for avatar grids
4. **Fallback System**: Always provide fallbacks for failed image loads

This asset management system provides a robust foundation for handling user avatars and shop logos with proper security, performance optimization, and fallback mechanisms.
