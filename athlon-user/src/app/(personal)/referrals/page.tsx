'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Gift,
  Copy,
  Check,
  Share2,
  Trophy,
  Users,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Clock,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Flame,
  MessageCircle,
} from 'lucide-react';
import { RewardsService, UserWallet, CreditTransaction, UserReferral, CreditRule } from '@/lib/api/rewards';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function ReferralsAndRewardsPage() {
  const router = useRouter();
  const { userEmail, userId, userUuid } = useAuthStore();

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [referrals, setReferrals] = useState<UserReferral[]>([]);
  const [rules, setRules] = useState<CreditRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'rules' | 'referrals' | 'history' | 'apply'>('rules');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState('');

  // Apply referral form
  const [applyCode, setApplyCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    loadData();
  }, [userUuid, userId]);

  const getReferralUrl = () => {
    if (origin && wallet?.referralCode) return `${origin}/register?ref=${wallet.referralCode}`;
    if (wallet?.referralLink) return wallet.referralLink;
    if (wallet?.referralCode) return `/register?ref=${wallet.referralCode}`;
    return '';
  };

  const loadData = async () => {
    setIsLoading(true);
    const targetUuid = userUuid || (userId && /^[0-9a-fA-F-]{36}$/.test(String(userId)) ? String(userId) : undefined);
    try {
      const [walletRes, txRes, refRes, rulesRes] = await Promise.allSettled([
        RewardsService.getWallet(targetUuid),
        RewardsService.getTransactions(0, 20, targetUuid),
        RewardsService.getReferrals(0, 20, targetUuid),
        RewardsService.getActiveRules(),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.success && walletRes.value.data) {
        setWallet(walletRes.value.data);
      }
      if (txRes.status === 'fulfilled' && txRes.value?.success && txRes.value.data?.content) {
        setTransactions(txRes.value.data.content);
      }
      if (refRes.status === 'fulfilled' && refRes.value?.success && refRes.value.data?.content) {
        setReferrals(refRes.value.data.content);
      }
      if (rulesRes.status === 'fulfilled' && rulesRes.value?.success && Array.isArray(rulesRes.value.data)) {
        setRules(rulesRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load rewards data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!wallet?.referralCode) return;
    navigator.clipboard.writeText(wallet.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = getReferralUrl();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    const code = wallet?.referralCode || '';
    const link = getReferralUrl();
    const shareText = `Join me on Athlon Sports! Use my referral code ${code} to claim welcome reward credits for tournaments: ${link}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Athlon Sports Referral',
          text: shareText,
          url: link,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const code = wallet?.referralCode || '';
    const link = getReferralUrl();
    const shareText = encodeURIComponent(
      `Join me on Athlon Sports! Use my referral code *${code}* to claim welcome reward credits: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyCode.trim()) return;
    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    const targetUuid = userUuid || (userId && /^[0-9a-fA-F-]{36}$/.test(String(userId)) ? String(userId) : undefined);
    try {
      const res = await RewardsService.applyReferral(applyCode.trim(), targetUuid);
      if (res.success) {
        setApplySuccess('Referral code applied successfully! Welcome bonus credits have been credited to your wallet.');
        setApplyCode('');
        setWallet(res.data);
        loadData();
      } else {
        setApplyError(res.message || 'Failed to apply referral code');
      }
    } catch (err: any) {
      setApplyError(err.data?.message || err.message || 'Failed to apply referral code');
    } finally {
      setIsApplying(false);
    }
  };

  // Dynamic Rule helpers
  const getRule = (key: string, defaultAmount: number) => {
    const r = rules.find((item) => item.ruleKey === key);
    return r?.creditAmount ?? defaultAmount;
  };

  const referrerBonus = getRule('REFERRAL_SIGNUP_REFERRER', 50);
  const refereeBonus = getRule('REFERRAL_SIGNUP_REFEREE', 25);
  const organizerBonus = getRule('TOURNAMENT_CONDUCTED_ORGANIZER', 100);
  const playerBonus = getRule('TOURNAMENT_PARTICIPATION_PLAYER', 20);
  const organizerSubCost = getRule('ORGANIZER_SUBSCRIPTION_CREDIT_COST', 500);

  const progressPercent = Math.min(100, Math.round(((wallet?.balance ?? 0) / organizerSubCost) * 100));

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW (< 640px) - STYLISH, APP-NATIVE REWARDS EXPERIENCE         */}
      {/* ========================================================================= */}
      <div className="block sm:hidden">
        {/* ── Mobile Top Sticky Bar ────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface border border-foreground/10 flex items-center justify-center text-foreground/80 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 font-black text-sm tracking-tight">
            <Gift className="w-4 h-4 text-primary" />
            <span>Athlon Rewards</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-black text-xs shadow-xs">
            <Coins className="w-3.5 h-3.5 animate-pulse" />
            <span>{wallet?.balance ?? 0}</span>
          </div>
        </header>

        {/* ── Mobile Content Wrapper ──────────────────────────────────────── */}
        <div className="px-4 py-4 space-y-5">

          {/* ── 1. Athletic Digital Rewards Pass Card (Theme Responsive) ──── */}
          <div
            className="relative overflow-hidden rounded-3xl p-5 bg-card border shadow-sm space-y-4"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Subtle Brand Accent Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

            {/* Card Top Row */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shadow-xs">
                  ⚡
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/50">ATHLON USER</div>
                  <div className="text-xs font-black text-foreground">Rewards</div>
                </div>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 flex items-center gap-1.5 text-primary text-[10px] font-black tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>Active</span>
              </div>
            </div>

            {/* Main Balance Display */}
            <div className="relative z-10 pt-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/50">AVAILABLE CREDITS</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl font-black tracking-tight text-foreground font-mono">
                  {wallet?.balance ?? 0}
                </span>
                <span className="text-sm font-black text-primary uppercase tracking-wider">PTS</span>
              </div>
            </div>

            {/* Organizer Goal Progress Bar */}
            <div className="relative z-10 p-3 rounded-2xl bg-surface border border-foreground/10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-foreground/80 font-bold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  <span>Organizer Free Pass</span>
                </span>
                <span className="font-mono font-black text-foreground">
                  {wallet?.balance ?? 0}/{organizerSubCost} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[9.5px] text-foreground/50 font-medium flex justify-between">
                <span>{progressPercent}% unlocked</span>
                <span>{Math.max(0, organizerSubCost - (wallet?.balance ?? 0))} pts left for free tier</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-foreground/10">
              <div className="text-center">
                <span className="text-[9px] font-bold text-foreground/50 uppercase block">Total Earned</span>
                <span className="text-xs font-black text-emerald-500">+{wallet?.totalEarned ?? 0}</span>
              </div>
              <div className="text-center border-x border-foreground/10">
                <span className="text-[9px] font-bold text-foreground/50 uppercase block">Redeemed</span>
                <span className="text-xs font-black text-foreground/70">-{wallet?.totalSpent ?? 0}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold text-foreground/50 uppercase block">Invited</span>
                <span className="text-xs font-black text-primary">{wallet?.totalReferralsCount ?? 0} Friends</span>
              </div>
            </div>
          </div>

          {/* ── 2. High-Converting Mobile Referral Voucher Card ────────────── */}
          <div className="rounded-3xl p-4.5 bg-card border border-foreground/10 shadow-sm space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                  <Sparkles className="w-3 h-3" />
                  <span>Invite &amp; Earn Together</span>
                </div>
                <h2 className="text-base font-black text-foreground">Your Referral Code</h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  +{referrerBonus} Pts Each
                </span>
              </div>
            </div>

            {/* Referral Code Ticket Box */}
            <div className="relative p-3.5 rounded-2xl bg-surface border-2 border-dashed border-primary/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground/40 block">Tap to copy code</span>
                <span className="text-lg font-black text-foreground font-mono tracking-widest block truncate">
                  {wallet?.referralCode || 'LOADING...'}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${copiedCode
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-primary text-black hover:opacity-90'
                  }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>

            {/* One-Tap Share Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 px-3 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Link</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-foreground/50 pt-1 px-1">
              <span>🎁 Friend gets <strong>+{refereeBonus} pts</strong> signup bonus</span>
              <button onClick={handleCopyLink} className="text-primary font-bold hover:underline">
                {copiedLink ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* ── 3. Mobile Segmented Tab Bar ───────────────────────────────── */}
          <div className="grid grid-cols-4 p-1 bg-surface border border-foreground/10 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'rules'
                ? 'bg-primary text-black shadow-xs font-black'
                : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Earn</span>
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 relative ${activeTab === 'referrals'
                ? 'bg-primary text-black shadow-xs font-black'
                : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invites</span>
              {referrals.length > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'history'
                ? 'bg-primary text-black shadow-xs font-black'
                : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'apply'
                ? 'bg-primary text-black shadow-xs font-black'
                : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Redeem</span>
            </button>
          </div>

          {/* ── 4. Mobile Tab Content Panels ───────────────────────────────── */}

          {/* TAB 1: HOW TO EARN */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              {/* Earning Card: Referrals */}
              <div className="p-4 rounded-2xl bg-card border border-foreground/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">Invite Athletes</h4>
                      <span className="text-[10px] text-foreground/50">Upon friend's signup</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{referrerBonus} Pts
                  </span>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  Earn {referrerBonus} credits directly into your wallet whenever someone registers using your code.
                </p>
              </div>

              {/* Earning Card: Tournament Conduction */}
              <div className="p-4 rounded-2xl bg-card border border-foreground/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">Host Tournaments</h4>
                      <span className="text-[10px] text-foreground/50">For verified organizers</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{organizerBonus} Pts
                  </span>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  Get awarded {organizerBonus} credits for organizing, managing, and concluding tournaments.
                </p>
              </div>

              {/* Earning Card: Tournament Participation */}
              <div className="p-4 rounded-2xl bg-card border border-foreground/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">Play &amp; Compete</h4>
                      <span className="text-[10px] text-foreground/50">Match participation</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{playerBonus} Pts
                  </span>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  Earn {playerBonus} credits for entering and competing in tournament draws.
                </p>
              </div>

              {/* Mobile Subscription Perk Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-card border border-primary/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Free Tournament Organizer Pass</span>
                </div>
                <p className="text-[11px] text-foreground/70 leading-relaxed">
                  Reach <strong>{organizerSubCost} credits</strong> to activate the Tournament Organizer subscription and host tournaments without platform fees!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MY REFERRALS */}
          {activeTab === 'referrals' && (
            <div className="p-4 rounded-2xl bg-card border border-foreground/10 space-y-3">
              <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                  Invited Friends ({referrals.length})
                </h3>
                <span className="text-[10px] font-bold text-foreground/50">Live status</span>
              </div>

              {referrals.length === 0 ? (
                <div className="py-8 text-center space-y-2.5">
                  <Users className="w-8 h-8 text-foreground/25 mx-auto" />
                  <div className="text-xs font-black text-foreground">No Invites Yet</div>
                  <p className="text-[11px] text-foreground/50 max-w-xs mx-auto">
                    Share your code with other sports enthusiasts and start stacking credits!
                  </p>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Invite</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-foreground/5">
                  {referrals.map((ref) => (
                    <div key={ref.referralUuid} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {ref.refereeName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground truncate">{ref.refereeName}</div>
                          <div className="text-[9.5px] text-foreground/50 truncate">
                            {new Date(ref.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400">+{ref.creditsAwarded} Pts</span>
                        <div className="text-[9px] font-bold text-foreground/40 uppercase">{ref.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEDGER */}
          {activeTab === 'history' && (
            <div className="p-4 rounded-2xl bg-card border border-foreground/10 space-y-3">
              <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                  Transaction Ledger
                </h3>
                <span className="text-[10px] font-bold text-foreground/50">Audit log</span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Clock className="w-8 h-8 text-foreground/25 mx-auto" />
                  <div className="text-xs font-black text-foreground">No History</div>
                  <p className="text-[11px] text-foreground/50">Transactions will be recorded here.</p>
                </div>
              ) : (
                <div className="divide-y divide-foreground/5">
                  {transactions.map((tx) => {
                    const isCredit = tx.transactionType === 'CREDIT';
                    return (
                      <div key={tx.transactionUuid} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}
                          >
                            {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{tx.description}</div>
                            <div className="text-[9px] text-foreground/50">
                              {new Date(tx.createdAt).toLocaleDateString()} · Bal: {tx.balanceAfter} pts
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCredit ? `+${tx.amount}` : `-${tx.amount}`} pts
                          </span>
                          <div className="text-[8.5px] font-bold text-foreground/40 uppercase">{tx.sourceType}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REDEEM / APPLY CODE */}
          {activeTab === 'apply' && (
            <div className="p-4 rounded-2xl bg-card border border-foreground/10 space-y-3.5">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-foreground">Redeem Invite Code</h3>
                <p className="text-[11px] text-foreground/60">
                  Got a code from a friend? Enter it here to claim your <strong className="text-emerald-400 font-bold">+{refereeBonus} credits</strong> bonus.
                </p>
              </div>

              {applySuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{applySuccess}</span>
                </div>
              )}

              {applyError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              <form onSubmit={handleApplyReferral} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="ENTER REFERRAL CODE"
                    value={applyCode}
                    onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-3 rounded-xl border text-sm font-mono font-black tracking-widest uppercase focus:outline-none focus:border-primary transition-all bg-surface placeholder:text-foreground/30 text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isApplying || !applyCode.trim()}
                  className="w-full py-3 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isApplying ? (
                    <span>Applying Code...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Claim +{refereeBonus} Welcome Bonus</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP VIEW (sm: >= 640px) - COMPLETELY UNTOUCHED AND PRESERVED       */}
      {/* ========================================================================= */}
      <div className="hidden sm:block">
        {/* ── TOP HEADER BAR ── */}
        <header className="border-b bg-card/85 backdrop-blur-md sticky top-0 z-30 shadow-xs" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground/75 hover:text-foreground hover:bg-foreground/5 transition-all py-2 px-3 rounded-xl border border-foreground/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Balance Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground/60">Current Balance:</span>
              <div className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 flex items-center gap-1.5 text-primary font-black text-xs shadow-xs">
                <Coins className="w-3.5 h-3.5 animate-pulse" />
                <span>{wallet?.balance ?? 0} Credits</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
        <section className="border-b bg-card" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                <Gift className="w-3.5 h-3.5" />
                <span>Athlon Rewards &amp; Credits</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                Referrals &amp; Rewards
              </h1>
              <p className="text-sm text-foreground/65 leading-relaxed font-normal">
                Earn credits by inviting friends and conducting tournaments. Redeem credits to activate the Tournament Organizer subscription to host free tournaments.
              </p>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-6">

          {/* ── WALLET & STATS GRID ────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Main Balance Card */}
            <div
              className="p-6 rounded-3xl border bg-card relative overflow-hidden shadow-sm md:col-span-2 flex flex-col justify-between"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {/* Top Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-foreground/50">
                    Available Balance
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span>Active Wallet</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-5xl font-black text-foreground tracking-tight">
                    {wallet?.balance ?? 0}
                  </span>
                  <span className="text-lg font-bold text-foreground/50">Credits</span>
                </div>
              </div>

              {/* 3 Metric Chips */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-foreground/5 mt-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Earned</span>
                  <span className="text-sm font-black text-emerald-400">+{wallet?.totalEarned ?? 0}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Redeemed</span>
                  <span className="text-sm font-black text-foreground/70">-{wallet?.totalSpent ?? 0}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Invited</span>
                  <span className="text-sm font-black text-primary">{wallet?.totalReferralsCount ?? 0} Athletes</span>
                </div>
              </div>
            </div>

            {/* Free Tournament Perk Card */}
            <div
              className="p-6 rounded-3xl border bg-surface flex flex-col justify-between shadow-sm"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground">Organizer Subscription</h3>
                <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                  Redeem <strong>{organizerSubCost} credits</strong> to activate the Tournament Organizer package and host free tournaments with 0 platform charges.
                </p>
              </div>

              <div className="pt-4 border-t border-foreground/5 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/50 font-bold">Progress:</span>
                  <span className="font-black text-foreground">
                    {wallet?.balance ?? 0} / {organizerSubCost} pts
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── REFERRAL SHARING CARD ─────────────────────────────────────── */}
          <div
            className="p-7 rounded-3xl border bg-card shadow-sm space-y-4"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-lg font-black text-foreground">Your Exclusive Referral Code</h3>
                </div>
                <p className="text-xs text-foreground/65">
                  Share with fellow players. You earn <strong className="text-primary font-black">+{referrerBonus} credits</strong> for each friend, and they get <strong className="text-emerald-400 font-black">+{refereeBonus} credits</strong>!
                </p>
              </div>

              {/* Desktop Share Button */}
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Invite</span>
              </button>
            </div>

            {/* Referral Code & Share Link Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">

              {/* Referral Code Box */}
              <div className="p-3.5 rounded-2xl bg-surface border border-foreground/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">Referral Code</span>
                  <span className="text-base font-black text-foreground font-mono tracking-wider truncate block">
                    {wallet?.referralCode || 'LOADING...'}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary text-xs font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share Link Box */}
              <div className="p-3.5 rounded-2xl bg-surface border border-foreground/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">Invite Link</span>
                  <span className="text-xs font-bold text-foreground/70 truncate block" suppressHydrationWarning>
                    {getReferralUrl()}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary text-xs font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── TAB NAVIGATION ─────────── */}
          <div className="flex items-center gap-2 p-1 bg-surface border border-foreground/10 rounded-2xl">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'rules'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>How to Earn</span>
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'referrals'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
            >
              <Users className="w-3 h-3 shrink-0" />
              <span>My Referrals</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/20 text-[10px]">
                {referrals.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'history'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'apply'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
            >
              <Send className="w-3 h-3 shrink-0" />
              <span>Apply Code</span>
            </button>
          </div>

          {/* ── TAB 1: HOW TO EARN & DYNAMIC RULES ─────────────────────────── */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Earning Card 1: Referrals */}
                <div
                  className="p-5 rounded-3xl border bg-card space-y-3 shadow-xs"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      +{referrerBonus} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-foreground">Invite New Athletes</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed font-normal">
                    Earn {referrerBonus} credit points whenever a friend registers an account on Athlon using your referral code.
                  </p>
                </div>

                {/* Earning Card 2: Tournament Conduction */}
                <div
                  className="p-5 rounded-3xl border bg-card space-y-3 shadow-xs"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      +{organizerBonus} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-foreground">Conduct Tournaments</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed font-normal">
                    Organizers earn {organizerBonus} credit points upon successfully organizing and completing each sports tournament.
                  </p>
                </div>

                {/* Earning Card 3: Tournament Participation */}
                <div
                  className="p-5 rounded-3xl border bg-card space-y-3 shadow-xs"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      +{playerBonus} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-foreground">Play &amp; Compete</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed font-normal">
                    Athletes earn {playerBonus} credit points for entering, playing, and finishing category fixtures in sports tournaments.
                  </p>
                </div>
              </div>

              {/* Redemption Info Card */}
              <div
                className="p-6 rounded-3xl border bg-surface space-y-3 shadow-xs"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>How to use your credits</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-card border border-foreground/5 space-y-2">
                    <h5 className="text-xs font-black text-foreground">Free Tournament Organizer Subscription</h5>
                    <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                      When you accumulate {organizerSubCost} credits, you can activate the Tournament Organizer subscription to host unlimited brackets, live scoring, and public draw sheets at zero cost.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-foreground/5 space-y-2">
                    <h5 className="text-xs font-black text-foreground">Dynamic Admin Credit Settings</h5>
                    <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                      All credit reward amounts and redemption costs are dynamically calibrated from the platform administration console for special events and league seasons.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: MY REFERRALS ────────────────────────────────────────── */}
          {activeTab === 'referrals' && (
            <div
              className="p-6 rounded-3xl border bg-card space-y-4 shadow-xs"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-foreground/5">
                <h3 className="text-base font-black text-foreground">Invited Athletes ({referrals.length})</h3>
                <span className="text-xs font-bold text-foreground/50">Real-time status</span>
              </div>

              {referrals.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-foreground/10 space-y-3">
                  <Users className="w-8 h-8 text-foreground/30 mx-auto" />
                  <h4 className="text-sm font-black text-foreground">No referrals yet</h4>
                  <p className="text-xs text-foreground/50 max-w-sm mx-auto">
                    Share your code <strong>{wallet?.referralCode}</strong> with friends to earn your first +{referrerBonus} credits!
                  </p>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Code</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-foreground/5">
                  {referrals.map((ref) => (
                    <div key={ref.referralUuid} className="py-3 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {ref.refereeName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground truncate">{ref.refereeName}</div>
                          <div className="text-[10px] text-foreground/50 font-medium truncate">
                            Phone: {ref.refereePhone} · Joined {new Date(ref.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400 block">
                          +{ref.creditsAwarded} Pts
                        </span>
                        <div className="text-[9px] font-bold text-foreground/40 uppercase">{ref.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: TRANSACTION AUDIT HISTORY ──────────────────────────── */}
          {activeTab === 'history' && (
            <div
              className="p-6 rounded-3xl border bg-card space-y-4 shadow-xs"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-foreground/5">
                <h3 className="text-base font-black text-foreground">Credit Ledger History</h3>
                <span className="text-xs font-bold text-foreground/50">Immutable Audit</span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-foreground/10 space-y-2">
                  <Clock className="w-8 h-8 text-foreground/30 mx-auto" />
                  <h4 className="text-sm font-black text-foreground">No transactions recorded</h4>
                  <p className="text-xs text-foreground/50">Your credits earned or redeemed will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-foreground/5">
                  {transactions.map((tx) => {
                    const isCredit = tx.transactionType === 'CREDIT';
                    return (
                      <div key={tx.transactionUuid} className="py-3 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}
                          >
                            {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{tx.description}</div>
                            <div className="text-[10px] text-foreground/50 font-medium truncate">
                              {new Date(tx.createdAt).toLocaleDateString()} · Balance: {tx.balanceAfter} pts
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCredit ? `+${tx.amount}` : `-${tx.amount}`} pts
                          </span>
                          <div className="text-[9px] font-bold text-foreground/40 uppercase">{tx.sourceType}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: APPLY REFERRAL CODE ────────────────────────────────── */}
          {activeTab === 'apply' && (
            <div
              className="p-8 rounded-3xl border bg-card space-y-5 max-w-xl mx-auto shadow-xs"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="space-y-1">
                <h3 className="text-lg font-black text-foreground">Have a Friend&apos;s Referral Code?</h3>
                <p className="text-xs text-foreground/60">
                  Enter an invitation code to claim your <strong className="text-emerald-400 font-bold">+{refereeBonus} credits</strong> welcome bonus.
                </p>
              </div>

              {applySuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{applySuccess}</span>
                </div>
              )}

              {applyError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              <form onSubmit={handleApplyReferral} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ATH8K9X2M"
                    value={applyCode}
                    onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-2xl border text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-primary transition-all bg-surface placeholder:text-foreground/30"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isApplying || !applyCode.trim()}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {isApplying ? (
                    <span>Applying Code...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Claim +{refereeBonus} Welcome Credits</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
