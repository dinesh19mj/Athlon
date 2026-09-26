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
  Loader2,
  X,
  BadgeCheck,
  ArrowRight,
  HelpCircle,
  Tag,
  Flame,
  Check,
  Star,
  Layers,
  ShoppingBag,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { MarketplaceApi, SellerEligibility, MarketShop, SubscriptionPlan } from '@/lib/api/marketplace';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';

export default function MarketSellGatewayPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const userEmail = useAuthStore((state) => state.userEmail);

  const [eligibility, setEligibility] = useState<SellerEligibility | null>(null);
  const [userShops, setUserShops] = useState<MarketShop[]>([]);
  const [selectedSellerIdentity, setSelectedSellerIdentity] = useState<'PERSONAL' | string>('PERSONAL');
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Plan Subscription Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState<'INDIVIDUAL' | 'SHOP'>('INDIVIDUAL');
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('INDIVIDUAL_PASS');
  const [activatingPlan, setActivatingPlan] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(false);

  useEffect(() => {
    async function checkEligibility() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [el, shps] = await Promise.all([
        MarketplaceApi.getSellerEligibility(userId || undefined),
        MarketplaceApi.getShops(),
      ]);
      setEligibility(el);
      setUserShops(shps);
      setLoading(false);
    }
    checkEligibility();
  }, [isAuthenticated, userId]);

  const openPlansModal = async (initialTab: 'INDIVIDUAL' | 'SHOP' = 'INDIVIDUAL') => {
    setActivePlanTab(initialTab);
    setIsPlanModalOpen(true);
    const availablePlans = await MarketplaceApi.getSubscriptionPlans();
    setPlans(availablePlans);
    const defaultSelected = initialTab === 'INDIVIDUAL' ? 'INDIVIDUAL_PASS' : 'SHOP_PRO';
    setSelectedPlanId(defaultSelected);
  };

  const handleActivatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivatingPlan(true);
    try {
      await MarketplaceApi.activateSubscription(selectedPlanId, userId || undefined, billingPeriod);
      setPlanSuccess(true);
      const refreshed = await MarketplaceApi.getSellerEligibility(userId || undefined);
      setEligibility(refreshed);
      setTimeout(() => {
        setPlanSuccess(false);
        setIsPlanModalOpen(false);
      }, 1400);
    } catch {
      alert('Could not activate plan. Please try again.');
    } finally {
      setActivatingPlan(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-card/80 border border-white/10 backdrop-blur-2xl shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-xl ring-8 ring-primary/5">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Sell on ATHLON Market
            </h1>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
              Sign in to ATHLON to check your 3-tournament clearance or manage your official sports shop inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 text-black shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            Sign In to Continue
          </button>

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            defaultMode="login"
          />
        </div>
      </div>
    );
  }

  if (loading || !eligibility) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="h-72 rounded-3xl bg-card/60 animate-pulse border border-white/5" />
      </div>
    );
  }

  const isEligible = eligibility.eligible;
  const count = eligibility.verifiedTournamentsCount ?? eligibility.eligibleTournamentCount ?? 0;
  const required = eligibility.requiredTournamentCount || 3;
  const isShopOwner = eligibility.sellerCategory === 'SHOP' || eligibility.sellerType === 'SHOP_OWNER';
  const isIndividualSubscribed = eligibility.sellerType === 'INDIVIDUAL_SUBSCRIBED';
  const isTournamentVeteran = eligibility.sellerType === 'INDIVIDUAL_FREE' || (count >= required && !eligibility.hasActiveSubscription);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-32 space-y-6 animate-in fade-in duration-300">
      {/* ─── Top Glow & Ambient Highlights ─── */}
      <div className="relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-b from-primary/15 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ─── Hero Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-card/60 hover:bg-card border border-white/10 text-foreground/80 hover:text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary">
                  Seller Gateway
                </span>
                <span className="text-[10px] text-foreground/40 font-bold">Equipment &amp; Retail</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-0.5">
                Marketplace Seller Center
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openPlansModal('INDIVIDUAL')}
            className="self-start sm:self-auto px-4 py-2 rounded-2xl text-xs font-black border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-primary/10 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Passes &amp; Plans</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* ─── Section 1: Choose Seller Identity (Personal Athlete vs Verified Shops) ─── */}
      <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
              Step 1
            </span>
            <h2 className="text-sm sm:text-base font-black text-foreground">
              Select Seller Identity
            </h2>
          </div>
          <span className="text-[11px] text-foreground/50">
            {userShops.length > 0 ? `${userShops.length + 1} Profiles Available` : 'Personal Account'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card: Personal Athlete */}
          <div
            onClick={() => setSelectedSellerIdentity('PERSONAL')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
              selectedSellerIdentity === 'PERSONAL'
                ? 'border-primary/60 bg-gradient-to-br from-primary/15 via-card/80 to-card shadow-lg ring-2 ring-primary/30'
                : 'border-white/10 bg-surface/40 hover:border-white/20 hover:bg-surface/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                    selectedSellerIdentity === 'PERSONAL'
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'bg-white/5 border-white/10 text-foreground/60'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-foreground block">
                      {userEmail ? userEmail.split('@')[0] : 'Personal Athlete'}
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                      Player
                    </span>
                  </div>
                  <span className="text-[11px] text-foreground/50 block">Used &amp; personal sports gear</span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  selectedSellerIdentity === 'PERSONAL'
                    ? 'border-primary bg-primary text-black'
                    : 'border-white/20 bg-black/40'
                }`}
              >
                {selectedSellerIdentity === 'PERSONAL' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 text-foreground/70">
              <span>Platform Fee:</span>
              <span className="font-bold text-emerald-400">
                {eligibility.commissionRatePercent ?? eligibility.commissionRate ?? 5.0}% per sale
              </span>
            </div>
          </div>

          {/* Cards: User's Commercial Shops */}
          {userShops.map((shop) => {
            const isSelected = selectedSellerIdentity === shop.id;
            return (
              <div
                key={shop.id}
                onClick={() => setSelectedSellerIdentity(shop.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-blue-500/60 bg-gradient-to-br from-blue-500/15 via-card/80 to-card shadow-lg ring-2 ring-blue-500/30'
                    : 'border-white/10 bg-surface/40 hover:border-white/20 hover:bg-surface/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          : 'bg-white/5 border-white/10 text-foreground/60'
                      }`}
                    >
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-foreground truncate block">
                          {shop.name}
                        </span>
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </div>
                      <span className="text-[11px] text-foreground/50 block truncate">
                        Commercial Storefront
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-white/20 bg-black/40'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 text-foreground/70">
                  <span>Store Tier:</span>
                  <span className="font-bold text-blue-400">Verified Retailer (2% Fee)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Section 2: Seller Clearance & Benefits Showcase ─── */}
      {isEligible ? (
        /* Eligible State: Luminous Clearance Card */
        <div
          className="rounded-3xl border p-6 space-y-5 relative overflow-hidden shadow-2xl"
          style={{
            background: isShopOwner
              ? 'linear-gradient(135deg, rgba(16, 28, 55, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(12, 38, 25, 0.95) 0%, rgba(6, 18, 12, 0.98) 100%)',
            borderColor: isShopOwner ? 'rgba(59, 130, 246, 0.4)' : 'rgba(34, 197, 94, 0.4)',
          }}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute top-0 right-0 w-52 h-52 rounded-full blur-3xl pointer-events-none ${
              isShopOwner ? 'bg-blue-500/15' : 'bg-emerald-500/15'
            }`}
          />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
                  isShopOwner
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {isShopOwner ? <Store className="w-7 h-7" /> : <BadgeCheck className="w-7 h-7" />}
              </div>
              <div className="space-y-0.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider block ${
                    isShopOwner ? 'text-blue-400' : 'text-emerald-400'
                  }`}
                >
                  {isShopOwner
                    ? 'Verified Storefront License Active'
                    : isIndividualSubscribed
                    ? 'Athlete Seller Pass (Subscribed)'
                    : 'Tournament Veteran (₹0 Subscription)'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Selling Privileges Fully Active
                </h2>
                <p className="text-xs text-white/60">
                  {isShopOwner
                    ? 'Manage your store inventory with priority search visibility and verified retailer trust.'
                    : 'You have full authorization to list and sell sports equipment across India.'}
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-black bg-white/10 text-white border border-white/15 shrink-0">
              CLEARANCE VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase block">Seller Mode</span>
              <span className="text-xs sm:text-sm font-black text-white block truncate">
                {isShopOwner ? 'Pro Merchant' : isIndividualSubscribed ? 'Athlete Pass' : 'Tournament Free'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase block">Platform Fee</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 block">
                {eligibility.commissionRatePercent ?? eligibility.commissionRate ?? 5.0}% per sale
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase block">Listing Limit</span>
              <span className="text-xs sm:text-sm font-black text-white block">
                {eligibility.maxActiveListings === -1 ? 'Unlimited' : `${eligibility.maxActiveListings ?? 5} Items`}
              </span>
            </div>
          </div>

          {/* Tournament evidence pill */}
          {count > 0 && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">Verified Tournament History</span>
              </div>
              <span className="font-black text-emerald-400">{count} Tournaments on Record</span>
            </div>
          )}
        </div>
      ) : (
        /* Not Eligible Yet - Dual Gateway Paths */
        <div className="space-y-4">
          {/* Path 1: 3 Tournaments Free Selling Card */}
          <div
            className="rounded-3xl border p-6 space-y-5 relative overflow-hidden bg-card/70 backdrop-blur-xl"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ₹0 Subscription
                    </span>
                    <span className="text-[10px] font-bold text-foreground/50">Commission Basis (5%)</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-foreground mt-1">
                    Free Selling for Tournament Players
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-xs text-foreground/60 leading-relaxed">
              ATHLON rewards competitive athletes! Once you compete in <strong>3 official tournaments</strong>, you can list your sports equipment completely free with zero monthly fees (only 5% commission on successful sales).
            </p>

            {/* Visual Step Progress Tracker */}
            <div className="p-4 rounded-2xl bg-surface/60 border border-white/5 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span>Tournament Participation</span>
                </span>
                <span className="font-black text-primary text-sm">
                  {count} <span className="text-foreground/40 font-bold text-xs">/ {required} Completed</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-black/40 border border-white/5 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.max(8, Math.min(100, (count / required) * 100))}%` }}
                />
              </div>

              {/* 3 Step Indicators */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3].map((step) => {
                  const isDone = count >= step;
                  return (
                    <div
                      key={step}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isDone
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-sm'
                          : 'border-white/5 bg-surface/30 text-foreground/40'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-foreground/30" />
                        )}
                      </div>
                      <span className="text-[11px] font-black block">Tournament {step}</span>
                      <span className="text-[9px] block opacity-70">
                        {isDone ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Path 2: Instant Subscription Fast-Pass Showcase */}
          <div
            className="rounded-3xl border border-white/10 p-6 bg-gradient-to-br from-primary/10 via-card to-card backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-md">
                <Zap className="w-5 h-5 fill-primary text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground">
                  Want to Start Selling Immediately?
                </h3>
                <p className="text-xs text-foreground/60">
                  Unlock instant listing clearance or establish your authorized sports shop storefront
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Individual Athlete Pass Option */}
              <button
                type="button"
                onClick={() => openPlansModal('INDIVIDUAL')}
                className="p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-left transition-all space-y-2 cursor-pointer group hover:border-primary/50 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground">Athlete Seller Pass</span>
                  <span className="text-xs font-black text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    ₹199/mo
                  </span>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  0 tournaments needed. Instant clearance, 2.5% low commission &amp; up to 25 items.
                </p>
                <span className="text-[11px] font-black text-primary flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-1">
                  Get Athlete Pass <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Shop Owner Option */}
              <button
                type="button"
                onClick={() => openPlansModal('SHOP')}
                className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-all space-y-2 cursor-pointer group hover:border-blue-500/50 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground">Sports Shop &amp; Pro Store</span>
                  <span className="text-xs font-black text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10">
                    From ₹599/mo
                  </span>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  Dedicated store URL, unlimited items, verified retailer badge &amp; down to 1.5% fee.
                </p>
                <span className="text-[11px] font-black text-blue-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-1">
                  Explore Shop Plans <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating / Fixed Bottom Action Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 border-t border-white/10 bg-background/90 backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-foreground/50 block">Selected Identity</span>
            <span className="text-xs font-black text-foreground">
              {selectedSellerIdentity === 'PERSONAL'
                ? 'Personal Athlete Seller'
                : userShops.find((s) => s.id === selectedSellerIdentity)?.name || 'Sports Shop'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isEligible ? (
              <Link
                href={`/market/sell/new?sellerIdentity=${selectedSellerIdentity}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 text-black hover:opacity-95 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Create Product Listing</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openPlansModal('INDIVIDUAL')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 text-black hover:opacity-95 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Unlock Instant Seller Pass</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Subscription & Passes Interactive Modal ─── */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-white/10 bg-card space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                  ATHLON Market Passes
                </span>
                <h3 className="text-lg font-black text-foreground">
                  Select Your Selling Package
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {planSuccess ? (
              <div className="p-8 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-foreground">Package Activated!</h4>
                <p className="text-xs text-foreground/70 max-w-xs mx-auto">
                  Your seller privileges are now active. Preparing your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleActivatePlan} className="space-y-5">
                {/* Category Selector Tabs */}
                <div className="flex p-1 rounded-2xl bg-surface border border-white/10 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePlanTab('INDIVIDUAL');
                      setSelectedPlanId('INDIVIDUAL_PASS');
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePlanTab === 'INDIVIDUAL'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Individual Athletes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePlanTab('SHOP');
                      setSelectedPlanId('SHOP_PRO');
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePlanTab === 'SHOP'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Sports Shops &amp; Retailers</span>
                  </button>
                </div>

                {/* Billing Period Toggle */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-foreground/70">Billing Cycle</span>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('MONTHLY')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        billingPeriod === 'MONTHLY'
                          ? 'bg-foreground/15 text-foreground'
                          : 'text-foreground/40 hover:text-foreground/70'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('YEARLY')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        billingPeriod === 'YEARLY'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-foreground/40 hover:text-foreground/70'
                      }`}
                    >
                      <span>Yearly</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-black">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plans List */}
                <div className="space-y-3">
                  {plans
                    .filter((p) => p.category === activePlanTab)
                    .map((p) => {
                      const isSelected = selectedPlanId === p.id;
                      const price = billingPeriod === 'YEARLY' ? p.priceYearly || p.priceMonthly * 10 : p.priceMonthly;
                      const periodLabel = billingPeriod === 'YEARLY' ? '/year' : '/month';

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlanId(p.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary/40'
                              : 'border-white/10 bg-surface/50 hover:border-white/20'
                          }`}
                        >
                          {p.popular && (
                            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-black bg-primary text-primary-foreground shadow-md flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5" />
                              <span>POPULAR</span>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-foreground block">{p.name}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-foreground/70">
                                  {p.commissionPercent}% fee
                                </span>
                              </div>
                              <span className="text-[11px] text-foreground/60 block">{p.description}</span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-base font-black text-primary">₹{price}</span>
                              <span className="text-[10px] text-foreground/40 block">{periodLabel}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-white/5">
                            {p.features?.map((f: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-foreground/80 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl border border-white/10 text-xs font-bold text-foreground/70 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={activatingPlan}
                    className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {activatingPlan ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <span>Activate &amp; Start Selling</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
