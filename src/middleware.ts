import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow these paths without authentication
  const isPublicPath = 
    pathname.startsWith('/gate') || 
    pathname.startsWith('/api/gate') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico';

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Check for the vetting cookie
  const vettingCookie = request.cookies.get('cutter_vetted')?.value;
  const correctPassword = process.env.SITE_PASSWORD || 'cuttergang';
  const expectedToken = Buffer.from(`${correctPassword}-vetted`).toString('base64');
  
  const isVetted = vettingCookie === expectedToken;

  // 3. If not vetted, redirect to the gate
  if (!isVetted) {
    const url = new URL('/gate', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Ensure middleware runs on appropriate routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
