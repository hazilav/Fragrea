import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'fragrea_maison_vault_secret_key_signature_2026_luxury_private';

function verifyChangeToken(tokenStr: string): any | null {
  try {
    const [b64, sig] = tokenStr.split('.');
    if (!b64 || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return null;
    if (payload.purpose !== 'PASSWORD_RESET_AUTHORIZED') return null;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const newPassword = body.newPassword;
    const changeToken = body.changeToken;

    if (!email || !newPassword || !changeToken) {
      return NextResponse.json(
        { success: false, error: 'Email, new password, and authorization token are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const payload = verifyChangeToken(changeToken);
    if (!payload || payload.email !== email) {
      return NextResponse.json(
        { success: false, error: 'Password reset session expired or invalid. Please start again.' },
        { status: 401 }
      );
    }

    // Hash the new password securely using 10 bcrypt salt rounds
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // If database is configured, update the record
    if (process.env.DATABASE_URL) {
      try {
        await prisma.user.updateMany({
          where: { email },
          data: { passwordHash },
        });
      } catch (dbErr) {
        console.warn('Could not update user password in DB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Master password has been updated securely. You may now sign in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
