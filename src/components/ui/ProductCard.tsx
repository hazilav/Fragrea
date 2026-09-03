'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Eye } from 'lucide-react';
import { ProductData } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: ProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: primaryImage,
      price: product.isSale && product.salePrice ? product.salePrice : product.price,
      volume: product.volume || product.size || '100 ml / 3.4 FL. OZ.',
      slug: product.slug,
      quantity: 1,
    });
  };

  const topNotesPreview = product.topNotes?.slice(0, 3).join(' • ');

  return (
    <div className="group relative flex flex-col bg-noir-900/60 border border-white/5 hover:border-gold-dim transition-all duration-500 overflow-hidden">
      {/* Bottle Visual Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full bg-noir-850 overflow-hidden block">
        {/* Primary and secondary hover image */}
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
        />
        <Image
          src={secondaryImage}
          alt={`${product.name} secondary angle`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover absolute inset-0 opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
        />

        {/* Ambient dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-black/20 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="bg-gold-400/90 backdrop-blur-md text-noir-950 text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold">
              Maison Signature
            </span>
          )}
          {product.isSale && product.salePrice && (
            <span className="bg-espresso-800 text-gold-300 border border-gold-dim text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium">
              Private Offer
            </span>
          )}
          {product.stock <= 8 && product.stock > 0 && (
            <span className="bg-noir-950/90 text-amberGlow-400 border border-amberGlow-500/30 text-[9px] uppercase tracking-wider px-2 py-0.5">
              Only {product.stock} Flacons
            </span>
          )}
        </div>

        {/* Floating Quick Action Bar on Hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className="flex-1 flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 text-[11px] uppercase tracking-widest py-2.5 font-medium transition-colors shadow-luxury disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock > 0 ? 'Quick Reserve' : 'Sold Out'}</span>
          </button>
        </div>
      </Link>

      {/* Fragrance Metadata & Story */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Olfactory family & concentration */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gold-400/80 mb-1">
            <span>{product.olfactoryFamily}</span>
            <span className="text-ivory-400 font-light">{product.volume}</span>
          </div>

          {/* Perfume Name */}
          <h3 className="font-serif text-lg text-ivory-100 group-hover:text-gold-300 transition-colors">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-ivory-400 line-clamp-1 font-light italic mt-0.5">
            {product.subtitle}
          </p>

          {/* Key Notes Accord */}
          {topNotesPreview && (
            <p className="text-[11px] text-ivory-500 line-clamp-1 font-light mt-2 tracking-wide">
              <span className="text-gold-500/70">Accord:</span> {topNotesPreview}
            </p>
          )}
        </div>

        {/* Pricing & Concentration */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-ivory-400 font-light">
            {(product.concentration || 'Extrait').split(' ')[0]}
          </span>
          <div className="flex items-center gap-2">
            {product.isSale && product.salePrice ? (
              <>
                <span className="text-xs text-ivory-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="font-serif text-base text-gold-300 font-medium">
                  {formatCurrency(product.salePrice)}
                </span>
              </>
            ) : (
              <span className="font-serif text-base text-ivory-100 font-normal">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
