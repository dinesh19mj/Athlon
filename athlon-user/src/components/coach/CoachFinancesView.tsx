'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Users,
  Zap,
  Target,
  Dumbbell,
  Clock,
  ShieldCheck,
  Send,
  AlertCircle,
  Flame,
  Award,
} from 'lucide-react';
import {
  CoachFinanceService,
  CoachFinance,
  CoachFinanceSummary,
  CreateCoachFinancePayload,
} from '@/lib/api/coachFinance';
import { CoachService, CoachTrainee, CoachFeePackage } from '@/lib/api/coach';

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const COACH_INCOME_CATEGORIES = [
  { id: '1-on-1 Coaching', label: '1-on-1 Personal', icon: '👤' },
  { id: 'Batch Training', label: 'Squad / Batch Fee', icon: '👥' },
  { id: 'Sparring Session', label: 'Match Sparring', icon: '⚔️' },
  { id: 'Bootcamp / Clinic', label: 'Camp / Clinic', icon: '⛺' },
  { id: 'Stringing & Gear', label: 'Stringing / Gear', icon: '🏸' },
  { id: 'Tournament Coaching', label: 'Tournament Allow.', icon: '🏆' },
  { id: 'Other Income', label: 'Other Earnings', icon: '💰' },
];

const COACH_EXPENSE_CATEGORIES = [
  { id: 'Court Rent', label: 'Court Rental', icon: '🏟️' },
  { id: 'Shuttles / Gear', label: 'Shuttles & Balls', icon: '🏸' },
  { id: 'Equipment & Cones', label: 'Training Equipment', icon: '🏃' },
  { id: 'Assistant Coach Pay', label: 'Assistant / Sparring Pay', icon: '🤝' },
  { id: 'Travel & Logistics', label: 'Travel & Commute', icon: '🚗' },
  { id: 'Refreshments', label: 'Hydration & Nutrition', icon: '🥤' },
  { id: 'Other Expense', label: 'Other Expense', icon: '📦' },
];

const QUICK_AMOUNT_PRESETS = [500, 1000, 1500, 2000, 3000, 5000];

interface Props {
  orgUuid: string;
  orgName: string;
}

export default function CoachFinancesView({ orgUuid, orgName }: Props) {
  const [finances, setFinances] = useState<CoachFinance[]>([]);
  const [summary, setSummary] = useState<CoachFinanceSummary | null>(null);
  const [trainees, setTrainees] = useState<CoachTrainee[]>([]);
  const [packages, setPackages] = useState<CoachFeePackage[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Timeframe
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [timeframeMode, setTimeframeMode] = useState<'ALL_TIME' | 'TODAY' | 'THIS_MONTH' | 'CUSTOM'>('ALL_TIME');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'EXPENSE' | 'INCOME'>('INCOME');
  const [selectedTxDetail, setSelectedTxDetail] = useState<CoachFinance | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState<string>('1-on-1 Coaching');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(getLocalDateString());
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('UPI');
  const [formPaidToOrBy, setFormPaidToOrBy] = useState<string>('');
  const [formTraineeUuid, setFormTraineeUuid] = useState<string>('');
  const [formPackageUuid, setFormPackageUuid] = useState<string>('');
  const [formFeeStatus, setFormFeeStatus] = useState<string>('PAID');
  const [formNotes, setFormNotes] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 3500);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Load Roster & Packages
  const loadRoster = async () => {
    if (!orgUuid) return;
    try {
      const [tRes, pRes] = await Promise.allSettled([
        CoachService.getTrainees(orgUuid, 'ACTIVE'),
        CoachService.getPackages(orgUuid, true),
      ]);
      if (tRes.status === 'fulfilled') {
        const tList = Array.isArray(tRes.value) ? tRes.value : ((tRes.value as any)?.data || []);
        setTrainees(tList);
      }
      if (pRes.status === 'fulfilled') {
        const pList = Array.isArray(pRes.value) ? pRes.value : ((pRes.value as any)?.data || []);
        setPackages(pList);
      }
    } catch (err) {
      console.error('Error loading coach roster for finances:', err);
    }
  };

  // Load Financial Records
  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);

      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;

      if (timeframeMode === 'TODAY') {
        startDate = getLocalDateString();
        endDate = getLocalDateString();
      } else if (timeframeMode === 'THIS_MONTH') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate = getLocalDateString(startOfMonth);
        endDate = getLocalDateString(endOfMonth);
      } else if (timeframeMode === 'CUSTOM') {
        startDate = selectedDate;
        endDate = selectedDate;
      }

      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;

      const [listRes, summaryRes] = await Promise.allSettled([
        CoachFinanceService.getFinances(orgUuid, typeParam, startDate, endDate),
        CoachFinanceService.getSummary(orgUuid, startDate, endDate),
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
      console.error('Failed to load coach finances:', err);
      showToast('Failed to load financial records', true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [orgUuid]);

  useEffect(() => {
    loadData();
  }, [orgUuid, timeframeMode, selectedDate, typeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenAdd = (type: 'EXPENSE' | 'INCOME') => {
    setModalType(type);
    setFormCategory(type === 'INCOME' ? '1-on-1 Coaching' : 'Court Rent');
    setFormTitle('');
    setFormAmount('');
    setFormDate(getLocalDateString());
    setFormPaymentMethod('UPI');
    setFormPaidToOrBy('');
    setFormTraineeUuid('');
    setFormPackageUuid('');
    setFormFeeStatus('PAID');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handlePresetAmount = (preset: number) => {
    const current = parseFloat(formAmount || '0');
    setFormAmount(String(current + preset));
  };

  const handleSelectTrainee = (trainee: CoachTrainee) => {
    setFormTraineeUuid(trainee.traineeUuid);
    setFormPaidToOrBy(trainee.fullName);
    if (!formTitle) {
      setFormTitle(`${formCategory} - ${trainee.fullName}`);
    }
    if (trainee.packageUuid) {
      setFormPackageUuid(trainee.packageUuid);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) {
      showToast('Please enter a valid amount', true);
      return;
    }

    try {
      setSubmitting(true);

      const selectedTrainee = trainees.find((t) => t.traineeUuid === formTraineeUuid);
      const selectedPkg = packages.find((p) => p.packageUuid === formPackageUuid);

      const payload: CreateCoachFinancePayload = {
        organizationUuid: orgUuid,
        transactionType: modalType,
        category: formCategory,
        title: formTitle.trim() || `${formCategory} ${modalType === 'INCOME' ? 'Fee' : 'Expense'}`,
        amount: parseFloat(formAmount),
        transactionDate: formDate || getLocalDateString(),
        paymentMethod: formPaymentMethod || 'UPI',
        paidToOrBy: formPaidToOrBy.trim() || undefined,
        traineeUuid: formTraineeUuid || undefined,
        traineeName: selectedTrainee ? selectedTrainee.fullName : undefined,
        packageUuid: formPackageUuid || undefined,
        packageName: selectedPkg ? selectedPkg.name : undefined,
        feeStatus: modalType === 'INCOME' ? formFeeStatus : 'PAID',
        notes: formNotes.trim() || undefined,
      };

      await CoachFinanceService.createFinance(payload);
      setIsModalOpen(false);
      showToast(`${modalType === 'INCOME' ? 'Coaching Revenue' : 'Coach Expense'} recorded successfully!`);
      loadData();
    } catch (err) {
      console.error('Failed to create finance transaction:', err);
      showToast('Failed to save transaction record', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (financeUuid: string) => {
    if (!confirm('Are you sure you want to permanently delete this financial record?')) return;

    try {
      await CoachFinanceService.deleteFinance(financeUuid);
      setFinances((prev) => prev.filter((f) => f.financeUuid !== financeUuid));
      if (selectedTxDetail?.financeUuid === financeUuid) {
        setSelectedTxDetail(null);
      }
      showToast('Transaction record deleted');
      loadData();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      showToast('Failed to delete transaction', true);
    }
  };

  // Filtered List
  const filteredFinances = useMemo(() => {
    return finances.filter((f) => {
      const matchSearch =
        !searchTerm.trim() ||
        (f.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.paidToOrBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.traineeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || f.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [finances, searchTerm, selectedCategory]);

  // Group Chronologically
  const groupedFinances = useMemo(() => {
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const map = new Map<string, { title: string; dateKey: string; items: CoachFinance[]; netChange: number }>();

    filteredFinances.forEach((tx) => {
      const dateKey = tx.transactionDate ? tx.transactionDate.split('T')[0] : 'Unknown';
      let title = dateKey;
      if (dateKey === todayStr) title = 'Today';
      else if (dateKey === yesterdayStr) title = 'Yesterday';
      else {
        try {
          title = new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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

    const groups: { title: string; dateKey: string; items: CoachFinance[]; netChange: number }[] = [];
    map.forEach((val) => groups.push(val));
    return groups;
  }, [filteredFinances]);

  return (
    <div className="w-full max-w-full min-h-screen bg-background pb-36 overflow-x-hidden text-foreground selection:bg-primary/20">
      {/* ── TOAST NOTIFICATIONS ── */}
      {toastMessage && (
        <div className="fixed bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 bg-primary text-primary-foreground text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl shadow-primary/30 border border-primary/40 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 bg-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl shadow-rose-500/30 border border-rose-400/30 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[90vw]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{toastError}</span>
        </div>
      )}

      {/* ── HEADER BAR (THEMED) ── */}
      <div
        className="relative w-full border-b backdrop-blur-2xl bg-card/60"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 space-y-3.5">
          {/* Top Line: Brand Capsule + Fast Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            {/* Title & Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative group shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground leading-tight truncate">
                    Coach Treasury
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary">
                    <Zap className="w-2.5 h-2.5 fill-primary" />
                    Finances
                  </span>
                </div>
                <p className="text-xs text-foreground/50 truncate mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-foreground/80">{orgName}</span>
                  <span>•</span>
                  <span>{finances.length} transaction logs</span>
                </p>
              </div>
            </div>

            {/* Right Buttons: Refresh, Log Expense & Record Income */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-xl border bg-card hover:bg-surface text-foreground/60 hover:text-foreground transition active:scale-95 disabled:opacity-50 shadow-sm"
                style={{ borderColor: 'var(--athlon-border)' }}
                title="Sync financial records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>

              <button
                onClick={() => handleOpenAdd('EXPENSE')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-card hover:bg-surface text-foreground/75 border hover:text-foreground active:scale-95 transition shadow-sm whitespace-nowrap"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <Plus className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
                <span>Log Expense</span>
              </button>

              <button
                onClick={() => handleOpenAdd('INCOME')}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-95 transition whitespace-nowrap"
              >
                <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Collect Revenue</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 space-y-4 sm:space-y-6 w-full max-w-full">
        {/* ── 1. HERO COACH VAULT BENTO METRICS (THEMED) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Net Coaching Profit / Surplus */}
          <div
            className="p-4 rounded-3xl border bg-card shadow-sm flex flex-col justify-between group hover:border-primary/50 transition duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Net Coaching Profit
              </span>
              <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-foreground/40 font-mono">₹</span>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-primary">
                  {loading ? '--' : Number(summary?.netProfit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${Number(summary?.netProfit || 0) >= 0
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
              >
                {Number(summary?.netProfit || 0) >= 0 ? 'Surplus ●' : 'Deficit ●'}
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              Available cash after court rents & gear
            </p>
          </div>

          {/* 2. Total Coaching Revenue (Collected) */}
          <div
            onClick={() => setTypeFilter(typeFilter === 'INCOME' ? 'ALL' : 'INCOME')}
            className={`p-4 rounded-3xl border cursor-pointer shadow-sm flex flex-col justify-between transition-all duration-200 active:scale-98 ${typeFilter === 'INCOME'
                ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                : 'bg-card hover:bg-surface border-border'
              }`}
            style={{ borderColor: typeFilter === 'INCOME' ? undefined : 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                Total Revenue
              </span>
              <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {loading ? '--' : `+₹${Number(summary?.totalIncome || 0).toLocaleString('en-IN')}`}
              </div>
              <span className="text-[10px] font-black text-primary uppercase">
                {typeFilter === 'INCOME' ? 'Active' : 'Collected'}
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              1-on-1 private fees, batches & sparring
            </p>
          </div>

          {/* 3. Operational Expenses (Spent) */}
          <div
            onClick={() => setTypeFilter(typeFilter === 'EXPENSE' ? 'ALL' : 'EXPENSE')}
            className={`p-4 rounded-3xl border cursor-pointer shadow-sm flex flex-col justify-between transition-all duration-200 active:scale-98 ${typeFilter === 'EXPENSE'
                ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
                : 'bg-card hover:bg-surface border-border'
              }`}
            style={{ borderColor: typeFilter === 'EXPENSE' ? undefined : 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">
                Operational Expenses
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-500">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-rose-500 dark:text-rose-400 font-mono tracking-tight">
                {loading ? '--' : `-₹${Number(summary?.totalExpense || 0).toLocaleString('en-IN')}`}
              </div>
              <span className="text-[10px] font-black text-rose-500 uppercase">
                {typeFilter === 'EXPENSE' ? 'Active' : 'Disbursed'}
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              Court bookings, shuttle boxes & travel
            </p>
          </div>

          {/* 4. Pending Receivables / Uncollected Dues */}
          <div
            className="p-4 rounded-3xl border bg-card shadow-sm flex flex-col justify-between"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400">
                Pending Receivables
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 font-mono tracking-tight">
                {loading ? '--' : `₹${Number(summary?.pendingReceivables || 0).toLocaleString('en-IN')}`}
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase">
                Awaiting
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              Outstanding trainee tuition payments
            </p>
          </div>
        </div>

        {/* ── 2. CONTROLS BAR: TIMEFRAME, SEARCH & CATEGORY CHIPS (THEMED) ── */}
        <div className="space-y-3">
          {/* Timeframe Ribbon + Search Bar */}
          <div
            className="p-3 sm:p-4 rounded-3xl border bg-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full max-w-full shadow-sm"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search by trainee, vendor, facility or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-background border rounded-2xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition font-medium"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Timeframe Switcher Tabs */}
            <div
              className="flex items-center gap-1 bg-background border rounded-2xl p-1 shrink-0 overflow-x-auto"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <button
                onClick={() => setTimeframeMode('ALL_TIME')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${timeframeMode === 'ALL_TIME'
                    ? 'bg-primary text-primary-foreground shadow-sm font-black'
                    : 'text-foreground/60 hover:text-foreground'
                  }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeframeMode('THIS_MONTH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${timeframeMode === 'THIS_MONTH'
                    ? 'bg-primary text-primary-foreground shadow-sm font-black'
                    : 'text-foreground/60 hover:text-foreground'
                  }`}
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setTimeframeMode('TODAY');
                  setSelectedDate(getLocalDateString());
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${timeframeMode === 'TODAY'
                    ? 'bg-primary text-primary-foreground shadow-sm font-black'
                    : 'text-foreground/60 hover:text-foreground'
                  }`}
              >
                Today
              </button>

              {/* Native Date Picker Shortcut */}
              <div
                className="relative flex items-center bg-card border rounded-xl px-2 py-1 text-xs font-bold text-foreground"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-primary mr-1" />
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
          </div>

          {/* Category Chips Horizontal Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${selectedCategory === 'ALL'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm font-black scale-105'
                  : 'bg-card border-border text-foreground/70 hover:bg-surface'
                }`}
              style={selectedCategory !== 'ALL' ? { borderColor: 'var(--athlon-border)' } : undefined}
            >
              <span>All Categories</span>
              <span className="text-[10px] opacity-80 font-mono">({finances.length})</span>
            </button>

            {(typeFilter === 'EXPENSE' ? COACH_EXPENSE_CATEGORIES : COACH_INCOME_CATEGORIES).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm font-black scale-105'
                      : 'bg-card border-border text-foreground/70 hover:bg-surface'
                    }`}
                  style={!isSelected ? { borderColor: 'var(--athlon-border)' } : undefined}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. CHRONOLOGICAL TRANSACTION STREAM ── */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative w-14 h-14 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-3 shadow-inner">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
              <p className="text-sm font-black text-foreground">Loading Coach Financial Stream...</p>
              <p className="text-xs text-foreground/45 mt-0.5">Calculating revenue ledger & court expenses</p>
            </div>
          ) : filteredFinances.length === 0 ? (
            <div
              className="py-16 px-4 rounded-3xl border text-center flex flex-col items-center justify-center bg-card shadow-sm"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-3 shadow-inner">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-foreground">No financial transactions recorded</h3>
              <p className="text-xs text-foreground/50 max-w-sm mt-1">
                {searchTerm || selectedCategory !== 'ALL' || typeFilter !== 'ALL'
                  ? 'Try clearing active search or category filters.'
                  : 'Start recording trainee coaching fees or court booking expenses to track your coach workspace treasury.'}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleOpenAdd('INCOME')}
                  className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-md shadow-primary/20 active:scale-95 transition"
                >
                  <IndianRupee className="w-3.5 h-3.5 inline mr-1 stroke-[2.5]" /> Collect Revenue
                </button>
                <button
                  onClick={() => handleOpenAdd('EXPENSE')}
                  className="px-4 py-2 rounded-2xl bg-card hover:bg-surface border text-foreground/75 text-xs font-bold active:scale-95 transition"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Log Expense
                </button>
              </div>
            </div>
          ) : (
            groupedFinances.map((group) => (
              <div key={group.title} className="space-y-2">
                {/* Date Sticky Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                    {group.title}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-black ${group.netChange >= 0 ? 'text-primary' : 'text-rose-500 dark:text-rose-400'
                      }`}
                  >
                    {group.netChange >= 0 ? '+' : ''}₹{Math.abs(group.netChange).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* List Cards */}
                <div
                  className="bg-card border rounded-3xl divide-y overflow-hidden shadow-sm"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  {group.items.map((item) => {
                    const isExpense = item.transactionType === 'EXPENSE';
                    const categoryObj = (isExpense ? COACH_EXPENSE_CATEGORIES : COACH_INCOME_CATEGORIES).find(
                      (c) => c.id === item.category
                    );

                    return (
                      <div
                        key={item.financeUuid}
                        onClick={() => setSelectedTxDetail(item)}
                        className="p-3.5 sm:p-4 hover:bg-surface active:bg-surface/80 transition-colors cursor-pointer flex items-center justify-between gap-3 w-full min-w-0"
                      >
                        {/* Left: Category Icon & Titles */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border shadow-inner ${isExpense
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                              }`}
                          >
                            {categoryObj?.icon || (isExpense ? '📉' : '📈')}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-xs sm:text-sm text-foreground truncate">
                                {item.title}
                              </h4>
                              <span
                                className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-surface text-foreground/60 border"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                {item.paymentMethod || 'UPI'}
                              </span>
                              {item.feeStatus === 'PENDING' && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                  Pending Dues
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-medium text-foreground/50 truncate mt-0.5 flex items-center gap-1.5">
                              <span>{item.category}</span>
                              {(item.paidToOrBy || item.traineeName) && (
                                <>
                                  <span>•</span>
                                  <span className="text-foreground/80 font-semibold truncate">
                                    {item.traineeName || item.paidToOrBy}
                                  </span>
                                </>
                              )}
                              {item.invoiceNumber && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-foreground/40">{item.invoiceNumber}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Date */}
                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-black text-sm sm:text-base ${isExpense ? 'text-rose-500 dark:text-rose-400' : 'text-primary'
                              }`}
                          >
                            {isExpense ? '- ' : '+ '}₹{Number(item.amount).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] font-semibold text-foreground/40 font-mono">
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
      </div>

      {/* ── TRANSACTION DETAIL & RECEIPT MODAL (THEMED) ── */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-card rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Header */}
            <div
              className="p-4 sm:p-5 border-b flex items-center justify-between bg-surface"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-inner ${selectedTxDetail.transactionType === 'INCOME'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    }`}
                >
                  {selectedTxDetail.transactionType === 'INCOME' ? '₹' : '📉'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground leading-tight">
                    Transaction Receipt
                  </h3>
                  <p className="text-[10px] text-foreground/50 font-mono mt-0.5">
                    {selectedTxDetail.invoiceNumber || 'TX-REC'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-surface transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <div
                className="p-4 rounded-2xl bg-background border text-center space-y-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                  Total Amount
                </span>
                <div
                  className={`text-2xl font-black font-mono ${selectedTxDetail.transactionType === 'INCOME' ? 'text-primary' : 'text-rose-500'
                    }`}
                >
                  {selectedTxDetail.transactionType === 'INCOME' ? '+ ' : '- '}₹
                  {Number(selectedTxDetail.amount).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-foreground/60">
                  {selectedTxDetail.feeStatus || 'SETTLED'} • {selectedTxDetail.paymentMethod || 'UPI'}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-foreground/50">Title:</span>
                  <span className="font-bold text-foreground">{selectedTxDetail.title}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-foreground/50">Category:</span>
                  <span className="font-bold text-foreground">{selectedTxDetail.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-foreground/50">Date:</span>
                  <span className="font-bold text-foreground">{selectedTxDetail.transactionDate}</span>
                </div>
                {selectedTxDetail.paidToOrBy && (
                  <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                    <span className="text-foreground/50">Party / Trainee:</span>
                    <span className="font-bold text-foreground">{selectedTxDetail.paidToOrBy}</span>
                  </div>
                )}
                {selectedTxDetail.packageName && (
                  <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                    <span className="text-foreground/50">Coaching Plan:</span>
                    <span className="font-bold text-foreground">{selectedTxDetail.packageName}</span>
                  </div>
                )}
                {selectedTxDetail.notes && (
                  <div className="py-1.5">
                    <span className="text-foreground/50 block mb-1">Notes:</span>
                    <p
                      className="p-2.5 rounded-xl bg-background border text-[11px] text-foreground/75 italic"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      "{selectedTxDetail.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div
              className="p-3.5 sm:p-4 border-t bg-card flex items-center justify-between"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <button
                onClick={() => handleDelete(selectedTxDetail.financeUuid)}
                className="px-3.5 py-2 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedTxDetail(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition text-xs shadow-md shadow-primary/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE TRANSACTION MODAL (THEMED) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-card rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Top Header */}
            <div
              className="p-4 sm:p-5 border-b flex items-center justify-between bg-surface"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner ${modalType === 'INCOME'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    }`}
                >
                  {modalType === 'INCOME' ? '₹' : '💸'}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground leading-tight">
                    {modalType === 'INCOME' ? 'Record Coaching Income' : 'Log Coach Expense'}
                  </h3>
                  <p className="text-[11px] text-foreground/50 mt-0.5">
                    {modalType === 'INCOME'
                      ? 'Private 1-on-1 fee, squad tuition, or camp registration'
                      : 'Court bookings, shuttle box purchases, gear & travel'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-surface transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTransaction} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Category Selector Grid */}
              <div>
                <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-2">
                  Select Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(modalType === 'INCOME' ? COACH_INCOME_CATEGORIES : COACH_EXPENSE_CATEGORIES).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormCategory(cat.id);
                        if (!formTitle || formTitle.includes('Coaching') || formTitle.includes('Court')) {
                          setFormTitle(cat.label);
                        }
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition-all text-xs font-bold flex items-center gap-2 ${formCategory === cat.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-102 font-black'
                          : 'bg-background hover:bg-surface text-foreground/70'
                        }`}
                      style={formCategory !== cat.id ? { borderColor: 'var(--athlon-border)' } : undefined}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + Presets */}
              <div>
                <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-sm text-foreground/40 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border rounded-2xl text-base font-black font-mono text-foreground focus:outline-none focus:border-primary transition"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                {/* Preset Amount Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] font-bold text-foreground/40">+ Presets:</span>
                  {QUICK_AMOUNT_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetAmount(amt)}
                      className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-xl bg-background hover:bg-surface border text-foreground/80 transition active:scale-95"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                  Transaction Title / Description
                </label>
                <input
                  type="text"
                  placeholder={modalType === 'INCOME' ? 'e.g. Monthly Private Coaching - Rahul' : 'e.g. Court 3 Rent for 2 Hours'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border rounded-2xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary font-medium"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Trainee link (if INCOME) */}
              {modalType === 'INCOME' && trainees.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Link Enrolled Trainee (Optional)</span>
                    {formTraineeUuid && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormTraineeUuid('');
                          setFormPaidToOrBy('');
                        }}
                        className="text-[10px] text-rose-500 font-bold"
                      >
                        Clear Trainee
                      </button>
                    )}
                  </label>
                  <select
                    value={formTraineeUuid}
                    onChange={(e) => {
                      const t = trainees.find((tr) => tr.traineeUuid === e.target.value);
                      if (t) handleSelectTrainee(t);
                      else setFormTraineeUuid('');
                    }}
                    className="w-full px-3 py-2.5 bg-background border rounded-2xl text-xs text-foreground focus:outline-none focus:border-primary font-medium"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="">-- No Trainee Linked / General Income --</option>
                    {trainees.map((t) => (
                      <option key={t.traineeUuid} value={t.traineeUuid}>
                        {t.fullName} {t.packageName ? `(${t.packageName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Paid By / Vendor (if not trainee) */}
              <div>
                <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                  {modalType === 'INCOME' ? 'Paid By / Client Name' : 'Paid To / Vendor / Venue'}
                </label>
                <input
                  type="text"
                  placeholder={modalType === 'INCOME' ? 'Client / Parent Name' : 'e.g. Kanteerava Stadium, Yonex Shop'}
                  value={formPaidToOrBy}
                  onChange={(e) => setFormPaidToOrBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border rounded-2xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary font-medium"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Row: Date + Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border rounded-2xl text-xs text-foreground font-bold focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border rounded-2xl text-xs text-foreground font-bold focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="UPI">⚡ UPI / GPay / PhonePe</option>
                    <option value="CASH">💵 Cash</option>
                    <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                    <option value="CARD">💳 Debit / Credit Card</option>
                    <option value="CHEQUE">📝 Cheque</option>
                  </select>
                </div>
              </div>

              {/* Fee Status (if INCOME) */}
              {modalType === 'INCOME' && (
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                    Payment Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormFeeStatus('PAID')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${formFeeStatus === 'PAID'
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm font-black'
                          : 'bg-background text-foreground/60'
                        }`}
                      style={formFeeStatus !== 'PAID' ? { borderColor: 'var(--athlon-border)' } : undefined}
                    >
                      ✓ Paid / Received
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormFeeStatus('PENDING')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${formFeeStatus === 'PENDING'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm font-black'
                          : 'bg-background text-foreground/60'
                        }`}
                      style={formFeeStatus !== 'PENDING' ? { borderColor: 'var(--athlon-border)' } : undefined}
                    >
                      ⏳ Pending Dues
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5">
                  Coach Notes / Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional reference, session hours or receipt notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border rounded-2xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary resize-none font-medium"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-2 pt-2 border-t"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/60 hover:text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition active:scale-95 shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IndianRupee className="w-3.5 h-3.5" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
