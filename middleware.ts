import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Gate /admin/** and /api/admin/** behind a valid signed session cookie.
 * Anything else falls through untouched.
 *
 * Middleware runs on the Edge runtime, so we cannot import `lib/auth.ts`
 * directly (it pulls `next/headers` and is marked server-only). The cookie
 * + JWT verification is inlined here.
 */

const ADMIN_COOKIE = 'marios_admin';
const LOGIN_PATH = '/admin/login';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and login API to load without auth.
  if (pathname === LOGIN_PATH || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verify(token);

  if (ok) return NextResponse.next();

  // Block /api/admin/* with 401 (no redirect — they're called by JS).
  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect /admin/* to login, preserving the original destination.
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

async function verify(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 16) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}
