'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CreditCard, Plus, CheckCircle2, Clock,
  DollarSign, Sparkles, Filter, Search, Edit3,
  Trash2, Send, Check, ShieldCheck, Tag, Users, Calendar, AlertCircle,
  TrendingUp, ArrowUpRight, Zap, ChevronRight, Share2, Layers,
  Receipt, Wallet, BellRing, Phone, X
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';
import {
  CoachService,
  CoachFeePackage,
  CoachFeeTransaction,
  PackageCategory,
  BillingCycle
} from '@/lib/api/coach';

function parseFeatures(featuresStr?: string): string[] {
  if (!featuresStr) return [];
  try {
    const parsed = JSON.parse(featuresStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [featuresStr];
  }
}

const CATEGORY_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Packages', icon: '⚡' },
  { id: '1on1', label: '1-on-1 Personal', icon: '👤' },
  { id: 'group', label: 'Small Squad', icon: '👥' },
  { id: 'monthly', label: 'Regular Batch', icon: '📅' },
  { id: 'sparring', label: 'Sparring', icon: '⚔️' },
  { id: 'camp', label: 'Bootcamps', icon: '⛺' },
];

export default function CoachingFeesPage() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const { organizations } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'packages' | 'ledger'>('packages');
  const [packages, setPackages] = useState<CoachFeePackage[]>([]);
  const [transactions, setTransactions] = useState<CoachFeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoachFeePackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '1on1' as PackageCategory,
    categoryLabel: 'Personal Training',
    price: 1500,
    billingCycle: 'per_session' as BillingCycle,
    sessionsPerWeek: 3,
    maxTrainees: 1,
    description: '',
    featureInput: '',
    features: ['Personalized stroke corrections', 'Match tactics analysis'],
    isPopular: false,
    active: true,
  });

  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeeData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [pkgRes, txRes] = await Promise.allSettled([
        CoachService.getPackages(orgId),
        CoachService.getTransactions(orgId),
      ]);

      if (pkgRes.status === 'fulfilled') {
        const pList = Array.isArray(pkgRes.value) ? pkgRes.value : ((pkgRes.value as any)?.data || []);
        setPackages(pList);
      }
      if (txRes.status === 'fulfilled') {
        const tList = Array.isArray(txRes.value) ? txRes.value : ((txRes.value as any)?.data || []);
        setTransactions(tList);
      }
    } catch (err) {
      console.error('Failed to load coach fees data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, [orgId]);

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesCat = selectedCategory === 'all' || pkg.category === selectedCategory;
    const matchesSearch = (pkg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate Metrics
  const totalMonthlyProjected = packages
    .filter(p => p.active)
    .reduce((acc, curr) => {
      const multiplier = curr.billingCycle === 'per_session' ? (curr.sessionsPerWeek * 4) : 1;
      return acc + (Number(curr.price || 0) * multiplier * (curr.enrolledCount || 0));
    }, 0);

  const totalPaidRevenue = transactions
    .filter(t => t.status === 'PAID')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const pendingAmount = transactions
    .filter(t => t.status !== 'PAID')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      category: '1on1',
      categoryLabel: 'Personal Training',
      price: 1500,
      billingCycle: 'per_session',
      sessionsPerWeek: 3,
      maxTrainees: 1,
      description: '',
      featureInput: '',
      features: ['Personalized stroke corrections', 'Match tactics analysis'],
      isPopular: false,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: CoachFeePackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      category: (pkg.category as PackageCategory) || '1on1',
      categoryLabel: pkg.categoryLabel || 'Personal Training',
      price: Number(pkg.price || 0),
      billingCycle: (pkg.billingCycle as BillingCycle) || 'per_session',
      sessionsPerWeek: pkg.sessionsPerWeek || 3,
      maxTrainees: pkg.maxTrainees || 1,
      description: pkg.description || '',
      featureInput: '',
      features: parseFeatures(pkg.features),
      isPopular: !!pkg.isPopular,
      active: pkg.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingPackage) {
        const res = await CoachService.updatePackage({
          packageUuid: editingPackage.packageUuid,
          name: formData.name,
          category: formData.category,
          categoryLabel: formData.categoryLabel,
          price: Number(formData.price),
          billingCycle: formData.billingCycle,
          sessionsPerWeek: Number(formData.sessionsPerWeek),
          maxTrainees: Number(formData.maxTrainees),
          description: formData.description,
          features: JSON.stringify(formData.features),
          isPopular: formData.isPopular,
          active: formData.active,
        });
        if (res) {
          const updated = res as CoachFeePackage;
          setPackages(packages.map(p => p.packageUuid === editingPackage.packageUuid ? updated : p));
        }
      } else {
        const res = await CoachService.createPackage({
          organizationUuid: orgId,
          name: formData.name,
          category: formData.category,
          categoryLabel: formData.categoryLabel,
          price: Number(formData.price),
          billingCycle: formData.billingCycle,
          sessionsPerWeek: Number(formData.sessionsPerWeek),
          maxTrainees: Number(formData.maxTrainees),
          description: formData.description,
          features: JSON.stringify(formData.features),
          isPopular: formData.isPopular,
          active: formData.active,
        });
        if (res) {
          const created = res as CoachFeePackage;
          setPackages([...packages, created]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save fee package:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePackageStatus = async (pkg: CoachFeePackage) => {
    try {
      const nextActive = !pkg.active;
      const res = await CoachService.updatePackage({ packageUuid: pkg.packageUuid, active: nextActive });
      if (res) {
        const updated = res as CoachFeePackage;
        setPackages(packages.map(p => p.packageUuid === pkg.packageUuid ? updated : p));
      }
    } catch (err) {
      console.error('Failed to toggle package status:', err);
    }
  };

  const deletePackage = async (packageUuid: string) => {
    if (confirm('Are you sure you want to delete this coaching fee package?')) {
      try {
        await CoachService.deletePackage(packageUuid);
        setPackages(packages.filter(p => p.packageUuid !== packageUuid));
      } catch (err) {
        console.error('Failed to delete package:', err);
      }
    }
  };

  const addFeature = () => {
    if (formData.featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.featureInput.trim()],
        featureInput: ''
      });
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSendReminder = async (txUuid: string) => {
    try {
      await CoachService.sendPaymentReminder(txUuid);
      setReminderSent(txUuid);
      setTimeout(() => setReminderSent(null), 3000);
    } catch (err) {
      console.error('Failed to send payment reminder:', err);
    }
  };

  const markAsPaid = async (txUuid: string) => {
    try {
      const res = await CoachService.recordPayment(txUuid, {
        status: 'PAID',
        paymentMethod: 'UPI / Direct',
        paidDate: new Date().toISOString().split('T')[0],
      });
      if (res) {
        const updated = res as CoachFeeTransaction;
        setTransactions(transactions.map(t => t.transactionUuid === txUuid ? updated : t));
      }
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-16 bg-background text-foreground selection:bg-primary/30">
      <div className="p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* ─── 1. HERO HEADER ─── */}
        <div className="rounded-3xl p-4 sm:p-6 border bg-card shadow-sm"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 shadow-xs">
                  <Zap className="w-3 h-3 fill-primary" />
                  Coach Workspace
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">
                  Rate Cards & Invoicing
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span>Coaching Fees & Packages</span>
              </h1>

              <p className="text-xs sm:text-sm text-foreground/60 font-medium max-w-2xl leading-relaxed">
                Configure private 1-on-1 rates, squad training batches, recurring subscriptions, and track trainee dues.
              </p>
            </div>
          </div>
        </div>

        {/* ─── 2. STYLISH SEGMENTED SWITCHER BAR ─── */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-surface border shadow-inner max-w-md mx-auto sm:mx-0"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'packages'
              ? 'bg-primary text-black shadow-md font-black scale-[1.02]'
              : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Packages</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'packages' ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/70'
              }`}>
              {packages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'ledger'
              ? 'bg-primary text-black shadow-md font-black scale-[1.02]'
              : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Fee Ledger</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'ledger' ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/70'
              }`}>
              {transactions.length}
            </span>
          </button>
        </div>

        {/* ─── 3. HIGH-END BENTO FINANCIAL METRICS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. Paid Revenue (Mtd) */}
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-card border shadow-sm flex flex-col justify-between"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] sm:text-xs font-black text-foreground/50 uppercase tracking-wider truncate">
                  Paid Revenue
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {loading ? <span className="animate-pulse">--</span> : `₹${totalPaidRevenue.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-foreground/5 flex items-center justify-between text-[10px] text-foreground/50 font-semibold">
              <span>This Month</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Collected</span>
            </div>
          </div>

          {/* 2. Pending / Dues */}
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-card border shadow-sm flex flex-col justify-between"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] sm:text-xs font-black text-foreground/50 uppercase tracking-wider truncate">
                  Pending Dues
                </span>
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-2">
                {loading ? <span className="animate-pulse">--</span> : `₹${pendingAmount.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-foreground/5 flex items-center justify-between text-[10px] text-foreground/50 font-semibold">
              <span>Awaiting</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Invoices</span>
            </div>
          </div>

          {/* 3. Active Packages */}
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-card border shadow-sm flex flex-col justify-between"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] sm:text-xs font-black text-foreground/50 uppercase tracking-wider truncate">
                  Active Plans
                </span>
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black font-mono text-foreground mt-2 flex items-baseline gap-1">
                <span>{loading ? '--' : packages.filter(p => p.active).length}</span>
                <span className="text-xs text-foreground/40 font-normal">/ {packages.length}</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-foreground/5 flex items-center justify-between text-[10px] text-foreground/50 font-semibold">
              <span>Rate Cards</span>
              <span className="text-primary font-bold">Configured</span>
            </div>
          </div>

          {/* 4. Monthly Projected */}
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-card border shadow-sm flex flex-col justify-between"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] sm:text-xs font-black text-foreground/50 uppercase tracking-wider truncate">
                  Projected Run-rate
                </span>
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black font-mono text-primary mt-2">
                {loading ? <span className="animate-pulse">--</span> : `₹${totalMonthlyProjected.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-foreground/5 flex items-center justify-between text-[10px] text-foreground/50 font-semibold">
              <span>Capacity</span>
              <span className="text-primary font-bold">Monthly</span>
            </div>
          </div>
        </div>

        {/* ─── 4. MAIN CONTENT AREA: RATE PACKAGES OR INVOICES LEDGER ─── */}
        {activeTab === 'packages' ? (
          <div className="space-y-4">

            {/* Search & Horizontal Category Scroll Bar */}
            <div className="space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search fee packages, categories, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface text-xs font-medium rounded-2xl border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-foreground/40 shadow-xs"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-foreground/10 text-foreground/60 flex items-center justify-center text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                {CATEGORY_ITEMS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border shrink-0 ${selectedCategory === cat.id
                      ? 'bg-primary text-black border-primary font-black shadow-sm scale-105'
                      : 'bg-surface text-foreground/70 hover:bg-foreground/5 border-border/80'
                      }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Packages Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-surface/50 border border-border/40 animate-pulse" />
                ))}
              </div>
            ) : filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPackages.map((pkg) => {
                  const billingText = {
                    per_session: 'session',
                    per_hour: 'hour',
                    monthly: 'month',
                    quarterly: 'quarter',
                  }[pkg.billingCycle as BillingCycle] || pkg.billingCycle;

                  const featuresList = parseFeatures(pkg.features);

                  return (
                    <div
                      key={pkg.packageUuid}
                      className={`rounded-3xl border transition-all duration-300 relative flex flex-col justify-between overflow-hidden group shadow-md ${pkg.active
                        ? 'bg-card hover:border-primary/60 hover:shadow-xl'
                        : 'bg-card/40 opacity-75'
                        }`}
                      style={{
                        borderColor: pkg.active ? 'var(--athlon-border)' : 'var(--athlon-border)',
                      }}
                    >
                      {/* Top Glowing Gradient Stripe */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/40 absolute top-0 left-0 right-0" />

                      {/* Most Popular Ribbon */}
                      {pkg.isPopular && (
                        <div className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black px-3 py-1 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 fill-black" /> Popular Choice
                        </div>
                      )}

                      <div className="p-4 sm:p-5 space-y-3.5 pt-5">
                        {/* Header: Category Badge & Status */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                            {pkg.categoryLabel || pkg.category}
                          </span>

                          <button
                            onClick={() => togglePackageStatus(pkg)}
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all ${pkg.active
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                              }`}
                          >
                            {pkg.active ? '● Active' : '○ Inactive'}
                          </button>
                        </div>

                        {/* Package Title & Description */}
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                            {pkg.name}
                          </h3>
                          {pkg.description && (
                            <p className="text-xs text-foreground/60 font-medium mt-1 line-clamp-2 leading-relaxed">
                              {pkg.description}
                            </p>
                          )}
                        </div>

                        {/* Price Display Card */}
                        <div className="p-3 rounded-2xl bg-surface/80 border space-y-2"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                              ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-foreground/50 font-bold uppercase tracking-wider">
                              / {billingText}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-foreground/5 text-[10.5px] font-bold text-foreground/70">
                            <span className="flex items-center gap-1.5 truncate">
                              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{pkg.sessionsPerWeek} sess/week</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate justify-end">
                              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Max {pkg.maxTrainees} {pkg.maxTrainees === 1 ? 'client' : 'clients'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Features Inclusions List */}
                        {featuresList.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-foreground/40">
                              Package Inclusions
                            </p>
                            <div className="space-y-1.5">
                              {featuresList.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-foreground/80">
                                  <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                  <span className="line-clamp-1">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Actions Bar */}
                      <div className="p-3 sm:p-4 bg-surface/50 border-t flex items-center justify-between"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="font-mono font-black text-foreground">{pkg.enrolledCount || 0}</span>
                          <span className="text-[11px] font-medium text-foreground/50">Enrolled</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(pkg)}
                            className="p-2 rounded-xl bg-surface hover:bg-primary/15 text-foreground/70 hover:text-primary border transition-all text-xs font-bold flex items-center gap-1"
                            style={{ borderColor: 'var(--athlon-border)' }}
                            title="Edit Package"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => deletePackage(pkg.packageUuid)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all"
                            title="Delete Package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl border border-dashed text-center space-y-3 bg-surface/30"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-foreground">No coaching fee packages found</h3>
                <p className="text-xs text-foreground/50 max-w-sm mx-auto font-medium">
                  {searchQuery ? 'Try changing your search query or filter.' : 'Create tailored rate cards for 1-on-1 private training, sparring squads, or bootcamps.'}
                </p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-2xl text-xs font-black bg-primary text-black hover:opacity-90 shadow-md shadow-primary/20 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create First Package</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ─── 5. FEE INVOICES & LEDGER (MOBILE-OPTIMIZED) ─── */
          <div className="space-y-4">

            {/* Mobile View: High-End Invoice Cards (Visible on screens < md) */}
            <div className="block md:hidden space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-surface border border-border/40 animate-pulse" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isPaid = tx.status === 'PAID';
                  const isOverdue = tx.status === 'OVERDUE';

                  return (
                    <div
                      key={tx.transactionUuid}
                      className="p-4 rounded-2xl border bg-card relative overflow-hidden space-y-3 shadow-sm"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center font-black text-sm text-primary shadow-xs">
                            {tx.traineeName ? tx.traineeName.charAt(0).toUpperCase() : 'T'}
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-foreground">{tx.traineeName}</h4>
                            <p className="text-[11px] font-semibold text-foreground/50 line-clamp-1">{tx.packageName || 'Coaching Plan'}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${isPaid
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : isOverdue
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}>
                          {isPaid ? '✓ Paid' : tx.status}
                        </span>
                      </div>

                      {/* Amount & Due Date Row */}
                      <div className="p-2.5 rounded-xl bg-surface border flex items-center justify-between text-xs"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <div>
                          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">Amount</span>
                          <span className="font-mono font-black text-foreground text-sm">₹{Number(tx.amount || 0).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">Due Date</span>
                          <span className="font-semibold text-foreground/80">{tx.dueDate || 'Immediate'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-1 flex items-center justify-end gap-2">
                        {!isPaid ? (
                          <>
                            <button
                              onClick={() => handleSendReminder(tx.transactionUuid)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${reminderSent === tx.transactionUuid
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25'
                                }`}
                            >
                              {reminderSent === tx.transactionUuid ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Sent</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3" />
                                  <span>Remind</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => markAsPaid(tx.transactionUuid)}
                              className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all active:scale-95"
                            >
                              Mark Paid
                            </button>
                          </>
                        ) : (
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Settled ({tx.paidDate || 'Paid'})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-3xl border border-dashed text-center space-y-2 bg-surface/30"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Receipt className="w-8 h-8 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No fee invoices recorded yet</p>
                  <p className="text-[11px] text-foreground/40 font-medium">Enrolling trainees automatically generates fee ledger receipts.</p>
                </div>
              )}
            </div>

            {/* Desktop View: Full Ledger Table (Visible on md+) */}
            <div className="hidden md:block p-5 rounded-3xl bg-card border shadow-sm space-y-4"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Trainee Invoices & Fee Ledger</h3>
                  <p className="text-xs text-foreground/50 font-medium">Live record of tuition payments, due receipts, and settlements.</p>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-foreground/50 animate-pulse font-bold">
                  Loading fee records...
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-foreground/10 text-foreground/50 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="pb-3 pl-2">Trainee</th>
                        <th className="pb-3">Fee Package</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Due Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/5">
                      {transactions.map((tx) => {
                        const isPaid = tx.status === 'PAID';
                        const isOverdue = tx.status === 'OVERDUE';
                        return (
                          <tr key={tx.transactionUuid} className="hover:bg-foreground/[0.02] transition-colors">
                            <td className="py-3.5 pl-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">
                                  {tx.traineeName ? tx.traineeName.charAt(0).toUpperCase() : 'T'}
                                </div>
                                <div>
                                  <span className="font-bold text-foreground block">{tx.traineeName}</span>
                                  <span className="text-[10px] text-foreground/50 font-medium">{tx.paymentMethod || 'Payment Pending'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 font-semibold text-foreground/80">{tx.packageName || 'Coaching Plan'}</td>
                            <td className="py-3.5 font-mono font-black text-foreground">₹{Number(tx.amount || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3.5 text-foreground/60 font-medium">{tx.dueDate || 'N/A'}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${isPaid
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : isOverdue
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isPaid ? (
                                  <>
                                    <button
                                      onClick={() => handleSendReminder(tx.transactionUuid)}
                                      className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${reminderSent === tx.transactionUuid
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25'
                                        }`}
                                    >
                                      {reminderSent === tx.transactionUuid ? (
                                        <>
                                          <Check className="w-3 h-3 stroke-[3]" /> Sent
                                        </>
                                      ) : (
                                        <>
                                          <Send className="w-3 h-3" /> Remind
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => markAsPaid(tx.transactionUuid)}
                                      className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all"
                                    >
                                      Mark Paid
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Settled ({tx.paidDate || 'Paid'})
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-foreground/50">
                  <Receipt className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                  <p className="font-bold text-foreground/70">No fee transactions or invoices recorded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 6. MOBILE-FRIENDLY BOTTOM SHEET / MODAL ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-card border w-full max-w-lg rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {/* Drag Handle Indicator for Mobile */}
              <div className="w-10 h-1 rounded-full bg-foreground/20 mx-auto sm:hidden -mt-1 mb-2" />

              <div className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground">
                    {editingPackage ? 'Edit Fee Package' : 'Create Coaching Fee Package'}
                  </h2>
                  <p className="text-[11px] text-foreground/50 font-medium">Configure rate tier, slots, and inclusions.</p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface hover:bg-foreground/10 text-foreground/60 flex items-center justify-center text-sm font-bold transition-colors border"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1-on-1 Elite Personal Coaching"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-bold"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value as PackageCategory;
                        const labels: Record<PackageCategory, string> = {
                          '1on1': 'Personal Training',
                          'group': 'Small Group',
                          'monthly': 'Regular Batch',
                          'sparring': 'Sparring',
                          'camp': 'Weekend Camp',
                        };
                        setFormData({
                          ...formData,
                          category: cat,
                          categoryLabel: labels[cat] || 'Coaching'
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-medium"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="1on1">1-on-1 Personal</option>
                      <option value="group">Small Squad</option>
                      <option value="monthly">Monthly Batch</option>
                      <option value="sparring">Sparring Session</option>
                      <option value="camp">Bootcamp / Clinic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                      Billing Cycle
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as BillingCycle })}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-medium"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="per_session">Per Session</option>
                      <option value="per_hour">Per Hour</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                      Fee (₹ INR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-mono font-black"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                      Sessions / Wk
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={formData.sessionsPerWeek}
                      onChange={(e) => setFormData({ ...formData, sessionsPerWeek: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-bold text-center"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                      Max Trainees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxTrainees}
                      onChange={(e) => setFormData({ ...formData, maxTrainees: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-bold text-center"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe skill focus, drills, target player levels..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground resize-none font-medium"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                {/* Features Tag Input */}
                <div className="space-y-2">
                  <label className="block text-foreground/70 font-extrabold uppercase text-[10px] tracking-wider">
                    Included Perks & Drills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Video match stroke breakdown"
                      value={formData.featureInput}
                      onChange={(e) => setFormData({ ...formData, featureInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-surface border focus:ring-1 focus:ring-primary focus:outline-none text-foreground text-xs"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs hover:opacity-90 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-surface text-foreground font-semibold border text-[11px] flex items-center gap-1.5"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-foreground/40 hover:text-rose-500 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Popular & Active Checkboxes */}
                <div className="pt-2 flex items-center justify-between border-t"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-foreground font-bold text-xs">Highlight Popular</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-foreground font-bold text-xs">Active & Bookable</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-foreground/60 hover:bg-foreground/5 font-bold transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-2xl bg-primary text-black font-black hover:opacity-90 shadow-lg shadow-primary/25 transition-all text-xs disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? 'Saving...' : editingPackage ? 'Save Changes' : 'Create Package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ─── 7. FLOATING ACTION BUTTON (FAB) ─── */}
      <Athlon3DFAB
        onClick={openCreateModal}
        label="Create Fee Package"
        title="Create Fee Package"
        ariaLabel="Create Fee Package"
      />
    </div>
  );
}