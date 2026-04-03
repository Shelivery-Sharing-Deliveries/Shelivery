/**
 * uploadChatMedia.ts
 *
 * Uploads chat audio/image files to Cloudflare R2 via presigned URLs.
 *
 * Flow:
 *   1. Request a presigned PUT URL from the Next.js backend.
 *   2. Upload file bytes directly to R2 using that URL (no SDK / credentials on client).
 *   3. The `key` returned by the backend is used to construct `/api/images/<key>` —
 *      the same relative path format the PWA stores — so both platforms share the same DB value.
 *
 * Required env variables in apps/mobile/.env:
 *   EXPO_PUBLIC_R2_PRESIGN_ENDPOINT — Full URL to your Next.js presign API
 *                                     e.g. https://app.shelivery.com/api/r2/presign-upload
 *   EXPO_PUBLIC_API_BASE_URL        — Next.js server base URL (no trailing slash)
 *                                     e.g. https://app.shelivery.com
 *                                     Used when rendering /api/... URLs on native.
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

// ─── MIME / Extension helpers ─────────────────────────────────────────────────

/** Map of file extension → MIME type. Used to fix iOS file:// fetch returning
 *  "application/octet-stream" which causes presign validation failures and
 *  AVPlayer -11828 errors on playback. */
const EXT_TO_MIME: Record<string, string> = {
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  mp3: 'audio/mpeg',
  mpeg: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  caf: 'audio/x-caf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

const MIME_TO_EXT: Record<string, string> = {
  'audio/mp4': 'm4a',
  'audio/m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/aac': 'aac',
  'audio/x-caf': 'caf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/** Extract the file extension from a URI (strip query strings etc.) */
function extFromUri(uri: string): string {
  const path = uri.split('?')[0].split('#')[0];
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return ext;
}

/** Resolve the best MIME type for a file.
 *
 *  Priority:
 *  1. Infer from the URI file extension (most reliable on native)
 *  2. Use the Content-Type from fetch (works on web)
 *  3. Fallback based on mediaType
 */
function resolveMimeType(
  uri: string,
  fetchContentType: string,
  mediaType: 'audio' | 'image'
): string {
  // 1. Try URI extension
  const ext = extFromUri(uri);
  if (ext && EXT_TO_MIME[ext]) {
    return EXT_TO_MIME[ext];
  }

  // 2. Use fetch content-type if it's meaningful
  const baseMime = fetchContentType.split(';')[0].trim().toLowerCase();
  if (baseMime && baseMime !== 'application/octet-stream') {
    return baseMime;
  }

  // 3. Safe defaults per media type
  return mediaType === 'audio' ? 'audio/mp4' : 'image/jpeg';
}

/** Derive a file extension from a MIME type */
function mimeToExt(mimeType: string, fallback: string): string {
  const baseMime = mimeType.split(';')[0].trim().toLowerCase();
  return MIME_TO_EXT[baseMime] || baseMime.split('/')[1] || fallback;
}

// ─── Network helpers ──────────────────────────────────────────────────────────

/** Read a local URI into a Uint8Array and detect its Content-Type from fetch. */
async function readLocalFile(uri: string): Promise<{ bytes: Uint8Array; fetchMime: string }> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Cannot read local file: ${uri}`);
  const buffer = await response.arrayBuffer();
  const fetchMime = response.headers.get('content-type') ?? 'application/octet-stream';
  return { bytes: new Uint8Array(buffer), fetchMime };
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
    // 1. Read local file into memory
    const { bytes, fetchMime } = await readLocalFile(uri);

    // 2. Resolve the correct MIME type (URI extension > fetch header > fallback)
    const mimeType = resolveMimeType(uri, fetchMime, mediaType);
    const fallbackExt = mediaType === 'audio' ? 'm4a' : 'jpg';
    const ext = mimeToExt(mimeType, fallbackExt);

    console.log(`uploadChatMedia: uri=${uri}, fetchMime=${fetchMime}, resolved=${mimeType}, ext=${ext}`);

    // 3. Request presigned URL from backend
    const { uploadUrl, key } = await getPresignedUpload(chatroomId, mediaType, mimeType, ext);

    // 4. Upload bytes directly to R2 via presigned URL
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

    // 5. Build the stored URL in the same relative format the PWA uses:
    //    /api/images/<key>
    //    Both platforms store the same value in the DB; native rendering resolves
    //    it using EXPO_PUBLIC_API_BASE_URL (see ChatMessages.tsx).
    const storedUrl = `/api/images/${key}`;

    return { url: storedUrl, error: null };
  } catch (e: any) {
    console.error('uploadChatMedia: R2 upload failed', e);
    return { url: null, error: e?.message ?? 'Upload to R2 failed.' };
  }
}
