'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Sparkles, ShoppingBag, ArrowRight, Compass } from 'lucide-react';
import { ProductData } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

const POPULAR_ACCORDS = [
  'Cambodian Oud',
  'Mysore Sandalwood',
  'Taif Rose',
  'Golden Amber',
  'Blonde Tobacco',
  'Florentine Iris',
  'Haitian Vetiver',
  'Cardamom',
  'Bourbon Vanilla',
];

const FAMILIES = ['ALL', 'WOODY', 'AMBER', 'FRESH', 'FLORAL', 'SPICED'];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const { addToCart, setIsCartOpen } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [activeFamily, setActiveFamily] = useState('ALL');
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSubtitle = (p.subtitle || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchFamily = (p.olfactoryFamily || '').toLowerCase().includes(q);
        const matchNotes =
          p.topNotes?.some((n) => n.toLowerCase().includes(q)) ||
          p.heartNotes?.some((n) => n.toLowerCase().includes(q)) ||
          p.baseNotes?.some((n) => n.toLowerCase().includes(q));

        if (!matchName && !matchSubtitle && !matchDesc && !matchFamily && !matchNotes) {
          return false;
        }
      }

      // Olfactory Family filter
      if (activeFamily !== 'ALL') {
        const desc = (
          (p.shortDescription || '') +
          (p.olfactoryFamily || '') +
          (p.description || '')
        ).toLowerCase();

        if (activeFamily === 'WOODY' && !desc.includes('oud') && !desc.includes('wood') && !desc.includes('sandalwood') && !desc.includes('cedar')) return false;
        if (activeFamily === 'AMBER' && !desc.includes('amber') && !desc.includes('resin') && !desc.includes('labdanum') && !desc.includes('vanilla')) return false;
        if (activeFamily === 'FRESH' && !desc.includes('vetiver') && !desc.includes('citrus') && !desc.includes('fresh') && !desc.includes('bergamot')) return false;
        if (activeFamily === 'FLORAL' && !desc.includes('rose') && !desc.includes('iris') && !desc.includes('floral') && !desc.includes('néroli')) return false;
        if (activeFamily === 'SPICED' && !desc.includes('spice') && !desc.includes('cardamom') && !desc.includes('pepper') && !desc.includes('tobacco')) return false;
      }

      return true;
    });
  }, [products, query, activeFamily]);

  const handleQuickAdd = (e: React.MouseEvent, p: ProductData) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: p.id,
      productName: p.name,
      slug: p.slug,
      price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
      productImage: p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200',
      volume: p.volume || '100ml',
      quantity: 1,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 px-6 sm:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Dossier */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light block">
            Olfactory Discovery Ritual
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            Find Your Scent
          </h1>
          <div className="w-12 h-px bg-gold-400/40 mx-auto" />
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
            Search by raw botanical ingredient, olfactory accord, or fragrance family to discover your sovereign signature.
          </p>
        </div>

        {/* Interactive Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative flex items-center border border-white/20 bg-noir-900/90 focus-within:border-gold-400 shadow-luxury transition-all">
            <Search className="w-5 h-5 text-gold-400 ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by notes (e.g., Oud, Rose, Amber, Sandalwood)..."
              className="w-full bg-transparent px-4 py-4 text-xs sm:text-sm text-ivory-100 placeholder:text-ivory-500 focus:outline-none font-light"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mr-4 text-ivory-400 hover:text-ivory-100 p-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Popular Accords Quick Select */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-gold-400/80 mr-1">
              Iconic Accords:
            </span>
            {POPULAR_ACCORDS.map((accord) => (
              <button
                key={accord}
                onClick={() => setQuery(accord)}
                className={`text-[10.5px] px-2.5 py-1 border transition-colors ${
                  query.toLowerCase() === accord.toLowerCase()
                    ? 'border-gold-400 bg-gold-400/15 text-gold-300'
                    : 'border-white/10 hover:border-gold-400/40 text-ivory-400 hover:text-ivory-200 bg-noir-900/60'
                }`}
              >
                {accord}
              </button>
            ))}
          </div>
        </div>

        {/* Olfactory Family Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-y border-white/10 py-4 select-none">
          {FAMILIES.map((fam) => (
            <button
              key={fam}
              onClick={() => setActiveFamily(fam)}
              className={`px-5 py-2 text-xs uppercase tracking-[0.2em] transition-all font-medium ${
                activeFamily === fam
                  ? 'bg-gold-400 text-noir-950 font-semibold shadow-luxury'
                  : 'text-ivory-400 hover:text-gold-300 bg-noir-900/50 hover:bg-noir-900 border border-transparent hover:border-white/10'
              }`}
            >
              {fam}
            </button>
          ))}
        </div>

        {/* Results Counter & Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-light">
            <span>
              Showing <strong className="text-ivory-100 font-medium">{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'composition' : 'compositions'}
            </span>
            {(query || activeFamily !== 'ALL') && (
              <button
                onClick={() => {
                  setQuery('');
                  setActiveFamily('ALL');
                }}
                className="text-gold-400 hover:underline text-[11px] uppercase tracking-wider"
              >
                Reset Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs uppercase tracking-widest text-ivory-400 font-light">
                Consulting the Maison Formulation Archives...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4 border border-white/10 bg-noir-900/60 p-8 max-w-md mx-auto">
              <Compass className="w-8 h-8 text-gold-400 mx-auto" />
              <h2 className="font-serif text-xl text-ivory-100">No Formulations Found</h2>
              <p className="text-xs text-ivory-400 font-light leading-relaxed">
                No extraits matched &ldquo;{query || activeFamily}&rdquo;. Try another accord or explore the complete collection.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-3 text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  <span>View All Fragrances</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product) => {
                const img =
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';
                const displayPrice =
                  product.salePrice && product.salePrice < product.price
                    ? product.salePrice
                    : product.price;

                return (
                  <div
                    key={product.id}
                    className="group bg-noir-900/60 border border-white/10 hover:border-gold-400/40 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-luxury"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative aspect-[3/4] bg-noir-950 overflow-hidden block"
                    >
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover object-center brightness-[0.88] transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-75" />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-noir-950/85 backdrop-blur-sm border border-white/10 text-[8.5px] uppercase tracking-wider text-gold-300">
                        {product.volume || '100ml'}
                      </div>
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-noir-900/80">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-gold-400/80 block truncate">
                          {product.olfactoryFamily || 'Extrait de Parfum'}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="block font-serif text-base sm:text-lg text-ivory-100 group-hover:text-gold-300 transition-colors truncate"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs font-serif text-gold-300 pt-0.5">
                          {formatCurrency(displayPrice)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex-1 text-center py-2 bg-noir-950 hover:bg-noir-900 border border-white/15 text-[9.5px] uppercase tracking-[0.18em] text-ivory-200 transition-colors truncate"
                        >
                          VIEW PRODUCT
                        </Link>
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="p-2 bg-gold-400 hover:bg-gold-300 text-noir-950 transition-colors shrink-0 shadow-luxury"
                          aria-label={`Add ${product.name} to bag`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-noir-950 flex items-center justify-center text-ivory-400 text-xs tracking-widest uppercase">
          Loading Discovery Suite...
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
