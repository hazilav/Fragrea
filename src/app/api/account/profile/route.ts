import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCustomerSession } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await verifyCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        addresses: true,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await verifyCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, address } = await req.json();

    await prisma.$transaction(async (tx) => {
      // Update User & Customer records
      await tx.user.update({
        where: { id: session.userId },
        data: {
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
          phone: phone?.trim() || undefined,
        },
      });

      await tx.customer.update({
        where: { id: session.customerId },
        data: {
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
          phone: phone?.trim() || undefined,
        },
      });

      // Update or create default address if provided
      if (address) {
        const existingDefault = await tx.address.findFirst({
          where: { customerId: session.customerId, isDefault: true },
        });

        if (existingDefault) {
          await tx.address.update({
            where: { id: existingDefault.id },
            data: {
              firstName: firstName?.trim() || existingDefault.firstName,
              lastName: lastName?.trim() || existingDefault.lastName,
              addressLine1: address.addressLine1?.trim() || existingDefault.addressLine1,
              addressLine2: address.apartment?.trim() || address.addressLine2,
              city: address.city?.trim() || existingDefault.city,
              state: address.state?.trim() || existingDefault.state,
              postalCode: address.postalCode?.trim() || existingDefault.postalCode,
              country: address.country?.trim() || existingDefault.country,
              phone: phone?.trim() || existingDefault.phone,
            },
          });
        } else if (address.addressLine1 && address.city) {
          await tx.address.create({
            data: {
              customerId: session.customerId,
              userId: session.userId,
              firstName: firstName?.trim() || 'Client',
              lastName: lastName?.trim() || 'Fragrea',
              addressLine1: address.addressLine1.trim(),
              addressLine2: address.apartment?.trim() || undefined,
              city: address.city.trim(),
              state: address.state?.trim() || '',
              postalCode: address.postalCode?.trim() || '',
              country: address.country?.trim() || 'United States',
              isDefault: true,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account details updated successfully.',
    });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update account dossier.' },
      { status: 500 }
    );
  }
}
