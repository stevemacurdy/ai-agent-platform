import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// WoulfAI Role-Based Route Protection
// ============================================================================
// Client-side auth guards handle session checks. This middleware
// handles security headers and route structure enforcement.

const PUBLIC = ['/', '/login', '/pricing', '/contact', '/demo', '/solutions', '/case-studies', '/integrations'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC.some(r => pathname === r) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/woulfai-landing') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
