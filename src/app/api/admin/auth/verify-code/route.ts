import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'fragrea_maison_vault_secret_key_signature_2026_luxury_private';

function verifyPayload(tokenStr: string): any | null {
  try {
    const [b64, sig] = tokenStr.split('.');
    if (!b64 || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function signPayload(data: object): string {
  const jsonStr = JSON.stringify(data);
  const b64 = Buffer.from(jsonStr).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const submittedCode = (body.code || '').trim();
    const resetToken = body.resetToken;

    if (!email || !submittedCode) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required' },
        { status: 400 }
      );
    }

    let codeMatches = false;

    // 1. Try checking via signed token
    if (resetToken) {
      const payload = verifyPayload(resetToken);
      if (payload && payload.email === email && payload.code === submittedCode) {
        codeMatches = true;
      }
    }

    // 2. Try checking via database if available
    if (!codeMatches && process.env.DATABASE_URL) {
      try {
        const record = await prisma.passwordResetToken.findFirst({
          where: {
            email,
            code: submittedCode,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (record) {
          codeMatches = true;
          // Delete used token
          await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {});
        }
      } catch (dbErr) {
        console.warn('DB check error in verify-code:', dbErr);
      }
    }

    if (!codeMatches) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired 6-digit verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    // Generate change token valid for 10 minutes
    const changeToken = signPayload({
      email,
      exp: Date.now() + 10 * 60 * 1000,
      purpose: 'PASSWORD_RESET_AUTHORIZED',
    });

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully. Please choose a new password.',
      changeToken,
    });
  } catch (error: any) {
    console.error('Verify code error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
