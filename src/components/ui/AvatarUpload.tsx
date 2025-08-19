"use client";

import { useState, useRef } from 'react'
import { Avatar } from './Avatar'
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
    
    try {
      // Upload to R2 via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        alert(`Upload failed: ${result.error || 'Unknown error'}`)
        return
      }

      if (!result.url) {
        alert('Upload failed: No URL returned')
        return
      }

      // Update database with new avatar URL (client-side with RLS)
      const { error: updateError } = await supabase
        .from('user')
        .update({ image: result.url })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update user profile in database:', updateError)
        alert('Upload succeeded but failed to update profile. Please refresh the page.')
        return
      }

      // Update UI
      setAvatarUrl(result.url)
      onUploadComplete?.(result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
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
          name={userName ?? ""} 
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
