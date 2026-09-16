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
  AlertCircle
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
        {/* 1. Mobile Header */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-primary/15 to-transparent border border-primary/25 flex items-center justify-center text-lg shadow-inner shrink-0">
              🏆
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-foreground tracking-tight truncate">
                  Organizer Treasury
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <p className="text-[11px] font-semibold text-foreground/50 truncate">
                {orgName || 'Tournament Organization'} • {finances.length} records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface border border-foreground/10 text-foreground/70 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
              title="Refresh Finances"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

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
      {/* 🖥️ DESKTOP VIEW (EXECUTIVE TREASURY & EVENT FINANCIAL WORKSPACE)           */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 pt-6 space-y-6 animate-in fade-in duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-primary/15 to-transparent border border-primary/30 flex items-center justify-center text-2xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-foreground tracking-tight">
                  Organizer Financial Treasury
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Organizer Ledger
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground/50 mt-0.5">
                Manage tournament revenue streams, sponsorships, venue rentals, umpire stipends, and prize allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-surface border border-foreground/10 text-foreground/70 hover:text-foreground text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              <span>Refresh</span>
            </button>
            {canManage && (
              <>
                <button
                  onClick={() => handleOpenAdd('EXPENSE')}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Cost
                </button>
                <button
                  onClick={() => handleOpenAdd('INCOME')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <IndianRupee className="w-3.5 h-3.5 stroke-[3]" /> Log Revenue
                </button>
              </>
            )}
          </div>
        </div>

        {/* Desktop Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-surface border border-foreground/10 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Net Tournament P&L
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${Number(summary?.netProfit || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                {Number(summary?.netProfit || 0) >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-primary tracking-tight">
              ₹{Number(summary?.netProfit || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">
              Overall ledger balance across selected filters
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-foreground/10 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                Total Revenue
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-500 tracking-tight">
              +₹{Number(summary?.totalIncome || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">
              Registrations, brand deals, stall rents
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-foreground/10 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-500">
                Total Costs
              </span>
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-black font-mono text-rose-500 tracking-tight">
              -₹{Number(summary?.totalExpense || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">
              Prizes, venue, officials, equipment
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-foreground/10 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Pending Settlements
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg font-black text-emerald-500">
                +₹{Number(summary?.pendingReceivables || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-foreground/30">/</span>
              <span className="text-lg font-black text-rose-500">
                -₹{Number(summary?.pendingPayables || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">
              Unpaid receivables vs pending vendor payables
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-3xl bg-surface border border-foreground/10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search description, sponsor, vendor, receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-foreground/10 rounded-2xl pl-10 pr-9 py-2 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tournament Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground/50">Tournament:</span>
              <select
                value={selectedTournamentUuid}
                onChange={(e) => setSelectedTournamentUuid(e.target.value)}
                className="bg-background border border-foreground/10 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Tournaments</option>
                {tournaments.map((t) => (
                  <option key={t.tournamentUuid} value={t.tournamentUuid}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-background border border-foreground/10 rounded-xl p-1">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${typeFilter === t
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-foreground/60 hover:text-foreground'
                    }`}
                >
                  {t === 'ALL' ? 'All' : t === 'INCOME' ? 'Revenue' : 'Costs'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-3xl bg-surface border border-foreground/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-foreground/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black text-foreground">Transaction Stream</h3>
              <span className="text-xs text-foreground/40 font-bold font-mono">
                ({filteredFinances.length} records)
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-foreground/50 font-bold text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              Loading tournament ledger...
            </div>
          ) : filteredFinances.length === 0 ? (
            <div className="p-16 text-center text-foreground/50 space-y-2">
              <div className="text-3xl">🏆</div>
              <div className="text-sm font-bold text-foreground">No financial records found</div>
              <p className="text-xs text-foreground/40 max-w-sm mx-auto">
                No entries match the current filters. Log revenue or costs to build the tournament ledger.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-foreground/5 text-foreground/50 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description & Category</th>
                  <th className="py-3 px-4">Tournament</th>
                  <th className="py-3 px-4">Party / Vendor</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 font-semibold text-foreground/80">
                {filteredFinances.map((item) => {
                  const isExpense = item.transactionType === 'EXPENSE';
                  const catObj = (isExpense ? ORGANIZER_EXPENSE_CATEGORIES : ORGANIZER_INCOME_CATEGORIES).find(
                    (c) => c.id === item.category
                  );
                  return (
                    <tr key={item.financeUuid} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-foreground/60 whitespace-nowrap">
                        {item.transactionDate ? item.transactionDate.split('T')[0] : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{catObj?.icon || '📦'}</span>
                          <div>
                            <div className="font-bold text-foreground">{item.title}</div>
                            <div className="text-[10px] text-foreground/40">{catObj?.label || item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.tournamentName ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {item.tournamentName}
                          </span>
                        ) : (
                          <span className="text-foreground/30 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">{item.paidToOrBy || '—'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-foreground/5 text-foreground/70">
                            {item.paymentMethod || 'UPI'}
                          </span>
                          {item.paymentStatus && item.paymentStatus !== 'COMPLETED' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {item.paymentStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm whitespace-nowrap">
                        <span className={isExpense ? 'text-rose-500' : 'text-emerald-500'}>
                          {isExpense ? '-' : '+'}₹{Number(item.amount).toLocaleString('en-IN')}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.financeUuid)}
                              className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
