'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  SlidersHorizontal,
  X,
  Filter,
} from 'lucide-react';
import { MarketProduct, MarketplaceApi } from '@/lib/api/marketplace';
import { MarketProductCard } from '@/components/market/MarketProductCard';

export default function MarketSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialSport = searchParams.get('sport') || 'All';
  const initialCondition = searchParams.get('condition') || '';
  const initialSellerType = searchParams.get('sellerType') || '';

  const [query, setQuery] = useState(initialQuery);
  const [sport, setSport] = useState(initialSport);
  const [condition, setCondition] = useState(initialCondition);
  const [sellerType, setSellerType] = useState(initialSellerType);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      const res = await MarketplaceApi.getProducts({
        search: query,
        sport: sport === 'All' ? undefined : sport,
        condition: condition || undefined,
        sellerType: sellerType || undefined,
        maxPrice,
      });
      setProducts(res);
      setLoading(false);
    }
    fetchFiltered();
  }, [query, sport, condition, sellerType, maxPrice]);

  const handleResetFilters = () => {
    setQuery('');
    setSport('All');
    setCondition('');
    setSellerType('');
    setMaxPrice(30000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* ─── Top Search Header ─── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-card text-foreground/70"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div
            className="flex items-center px-4 py-2.5 rounded-2xl border shadow-inner transition-all group focus-within:ring-1 focus-within:ring-primary"
            style={{
              backgroundColor: 'var(--athlon-input, #0B1310)',
              borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
            }}
          >
            <Search className="w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gear, brand, racket, shoes, kitbags..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-foreground/35"
              style={{ color: 'var(--athlon-text, #FFF)' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Filter Pills ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {/* Sport Selector */}
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-bold border bg-card text-foreground focus:outline-none cursor-pointer shrink-0"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <option value="All">All Sports</option>
          <option value="Badminton">Badminton</option>
          <option value="Cricket">Cricket</option>
          <option value="Football">Football</option>
          <option value="Tennis">Tennis</option>
        </select>

        {/* Condition Selector */}
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-bold border bg-card text-foreground focus:outline-none cursor-pointer shrink-0"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <option value="">All Conditions</option>
          <option value="NEW">New</option>
          <option value="LIKE_NEW">Like New</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="USED">Pre-Owned</option>
        </select>

        {/* Seller Type Selector */}
        <select
          value={sellerType}
          onChange={(e) => setSellerType(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-bold border bg-card text-foreground focus:outline-none cursor-pointer shrink-0"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <option value="">All Sellers</option>
          <option value="INDIVIDUAL">Athlon Players</option>
          <option value="SHOP">Sports Shops</option>
        </select>

        {(sport !== 'All' || condition || sellerType || query) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/10 cursor-pointer shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ─── Results Count ─── */}
      <div className="flex items-center justify-between text-xs text-foreground/50">
        <span>{loading ? 'Searching...' : `${products.length} products found`}</span>
        <span>Showing authentic listings</span>
      </div>

      {/* ─── Products Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="aspect-[4/3] rounded-2xl bg-card animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-card space-y-3">
          <p className="text-sm font-bold text-foreground">No matches found</p>
          <p className="text-xs text-foreground/50 max-w-sm mx-auto">
            Try adjusting your search query, selecting different sports, or clearing active filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-full text-xs font-black bg-primary text-primary-foreground"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <MarketProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
