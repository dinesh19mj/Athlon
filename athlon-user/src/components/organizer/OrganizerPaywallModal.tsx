'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown,
  ShieldAlert,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  X,
  Ticket,
  Gavel,
  Loader2,
  Lock,
} from 'lucide-react';
import { useOrganizerEntitlementsStore } from '@/store/useOrganizerEntitlementsStore';
import { OrganizerSubscriptionService } from '@/lib/api/organizerSubscription';

export function OrganizerPaywallModal() {
  const router = useRouter();
  const { paywall, closePaywall, walletByOrg, refreshWallet } = useOrganizerEntitlementsStore();
  const [upgrading, setUpgrading] = useState(false);

  if (!paywall.isOpen || !paywall.orgId) return null;

  const wallet = walletByOrg[paywall.orgId];
  const recommended = paywall.recommendedPlan;
  const currentPlanName = wallet?.activeTierName || 'Tournament Free';

  const handleGoToSubscription = () => {
    const targetOrgId = paywall.orgId;
    closePaywall();
    router.push(`/org/${targetOrgId}/organizer/subscription`);
  };

  const handleInstantUpgrade = async () => {
    if (!wallet) {
      handleGoToSubscription();
      return;
    }

    try {
      setUpgrading(true);
      if (paywall.isCreditExhausted && paywall.creditType === 'AUCTION_ACTIVATION_CREDIT') {
        await OrganizerSubscriptionService.topupCredits({
          organizationId: wallet.organizationId,
          creditType: 'AUCTION_ACTIVATION_CREDIT',
          quantity: 1,
          sourceType: 'ADDON_PURCHASE',
          validityDays: 365,
          notes: 'Quick Add-On: 1 Live Auction Activation Credit (₹499)',
        });
      } else if (recommended) {
        await OrganizerSubscriptionService.topupCredits({
          organizationId: wallet.organizationId,
          creditType: 'TOURNAMENT_CREDIT',
          quantity: recommended.tournamentCredits || 1,
          sourceType: 'PACKAGE_PURCHASE',
          targetTierCode: recommended.planCode,
          validityDays: recommended.validityDays || 365,
          notes: `Upgraded to ${recommended.name} Pack (${recommended.tournamentCredits} Credits)`,
        });
      } else {
        handleGoToSubscription();
        return;
      }

      await refreshWallet(paywall.orgId);
      closePaywall();
    } catch (err: any) {
      console.error('Failed to process upgrade:', err);
      handleGoToSubscription();
    } finally {
      setUpgrading(false);
    }
  };

  // Build dynamic highlights from the recommended plan's limits & features
  const dynamicHighlights: string[] = [];
  if (recommended) {
    const lim = recommended.limits || {};
    dynamicHighlights.push(
      `${recommended.tournamentCredits || lim['TOURNAMENT_CREDITS'] || 1} Tournament Publication Credit${
        (recommended.tournamentCredits || 1) > 1 ? 's' : ''
      } (${recommended.validityDays || 365} Days Validity)`
    );
    if (lim['MAX_PARTICIPANTS']) {
      dynamicHighlights.push(
        `Up to ${lim['MAX_PARTICIPANTS']} Participants & ${lim['MAX_CATEGORIES'] || 8} Categories per Tournament`
      );
    }
    if (lim['MAX_COURTS'] || lim['MAX_OFFICIALS']) {
      dynamicHighlights.push(
        `Up to ${lim['MAX_COURTS'] || 5} Courts & ${lim['MAX_OFFICIALS'] || 5} Match Officials`
      );
    }
    if (recommended.includedAuctionCredits > 0) {
      dynamicHighlights.push(`${recommended.includedAuctionCredits} Free Live Auction Activations Included`);
    } else if (lim['AUCTION_ALLOWED'] >= 1) {
      dynamicHighlights.push('Team Championships, Tie/Rubber Scoring & Live Auction Eligible');
    } else if (recommended.features?.['ONLINE_REGISTRATION']) {
      dynamicHighlights.push('Online Player Registration, Payment Verification & Live Scoring');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closePaywall}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1726] shadow-2xl text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#8C1D40] via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={closePaywall}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          {/* Header Badge & Title */}
          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-[#8C1D40]/10 dark:bg-amber-500/15 border border-[#8C1D40]/20 dark:border-amber-500/30 flex items-center justify-center text-[#8C1D40] dark:text-amber-400 shrink-0">
              {paywall.isCreditExhausted ? (
                paywall.creditType === 'AUCTION_ACTIVATION_CREDIT' ? (
                  <Gavel className="w-6 h-6" />
                ) : (
                  <Ticket className="w-6 h-6" />
                )
              ) : paywall.isQuotaLimit ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <Crown className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8C1D40]/10 text-[#8C1D40] dark:bg-amber-500/20 dark:text-amber-400 border border-[#8C1D40]/20 dark:border-amber-500/30">
                  {paywall.isCreditExhausted
                    ? 'Credit Required'
                    : paywall.isQuotaLimit
                    ? 'Plan Quota Reached'
                    : 'Plan Feature Locked'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70">
                  Current: {currentPlanName}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                {paywall.title}
              </h3>
            </div>
          </div>

          {/* Description & Usage Bar */}
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 p-4 space-y-3">
            <p className="text-sm text-slate-600 dark:text-white/80 leading-relaxed">
              {paywall.description}
            </p>

            {paywall.isQuotaLimit &&
              typeof paywall.currentUsage === 'number' &&
              typeof paywall.maxAllowed === 'number' && (
                <div className="pt-1">
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-white/60 mb-1.5">
                    <span>
                      Current {paywall.limitLabel || 'Usage'}: {paywall.currentUsage} / {paywall.maxAllowed}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-black">100% Cap Reached</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#8C1D40] to-rose-500 rounded-full w-full" />
                  </div>
                </div>
              )}
          </div>

          {/* Recommended Plan Card */}
          {recommended && (
            <div className="rounded-2xl border-2 border-[#8C1D40]/25 dark:border-amber-500/30 bg-gradient-to-br from-[#8C1D40]/[0.04] to-amber-500/[0.04] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8C1D40] dark:text-amber-400">
                    Recommended Pack
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {recommended.name}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#8C1D40] dark:text-amber-400">
                    ₹{(recommended.packagePrice || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase">
                    {recommended.tournamentCredits} Event Pack
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {dynamicHighlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-white/85 font-medium">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row gap-3">
            {wallet && (recommended || (paywall.isCreditExhausted && paywall.creditType === 'AUCTION_ACTIVATION_CREDIT')) && (
              <button
                onClick={handleInstantUpgrade}
                disabled={upgrading}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8C1D40] to-rose-600 hover:opacity-95 font-black text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg shadow-[#8C1D40]/25 transition-all disabled:opacity-60"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      {paywall.isCreditExhausted && paywall.creditType === 'AUCTION_ACTIVATION_CREDIT'
                        ? 'Buy 1 Auction Pass (₹499)'
                        : `Unlock ${recommended?.name} (₹${(recommended?.packagePrice || 0).toLocaleString('en-IN')})`}
                    </span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleGoToSubscription}
              className="py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-white/85 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Compare All Packs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

