import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';

export const CUSTOMER_COOKIE_NAME = 'fragrea_customer_session';

const AUTH_SECRET =
  process.env.CUSTOMER_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  'fragrea_maison_vault_secret_key_customer_account_2026_luxury_private';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface CustomerSessionPayload {
  userId: string;
  email: string;
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
 * Creates a cryptographically signed, tamper-proof session token for customers.
 */
export function generateCustomerToken(userId: string, email: string): string {
  const payload: CustomerSessionPayload = {
    userId,
    email: email.toLowerCase().trim(),
    exp: Date.now() + THIRTY_DAYS_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadStr);

  return `${payloadStr}.${signature}`;
}

/**
 * Validates cryptographic signature and expiration of customer session token.
 * Uses timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyCustomerToken(token: string): CustomerSessionPayload | null {
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

    const payload: CustomerSessionPayload = JSON.parse(
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
 * Sets secure HTTP-Only customer session cookie.
 */
export async function createCustomerSession(userId: string, email: string) {
  const token = generateCustomerToken(userId, email);
  const cookieStore = cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return token;
}

/**
 * Clears customer session cookie.
 */
export async function clearCustomerSession() {
  const cookieStore = cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

/**
 * Verifies current customer session and returns authenticated customer profile.
 */
export async function verifyCustomerSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyCustomerToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
      include: {
        customer: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user || !user.customer) return null;

    return {
      userId: user.id,
      customerId: user.customer.id,
      email: user.email,
      firstName: user.firstName || user.customer.firstName,
      lastName: user.lastName || user.customer.lastName,
      phone: user.phone || user.customer.phone,
      totalOrders: user.customer.totalOrders,
      totalSpent: user.customer.totalSpent,
      defaultAddress: user.customer.addresses[0] || null,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}
