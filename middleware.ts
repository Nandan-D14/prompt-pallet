import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Define paths that require authentication
const PROTECTED_PATHS = [
  '/profile',
  '/saved-images',
  '/generate-prompt',
  '/admin-gallery-upload',
];

// Define paths that are only for non-authenticated users
const AUTH_PATHS = [
  '/sign-in',
  '/sign-up',
];

// Define paths that are accessible to everyone
const PUBLIC_PATHS = [
  '/',
  '/gallery',
  '/contact-support',
];

// Define API paths that don't need to check authentication in middleware
// (they will handle auth checks internally)
const API_PATHS = [
  '/api/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes and public assets
  if (
    API_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Static files like images, etc.
  ) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated by looking for the session cookie
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.has('session');
  
  // Handle protected routes
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    if (!hasSessionCookie) {
      // Redirect to sign-in page if not authenticated
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Handle auth routes (sign-in, sign-up)
  if (AUTH_PATHS.some(path => pathname.startsWith(path))) {
    if (hasSessionCookie) {
      // Redirect to profile page if already authenticated
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }
  
  // For all other routes, proceed normally
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};