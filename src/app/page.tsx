import React from 'react';
import prisma from '@/lib/prisma';
import { parseJsonSafe } from '@/lib/formatters';
import { ProductData } from '@/types';

// Homepage Component Sequence:
// 1. Header (rendered via RootLayout)
// 2. Full-screen Hero
import Hero from '@/components/home/Hero';
// 3. Featured / Signature Fragrances
import SignatureFragrancesSection from '@/components/home/SignatureFragrancesSection';
// 4. About Fragrea
import AboutFragreaSection from '@/components/home/AboutFragreaSection';
// 5. Fragrance Discovery ("FIND YOUR FRAGRANCE")
import DiscoverYourFragrance from '@/components/home/DiscoverYourFragrance';
// 6. Featured Fragrance / Editorial ("ABRAR")
import EditorialStorySection from '@/components/home/EditorialStorySection';
// 7. Trust & Service Benefits (Delivery / Returns / Secure Payment / Order Tracking)
import TrustBenefitsSection from '@/components/home/TrustBenefitsSection';
// 8. Final CTA
import FinalCTA from '@/components/home/FinalCTA';
// 9. Footer (rendered via RootLayout)

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FRAGREA | Haute Parfumerie & Luxury Fragrance House',
  description:
    'Distinct compositions, created with depth, character and presence. Discover sovereign scents bottled in obsidian crystal.',
};

async function getHomeData() {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        collection: true,
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: true,
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    const products: ProductData[] = dbProducts.map((p) => {
      const imageUrls = p.images.map((img) => img.url);

      return {
        ...p,
        stock: p.inventory ? p.inventory.quantity : p.stockQuantity,
        stockQuantity: p.inventory ? p.inventory.quantity : p.stockQuantity,
        isFeatured: p.featured,
        newArrival: (p as any).newArrival,
        isPublished: p.status === 'ACTIVE',
        isSale: Boolean(p.salePrice && p.salePrice < p.price),
        subtitle: p.shortDescription || '',
        volume: p.size,
        concentration: 'Extrait de Parfum (30% Oil)',
        gender: 'Unisex',
        rating: 4.95,
        olfactoryFamily: p.shortDescription?.includes('Oud')
          ? 'Woody Oriental'
          : p.shortDescription?.includes('Sandalwood')
          ? 'Woody Creamy'
          : p.shortDescription?.includes('Labdanum')
          ? 'Warm Amber'
          : p.shortDescription?.includes('Rose')
          ? 'Dark Floral'
          : p.shortDescription?.includes('Tobacco')
          ? 'Leather & Tobacco'
          : p.shortDescription?.includes('Iris')
          ? 'Powdery Woody'
          : p.shortDescription?.includes('Vetiver')
          ? 'Earthy Fresh'
          : 'Luminous Floral',
        images:
          imageUrls.length > 0
            ? imageUrls
            : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
        topNotes: parseJsonSafe<string[]>(p.topNotes, []),
        heartNotes: parseJsonSafe<string[]>(p.heartNotes, []),
        baseNotes: parseJsonSafe<string[]>(p.baseNotes, []),
        collection: p.collection
          ? {
              id: p.collection.id,
              name: p.collection.name,
              slug: p.collection.slug,
              subtitle: p.collection.subtitle,
              description: p.collection.description,
              heroImage: p.collection.heroImage,
              featured: p.collection.featured,
              status: p.collection.status,
            }
          : null,
      };
    });

    return { products };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return { products: [] };
  }
}

export default async function HomePage() {
  const { products } = await getHomeData();

  return (
    <div className="space-y-0 animate-fade-in">
      {/* 2. FULL-SCREEN HERO */}
      <Hero />

      {/* 3. FEATURED / SIGNATURE FRAGRANCES */}
      <SignatureFragrancesSection products={products} />

      {/* 4. ABOUT FRAGREA */}
      <AboutFragreaSection />

      {/* 5. FRAGRANCE DISCOVERY */}
      <DiscoverYourFragrance products={products} />

      {/* 6. FEATURED FRAGRANCE / EDITORIAL */}
      <EditorialStorySection />

      {/* 7. TRUST & SERVICE BENEFITS */}
      <TrustBenefitsSection />

      {/* 8. FINAL CTA */}
      <FinalCTA />
    </div>
  );
}
