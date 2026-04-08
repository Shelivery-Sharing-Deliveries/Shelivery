/**
 * uploadAvatar.ts
 *
 * Uploads a profile picture to Cloudflare R2 via presigned URLs —
 * the same flow used by uploadChatMedia.ts, extended with `avatar` support.
 *
 * Flow:
 *   1. Read the local file URI into bytes.
 *   2. Request a presigned PUT URL from the Next.js backend (/api/r2/presign-upload).
 *   3. PUT the bytes directly to R2 using that URL (no SDK / credentials on client).
 *   4. The returned `key` is exposed as `/api/images/<key>` — the same relative
 *      path format shared across the PWA and mobile app.
 *
 * Required env variable in apps/mobile/.env:
 *   EXPO_PUBLIC_R2_PRESIGN_ENDPOINT — full URL to the Next.js presign API
 *     e.g. https://app.shelivery.com/api/r2/presign-upload
 */

const PRESIGN_ENDPOINT = process.env.EXPO_PUBLIC_R2_PRESIGN_ENDPOINT ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadAvatarResult {
  url: string | null;
  error: string | null;
}

interface PresignUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

// ─── MIME / Extension helpers ─────────────────────────────────────────────────

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'jpg', // convert HEIC → jpg key (R2 stores jpeg bytes after most pickers)
  'image/heif': 'jpg',
};

function extFromUri(uri: string): string {
  const path = uri.split('?')[0].split('#')[0];
  return path.split('.').pop()?.toLowerCase() ?? '';
}

function resolveMimeType(uri: string, fetchContentType: string): string {
  // 1. Infer from URI extension (most reliable on native)
  const ext = extFromUri(uri);
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];

  // 2. Use fetch Content-Type if meaningful
  const baseMime = fetchContentType.split(';')[0].trim().toLowerCase();
  if (baseMime && baseMime !== 'application/octet-stream' && baseMime.startsWith('image/')) {
    return baseMime;
  }

  // 3. Safe default
  return 'image/jpeg';
}

function mimeToExt(mimeType: string): string {
  const baseMime = mimeType.split(';')[0].trim().toLowerCase();
  return MIME_TO_EXT[baseMime] ?? baseMime.split('/')[1] ?? 'jpg';
}

// ─── Network helpers ──────────────────────────────────────────────────────────

async function readLocalFile(uri: string): Promise<{ bytes: Uint8Array; fetchMime: string }> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Cannot read local file: ${uri}`);
  const buffer = await response.arrayBuffer();
  const fetchMime = response.headers.get('content-type') ?? 'application/octet-stream';
  return { bytes: new Uint8Array(buffer), fetchMime };
}

async function getPresignedUpload(
  userId: string,
  mimeType: string,
  ext: string
): Promise<PresignUploadResponse> {
  if (!PRESIGN_ENDPOINT) {
    throw new Error('Missing EXPO_PUBLIC_R2_PRESIGN_ENDPOINT in apps/mobile/.env');
  }

  const response = await fetch(PRESIGN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      mediaType: 'avatar',
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
 * Upload a profile picture directly to Cloudflare R2 via presigned URL.
 *
 * @param uri    Local file URI from react-native-image-picker / expo-image-picker
 * @param userId Supabase user ID (used as the storage path prefix)
 * @returns      Stored URL (/api/images/<key>) or an error message
 */
export async function uploadAvatar(
  uri: string,
  userId: string
): Promise<UploadAvatarResult> {
  try {
    // 1. Read local file into memory
    const { bytes, fetchMime } = await readLocalFile(uri);

    // 2. Resolve the correct MIME type
    const mimeType = resolveMimeType(uri, fetchMime);
    const ext = mimeToExt(mimeType);

    console.log(`uploadAvatar: uri=${uri}, fetchMime=${fetchMime}, resolved=${mimeType}, ext=${ext}`);

    // 3. Request presigned URL from backend
    const { uploadUrl, key } = await getPresignedUpload(userId, mimeType, ext);

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
    //    /api/images/<key>  — resolved to an absolute URL on native via EXPO_PUBLIC_API_URL
    const storedUrl = `/api/images/${key}`;

    return { url: storedUrl, error: null };
  } catch (e: any) {
    console.error('uploadAvatar: R2 upload failed', e);
    return { url: null, error: e?.message ?? 'Upload to R2 failed.' };
  }
}
