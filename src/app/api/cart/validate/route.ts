import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface CartInputItem {
  productId: string;
  volume?: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawItems: CartInputItem[] = Array.isArray(body.items) ? body.items : [];

    if (rawItems.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        totalItems: 0,
        warnings: [],
      });
    }

    const productIds = Array.from(new Set(rawItems.map((i) => i.productId)));

    // Fetch products directly from database (Never trust price or stock from client!)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: true,
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    const verifiedItems: Array<{
      productId: string;
      productName: string;
      productImage: string;
      slug: string;
      volume: string;
      quantity: number;
      unitPrice: number;
      originalPrice: number;
      isSale: boolean;
      totalPrice: number;
      availableStock: number;
    }> = [];

    const warnings: string[] = [];

    for (const rawItem of rawItems) {
      const product = productsMap.get(rawItem.productId);

      if (!product) {
        warnings.push(`A requested flacon is no longer available in our active catalog.`);
        continue;
      }

      const availableStock = product.inventory ? product.inventory.quantity : product.stockQuantity;

      if (availableStock <= 0) {
        warnings.push(`"${product.name}" is currently out of stock and was removed from your bag.`);
        continue;
      }

      // Enforce stock bounds: clamp client quantity to available stock
      let quantity = Math.max(1, Math.floor(rawItem.quantity || 1));
      if (quantity > availableStock) {
        quantity = availableStock;
        warnings.push(
          `Quantity for "${product.name}" was adjusted to ${availableStock} (maximum available in vault).`
        );
      }

      // Compute verified price based on volume
      const is50ml = rawItem.volume?.includes('50');
      const baseFullPrice = product.price;
      const baseSalePrice = product.salePrice;

      const regularPrice = is50ml ? Math.round(baseFullPrice * 0.65) : baseFullPrice;
      const salePrice = baseSalePrice
        ? is50ml
          ? Math.round(baseSalePrice * 0.65)
          : baseSalePrice
        : null;

      const unitPrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
      const isSale = Boolean(salePrice && salePrice < regularPrice);
      const totalPrice = unitPrice * quantity;

      const primaryImg =
        product.images.length > 0
          ? product.images[0].url
          : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';

      const volumeText = is50ml
        ? '50 ml / 1.7 FL. OZ.'
        : product.size || '100 ml / 3.4 FL. OZ.';

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: primaryImg,
        slug: product.slug,
        volume: volumeText,
        quantity,
        unitPrice,
        originalPrice: regularPrice,
        isSale,
        totalPrice,
        availableStock,
      });
    }

    // Calculate verified totals
    const totalItems = verifiedItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = verifiedItems.reduce((acc, item) => acc + item.totalPrice, 0);

    // Shipping fee rule: Free courier for subtotal >= $250, otherwise $25 white-glove flat fee
    const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 25;

    // Luxury estimated tax: 8% on products
    const tax = Math.round(subtotal * 0.08 * 100) / 100;

    const total = subtotal + shipping + tax;

    return NextResponse.json({
      success: true,
      items: verifiedItems,
      subtotal,
      shipping,
      tax,
      total,
      totalItems,
      warnings,
    });
  } catch (error: any) {
    console.error('Cart validation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
