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

    const isMasterDemoCreds =
      (identifier === 'admin@fragrea.com' || identifier === 'admin') &&
      password === 'FragreaLuxury2025!';

    // If DATABASE_URL is not configured yet in Vercel environment variables:
    if (!process.env.DATABASE_URL) {
      if (isMasterDemoCreds) {
        await createAdminSession('admin-master-default');
        return NextResponse.json({
          success: true,
          admin: {
            id: 'admin-master-default',
            userId: 'user-master-default',
            email: 'admin@fragrea.com',
            name: 'Jean-Luc Vaneau',
            role: 'SUPER_ADMIN',
          },
        });
      }
      return NextResponse.json(
        {
          success: false,
          error:
            'DATABASE_URL is not set in Vercel Environment Variables. Please configure DATABASE_URL in Vercel Project Settings or use the preset demo credentials.',
        },
        { status: 400 }
      );
    }

    try {
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
        // Fallback for master demo credentials if database is empty
        if (isMasterDemoCreds) {
          await createAdminSession('admin-master-default');
          return NextResponse.json({
            success: true,
            admin: {
              id: 'admin-master-default',
              userId: 'user-master-default',
              email: 'admin@fragrea.com',
              name: 'Jean-Luc Vaneau',
              role: 'SUPER_ADMIN',
            },
          });
        }

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

      // Update last login in persistent database
      try {
        await prisma.admin.update({
          where: { id: user.admin.id },
          data: { lastLoginAt: new Date() },
        });
      } catch (updateErr) {
        console.warn('Could not update lastLoginAt timestamp:', updateErr);
      }

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
    } catch (dbError: any) {
      console.error('Database query error in admin auth:', dbError);
      if (isMasterDemoCreds) {
        await createAdminSession('admin-master-default');
        return NextResponse.json({
          success: true,
          admin: {
            id: 'admin-master-default',
            userId: 'user-master-default',
            email: 'admin@fragrea.com',
            name: 'Jean-Luc Vaneau',
            role: 'SUPER_ADMIN',
          },
        });
      }
      return NextResponse.json(
        {
          success: false,
          error:
            'Database error. If you have not yet added DATABASE_URL to your Vercel Project Settings, please add it now.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
