import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { validateOrder, sanitizeString } from '@/lib/validations';
import { getPaymentService } from '@/lib/payments/factory';
import { sendCustomerNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const search = searchParams.get('search')?.trim();
    const orderStatus = searchParams.get('orderStatus')?.trim();
    const paymentStatus = searchParams.get('paymentStatus')?.trim();
    const startDate = searchParams.get('startDate')?.trim();
    const endDate = searchParams.get('endDate')?.trim();
    const sortBy = searchParams.get('sortBy')?.trim() || 'createdAt';
    const sortOrder = searchParams.get('sortOrder')?.trim() === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));

    // Security check: If not admin and no email provided, reject unscoped request
    if (!admin && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Authenticated session or patron email required to access private order records.',
        },
        { status: 401 }
      );
    }

    const whereClause: any = {};
    if (!admin && email) {
      whereClause.customerEmail = email;
    } else if (email) {
      whereClause.customerEmail = email;
    }

    // 1. Search Query Filter (Order ID, Customer name, Email, Phone, Product names)
    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { items: { some: { productName: { contains: search } } } },
      ];
    }

    // 2. Order Status Filter (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded)
    if (orderStatus && orderStatus.toUpperCase() !== 'ALL') {
      whereClause.status = orderStatus.toUpperCase();
    }

    // 3. Payment Status Filter (Pending, Paid/Captured, Failed, Refunded)
    if (paymentStatus && paymentStatus.toUpperCase() !== 'ALL') {
      const pStatus = paymentStatus.toUpperCase();
      if (pStatus === 'PAID') {
        whereClause.payments = {
          some: { status: { in: ['PAID', 'CAPTURED'] } },
        };
      } else {
        whereClause.payments = {
          some: { status: pStatus },
        };
      }
    }

    // 4. Date Range Filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    // 5. Total Count for Pagination
    const totalCount = await prisma.order.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const skip = (page - 1) * limit;

    // 6. Dynamic Sorting
    const orderBy: any = {};
    if (sortBy === 'total') {
      orderBy.total = sortOrder;
    } else if (sortBy === 'orderNumber') {
      orderBy.orderNumber = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        payments: true,
        shipment: true,
        shippingAddress: true,
        customer: true,
        coupon: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        adminNotes: { orderBy: { createdAt: 'desc' } },
        notifications: { orderBy: { sentAt: 'desc' } },
      },
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
      pagination: {
        total: totalCount,
        page,
        totalPages,
        limit,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Server-Side Field Validation
    const validation = validateOrder(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      apartment,
      city,
      state,
      postalCode,
      country,
      items,
      paymentMethod,
      giftWrap,
      samples,
      notes,
      couponCode,
    } = body;

    // Execute atomic transaction for zero-trust verification and creation
    const result = await prisma.$transaction(async (tx) => {
      // 2. Verify Every Product Exists, Is Active, Has Stock, and Determine True Price
      const verifiedLineItems: Array<{
        product: any;
        verifiedUnitPrice: number;
        quantity: number;
        volume: string;
        lineTotal: number;
      }> = [];

      let subtotal = 0;

      for (const item of items) {
        const qty = parseInt(item.quantity);
        if (isNaN(qty) || qty < 1) {
          throw new Error(`Quantity for flacon must be at least 1.`);
        }

        // Fetch genuine product directly from database
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true, images: { orderBy: { displayOrder: 'asc' } } },
        });

        if (!product || product.status !== 'ACTIVE') {
          throw new Error(
            `Product "${item.productName || item.productId}" is not available in our active catalog.`
          );
        }

        // Verify Stock
        const availableStock = product.inventory ? product.inventory.quantity : product.stockQuantity;
        if (qty > availableStock) {
          throw new Error(
            `Insufficient vault stock for "${product.name}". Available: ${availableStock}, requested: ${qty}.`
          );
        }

        // Calculate verified unit price (never trusting client values)
        const is50ml = item.volume?.includes('50');
        const regularPrice = is50ml ? Math.round(product.price * 0.65) : product.price;
        const salePrice = product.salePrice
          ? is50ml
            ? Math.round(product.salePrice * 0.65)
            : product.salePrice
          : null;

        const verifiedUnitPrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
        const lineTotal = verifiedUnitPrice * qty;

        subtotal += lineTotal;

        verifiedLineItems.push({
          product,
          verifiedUnitPrice,
          quantity: qty,
          volume: is50ml ? '50 ml / 1.7 FL. OZ.' : product.size || '100 ml / 3.4 FL. OZ.',
          lineTotal,
        });
      }

      // 3. Validate Coupon & Prevent Invalid/Excessive Discounts
      let discountAmount = 0;
      let appliedCouponId: string | null = null;

      if (couponCode && couponCode.trim()) {
        const cleanCode = couponCode.trim().toUpperCase();
        const coupon = await tx.coupon.findUnique({ where: { code: cleanCode } });

        if (!coupon || !coupon.isActive) {
          throw new Error(`Privilege code "${cleanCode}" is invalid or expired.`);
        }

        const now = new Date();
        if (coupon.startDate && now < coupon.startDate) {
          throw new Error(`Privilege code "${cleanCode}" is not yet active.`);
        }

        if (coupon.endDate && now > coupon.endDate) {
          throw new Error(`Privilege code "${cleanCode}" has expired.`);
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error(`Privilege code "${cleanCode}" has reached its maximum allocation limit.`);
        }

        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          throw new Error(
            `Privilege code "${cleanCode}" requires a minimum order value of $${coupon.minOrderAmount}.`
          );
        }

        appliedCouponId = coupon.id;

        let computedDiscount =
          coupon.discountType === 'PERCENTAGE'
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;

        if (coupon.maxDiscount && computedDiscount > coupon.maxDiscount) {
          computedDiscount = coupon.maxDiscount;
        }

        // Clamp discount to prevent negative totals
        discountAmount = Math.min(subtotal, Math.max(0, computedDiscount));

        // Increment coupon usage counter
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 4. Calculate Verified Financials
      // Complimentary White-Glove Courier for orders >= $250, otherwise $25 flat insured fee
      const shippingFee = subtotal >= 250 || subtotal === 0 ? 0 : 25;
      const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
      const total = Math.max(0, Math.round((subtotal - discountAmount + shippingFee + taxAmount) * 100) / 100);

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `FRG-${new Date().getFullYear()}-${randomSuffix}`;

      // 5. Sanitize Strings & Upsert Customer
      const cleanCustomerName = sanitizeString(customerName);
      const cleanEmail = customerEmail.toLowerCase().trim();
      const cleanPhone = sanitizeString(customerPhone);
      const cleanAddress = sanitizeString(shippingAddress);
      const cleanApartment = apartment ? sanitizeString(apartment) : null;
      const cleanCity = sanitizeString(city);
      const cleanState = state ? sanitizeString(state) : null;
      const cleanPostal = sanitizeString(postalCode);
      const cleanCountry = country ? sanitizeString(country) : 'United States';
      const cleanNotes = notes ? sanitizeString(notes) : null;
      const cleanSamples = samples ? sanitizeString(samples) : null;

      const nameParts = cleanCustomerName.split(' ');
      const firstName = nameParts[0] || 'Patron';
      const lastName = nameParts.slice(1).join(' ') || 'FRAGREA';

      let customer = await tx.customer.findUnique({
        where: { email: cleanEmail },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            email: cleanEmail,
            firstName,
            lastName,
            phone: cleanPhone || null,
            totalOrders: 1,
            totalSpent: total,
          },
        });
      } else {
        customer = await tx.customer.update({
          where: { email: cleanEmail },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: total },
            phone: cleanPhone || customer.phone,
          },
        });
      }

      // 6. Create Address with sanitized fields
      const address = await tx.address.create({
        data: {
          customerId: customer.id,
          type: 'SHIPPING',
          firstName,
          lastName,
          addressLine1: cleanAddress,
          addressLine2: cleanApartment,
          city: cleanCity || 'Metropolis',
          state: cleanState,
          postalCode: cleanPostal || '00000',
          country: cleanCountry,
          phone: cleanPhone || null,
          isDefault: true,
        },
      });

      const isCod = paymentMethod === 'Private Courier Cash';

      // 7. Initialize Payment through Payment Abstraction Layer
      const paymentService = getPaymentService();
      const intentResult = await paymentService.createPaymentIntent({
        orderId: orderNumber,
        orderNumber,
        amount: total,
        currency: 'USD',
        customerEmail: cleanEmail,
        customerName: cleanCustomerName,
        paymentMethod: paymentMethod || 'CREDIT_CARD',
      });

      // 8. Create Order with initial Status PENDING (or CONFIRMED for COD)
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerEmail: cleanEmail,
          customerName: cleanCustomerName,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          status: isCod ? 'CONFIRMED' : 'PENDING',
          currency: 'USD',
          subtotal,
          discountAmount,
          shippingFee,
          taxAmount,
          total,
          couponId: appliedCouponId,
          giftWrap: giftWrap !== undefined ? Boolean(giftWrap) : true,
          sampleChoices: cleanSamples,
          specialInstructions: cleanNotes,
          items: {
            create: verifiedLineItems.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productSku: item.product.sku,
              productImage:
                item.product.images.length > 0 ? item.product.images[0].url : '',
              size: item.volume,
              unitPrice: item.verifiedUnitPrice,
              quantity: item.quantity,
              totalPrice: item.lineTotal,
            })),
          },
          payments: {
            create: {
              amount: total,
              currency: 'USD',
              paymentMethod: paymentMethod || 'CREDIT_CARD',
              status: isCod ? 'AUTHORIZED' : 'PENDING',
              transactionId: intentResult.transactionId,
              gatewayResponse: JSON.stringify({
                provider: paymentService.providerName,
                clientSecret: intentResult.clientSecret,
              }),
            },
          },
          shipment: {
            create: {
              carrier: 'White-Glove Private Courier',
              trackingNumber: `WG-FRG-${randomSuffix}`,
              status: 'PROCESSING',
            },
          },
          timeline: {
            create: [
              {
                status: 'PLACED',
                title: 'Order Placed',
                note: `Commission ${orderNumber} placed by patron ${customerName}`,
                actor: 'CUSTOMER',
              },
              ...(isCod
                ? [
                    {
                      status: 'CONFIRMED',
                      title: 'Order Confirmed',
                      note: 'Private Courier commission approved for preparation',
                      actor: 'SYSTEM',
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          items: true,
          payments: true,
          shipment: true,
          shippingAddress: true,
          timeline: true,
          adminNotes: true,
        },
      });

      // 9. Deduct Inventory Atomically
      for (const item of verifiedLineItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        await tx.inventory.updateMany({
          where: { productId: item.product.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return {
        order: newOrder,
        paymentIntent: {
          transactionId: intentResult.transactionId,
          clientSecret: intentResult.clientSecret,
          provider: paymentService.providerName,
        },
      };
    });

    // Dispatch Order Confirmed Customer Notification
    await sendCustomerNotification({
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      customerEmail: result.order.customerEmail,
      customerName: result.order.customerName,
      type: 'ORDER_CONFIRMED',
    });

    return NextResponse.json(
      {
        success: true,
        order: result.order,
        paymentIntent: result.paymentIntent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Order creation failed' },
      { status: 400 }
    );
  }
}
