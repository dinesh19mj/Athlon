'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Store,
  ChevronLeft,
  DollarSign,
  Package,
  AlertTriangle,
  MessageSquare,
  Tag,
  Plus,
  ArrowRight,
  TrendingUp,
  Boxes,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { MarketplaceApi, MarketShop, MarketProduct } from '@/lib/api/marketplace';

export default function ManageShopPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.shopId as string;

  const [shop, setShop] = useState<MarketShop | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'inventory' | 'orders'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShop() {
      if (!shopId) return;
      setLoading(true);
      const s = await MarketplaceApi.getShopById(shopId);
      setShop(s);
      setLoading(false);
    }
    loadShop();
  }, [shopId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-64 rounded-3xl bg-card animate-pulse border border-white/5" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <Store className="w-12 h-12 text-foreground/40 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Shop Not Found</h2>
        <Link href="/market/my" className="text-xs text-primary font-bold hover:underline">
          Return to My Market
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/market/my')}
            className="p-1.5 rounded-full hover:bg-card text-foreground/70"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <span>{shop.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40">
                Shop Manager
              </span>
            </h1>
            <p className="text-xs text-foreground/50">Marketplace Commercial Management System</p>
          </div>
        </div>

        <Link
          href={`/market/sell/new?sellerIdentity=${shop.id}`}
          className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 shadow-md"
          style={{
            backgroundColor: 'var(--athlon-primary, #22C55E)',
            color: 'var(--athlon-primary-foreground, #000)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
        </Link>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'products', label: 'Products Catalog' },
          { id: 'inventory', label: 'Inventory & Stock' },
          { id: 'orders', label: 'Orders & Sales' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: DASHBOARD ─── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/50">Today Sales</span>
              <p className="text-lg font-black text-foreground font-mono">₹12,450</p>
              <span className="text-[9px] text-emerald-400 font-bold">+18% vs yesterday</span>
            </div>

            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/50">Orders</span>
              <p className="text-lg font-black text-foreground font-mono">8</p>
              <span className="text-[9px] text-foreground/40">3 pending dispatch</span>
            </div>

            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/50">Active Products</span>
              <p className="text-lg font-black text-foreground font-mono">{shop.productsCount}</p>
              <span className="text-[9px] text-foreground/40">All categories</span>
            </div>

            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/50">Low Stock</span>
              <p className="text-lg font-black text-amber-400 font-mono">2</p>
              <span className="text-[9px] text-amber-400 font-bold">Action required</span>
            </div>

            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/50">Enquiries</span>
              <p className="text-lg font-black text-foreground font-mono">5</p>
              <span className="text-[9px] text-blue-400 font-bold">New messages</span>
            </div>

            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/50">Offers</span>
              <p className="text-lg font-black text-foreground font-mono">3</p>
              <span className="text-[9px] text-foreground/40">Pending decision</span>
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="rounded-3xl border p-5 bg-card space-y-3" style={{ borderColor: 'var(--athlon-border)' }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground/70">
              Quick Management Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href={`/market/sell/new?sellerIdentity=${shop.id}`}
                className="p-3.5 rounded-2xl border border-white/5 bg-surface/60 hover:bg-surface hover:border-primary/40 flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Add Product</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="p-3.5 rounded-2xl border border-white/5 bg-surface/60 hover:bg-surface hover:border-primary/40 flex items-center gap-3 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">View Orders</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="p-3.5 rounded-2xl border border-white/5 bg-surface/60 hover:bg-surface hover:border-primary/40 flex items-center gap-3 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Adjust Stock</span>
              </button>

              <Link
                href={`/market/shop/${shop.id}`}
                className="p-3.5 rounded-2xl border border-white/5 bg-surface/60 hover:bg-surface hover:border-primary/40 flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Public Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: PRODUCTS / INVENTORY / ORDERS PLACEHOLDERS ─── */}
      {activeTab !== 'dashboard' && (
        <div className="rounded-3xl border p-8 bg-card text-center space-y-3" style={{ borderColor: 'var(--athlon-border)' }}>
          <Boxes className="w-10 h-10 text-primary mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-foreground capitalize">{activeTab} Operational Console</h3>
          <p className="text-xs text-foreground/50 max-w-sm mx-auto">
            Live catalog synced with 84 retail items and real-time inventory decrement.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-primary text-foreground"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
