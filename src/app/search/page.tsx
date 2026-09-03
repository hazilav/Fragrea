'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ProductData } from '@/types';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [query, setQuery] = useState(initialQuery);
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

  const results = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase().trim();

    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSubtitle = p.subtitle?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchFamily = p.olfactoryFamily?.toLowerCase().includes(q);
      const matchNotes =
        p.topNotes?.some((n) => n.toLowerCase().includes(q)) ||
        p.heartNotes?.some((n) => n.toLowerCase().includes(q)) ||
        p.baseNotes?.some((n) => n.toLowerCase().includes(q));

      return matchName || matchSubtitle || matchDesc || matchFamily || matchNotes;
    });
  }, [products, query]);

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Search Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium">
            Maison Archives Inquiry
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100">
            Search Olfactory Accords
          </h1>
          <p className="text-xs text-ivory-400 font-light">
            Search by raw botanical ingredients, fragrance name, family, or mood.
          </p>
        </div>

        {/* Large Luxury Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative border-b-2 border-gold-400/60 pb-2 flex items-center gap-3">
            <Search className="w-5 h-5 text-gold-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type an accord (e.g., Oud, Rose, Cardamom, Sandalwood)..."
              className="w-full bg-transparent text-lg md:text-xl font-serif text-ivory-100 placeholder:text-ivory-600 focus:outline-none font-light"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-ivory-400 hover:text-ivory-100 p-1"
                aria-label="Clear Search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Popular Accords Quick Selectors */}
          <div className="pt-4 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-ivory-500 mr-1">
              Frequent Inquiries:
            </span>
            {POPULAR_ACCORDS.map((accord) => (
              <button
                key={accord}
                onClick={() => setQuery(accord)}
                className={`text-[11px] px-3 py-1 border transition-all ${
                  query.toLowerCase() === accord.toLowerCase()
                    ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                    : 'border-white/10 text-ivory-400 hover:border-gold-dim hover:text-ivory-200'
                }`}
              >
                {accord}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 text-xs text-ivory-400">
          <span>
            {query.trim()
              ? `Displaying ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
              : `All Available Flacons (${products.length})`}
          </span>
          {query.trim() && (
            <button
              onClick={() => setQuery('')}
              className="text-gold-400 hover:text-gold-300 text-[11px] uppercase tracking-wider"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-ivory-400">
              Examining Olfactory Registers...
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-noir-900/60 border border-white/5 p-12">
            <Sparkles className="w-8 h-8 text-gold-400/50 mx-auto" />
            <h3 className="font-serif text-xl text-ivory-200">No Corresponding Flacons</h3>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto leading-relaxed">
              We could not find an extrait matching &ldquo;{query}&rdquo;. Try searching for notes such as
              Oud, Sandalwood, Rose, or Amber.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-32 text-center text-xs uppercase tracking-widest text-ivory-400">
          Loading Search Archives...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
