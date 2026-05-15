import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Authentication for the single-owner admin section.
 *
 * Model:
 *  - One password (env `ADMIN_PASSWORD`). The owner enters it once at
 *    /admin/login; success sets an httpOnly cookie signed with a separate
 *    secret (env `ADMIN_JWT_SECRET`).
 *  - Cookie lifetime: 30 days. Re-login needed after expiry.
 *  - Middleware checks for a valid cookie on every /admin/** and
 *    /api/admin/** request.
 *
 * Why not NextAuth/Clerk/etc: there is exactly one user (the owner). Any
 * framework that models multi-user identity, OAuth providers, RBAC, etc.
 * adds dependencies and surface area for zero benefit.
 */

export const ADMIN_COOKIE = 'marios_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_JWT_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error(
      'ADMIN_JWT_SECRET is missing or shorter than 16 chars. Set it in .env.local and your Vercel project.',
    );
  }
  return new TextEncoder().encode(raw);
}

export function isPasswordCorrect(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      'ADMIN_PASSWORD is not set. Configure it in .env.local and your Vercel project.',
    );
  }
  if (typeof input !== 'string') return false;
  // Constant-time comparison — strings of unequal length: short-circuit
  // intentionally to avoid leaking length via timing. Length is not secret
  // anyway in this single-password model.
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  return await new SignJWT({ sub: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}
