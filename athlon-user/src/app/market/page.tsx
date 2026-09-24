'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ScanLine,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Store,
  Tag,
  CheckCircle2,
  MapPin,
  Star,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { AppModeSwitcher } from '@/components/navigation/AppModeSwitcher';
import { MarketCategoryPills } from '@/components/market/MarketCategoryPills';
import { MarketHeroBanner } from '@/components/market/MarketHeroBanner';
import { MarketProductCard } from '@/components/market/MarketProductCard';
import {
  MarketProduct,
  MarketShop,
  MarketplaceApi,
} from '@/lib/api/marketplace';

export default function MarketHomePage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [shops, setShops] = useState<MarketShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const [prods, shps] = await Promise.all([
        MarketplaceApi.getProducts({ sport: selectedSport }),
        MarketplaceApi.getShops(),
      ]);
      if (isMounted) {
        setProducts(prods);
        setShops(shps);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedSport]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/market/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/market/search');
    }
  };

  const preOwnedProducts = products.filter((p) => p.productType === 'USED' || p.condition !== 'NEW');
  const newArrivals = products.filter((p) => p.condition === 'NEW' || p.condition === 'LIKE_NEW');
  const dealsProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-8 space-y-6">
      {/* ─── 1. PWA Mobile Mode Switcher (Visible on Mobile only) ─── */}
      <div className="block md:hidden">
        <AppModeSwitcher />
      </div>

      {/* ─── 2. Brand Header ─── */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <span>ATHLON</span>
          <span
            className="text-primary font-black"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            MARKET
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-foreground/60 font-medium">
          Buy. Sell. Play Better. Quality Sports Gear for Every Player.
        </p>
      </div>

      {/* ─── 3. Search Bar with Scan QR ─── */}
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div
          className="flex items-center px-4 py-3 rounded-2xl border shadow-inner transition-all group focus-within:ring-1 focus-within:ring-primary"
          style={{
            backgroundColor: 'var(--athlon-input, #0B1310)',
            borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
          }}
        >
          <Search className="w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sports gear, brands, shops..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-foreground/35"
            style={{ color: 'var(--athlon-text, #FFF)' }}
          />
          <button
            type="button"
            onClick={() => router.push('/market/search')}
            className="p-1 text-foreground/40 hover:text-foreground transition-colors ml-2 shrink-0"
            title="Search Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => alert('Camera QR/Barcode scanner ready for product tags.')}
            className="p-1 text-foreground/40 hover:text-foreground transition-colors ml-1.5 shrink-0"
            title="Scan QR or Barcode"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* ─── 4. Sport Categories Pill Row ─── */}
      <div>
        <MarketCategoryPills
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />
      </div>

      {/* ─── 5. Dynamic Market Hero Promotional Carousel ─── */}
      <div>
        <MarketHeroBanner />
      </div>

      {/* ─── 6. PRE-OWNED GEAR SECTION (Matching Reference) ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">♻️</span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
              Pre-Owned Gear
            </h2>
          </div>
          <Link
            href="/market/search?condition=USED"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[4/3] rounded-2xl bg-card animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : preOwnedProducts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-card">
            <p className="text-xs text-foreground/50">No pre-owned gear found for {selectedSport}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {preOwnedProducts.slice(0, 4).map((product) => (
              <MarketProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─── 7. SPORTS SHOPS SECTION (Matching Reference) ─── */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏬</span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
              Sports Shops
            </h2>
          </div>
          <Link
            href="/market/search?sellerType=SHOP"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/market/shop/${shop.id}`}
              className="group p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] flex items-center justify-between gap-4"
              style={{
                backgroundColor: 'var(--athlon-card, #111A15)',
                borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative">
                  <img
                    src={shop.logo || '/placeholder.png'}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  {shop.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-black">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                      {shop.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-foreground/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-foreground/40 shrink-0" />
                    <span className="truncate">{shop.location}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-foreground/50">
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{shop.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{shop.productsCount} Products</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 8. NEW ARRIVALS SECTION ─── */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/market/search?sort=newest"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {newArrivals.slice(0, 4).map((product) => (
            <MarketProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
