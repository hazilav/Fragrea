import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'fragrea_admin_session';

// Simple in-memory IP rate limit cache for middleware
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxRequests: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowSeconds * 1000 });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Rate Limiting on Sensitive API Endpoints
  // Admin Login: max 10 requests per minute
  if (pathname === '/api/admin/auth' && req.method === 'POST') {
    if (isRateLimited(`auth_${ip}`, 10, 60)) {
      return NextResponse.json(
        { success: false, error: 'Too many authentication attempts. Please retry shortly.' },
        { status: 429 }
      );
    }
  }

  // Order Placement: max 20 requests per minute
  if (pathname === '/api/orders' && req.method === 'POST') {
    if (isRateLimited(`order_${ip}`, 20, 60)) {
      return NextResponse.json(
        { success: false, error: 'Too many commission requests. Please wait a moment.' },
        { status: 429 }
      );
    }
  }

  // Payment Verification: max 20 requests per minute
  if (pathname === '/api/payments/verify' && req.method === 'POST') {
    if (isRateLimited(`pay_${ip}`, 20, 60)) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please retry shortly.' },
        { status: 429 }
      );
    }
  }

  // 2. Admin Route Protection
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApiRoute = pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth';

  const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (isAdminRoute) {
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdminApiRoute) {
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }
  }

  // 3. Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/orders',
    '/api/payments/verify',
  ],
};
