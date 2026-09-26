'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  CheckCircle2,
  ChevronLeft,
  Store,
  User,
  ShieldCheck,
  Flame,
  ArrowRight,
  Trophy,
  Loader2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { MarketplaceApi, SubscriptionPlan, SellerEligibility } from '@/lib/api/marketplace';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';

export default function MarketSubscriptionPlansPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);

  const [activeTab, setActiveTab] = useState<'INDIVIDUAL' | 'SHOP'>('INDIVIDUAL');
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [eligibility, setEligibility] = useState<SellerEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fetchedPlans, el] = await Promise.all([
        MarketplaceApi.getSubscriptionPlans(),
        isAuthenticated ? MarketplaceApi.getSellerEligibility(userId || undefined) : null,
      ]);
      setPlans(fetchedPlans);
      if (el) setEligibility(el);
      setLoading(false);
    }
    loadData();
  }, [isAuthenticated, userId]);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setActivatingId(planId);
    try {
      await MarketplaceApi.activateSubscription(planId, userId || undefined, billingPeriod);
      setSuccessMessage(`Successfully subscribed to ${planId.replace('_', ' ')}!`);
      const refreshed = await MarketplaceApi.getSellerEligibility(userId || undefined);
      setEligibility(refreshed);
      setTimeout(() => {
        setSuccessMessage(null);
        router.push('/market/sell');
      }, 1500);
    } catch {
      alert('Could not activate subscription. Please try again.');
    } finally {
      setActivatingId(null);
    }
  };

  const visiblePlans = plans.filter((p) => p.category === activeTab);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-20 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-card text-foreground/70 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-foreground">
              Marketplace Seller Packages
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60">
              Clearance &amp; storefront plans for players, clubs, and sports shops
            </p>
          </div>
        </div>

        <Link
          href="/market/sell"
          className="px-4 py-2 rounded-xl text-xs font-black bg-surface border border-white/10 hover:border-white/25 text-foreground transition-all"
        >
          Seller Center
        </Link>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage} Redirecting to Seller Center...</span>
        </div>
      )}

      {/* ─── Type A Free Tournament Program Banner ─── */}
      <div
        className="rounded-3xl border p-6 relative overflow-hidden space-y-3"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 42, 28, 0.8) 0%, rgba(6, 18, 12, 0.9) 100%)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ₹0 Subscription Fee
                </span>
                <span className="text-[11px] font-bold text-white/60">Commission-Based (5%)</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Active Tournament Participants Sell For Free
              </h2>
              <p className="text-xs text-white/70 max-w-xl">
                Have you played in <strong>3 or more ATHLON verified tournaments</strong>? You don't need a subscription! List your personal gear with zero monthly fees (only 5% commission on sold items).
              </p>
            </div>
          </div>

          <Link
            href="/market/sell"
            className="px-5 py-3 rounded-2xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 transition-all shrink-0 text-center shadow-lg shadow-primary/20"
          >
            Check My Eligibility
          </Link>
        </div>
      </div>

      {/* ─── Controls: Category Tabs & Billing Toggle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-card border border-white/10 max-w-md w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('INDIVIDUAL')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'INDIVIDUAL'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Individual Athletes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SHOP')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SHOP'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Sports Shops &amp; Retailers</span>
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-card border border-white/10 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setBillingPeriod('MONTHLY')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              billingPeriod === 'MONTHLY'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('YEARLY')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              billingPeriod === 'YEARLY'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            <span>Yearly</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-black">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* ─── Subscription Plans Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-card animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePlans.map((plan) => {
            const price = billingPeriod === 'YEARLY' ? plan.priceYearly || plan.priceMonthly * 10 : plan.priceMonthly;
            const periodLabel = billingPeriod === 'YEARLY' ? '/year' : '/month';
            const isCurrentPlan = eligibility?.subscriptionTier === plan.id && eligibility?.hasActiveSubscription;
            const isActivating = activatingId === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between relative transition-all duration-300 hover:translate-y-[-2px] ${
                  plan.popular
                    ? 'border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-xl ring-1 ring-primary/40'
                    : 'border-white/10 bg-card hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-primary text-primary-foreground shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider block">
                      {plan.tagline || (plan.category === 'SHOP' ? 'Commercial Tier' : 'Player Pass')}
                    </span>
                    <h3 className="text-lg font-black text-foreground mt-0.5">{plan.name}</h3>
                    <p className="text-xs text-foreground/60 mt-1 min-h-[36px]">{plan.description}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-foreground">₹{price}</span>
                      <span className="text-xs text-foreground/50 font-bold">{periodLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-foreground/60">Platform Commission:</span>
                      <span className="font-black text-emerald-400">{plan.commissionPercent}% on sale</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/60">Listing Capacity:</span>
                      <span className="font-bold text-foreground">
                        {plan.maxListings === -1 ? 'Unlimited Listings' : `${plan.maxListings} Active Items`}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-bold text-foreground/70 block uppercase tracking-wider">
                      Included Privileges:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isCurrentPlan || isActivating}
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isCurrentPlan
                        ? 'bg-white/10 text-foreground/50 cursor-default'
                        : plan.popular
                        ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95'
                        : 'bg-surface hover:bg-white/10 text-foreground border border-white/10'
                    }`}
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Activating...</span>
                      </>
                    ) : isCurrentPlan ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <span>Select {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Frequently Asked Questions ─── */}
      <div className="rounded-3xl border p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
        <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-foreground/70">
          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1.5">
            <h4 className="font-bold text-foreground">How does the 3-tournament rule work?</h4>
            <p className="leading-relaxed text-foreground/60">
              When you participate in 3 official tournaments on ATHLON, your account is automatically verified to sell sports gear on a commission basis (5%) without paying any monthly subscription.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1.5">
            <h4 className="font-bold text-foreground">Can I start selling immediately without tournaments?</h4>
            <p className="leading-relaxed text-foreground/60">
              Yes! You can purchase the <strong>Athlete Seller Pass (₹199/mo)</strong> which grants instant clearance, 25 active listings, and a lower 2.5% commission rate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1.5">
            <h4 className="font-bold text-foreground">What do Sports Shop subscriptions include?</h4>
            <p className="leading-relaxed text-foreground/60">
              Pro Shop subscriptions provide your brand with a dedicated digital storefront (`/market/shop/[slug]`), verified retailer badge, unlimited listings, lowest commissions (down to 1.5%), and customer inquiry desks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1.5">
            <h4 className="font-bold text-foreground">How does Community Escrow payout work?</h4>
            <p className="leading-relaxed text-foreground/60">
              Payments made by buyers are held securely in ATHLON Escrow. Once the buyer confirms receipt and condition (or after the delivery window expires), the earnings minus the platform fee are released to your bank account.
            </p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
