'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  CreditCard,
  Building2,
  Users,
  Award,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  FileText,
  Receipt,
  User,
  Zap,
  Tag,
  ChevronDown,
  Loader2,
  PieChart,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  AcademyFinance,
  AcademyFinanceSummary,
  AcademyFinanceService,
  CreateAcademyFinancePayload
} from '@/lib/api/academyFinance';
import { AcademyStudentService, AcademyStudent, AcademyBatch } from '@/lib/api/academyStudent';
import { UserService } from '@/lib/api/user';

interface AcademyFinancesViewProps {
  orgUuid: string;
  orgName: string;
}

const INCOME_CATEGORIES = [
  'Student Monthly Tuition',
  'Admission & Registration Fee',
  'Court & Lane Rental',
  'Private Coaching & Sparring',
  'Tournament & League Entry',
  'Academy Kit & Jersey Sale',
  'Sponsorship & Grant',
  'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Coach & Trainer Salaries',
  'Facility & Court Rent',
  'Shuttles, Balls & Equipment',
  'Court Maintenance & Lights',
  'Tournament Operations',
  'Medical & Physio / First Aid',
  'Utilities & Electricity',
  'Refreshments & Hydration',
  'Marketing & Promotions',
  'Other Expense'
];

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: '📱' },
  { id: 'CASH', label: 'Cash', icon: '💵' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer / NEFT', icon: '🏦' },
  { id: 'CARD', label: 'Debit / Credit Card', icon: '💳' },
  { id: 'CHEQUE', label: 'Cheque', icon: '📝' }
];

export default function AcademyFinancesView({ orgUuid, orgName }: AcademyFinancesViewProps) {
  const [finances, setFinances] = useState<AcademyFinance[]>([]);
  const [summary, setSummary] = useState<AcademyFinanceSummary | null>(null);
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [timeframeMode, setTimeframeMode] = useState<'ALL' | 'THIS_MONTH' | 'TODAY'>('ALL');

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'BREAKDOWN'>('TRANSACTIONS');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<AcademyFinance | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formCategory, setFormCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('UPI');
  const [formPaidToOrBy, setFormPaidToOrBy] = useState<string>('');
  const [formStudentUuid, setFormStudentUuid] = useState<string>('');
  const [formBatchUuid, setFormBatchUuid] = useState<string>('');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState<string>('');
  const [formFeeStatus, setFormFeeStatus] = useState<'PAID' | 'PARTIAL' | 'PENDING'>('PAID');
  const [formNotes, setFormNotes] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data
  const loadAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      const now = new Date();
      if (timeframeMode === 'TODAY') {
        const todayStr = now.toISOString().split('T')[0];
        startDate = todayStr;
        endDate = todayStr;
      } else if (timeframeMode === 'THIS_MONTH') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        startDate = firstDay;
        endDate = lastDay;
      }

      const [financeRes, summaryRes, studentRes, batchRes] = await Promise.all([
        AcademyFinanceService.getFinances(orgUuid, undefined, undefined, undefined, undefined, startDate, endDate).catch(() => []),
        AcademyFinanceService.getSummary(orgUuid, startDate, endDate).catch(() => null),
        AcademyStudentService.getStudents(orgUuid).catch(() => []),
        AcademyStudentService.getBatches(orgUuid).catch(() => [])
      ]);

      const financeList = Array.isArray(financeRes) ? financeRes : ((financeRes as any)?.data || []);
      const studentList = Array.isArray(studentRes) ? studentRes : ((studentRes as any)?.data || []);
      const batchList = Array.isArray(batchRes) ? batchRes : ((batchRes as any)?.data || []);
      const summaryData = (summaryRes as any)?.data || summaryRes;

      setFinances(financeList);
      setSummary(summaryData);
      setStudents(studentList);
      setBatches(batchList);
    } catch (err) {
      console.error('Failed to load academy finances:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orgUuid) {
      loadAllData();
    }
  }, [orgUuid, timeframeMode]);

  // Handle student select in modal -> auto populate batch & title
  const handleSelectStudentInModal = (sUuid: string) => {
    setFormStudentUuid(sUuid);
    const stu = students.find((s) => s.studentUuid === sUuid);
    if (stu) {
      setFormPaidToOrBy(stu.fullName);
      if (stu.batchUuid) {
        setFormBatchUuid(stu.batchUuid);
      }
      if (!formTitle || formTitle.includes('Tuition') || formTitle.includes('Fee')) {
        setFormTitle(`Monthly Tuition - ${stu.fullName}`);
      }
    }
  };

  // Create Transaction
  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      alert('Please enter a valid amount greater than zero');
      return;
    }
    if (!formTitle.trim()) {
      alert('Please provide a transaction title');
      return;
    }

    setSubmitting(true);
    try {
      const selectedStudent = students.find((s) => s.studentUuid === formStudentUuid);
      const selectedBatch = batches.find((b) => b.batchUuid === formBatchUuid);

      const payload: CreateAcademyFinancePayload = {
        organizationUuid: orgUuid,
        transactionType: formType,
        category: formCategory,
        title: formTitle.trim(),
        amount: Number(formAmount),
        transactionDate: formDate,
        paymentMethod: formPaymentMethod,
        paidToOrBy: formPaidToOrBy.trim() || (selectedStudent ? selectedStudent.fullName : undefined),
        studentUuid: formStudentUuid || undefined,
        studentName: selectedStudent ? selectedStudent.fullName : undefined,
        batchUuid: formBatchUuid || undefined,
        batchName: selectedBatch ? selectedBatch.batchName : undefined,
        invoiceNumber: formInvoiceNumber.trim() || undefined,
        feeStatus: formFeeStatus,
        notes: formNotes.trim() || undefined
      };

      const res = await AcademyFinanceService.createFinance(payload);
      if (res) {
        setFinances((prev) => [res, ...prev]);
        showToast('Financial transaction recorded successfully!');
        setIsRecordModalOpen(false);
        resetForm();
        // Refresh summary
        loadAllData(true);
      }
    } catch (err) {
      console.error('Failed to create finance record:', err);
      alert('Failed to record transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (fUuid: string) => {
    if (!confirm('Are you sure you want to remove this financial record?')) return;
    try {
      await AcademyFinanceService.deleteFinance(fUuid);
      setFinances((prev) => prev.filter((f) => f.financeUuid !== fUuid));
      if (selectedTxDetail?.financeUuid === fUuid) setSelectedTxDetail(null);
      showToast('Transaction removed successfully');
      loadAllData(true);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert('Failed to delete record.');
    }
  };

  const resetForm = () => {
    setFormType('INCOME');
    setFormCategory(INCOME_CATEGORIES[0]);
    setFormTitle('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('UPI');
    setFormPaidToOrBy('');
    setFormStudentUuid('');
    setFormBatchUuid('');
    setFormInvoiceNumber('');
    setFormFeeStatus('PAID');
    setFormNotes('');
  };

  // Filtered Finances
  const filteredFinances = useMemo(() => {
    const list = Array.isArray(finances) ? finances : [];
    return list.filter((f) => {
      // Type
      if (typeFilter !== 'ALL' && f.transactionType !== typeFilter) return false;
      // Category
      if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
      // Batch
      if (batchFilter !== 'ALL' && f.batchUuid !== batchFilter) return false;
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = f.title?.toLowerCase().includes(q);
        const matchCategory = f.category?.toLowerCase().includes(q);
        const matchPayer = f.paidToOrBy?.toLowerCase().includes(q);
        const matchStudent = f.studentName?.toLowerCase().includes(q);
        const matchBatch = f.batchName?.toLowerCase().includes(q);
        const matchInvoice = f.invoiceNumber?.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchPayer && !matchStudent && !matchBatch && !matchInvoice) {
          return false;
        }
      }
      return true;
    });
  }, [finances, typeFilter, categoryFilter, batchFilter, searchTerm]);

  // Compute calculated metrics if summary is null
  const computedMetrics = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let feeInc = 0;
    let feeCount = 0;

    const list = Array.isArray(finances) ? finances : [];
    list.forEach((f) => {
      const amt = Number(f.amount || 0);
      if (f.transactionType === 'INCOME') {
        inc += amt;
        if (
          f.category?.toLowerCase().includes('fee') ||
          f.category?.toLowerCase().includes('tuition') ||
          f.category?.toLowerCase().includes('admission') ||
          f.studentUuid
        ) {
          feeInc += amt;
          feeCount++;
        }
      } else {
        exp += amt;
      }
    });

    const net = inc - exp;
    return {
      totalIncome: summary?.totalIncome ?? inc,
      totalExpense: summary?.totalExpense ?? exp,
      netBalance: summary?.netBalance ?? net,
      totalFeeCollected: summary?.totalFeeCollected ?? feeInc,
      feeCount: summary?.studentFeePaymentCount ?? feeCount,
      txCount: list.length
    };
  }, [finances, summary]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-900/90 border border-emerald-500/40 text-emerald-200 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. HEADER SECTION ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                Academy Finances & Fees
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 font-medium">
                Manage student tuition fees, operational expenses, coach payouts, and financial statement for {orgName}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap sm:flex-nowrap">
          {/* Timeframe Switcher */}
          <div
            className="flex items-center p-1 rounded-2xl border bg-surface flex-grow sm:flex-grow-0 justify-center"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <button
              onClick={() => setTimeframeMode('ALL')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframeMode === 'ALL'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframeMode('THIS_MONTH')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframeMode === 'THIS_MONTH'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframeMode('TODAY')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframeMode === 'TODAY'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface border text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all shrink-0"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Refresh Finances"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsRecordModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Record Transaction</span>
              <span className="sm:hidden">Add Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. HERO KPI HUD METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Total Revenue */}
        <div
          className="p-4 sm:p-5 rounded-[28px] border bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
              Total Inflow
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
              Gross Revenue
            </div>
            <div className="text-xl sm:text-3xl font-black font-mono text-foreground truncate">
              ₹{Number(computedMetrics.totalIncome).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-foreground/60 font-medium mt-1">
              ₹{Number(computedMetrics.totalFeeCollected).toLocaleString('en-IN')} from student tuition
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div
          className="p-4 sm:p-5 rounded-[28px] border bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md bg-rose-500/10">
              Total Outflow
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
              Academy Expenses
            </div>
            <div className="text-xl sm:text-3xl font-black font-mono text-foreground truncate">
              ₹{Number(computedMetrics.totalExpense).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-foreground/60 font-medium mt-1">
              Coaches, courts & gear
            </div>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div
          className="p-4 sm:p-5 rounded-[28px] border bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center ${
                computedMetrics.netBalance >= 0
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {computedMetrics.netBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                computedMetrics.netBalance >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {computedMetrics.netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
              Net Operating Balance
            </div>
            <div
              className={`text-xl sm:text-3xl font-black font-mono truncate ${
                computedMetrics.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {computedMetrics.netBalance >= 0 ? '+' : '-'}₹{Math.abs(computedMetrics.netBalance).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-foreground/60 font-medium mt-1">
              Operating cash flow
            </div>
          </div>
        </div>

        {/* Fee Payment Count */}
        <div
          className="p-4 sm:p-5 rounded-[28px] border bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary px-2 py-0.5 rounded-md bg-primary/10">
              Telemetry
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
              Logged Transactions
            </div>
            <div className="text-xl sm:text-3xl font-black font-mono text-foreground">
              {computedMetrics.txCount}
            </div>
            <div className="text-[11px] text-foreground/60 font-medium mt-1">
              {computedMetrics.feeCount} student fee collections
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. SUB-NAVIGATION TABS (TRANSACTIONS / BREAKDOWN) ─── */}
      <div
        className="flex items-center gap-2 border-b pb-2 overflow-x-auto hide-scrollbar -mx-1 px-1"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all flex items-center gap-2 ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
          }`}
        >
          <FileText className="w-4 h-4" /> Financial Statement & Transactions ({filteredFinances.length})
        </button>
        <button
          onClick={() => setActiveTab('BREAKDOWN')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all flex items-center gap-2 ${
            activeTab === 'BREAKDOWN'
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
          }`}
        >
          <PieChart className="w-4 h-4" /> Category & Batch Breakdown
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground/50">Loading academy finances and accounts...</p>
        </div>
      ) : activeTab === 'TRANSACTIONS' ? (
        /* ══════════════════════════════════════════════════════════════
           VIEW 1: FINANCIAL LEDGER & TRANSACTIONS TABLE + CARDS
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div
            className="p-4 rounded-2xl border bg-surface flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search by student, coach, title, receipt #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
            </div>

            {/* Desktop Filters (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Type Filter */}
              <div
                className="flex items-center p-0.5 rounded-xl border bg-background shrink-0"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === 'ALL' ? 'bg-primary text-black font-black shadow-sm' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('INCOME')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === 'INCOME' ? 'bg-emerald-500 text-black font-black shadow-sm' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTypeFilter('EXPENSE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === 'EXPENSE' ? 'bg-rose-500 text-white font-black shadow-sm' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* Batch Filter */}
              <div className="relative shrink-0">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.batchUuid} value={b.batchUuid}>
                      {b.batchName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>

              {/* Category Filter */}
              <div className="relative shrink-0">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer max-w-[180px] truncate"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="ALL">All Categories</option>
                  <optgroup label="Income Categories">
                    {INCOME_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Expense Categories">
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>
            </div>

            {/* Dedicated Mobile Filters (visible on mobile only) */}
            <div className="block sm:hidden space-y-2.5 w-full pt-1">
              {/* Type Switcher: Full Width Segmented Bar */}
              <div
                className="grid grid-cols-3 p-1 rounded-2xl border bg-background gap-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    typeFilter === 'ALL'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-foreground/60 active:bg-foreground/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> All
                </button>
                <button
                  onClick={() => setTypeFilter('INCOME')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    typeFilter === 'INCOME'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-foreground/60 active:bg-foreground/5'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-950 dark:text-emerald-900" /> Income
                </button>
                <button
                  onClick={() => setTypeFilter('EXPENSE')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    typeFilter === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-foreground/60 active:bg-foreground/5'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> Expense
                </button>
              </div>

              {/* 2-Column Mobile Dropdowns (Batch & Category) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Mobile Batch Dropdown */}
                <div className="relative">
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="w-full appearance-none pl-8 pr-7 py-2.5 rounded-xl bg-background border text-[11px] font-black text-foreground focus:outline-none focus:border-primary truncate"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="ALL">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.batchUuid} value={b.batchUuid}>
                        {b.batchName}
                      </option>
                    ))}
                  </select>
                  <Users className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                </div>

                {/* Mobile Category Dropdown */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none pl-8 pr-7 py-2.5 rounded-xl bg-background border text-[11px] font-black text-foreground focus:outline-none focus:border-primary truncate"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="ALL">All Categories</option>
                    <optgroup label="Income Categories">
                      {INCOME_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Expense Categories">
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                </div>
              </div>

              {/* Active Filter Clear Pill (if filtered) */}
              {(batchFilter !== 'ALL' || categoryFilter !== 'ALL' || typeFilter !== 'ALL' || searchTerm.trim()) && (
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <span className="text-[10px] font-bold text-foreground/50">
                    Showing {filteredFinances.length} filtered entries
                  </span>
                  <button
                    onClick={() => {
                      setTypeFilter('ALL');
                      setBatchFilter('ALL');
                      setCategoryFilter('ALL');
                      setSearchTerm('');
                    }}
                    className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredFinances.length === 0 ? (
            <div
              className="p-12 text-center rounded-[32px] border bg-surface space-y-4"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">No Financial Records Found</h3>
                <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                  {searchTerm || typeFilter !== 'ALL' || batchFilter !== 'ALL' || categoryFilter !== 'ALL'
                    ? 'No transactions match the selected filters.'
                    : 'Record student tuition fees, coaching payouts, or equipment expenses to begin telemetry.'}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsRecordModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:opacity-90 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Record First Entry
              </button>
            </div>
          ) : (
            <div
              className="rounded-[32px] border bg-surface overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {/* Desktop Ledger Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-foreground/[0.02]" style={{ borderColor: 'var(--athlon-border)' }}>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Details / Title</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Payer / Beneficiary</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Payment</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50 text-right">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border" style={{ borderColor: 'var(--athlon-border)' }}>
                    {filteredFinances.map((tx) => {
                      const isIncome = tx.transactionType === 'INCOME';
                      return (
                        <tr
                          key={tx.financeUuid || tx.financeId}
                          onClick={() => setSelectedTxDetail(tx)}
                          className="hover:bg-foreground/[0.02] transition-colors cursor-pointer group"
                        >
                          {/* Date */}
                          <td className="px-6 py-4 font-mono text-xs font-bold text-foreground/70 whitespace-nowrap">
                            {tx.transactionDate}
                          </td>

                          {/* Title & Batch */}
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors block">
                                {tx.title}
                              </span>
                              {tx.batchName && (
                                <span className="text-[11px] font-medium text-foreground/50 block">
                                  Batch: {tx.batchName}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                isIncome
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {tx.category}
                            </span>
                          </td>

                          {/* Payer / Student */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center text-xs font-black text-foreground shrink-0">
                                {tx.studentName ? tx.studentName.charAt(0) : tx.paidToOrBy ? tx.paidToOrBy.charAt(0) : '—'}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-foreground block truncate max-w-[140px]">
                                  {tx.studentName || tx.paidToOrBy || 'General Entry'}
                                </span>
                                {tx.studentUuid && (
                                  <span className="text-[9px] font-black text-primary uppercase tracking-widest block">
                                    Enrolled Student
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10 text-[10px] font-mono font-bold text-foreground/70 uppercase">
                              {tx.paymentMethod || 'UPI'}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-mono font-black text-sm ${
                                isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isIncome ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tx.financeUuid) handleDeleteTransaction(tx.financeUuid);
                              }}
                              className="p-1.5 rounded-lg text-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Delete Entry"
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

              {/* Mobile Dedicated Transaction Cards */}
              <div className="block md:hidden divide-y divide-border" style={{ borderColor: 'var(--athlon-border)' }}>
                {filteredFinances.map((tx) => {
                  const isIncome = tx.transactionType === 'INCOME';
                  return (
                    <div
                      key={tx.financeUuid || tx.financeId}
                      onClick={() => setSelectedTxDetail(tx)}
                      className="p-4 space-y-3 hover:bg-foreground/[0.02] active:bg-foreground/[0.04] transition-colors cursor-pointer"
                    >
                      {/* Top: Category pill & Amount */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black text-foreground truncate">{tx.title}</div>
                            <div className="text-[10px] text-foreground/50 font-medium truncate flex items-center gap-1.5 mt-0.5">
                              <span>{tx.category}</span>
                              {tx.batchName && <span>• {tx.batchName}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-black text-base ${
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] font-mono text-foreground/40 mt-0.5">{tx.transactionDate}</div>
                        </div>
                      </div>

                      {/* Bottom Meta Strip */}
                      <div
                        className="flex items-center justify-between p-2 rounded-xl bg-background border text-[11px]"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center gap-1.5 text-foreground/70 truncate">
                          <User className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                          <span className="font-bold truncate">{tx.studentName || tx.paidToOrBy || 'General Entry'}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10 text-[9px] font-mono font-bold text-foreground/70 uppercase">
                            {tx.paymentMethod || 'UPI'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           VIEW 2: CATEGORY & BATCH BREAKDOWN ANALYTICS
           ══════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <div
            className="p-6 rounded-[32px] border bg-surface space-y-6 shadow-sm"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" /> Revenue Stream Breakdown
                </h3>
                <p className="text-xs text-foreground/60 font-medium mt-0.5">
                  Gross inflows organized by category
                </p>
              </div>
              <span className="font-mono font-black text-emerald-500 text-sm">
                ₹{Number(computedMetrics.totalIncome).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-4">
              {INCOME_CATEGORIES.map((cat) => {
                const catTotal = finances
                  .filter((f) => f.transactionType === 'INCOME' && f.category === cat)
                  .reduce((sum, f) => sum + Number(f.amount || 0), 0);
                const percent = computedMetrics.totalIncome > 0 ? Math.round((catTotal / computedMetrics.totalIncome) * 100) : 0;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">{cat}</span>
                      <span className="font-mono text-foreground">
                        ₹{catTotal.toLocaleString('en-IN')}{' '}
                        <span className="text-foreground/40 text-[10px]">({percent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div
            className="p-6 rounded-[32px] border bg-surface space-y-6 shadow-sm"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-rose-500" /> Expense Outflow Breakdown
                </h3>
                <p className="text-xs text-foreground/60 font-medium mt-0.5">
                  Operating expenses & equipment investments
                </p>
              </div>
              <span className="font-mono font-black text-rose-500 text-sm">
                ₹{Number(computedMetrics.totalExpense).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-4">
              {EXPENSE_CATEGORIES.map((cat) => {
                const catTotal = finances
                  .filter((f) => f.transactionType === 'EXPENSE' && f.category === cat)
                  .reduce((sum, f) => sum + Number(f.amount || 0), 0);
                const percent = computedMetrics.totalExpense > 0 ? Math.round((catTotal / computedMetrics.totalExpense) * 100) : 0;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">{cat}</span>
                      <span className="font-mono text-foreground">
                        ₹{catTotal.toLocaleString('en-IN')}{' '}
                        <span className="text-foreground/40 text-[10px]">({percent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. MODAL: RECORD TRANSACTION / TUITION COLLECTION ─── */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-surface border rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Header */}
            <div
              className="p-5 sm:p-6 border-b flex items-center justify-between bg-background/50"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Record Financial Entry
                </h3>
                <p className="text-xs text-foreground/60 font-medium mt-0.5">
                  Log student tuition fees or academy operational payouts
                </p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRecordTransaction} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Type Switcher */}
              <div
                className="grid grid-cols-2 p-1 rounded-2xl bg-background border gap-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFormType('INCOME');
                    setFormCategory(INCOME_CATEGORIES[0]);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    formType === 'INCOME'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Income / Student Fee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('EXPENSE');
                    setFormCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    formType === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> Academy Expense
                </button>
              </div>

              {/* Optional: Student Link (for fees) */}
              {formType === 'INCOME' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" /> Link Enrolled Student (Optional)
                  </label>
                  <select
                    value={formStudentUuid}
                    onChange={(e) => handleSelectStudentInModal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="">-- General / Walk-in / Non-student --</option>
                    {students.map((s) => (
                      <option key={s.studentUuid} value={s.studentUuid}>
                        {s.fullName} ({s.batchName || 'Academy Student'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Batch Fee, Coach Vikram Salary, Yonex Shuttles"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black font-mono text-foreground/40">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-background border text-xs font-black font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {(formType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {PAYMENT_METHODS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payer / Beneficiary & Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    {formType === 'INCOME' ? 'Paid By (Student / Sponsor)' : 'Paid To (Vendor / Coach)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Name of payer or recipient"
                    value={formPaidToOrBy}
                    onChange={(e) => setFormPaidToOrBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Batch Association
                  </label>
                  <select
                    value={formBatchUuid}
                    onChange={(e) => setFormBatchUuid(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="">-- None / Entire Academy --</option>
                    {batches.map((b) => (
                      <option key={b.batchUuid} value={b.batchUuid}>
                        {b.batchName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invoice Number & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Invoice / Receipt #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-2026-089"
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary font-mono"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                    Fee Status
                  </label>
                  <select
                    value={formFeeStatus}
                    onChange={(e) => setFormFeeStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="PAID">PAID (Settled)</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                  Notes / Developmental Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional payment notes or terms..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border text-xs font-medium text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary resize-none"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:bg-foreground/5 transition-colors"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. MODAL: RECEIPT & TRANSACTION DETAILS ─── */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-lg bg-surface border rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Header */}
            <div
              className="p-5 sm:p-6 border-b flex items-center justify-between bg-background/50"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedTxDetail.transactionType === 'INCOME'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Transaction Receipt</h3>
                  <p className="text-[11px] font-mono text-foreground/50">
                    {selectedTxDetail.invoiceNumber || `TX-${selectedTxDetail.financeUuid?.slice(0, 8) || '001'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Hero Amount Strip */}
              <div
                className="p-5 rounded-2xl bg-background border text-center space-y-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block">
                  Amount Settled
                </span>
                <div
                  className={`text-3xl font-black font-mono ${
                    selectedTxDetail.transactionType === 'INCOME'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedTxDetail.transactionType === 'INCOME' ? '+' : '-'}₹
                  {Number(selectedTxDetail.amount || 0).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      selectedTxDetail.transactionType === 'INCOME'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {selectedTxDetail.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold uppercase">
                    {selectedTxDetail.paymentMethod || 'UPI'}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div
                className="divide-y divide-border rounded-2xl border bg-background text-xs"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="p-3 flex justify-between">
                  <span className="text-foreground/50 font-medium">Title</span>
                  <span className="font-bold text-foreground">{selectedTxDetail.title}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-foreground/50 font-medium">Transaction Date</span>
                  <span className="font-mono font-bold text-foreground">{selectedTxDetail.transactionDate}</span>
                </div>
                {(selectedTxDetail.studentName || selectedTxDetail.paidToOrBy) && (
                  <div className="p-3 flex justify-between">
                    <span className="text-foreground/50 font-medium">
                      {selectedTxDetail.transactionType === 'INCOME' ? 'Paid By' : 'Paid To'}
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedTxDetail.studentName || selectedTxDetail.paidToOrBy}
                    </span>
                  </div>
                )}
                {selectedTxDetail.batchName && (
                  <div className="p-3 flex justify-between">
                    <span className="text-foreground/50 font-medium">Batch</span>
                    <span className="font-bold text-foreground">{selectedTxDetail.batchName}</span>
                  </div>
                )}
                {selectedTxDetail.notes && (
                  <div className="p-3 space-y-1">
                    <span className="text-foreground/50 font-medium block">Notes</span>
                    <p className="text-foreground/80 font-medium leading-relaxed">{selectedTxDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    if (selectedTxDetail.financeUuid) handleDeleteTransaction(selectedTxDetail.financeUuid);
                  }}
                  className="px-3.5 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Record
                </button>

                <button
                  onClick={() => setSelectedTxDetail(null)}
                  className="px-5 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
