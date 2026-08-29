'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubFinanceService, ClubFinance, FinanceSummary, CreateFinancePayload } from '@/lib/api/clubFinance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import {
  DollarSign,
  Plus,
  Search,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  Receipt,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Building,
  Tag,
  FileText,
  UserCheck
} from 'lucide-react';

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EXPENSE_CATEGORIES = [
  { id: 'Court Rent', label: 'Court Rent', icon: '🏟️' },
  { id: 'Shuttle / Equipment', label: 'Shuttles & Gear', icon: '🏸' },
  { id: 'Maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'Refreshments', label: 'Refreshments & Water', icon: '🥤' },
  { id: 'Tournament', label: 'Tournament Expense', icon: '🏆' },
  { id: 'Other', label: 'Other Expense', icon: '📦' }
];

const INCOME_CATEGORIES = [
  { id: 'Member Fee', label: 'Monthly Member Fee', icon: '👤' },
  { id: 'Shuttle Fee', label: 'Shuttle Fee Collection', icon: '🏸' },
  { id: 'Tournament Fee', label: 'Tournament Entry Fee', icon: '🏆' },
  { id: 'Other Income', label: 'Other Income', icon: '💰' }
];

const PAYMENT_METHODS = ['UPI', 'CASH', 'BANK_TRANSFER', 'CARD'];

export default function FinancesPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const orgUuid = org?.id || orgIdParam;

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
  const [isAllTime, setIsAllTime] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState('Court Rent');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(getLocalDateString());
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');
  const [formPaidToOrBy, setFormPaidToOrBy] = useState('');
  const [formMemberUuid, setFormMemberUuid] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    if (orgUuid) {
      loadData();
      OrganizationService.getMembers(orgUuid).then((res) => {
        const memList = Array.isArray(res) ? res : ((res as any)?.data || []);
        setMembers(memList);
      }).catch(() => {});
    }
  }, [orgUuid, selectedDate, isAllTime, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dateParam = isAllTime ? undefined : selectedDate;
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
    setIsAllTime(false);
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
    setIsModalOpen(true);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) return;

    try {
      setSubmitting(true);
      const payload: CreateFinancePayload = {
        organizationUuid: orgUuid,
        transactionType: modalType,
        category: formCategory,
        title: formTitle || formCategory,
        amount: parseFloat(formAmount),
        transactionDate: formDate || getLocalDateString(),
        paymentMethod: formPaymentMethod,
        paidToOrBy: formPaidToOrBy,
        memberUuid: formMemberUuid || undefined,
        notes: formNotes
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Club Finances</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/25">
              Expense Tracker
            </span>
          </div>
          <p className="text-foreground/50 font-medium text-sm">
            Track court rent, shuttle purchases, maintenance, and member fee collections for {org?.name || 'your club'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => handleOpenAdd('INCOME')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-sm font-black tracking-wide hover:bg-emerald-500/20 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Collect Fee
          </button>
          <button
            onClick={() => handleOpenAdd('EXPENSE')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Expenses</span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            ₹{Number(summary?.totalExpense || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Fee Collections</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{Number(summary?.totalIncome || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net Balance */}
        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[10px] font-black uppercase tracking-wider">Net Cash Flow</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary">
            ₹{Number(summary?.netBalance || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Records */}
        <div className="p-5 rounded-2xl bg-surface border border-foreground/5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-foreground/40">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Entries</span>
            <Receipt className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {summary?.transactionCount || finances.length}
          </div>
        </div>
      </div>

      {/* Date Filter & Timeframe Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-surface border border-foreground/5 rounded-2xl p-3.5 sm:p-4 shadow-sm">
        {/* Day Steppers & Calendar Date Picker */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex items-center bg-background border border-foreground/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40 transition-colors shadow-inner">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setIsAllTime(false);
                setSelectedDate(e.target.value);
              }}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isAllTime && selectedDate && (
            <span className="hidden md:inline-block text-xs font-bold text-foreground/60 ml-2">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Quick Date Selectors & Type Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setIsAllTime(false);
              setSelectedDate(getLocalDateString());
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              !isAllTime && selectedDate === getLocalDateString()
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-background/80 text-foreground/70 hover:text-foreground border border-foreground/10'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setIsAllTime(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isAllTime
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-background/80 text-foreground/70 hover:text-foreground border border-foreground/10'
            }`}
          >
            All Time
          </button>

          <div className="h-4 w-px bg-foreground/10 mx-1 hidden sm:block" />

          {/* Type Toggle */}
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                typeFilter === t
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-background/80 text-foreground/60 hover:text-foreground border border-foreground/10'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t === 'EXPENSE' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by title, category, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-xl pl-11 pr-4 py-2 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-primary text-black'
                : 'bg-background/80 text-foreground/60 hover:text-foreground border border-foreground/10'
            }`}
          >
            All Categories
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-black'
                  : 'bg-background/80 text-foreground/60 hover:text-foreground border border-foreground/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TRANSACTIONS ROSTER CONTAINER */}
      <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground/50">Loading club transactions...</p>
          </div>
        ) : filteredFinances.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No Transactions Found</h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                Record your club court rents, shuttle purchases, and member fee collections to stay on top of club finances.
              </p>
            </div>
            <button
              onClick={() => handleOpenAdd('EXPENSE')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add First Expense
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Category & Title</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Paid To / By</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Method</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {filteredFinances.map((item) => {
                    const isExpense = item.transactionType === 'EXPENSE';

                    return (
                      <tr key={item.financeUuid} className="hover:bg-foreground/[0.02] transition-colors group">
                        {/* Date */}
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-xs text-foreground/70">
                            {item.transactionDate ? new Date(`${item.transactionDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </span>
                        </td>

                        {/* Category & Title */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                              isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {isExpense ? '📉' : '📈'}
                            </span>
                            <div>
                              <div className="font-extrabold text-sm text-foreground">{item.title}</div>
                              <div className="text-[11px] font-medium text-foreground/40">{item.category}</div>
                            </div>
                          </div>
                        </td>

                        {/* Paid To / By */}
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-foreground">
                            {item.memberName || item.paidToOrBy || '-'}
                          </div>
                          {item.notes && <div className="text-[10px] text-foreground/40 truncate max-w-xs">{item.notes}</div>}
                        </td>

                        {/* Method */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/70">
                            {item.paymentMethod || 'UPI'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right">
                          <span className={`font-mono font-black text-sm ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {isExpense ? '- ' : '+ '}₹{Number(item.amount).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => item.financeUuid && handleDelete(item.financeUuid)}
                            className="p-1.5 rounded-lg text-foreground/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-foreground/5">
              {filteredFinances.map((item) => {
                const isExpense = item.transactionType === 'EXPENSE';

                return (
                  <div key={item.financeUuid} className="p-4 space-y-2.5 hover:bg-foreground/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                          isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {isExpense ? '📉' : '📈'}
                        </span>
                        <div className="min-w-0">
                          <div className="font-extrabold text-sm text-foreground truncate">{item.title}</div>
                          <div className="text-[10px] font-medium text-foreground/40">
                            {item.category} • {item.transactionDate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-black text-sm ${
                          isExpense ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {isExpense ? '- ' : '+ '}₹{Number(item.amount).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/50">
                          {item.paymentMethod || 'UPI'}
                        </span>
                      </div>
                    </div>

                    {(item.paidToOrBy || item.memberName || item.notes) && (
                      <div className="flex items-center justify-between pt-1 border-t border-foreground/5 text-xs text-foreground/60">
                        <span>{item.memberName || item.paidToOrBy}</span>
                        <button
                          onClick={() => item.financeUuid && handleDelete(item.financeUuid)}
                          className="text-foreground/30 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* RECORD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/10 rounded-[28px] shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground">
                  {modalType === 'EXPENSE' ? 'Record Club Expense' : 'Record Fee Collection'}
                </h3>
                <p className="text-xs text-foreground/50 font-medium mt-0.5">
                  {modalType === 'EXPENSE'
                    ? 'Log court rents, shuttle purchases, and equipment costs.'
                    : 'Log member monthly fees and entry collections.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-background p-1.5 rounded-2xl border" style={{ borderColor: 'var(--athlon-border)' }}>
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
                <ArrowUpRight className="w-4 h-4" /> Income / Fee
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(modalType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border flex flex-col items-center gap-1 ${
                        formCategory === cat.id
                          ? 'bg-primary/15 text-primary border-primary/40 shadow-sm'
                          : 'bg-background/50 border-foreground/10 text-foreground/70 hover:bg-foreground/5'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate w-full text-[11px]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                  Amount (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-foreground/40">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl pl-10 pr-4 py-3 text-lg font-black text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                  Description / Title
                </label>
                <input
                  type="text"
                  placeholder={modalType === 'EXPENSE' ? 'e.g. Monthly court booking slot' : 'e.g. August court fee'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                />
              </div>

              {/* Member Link (If Income or member related) */}
              {modalType === 'INCOME' && members.length > 0 && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                    Select Member
                  </label>
                  <select
                    value={formMemberUuid}
                    onChange={(e) => setFormMemberUuid(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner cursor-pointer"
                  >
                    <option value="">General Collection / Non-Member</option>
                    {members.map((m) => (
                      <option key={m.organizationMemberUuid} value={m.organizationMemberUuid}>
                        {m.fullName} {m.phone ? `(+91 ${m.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Paid To / Vendor (If Expense) */}
              {modalType === 'EXPENSE' && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                    Paid To (Vendor / Arena / Shop)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. City Arena, Yonex Shop, Amazon"
                    value={formPaidToOrBy}
                    onChange={(e) => setFormPaidToOrBy(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              )}

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-foreground/10 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}