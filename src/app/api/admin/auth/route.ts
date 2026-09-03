import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminSession, clearAdminSession, verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, admin });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.emailOrUsername || body.email || '').toLowerCase().trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide credentials' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: identifier,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      include: {
        admin: true,
      },
    });

    if (!user || !user.passwordHash || !user.admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials or unauthorized' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.admin.update({
      where: { id: user.admin.id },
      data: { lastLoginAt: new Date() },
    });

    await createAdminSession(user.admin.id);

    return NextResponse.json({
      success: true,
      admin: {
        id: user.admin.id,
        userId: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.admin.role,
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
