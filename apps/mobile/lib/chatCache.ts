/**
 * chatCache.ts
 *
 * Caching layer for chatroom messages and media (audio files).
 *
 * Strategy:
 * - Messages: stored in AsyncStorage with a 15-minute TTL per chatroom.
 *   On open, stale-while-revalidate: show cached immediately, fetch fresh in BG.
 * - Audio: downloaded to the device's cache directory via expo-file-system v2.
 *   Evicted together with the message cache when TTL expires or chatroom ends.
 * - Images: handled automatically by expo-image's disk cache (no code needed here).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

// ─── Config ───────────────────────────────────────────────────────────────────

const MESSAGE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHED_MESSAGES = 100;        // per chatroom

// ─── Audio directory (lazy init) ──────────────────────────────────────────────

function getAudioDir(): Directory {
  const dir = new Directory(Paths.cache, 'shelivery-audio');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function messageKey(chatroomId: string) {
  return `chat_messages_${chatroomId}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageCacheEntry<T = any> {
  messages: T[];
  cachedAt: number;
}

// ─── Message cache ────────────────────────────────────────────────────────────

/**
 * Read messages from cache.
 * Returns { messages, isStale } where isStale means TTL has passed.
 * Returns null if nothing is cached.
 */
export async function getCachedMessages<T = any>(
  chatroomId: string
): Promise<{ messages: T[]; isStale: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(messageKey(chatroomId));
    if (!raw) return null;

    const entry: MessageCacheEntry<T> = JSON.parse(raw);
    const isStale = Date.now() - entry.cachedAt > MESSAGE_TTL_MS;
    return { messages: entry.messages, isStale };
  } catch {
    return null;
  }
}

/**
 * Write messages to cache. Trims to last MAX_CACHED_MESSAGES to cap storage.
 */
export async function setCachedMessages<T = any>(
  chatroomId: string,
  messages: T[]
): Promise<void> {
  try {
    const trimmed = messages.slice(-MAX_CACHED_MESSAGES);
    const entry: MessageCacheEntry<T> = { messages: trimmed, cachedAt: Date.now() };
    await AsyncStorage.setItem(messageKey(chatroomId), JSON.stringify(entry));
  } catch {
    // Silently fail — cache is best-effort
  }
}

/**
 * Merge new messages into the existing cache (used for real-time appends).
 * Deduplicates by id field.
 */
export async function appendCachedMessages<T extends { id: string | number }>(
  chatroomId: string,
  newMessages: T[]
): Promise<void> {
  try {
    const existing = await getCachedMessages<T>(chatroomId);
    const existingMessages = existing?.messages ?? [];
    const existingIds = new Set(existingMessages.map((m) => m.id));
    const merged = [
      ...existingMessages,
      ...newMessages.filter((m) => !existingIds.has(m.id)),
    ];
    await setCachedMessages(chatroomId, merged);
  } catch {
    // Silently fail
  }
}

/**
 * Clear message cache for a specific chatroom.
 * Call this when chatroom state is resolved/canceled.
 */
export async function clearChatCache(chatroomId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(messageKey(chatroomId));
  } catch {
    // Silently fail
  }
}

// ─── Audio cache ──────────────────────────────────────────────────────────────

/**
 * Get a locally cached audio URI for a message.
 * Returns the local file URI if cached, or null if not yet downloaded.
 */
export function getCachedAudioUri(messageId: string | number): string | null {
  try {
    const audioDir = getAudioDir();
    const file = new File(audioDir, `${messageId}.audio`);
    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

/**
 * Download and cache an audio file from a remote URL.
 * Returns the local file URI on success, or the original URL as fallback.
 */
export async function downloadAndCacheAudio(
  messageId: string | number,
  remoteUrl: string
): Promise<string> {
  try {
    const audioDir = getAudioDir();
    const destFile = new File(audioDir, `${messageId}.audio`);

    // Already cached
    if (destFile.exists) return destFile.uri;

    // Download to cache dir (idempotent: overwrite if partially written)
    const downloaded = await File.downloadFileAsync(remoteUrl, audioDir, {
      idempotent: true,
    });

    // Rename to our keyed filename for lookup
    downloaded.move(destFile);
    return destFile.uri;
  } catch {
    return remoteUrl; // fallback to streaming
  }
}

/**
 * Delete cached audio files for a list of message IDs.
 * Call alongside clearChatCache when a chatroom ends.
 */
export function clearCachedAudioFiles(messageIds: Array<string | number>): void {
  try {
    const audioDir = getAudioDir();
    for (const id of messageIds) {
      try {
        const file = new File(audioDir, `${id}.audio`);
        if (file.exists) file.delete();
      } catch {
        // Silently fail per file
      }
    }
  } catch {
    // Silently fail
  }
}

/**
 * Delete ALL cached audio files (e.g. on sign-out or storage cleanup).
 */
export function clearAllCachedAudio(): void {
  try {
    const audioDir = new Directory(Paths.cache, 'shelivery-audio');
    if (audioDir.exists) audioDir.delete();
  } catch {
    // Silently fail
  }
}

// ─── Chatroom list cache ──────────────────────────────────────────────────────

const CHATROOM_LIST_KEY = 'chatroom_list_cache';
const CHATROOM_LIST_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface ChatroomListCacheEntry<T = any> {
  chatrooms: T[];
  cachedAt: number;
}

/**
 * Read the cached chatroom list.
 * Returns { chatrooms, isStale } or null if nothing cached.
 */
export async function getCachedChatroomList<T = any>(): Promise<{
  chatrooms: T[];
  isStale: boolean;
} | null> {
  try {
    const raw = await AsyncStorage.getItem(CHATROOM_LIST_KEY);
    if (!raw) return null;
    const entry: ChatroomListCacheEntry<T> = JSON.parse(raw);
    const isStale = Date.now() - entry.cachedAt > CHATROOM_LIST_TTL_MS;
    return { chatrooms: entry.chatrooms, isStale };
  } catch {
    return null;
  }
}

/**
 * Write the chatroom list to cache.
 */
export async function setCachedChatroomList<T = any>(chatrooms: T[]): Promise<void> {
  try {
    const entry: ChatroomListCacheEntry<T> = { chatrooms, cachedAt: Date.now() };
    await AsyncStorage.setItem(CHATROOM_LIST_KEY, JSON.stringify(entry));
  } catch {
    // Silently fail
  }
}

/**
 * Clear the chatroom list cache (e.g. on sign-out).
 */
export async function clearChatroomListCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHATROOM_LIST_KEY);
  } catch {
    // Silently fail
  }
}
