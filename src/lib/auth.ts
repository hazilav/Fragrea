import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';

export const ADMIN_COOKIE_NAME = 'fragrea_admin_session';

const AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'fragrea_maison_vault_secret_key_signature_2026_luxury_private';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  adminId: string;
  exp: number;
  nonce: string;
}

/**
 * Sign payload using HMAC-SHA256
 */
function sign(data: string): string {
  return crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
}

/**
 * Creates a cryptographically signed, tamper-proof session token.
 */
export function generateSignedToken(adminId: string): string {
  const payload: SessionPayload = {
    adminId,
    exp: Date.now() + SEVEN_DAYS_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadStr);

  return `${payloadStr}.${signature}`;
}

/**
 * Validates cryptographic signature and expiration of a session token.
 * Uses timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyAdminToken(token: string): SessionPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = sign(payloadStr);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    );

    // Check Expiration
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates and sets the secure HTTP-Only admin session cookie.
 */
export async function createAdminSession(adminId: string) {
  const token = generateSignedToken(adminId);
  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return token;
}

/**
 * Clears the admin session cookie.
 */
export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Server-side authorization verification.
 * 1. Checks cookie existence.
 * 2. Cryptographically verifies HMAC signature and timestamp.
 * 3. Validates that the Admin and User exist and remain ACTIVE in the database.
 */
export async function verifyAdminSession(explicitToken?: string) {
  try {
    const token = explicitToken || cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyAdminToken(token);
    if (!payload) return null;

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!admin || !admin.user || !admin.user.isActive) {
      return null;
    }

    return {
      id: admin.id,
      userId: admin.userId,
      email: admin.user.email,
      name: `${admin.user.firstName || ''} ${admin.user.lastName || ''}`.trim() || 'Admin',
      role: admin.role,
      permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
    };
  } catch {
    return null;
  }
}
