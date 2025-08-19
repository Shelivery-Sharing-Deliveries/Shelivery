# Cloudflare R2 Storage Migration Guide

## Overview

This guide documents the migration from Supabase Storage to Cloudflare R2 for the Shelivery MVP. The migration maintains the same file structure and provides fallback mechanisms for a seamless transition.

## Migration Summary

### What Was Migrated

- **User Avatars**: From Supabase Storage to R2 (`avatars/{userId}/avatar.{ext}`)
- **Shop Logos**: From Supabase Storage to R2 (`shop-logos/{shopId}/logo.{ext}`)
- **Chat Media**: From blob URLs/base64 to R2 (`chat-media/{chatroomId}/{messageId}.{ext}`)

### What Was NOT Migrated

- Existing files remain in Supabase Storage (as requested)
- New uploads go directly to R2
- Fallback mechanisms handle missing assets gracefully

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Cloudflare R2 Storage Configuration
R2_ACCESS_KEY_ID=98c5c7b13481eb70a7cec8f46cc7a9a8
R2_SECRET_ACCESS_KEY=9eb8ea3e9ad6f323114b6d7e1cd55e01b2b5a310540ff610cab958f4033b90e1
R2_ENDPOINT=https://ced8e612d38d5f65bc961d40147e34bc.r2.cloudflarestorage.com
R2_BUCKET=shelivery
```

### File Structure

```
R2 Bucket: shelivery/
├── avatars/
│   └── {userId}/
│       └── avatar.{ext}
├── shop-logos/
│   └── {shopId}/
│       └── logo.{ext}
└── chat-media/
    └── {chatroomId}/
        └── {messageId}.{ext}
```

## Implementation Details

### Core R2 Client (`src/lib/r2-storage.ts`)

- S3-compatible client using `@aws-sdk/client-s3`
- Upload, delete, and URL generation functions
- File validation and error handling
- Automatic content type detection

### Avatar System

- **Component**: `src/components/ui/AvatarUpload.tsx`
- **API Route**: `src/app/api/upload/avatar/route.ts`
- **Database**: Updates `user.image` field with R2 URL
- **Fallback**: Initials-based avatars for missing images

### Chat Media System

- **Component**: `src/components/chatroom/MessageInput.tsx`
- **API Route**: `src/app/api/upload/chat-media/route.ts`
- **Features**: Image and voice message uploads
- **Fallback**: Base64/blob URLs if R2 upload fails

### Shop Logo System

- **Utilities**: `src/lib/shop-logo-utils.ts`
- **Database**: Updates `shop.logo_url` field with R2 URL
- **Fallback**: Default logo for missing shop logos

## Usage Examples

### Upload Avatar

```typescript
import { uploadAvatar } from "@/lib/r2-storage";

const { url, error } = await uploadAvatar(userId, file);
if (url) {
  // Update user profile with new avatar URL
  await supabase.from("user").update({ image: url }).eq("id", userId);
}
```

### Upload Chat Media

```typescript
import { uploadChatMedia } from "@/lib/r2-storage";

const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const { url, error } = await uploadChatMedia(
  chatroomId,
  messageId,
  file,
  "image"
);
```

### Generate URLs

```typescript
import {
  getAvatarUrl,
  getShopLogoUrl,
  getChatMediaUrl,
} from "@/lib/r2-storage";

const avatarUrl = getAvatarUrl(userId);
const logoUrl = getShopLogoUrl(shopId);
const mediaUrl = getChatMediaUrl(chatroomId, messageId, "jpg");
```

## API Routes

### Avatar Upload

- **Endpoint**: `POST /api/upload/avatar`
- **Parameters**: `file` (File), `userId` (string)
- **Response**: `{ url: string }` or `{ error: string }`

### Chat Media Upload

- **Endpoint**: `POST /api/upload/chat-media`
- **Parameters**: `file` (File/Blob), `chatroomId`, `messageId`, `mediaType`
- **Response**: `{ url: string, messageId: string }` or `{ error: string }`

## Error Handling & Fallbacks

### Upload Failures

- Avatar uploads fall back to initials-based display
- Chat media uploads fall back to base64/blob URLs
- Shop logos fall back to default logo

### Missing Files

- Avatar component shows initials if image fails to load
- Shop logos show default logo if URL is invalid
- Chat media gracefully handles broken URLs

## Performance Considerations

### Image Optimization

- **Supabase**: Automatic transformations (`?width=128&quality=70`)
- **R2**: No built-in transformations (served as-is)
- **Future**: Consider Cloudflare Images for optimization

### Caching

- R2 objects cached with `Cache-Control: public, max-age=31536000` (1 year)
- Browser caching reduces repeated requests
- CDN distribution via Cloudflare network

### File Size Limits

- **Avatars**: 5MB maximum
- **Shop Logos**: 2MB maximum
- **Chat Images**: 10MB maximum
- **Chat Audio**: 5MB maximum

## Security

### Access Control

- Public read access for all uploaded files
- Upload restricted to authenticated users
- File type validation on upload
- Size limits enforced

### File Validation

- MIME type checking
- File extension validation
- Size limit enforcement
- Malicious file detection (basic)

## Monitoring & Debugging

### Logging

- Upload errors logged to console
- Failed uploads tracked with error messages
- Performance metrics available via Cloudflare dashboard

### Testing

- Test avatar uploads in profile settings
- Test chat media in chatroom interface
- Verify URL generation and access
- Check fallback mechanisms

## Migration Checklist

- [x] Install AWS SDK (`@aws-sdk/client-s3`)
- [x] Create R2 storage utilities
- [x] Update avatar upload system
- [x] Update chat media upload system
- [x] Create API routes for uploads
- [x] Update Avatar component for R2 URLs
- [x] Add shop logo utilities
- [x] Update environment variables
- [x] Test upload flows
- [x] Verify URL generation

## Future Enhancements

### Planned Improvements

1. **Cloudflare Images Integration**: For automatic image optimization
2. **Custom Domain**: For branded URLs (`cdn.shelivery.com`)
3. **Image Transformations**: Resize, crop, format conversion
4. **CDN Optimization**: Geographic distribution and caching
5. **Backup Strategy**: Automated backups to secondary storage

### Performance Optimizations

1. **Lazy Loading**: Implement for image-heavy pages
2. **Progressive Loading**: Show low-quality placeholders
3. **WebP Support**: Modern image format for better compression
4. **Preloading**: Critical images loaded early

## Troubleshooting

### Common Issues

**Upload Fails with "Missing R2 configuration"**

- Check environment variables are set correctly
- Verify R2 credentials are valid
- Ensure bucket exists and is accessible

**Images Not Loading**

- Check R2 bucket permissions (should be public)
- Verify URL format is correct
- Check browser network tab for 404/403 errors

**Slow Upload Performance**

- Check file sizes (may be too large)
- Verify network connection
- Consider implementing upload progress indicators

### Debug Commands

```bash
# Test R2 connection
curl -X POST /api/upload/avatar -F "file=@test.jpg" -F "userId=test"

# Check environment variables
echo $R2_ACCESS_KEY_ID
echo $R2_ENDPOINT
```

## Support

For issues related to R2 storage migration:

1. Check this documentation first
2. Review console logs for error messages
3. Test with small files to isolate issues
4. Verify environment configuration
5. Check Cloudflare R2 dashboard for bucket status

---

**Migration completed**: All new uploads now use Cloudflare R2 storage with proper fallback mechanisms for existing Supabase assets.
