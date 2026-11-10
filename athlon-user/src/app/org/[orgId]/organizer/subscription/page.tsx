'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Trophy,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  History,
  Layers,
  Users,
  Award,
  Tv,
  Coins,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  ChevronRight
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrganizerEntitlementsStore } from '@/store/useOrganizerEntitlementsStore';
import {
  OrganizerSubscriptionService,
  OrganizerCreditWallet,
  TournamentSubscriptionPlan,
  CreditTransaction
} from '@/lib/api/organizerSubscription';

export default function OrganizerSubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const orgIdParam = (params?.orgId as string) || '';
  const { organizations, getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const { refreshWallet } = useOrganizerEntitlementsStore();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<OrganizerCreditWallet | null>(null);
  const [plans, setPlans] = useState<TournamentSubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [purchasingPlanCode, setPurchasingPlanCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'history'>('packages');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const orgUuid = activeOrg?.id || orgIdParam;

  useEffect(() => {
    loadSubscriptionData();
  }, [orgUuid]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansRes, walletRes] = await Promise.all([
        OrganizerSubscriptionService.getPlans().catch(() => ({ data: [] })),
        OrganizerSubscriptionService.getWallet(orgUuid).catch(() => ({ data: null }))
      ]);

      if (plansRes.data) {
        setPlans(plansRes.data);
      }
      if (walletRes.data) {
        setWallet(walletRes.data);
        if (walletRes.data.organizationId) {
          const txRes = await OrganizerSubscriptionService.getTransactions(walletRes.data.organizationId, 0, 15).catch(() => ({ data: { content: [] } }));
          setTransactions(txRes.data?.content || []);
        }
      }
    } catch (err: any) {
      console.error('Error loading organizer subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePurchase = async (plan: TournamentSubscriptionPlan) => {
    if (!wallet?.organizationId) return;
    try {
      setPurchasingPlanCode(plan.planCode);
      setNotification(null);

      await OrganizerSubscriptionService.topupCredits({
        organizationId: wallet.organizationId,
        creditType: 'TOURNAMENT_CREDIT',
        quantity: plan.tournamentCredits || 1,
        sourceType: 'PACKAGE_PURCHASE',
        targetTierCode: plan.planCode,
        validityDays: plan.validityDays || 365,
        notes: `Purchased ${plan.name} (${plan.tournamentCredits} credits)`
      });

      setNotification({
        type: 'success',
        message: `Successfully purchased ${plan.name}! ${plan.tournamentCredits} Tournament Credits added to your wallet.`
      });

      // Refresh wallet & transactions + global entitlements store
      await Promise.all([loadSubscriptionData(), refreshWallet(orgUuid)]);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to complete credit purchase. Please try again.'
      });
    } finally {
      setPurchasingPlanCode(null);
    }
  };

  const handlePurchaseAuctionAddon = async () => {
    if (!wallet?.organizationId) return;
    try {
      setPurchasingPlanCode('AUCTION_ADDON');
      setNotification(null);

      await OrganizerSubscriptionService.topupCredits({
        organizationId: wallet.organizationId,
        creditType: 'AUCTION_ACTIVATION_CREDIT',
        quantity: 1,
        sourceType: 'TOPUP',
        validityDays: 365,
        notes: 'Purchased 1 Live Auction Activation Pass (₹499)'
      });

      setNotification({
        type: 'success',
        message: 'Successfully purchased 1 Live Auction Activation Pass! Ready to host live player bidding.'
      });

      await Promise.all([loadSubscriptionData(), refreshWallet(orgUuid)]);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to complete auction credit purchase.'
      });
    } finally {
      setPurchasingPlanCode(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ─── Top Header ────────────────────────────────────────── */}
      <header className="px-4 md:px-8 pt-6 pb-4 border-b border-border/40 bg-surface/30 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/org/${orgIdParam}/organizer`}
              className="p-2 rounded-xl bg-surface border border-border hover:border-primary/50 text-foreground/80 hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Tournament Organizer Credits
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  {wallet?.activeTierName || 'Starter'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                Subscription & Credit Wallet
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadSubscriptionData()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface border border-border hover:border-primary/50 text-foreground transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Balance</span>
            </button>
            <Link
              href={`/org/${orgIdParam}/tournaments/create`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_var(--athlon-glow)]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Host Tournament</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 pt-6 max-w-7xl mx-auto space-y-6">

        {/* ─── Notification Toast ──────────────────────────────────── */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ─── Wallet Balance Overview HUD ───────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Tournament Credits */}
          <div
            className="rounded-3xl p-5 border relative overflow-hidden group transition-all duration-300"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-20 h-20 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface border border-border text-foreground/70">
                1 Credit = 1 Published Tournament
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {wallet?.tournamentCreditsAvailable ?? 0}
            </div>
            <div className="text-xs font-bold text-foreground/70 mt-1">
              Tournament Credits Available
            </div>
            <div className="text-[11px] text-foreground/50 mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
              <span>Reserved in drafts: {wallet?.tournamentCreditsReserved ?? 0}</span>
              <span className="text-primary font-bold">Drafts cost ₹0</span>
            </div>
          </div>

          {/* Card 2: Live Auction Credits */}
          <div
            className="rounded-3xl p-5 border relative overflow-hidden group transition-all duration-300"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-20 h-20 text-amber-500" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface border border-border text-foreground/70">
                1 Credit = Full Auction Event
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {wallet?.auctionCreditsAvailable ?? 0}
            </div>
            <div className="text-xs font-bold text-foreground/70 mt-1">
              Live Auction Activations
            </div>
            <div className="text-[11px] text-foreground/50 mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
              <span>Pausing & multi-session: Free</span>
              <button
                onClick={handlePurchaseAuctionAddon}
                disabled={purchasingPlanCode === 'AUCTION_ADDON'}
                className="text-amber-500 hover:text-amber-400 font-bold underline"
              >
                + Top Up (₹499)
              </button>
            </div>
          </div>

          {/* Card 3: Active Feature Tier */}
          <div
            className="rounded-3xl p-5 border relative overflow-hidden group transition-all duration-300"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-20 h-20 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Tier
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {wallet?.activeTierName || 'Tournament Starter'}
            </div>
            <div className="text-xs font-bold text-foreground/70 mt-1">
              Limits per tournament:
            </div>
            <div className="text-[11px] text-foreground/60 mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-1.5">
              <span>Max Players: <strong>{wallet?.tierLimits?.MAX_PARTICIPANTS ?? 128}</strong></span>
              <span>Max Categories: <strong>{wallet?.tierLimits?.MAX_CATEGORIES ?? 8}</strong></span>
              <span>Courts: <strong>{wallet?.tierLimits?.MAX_COURTS ?? 5}</strong></span>
              <span>Officials: <strong>{wallet?.tierLimits?.MAX_OFFICIALS ?? 5}</strong></span>
            </div>
          </div>

        </section>

        {/* ─── Navigation Tabs ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_var(--athlon-glow)]'
                : 'text-foreground/60 hover:text-foreground bg-surface border border-border'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Credit Packages & Add-ons</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_var(--athlon-glow)]'
                : 'text-foreground/60 hover:text-foreground bg-surface border border-border'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Credit Ledger & Audit History</span>
          </button>
        </div>

        {/* ─── TAB 1: PACKAGES & ADD-ONS ────────────────────────────── */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            
            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentTier = wallet?.activeTierCode === plan.planCode;
                const isPro = plan.planCode === 'TOURNAMENT_PRO';
                const isBusiness = plan.planCode === 'TOURNAMENT_BUSINESS';

                return (
                  <div
                    key={plan.planId}
                    className={`rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                      isPro
                        ? 'border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] ring-1 ring-primary/40'
                        : 'border-border/60 hover:border-primary/30'
                    }`}
                    style={{ backgroundColor: 'var(--athlon-card)' }}
                  >
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-md">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/60">
                          {plan.planCode.replace('TOURNAMENT_', '')}
                        </span>
                        {isCurrentTier && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Current Tier
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-foreground mb-1">{plan.name}</h3>
                      <p className="text-xs text-foreground/60 mb-4 min-h-[36px]">{plan.description}</p>

                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-black text-foreground">
                          ₹{plan.packagePrice?.toLocaleString('en-IN') ?? '0'}
                        </span>
                        <span className="text-xs text-foreground/50 font-bold">
                          / {plan.tournamentCredits} Tournament Credits
                        </span>
                      </div>

                      {/* Highlights */}
                      <div className="p-3.5 rounded-2xl bg-surface border border-border/50 mb-4 space-y-2">
                        <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{plan.tournamentCredits} Tournament Publications</span>
                        </div>
                        {plan.includedAuctionCredits > 0 ? (
                          <div className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{plan.includedAuctionCredits} Free Live Auction Activations</span>
                          </div>
                        ) : isPro ? (
                          <div className="text-xs font-bold text-foreground/70 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                            <span>Live Auction Eligible (₹499/event)</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Limit Ceilings */}
                      <div className="space-y-2 mb-6 text-xs text-foreground/80">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>Max <strong>{plan.limits?.MAX_PARTICIPANTS ?? 128}</strong> participants per event</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>Up to <strong>{plan.limits?.MAX_CATEGORIES ?? 8}</strong> categories</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span><strong>{plan.limits?.MAX_COURTS ?? 5}</strong> court resources & <strong>{plan.limits?.MAX_OFFICIALS ?? 5}</strong> officials</span>
                        </div>
                        {isPro && (
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>OBS Stream Overlays & Team Championship</span>
                          </div>
                        )}
                        {isBusiness && (
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>Full Organizer ERP, Stock & Payroll</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulatePurchase(plan)}
                      disabled={purchasingPlanCode === plan.planCode}
                      className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isPro
                          ? 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-[0_0_20px_var(--athlon-glow)]'
                          : 'bg-surface border border-border hover:border-primary/50 text-foreground hover:bg-surface/80'
                      }`}
                    >
                      {purchasingPlanCode === plan.planCode ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Purchase {plan.tournamentCredits} Credits (₹{plan.packagePrice?.toLocaleString('en-IN')})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Standalone Add-on Banner */}
            <div
              className="rounded-3xl p-6 border flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                    Standalone Add-on
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ₹499 / Auction
                  </span>
                </div>
                <h4 className="text-lg font-black text-foreground">Live Auction Activation Pass</h4>
                <p className="text-xs text-foreground/60 max-w-2xl">
                  Unlocks the real-time live bidding console for 1 tournament. Includes franchise purse management, category-wise player pools, automated bids, and squad rosters. Pausing, resuming, or multi-day auction sessions for the same tournament cost 0 additional credits.
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handlePurchaseAuctionAddon}
                  disabled={purchasingPlanCode === 'AUCTION_ADDON'}
                  className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-amber-500 text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Get Auction Pass (₹499)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 2: AUDIT HISTORY & LEDGER ────────────────────────── */}
        {activeTab === 'history' && (
          <div
            className="rounded-3xl border overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="p-4 md:p-6 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Double-Entry Credit Ledger</h3>
                <p className="text-xs text-foreground/60">Immutable record of all tournament publications, activations, refunds, and grants.</p>
              </div>
              <span className="text-xs font-bold text-foreground/50">
                {transactions.length} Total Records
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center text-foreground/50 space-y-2">
                <History className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold">No credit transactions recorded yet.</p>
                <p className="text-xs">Purchasing a package or publishing a tournament will generate audit entries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/50 border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-foreground/60">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Credit Type</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {transactions.map((tx) => {
                      const isPositive = tx.amount > 0;
                      return (
                        <tr key={tx.transactionId} className="hover:bg-surface/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-foreground/70">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              tx.creditType === 'AUCTION_ACTIVATION_CREDIT'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {tx.creditType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {tx.transactionType}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className={isPositive ? 'text-emerald-400' : 'text-foreground/80'}>
                              {isPositive ? `+${tx.amount}` : tx.amount}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-foreground/60">
                            {tx.referenceId ? `${tx.referenceType || ''} (${tx.referenceId.slice(0, 8)}...)` : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-foreground/70 max-w-xs truncate">
                            {tx.notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
