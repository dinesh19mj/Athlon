'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Trophy,
  Calendar as CalendarIcon,
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
  PieChart,
  IndianRupee,
  ChevronDown,
  Sparkles,
  Layers,
  Clock,
  User,
  ShieldCheck,
  Receipt,
  Edit3,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Wallet,
  Eye,
} from 'lucide-react';
import {
  OrganizerFinance,
  OrganizerFinanceSummary,
  OrganizerFinanceService,
  CreateOrganizerFinancePayload,
  UpdateOrganizerFinancePayload,
  ORGANIZER_INCOME_CATEGORIES,
  ORGANIZER_EXPENSE_CATEGORIES,
  ORGANIZER_PAYMENT_METHODS,
  OrganizerTransactionType,
  OrganizerPaymentStatus
} from '@/lib/api/organizerFinance';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { useOrgRole } from '@/hooks/use-org-role';
import { usePermissions } from '@/hooks/use-permissions';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

interface OrganizerFinancesViewProps {
  orgUuid: string;
  orgName: string;
}

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const QUICK_AMOUNT_PRESETS = [500, 1000, 2000, 5000, 10000, 25000];

export default function OrganizerFinancesView({ orgUuid, orgName }: OrganizerFinancesViewProps) {
  const { role, isAdmin } = useOrgRole(orgUuid);
  const { canManageModule } = usePermissions(orgUuid);
  const canManage = canManageModule('finances') || isAdmin || role === 'OWNER' || role === 'ADMIN';

  const [finances, setFinances] = useState<OrganizerFinance[]>([]);
  const [summary, setSummary] = useState<OrganizerFinanceSummary | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [selectedTournamentUuid, setSelectedTournamentUuid] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [timeframeMode, setTimeframeMode] = useState<'ALL_TIME' | 'TODAY' | 'CUSTOM'>('ALL_TIME');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<OrganizerTransactionType>('EXPENSE');
  const [editingFinance, setEditingFinance] = useState<OrganizerFinance | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<OrganizerFinance | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formTournamentUuid, setFormTournamentUuid] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('VENUE_COURT_RENTAL');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(getLocalDateString());
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');
  const [formPaymentStatus, setFormPaymentStatus] = useState<OrganizerPaymentStatus>('COMPLETED');
  const [formPaidToOrBy, setFormPaidToOrBy] = useState('');
  const [formInvoiceNo, setFormInvoiceNo] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Initial Data Load
  useEffect(() => {
    if (orgUuid) {
      loadTournaments();
    }
  }, [orgUuid]);

  useEffect(() => {
    if (orgUuid) {
      loadData();
    }
  }, [orgUuid, selectedTournamentUuid, typeFilter, timeframeMode, selectedDate]);

  const loadTournaments = async () => {
    try {
      const res = await TournamentService.getByOrg(orgUuid);
      const list = Array.isArray(res) ? res : ((res as any)?.data || []);
      setTournaments(list);
    } catch (err) {
      console.warn('Could not load tournaments for org:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const dateParam = timeframeMode === 'ALL_TIME' ? undefined : selectedDate;
      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;
      const tournamentParam = selectedTournamentUuid === 'ALL' ? undefined : selectedTournamentUuid;

      const [listRes, summaryRes] = await Promise.allSettled([
        OrganizerFinanceService.getFinances(orgUuid, {
          tournamentUuid: tournamentParam,
          type: typeParam,
          startDate: dateParam,
          endDate: dateParam,
        }),
        OrganizerFinanceService.getSummary(orgUuid, {
          tournamentUuid: tournamentParam,
          startDate: dateParam,
          endDate: dateParam,
        }),
      ]);

      if (listRes.status === 'fulfilled') {
        const list = Array.isArray(listRes.value) ? listRes.value : ((listRes.value as any)?.data || []);
        setFinances(list);
      }

      if (summaryRes.status === 'fulfilled') {
        const sum = (summaryRes.value as any)?.data || summaryRes.value;
        setSummary(sum);
      }
    } catch (err) {
      console.error('Failed to load organizer finances:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    loadTournaments();
  };

  const handleOpenAdd = (type: OrganizerTransactionType) => {
    setEditingFinance(null);
    setModalType(type);
    setFormCategory(type === 'EXPENSE' ? 'VENUE_COURT_RENTAL' : 'REGISTRATION_FEES');
    setFormTitle('');
    setFormAmount('');
    setFormDate(getLocalDateString());
    setFormTournamentUuid(selectedTournamentUuid !== 'ALL' ? selectedTournamentUuid : '');
    setFormPaymentMethod('UPI');
    setFormPaymentStatus('COMPLETED');
    setFormPaidToOrBy('');
    setFormInvoiceNo('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: OrganizerFinance) => {
    setEditingFinance(item);
    setModalType(item.transactionType);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormAmount(String(item.amount));
    setFormDate(item.transactionDate ? item.transactionDate.split('T')[0] : getLocalDateString());
    setFormTournamentUuid(item.tournamentUuid || '');
    setFormPaymentMethod(item.paymentMethod || 'UPI');
    setFormPaymentStatus(item.paymentStatus || 'COMPLETED');
    setFormPaidToOrBy(item.paidToOrBy || '');
    setFormInvoiceNo(item.invoiceOrReceiptNo || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handlePresetAmount = (preset: number) => {
    const current = parseFloat(formAmount || '0');
    setFormAmount(String(current + preset));
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) return;

    try {
      setSubmitting(true);
      const selectedTourn = tournaments.find((t) => t.tournamentUuid === formTournamentUuid);

      if (editingFinance) {
        const payload: UpdateOrganizerFinancePayload = {
          financeUuid: editingFinance.financeUuid,
          tournamentUuid: formTournamentUuid || undefined,
          tournamentName: selectedTourn?.name || undefined,
          transactionType: modalType,
          category: formCategory,
          title: formTitle.trim() || formCategory,
          amount: parseFloat(formAmount),
          transactionDate: formDate || getLocalDateString(),
          paymentMethod: formPaymentMethod,
          paymentStatus: formPaymentStatus,
          paidToOrBy: formPaidToOrBy.trim() || undefined,
          invoiceOrReceiptNo: formInvoiceNo.trim() || undefined,
          notes: formNotes.trim() || undefined,
        };
        await OrganizerFinanceService.updateFinance(payload);
        setToastMessage('Transaction updated successfully!');
      } else {
        const payload: CreateOrganizerFinancePayload = {
          organizationUuid: orgUuid,
          tournamentUuid: formTournamentUuid || undefined,
          tournamentName: selectedTourn?.name || undefined,
          transactionType: modalType,
          category: formCategory,
          title: formTitle.trim() || formCategory,
          amount: parseFloat(formAmount),
          transactionDate: formDate || getLocalDateString(),
          paymentMethod: formPaymentMethod,
          paymentStatus: formPaymentStatus,
          paidToOrBy: formPaidToOrBy.trim() || undefined,
          invoiceOrReceiptNo: formInvoiceNo.trim() || undefined,
          notes: formNotes.trim() || undefined,
        };
        await OrganizerFinanceService.createFinance(payload);
        setToastMessage(`${modalType === 'EXPENSE' ? 'Expense' : 'Income'} recorded successfully!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (financeUuid: string) => {
    if (!confirm('Are you sure you want to delete this financial ledger record?')) return;
    try {
      await OrganizerFinanceService.deleteFinance(financeUuid);
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
        (f.tournamentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.invoiceOrReceiptNo || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || f.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [finances, searchTerm, selectedCategory]);

  // Group transactions by date
  const groupedFinances = useMemo(() => {
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const groups: { title: string; dateKey: string; items: OrganizerFinance[]; netChange: number }[] = [];
    const map = new Map<string, { title: string; dateKey: string; items: OrganizerFinance[]; netChange: number }>();

    filteredFinances.forEach((tx) => {
      const dateKey = tx.transactionDate ? tx.transactionDate.split('T')[0] : 'Unknown';
      let title = dateKey;
      if (dateKey === todayStr) title = 'Today';
      else if (dateKey === yesterdayStr) title = 'Yesterday';
      else {
        try {
          title = new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
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

    map.forEach((value) => {
      groups.push(value);
    });

    return groups;
  }, [filteredFinances]);

  // Visual Category Distribution
  const categoryPercentages = useMemo(() => {
    if (!summary?.expenseByCategory || Object.keys(summary.expenseByCategory).length === 0) return [];
    const totalExp = summary.totalExpense || 1;

    return Object.entries(summary.expenseByCategory)
      .map(([cat, amt]) => {
        const catObj = ORGANIZER_EXPENSE_CATEGORIES.find((c) => c.id === cat);
        return {
          category: cat,
          label: catObj?.label || cat,
          icon: catObj?.icon || '📦',
          amount: amt,
          percentage: Math.round((amt / totalExp) * 100),
        };
      })
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
      {/* 📱 MOBILE VIEW (HIGH PERFORMANCE & LUXURY ORGANIZER TREASURY)             */}
      {/* ========================================================================= */}
      <div className="block md:hidden p-3.5 space-y-4 animate-in fade-in duration-300">
        {/* 1. Mobile Header matching Venues sample page */}
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-border/80 safe-header pb-3 px-3.5 -mx-3.5 -mt-3.5 mb-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500/20 via-primary/15 to-transparent border border-primary/25 flex items-center justify-center text-base shadow-xs shrink-0">
                🏆
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black text-foreground tracking-tight truncate">
                    Organizer Treasury
                  </h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] font-semibold text-foreground/50 truncate mt-0.5">
                  {orgName || 'Tournament Organization'} • {finances.length} records
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-9 h-9 rounded-xl bg-surface border border-border/80 text-foreground/70 active:scale-95 transition-all disabled:opacity-50 shadow-xs flex items-center justify-center"
                title="Refresh Finances"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* 2. Tournament Switcher Tabs */}
        {tournaments.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedTournamentUuid('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${selectedTournamentUuid === 'ALL'
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-surface border-foreground/5 text-foreground/60'
                }`}
            >
              <span>All Tournaments</span>
            </button>
            {tournaments.map((t) => {
              const isSelected = selectedTournamentUuid === t.tournamentUuid;
              return (
                <button
                  key={t.tournamentUuid}
                  onClick={() => setSelectedTournamentUuid(isSelected ? 'ALL' : t.tournamentUuid)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${isSelected
                      ? 'bg-primary text-black border-primary/30 shadow-sm'
                      : 'bg-surface border-foreground/5 text-foreground/60'
                    }`}
                >
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[130px]">{t.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Hero Tournament Vault Card */}
        <div className="relative overflow-hidden rounded-[28px] bg-surface dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-900/95 dark:to-neutral-950 border border-foreground/10 p-5 shadow-sm dark:shadow-2xl space-y-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

          {/* Card Top Strip */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-foreground/5 text-foreground/70 border border-foreground/10">
                EVENT TREASURY VAULT
              </span>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${Number(summary?.netProfit || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
            >
              {Number(summary?.netProfit || 0) >= 0 ? 'Net Surplus ●' : 'Net Deficit ●'}
            </span>
          </div>

          {/* Centerpiece: Net Profit */}
          <div className="relative space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
              Net Tournament P&L
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-foreground/40 font-mono">₹</span>
              <span
                className={`text-4xl font-black tracking-tight font-mono ${Number(summary?.netProfit || 0) >= 0 ? 'text-primary' : 'text-rose-600 dark:text-rose-400'
                  }`}
              >
                {Number(summary?.netProfit || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Two-Column Flow: Collections vs Expenses */}
          <div className="relative grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setTypeFilter(typeFilter === 'INCOME' ? 'ALL' : 'INCOME')}
              className={`p-3 rounded-2xl text-left transition-all border ${typeFilter === 'INCOME'
                  ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/20 active:scale-[0.98]'
                }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Total Revenue
                </span>
                {typeFilter === 'INCOME' && <span className="text-[9px] font-mono">ACTIVE</span>}
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                +₹{Number(summary?.totalIncome || 0).toLocaleString('en-IN')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter(typeFilter === 'EXPENSE' ? 'ALL' : 'EXPENSE')}
              className={`p-3 rounded-2xl text-left transition-all border ${typeFilter === 'EXPENSE'
                  ? 'bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500/30'
                  : 'bg-rose-500/10 border-rose-500/20 active:scale-[0.98]'
                }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Total Costs
                </span>
                {typeFilter === 'EXPENSE' && <span className="text-[9px] font-mono">ACTIVE</span>}
              </div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 truncate">
                -₹{Number(summary?.totalExpense || 0).toLocaleString('en-IN')}
              </div>
            </button>
          </div>

          {/* Pending Receivables & Payables pill */}
          {(Number(summary?.pendingReceivables || 0) > 0 || Number(summary?.pendingPayables || 0) > 0) && (
            <div className="relative flex items-center justify-between pt-1 text-[11px] font-bold text-foreground/60 border-t border-foreground/5">
              <span>
                Pending In: <b className="text-emerald-500 font-mono">₹{Number(summary?.pendingReceivables || 0).toLocaleString('en-IN')}</b>
              </span>
              <span>
                Pending Out: <b className="text-rose-500 font-mono">₹{Number(summary?.pendingPayables || 0).toLocaleString('en-IN')}</b>
              </span>
            </div>
          )}

          {/* Quick Action Buttons inside Mobile Card */}
          {canManage && (
            <div className="relative grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => handleOpenAdd('EXPENSE')}
                className="py-3 px-3 rounded-2xl bg-rose-500 text-white text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Cost
              </button>
              <button
                onClick={() => handleOpenAdd('INCOME')}
                className="py-3 px-3 rounded-2xl bg-emerald-500 text-black text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <IndianRupee className="w-4 h-4 stroke-[3]" /> Log Revenue
              </button>
            </div>
          )}
        </div>

        {/* 4. Category Spend Distribution */}
        {categoryPercentages.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-surface border border-foreground/10 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-foreground/50">
              <span className="flex items-center gap-1 text-foreground/70">
                <PieChart className="w-3.5 h-3.5 text-primary" /> Cost Distribution
              </span>
              <span className="text-[10px] font-mono font-bold text-foreground/40">
                {categoryPercentages.length} Categories
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-foreground/10 overflow-hidden flex gap-0.5 p-0.5">
              {categoryPercentages.map((item, idx) => {
                const colors = ['bg-yellow-400', 'bg-rose-400', 'bg-orange-400', 'bg-blue-400', 'bg-purple-400', 'bg-emerald-400', 'bg-cyan-400', 'bg-slate-400'];
                const col = colors[idx % colors.length];
                return (
                  <div
                    key={item.category}
                    className={`h-full rounded-sm ${col} transition-all`}
                    style={{ width: `${Math.max(item.percentage, 6)}%` }}
                    title={`${item.label}: ₹${item.amount}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
              {categoryPercentages.map((item, idx) => {
                const colors = ['text-yellow-400', 'text-rose-400', 'text-orange-400', 'text-blue-400', 'text-purple-400', 'text-emerald-400', 'text-cyan-400', 'text-slate-400'];
                const col = colors[idx % colors.length];
                return (
                  <div
                    key={item.category}
                    className="flex items-center gap-1 text-[10px] font-bold text-foreground/60 whitespace-nowrap bg-background px-2 py-1 rounded-lg border border-foreground/5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${col.replace('text-', 'bg-')}`} />
                    <span>{item.icon} {item.label}:</span>
                    <span className="font-mono text-foreground font-black">₹{item.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Controls: Timeframe, Search, and Category Chips */}
        <div className="space-y-2">
          {/* Timeframe Bar */}
          <div className="flex items-center justify-between gap-1.5 bg-surface border border-foreground/10 rounded-2xl p-1.5">
            <button
              onClick={() => setTimeframeMode('ALL_TIME')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${timeframeMode === 'ALL_TIME'
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
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${timeframeMode === 'TODAY'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              Today
            </button>

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
              placeholder="Search expenses, sponsors, umpire fees, bills..."
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
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${selectedCategory === 'ALL'
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-surface border-foreground/5 text-foreground/60'
                }`}
            >
              <span>All Categories</span>
            </button>
            {[...ORGANIZER_EXPENSE_CATEGORIES, ...ORGANIZER_INCOME_CATEGORIES].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${isSelected
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
        </div>

        {/* 6. Transactions Stream */}
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
                <h3 className="text-sm font-black text-foreground">No Event Transactions Found</h3>
                <p className="text-xs text-foreground/50 max-w-xs mx-auto mt-1">
                  Track venue rent, umpire stipends, shuttle purchases, entry fee collections, or brand sponsorships.
                </p>
              </div>
              {canManage && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenAdd('EXPENSE')}
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-500/20"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Cost
                  </button>
                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black shadow-md shadow-emerald-500/20"
                  >
                    Log Revenue
                  </button>
                </div>
              )}
            </div>
          ) : (
            groupedFinances.map((group) => (
              <div key={`mob-grp-${group.title}`} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                    {group.title}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-black ${group.netChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                  >
                    {group.netChange >= 0 ? '+' : ''}₹{Math.abs(group.netChange).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-surface border border-foreground/10 rounded-[24px] divide-y divide-foreground/5 overflow-hidden shadow-sm">
                  {group.items.map((item) => {
                    const isExpense = item.transactionType === 'EXPENSE';
                    const categoryObj = (isExpense ? ORGANIZER_EXPENSE_CATEGORIES : ORGANIZER_INCOME_CATEGORIES).find(
                      (c) => c.id === item.category
                    );

                    return (
                      <div
                        key={`mob-tx-${item.financeUuid}`}
                        onClick={() => setSelectedTxDetail(item)}
                        className="p-3.5 active:bg-foreground/5 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-gradient-to-br ${categoryObj?.color ||
                              (isExpense
                                ? 'from-rose-500/20 to-rose-600/10 text-rose-400'
                                : 'from-emerald-500/20 to-emerald-600/10 text-emerald-400')
                              } border border-foreground/5 shadow-inner`}
                          >
                            {categoryObj?.icon || (isExpense ? '📉' : '📈')}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-foreground truncate">{item.title}</h4>
                              {item.paymentStatus && item.paymentStatus !== 'COMPLETED' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  {item.paymentStatus}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-medium text-foreground/40 truncate mt-0.5 flex items-center gap-1">
                              <span>{categoryObj?.label || item.category}</span>
                              {item.tournamentName && (
                                <>
                                  <span>•</span>
                                  <span className="text-primary font-bold truncate max-w-[120px]">
                                    {item.tournamentName}
                                  </span>
                                </>
                              )}
                              {item.paidToOrBy && (
                                <>
                                  <span>•</span>
                                  <span className="text-foreground/70 font-semibold truncate">{item.paidToOrBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-black text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                          >
                            {isExpense ? '- ' : '+ '}₹{Number(item.amount).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] font-semibold text-foreground/30 font-mono">
                            {item.paymentMethod || 'UPI'}
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
              <span>Cost</span>
            </button>
            <button
              onClick={() => handleOpenAdd('INCOME')}
              className="px-3.5 py-2.5 rounded-full bg-emerald-500 text-black font-black text-xs tracking-wide shadow-2xl shadow-emerald-500/40 flex items-center gap-1.5 active:scale-90 transition-all border border-black/10"
            >
              <IndianRupee className="w-3.5 h-3.5 stroke-[3]" />
              <span>Revenue</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP VIEW (LUXURY SPORTS-TECH COMMAND CONSOLE)                       */}
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
                  Tournament Operations Suite
                </span>
                <span className="text-foreground/30">•</span>
                <span className="text-xs font-semibold text-foreground/50">
                  Treasury &amp; Financial Ledger
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Tournament Financial Treasury
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {filteredFinances.length} {filteredFinances.length === 1 ? 'Record' : 'Records'}
                </span>
              </h1>
              <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl">
                Oversee tournament registration fees, sponsorship revenues, court rentals, umpire stipends, and prize allocations with real-time audit tracking.
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
                    className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Cost</span>
                  </button>

                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500 text-black shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <IndianRupee className="w-4 h-4 stroke-[3]" />
                    <span>Log Revenue</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── 4-Metric Executive Telemetry HUD ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Net P&L */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-primary/40 transition-all group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Net Tournament P&amp;L
              </span>
              <span
                className={`text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  Number(summary?.netProfit || 0) >= 0
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                {Number(summary?.netProfit || 0) >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
            <div
              className={`text-2xl font-black mt-2 font-mono tracking-tight ${
                Number(summary?.netProfit || 0) >= 0
                  ? 'text-primary'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              ₹{Number(summary?.netProfit || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span>Overall net balance across events</span>
            </div>
          </div>

          {/* 2. Total Inflow / Revenue */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono tracking-tight">
              +₹{Number(summary?.totalIncome || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Entry fees, sponsorships &amp; stalls</span>
            </div>
          </div>

          {/* 3. Total Outflow / Costs */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-rose-500/40 transition-all group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Total Costs
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 font-mono tracking-tight">
              -₹{Number(summary?.totalExpense || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>Court rent, prizes, umpires &amp; gear</span>
            </div>
          </div>

          {/* 4. Pending Settlements */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-amber-500/40 transition-all group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Pending Settlements
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 font-mono mt-2">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                +₹{Number(summary?.pendingReceivables || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-foreground/30">/</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                -₹{Number(summary?.pendingPayables || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <span>Uncollected entries vs pending payables</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Filter Command Deck ────────────────────────────── */}
        <div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, sponsor, vendor, receipt..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/40 shadow-2xs"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border-subtle)',
                color: 'var(--athlon-text)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Tournament Selector */}
            {tournaments.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground/50">Event:</span>
                <select
                  value={selectedTournamentUuid}
                  onChange={(e) => setSelectedTournamentUuid(e.target.value)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border-subtle)',
                    color: 'var(--athlon-text)',
                  }}
                >
                  <option value="ALL">All Tournaments</option>
                  {tournaments.map((t) => (
                    <option key={t.tournamentUuid} value={t.tournamentUuid}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type Filter Tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border-subtle)',
              }}
            >
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => {
                const isSelected = typeFilter === t;
                const label = t === 'ALL' ? 'All Records' : t === 'INCOME' ? 'Revenue (+)' : 'Costs (-)';
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? t === 'INCOME'
                          ? 'bg-emerald-500 text-black shadow-sm font-black'
                          : t === 'EXPENSE'
                          ? 'bg-rose-500 text-white shadow-sm font-black'
                          : 'bg-primary text-primary-foreground shadow-sm font-black'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Desktop Financial Ledger Data Table ─────────────────────── */}
        <div
          className="rounded-2xl border shadow-xs overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                Loading Tournament Ledger &amp; Cashflow...
              </p>
            </div>
          ) : filteredFinances.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-foreground mb-1">No Financial Records Found</h4>
              <p className="text-xs text-foreground/50 max-w-sm mb-4">
                {searchTerm || selectedTournamentUuid !== 'ALL' || typeFilter !== 'ALL'
                  ? 'No transactions match your search query or filter selection.'
                  : 'Start tracking venue costs, umpire stipends, shuttle purchases, entry fee inflows, and brand deals.'}
              </p>
              {searchTerm || selectedTournamentUuid !== 'ALL' || typeFilter !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTournamentUuid('ALL');
                    setTypeFilter('ALL');
                    setSelectedCategory('ALL');
                  }}
                  className="px-4 py-2 border text-foreground text-xs font-bold rounded-xl transition-colors hover:border-primary"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  Reset All Filters
                </button>
              ) : canManage ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAdd('EXPENSE')}
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Cost
                  </button>
                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black shadow-md"
                  >
                    <IndianRupee className="w-3.5 h-3.5 inline mr-1" /> Log Revenue
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: 'var(--athlon-border-subtle)',
                      backgroundColor: 'var(--athlon-surface)',
                    }}
                  >
                    <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Transaction &amp; Category
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Date &amp; Ref
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Tournament Event
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Party / Vendor
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Method &amp; Status
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50 text-right">
                      Amount
                    </th>
                    <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10.5px] text-foreground/50 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: 'var(--athlon-border-subtle)' }}
                >
                  {filteredFinances.map((item) => {
                    const isExpense = item.transactionType === 'EXPENSE';
                    const catObj = (isExpense ? ORGANIZER_EXPENSE_CATEGORIES : ORGANIZER_INCOME_CATEGORIES).find(
                      (c) => c.id === item.category
                    );

                    return (
                      <tr
                        key={item.financeUuid}
                        onClick={() => setSelectedTxDetail(item)}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        {/* 1. Transaction Title & Category */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              {catObj?.icon || (isExpense ? '📉' : '📈')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-foreground text-xs truncate max-w-[200px] group-hover:text-primary transition-colors">
                                {item.title}
                              </div>
                              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                                {catObj?.label || item.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Date & Ref */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-xs text-foreground/80">
                            {item.transactionDate ? item.transactionDate.split('T')[0] : '—'}
                          </div>
                          {item.invoiceOrReceiptNo && (
                            <span className="text-[10px] font-mono text-primary font-bold">
                              #{item.invoiceOrReceiptNo}
                            </span>
                          )}
                        </td>

                        {/* 3. Tournament Event */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.tournamentName ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border text-foreground/80 max-w-[170px] truncate"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              <Trophy className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{item.tournamentName}</span>
                            </span>
                          ) : (
                            <span className="text-foreground/30 text-xs italic">General Ops</span>
                          )}
                        </td>

                        {/* 4. Party / Vendor */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-foreground/70">
                            {item.paidToOrBy || '—'}
                          </span>
                        </td>

                        {/* 5. Method & Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border text-foreground/70"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              {item.paymentMethod || 'UPI'}
                            </span>
                            {item.paymentStatus && item.paymentStatus !== 'COMPLETED' ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {item.paymentStatus}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                Paid
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Amount */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-black text-sm">
                          <span
                            className={
                              isExpense
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }
                          >
                            {isExpense ? '- ' : '+ '}₹{Number(item.amount).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* 7. Actions */}
                        <td
                          className="py-3.5 px-5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTxDetail(item)}
                              className="p-1.5 rounded-lg border text-foreground/60 hover:text-primary hover:border-primary transition-colors shadow-2xs"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                              title="View receipt dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 rounded-lg border text-foreground/60 hover:text-foreground hover:border-primary transition-colors shadow-2xs"
                                  style={{
                                    backgroundColor: 'var(--athlon-surface)',
                                    borderColor: 'var(--athlon-border-subtle)',
                                  }}
                                  title="Edit Transaction"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.financeUuid)}
                                  className="p-1.5 rounded-lg border text-foreground/60 hover:text-rose-500 hover:border-rose-500 transition-colors shadow-2xs"
                                  style={{
                                    backgroundColor: 'var(--athlon-surface)',
                                    borderColor: 'var(--athlon-border-subtle)',
                                  }}
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
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
      {/* 📝 ADD / EDIT TRANSACTION MODAL / BOTTOM SHEET                            */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/15 rounded-t-[32px] md:rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${modalType === 'EXPENSE' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                >
                  {modalType === 'EXPENSE' ? '📉' : '📈'}
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">
                    {editingFinance ? 'Edit Transaction' : modalType === 'EXPENSE' ? 'Log Tournament Cost' : 'Log Tournament Revenue'}
                  </h3>
                  <p className="text-[11px] font-semibold text-foreground/50">
                    Organizer Financial Management Ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Income / Expense Switcher (when not editing) */}
            {!editingFinance && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-background rounded-2xl border border-foreground/10">
                <button
                  type="button"
                  onClick={() => {
                    setModalType('EXPENSE');
                    setFormCategory('VENUE_COURT_RENTAL');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${modalType === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-foreground/60 hover:text-foreground'
                    }`}
                >
                  Expense / Cost
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('INCOME');
                    setFormCategory('REGISTRATION_FEES');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${modalType === 'INCOME'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-foreground/60 hover:text-foreground'
                    }`}
                >
                  Revenue / Income
                </button>
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-3.5">
              {/* Tournament Assignment */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Assign to Tournament (Optional)
                </label>
                <select
                  value={formTournamentUuid}
                  onChange={(e) => setFormTournamentUuid(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">— General / Workspace Level —</option>
                  {tournaments.map((t) => (
                    <option key={t.tournamentUuid} value={t.tournamentUuid}>
                      🏆 {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection Grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {(modalType === 'EXPENSE' ? ORGANIZER_EXPENSE_CATEGORIES : ORGANIZER_INCOME_CATEGORIES).map((cat) => {
                    const isSelected = formCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormCategory(cat.id)}
                        className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${isSelected
                            ? 'bg-primary/20 border-primary text-foreground font-black'
                            : 'bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-[11px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Description / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Badminton Court Rental 3 Days, Yonex Aerosensa 2 Tubes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Amount & Quick Preset Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-foreground/40">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-2xl pl-8 pr-3.5 py-2.5 text-sm font-black font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                  {QUICK_AMOUNT_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => handlePresetAmount(preset)}
                      className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-[10px] font-mono font-bold text-foreground/70 whitespace-nowrap"
                    >
                      +₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Payment Method & Status */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  >
                    {ORGANIZER_PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.icon} {pm.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                    {modalType === 'EXPENSE' ? 'Paid To' : 'Received From'}
                  </label>
                  <input
                    type="text"
                    placeholder={modalType === 'EXPENSE' ? 'e.g. Venue, Umpire, Supplier' : 'e.g. Sponsor, Player, Association'}
                    value={formPaidToOrBy}
                    onChange={(e) => setFormPaidToOrBy(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-3 py-2 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                    Payment Status
                  </label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as OrganizerPaymentStatus)}
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending Settlement</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Notes / Bill Number
                </label>
                <input
                  type="text"
                  placeholder="Optional memo or invoice reference..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 rounded-2xl text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${modalType === 'EXPENSE'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/25'
                    }`}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{editingFinance ? 'Update Transaction' : modalType === 'EXPENSE' ? 'Record Expense' : 'Record Revenue'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 TRANSACTION DETAIL MODAL / DRAWER (MOBILE TAP)                        */}
      {/* ========================================================================= */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/15 rounded-t-[32px] md:rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${selectedTxDetail.transactionType === 'EXPENSE'
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                >
                  {selectedTxDetail.transactionType === 'EXPENSE' ? '📉' : '📈'}
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Transaction Details</h3>
                  <p className="text-[11px] font-semibold text-foreground/50 font-mono">
                    {selectedTxDetail.transactionDate ? selectedTxDetail.transactionDate.split('T')[0] : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1.5 rounded-full text-foreground/50 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Center Amount */}
            <div className="text-center py-2 space-y-1">
              <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                {selectedTxDetail.transactionType === 'EXPENSE' ? 'Total Cost' : 'Total Revenue'}
              </div>
              <div
                className={`text-3xl font-black font-mono ${selectedTxDetail.transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500'
                  }`}
              >
                {selectedTxDetail.transactionType === 'EXPENSE' ? '- ' : '+ '}₹
                {Number(selectedTxDetail.amount).toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-black text-foreground">{selectedTxDetail.title}</div>
            </div>

            {/* Meta Attributes */}
            <div className="bg-background rounded-2xl p-4 border border-foreground/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground/50 font-bold">Category</span>
                <span className="font-bold text-foreground">{selectedTxDetail.category}</span>
              </div>
              {selectedTxDetail.tournamentName && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/50 font-bold">Tournament</span>
                  <span className="font-bold text-primary">{selectedTxDetail.tournamentName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-foreground/50 font-bold">Payment Method</span>
                <span className="font-bold text-foreground font-mono">
                  {selectedTxDetail.paymentMethod || 'UPI'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/50 font-bold">Payment Status</span>
                <span className="font-black text-xs uppercase text-emerald-500 font-mono">
                  {selectedTxDetail.paymentStatus || 'COMPLETED'}
                </span>
              </div>
              {selectedTxDetail.paidToOrBy && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/50 font-bold">
                    {selectedTxDetail.transactionType === 'EXPENSE' ? 'Paid To' : 'Received From'}
                  </span>
                  <span className="font-bold text-foreground">{selectedTxDetail.paidToOrBy}</span>
                </div>
              )}
              {selectedTxDetail.notes && (
                <div className="pt-2 border-t border-foreground/5">
                  <span className="text-foreground/50 font-bold block mb-1">Notes:</span>
                  <p className="text-foreground/80 text-xs italic">{selectedTxDetail.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {canManage && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    const item = selectedTxDetail;
                    setSelectedTxDetail(null);
                    handleOpenEdit(item);
                  }}
                  className="py-2.5 rounded-2xl bg-surface border border-foreground/10 text-xs font-black text-foreground flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedTxDetail.financeUuid)}
                  className="py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-black text-rose-500 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
