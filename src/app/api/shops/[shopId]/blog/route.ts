import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  const shopId = params.shopId

  try {
    // Fetch shop
    const { data: shop, error: shopError } = await supabase
      .from('shop')
      .select('id, name, logo_url, description')
      .eq('id', shopId)
      .eq('is_active', true)
      .single()

    if (shopError || !shop) {
      const errorResponse = NextResponse.json({ error: 'Shop not found' }, { status: 404 })
      errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return errorResponse
    }

    // Fetch latest published blog
    const { data: blog, error: blogError } = await supabase
      .from('shop_blogs')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    console.log('API HIT:', Date.now());

    if (blogError || !blog) {
      const noBlogResponse = NextResponse.json({ shop, blog: null })
      noBlogResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return noBlogResponse
    }

    const response = NextResponse.json({ shop, blog })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (error) {
    const internalErrorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    internalErrorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return internalErrorResponse
  }
}