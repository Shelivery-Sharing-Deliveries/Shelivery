import { uploadShopLogo } from '@/lib/r2-storage'
import { supabase } from '@/lib/supabase'

/**
 * Upload a shop logo and update the shop record
 */
export async function updateShopLogo(
  shopId: string,
  file: File
): Promise<{ success: boolean; error: string | null; url?: string }> {
  try {
    // Upload to R2
    const { url, error } = await uploadShopLogo(shopId, file)
    
    if (error) {
      return { success: false, error }
    }
    
    if (!url) {
      return { success: false, error: 'Upload failed - no URL returned' }
    }

    // Update shop record with new logo URL
    const { error: updateError } = await supabase
      .from('shop')
      .update({ logo_url: url })
      .eq('id', shopId)

    if (updateError) {
      console.error('Failed to update shop logo URL:', updateError)
      return { success: false, error: 'Failed to update shop record' }
    }

    return { success: true, error: null, url }
  } catch (error) {
    console.error('Shop logo update error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Get optimized shop logo URL with fallback
 */
export function getOptimizedShopLogoUrl(logoUrl?: string | null, shopName?: string): string {
  if (!logoUrl) {
    // Return a default logo or generate one based on shop name
    return '/shop-logos/default-logo.png'
  }

  // For R2 URLs, return as-is (no built-in transformations)
  if (logoUrl.includes('r2.cloudflarestorage.com')) {
    return logoUrl
  }

  // For Supabase URLs, add optimization parameters
  if (logoUrl.includes('supabase')) {
    return `${logoUrl}?width=200&quality=80`
  }

  return logoUrl
}
