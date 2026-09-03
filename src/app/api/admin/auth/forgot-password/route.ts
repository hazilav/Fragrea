import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendPasswordResetCodeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'fragrea_maison_vault_secret_key_signature_2026_luxury_private';

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

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Signed token preserving state even without database
    const resetToken = signPayload({
      email,
      code,
      exp: expiresAt.getTime(),
      purpose: 'PASSWORD_RESET_VERIFY',
    });

    // If database is configured, persist to PasswordResetToken table
    if (process.env.DATABASE_URL) {
      try {
        await prisma.passwordResetToken.create({
          data: {
            email,
            code,
            token: resetToken,
            expiresAt,
          },
        });
      } catch (dbErr) {
        console.warn('Could not persist reset token to DB, using signed HMAC token:', dbErr);
      }
    }

    // Dispatch email
    const emailResult = await sendPasswordResetCodeEmail({
      to: email,
      code,
      expiresInMinutes: 15,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}.`,
      resetToken,
      // For immediate ease of use if SMTP is not configured
      ...(emailResult.previewCode ? { codePreview: emailResult.previewCode } : {}),
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
