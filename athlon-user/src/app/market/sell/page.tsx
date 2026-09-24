'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Store,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MarketplaceApi, SellerEligibility, MarketShop } from '@/lib/api/marketplace';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';

export default function MarketSellGatewayPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userEmail = useAuthStore((state) => state.userEmail);

  const [eligibility, setEligibility] = useState<SellerEligibility | null>(null);
  const [userShops, setUserShops] = useState<MarketShop[]>([]);
  const [selectedSellerIdentity, setSelectedSellerIdentity] = useState<'PERSONAL' | string>('PERSONAL');
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function checkEligibility() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [el, shps] = await Promise.all([
        MarketplaceApi.getSellerEligibility(),
        MarketplaceApi.getShops(),
      ]);
      setEligibility(el);
      setUserShops(shps);
      setLoading(false);
    }
    checkEligibility();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Trophy className="w-14 h-14 text-primary mx-auto opacity-80" />
        <h1 className="text-xl font-black text-foreground">Sell on ATHLON Market</h1>
        <p className="text-xs text-foreground/60 leading-relaxed">
          Log in with your ATHLON account to check your tournament eligibility or sell with your sports shop.
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

  if (loading || !eligibility) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-4">
        <div className="h-48 rounded-3xl bg-card animate-pulse border border-white/5" />
      </div>
    );
  }

  const isEligible = eligibility.eligible;
  const count = eligibility.eligibleTournamentCount;
  const required = eligibility.requiredTournamentCount;

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-card text-foreground/70"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-foreground">
          Sell Sports Equipment
        </h1>
      </div>

      {/* ─── Seller Identity Selector (If user owns a shop) ─── */}
      {userShops.length > 0 && (
        <div className="rounded-3xl border p-5 bg-card space-y-3" style={{ borderColor: 'var(--athlon-border)' }}>
          <label className="text-xs font-black uppercase tracking-wider text-foreground/60 block">
            Select Seller Identity
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Personal Seller */}
            <button
              type="button"
              onClick={() => setSelectedSellerIdentity('PERSONAL')}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                selectedSellerIdentity === 'PERSONAL'
                  ? 'border-primary bg-surface shadow-md'
                  : 'border-white/10 hover:border-white/25 bg-card'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-xs font-black text-foreground block truncate">Personal Seller</span>
                <span className="text-[10px] text-foreground/50">Used personal gear</span>
              </div>
            </button>

            {/* Sports Shop */}
            {userShops.map((shop) => (
              <button
                key={shop.id}
                type="button"
                onClick={() => setSelectedSellerIdentity(shop.id)}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  selectedSellerIdentity === shop.id
                    ? 'border-primary bg-surface shadow-md'
                    : 'border-white/10 hover:border-white/25 bg-card'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <span className="text-xs font-black text-foreground block truncate">{shop.name}</span>
                  <span className="text-[10px] text-foreground/50">Commercial inventory</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Eligibility Status Card ─── */}
      {isEligible ? (
        <div
          className="rounded-3xl border p-6 space-y-5 relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 42, 28, 0.9) 0%, rgba(6, 18, 12, 0.95) 100%)',
            borderColor: 'var(--athlon-border, rgba(34, 197, 94, 0.3))',
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Verified Seller Status
              </span>
              <h2 className="text-lg font-black text-white">
                You're Eligible to Sell
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Selling Mode:</span>
              <span className="font-bold text-white uppercase">{eligibility.sellerMode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Distinct Tournaments Completed:</span>
              <span className="font-black text-emerald-400">{count} / {required}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Commission Rate:</span>
              <span className="font-bold text-white">{eligibility.commissionRate}% upon sale</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Active Listing Limit:</span>
              <span className="font-bold text-white">{eligibility.listingLimit} Items</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Verified Tournament Evidence
            </span>
            <div className="space-y-1.5">
              {eligibility.recentTournaments.map((t, idx) => (
                <div
                  key={t.id}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-white truncate max-w-xs">{t.name}</span>
                  </div>
                  <span className="text-[10px] text-white/40">{t.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/market/sell/new?sellerIdentity=${selectedSellerIdentity}`}
              className="w-full py-3.5 rounded-2xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--athlon-primary, #22C55E)',
                color: 'var(--athlon-primary-foreground, #000)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Not Eligible Yet - Shows Progress and Seller Plan alternative */
        <div
          className="rounded-3xl border p-6 bg-card space-y-5"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground">
                Sell on ATHLON Market
              </h2>
              <p className="text-xs text-foreground/60">
                Complete 3 eligible ATHLON tournaments to sell personal sports gear without any upfront subscription.
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Your Progress</span>
              <span className="font-black text-primary">{count} / {required}</span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(count / required) * 100}%` }}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              {[1, 2, 3].map((step) => {
                const isDone = count >= step;
                return (
                  <div key={step} className="flex items-center gap-2 text-xs text-foreground/70">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-foreground/30 shrink-0" />
                    )}
                    <span>Tournament {step} {isDone ? '(Verified)' : '(Pending participation)'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Bypass Alternative */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <p className="text-xs text-foreground/60">
              Want to start selling right away without tournament requirements?
            </p>
            <Link
              href="/subscription?plan=MARKETPLACE_SELLER"
              className="w-full py-3 rounded-2xl text-xs font-black border border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Get ATHLON Seller Subscription</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
