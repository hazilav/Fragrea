import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { validateCoupon } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      // List coupons - Admin Only
      const admin = await verifyAdminSession();
      if (!admin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ success: true, coupons });
    }

    // Public validation of coupon code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired promotional code.' },
        { status: 404 }
      );
    }

    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This promotional code has expired.' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'This promotional allocation has been depleted.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateCoupon(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const created = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase().trim(),
        discountType: body.discountType || 'PERCENTAGE',
        discountValue: parseFloat(body.discountValue),
        minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : null,
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    return NextResponse.json({ success: true, coupon: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
