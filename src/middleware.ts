import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Debugging: Log the incoming request URL details
  console.log('Middleware Debug: Incoming request URL:', req.url);
  console.log('Middleware Debug: Incoming request Pathname:', req.nextUrl.pathname);
  console.log('Middleware Debug: Incoming request SearchParams:', req.nextUrl.searchParams.toString());

  // Debugging: Explicitly log environment variables
  console.log('Middleware Debug: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'NOT Loaded');
  console.log('Middleware Debug: NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'NOT Loaded');

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Middleware Debug: Error fetching session:', sessionError);
  }

  console.log('Middleware Debug: Session status:', session ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
  if (session) {
    console.log('Middleware Debug: Session User ID:', session.user.id);
  }

  const { pathname, searchParams } = req.nextUrl;

  const protectedPaths = [
    '/shops/',
    '/dashboard',
    '/profile-set',
  ];

  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  console.log('Middleware Debug: Is protected route:', isProtectedRoute, 'for pathname:', pathname);

  const inviteCode = searchParams.get('invite');

  console.log('Middleware Debug: Invite code in URL:', inviteCode ? inviteCode : 'None');

  if (!session && isProtectedRoute) {
    console.log('Middleware Debug: Condition met: User NOT authenticated and accessing protected route. Initiating redirect.');

    const redirectUrl = new URL('/auth', req.url);

    if (inviteCode) {
      redirectUrl.searchParams.set('invite', inviteCode);
      console.log('Middleware Debug: Appending invite code to redirect URL:', inviteCode);
    }

    console.log('Middleware Debug: Redirecting to:', redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);
  }

  console.log('Middleware Debug: Condition NOT met: User authenticated OR route is not protected. Proceeding.');
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth|_next/data|api).*)',
  ],
};
