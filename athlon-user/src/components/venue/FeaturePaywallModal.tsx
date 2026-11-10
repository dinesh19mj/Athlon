'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  X,
  Crown,
  ShieldAlert,
  Loader2,
  Percent,
} from 'lucide-react';
import { useVenueEntitlementsStore } from '@/store/useVenueEntitlementsStore';
import { SubscriptionService } from '@/lib/api/subscription';

interface FeaturePaywallModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  orgId?: string;
  featureName?: string;
  featureDescription?: string;
  requiredPlan?: string;
  currentPlan?: string;
  isQuotaLimit?: boolean;
  limitInfo?: {
    label: string;
    current: number;
    max: number;
  };
}

export function FeaturePaywallModal(props: FeaturePaywallModalProps = {}) {
  const router = useRouter();
  const {
    paywall,
    closePaywall,
    entitlementsByOrg,
    plans,
    refreshEntitlements,
  } = useVenueEntitlementsStore();
  const [upgrading, setUpgrading] = useState(false);

  // Support both global store-driven mode and legacy prop-driven mode
  const isGlobalOpen = paywall.isOpen && !props.isOpen;
  const isOpen = Boolean(props.isOpen || paywall.isOpen);
  const targetOrgId = props.orgId || paywall.orgId;

  if (!isOpen || !targetOrgId) return null;

  const ent = entitlementsByOrg[targetOrgId];
  const isQuota = isGlobalOpen ? Boolean(paywall.isQuotaLimit) : Boolean(props.isQuotaLimit);

  const currentPlanName = ent?.planName || props.currentPlan || 'Venue Free';
  const currentCommission = ent?.marketplaceCommissionRate ?? 8.0;

  // Resolve recommended plan dynamically from DB catalog
  const recommended =
    (isGlobalOpen && paywall.recommendedPlan) ||
    plans.find(
      (p) =>
        props.requiredPlan &&
        (p.name.toLowerCase().includes(props.requiredPlan.toLowerCase()) ||
          p.planCode.toLowerCase().includes(props.requiredPlan.toLowerCase()))
    ) ||
    plans.find((p) => (p.monthlyPrice ?? 0) > 0 && p.planCode !== ent?.planCode) ||
    plans[2] ||
    plans[1] ||
    null;

  const recommendedPlanName = recommended?.name || props.requiredPlan || 'Venue Professional';
  const titleText = isGlobalOpen
    ? paywall.title
    : isQuota
    ? `${props.limitInfo?.label || 'Resource'} Cap Reached`
    : props.featureName || 'Premium Venue Feature';

  const currentUsage = isGlobalOpen ? paywall.currentUsage ?? 0 : props.limitInfo?.current ?? 0;
  const maxAllowed = isGlobalOpen ? paywall.maxAllowed ?? 1 : props.limitInfo?.max ?? 1;
  const limitLabel = isGlobalOpen ? paywall.limitLabel || 'Items' : props.limitInfo?.label || 'Items';

  const descriptionText = isGlobalOpen
    ? paywall.description
    : isQuota
    ? `Your workspace is currently on the ${currentPlanName} plan which allows up to ${maxAllowed} ${limitLabel}. You have already used ${currentUsage}.`
    : props.featureDescription ||
      `The ${titleText} suite is part of ATHLON's ${recommendedPlanName} tier, unlocking advanced operations for growing sports venues.`;

  const handleClose = () => {
    if (props.onClose) props.onClose();
    if (paywall.isOpen) closePaywall();
  };

  const handleGoToSubscription = () => {
    handleClose();
    router.push(`/org/${targetOrgId}/venue/subscription`);
  };

  const handleInstantUpgrade = async () => {
    if (!recommended) {
      handleGoToSubscription();
      return;
    }

    try {
      setUpgrading(true);
      await SubscriptionService.subscribeVenuePlan(targetOrgId, {
        planCode: recommended.planCode,
        planUuid: recommended.planUuid,
        billingCycle: 'MONTHLY',
        paymentReference: `QUICK_UPGRADE_${Date.now()}`,
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(`athlon_active_plan_${targetOrgId}`, recommended.planCode);
      }
      await refreshEntitlements(targetOrgId);
      handleClose();
    } catch (err) {
      console.error('Quick venue upgrade failed, redirecting to subscription center:', err);
      handleGoToSubscription();
    } finally {
      setUpgrading(false);
    }
  };

  // Build dynamic benefit highlights from the recommended plan
  const dynamicHighlights: string[] = [];
  if (recommended) {
    const lim = recommended.limits || {};
    const feat = recommended.features || {};
    if (lim['MAX_FACILITIES']) {
      dynamicHighlights.push(
        `Up to ${lim['MAX_FACILITIES']} Bookable Courts / Turfs & ${lim['MAX_STAFF'] || 5} Staff Accounts`
      );
    }
    if ((recommended.marketplaceCommissionRate ?? 8) < currentCommission) {
      dynamicHighlights.push(
        `Lower Marketplace Commission (from ${currentCommission}% down to ${recommended.marketplaceCommissionRate}%)`
      );
    }
    if (feat['VENUE_DYNAMIC_PRICING'] && feat['VENUE_RECURRING_BOOKINGS']) {
      dynamicHighlights.push('Peak/Weekend Dynamic Slot Pricing & Recurring Batch Reservations');
    }
    if (feat['VENUE_ADVANCED_CRM'] || feat['VENUE_MEMBERSHIPS']) {
      dynamicHighlights.push('Player CRM, VIP Tiers, Membership Passes & Prepaid Hour Wallets');
    }
    if (feat['VENUE_MULTI_BRANCH']) {
      dynamicHighlights.push(`Multi-Branch Venue Operations (up to ${lim['MAX_VENUES'] || 3} Branches)`);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0B111E] shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          {/* Icon Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              {isQuota ? <ShieldAlert className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {isQuota ? 'Capacity Limit Reached' : 'Venue Plan Entitlement'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                  Current: {currentPlanName}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">{titleText}</h3>
            </div>
          </div>

          {/* Description & Quota Bar */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
            <p className="text-sm text-white/80 leading-relaxed">{descriptionText}</p>

            {isQuota && (
              <div className="pt-1">
                <div className="flex justify-between text-xs font-mono text-white/60 mb-1.5">
                  <span>
                    Usage: {currentUsage} / {maxAllowed} {limitLabel}
                  </span>
                  <span className="text-rose-400 font-bold">100% Utilized</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Recommended Plan Card */}
          {recommended && (
            <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/25 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended Upgrade
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">{recommended.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-400">
                    ₹{(recommended.monthlyPrice || 0).toLocaleString('en-IN')}
                    <span className="text-xs font-bold text-white/50">/mo</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                    <Percent className="w-2.5 h-2.5" /> {recommended.marketplaceCommissionRate}% Commission
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-xs pt-1 border-t border-white/10">
                {dynamicHighlights.slice(0, 4).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/85">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-1 flex flex-col sm:flex-row gap-3">
            {recommended && (
              <button
                onClick={handleInstantUpgrade}
                disabled={upgrading}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating {recommended.name}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      Upgrade to {recommended.name} (₹{(recommended.monthlyPrice || 0).toLocaleString('en-IN')}/mo)
                    </span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleGoToSubscription}
              className="py-3 px-4 rounded-2xl border border-white/15 hover:bg-white/5 font-bold text-xs sm:text-sm text-white/85 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Compare Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
