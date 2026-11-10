'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubFinanceService, ClubFinance, FinanceSummary, CreateFinancePayload } from '@/lib/api/clubFinance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService } from '@/lib/api/user';
import AcademyFinancesView from '@/components/academy/AcademyFinancesView';
import CoachFinancesView from '@/components/coach/CoachFinancesView';
import OrganizerFinancesView from '@/components/organizer/OrganizerFinancesView';
import {
  Plus,
  Search,
  RefreshCw,
  Wallet,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Building,
  Tag,
  FileText,
  UserCheck,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  PieChart,
  IndianRupee,
  ChevronDown,
  Lock,
  ArrowUp,
  ArrowDown,
  Receipt,
  User,
  ShieldCheck,
  Eye,
  Activity,
} from 'lucide-react';
import { useOrgRole } from '@/hooks/use-org-role';

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EXPENSE_CATEGORIES = [
  { id: 'Court Rent', label: 'Court Rent', icon: '🏟️', color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { id: 'Shuttle / Equipment', label: 'Shuttles & Gear', icon: '🏸', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'Maintenance', label: 'Maintenance', icon: '🔧', color: 'from-purple-500/20 to-purple-600/10 text-purple-400' },
  { id: 'Refreshments', label: 'Refreshments', icon: '🥤', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'Tournament', label: 'Tournament', icon: '🏆', color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400' },
  { id: 'Other', label: 'Other Expense', icon: '📦', color: 'from-slate-500/20 to-slate-600/10 text-slate-400' }
];

const INCOME_CATEGORIES = [
  { id: 'Member Fee', label: 'Member Fee', icon: '👤', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'Shuttle Fee', label: 'Shuttle Pool', icon: '🏸', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'Tournament Fee', label: 'Entry Fee', icon: '🏆', color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400' },
  { id: 'Other Income', label: 'Other Income', icon: '💰', color: 'from-primary/20 to-primary/10 text-primary' }
];

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / GPay', icon: '⚡' },
  { id: 'CASH', label: 'Cash', icon: '💵' },
  { id: 'BANK_TRANSFER', label: 'Bank', icon: '🏦' },
  { id: 'CARD', label: 'Card', icon: '💳' }
];

const QUICK_AMOUNT_PRESETS = [500, 1000, 1500, 2000, 5000];

export default function FinancesPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const org = activeOrg || organizations?.find((o) => o.id === orgIdParam);

  const orgUuid = (org?.id || orgIdParam) as string;

  if (org?.type === 'ACADEMY') {
    return <AcademyFinancesView orgUuid={orgUuid} orgName={org.name || 'Academy'} />;
  }

  if (org?.type === 'COACH') {
    return <CoachFinancesView orgUuid={orgUuid} orgName={org.name || 'Coach Workspace'} />;
  }

  if (org?.type === 'ORGANIZER' || org?.type === 'ASSOCIATION') {
    return <OrganizerFinancesView orgUuid={orgUuid} orgName={org.name || 'Organizer Workspace'} />;
  }

  return <ClubFinancesView orgUuid={orgUuid} orgName={org?.name || 'Club'} org={org} />;
}

function ClubFinancesView({ orgUuid, orgName, org }: { orgUuid: string; orgName: string; org?: any }) {
  const { role, isAdmin, canManage } = useOrgRole(orgUuid);

  const [finances, setFinances] = useState<ClubFinance[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Date Filtering
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [timeframeMode, setTimeframeMode] = useState<'ALL_TIME' | 'TODAY' | 'CUSTOM'>('ALL_TIME');

  // Modal / Bottom Sheet State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<ClubFinance | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState('Court Rent');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(getLocalDateString());
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');
  const [formPaidToOrBy, setFormPaidToOrBy] = useState('');
  const [formMemberUuid, setFormMemberUuid] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  useEffect(() => {
    if (orgUuid) {
      loadData();
      OrganizationService.getMembers(orgUuid).then((res) => {
        const memList = Array.isArray(res) ? res : ((res as any)?.data || []);
        setMembers(memList);
      }).catch(() => {});
    }
  }, [orgUuid, selectedDate, timeframeMode, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dateParam = timeframeMode === 'ALL_TIME' ? undefined : selectedDate;
      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;

      const [listRes, summaryRes] = await Promise.allSettled([
        ClubFinanceService.getFinances(orgUuid, typeParam, dateParam, dateParam),
        ClubFinanceService.getSummary(orgUuid, dateParam, dateParam)
      ]);

      if (listRes.status === 'fulfilled') {
        const list = Array.isArray(listRes.value)
          ? listRes.value
          : ((listRes.value as any)?.data || []);
        setFinances(list);
      }

      if (summaryRes.status === 'fulfilled') {
        const sum = (summaryRes.value as any)?.data || summaryRes.value;
        setSummary(sum);
      }
    } catch (err) {
      console.error('Failed to load finances:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleShiftDate = (days: number) => {
    setTimeframeMode('CUSTOM');
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    base.setDate(base.getDate() + days);
    setSelectedDate(getLocalDateString(base));
  };

  const handleOpenAdd = (type: 'EXPENSE' | 'INCOME') => {
    setModalType(type);
    setFormCategory(type === 'EXPENSE' ? 'Court Rent' : 'Member Fee');
    setFormTitle('');
    setFormAmount('');
    setFormDate(getLocalDateString());
    setFormPaymentMethod('UPI');
    setFormPaidToOrBy('');
    setFormMemberUuid('');
    setFormNotes('');
    setIsMemberDropdownOpen(false);
    setMemberSearchQuery('');
    setIsModalOpen(true);
  };

  const handlePresetAmount = (preset: number) => {
    const current = parseFloat(formAmount || '0');
    setFormAmount(String(current + preset));
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) return;

    try {
      setSubmitting(true);
      const cleanMemberUuid = formMemberUuid && formMemberUuid.trim() !== '' ? formMemberUuid.trim() : undefined;
      const cleanPaidToOrBy = formPaidToOrBy && formPaidToOrBy.trim() !== '' ? formPaidToOrBy.trim() : undefined;
      const cleanNotes = formNotes && formNotes.trim() !== '' ? formNotes.trim() : undefined;

      const payload: CreateFinancePayload = {
        organizationUuid: orgUuid,
        transactionType: modalType,
        category: formCategory,
        title: formTitle && formTitle.trim() !== '' ? formTitle.trim() : formCategory,
        amount: parseFloat(formAmount),
        transactionDate: formDate || getLocalDateString(),
        paymentMethod: formPaymentMethod || 'UPI',
        paidToOrBy: cleanPaidToOrBy,
        memberUuid: cleanMemberUuid,
        notes: cleanNotes
      };

      await ClubFinanceService.createFinance(payload);
      setIsModalOpen(false);
      setToastMessage(`${modalType === 'EXPENSE' ? 'Expense' : 'Income'} recorded successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (financeUuid: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;

    try {
      await ClubFinanceService.deleteFinance(financeUuid);
      setFinances((prev) => prev.filter((f) => f.financeUuid !== financeUuid));
      if (selectedTxDetail?.financeUuid === financeUuid) {
        setSelectedTxDetail(null);
      }
      setToastMessage('Transaction deleted successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const filteredFinances = useMemo(() => {
    return finances.filter((f) => {
      const matchSearch =
        (f.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.paidToOrBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.memberName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || f.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [finances, searchTerm, selectedCategory]);

  // Group transactions chronologically
  const groupedFinances = useMemo(() => {
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const groups: { title: string; dateKey: string; items: ClubFinance[]; netChange: number }[] = [];
    const map = new Map<string, { title: string; dateKey: string; items: ClubFinance[]; netChange: number }>();

    filteredFinances.forEach((tx) => {
      const dateKey = tx.transactionDate ? tx.transactionDate.split('T')[0] : 'Unknown';
      let title = dateKey;
      if (dateKey === todayStr) title = 'Today';
      else if (dateKey === yesterdayStr) title = 'Yesterday';
      else {
        try {
          title = new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        } catch {
          title = dateKey;
        }
      }

      if (!map.has(title)) {
        map.set(title, { title, dateKey, items: [], netChange: 0 });
      }
      const entry = map.get(title)!;
      entry.items.push(tx);
      const isExpense = tx.transactionType === 'EXPENSE';
      entry.netChange += isExpense ? -Number(tx.amount || 0) : Number(tx.amount || 0);
    });

    map.forEach((value) => {
      groups.push(value);
    });

    return groups;
  }, [filteredFinances]);

  // Category Expense Distribution for visual breakdown
  const categoryPercentages = useMemo(() => {
    if (!summary?.expenseByCategory || Object.keys(summary.expenseByCategory).length === 0) return [];
    const totalExp = summary.totalExpense || 1;

    return Object.entries(summary.expenseByCategory)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: Math.round((amt / totalExp) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 flex items-center gap-2.5 bg-emerald-950/95 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW (REWORKED WITH STYLISH NEO-BANK TREASURY DESIGN)           */}
      {/* ========================================================================= */}
      <div className="block md:hidden p-3.5 space-y-4 animate-in fade-in duration-300">
        
        {/* 1. Mobile Top Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 via-primary/15 to-transparent border border-primary/25 flex items-center justify-center text-lg shadow-inner shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-foreground tracking-tight truncate">
                  Club Treasury
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <p className="text-[11px] font-semibold text-foreground/50 truncate">
                {org?.name || 'Club Account'} • {finances.length} logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface border border-foreground/10 text-foreground/70 active:scale-95 transition-all disabled:opacity-50"
              title="Refresh Finances"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Mobile Neo-Bank Hero Card ("The Club Vault Card") */}
        <div className="relative overflow-hidden rounded-[28px] bg-surface dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-900/95 dark:to-neutral-950 border border-foreground/10 p-5 shadow-sm dark:shadow-2xl space-y-4">
          {/* Ambient Glow Accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

          {/* Card Top Strip */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-foreground/5 text-foreground/70 border border-foreground/10">
                ATHLON VAULT
              </span>
              <span className="text-[10px] font-bold text-foreground/50 font-mono">
                {timeframeMode === 'TODAY' ? 'TODAY' : timeframeMode === 'ALL_TIME' ? 'ALL TIME' : selectedDate}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                Number(summary?.netBalance || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {Number(summary?.netBalance || 0) >= 0 ? 'Surplus ●' : 'Deficit ●'}
              </span>
            </div>
          </div>

          {/* Centerpiece: Net Balance */}
          <div className="relative space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
              Net Available Cash
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-foreground/40 font-mono">₹</span>
              <span className={`text-4xl font-black tracking-tight font-mono ${
                Number(summary?.netBalance || 0) >= 0 ? 'text-primary' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {Number(summary?.netBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Two-Column Flow: Collections vs Expenses (Interactive Filters) */}
          <div className="relative grid grid-cols-2 gap-2.5 pt-1">
            {/* Total Collections */}
            <button
              type="button"
              onClick={() => setTypeFilter(typeFilter === 'INCOME' ? 'ALL' : 'INCOME')}
              className={`p-3 rounded-2xl text-left transition-all border ${
                typeFilter === 'INCOME'
                  ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/20 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Collections
                </span>
                {typeFilter === 'INCOME' && <span className="text-[9px] font-mono">ACTIVE</span>}
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                +₹{Number(summary?.totalIncome || 0).toLocaleString('en-IN')}
              </div>
            </button>

            {/* Total Expenses */}
            <button
              type="button"
              onClick={() => setTypeFilter(typeFilter === 'EXPENSE' ? 'ALL' : 'EXPENSE')}
              className={`p-3 rounded-2xl text-left transition-all border ${
                typeFilter === 'EXPENSE'
                  ? 'bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500/30'
                  : 'bg-rose-500/10 border-rose-500/20 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Expenses
                </span>
                {typeFilter === 'EXPENSE' && <span className="text-[9px] font-mono">ACTIVE</span>}
              </div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 truncate">
                -₹{Number(summary?.totalExpense || 0).toLocaleString('en-IN')}
              </div>
            </button>
          </div>

          {/* Quick Action Buttons inside Mobile Card */}
          {canManage ? (
            <div className="relative grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => handleOpenAdd('EXPENSE')}
                className="py-3 px-3 rounded-2xl bg-rose-500 text-white text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Expense
              </button>
              <button
                onClick={() => handleOpenAdd('INCOME')}
                className="py-3 px-3 rounded-2xl bg-emerald-500 text-black text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <IndianRupee className="w-4 h-4 stroke-[3]" /> Collect Fee
              </button>
            </div>
          ) : (
            <div className="relative pt-1 text-center">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                Read-Only Member Ledger
              </span>
            </div>
          )}
        </div>

        {/* 3. Mobile Category Spend Distribution (if expenses exist) */}
        {categoryPercentages.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-surface border border-foreground/10 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-foreground/50">
              <span className="flex items-center gap-1 text-foreground/70">
                <PieChart className="w-3.5 h-3.5 text-primary" /> Spend Breakdown
              </span>
              <span className="text-[10px] font-mono font-bold text-foreground/40">
                {categoryPercentages.length} Categories
              </span>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="h-2.5 w-full rounded-full bg-foreground/10 overflow-hidden flex gap-0.5 p-0.5">
              {categoryPercentages.map((item, idx) => {
                const colors = ['bg-amber-400', 'bg-blue-400', 'bg-purple-400', 'bg-emerald-400', 'bg-yellow-400', 'bg-slate-400'];
                const col = colors[idx % colors.length];
                return (
                  <div
                    key={item.category}
                    className={`h-full rounded-sm ${col} transition-all`}
                    style={{ width: `${Math.max(item.percentage, 6)}%` }}
                    title={`${item.category}: ₹${item.amount}`}
                  />
                );
              })}
            </div>

            {/* Small Legend Tags Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
              {categoryPercentages.map((item, idx) => {
                const colors = ['text-amber-400', 'text-blue-400', 'text-purple-400', 'text-emerald-400', 'text-yellow-400', 'text-slate-400'];
                const col = colors[idx % colors.length];
                return (
                  <div key={item.category} className="flex items-center gap-1 text-[10px] font-bold text-foreground/60 whitespace-nowrap bg-background px-2 py-1 rounded-lg border border-foreground/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.replace('text-', 'bg-')}`} />
                    <span>{item.category}:</span>
                    <span className="font-mono text-foreground font-black">₹{item.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Mobile Timeframe & Filter Controls */}
        <div className="space-y-2">
          {/* Timeframe Bar */}
          <div className="flex items-center justify-between gap-1.5 bg-surface border border-foreground/10 rounded-2xl p-1.5">
            <button
              onClick={() => {
                setTimeframeMode('ALL_TIME');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                timeframeMode === 'ALL_TIME'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => {
                setTimeframeMode('TODAY');
                setSelectedDate(getLocalDateString());
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                timeframeMode === 'TODAY'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Today
            </button>

            {/* Date Picker Input */}
            <div className="relative flex items-center bg-background border border-foreground/10 rounded-xl px-2.5 py-1 text-xs font-bold text-foreground">
              <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0 mr-1" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setTimeframeMode('CUSTOM');
                  setSelectedDate(e.target.value);
                }}
                className="bg-transparent text-[11px] font-bold text-foreground focus:outline-none cursor-pointer w-24"
              />
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search expenses, vendors, members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-foreground/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips Horizontal Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedCategory === 'ALL'
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-surface border-foreground/5 text-foreground/60'
              }`}
            >
              <span>All Categories</span>
            </button>
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary text-black border-primary/30 shadow-sm'
                      : 'bg-surface border-foreground/5 text-foreground/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Pill */}
          {(typeFilter !== 'ALL' || selectedCategory !== 'ALL' || searchTerm) && (
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-foreground/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>Filter:</span>
                {typeFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-foreground/10 text-foreground text-[10px] font-black uppercase">
                    {typeFilter === 'EXPENSE' ? 'Expenses Only' : 'Collections Only'}
                  </span>
                )}
                {selectedCategory !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-black">
                    {selectedCategory}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setTypeFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-primary hover:underline text-[10px] font-black shrink-0"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* 5. Mobile Transactions Stream */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-3xl bg-surface border border-foreground/5 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-foreground/10" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-foreground/10 rounded-md w-3/4" />
                      <div className="h-3 bg-foreground/5 rounded-md w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFinances.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-3.5 bg-surface border border-foreground/5 rounded-[26px]">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-2xl">
                💸
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">No Transactions Found</h3>
                <p className="text-xs text-foreground/50 max-w-xs mx-auto mt-1">
                  Log club court rents, shuttle purchases, or member fees to stay on top of the club treasury.
                </p>
              </div>
              {canManage && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenAdd('EXPENSE')}
                    className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-md shadow-primary/20"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Expense
                  </button>
                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="px-4 py-2 rounded-xl bg-surface border border-foreground/10 text-xs font-black"
                  >
                    Collect Fee
                  </button>
                </div>
              )}
            </div>
          ) : (
            groupedFinances.map((group) => (
              <div key={`mob-grp-${group.title}`} className="space-y-2">
                {/* Date Group Sticky Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                    {group.title}
                  </span>
                  <span className={`text-[11px] font-mono font-black ${
                    group.netChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {group.netChange >= 0 ? '+' : ''}₹{Math.abs(group.netChange).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Cards */}
                <div className="bg-surface border border-foreground/10 rounded-[24px] divide-y divide-foreground/5 overflow-hidden shadow-sm">
                  {group.items.map((item) => {
                    const isExpense = item.transactionType === 'EXPENSE';
                    const categoryObj = (isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).find(
                      (c) => c.id === item.category
                    );

                    return (
                      <div
                        key={`mob-tx-${item.financeUuid}`}
                        onClick={() => setSelectedTxDetail(item)}
                        className="p-3.5 active:bg-foreground/5 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        {/* Icon & Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-gradient-to-br ${
                            categoryObj?.color || (isExpense ? 'from-rose-500/20 to-rose-600/10 text-rose-400' : 'from-emerald-500/20 to-emerald-600/10 text-emerald-400')
                          } border border-foreground/5 shadow-inner`}>
                            {categoryObj?.icon || (isExpense ? '📉' : '📈')}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-foreground truncate">
                                {item.title}
                              </h4>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-foreground/5 text-foreground/50 border border-foreground/10">
                                {item.paymentMethod || 'UPI'}
                              </span>
                            </div>

                            <div className="text-[11px] font-medium text-foreground/40 truncate mt-0.5 flex items-center gap-1">
                              <span>{item.category}</span>
                              {(item.paidToOrBy || item.memberName) && (
                                <>
                                  <span>•</span>
                                  <span className="text-foreground/70 font-semibold truncate">
                                    {item.memberName || item.paidToOrBy}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <div className={`font-mono font-black text-sm ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {isExpense ? '- ' : '+ '}₹{Number(item.amount).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] font-semibold text-foreground/30 font-mono">
                            {item.transactionDate ? String(item.transactionDate).slice(5) : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Quick Action Button on Mobile */}
        {canManage && finances.length > 4 && (
          <div className="fixed bottom-20 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => handleOpenAdd('EXPENSE')}
              className="px-3.5 py-2.5 rounded-full bg-rose-500 text-white font-black text-xs tracking-wide shadow-2xl shadow-rose-500/40 flex items-center gap-1.5 active:scale-90 transition-all border border-white/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Expense</span>
            </button>
            <button
              onClick={() => handleOpenAdd('INCOME')}
              className="px-3.5 py-2.5 rounded-full bg-emerald-500 text-black font-black text-xs tracking-wide shadow-2xl shadow-emerald-500/40 flex items-center gap-1.5 active:scale-90 transition-all border border-black/10"
            >
              <IndianRupee className="w-3.5 h-3.5 stroke-[3]" />
              <span>Collect</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP VIEW ONLY (Athlon 2.0 Command Center Architecture)               */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-24 space-y-8 animate-in fade-in duration-300">
        {/* Executive Command Banner */}
        <div
          className="relative rounded-3xl border p-6 lg:p-8 overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              {/* Badge & Breadcrumb */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Club Operations Suite
                </span>
                <span className="text-foreground/30">•</span>
                <span className="text-xs font-semibold text-foreground/50">
                  Treasury &amp; Financial Ledger
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Club Financial Treasury
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {filteredFinances.length} {filteredFinances.length === 1 ? 'Record' : 'Records'}
                </span>
              </h1>
              <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl">
                Oversee club member subscription fees, court rentals, facility maintenance expenses, and equipment purchases with real-time audit ledger tracking.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl border text-foreground/70 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
                title="Refresh Financial Ledger"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>

              {canManage && (
                <>
                  <button
                    onClick={() => handleOpenAdd('EXPENSE')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-500" />
                    <span>Log Expense</span>
                  </button>

                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    style={{
                      backgroundColor: 'var(--athlon-primary)',
                      color: '#000000',
                    }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Collect Fee</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4-Metric Executive Telemetry HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Balance */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-primary/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Net Available Cash
              </span>
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Wallet className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl lg:text-3xl font-black font-mono tracking-tight ${
                  Number(summary?.netBalance || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                ₹{Number(summary?.netBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  Number(summary?.netBalance || 0) >= 0
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}
              >
                {Number(summary?.netBalance || 0) >= 0 ? 'Surplus ●' : 'Deficit ●'}
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Vault balance</span>
            </div>
          </div>

          {/* Card 2: Total Collections */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-emerald-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Total Collections
              </span>
              <div className="w-9 h-9 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-emerald-500 tracking-tight">
                ₹{Number(summary?.totalIncome || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Inflow
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Subscription &amp; fee dues</span>
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-rose-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="w-9 h-9 rounded-xl border border-rose-500/20 bg-rose-500/10 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-rose-500 tracking-tight">
                ₹{Number(summary?.totalExpense || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Outflow
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Operating costs logged</span>
            </div>
          </div>

          {/* Card 4: Operating Health / Total Entries */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-primary/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Total Transactions
              </span>
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-foreground tracking-tight">
                {finances.length}
              </span>
              <span className="text-xs font-bold text-foreground/40 font-mono">Entries</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Audit Active
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">100% reconciled</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Deck */}
        <div
          className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search by description, category, member, or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs font-medium border outline-none transition-all placeholder:text-foreground/40 focus:border-primary"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {[{ id: 'ALL', label: 'All Categories' }, ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((cat: any) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-primary text-black border-primary shadow-xs'
                      : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Transactions Ledger Table */}
        <div
          className="rounded-3xl border overflow-hidden shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {filteredFinances.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-3xl border flex items-center justify-center text-3xl shadow-inner"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                💸
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-foreground">No financial records found</h3>
                <p className="text-xs text-foreground/50">
                  {searchTerm || selectedCategory !== 'ALL'
                    ? 'Try clearing filters or search terms to display more results.'
                    : 'No income or expense entries have been logged in this club workspace yet.'}
                </p>
              </div>
              {canManage && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-black shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    + Collect Fee
                  </button>
                  <button
                    onClick={() => handleOpenAdd('EXPENSE')}
                    className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-black/[0.04] dark:hover:bg-white/5 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    + Log Expense
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10px] font-black uppercase tracking-wider text-foreground/40"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <th className="py-3.5 px-6">Transaction &amp; Category</th>
                    <th className="py-3.5 px-6">Date &amp; Ref</th>
                    <th className="py-3.5 px-6">Member / Party</th>
                    <th className="py-3.5 px-6">Payment Method</th>
                    <th className="py-3.5 px-6 text-right">Amount (₹)</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredFinances.map((item) => {
                    const isExpense = item.transactionType === 'EXPENSE';
                    const categoryObj = (isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).find(
                      (c) => c.id === item.category
                    );

                    return (
                      <tr
                        key={item.financeUuid}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setSelectedTxDetail(item)}
                      >
                        {/* Transaction & Category */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div
                              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: isExpense ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                borderColor: isExpense ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              }}
                            >
                              {categoryObj?.icon || (isExpense ? '📉' : '📈')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {item.title || item.category || 'Transaction'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                                  {item.category?.replace(/_/g, ' ')}
                                </span>
                                {item.notes && (
                                  <>
                                    <span className="text-foreground/20">•</span>
                                    <span className="text-[11px] text-foreground/40 truncate max-w-xs">
                                      {item.notes}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date & Ref */}
                        <td className="py-4 px-6">
                          <div className="text-xs font-semibold text-foreground/80">
                            {item.transactionDate ? String(item.transactionDate).slice(0, 10) : '—'}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-foreground/40 mt-0.5">
                            {item.receiptUrl ? '#REC' : `#TX-${(item.financeUuid || '').slice(0, 8)}`}
                          </div>
                        </td>

                        {/* Member / Party */}
                        <td className="py-4 px-6">
                          {item.memberName ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-bold text-foreground">
                              <span>👤</span>
                              <span>{item.memberName}</span>
                            </div>
                          ) : item.paidToOrBy ? (
                            <div className="text-xs font-medium text-foreground/70">
                              {item.paidToOrBy}
                            </div>
                          ) : (
                            <span className="text-xs text-foreground/30 italic">—</span>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-6">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text-muted)',
                            }}
                          >
                            <CreditCard className="w-3 h-3 text-primary" />
                            {item.paymentMethod || 'CASH'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`text-base font-black font-mono tracking-tight ${
                              isExpense ? 'text-rose-500' : 'text-emerald-500'
                            }`}
                          >
                            {isExpense ? '- ' : '+ '}₹{Number(item.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedTxDetail(item)}
                              className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
                              title="View Transaction Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <button
                                onClick={() => {
                                  if (item.financeUuid) handleDelete(item.financeUuid);
                                }}
                                className="p-2 rounded-xl text-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    {/* ========================================================================= */}
      {/* 6. MODAL: RECORD TRANSACTION (RESPONSIVE & MOBILE-OPTIMIZED)             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Drag Handle Bar on Mobile */}
            <div className="sm:hidden w-full pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
            </div>

            {/* Fixed Modal Header */}
            <div className="px-5 sm:px-7 pt-2 sm:pt-6 pb-3 border-b border-foreground/5 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    {modalType === 'EXPENSE' ? 'Record Club Expense' : 'Collect Member Fee'}
                  </h3>
                  <p className="text-xs text-foreground/50 font-medium mt-0.5">
                    {modalType === 'EXPENSE'
                      ? 'Log court rents, shuttle tubes, or maintenance bills.'
                      : 'Log monthly fees and tournament collections.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-1.5 bg-background p-1.5 rounded-2xl border" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('EXPENSE');
                    setFormCategory('Court Rent');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    modalType === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'text-foreground/50 hover:text-rose-400'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('INCOME');
                    setFormCategory('Member Fee');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    modalType === 'INCOME'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
                      : 'text-foreground/50 hover:text-emerald-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Fee / Income
                </button>
              </div>
            </div>

            {/* Form with Scrollable Content Body & Sticky Action Footer */}
            <form onSubmit={handleCreateTransaction} className="flex-1 flex flex-col min-h-0">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-4">
                {/* Category Grid */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1.5">
                    Select Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(modalType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormCategory(cat.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border flex flex-col items-center gap-1 ${
                          formCategory === cat.id
                            ? 'bg-primary/15 text-primary border-primary/40 shadow-sm scale-[1.02]'
                            : 'bg-background/60 border-foreground/5 text-foreground/70 hover:bg-foreground/5'
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="truncate w-full text-[10px] font-black">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Keypad Input & Quick Presets */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Amount (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-foreground/40">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-2xl pl-10 pr-4 py-3 text-2xl font-black text-foreground focus:outline-none focus:border-primary shadow-inner font-mono"
                    />
                  </div>

                  {/* Preset Chips */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto hide-scrollbar">
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider mr-1">Quick:</span>
                    {QUICK_AMOUNT_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetAmount(amt)}
                        className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[11px] font-mono font-black text-foreground/70 whitespace-nowrap transition-colors"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Title / Description
                  </label>
                  <input
                    type="text"
                    placeholder={modalType === 'EXPENSE' ? 'e.g. 10 Boxes of Yonex AS-30 Shuttles' : 'e.g. August Monthly Court Fee'}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>

                {/* Member Picker for Fee collections with Photo and Name */}
                {modalType === 'INCOME' && (
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Athlete / Member
                    </label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                      className="w-full bg-background border border-foreground/10 hover:border-primary/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none transition-all flex items-center justify-between gap-2 shadow-inner"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {(() => {
                          const selMember = members.find((m) => m.organizationMemberUuid === formMemberUuid);
                          if (selMember) {
                            return (
                              <>
                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                                  {selMember.photo ? (
                                    <img
                                      src={UserService.getPhotoUrl(selMember.photo)}
                                      alt={selMember.fullName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <span>{selMember.fullName?.charAt(0) || '👤'}</span>
                                  )}
                                </div>
                                <div className="text-left truncate">
                                  <div className="font-extrabold text-foreground truncate">{selMember.fullName}</div>
                                  {selMember.phone && <div className="text-[10px] text-foreground/40 font-mono">+91 {selMember.phone}</div>}
                                </div>
                              </>
                            );
                          }
                          return (
                            <>
                              <div className="w-7 h-7 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-xs text-foreground/40 shrink-0">
                                👤
                              </div>
                              <div className="text-left text-foreground/60 font-medium truncate">
                                General Collection / Non-Member
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMemberDropdownOpen && (
                      <div className="mt-1.5 w-full bg-surface border border-foreground/10 rounded-2xl shadow-2xl p-2 space-y-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                        {/* Search input if > 4 members */}
                        {members.length > 4 && (
                          <div className="relative mb-1">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                            <input
                              type="text"
                              placeholder="Search athlete by name or phone..."
                              value={memberSearchQuery}
                              onChange={(e) => setMemberSearchQuery(e.target.value)}
                              className="w-full bg-background border border-foreground/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                            />
                          </div>
                        )}

                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {/* General Collection Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormMemberUuid('');
                              setIsMemberDropdownOpen(false);
                            }}
                            className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                              !formMemberUuid ? 'bg-primary/15 text-primary font-bold' : 'hover:bg-foreground/5 text-foreground/70'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center text-xs text-foreground/40 shrink-0">
                                👤
                              </div>
                              <span className="truncate">General Collection / Non-Member</span>
                            </div>
                            {!formMemberUuid && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </button>

                          {/* Members List */}
                          {members
                            .filter(
                              (m) =>
                                m.fullName?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                m.phone?.includes(memberSearchQuery)
                            )
                            .map((m) => {
                              const isSelected = formMemberUuid === m.organizationMemberUuid;
                              return (
                                <button
                                  key={m.organizationMemberUuid}
                                  type="button"
                                  onClick={() => {
                                    setFormMemberUuid(m.organizationMemberUuid);
                                    setIsMemberDropdownOpen(false);
                                  }}
                                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                                    isSelected ? 'bg-primary/15 text-primary font-bold' : 'hover:bg-foreground/5 text-foreground'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/20 flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                                      {m.photo ? (
                                        <img
                                          src={UserService.getPhotoUrl(m.photo)}
                                          alt={m.fullName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <span>{m.fullName?.charAt(0) || '👤'}</span>
                                      )}
                                    </div>
                                    <div className="truncate">
                                      <div className="font-extrabold text-foreground truncate">{m.fullName}</div>
                                      {m.phone && <div className="text-[10px] text-foreground/40 font-mono">+91 {m.phone}</div>}
                                    </div>
                                  </div>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vendor / Paid To */}
                {modalType === 'EXPENSE' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Paid To (Vendor / Arena)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. City Badminton Arena, Pro Sports Shop"
                      value={formPaidToOrBy}
                      onChange={(e) => setFormPaidToOrBy(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                    />
                  </div>
                )}

                {/* Date & Payment Method */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner cursor-pointer"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.icon} {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid via coach GPay, invoice #1029"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              </div>

              {/* Fixed Sticky Action Footer (Always Visible above bottom bar) */}
              <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-foreground/10 px-5 sm:px-7 pt-3.5 pb-6 sm:pb-3.5 flex items-center justify-between gap-3 shrink-0 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-foreground/15 text-xs font-black text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-2xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />} Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TRANSACTION DETAIL SHEET (Tap to inspect details)                     */}
      {/* ========================================================================= */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-foreground/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 pb-6 space-y-5 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Drag Handle Bar on Mobile */}
            <div className="sm:hidden w-full -mt-2 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                  selectedTxDetail.transactionType === 'EXPENSE' ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {selectedTxDetail.transactionType === 'EXPENSE' ? '📉' : '📈'}
                </span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Transaction Details</div>
                  <h3 className="text-base font-black text-foreground truncate">{selectedTxDetail.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              selectedTxDetail.transactionType === 'EXPENSE'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <div className="text-[10px] font-black uppercase tracking-wider opacity-70">
                {selectedTxDetail.transactionType === 'EXPENSE' ? 'Expense Amount' : 'Collected Fee'}
              </div>
              <div className="text-3xl font-black font-mono">
                {selectedTxDetail.transactionType === 'EXPENSE' ? '- ' : '+ '}₹{Number(selectedTxDetail.amount).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Key-Value Details */}
            <div className="bg-background rounded-2xl p-4 border border-foreground/5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/40 font-medium">Category</span>
                <span className="font-extrabold text-foreground">{selectedTxDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/40 font-medium">Date</span>
                <span className="font-mono font-bold text-foreground">{selectedTxDetail.transactionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/40 font-medium">Payment Mode</span>
                <span className="font-black uppercase px-2 py-0.5 rounded-md bg-foreground/5 text-foreground">
                  {selectedTxDetail.paymentMethod || 'UPI'}
                </span>
              </div>
              {selectedTxDetail.memberName && (
                <div className="flex justify-between">
                  <span className="text-foreground/40 font-medium">Member</span>
                  <span className="font-extrabold text-emerald-400">{selectedTxDetail.memberName}</span>
                </div>
              )}
              {selectedTxDetail.paidToOrBy && (
                <div className="flex justify-between">
                  <span className="text-foreground/40 font-medium">Vendor / Paid To</span>
                  <span className="font-extrabold text-foreground">{selectedTxDetail.paidToOrBy}</span>
                </div>
              )}
              {selectedTxDetail.notes && (
                <div className="pt-2 border-t border-foreground/5">
                  <span className="text-foreground/40 font-medium block mb-1">Notes</span>
                  <p className="text-foreground/70">{selectedTxDetail.notes}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedTxDetail.financeUuid) handleDelete(selectedTxDetail.financeUuid);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-black hover:bg-foreground/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}