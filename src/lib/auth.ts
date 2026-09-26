import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  nama: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'FIELD' | string;
}

const SESSION_COOKIE_NAME = 'dsr_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Derive a secret key for session signatures
const SECRET_KEY =
  process.env.AUTH_SECRET ||
  process.env.DATABASE_URL ||
  'dsr-rs-pertamina-prabumulih-secret-key-2026';

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
 * Create a signed token payload
 */
function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
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

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(data)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
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

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}
