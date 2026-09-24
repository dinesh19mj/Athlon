'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Heart, ShieldCheck, Store } from 'lucide-react';
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

  const getConditionLabel = () => {
    if (product.condition === 'LIKE_NEW') return 'LIKE NEW';
    if (product.condition === 'NEW') return 'NEW';
    if (product.condition === 'EXCELLENT') return 'EXCELLENT';
    if (product.condition === 'GOOD') return 'GOOD';
    return 'USED';
  };

  const isShop = product.sellerType === 'SHOP';

  return (
    <Link
      href={`/market/product/${product.id}`}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card, #111A15)',
        borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* ─── Product Image Container ─── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface/80">
        <img
          src={product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Condition Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${
              product.condition === 'NEW'
                ? 'bg-emerald-500/80 text-white border-emerald-400/30'
                : product.condition === 'LIKE_NEW'
                ? 'bg-blue-500/80 text-white border-blue-400/30'
                : 'bg-black/60 text-white/90 border-white/10'
            }`}
          >
            {getConditionLabel()}
          </span>
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'text-red-500 fill-red-500' : 'text-white'
            }`}
            strokeWidth={isWishlisted ? 2.5 : 2}
          />
        </button>

        {/* Negotiable Pill (if applicable) */}
        {product.negotiable && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
              Negotiable
            </span>
          </div>
        )}
      </div>

      {/* ─── Content Details ─── */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-foreground">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-foreground/40 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-foreground/50 mt-1">
            <MapPin className="w-3 h-3 text-foreground/40 shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
        </div>

        {/* ─── Seller Information ─── */}
        <div
          className="pt-2 border-t flex items-center gap-2 mt-auto"
          style={{ borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.06))' }}
        >
          <div className="relative shrink-0">
            <img
              src={product.sellerAvatar || '/placeholder.png'}
              alt={product.sellerName}
              className="w-5 h-5 rounded-full object-cover border border-white/10"
            />
            {isShop && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-black" />
            )}
          </div>

          <div className="flex flex-col min-w-0 leading-none">
            <span className="text-[11px] font-bold text-foreground truncate">
              {product.sellerName}
            </span>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground/45 mt-0.5 flex items-center gap-0.5">
              {isShop ? (
                <>
                  <Store className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                  <span>SPORTS SHOP</span>
                </>
              ) : (
                <span>{product.sellerRoleBadge || 'ATHLON PLAYER'}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MarketProductCard;
