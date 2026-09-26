'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ChevronLeft, ShoppingBag } from 'lucide-react';
import { MarketProduct, MarketplaceApi } from '@/lib/api/marketplace';
import { MarketProductCard } from '@/components/market/MarketProductCard';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';

export default function MarketWishlistPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [wishlist, setWishlist] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadWishlist() {
      setLoading(true);
      const ids = MarketplaceApi.getWishlist();
      if (ids.length === 0) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      const items = await Promise.all(ids.map((id) => MarketplaceApi.getProductById(id)));
      setWishlist(items.filter((p): p is MarketProduct => p !== null));
      setLoading(false);
    }
    loadWishlist();
  }, []);

  const handleWishlistChange = async (productId: string, isSaved: boolean) => {
    if (!isSaved) {
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-card text-foreground/70"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            My Wishlist
          </h1>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-white/10 bg-card space-y-4">
          <Heart className="w-12 h-12 text-foreground/30 mx-auto" />
          <h2 className="text-base font-bold text-foreground">Sign in to view your wishlist</h2>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            Save rackets, shoes, and sports gear you love across any device.
          </p>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-2.5 rounded-full text-xs font-black bg-primary text-primary-foreground hover:opacity-90"
          >
            Log In or Register
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-[4/3] rounded-2xl bg-card animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-card space-y-4">
          <ShoppingBag className="w-12 h-12 text-foreground/30 mx-auto" />
          <h2 className="text-base font-bold text-foreground">Your wishlist is empty</h2>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            Explore quality badminton rackets, shoes, cricket bats, and more to save items here.
          </p>
          <Link
            href="/market"
            className="inline-block px-6 py-2.5 rounded-full text-xs font-black bg-primary text-primary-foreground hover:opacity-90"
          >
            Browse Athlon Market
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {wishlist.map((product) => (
            <MarketProductCard
              key={product.id}
              product={product}
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
