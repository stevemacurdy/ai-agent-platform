import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// WoulfAI Middleware — Route Protection + Rate Limiting
// ============================================================================

// --- Rate Limiting (per-edge-instance, resets on cold start) ----------------
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/auth/login':           { max: 10, windowMs: 60000 },   // 10/min
  '/api/auth':                 { max: 10, windowMs: 60000 },   // 10/min (legacy login)
  '/api/auth/register':        { max: 5,  windowMs: 60000 },   // 5/min
  '/api/auth/forgot-password': { max: 3,  windowMs: 60000 },   // 3/min
  '/api/auth/reset-password':  { max: 5,  windowMs: 60000 },   // 5/min
  '/api/agents':               { max: 30, windowMs: 60000 },   // 30/min (agent POST)
  '/api/chat':                 { max: 20, windowMs: 60000 },   // 20/min
  '/api/chat/enterprise':      { max: 20, windowMs: 60000 },   // 20/min
  '/api/stripe/webhook':       { max: 100, windowMs: 60000 },  // 100/min (Stripe sends bursts)
};

function getRateLimit(pathname: string): { max: number; windowMs: number } | null {
  // Exact match first
  if (RATE_LIMITS[pathname]) return RATE_LIMITS[pathname];
  // Prefix match for agent endpoints like /api/agents/cfo
  if (pathname.startsWith('/api/agents/')) return { max: 30, windowMs: 60000 };
  return null;
}

function checkRateLimit(key: string, limit: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs });
    return true; // allowed
  }

  if (entry.count >= limit.max) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

// Periodic cleanup to prevent memory leak (every 1000 requests)
let requestCount = 0;
function cleanupRateLimitMap() {
  requestCount++;
  if (requestCount % 1000 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(key);
  }
}

// --- Route Protection -------------------------------------------------------
const PUBLIC = ['/', '/login', '/pricing', '/contact', '/demo', '/solutions', '/case-studies', '/integrations', '/about', '/how-it-works', '/register', '/forgot-password', '/reset-password', '/careers', '/privacy', '/terms', '/security', '/beta', '/billing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  cleanupRateLimitMap();

  // --- Rate limiting for API routes ---
  if (pathname.startsWith('/api/')) {
    const limit = getRateLimit(pathname);
    if (limit) {
      // Use IP + pathname as key (x-forwarded-for on Vercel)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      const key = ip + ':' + pathname;

      if (!checkRateLimit(key, limit)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': String(limit.max),
            }
          }
        );
      }
    }

    // Let API routes through without further checks
    return NextResponse.next();
  }

  // --- Skip static assets ---
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/woulfai-landing') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // --- Public routes pass through ---
  if (PUBLIC.some(r => pathname === r) || pathname.startsWith('/demo/') || pathname.startsWith('/agents/') || pathname.startsWith('/s/') || pathname.startsWith('/invite/')) {
    return NextResponse.next();
  }

  // --- All other routes: add security headers ---
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
