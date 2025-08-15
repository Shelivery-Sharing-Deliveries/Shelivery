// lib/supabaseAuthClient.ts
// This client is specifically for authentication operations that need
// to interact seamlessly with Next.js middleware and cookies.

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types'; // Ensure this path is correct for your Database types

// createClientComponentClient automatically picks up NEXT_PUBLIC_SUPABASE_URL
// and NEXT_PUBLIC_SUPABASE_ANON_KEY from your environment variables.
export const supabaseAuthClient = createClientComponentClient<Database>();

// No need to manually pass supabaseUrl and supabaseAnonKey here if they are in env vars.
// No need for explicit auth or realtime options here, as createClientComponentClient
// handles basic setup for auth-helpers.
