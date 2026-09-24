'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ShoppingBag,
  DollarSign,
  MessageSquare,
  Package,
  Heart,
  Plus,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { MarketplaceApi, MarketShop, MarketProduct } from '@/lib/api/marketplace';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';

export default function MyMarketPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userEmail = useAuthStore((state) => state.userEmail);

  const [shops, setShops] = useState<MarketShop[]>([]);
  const [myListings, setMyListings] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [shps, prods] = await Promise.all([
        MarketplaceApi.getShops(),
        MarketplaceApi.getProducts(),
      ]);
      setShops(shps);
      setMyListings(prods.filter((p) => p.sellerUserId === 'usr-dinesh'));
      setLoading(false);
    }
    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Store className="w-14 h-14 text-primary mx-auto opacity-80" />
        <h1 className="text-xl font-black text-foreground">My Market Hub</h1>
        <p className="text-xs text-foreground/60 leading-relaxed">
          Log in with your ATHLON account to view your buying orders, selling listings, and manage your sports shops.
        </p>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 rounded-full text-xs font-black bg-primary text-primary-foreground hover:opacity-90 shadow-lg"
        >
          Sign In to Continue
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            My Market
          </h1>
          <p className="text-xs text-foreground/60 mt-0.5">
            Manage your buying activity, selling listings, and sports retail operations.
          </p>
        </div>
      </div>

      {/* ─── BUYING SECTION ─── */}
      <section className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
            Buying
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/market/orders"
            className="p-3.5 rounded-2xl border border-white/5 bg-surface/50 hover:bg-surface hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-1 group"
          >
            <Package className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold text-foreground">Orders</span>
            <span className="text-[10px] text-foreground/40 font-mono">0 Active</span>
          </Link>

          <Link
            href="/market/offers"
            className="p-3.5 rounded-2xl border border-white/5 bg-surface/50 hover:bg-surface hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-1 group"
          >
            <DollarSign className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold text-foreground">Offers</span>
            <span className="text-[10px] text-foreground/40 font-mono">1 Pending</span>
          </Link>

          <Link
            href="/market/enquiries"
            className="p-3.5 rounded-2xl border border-white/5 bg-surface/50 hover:bg-surface hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-1 group"
          >
            <MessageSquare className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold text-foreground">Enquiries</span>
            <span className="text-[10px] text-foreground/40 font-mono">2 Messages</span>
          </Link>
        </div>
      </section>

      {/* ─── SELLING SECTION ─── */}
      <section className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
              Selling
            </h2>
          </div>
          <Link
            href="/market/sell"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <span>Seller Status</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {myListings.length > 0 ? (
            <div className="space-y-2">
              {myListings.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl border border-white/5 bg-surface flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.primaryImage}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 leading-tight">
                      <h4 className="text-xs font-bold text-foreground truncate">{p.name}</h4>
                      <p className="text-[11px] font-black text-primary mt-0.5">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/market/product/${p.id}`}
                    className="p-2 rounded-xl border border-white/10 hover:border-primary/50 text-foreground/70 hover:text-foreground text-xs font-bold shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface/50 text-center space-y-2">
              <p className="text-xs text-foreground/50">You have no active listings.</p>
              <Link
                href="/market/sell"
                className="inline-block px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground"
              >
                + List an Item
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── MY SPORTS SHOPS SECTION ─── */}
      <section className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
              My Sports Shops
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="p-4 rounded-2xl border border-white/10 bg-surface/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={shop.logo || '/placeholder.png'}
                  alt={shop.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-foreground truncate">{shop.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Active Shop Plan
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    {shop.productsCount} Products • {shop.activeOrdersCount} Orders
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/market/manage/${shop.id}`}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 transition-all text-center"
                  style={{
                    backgroundColor: 'var(--athlon-primary, #22C55E)',
                    color: 'var(--athlon-primary-foreground, #000)',
                  }}
                >
                  Manage Shop
                </Link>
                <Link
                  href={`/market/shop/${shop.id}`}
                  className="p-2 rounded-xl border border-white/10 hover:border-primary/50 text-foreground/70 hover:text-foreground"
                  title="View Public Storefront"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          <Link
            href="/market/manage/new-shop"
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-white/15 hover:border-primary/50 text-foreground/70 hover:text-primary flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Sports Shop</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
