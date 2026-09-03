import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  verifyCustomerSession,
  createCustomerSession,
  clearCustomerSession,
} from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await verifyCustomerSession();
    if (!customer) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, customer });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // LOGOUT ACTION
    if (action === 'logout') {
      await clearCustomerSession();
      return NextResponse.json({ success: true, message: 'Successfully logged out.' });
    }

    // LOGIN ACTION
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Please enter your email and password.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail, isActive: true },
        include: { customer: true },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address or password.' },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address or password.' },
          { status: 401 }
        );
      }

      // If customer record doesn't exist, create one
      if (!user.customer) {
        await prisma.customer.create({
          data: {
            userId: user.id,
            email: user.email,
            firstName: user.firstName || 'Client',
            lastName: user.lastName || 'Fragrea',
            phone: user.phone || undefined,
          },
        });
      }

      await createCustomerSession(user.id, user.email);

      return NextResponse.json({
        success: true,
        customer: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }

    // REGISTER ACTION
    if (action === 'register') {
      const { email, password, firstName, lastName, phone } = body;

      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please provide full name, email address, and password.',
          },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email address already exists. Please sign in.',
          },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create User and linked Customer
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim() || undefined,
            role: 'CUSTOMER',
          },
        });

        const customer = await tx.customer.create({
          data: {
            userId: user.id,
            email: normalizedEmail,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim() || undefined,
          },
        });

        // Automatically link any past guest orders placed under this email address
        await tx.order.updateMany({
          where: { customerEmail: normalizedEmail },
          data: {
            userId: user.id,
            customerId: customer.id,
          },
        });

        return user;
      });

      await createCustomerSession(newUser.id, newUser.email);

      return NextResponse.json({
        success: true,
        customer: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Customer Auth Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}
