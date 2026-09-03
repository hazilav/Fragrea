'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { ProductData } from '@/types';
import { useCart } from '@/context/CartContext';

type FilterCategory = 'ALL' | 'WOODY' | 'AMBER' | 'FRESH' | 'FLORAL' | 'SPICED';
type SortOption = 'FEATURED' | 'NEWEST' | 'PRICE: LOW TO HIGH' | 'PRICE: HIGH TO LOW';

interface ShopClientProps {
  initialProducts: ProductData[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const { addToCart, setIsCartOpen } = useCart();

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [activeSort, setActiveSort] = useState<SortOption>('FEATURED');

  // Filter products by category
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      if (activeCategory === 'ALL') return true;

      const searchableText = [
        p.name,
        p.olfactoryFamily,
        p.shortDescription,
        p.description,
        ...(p.topNotes || []),
        ...(p.heartNotes || []),
        ...(p.baseNotes || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (activeCategory === 'WOODY') {
        return (
          searchableText.includes('woody') ||
          searchableText.includes('wood') ||
          searchableText.includes('oud') ||
          searchableText.includes('sandalwood') ||
          searchableText.includes('cedar')
        );
      }
      if (activeCategory === 'AMBER') {
        return (
          searchableText.includes('amber') ||
          searchableText.includes('resin') ||
          searchableText.includes('labdanum') ||
          searchableText.includes('vanilla') ||
          searchableText.includes('balsam')
        );
      }
      if (activeCategory === 'FRESH') {
        return (
          searchableText.includes('fresh') ||
          searchableText.includes('citrus') ||
          searchableText.includes('bergamot') ||
          searchableText.includes('vetiver') ||
          searchableText.includes('neroli')
        );
      }
      if (activeCategory === 'FLORAL') {
        return (
          searchableText.includes('floral') ||
          searchableText.includes('rose') ||
          searchableText.includes('iris') ||
          searchableText.includes('jasmine') ||
          searchableText.includes('néroli')
        );
      }
      if (activeCategory === 'SPICED') {
        return (
          searchableText.includes('spic') ||
          searchableText.includes('saffron') ||
          searchableText.includes('cardamom') ||
          searchableText.includes('pepper') ||
          searchableText.includes('tobacco') ||
          searchableText.includes('cinnamon')
        );
      }

      return true;
    });
  }, [initialProducts, activeCategory]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const getPrice = (item: ProductData) =>
        item.isSale && item.salePrice ? item.salePrice : item.price;

      if (activeSort === 'FEATURED') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.rating ?? 5) - (a.rating ?? 5);
      }
      if (activeSort === 'NEWEST') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (activeSort === 'PRICE: LOW TO HIGH') {
        return getPrice(a) - getPrice(b);
      }
      if (activeSort === 'PRICE: HIGH TO LOW') {
        return getPrice(b) - getPrice(a);
      }
      return 0;
    });
  }, [filteredProducts, activeSort]);

  const handleAddToCart = (e: React.MouseEvent, p: ProductData) => {
    e.preventDefault();
    e.stopPropagation();

    const stockAvailable =
      p.stockQuantity !== undefined
        ? p.stockQuantity
        : p.stock !== undefined
        ? p.stock
        : 10;
    if (stockAvailable <= 0) return;

    addToCart({
      productId: p.id,
      productName: p.name,
      slug: p.slug,
      price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
      productImage:
        p.images && p.images[0]
          ? p.images[0]
          : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200',
      volume: p.volume || p.size || '100ml',
      quantity: 1,
    });
    setIsCartOpen(true);
  };

  const categories: FilterCategory[] = ['ALL', 'WOODY', 'AMBER', 'FRESH', 'FLORAL', 'SPICED'];
  const sortOptions: SortOption[] = [
    'FEATURED',
    'NEWEST',
    'PRICE: LOW TO HIGH',
    'PRICE: HIGH TO LOW',
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ============================================================ */}
      {/* SIMPLE & CLEAN CONTROLS BAR: FILTERS + SORTING */}
      {/* ============================================================ */}
      <div className="border-y border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Simple Horizontal Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[10.5px] uppercase tracking-[0.22em] transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gold-400 text-noir-950 font-medium shadow-luxury'
                  : 'bg-noir-900/80 text-ivory-300 hover:text-gold-300 border border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Simple Sort Selector */}
        <div className="flex items-center gap-3 select-none shrink-0">
          <span className="text-[10.5px] uppercase tracking-[0.22em] text-ivory-400/80 font-light hidden sm:inline-block">
            Sort By:
          </span>
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as SortOption)}
              aria-label="Sort products"
              className="appearance-none bg-noir-900 border border-white/15 text-ivory-100 text-[10.5px] uppercase tracking-[0.2em] pl-4 pr-9 py-2.5 focus:outline-none focus:border-gold-400 cursor-pointer font-medium"
            >
              {sortOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-noir-950 text-ivory-100">
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gold-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PRODUCT GRID: 4 columns desktop, 2 columns tablet, 2 mobile */}
      {/* ============================================================ */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-24 space-y-4 border border-white/10 p-12 max-w-lg mx-auto bg-noir-900/40">
          <p className="font-serif text-xl text-ivory-200">
            No fragrances found matching &ldquo;{activeCategory}&rdquo;.
          </p>
          <p className="text-xs text-ivory-400 font-light">
            Try selecting another olfactory category or clear your filter.
          </p>
          <button
            onClick={() => setActiveCategory('ALL')}
            className="mt-4 px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-widest font-medium transition-colors"
          >
            View All Fragrances
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {sortedProducts.map((product) => {
            const stockAvailable =
              product.stockQuantity !== undefined
                ? product.stockQuantity
                : product.stock !== undefined
                ? product.stock
                : 10;
            const isOutOfStock = stockAvailable <= 0;
            const isNew = (product as any).newArrival;
            const isFeatured = product.isFeatured;

            const primaryImage =
              product.images && product.images[0]
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';

            // Derive short fragrance character
            const fragranceCharacter =
              product.olfactoryFamily ||
              (product.shortDescription?.includes('Oud')
                ? 'Woody Oriental'
                : product.shortDescription?.includes('Rose')
                ? 'Dark Floral'
                : product.shortDescription?.includes('Amber')
                ? 'Warm Amber'
                : 'Extrait de Parfum');

            const displayPrice =
              product.isSale && product.salePrice ? product.salePrice : product.price;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-noir-900/60 border border-white/10 hover:border-gold-400/40 transition-all duration-500 overflow-hidden shadow-luxury"
              >
                {/* Large Premium Product Photography */}
                <div className="relative aspect-[3/4] overflow-hidden bg-noir-950">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block w-full h-full relative"
                    aria-label={`View details for ${product.name}`}
                  >
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center brightness-[0.88] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-80" />
                  </Link>

                  {/* Status Badges */}
                  <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 flex flex-col gap-1 z-10 pointer-events-none">
                    {isOutOfStock ? (
                      <span className="px-2 sm:px-2.5 py-0.5 bg-noir-950/90 text-ivory-300 border border-white/20 text-[8px] sm:text-[9px] uppercase tracking-widest font-medium">
                        SOLD OUT
                      </span>
                    ) : isNew ? (
                      <span className="px-2 sm:px-2.5 py-0.5 bg-gold-400 text-noir-950 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold">
                        NEW
                      </span>
                    ) : isFeatured ? (
                      <span className="px-2 sm:px-2.5 py-0.5 bg-noir-950/85 backdrop-blur-md border border-gold-400/40 text-gold-300 text-[8px] sm:text-[9px] uppercase tracking-widest font-light">
                        FEATURED
                      </span>
                    ) : null}
                  </div>

                  {/* Hover Clean Reveal Actions (Desktop) */}
                  <div className="absolute inset-x-3 bottom-3 hidden lg:flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 bg-noir-950/90 hover:bg-noir-900 border border-white/20 text-ivory-100 py-2.5 text-[9.5px] uppercase tracking-[0.2em] font-medium text-center transition-colors truncate"
                    >
                      VIEW PRODUCT
                    </Link>

                    {!isOutOfStock ? (
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-gold-400 hover:bg-gold-300 text-noir-950 p-2.5 shadow-luxury transition-colors shrink-0"
                        aria-label={`Add ${product.name} to Shopping Bag`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="bg-noir-950/80 text-ivory-400/50 p-2.5 border border-white/10 text-[9px] uppercase tracking-widest cursor-not-allowed">
                        UNAVAILABLE
                      </span>
                    )}
                  </div>
                </div>

                {/* Clean Product Dossier */}
                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-noir-900/80">
                  <div className="space-y-1">
                    {/* Short Fragrance Character */}
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.22em] text-gold-400/80 font-light block truncate">
                      {fragranceCharacter}
                    </span>

                    {/* Product Name */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="block font-serif text-base sm:text-lg md:text-xl text-ivory-100 group-hover:text-gold-300 transition-colors truncate"
                    >
                      {product.name}
                    </Link>

                    {/* Price */}
                    <div className="pt-0.5 flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-serif text-ivory-100">
                        ${displayPrice}
                      </span>
                      {product.isSale && product.salePrice && product.salePrice < product.price && (
                        <span className="text-[10px] sm:text-xs text-ivory-400/50 line-through">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Action Row (Visible on sm & mobile screens) */}
                  <div className="pt-2 border-t border-white/10 flex lg:hidden items-center justify-between gap-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em]">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-ivory-300 hover:text-gold-300 transition-colors truncate"
                    >
                      VIEW PRODUCT
                    </Link>

                    {!isOutOfStock ? (
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="text-gold-400 hover:text-gold-300 font-medium transition-colors shrink-0 flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>ADD TO BAG</span>
                      </button>
                    ) : (
                      <span className="text-ivory-500/60 shrink-0">SOLD OUT</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
