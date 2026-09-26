'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Package,
  ChevronRight,
} from 'lucide-react';
import { MarketShop } from '@/lib/api/marketplace';

interface MarketShopCardProps {
  shop: MarketShop;
  className?: string;
}

export function MarketShopCard({ shop, className = '' }: MarketShopCardProps) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const heroImage =
    shop.banner && !imgError
      ? shop.banner
      : shop.logo && !logoError
      ? shop.logo
      : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop';

  const storeLogo =
    shop.logo && !logoError
      ? shop.logo
      : 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=200&auto=format&fit=crop';

  return (
    <Link
      href={`/market/shop/${shop.id}`}
      className={`group flex flex-col rounded-[18px] sm:rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] select-none relative backdrop-blur-xl ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card, #0B1410)',
        borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        boxShadow:
          '0 6px 18px -4px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* ─── Top Laser Accent Rim ─── */}
      <div
        className="absolute top-0 inset-x-0 h-[1.5px] opacity-40 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--athlon-primary, #22C55E) 50%, transparent 100%)',
        }}
      />

      {/* ─── Compact Hero Image Chamber (Matching Product Card aspect ratio) ─── */}
      <div className="relative aspect-[1.05/1] w-full overflow-hidden bg-black/50">
        <img
          src={heroImage}
          alt={shop.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Ambient Top & Bottom Glass Vignettes */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-0" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-0" />

        {/* Verified Status Glass Pill (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm bg-emerald-500/20 text-emerald-300 border-emerald-500/35">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400"
              style={{ boxShadow: '0 0 5px #22C55E' }}
            />
            <span>{shop.isVerified ? 'VERIFIED' : 'PRO SHOP'}</span>
          </div>
        </div>

        {/* Star Rating Badge (Top Right) */}
        <div className="absolute top-2 right-2 z-10">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black bg-black/60 backdrop-blur-md border border-white/20 text-amber-400 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{shop.rating?.toFixed(1) || '4.8'}</span>
          </div>
        </div>

        {/* Floating Inventory & Sport Pill on Scrim (Bottom) */}
        <div className="absolute bottom-1.5 inset-x-1.5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md">
            <Package className="w-3 h-3 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-black font-mono text-white tracking-tight">
              {shop.productsCount || 0} Gears
            </span>
          </div>

          {shop.sportsOffered && shop.sportsOffered[0] && (
            <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-white/15 text-white/90 border border-white/20 backdrop-blur-md shadow-sm">
              {shop.sportsOffered[0]}
            </span>
          )}
        </div>
      </div>

      {/* ─── Compact Content Body ─── */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between gap-1.5">
        {/* Title with Store Mini Avatar */}
        <div className="flex items-center gap-1.5 min-w-0">
          <img
            src={storeLogo}
            alt={shop.name}
            onError={() => setLogoError(true)}
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-md object-cover border border-white/20 shrink-0"
          />
          <h3 className="text-[11.5px] sm:text-[12.5px] font-bold text-foreground leading-[1.25] line-clamp-1 group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
        </div>

        {/* Metadata Line: Location + Visit CTA */}
        <div className="flex items-center justify-between gap-1.5 text-[9.5px] sm:text-[10px] text-foreground/55 pt-0.5">
          {/* Location */}
          <div className="flex items-center gap-0.5 shrink-0 text-foreground/45 max-w-[65%]">
            <MapPin className="w-2.5 h-2.5 text-primary/70 shrink-0" />
            <span className="truncate">
              {shop.location ? shop.location.split(',')[0] : 'Kerala'}
            </span>
          </div>

          {/* Visit CTA */}
          <div className="flex items-center gap-0.5 text-primary font-bold text-[9.5px] shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>Visit</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MarketShopCard;
