'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Crown,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Shield,
  Sparkles,
  Award,
  Clock,
  Edit2,
  Tag,
  AlertCircle,
  ExternalLink,
  UserCheck,
  RefreshCw,
  ChevronRight,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  Check,
  Eye
} from 'lucide-react';
import { venueCustomerApi, VenueCustomer, VenueCustomerCreateRequest } from '@/lib/api/venueCustomer';
import { SubscriptionService, VenueEntitlementSummary } from '@/lib/api/subscription';
import { FeaturePaywallModal } from '@/components/venue/FeaturePaywallModal';
import { useVenueEntitlementsStore } from '@/store/useVenueEntitlementsStore';

export default function VenueCustomersPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const {
    entitlementsByOrg,
    loadEntitlements: loadStoreEntitlements,
    refreshEntitlements: refreshStoreEntitlements,
  } = useVenueEntitlementsStore();
  const storeEntitlements = orgId ? entitlementsByOrg[orgId] : null;

  const [customers, setCustomers] = useState<VenueCustomer[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [desktopSortBy, setDesktopSortBy] = useState<'LTV_DESC' | 'BOOKINGS_DESC' | 'RECENT_DESC' | 'NAME_ASC'>('LTV_DESC');
  const [desktopViewMode, setDesktopViewMode] = useState<'table' | 'grid'>('table');
  const [localEntitlements, setEntitlements] = useState<VenueEntitlementSummary | null>(null);
  const entitlements = storeEntitlements || localEntitlements;
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<VenueCustomer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<VenueCustomer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vipTier, setVipTier] = useState<'STANDARD' | 'SILVER' | 'GOLD' | 'VIP'>('STANDARD');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!orgId) return;
    loadEntitlements();
    loadCustomers();
  }, [orgId, selectedTier]);

  const loadEntitlements = async () => {
    try {
      const ent = await refreshStoreEntitlements(orgId);
      if (ent) {
        setEntitlements(ent);
      }
    } catch (e) {
      console.warn('Failed to fetch entitlements:', e);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await venueCustomerApi.getCustomers(orgId, {
        search: search.trim() || undefined,
        tier: selectedTier || undefined,
        page: 0,
        size: 100,
      });
      setCustomers(res.content || []);
      setTotalElements(res.totalElements || 0);
    } catch (e) {
      console.error('Failed to load customers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadEntitlements(), loadCustomers()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleOpenCreateModal = () => {
    if (entitlements && !entitlements.features?.VENUE_ADVANCED_CRM) {
      setIsPaywallOpen(true);
      return;
    }
    setEditingCustomer(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setVipTier('STANDARD');
    setNotes('');
    setTags('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: VenueCustomer) => {
    setEditingCustomer(c);
    setFullName(c.fullName);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setVipTier(c.vipTier || 'STANDARD');
    setNotes(c.notes || '');
    setTags(c.tags || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Player/Customer name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: VenueCustomerCreateRequest = {
        organizationUuid: orgId,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        vipTier,
        notes: notes.trim() || undefined,
        tags: tags.trim() || undefined,
      };

      if (editingCustomer) {
        const updated = await venueCustomerApi.updateCustomer(editingCustomer.customerUuid, payload);
        if (selectedCustomer && selectedCustomer.customerUuid === editingCustomer.customerUuid) {
          setSelectedCustomer(updated);
        }
      } else {
        await venueCustomerApi.createCustomer(payload);
      }

      setIsModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to save customer record');
    } finally {
      setSaving(false);
    }
  };

  const tierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'GOLD':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'SILVER':
        return 'bg-slate-300/10 text-slate-300 border-slate-400/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return {
          label: 'VIP Member',
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          ring: 'ring-amber-500/30',
          icon: Crown,
        };
      case 'GOLD':
        return {
          label: 'Gold Tier',
          badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
          dot: 'bg-yellow-400',
          ring: 'ring-yellow-500/30',
          icon: Award,
        };
      case 'SILVER':
        return {
          label: 'Silver Tier',
          badge: 'bg-slate-300/15 text-slate-300 border-slate-300/30',
          dot: 'bg-slate-300',
          ring: 'ring-slate-300/30',
          icon: Shield,
        };
      default:
        return {
          label: 'Standard',
          badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
          ring: 'ring-blue-500/30',
          icon: UserCheck,
        };
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'PL';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatLastVisit = (dateStr?: string) => {
    if (!dateStr) return 'No visits yet';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Metrics calculation
  const totalLtv = useMemo(() => {
    return customers.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0);
  }, [customers]);

  const totalBookingsCount = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.totalBookings || 0), 0);
  }, [customers]);

  const vipCount = useMemo(() => {
    return customers.filter(c => c.vipTier === 'VIP' || c.vipTier === 'GOLD').length;
  }, [customers]);

  const averageLtv = useMemo(() => {
    return customers.length > 0 ? Math.round(totalLtv / customers.length) : 0;
  }, [customers, totalLtv]);

  const averageBookings = useMemo(() => {
    return customers.length > 0 ? (totalBookingsCount / customers.length).toFixed(1) : '0';
  }, [customers, totalBookingsCount]);

  const tierCounts = useMemo(() => {
    return {
      VIP: customers.filter(c => c.vipTier === 'VIP').length,
      GOLD: customers.filter(c => c.vipTier === 'GOLD').length,
      SILVER: customers.filter(c => c.vipTier === 'SILVER').length,
      STANDARD: customers.filter(c => !c.vipTier || c.vipTier === 'STANDARD').length,
    };
  }, [customers]);

  const hasCrmFeature = entitlements?.features?.VENUE_ADVANCED_CRM ?? true;

  // Processed customers with search and sorting
  const processedCustomers = useMemo(() => {
    let list = [...customers];
    if (selectedTier) {
      list = list.filter((c) => c.vipTier === selectedTier);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        return (
          c.fullName?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.tags?.toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => {
      switch (desktopSortBy) {
        case 'LTV_DESC':
          return (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0);
        case 'BOOKINGS_DESC':
          return (b.totalBookings || 0) - (a.totalBookings || 0);
        case 'RECENT_DESC': {
          const timeA = a.lastVisitAt ? new Date(a.lastVisitAt).getTime() : 0;
          const timeB = b.lastVisitAt ? new Date(b.lastVisitAt).getTime() : 0;
          return timeB - timeA;
        }
        case 'NAME_ASC':
          return (a.fullName || '').localeCompare(b.fullName || '');
        default:
          return 0;
      }
    });

    return list;
  }, [customers, selectedTier, search, desktopSortBy]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (block md:hidden) - 100% UNTOUCHED ORIGINAL LAYOUT        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Header Banner */}
        <div className="flex flex-col justify-between items-start gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Customer CRM</h1>
              {!hasCrmFeature && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Pro
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs">
              Track player LTV, visit frequency, VIP tiers, and custom notes automatically synced from bookings.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Player
          </button>
        </div>

        {/* Mobile Feature Locked Banner */}
        {!hasCrmFeature && (
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Unlock Customer CRM</h3>
                <p className="text-xs text-slate-400">
                  Upgrade to Professional plan to track repeat visitors and player notes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="w-full py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        {/* Mobile Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-medium tracking-wider">Total Players</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white">{totalElements}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-medium tracking-wider">VIP & Gold</span>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400">{vipCount}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-medium tracking-wider">Bookings</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">{totalBookingsCount}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-medium tracking-wider">Spend (LTV)</span>
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">₹{totalLtv.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Mobile Filter and Search Bar */}
        <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['', 'VIP', 'GOLD', 'SILVER', 'STANDARD'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 rounded-xl text-xs font-medium border whitespace-nowrap ${
                  selectedTier === tier
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {tier ? tier : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Customer Cards List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2" />
              <p className="text-xs">Loading player directory...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No players found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Player profiles are automatically created when new court bookings are made.
              </p>
            </div>
          ) : (
            customers.map((c) => (
              <div
                key={c.customerUuid}
                onClick={() => setSelectedCustomer(c)}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 active:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{c.fullName}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">{c.phone || c.email || 'No contact'}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tierBadgeColor(c.vipTier)}`}>
                    {c.vipTier}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500">Bookings: </span>
                    <span className="font-bold text-white">{c.totalBookings || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Spend: </span>
                    <span className="font-bold text-emerald-400">₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:block) - ATHLETIC STADIUM CRM COMMAND CENTER   */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">

        {/* Desktop Header */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <span>Venue Management</span>
              <span>/</span>
              <span className="text-foreground">Customers</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Customer CRM
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Player directory, loyalty tiers, visit cadence, and spending history.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Directory"
              className="p-2.5 rounded-xl bg-card border border-border/80 hover:bg-white/5 active:scale-95 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Player
            </button>
          </div>
        </div>

        {/* Feature Paywall Callout (if locked) */}
        {!hasCrmFeature && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-foreground font-medium">Advanced CRM available with Professional plan</span>
            </div>
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shrink-0"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        {/* 4 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Total Players</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{totalElements}</span>
              <span className="text-xs text-muted-foreground font-medium">registered</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">VIP & Gold</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{vipCount}</span>
              <span className="text-xs text-muted-foreground font-medium">
                ({customers.length ? Math.round((vipCount / customers.length) * 100) : 0}%)
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">VIP: {tierCounts.VIP}</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">Gold: {tierCounts.GOLD}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-300/10 text-slate-300">Silver: {tierCounts.SILVER}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Total Bookings</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-400">{totalBookingsCount}</span>
              <span className="text-xs text-muted-foreground font-medium">sessions</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              ~{averageBookings} avg per player
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Recorded Spend</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">₹{totalLtv.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
              ₹{averageLtv.toLocaleString('en-IN')} avg player value
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left: Search Bar & Tier Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player, phone, email..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Tier Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-background border border-border/80 rounded-xl">
              {[
                { key: '', label: 'All', count: customers.length },
                { key: 'VIP', label: 'VIP', count: tierCounts.VIP },
                { key: 'GOLD', label: 'Gold', count: tierCounts.GOLD },
                { key: 'SILVER', label: 'Silver', count: tierCounts.SILVER },
                { key: 'STANDARD', label: 'Standard', count: tierCounts.STANDARD },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTier(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedTier === tab.key
                      ? 'bg-primary text-black shadow-sm font-black'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedTier === tab.key ? 'bg-black/20 text-black' : 'bg-white/5 text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>


          {/* Right: Sort and View Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground hidden sm:inline">Sort:</span>
              <select
                value={desktopSortBy}
                onChange={(e: any) => setDesktopSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="LTV_DESC">Highest LTV / Spend</option>
                <option value="BOOKINGS_DESC">Most Bookings</option>
                <option value="RECENT_DESC">Most Recent Visit</option>
                <option value="NAME_ASC">Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setDesktopViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'table'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ledger Table"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Ledger
              </button>
              <button
                onClick={() => setDesktopViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'grid'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Cards Grid"
              >
                <Users className="w-3.5 h-3.5" /> Cards
              </button>
            </div>
          </div>
        </div>

        {/* Content Display: Table or Grid */}
        {loading ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Retrieving player roster from Athlon Identity Service...
            </p>
          </div>
        ) : processedCustomers.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">No Player Profiles Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {search || selectedTier
                  ? 'No player records match the current filter or search criteria.'
                  : 'Start building your player registry. Customer records automatically capture guests booking courts.'}
              </p>
            </div>
            {search || selectedTier ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedTier('');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-foreground hover:bg-white/20 transition-all"
              >
                Clear Search & Filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add First Player
              </button>
            )}
          </div>
        ) : desktopViewMode === 'table' ? (
          /* ================= LEDGER TABLE VIEW ================= */
          <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-background/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Player Athlete</th>
                    <th className="p-4">Loyalty Tier</th>
                    <th className="p-4">Contact Channels</th>
                    <th className="p-4 text-center">Sessions Booked</th>
                    <th className="p-4 text-right">Lifetime Value (LTV)</th>
                    <th className="p-4">Last Activity</th>
                    <th className="p-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {processedCustomers.map((c) => {
                    const tierInfo = getTierInfo(c.vipTier);
                    const TierIcon = tierInfo.icon;
                    const initials = getInitials(c.fullName);
                    const totalSpentNum = Number(c.totalSpent) || 0;

                    return (
                      <tr key={c.customerUuid} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Player Athlete */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              c.vipTier === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                              c.vipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                              'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {initials}
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-black text-foreground group-hover:text-primary transition-colors text-sm">
                                {c.fullName}
                              </div>
                              {c.tags && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {c.tags.split(',').slice(0, 2).map((t, i) => (
                                    <span key={i} className="px-1.5 py-0.2 rounded bg-white/5 text-[10px] font-medium text-muted-foreground">
                                      {t.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Loyalty Tier */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${tierInfo.badge}`}>
                            <TierIcon className="w-3 h-3" />
                            {tierInfo.label}
                          </span>
                        </td>

                        {/* Contact Channels */}
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">
                          <div className="space-y-1">
                            {c.phone ? (
                              <a
                                href={`tel:${c.phone}`}
                                className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors"
                              >
                                <Phone className="w-3 h-3 text-muted-foreground/60" />
                                <span>{c.phone}</span>
                              </a>
                            ) : (
                              <span className="text-foreground/30 text-[10px]">No phone</span>
                            )}
                            {c.email && (
                              <a
                                href={`mailto:${c.email}`}
                                className="flex items-center gap-1.5 text-foreground/60 hover:text-primary transition-colors truncate max-w-[180px]"
                              >
                                <Mail className="w-3 h-3 text-muted-foreground/60" />
                                <span>{c.email}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Sessions Booked */}
                        <td className="p-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black text-foreground text-sm font-mono">
                              {c.totalBookings || 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground">reservations</span>
                          </div>
                        </td>

                        {/* Recorded Spend (LTV) */}
                        <td className="p-4 text-right">
                          <div className="font-mono font-black text-emerald-400 text-sm">
                            ₹{totalSpentNum.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {c.totalBookings > 0 ? `~₹${Math.round(totalSpentNum / c.totalBookings)} / session` : 'No spend yet'}
                          </div>
                        </td>

                        {/* Last Activity */}
                        <td className="p-4">
                          <div className="font-medium text-foreground text-xs">
                            {formatLastVisit(c.lastVisitAt)}
                          </div>
                          {c.lastVisitAt && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {new Date(c.lastVisitAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              title="Inspect Player Profile"
                              className="px-2.5 py-1.5 rounded-xl border border-border/80 hover:bg-white/5 text-[11px] font-bold text-foreground/80 hover:text-foreground transition-all flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Profile
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              title="Edit Player Record"
                              className="p-1.5 rounded-xl border border-border/80 hover:bg-white/5 text-primary transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/org/${orgId}/venue/bookings`}
                              title="Book slot for player"
                              className="p-1.5 rounded-xl border border-border/80 hover:bg-white/5 text-emerald-400 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= CARDS GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedCustomers.map((c) => {
              const tierInfo = getTierInfo(c.vipTier);
              const TierIcon = tierInfo.icon;
              const initials = getInitials(c.fullName);
              const totalSpentNum = Number(c.totalSpent) || 0;

              return (
                <div
                  key={c.customerUuid}
                  className="group relative p-5 rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg space-y-4"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar + Name + Tier Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                          c.vipTier === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          c.vipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {c.fullName}
                          </h3>
                          <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-black border ${tierInfo.badge}`}>
                            <TierIcon className="w-2.5 h-2.5" />
                            {tierInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LTV & Bookings Bento Stat */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-background/60 border border-border/60">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Recorded LTV</div>
                        <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                          ₹{totalSpentNum.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Sessions</div>
                        <div className="text-sm font-black text-foreground font-mono mt-0.5">
                          {c.totalBookings || 0} bookings
                        </div>
                      </div>
                    </div>

                    {/* Contact & Last Active */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {c.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span className="font-mono text-foreground/80">{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-primary/70" />
                        <span>Last active: <strong className="text-foreground">{formatLastVisit(c.lastVisitAt)}</strong></span>
                      </div>
                    </div>

                    {/* Tags */}
                    {c.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {c.tags.split(',').map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-medium text-foreground/70">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" /> View Details
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary transition-all flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DESKTOP SLIDE-OVER PLAYER PROFILE INSPECTOR                             */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Drawer Top Bar */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                    selectedCustomer.vipTier === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    selectedCustomer.vipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                    'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {getInitials(selectedCustomer.fullName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">{selectedCustomer.fullName}</h2>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border mt-0.5 ${getTierInfo(selectedCustomer.vipTier).badge}`}>
                      {getTierInfo(selectedCustomer.vipTier).label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Financial & Activity Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lifetime Spend (LTV)</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    ₹{Number(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Cumulative court payments
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Reservations</span>
                  <div className="text-xl font-black text-foreground font-mono">
                    {selectedCustomer.totalBookings || 0}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Sessions completed
                  </div>
                </div>
              </div>

              {/* Contact Credentials */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact Channels</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Phone
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {selectedCustomer.phone || 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" /> Email
                    </span>
                    <span className="font-mono text-foreground truncate max-w-[240px]">
                      {selectedCustomer.email || 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> Last Activity
                    </span>
                    <span className="font-medium text-foreground">
                      {formatLastVisit(selectedCustomer.lastVisitAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedCustomer.tags && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Player Tags & Segment</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCustomer.tags.split(',').map((t, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-white/5 border border-border/80 text-xs font-medium text-foreground">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff Notes */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Staff Notes & Preferences</span>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedCustomer.notes || 'No internal notes recorded yet for this player.'}
                </p>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <Link
                href={`/org/${orgId}/venue/bookings`}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Book Court Slot
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = selectedCustomer;
                    setSelectedCustomer(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 transition-all"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Add / Edit Player Profile + Paywall)                            */}
      {/* ========================================================================= */}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 lg:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {editingCustomer ? 'Edit Player Profile' : 'Add New Player'}
                </h3>
                <p className="text-xs text-muted-foreground">Manage athlete CRM details, loyalty tier and contact channels</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">VIP Loyalty Tier</label>
                  <select
                    value={vipTier}
                    onChange={(e: any) => setVipTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="VIP">VIP Member</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Badminton Regular, Weekend Squad, Corporate"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-colors"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {['Badminton Regular', 'Weekend Squad', 'Corporate Member', 'Academy Parent', 'Evening Slot'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const current = tags.split(',').map((x) => x.trim()).filter(Boolean);
                        if (!current.includes(t)) {
                          setTags(current.length ? `${tags}, ${t}` : t);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Staff Notes & Preferences</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Court preferences, shuttle brand, corporate billing, etc."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-background border border-border hover:bg-white/5 text-foreground text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary text-black hover:brightness-110 disabled:opacity-50 text-xs font-black rounded-xl transition shadow-lg shadow-primary/20"
                >
                  {saving ? 'Saving...' : editingCustomer ? 'Update Player' : 'Save Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Paywall Modal */}
      <FeaturePaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        orgId={orgId}
        featureName="Customer CRM & Player Management"
        featureDescription="Track player history, lifetime value, loyalty tiers, and contact preferences with Athlon's Venue CRM."
        requiredPlan="Professional"
        currentPlan={entitlements?.planName || 'Free'}
      />
    </div>
  );
}
