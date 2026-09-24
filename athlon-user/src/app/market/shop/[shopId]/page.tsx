'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Store,
  ChevronLeft,
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { MarketplaceApi, MarketShop, MarketProduct } from '@/lib/api/marketplace';
import { MarketProductCard } from '@/components/market/MarketProductCard';

export default function ShopPublicStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.shopId as string;

  const [shop, setShop] = useState<MarketShop | null>(null);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShopData() {
      if (!shopId) return;
      setLoading(true);
      const [s, allProds] = await Promise.all([
        MarketplaceApi.getShopById(shopId),
        MarketplaceApi.getProducts({ sellerType: 'SHOP' }),
      ]);
      setShop(s);
      setProducts(allProds.filter((p) => p.shopId === shopId || p.sellerName === s?.name));
      setLoading(false);
    }
    loadShopData();
  }, [shopId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 rounded-3xl bg-card animate-pulse border border-white/5" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <Store className="w-12 h-12 text-foreground/40 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Sports Shop Not Found</h2>
        <Link href="/market" className="text-xs text-primary font-bold hover:underline">
          Return to Market
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* Top Back Nav */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-foreground/70 hover:text-foreground p-1.5 rounded-full hover:bg-card"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Market</span>
      </button>

      {/* ─── Shop Header Banner ─── */}
      <div
        className="rounded-3xl border overflow-hidden bg-card relative shadow-2xl"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {/* Banner Cover */}
        <div className="h-36 sm:h-48 w-full relative overflow-hidden bg-surface">
          <img
            src={shop.banner || '/placeholder.png'}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        </div>

        {/* Shop Info Overlay */}
        <div className="p-5 sm:p-6 -mt-14 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-background bg-card shadow-2xl shrink-0">
              <img src={shop.logo || '/placeholder.png'} alt={shop.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">{shop.name}</h1>
                {shop.isVerified && (
                  <span className="p-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40" title="Verified Sports Retailer">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <p className="text-xs text-foreground/60 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                <span>{shop.address || shop.location}</span>
              </p>

              <div className="flex items-center gap-3 text-xs pt-0.5">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{shop.rating}</span>
                  <span className="text-foreground/40">({shop.reviewCount} reviews)</span>
                </span>
                <span>•</span>
                <span className="text-foreground/60">{shop.sportsOffered.join(' • ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${shop.contactNumber}`}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-primary/50 text-foreground flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Call Shop</span>
            </a>
            <a
              href={`mailto:${shop.businessEmail}`}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-primary/50 text-foreground flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Description & Policies */}
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/5 space-y-2">
          <p className="text-xs text-foreground/75 leading-relaxed max-w-3xl">
            {shop.description}
          </p>
        </div>
      </div>

      {/* ─── Shop Products Catalog ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="text-base font-black text-foreground uppercase tracking-tight">
              Products Catalog ({products.length})
            </h2>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 bg-card">
            <p className="text-xs text-foreground/50">No products currently listed by this shop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <MarketProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
