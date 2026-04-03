/**
 * uploadChatMedia.ts
 *
 * Uploads chat audio/image files to Cloudflare R2 via presigned URLs.
 *
 * Flow:
 *   1. Request a presigned PUT URL from the Next.js backend.
 *   2. Upload file bytes directly to R2 using that URL (no SDK / credentials on client).
 *   3. The backend returns a publicUrl in the same format as the PWA
 *      (`https://<app>/api/images/...`) so both platforms can render the same message.
 *
 * Required env variable in apps/mobile/.env:
 *   EXPO_PUBLIC_R2_PRESIGN_ENDPOINT — Full URL to your Next.js presign API
 *                                     e.g. https://app.shelivery.com/api/r2/presign-upload
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

/** Derive a sensible file extension from the MIME type.
 *  Strips codec parameters e.g. "audio/webm;codecs=opus" → "webm"
 */
function mimeToExt(mimeType: string, fallback: string): string {
  // Strip codec parameters before lookup: "audio/webm;codecs=opus" → "audio/webm"
  const baseMime = mimeType.split(';')[0].trim().toLowerCase();

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
  return map[baseMime] || baseMime.split('/')[1] || fallback;
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
    // Use the underlying ArrayBuffer — Uint8Array is not accepted as BodyInit in all TS configs
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
      body: bytes.buffer as ArrayBuffer,
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
