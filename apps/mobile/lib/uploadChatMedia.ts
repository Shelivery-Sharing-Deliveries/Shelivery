/**
 * uploadChatMedia.ts
 *
 * Uploads chat audio/image files DIRECTLY to Cloudflare R2 from the mobile app.
 * Uses @aws-sdk/client-s3 with EXPO_PUBLIC_ credentials (React Native compatible).
 *
 * Uses Uint8Array instead of Node.js Buffer so it works in React Native / Expo.
 *
 * Required env variables in apps/mobile/.env:
 *   EXPO_PUBLIC_R2_ENDPOINT         — e.g. https://<account_id>.r2.cloudflarestorage.com
 *   EXPO_PUBLIC_R2_ACCESS_KEY_ID    — R2 API token access key
 *   EXPO_PUBLIC_R2_SECRET_ACCESS_KEY — R2 API token secret key
 *   EXPO_PUBLIC_R2_BUCKET           — R2 bucket name
 *   EXPO_PUBLIC_R2_PUBLIC_URL       — Public base URL for the bucket
 *                                     e.g. https://<bucket>.<account_id>.r2.cloudflarestorage.com
 *                                     or your custom domain https://assets.yourdomain.com
 */

const PRESIGN_ENDPOINT = process.env.EXPO_PUBLIC_R2_PRESIGN_ENDPOINT ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadMediaResult {
  url: string | null;
  error: string | null;
}

interface PresignUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert local URI (file:// or blob:) → Uint8Array. No Node.js Buffer needed. */
async function uriToUint8Array(uri: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Cannot read local file: ${uri}`);
  const buffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') ?? 'application/octet-stream';
  return { bytes: new Uint8Array(buffer), mimeType };
}

/** Derive a sensible file extension from the MIME type. */
function mimeToExt(mimeType: string, fallback: string): string {
  const map: Record<string, string> = {
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[mimeType] || mimeType.split('/')[1] || fallback;
}

async function getPresignedUpload(
  chatroomId: string,
  mediaType: 'audio' | 'image',
  mimeType: string,
  ext: string
): Promise<PresignUploadResponse> {
  if (!PRESIGN_ENDPOINT) {
    throw new Error('Missing EXPO_PUBLIC_R2_PRESIGN_ENDPOINT in apps/mobile/.env');
  }

  const response = await fetch(PRESIGN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatroomId,
      mediaType,
      contentType: mimeType,
      extension: ext,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get presigned URL: ${response.status} ${errorText}`);
  }

  return response.json();
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Upload a recorded audio or picked image directly to Cloudflare R2.
 *
 * @param uri        Local file URI from expo-av / expo-image-picker
 * @param chatroomId Chatroom the message belongs to (used in storage path)
 * @param mediaType  'audio' | 'image'
 * @returns          Permanent R2 public URL or an error message
 */
export async function uploadChatMedia(
  uri: string,
  chatroomId: string,
  mediaType: 'audio' | 'image'
): Promise<UploadMediaResult> {
  try {
    // 1. Read local file into memory as Uint8Array
    const fallbackExt = mediaType === 'audio' ? 'm4a' : 'jpg';
    const { bytes, mimeType } = await uriToUint8Array(uri);
    const ext = mimeToExt(mimeType, fallbackExt);

    // 2. Request presigned URL from backend
    const { uploadUrl, publicUrl } = await getPresignedUpload(chatroomId, mediaType, mimeType, ext);

    // 3. Upload bytes directly to R2 via presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
      body: bytes,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
    }

    return { url: publicUrl, error: null };
  } catch (e: any) {
    console.error('uploadChatMedia: R2 upload failed', e);
    return { url: null, error: e?.message ?? 'Upload to R2 failed.' };
  }
}
