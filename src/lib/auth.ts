import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import type { SessionUser } from '@/types/auth';

export type { SessionUser };

const SESSION_COOKIE_NAME = 'dsr_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Derive a secret key for session signatures dynamically
function getSecretKey(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.DATABASE_URL ||
    'dsr-rs-pertamina-prabumulih-secret-key-2026'
  );
}

/**
 * Hash password securely with scrypt + random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against stored hash (also supports legacy plain-text fallback)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Modern scrypt format
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  // Legacy fallback for plain text seed accounts (e.g. 'password123')
  return storedHash === password;
}

/**
 * Determine whether connection is HTTPS.
 * Over plain HTTP (such as Coolify direct IP:port or domains without SSL),
 * browsers strictly drop cookies having `secure: true`.
 * In contrast, cookies without `secure: true` are accepted on both HTTP and HTTPS.
 */
async function isSecureConnection(): Promise<boolean> {
  // Explicit override via environment variable if desired
  if (process.env.COOKIE_SECURE === 'false') return false;
  if (process.env.COOKIE_SECURE === 'true') return true;

  try {
    const headerList = await headers();
    const proto = headerList.get('x-forwarded-proto');
    if (proto) {
      return proto.toLowerCase().split(',')[0].trim() === 'https';
    }
    const origin = headerList.get('origin') || headerList.get('referer');
    if (origin) {
      return origin.startsWith('https://');
    }
    const host = headerList.get('host') || '';
    if (host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
      return false;
    }
  } catch {
    // headers() might not be available in some contexts
  }

  return false;
}

/**
 * Create a signed token payload
 */
function signToken(payload: object): string {
  const secretKey = getSecretKey();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify and decode a signed token
 */
function verifyToken<T>(token: string): T | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const secretKey = getSecretKey();
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) {
      return null; // Expired
    }
    return decoded as T;
  } catch {
    return null;
  }
}

/**
 * Save user session in HTTP-only cookie
 */
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const token = signToken({
    ...user,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const secure = await isSecureConnection();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Retrieve current logged-in user from session cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifyToken<SessionUser & { exp: number }>(token);
    if (!session) return null;

    return {
      id: session.id,
      nama: session.nama,
      email: session.email,
      role: session.role,
    };
  } catch {
    return null;
  }
}

/**
 * Destroy current session cookie (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const secure = await isSecureConnection();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}
