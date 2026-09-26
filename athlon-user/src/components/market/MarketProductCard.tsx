'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Heart, Store, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MarketProduct, MarketplaceApi } from '@/lib/api/marketplace';

interface MarketProductCardProps {
  product: MarketProduct;
  onWishlistChange?: (productId: string, isSaved: boolean) => void;
  className?: string;
}

export function MarketProductCard({
  product,
  onWishlistChange,
  className = '',
}: MarketProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState<boolean>(() =>
    MarketplaceApi.isWishlisted(product.id)
  );

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = await MarketplaceApi.toggleWishlist(product.id);
    setIsWishlisted(nextState);
    onWishlistChange?.(product.id, nextState);
  };

  const getConditionBadge = () => {
    switch (product.condition) {
      case 'NEW':
        return {
          label: 'NEW',
          dot: '#22C55E',
          cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
        };
      case 'LIKE_NEW':
        return {
          label: 'LIKE NEW',
          dot: '#38BDF8',
          cls: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
        };
      case 'EXCELLENT':
        return {
          label: 'EXCELLENT',
          dot: '#A855F7',
          cls: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
        };
      case 'GOOD':
        return {
          label: 'GOOD',
          dot: '#F59E0B',
          cls: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
        };
      default:
        return {
          label: 'PRE-OWNED',
          dot: '#94A3B8',
          cls: 'bg-slate-500/20 text-slate-300 border-slate-500/35',
        };
    }
  };

  const condition = getConditionBadge();
  const isShop = product.sellerType === 'SHOP';

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <Link
      href={`/market/product/${product.id}`}
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

      {/* ─── Compact Hero Image Chamber ─── */}
      <div className="relative aspect-[1.05/1] w-full overflow-hidden bg-black/50">
        <img
          src={product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Ambient Top & Bottom Glass Vignettes */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-0" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-0" />

        {/* Condition Glass Pill (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${condition.cls}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                backgroundColor: condition.dot,
                boxShadow: `0 0 5px ${condition.dot}`,
              }}
            />
            <span>{condition.label}</span>
          </div>
        </div>

        {/* Wishlist Frosted Heart (Top Right) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:scale-110 active:scale-90 transition-all shadow-sm"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all ${
              isWishlisted
                ? 'text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)] scale-110'
                : 'text-white'
            }`}
            strokeWidth={isWishlisted ? 2.5 : 2}
          />
        </button>

        {/* Floating Price & Discount Pill on Image Scrim (Bottom) */}
        <div className="absolute bottom-1.5 inset-x-1.5 z-10 flex items-center justify-between">
          <div className="flex items-baseline gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md">
            <span className="text-[12px] sm:text-[13px] font-black font-mono text-white tracking-tight">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9.5px] font-mono text-white/45 line-through">
                ₹{product.originalPrice >= 1000 ? `${(product.originalPrice / 1000).toFixed(1)}k` : product.originalPrice}
              </span>
            )}
          </div>

          {discountPercent > 0 ? (
            <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black font-mono bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 backdrop-blur-md shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : product.negotiable ? (
            <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 backdrop-blur-md shadow-sm">
              Offer
            </span>
          ) : null}
        </div>
      </div>

      {/* ─── Compact Content Body ─── */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between gap-1.5">
        {/* Title */}
        <h3 className="text-[11.5px] sm:text-[12.5px] font-bold text-foreground leading-[1.25] line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Compact Metadata Line: Seller + Location */}
        <div className="flex items-center justify-between gap-1.5 text-[9.5px] sm:text-[10px] text-foreground/55 pt-0.5">
          {/* Seller */}
          <div className="flex items-center gap-1 min-w-0 max-w-[55%]">
            <div className="relative shrink-0">
              <img
                src={product.sellerAvatar || '/placeholder.png'}
                alt={product.sellerName}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover border border-white/20"
              />
              {isShop && (
                <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 border border-black" />
              )}
            </div>
            <span className="truncate font-semibold text-foreground/75 group-hover:text-foreground">
              {product.sellerName}
            </span>
          </div>

          {/* Location */}
          {product.location && (
            <div className="flex items-center gap-0.5 shrink-0 text-foreground/45">
              <MapPin className="w-2.5 h-2.5 text-primary/70 shrink-0" />
              <span className="truncate max-w-[70px] sm:max-w-[90px]">
                {product.location.split(',')[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default MarketProductCard;
