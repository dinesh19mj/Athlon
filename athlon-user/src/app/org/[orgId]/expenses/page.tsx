'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CreditCard,
  Plus,
  TrendingDown,
  TrendingUp,
  Tag,
  Calendar,
  User,
  X,
  AlertCircle,
  Receipt,
  PieChart,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Wallet,
  Coins,
  RefreshCw,
  ChevronDown,
  Layers,
  Flame,
  Check,
  Building,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import {
  CommunityService,
  CommunityExpense,
  CreateExpenseRequest,
  ExpenseCategory,
  CommunityMemberDto,
} from '@/lib/api/community';
import { UserService } from '@/lib/api/user';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';
import { useOrgRole } from '@/hooks/use-org-role';

const EXPENSE_CATEGORIES_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  SHUTTLES: {
    label: 'Shuttles / Tubes',
    icon: '🏸',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  BALLS: {
    label: 'Balls & Spares',
    icon: '⚽',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  COURT_RENTAL: {
    label: 'Court Rental',
    icon: '🏟️',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  EQUIPMENT: {
    label: 'Equipment & Gear',
    icon: '🎾',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  REFRESHMENTS: {
    label: 'Refreshments & Water',
    icon: '🥤',
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
  },
  JERSEYS: {
    label: 'Jerseys & Apparel',
    icon: '🎽',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.3)',
  },
  TOURNAMENT_ENTRY: {
    label: 'Tournament Entries',
    icon: '🏆',
    color: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.3)',
  },
  AWARDS: {
    label: 'Trophies & Awards',
    icon: '🥇',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.3)',
  },
  OTHER: {
    label: 'Miscellaneous',
    icon: '📦',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.3)',
  },
};

const ALL_CATEGORIES = Object.keys(EXPENSE_CATEGORIES_CONFIG) as ExpenseCategory[];

// Helper to format date
const formatExpenseDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function CommunityExpensesPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { org } = useOrgRole(orgId);

  const [expenses, setExpenses] = useState<CommunityExpense[]>([]);
  const [members, setMembers] = useState<CommunityMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    category: 'SHUTTLES',
    amount: 1200,
    description: '',
    paidByUserName: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  const fetchExpensesAndMembers = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const [expRes, memRes] = await Promise.allSettled([
        CommunityService.getExpenses(orgId),
        CommunityService.getMembers(orgId).catch(() => []),
      ]);

      if (expRes.status === 'fulfilled') {
        const data = (expRes.value as any)?.data || expRes.value;
        setExpenses(Array.isArray(data) ? data : []);
      }

      if (memRes.status === 'fulfilled') {
        const data = (memRes.value as any)?.data || memRes.value;
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load expenses or members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndMembers();
  }, [orgId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpensesAndMembers();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('🔗 Ledger link copied to clipboard!');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) {
      triggerToast('Please provide a valid description and amount.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      await CommunityService.createExpense(orgId, formData);
      triggerToast('💳 Expense recorded successfully!');
      setShowExpenseModal(false);
      setFormData({
        category: 'SHUTTLES',
        amount: 1200,
        description: '',
        paidByUserName: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
      fetchExpensesAndMembers();
    } catch (err: any) {
      console.error('Failed to log expense:', err);
      triggerToast(err?.message || 'Failed to record expense. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics Calculations
  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  const shuttlesAndCourtSpent = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'SHUTTLES' || e.category === 'COURT_RENTAL')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const avgExpense = useMemo(() => {
    return expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0;
  }, [expenses, totalSpent]);

  // Spending per category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    expenses.forEach((e) => {
      const current = map.get(e.category) || 0;
      map.set(e.category, current + (Number(e.amount) || 0));
    });

    return ALL_CATEGORIES.map((cat) => {
      const spent = map.get(cat) || 0;
      const pct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
      return {
        category: cat,
        config: EXPENSE_CATEGORIES_CONFIG[cat],
        spent,
        percentage: pct,
      };
    })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [expenses, totalSpent]);

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return expenses
      .filter((exp) => {
        const matchesCategory =
          selectedCategory === 'ALL' || exp.category === selectedCategory;
        const matchesSearch =
          !query ||
          (exp.description && exp.description.toLowerCase().includes(query)) ||
          (exp.paidByUserName && exp.paidByUserName.toLowerCase().includes(query)) ||
          (exp.category && exp.category.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.expenseDate || 0).getTime() - new Date(a.expenseDate || 0).getTime();
        }
        if (sortBy === 'HIGHEST') {
          return Number(b.amount || 0) - Number(a.amount || 0);
        }
        if (sortBy === 'LOWEST') {
          return Number(a.amount || 0) - Number(b.amount || 0);
        }
        return 0;
      });
  }, [expenses, selectedCategory, searchQuery, sortBy]);

  return (
    <div
      className="min-h-full w-full pb-28 md:pb-16 text-foreground relative"
      style={{
        backgroundColor: 'var(--athlon-bg)',
        paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
      }}
    >
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--athlon-primary)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[160px] opacity-10"
          style={{ background: '#10B981' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg md:max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col gap-3.5 md:gap-6 pt-1.5">
        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-2.5 text-xs font-black transition-all animate-bounce ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* ─── 1. HYPER-STYLISH ATHLETIC ARENA HERO (Design Standard) ─── */}
        <section
          className="relative w-full rounded-[26px] overflow-hidden border p-4 sm:p-5 shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow:
              '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Top Edge Neon Energy Rail */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none z-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
            }}
          />

          {/* Stadium Floodlight Spotlights */}
          <div
            className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-60 animate-pulse duration-1000 z-0"
            style={{
              background: 'radial-gradient(circle, var(--athlon-primary) 0%, rgba(16, 185, 129, 0.3) 40%, transparent 75%)',
            }}
          />

          {/* Specular Sheen Arc */}
          <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

          <div className="relative z-10 space-y-3.5">
            {/* Top Control Bar inside Hero */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href={`/org/${orgId}/dashboard`}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 transition-all shrink-0 shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Back to Hub"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>

                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary truncate flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Community Financial Ledger
                  </span>
                </div>
              </div>

              {/* Action Buttons: Refresh & Share */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 cursor-pointer shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Refresh Ledger"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 cursor-pointer shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Share Ledger Link"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-[19px] sm:text-[21px] font-black leading-[1.14] tracking-tight uppercase text-foreground">
                <span>Expenses &amp;</span>{' '}
                <span className="text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]">
                  Kitty Ledger
                </span>{' '}
                🪙
              </h1>
              <p className="text-[11px] text-text-secondary leading-relaxed font-medium pt-0.5">
                100% transparent community kitty, shuttle tube orders, court bookings, and member expense breakdown for {org?.name || 'the community'}.
              </p>
            </div>

            {/* Hero Action Button: Log Expense */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowExpenseModal(true)}
                className="w-full flex items-center justify-center gap-1.5 text-[9.5px] font-bold px-3 py-2.5 rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-md tracking-wider uppercase cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                  color: 'var(--athlon-primary-foreground)',
                  boxShadow: '0 4px 16px var(--athlon-primary-glow)',
                }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Log Expense</span>
              </button>
            </div>

            {/* Live Telemetry Strip with 4 Metrics */}
            <div
              className="grid grid-cols-4 divide-x rounded-2xl p-2.5 mt-1 border backdrop-blur-md"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-primary font-mono leading-none truncate max-w-full">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  Total Spent
                </span>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-emerald-400 font-mono leading-none truncate max-w-full">
                  ₹{shuttlesAndCourtSpent.toLocaleString('en-IN')}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  Shuttles/Courts
                </span>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-foreground font-mono leading-none">
                  {expenses.length}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  Logs
                </span>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-purple-400 font-mono leading-none truncate max-w-full">
                  ₹{avgExpense.toLocaleString('en-IN')}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  Avg / Log
                </span>
              </div>
            </div>

            {/* Visual Spending Distribution Bar */}
            {categoryBreakdown.length > 0 && (
              <div className="pt-2 border-t border-foreground/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-foreground/60 uppercase tracking-wider text-[10px] font-black flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-primary" /> Kitty Category Breakdown
                  </span>
                  <span className="text-foreground/40 font-mono text-[10px]">{categoryBreakdown.length} active categories</span>
                </div>

                {/* Multi-Segment Color Bar */}
                <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden flex shadow-inner border border-foreground/5">
                  {categoryBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="h-full transition-all hover:opacity-80"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.config.color,
                      }}
                      title={`${item.config.label}: ₹${item.spent.toLocaleString('en-IN')} (${item.percentage}%)`}
                    />
                  ))}
                </div>

                {/* Category Mini-Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar pt-0.5">
                  {categoryBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-black shrink-0 border transition-all"
                      style={{
                        backgroundColor: item.config.bg,
                        borderColor: item.config.border,
                        color: item.config.color,
                      }}
                    >
                      <span>{item.config.icon}</span>
                      <span>{item.config.label}</span>
                      <span className="font-mono opacity-80">₹{item.spent.toLocaleString('en-IN')}</span>
                      <span className="opacity-60 font-mono">({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── 2. CONTROLS, SEARCH & CATEGORY FILTERS ─── */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, items, or payer..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all shadow-inner"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 mr-1 hidden sm:inline">
                Sort:
              </span>
              {[
                { id: 'NEWEST', label: 'Newest Date' },
                { id: 'HIGHEST', label: 'Highest Amount' },
                { id: 'LOWEST', label: 'Lowest Amount' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    sortBy === s.id
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'bg-surface text-foreground/60 hover:text-foreground border'
                  }`}
                  style={{ borderColor: sortBy === s.id ? undefined : 'var(--athlon-border)' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-surface text-foreground/70 hover:text-foreground'
              }`}
              style={{ borderColor: selectedCategory === 'ALL' ? undefined : 'var(--athlon-border)' }}
            >
              All Logs ({expenses.length})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const meta = EXPENSE_CATEGORIES_CONFIG[cat];
              const isSelected = selectedCategory === cat;
              const count = expenses.filter((e) => e.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'shadow-sm text-foreground'
                      : 'bg-surface text-foreground/70 hover:text-foreground'
                  }`}
                  style={{
                    backgroundColor: isSelected ? meta.bg : undefined,
                    borderColor: isSelected ? meta.border : 'var(--athlon-border)',
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  {count > 0 && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black"
                      style={{
                        backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : 'var(--athlon-surface)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 3. EXPENSE TRANSACTION FEED ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground/80">
                Expense Logs ({filteredExpenses.length})
              </h3>
            </div>
            {filteredExpenses.length > 0 && (
              <span className="text-[11px] font-mono font-bold text-foreground/50">
                Total Shown: ₹{filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-surface/60 border animate-pulse"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            /* ─── HIGH-IMPACT GLOWING EMPTY STATE ─── */
            <div
              className="p-6 sm:p-10 text-center rounded-2xl border shadow-sm relative overflow-hidden backdrop-blur-md"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
                backgroundImage:
                  'radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
              }}
            >
              <div className="max-w-md mx-auto space-y-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-black text-foreground">
                    {searchQuery || selectedCategory !== 'ALL'
                      ? 'No Matching Expenses Found'
                      : 'No Expenses Logged Yet'}
                  </h4>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    {searchQuery || selectedCategory !== 'ALL'
                      ? 'Try clearing your category filter or search keywords to view the full ledger.'
                      : 'Keep your community kitty 100% transparent. Track shuttle boxes, court bookings, tournament fees, and player refreshments in one ledger.'}
                  </p>
                </div>

                {/* Example Quick Tags */}
                {!searchQuery && selectedCategory === 'ALL' && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] font-bold text-foreground/50">
                    <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                      🏸 10 Tubes Yonex AS-2
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                      🏟️ Weekend Court Rent
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                      🥤 Electrolyte Drinks
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery || selectedCategory !== 'ALL') {
                        setSearchQuery('');
                        setSelectedCategory('ALL');
                      } else {
                        setShowExpenseModal(true);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/25 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{searchQuery || selectedCategory !== 'ALL' ? 'Clear Filters' : 'Log First Expense'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─── TRANSACTION CARDS (FINTECH ATHLETIC DESIGN) ─── */
            <div className="grid grid-cols-1 gap-2.5">
              {filteredExpenses.map((exp) => {
                const meta = EXPENSE_CATEGORIES_CONFIG[exp.category] || EXPENSE_CATEGORIES_CONFIG.OTHER;
                return (
                  <div
                    key={exp.expenseId}
                    className="p-3.5 sm:p-4 rounded-2xl border transition-all hover:border-primary/40 hover:shadow-sm flex items-center justify-between gap-3 group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* Left: Category Icon + Description + Metadata */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 border shadow-inner transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: meta.bg,
                          borderColor: meta.border,
                          color: meta.color,
                        }}
                      >
                        {meta.icon}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {exp.description}
                          </h4>
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border"
                            style={{
                              backgroundColor: meta.bg,
                              borderColor: meta.border,
                              color: meta.color,
                            }}
                          >
                            {meta.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-foreground/50 flex-wrap">
                          <span className="flex items-center gap-1 font-mono font-bold">
                            <Calendar className="w-3 h-3 text-foreground/40" />
                            {formatExpenseDate(exp.expenseDate)}
                          </span>

                          {exp.paidByUserName && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface border text-foreground/70 font-semibold text-[10px]" style={{ borderColor: 'var(--athlon-border)' }}>
                                <User className="w-2.5 h-2.5 text-primary" />
                                <span>Paid by {exp.paidByUserName}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount Capsule */}
                    <div className="text-right shrink-0">
                      <div
                        className="px-3 py-1.5 rounded-xl bg-surface border font-mono font-black text-xs sm:text-sm text-primary shadow-inner inline-flex items-center gap-0.5"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-[11px] opacity-70">₹</span>
                        <span>{Number(exp.amount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Floating Action Button (FAB) ── */}
        <div className="fixed bottom-22 right-4 md:bottom-8 md:right-8 z-40">
          <Athlon3DFAB
            icon={<Plus className="w-6 h-6 text-black stroke-[3]" />}
            label="Log Expense"
            onClick={() => setShowExpenseModal(true)}
            className="fixed bottom-22 right-4 md:bottom-8 md:right-8 z-40"
          />
        </div>

        {/* ─── 4. REDESIGNED LOG EXPENSE MODAL (PORTALED TO DOCUMENT.BODY) ─── */}
        {showExpenseModal && mounted && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div
              className="w-full max-w-lg rounded-2xl border shadow-2xl relative max-h-[82vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Modal Header */}
              <div
                className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                      Log Community Expense
                    </h3>
                    <p className="text-[11px] text-foreground/50 font-medium">
                      Record shuttle purchases, court rentals, and kitty debits
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="w-8 h-8 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleCreateExpense} className="flex flex-col flex-1 min-h-0">
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                  {/* Category Selector Grid */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1.5">
                      Expense Category *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_CATEGORIES.map((cat) => {
                        const meta = EXPENSE_CATEGORIES_CONFIG[cat];
                        const isSelected = formData.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={`p-2 rounded-xl text-left border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'shadow-md ring-1 ring-primary'
                                : 'bg-surface hover:bg-surface-hover text-foreground/70'
                            }`}
                            style={{
                              backgroundColor: isSelected ? meta.bg : undefined,
                              borderColor: isSelected ? meta.border : 'var(--athlon-border)',
                            }}
                          >
                            <span className="text-base">{meta.icon}</span>
                            <span
                              className={`text-[10px] font-black text-center truncate w-full ${
                                isSelected ? 'text-foreground' : 'text-foreground/70'
                              }`}
                            >
                              {meta.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount with Quick Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60">
                        Amount (₹) *
                      </label>
                      <span className="text-[10px] text-foreground/40 font-mono">Rupees</span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-primary font-mono pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={1}
                        required
                        value={formData.amount || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="1200"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 hide-scrollbar">
                      {[500, 1000, 1500, 2000, 3000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: preset })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black border transition-all cursor-pointer ${
                            formData.amount === preset
                              ? 'bg-primary text-black border-primary'
                              : 'bg-surface text-foreground/60 hover:text-foreground border-foreground/10'
                          }`}
                        >
                          +₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description / Item Details */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                      Description / Item Details *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. 2 Tubes Yonex AS-30 Shuttles, Court 4 booking"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  {/* Date and Paid By Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                        Expense Date
                      </label>
                      <input
                        type="date"
                        value={formData.expenseDate}
                        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-surface border text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                        Paid By (Payer)
                      </label>
                      {members.length > 0 ? (
                        <select
                          value={formData.paidByUserName || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, paidByUserName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          <option value="">Select Community Member or Custom...</option>
                          {members.map((m) => (
                            <option key={m.userUuid} value={m.fullName}>
                              {m.fullName} ({m.role || 'Member'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData.paidByUserName || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, paidByUserName: e.target.value })
                          }
                          placeholder="e.g. Dinesh, Alex"
                          className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Always Visible Sticky Footer */}
                <div
                  className="p-4 border-t bg-surface/95 backdrop-blur-md flex items-center gap-3 shrink-0"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="w-1/3 py-2.5 rounded-2xl bg-surface border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.description.trim() || formData.amount <= 0}
                    className="w-2/3 py-2.5 rounded-2xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Save Expense
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
