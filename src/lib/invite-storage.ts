/**
 * Utility functions for managing invite codes in localStorage
 * Provides persistent storage for invite codes across navigation
 */

const INVITE_CODE_KEY = 'shelivery_invite_code';
const INVITE_CODE_TIMESTAMP_KEY = 'shelivery_invite_code_timestamp';
const INVITE_CODE_EXPIRY_HOURS = 24; // Invite codes expire after 24 hours

/**
 * Store an invite code in localStorage with timestamp
 */
export function storeInviteCode(code: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    const timestamp = Date.now();
    localStorage.setItem(INVITE_CODE_KEY, code);
    localStorage.setItem(INVITE_CODE_TIMESTAMP_KEY, timestamp.toString());
    
    console.log(`Stored invite code: ${code}`);
    return true;
  } catch (error) {
    console.error('Failed to store invite code:', error);
    return false;
  }
}

/**
 * Retrieve stored invite code if it exists and hasn't expired
 */
export function getStoredInviteCode(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const code = localStorage.getItem(INVITE_CODE_KEY);
    const timestampStr = localStorage.getItem(INVITE_CODE_TIMESTAMP_KEY);
    
    if (!code || !timestampStr) return null;
    
    // Check if code has expired
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const expiryTime = timestamp + (INVITE_CODE_EXPIRY_HOURS * 60 * 60 * 1000);
    
    if (now > expiryTime) {
      console.log('Invite code expired, clearing storage');
      clearStoredInviteCode();
      return null;
    }
    
    console.log(`Retrieved stored invite code: ${code}`);
    return code;
  } catch (error) {
    console.error('Failed to retrieve invite code:', error);
    return null;
  }
}

/**
 * Clear stored invite code from localStorage
 */
export function clearStoredInviteCode(): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(INVITE_CODE_KEY);
    localStorage.removeItem(INVITE_CODE_TIMESTAMP_KEY);
    
    console.log('Cleared stored invite code');
  } catch (error) {
    console.error('Failed to clear invite code:', error);
  }
}

/**
 * Check if there's a valid stored invite code
 */
export function hasStoredInviteCode(): boolean {
  return getStoredInviteCode() !== null;
}

/**
 * Get invite code from URL or localStorage, with URL taking priority
 * Store URL invite code in localStorage if found
 */
export function getInviteCodeFromUrlOrStorage(searchParams: URLSearchParams): string | null {
  // First check URL parameters
  const urlInviteCode = searchParams.get('invite');
  
  if (urlInviteCode) {
    // Store URL invite code in localStorage
    storeInviteCode(urlInviteCode);
    return urlInviteCode;
  }
  
  // Fallback to stored invite code
  return getStoredInviteCode();
}
