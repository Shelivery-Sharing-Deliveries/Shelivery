// lib/supabase.ts
// IMPORTANT: Use createClientComponentClient for client-side Supabase interactions
// to ensure proper cookie handling that interoperates with auth-helpers-nextjs middleware.
import { createClientComponentClient, type Session } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types'; // Assuming this path is correct

// For Next.js App Router, createClientComponentClient should be used in client components
// and directly in files that export the client for use in client components.
// It automatically picks up NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// from your environment variables.
export const supabase = createClientComponentClient<Database>();

// No need to manually pass supabaseUrl and supabaseAnonKey here if they are in env vars
// No need for explicit auth or realtime options here, as createClientComponentClient
// handles basic setup and you can configure specific auth events/callbacks elsewhere.

// Export your types as they are still useful
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// You might also want a server-side client for RSCs or Route Handlers if needed:
// import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';

// export const createServerSupabaseClient = () =>
//   createServerComponentClient<Database>({
//     cookies,
//   });

// export const createRouteHandlerSupabaseClient = () =>
//   createRouteHandlerClient<Database>({
//     cookies,
//   });
