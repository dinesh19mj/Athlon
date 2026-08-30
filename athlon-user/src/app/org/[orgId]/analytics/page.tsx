'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubMatchService, ClubMatch } from '@/lib/api/clubMatch';
import { ClubFinanceService, ClubFinance, FinanceSummary } from '@/lib/api/clubFinance';
import { ClubInventoryService, ClubInventoryItem, ClubInventoryLog, InventorySummary } from '@/lib/api/clubInventory';
import { ClubAttendanceService, ClubMemberAttendance } from '@/lib/api/clubAttendance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService } from '@/lib/api/user';
import {
  TrendingUp,
  Activity,
  CalendarDays,
  Package,
  CreditCard,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  PieChart,
  BarChart3,
  Flame,
  Clock,
  ShieldCheck,
  ChevronDown,
  Layers,
  Award,
  CircleDollarSign,
  TrendingDown,
  DollarSign,
  Boxes,
  UserCheck,
  Loader2,
  ArrowRight
} from 'lucide-react';

type TimeRangePreset = 'ALL' | 'THIS_MONTH' | '30_DAYS' | '3_MONTHS' | '6_MONTHS' | 'YTD' | 'CUSTOM_MONTH';
type AnalyticsDomain = 'OVERVIEW' | 'MATCHES' | 'ATTENDANCE' | 'INVENTORY' | 'FINANCES';

const AVAILABLE_SPORTS_ICONS: Record<string, string> = {
  Badminton: '🏸',
  Cricket: '🏏',
  Football: '⚽',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Pickleball: '🥒',
  Basketball: '🏀',
  Volleyball: '🏐',
  Squash: '🎾'
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function ClubAnalyticsPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;

  // Navigation / Tab state
  const [activeDomain, setActiveDomain] = useState<AnalyticsDomain>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('THIS_MONTH');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<ClubMatch[]>([]);
  const [finances, setFinances] = useState<ClubFinance[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [inventoryItems, setInventoryItems] = useState<ClubInventoryItem[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<ClubInventoryLog[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<ClubMemberAttendance[]>([]);

  // Fetch all multi-domain data
  const fetchData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [
        matchRes,
        finRes,
        finSumRes,
        invRes,
        invLogsRes,
        invSumRes,
        memRes,
        todayAttRes
      ] = await Promise.allSettled([
        ClubMatchService.getMatchesByOrg(orgUuid),
        ClubFinanceService.getFinances(orgUuid),
        ClubFinanceService.getSummary(orgUuid),
        ClubInventoryService.getItems(orgUuid),
        ClubInventoryService.getLogs(orgUuid),
        ClubInventoryService.getSummary(orgUuid),
        OrganizationService.getMembers(orgUuid),
        ClubAttendanceService.getDailyAttendance(orgUuid, new Date().toISOString().split('T')[0])
      ]);

      if (matchRes.status === 'fulfilled') setMatches((matchRes.value as any)?.data || matchRes.value || []);
      if (finRes.status === 'fulfilled') setFinances((finRes.value as any)?.data || finRes.value || []);
      if (finSumRes.status === 'fulfilled') setFinanceSummary((finSumRes.value as any)?.data || finSumRes.value || null);
      if (invRes.status === 'fulfilled') setInventoryItems((invRes.value as any)?.data || invRes.value || []);
      if (invLogsRes.status === 'fulfilled') setInventoryLogs((invLogsRes.value as any)?.data || invLogsRes.value || []);
      if (invSumRes.status === 'fulfilled') setInventorySummary((invSumRes.value as any)?.data || invSumRes.value || null);
      if (memRes.status === 'fulfilled') setMembers((memRes.value as any)?.data || memRes.value || []);
      if (todayAttRes.status === 'fulfilled') setAttendanceRecords((todayAttRes.value as any)?.data || todayAttRes.value || []);
    } catch (err) {
      console.error('Failed to load club analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgUuid]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Date Range Resolver
  const { startDate, endDate, dateLabel } = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = new Date();
    let label = 'All Time';

    if (timeRange === 'THIS_MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      label = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } else if (timeRange === '30_DAYS') {
      start = new Date();
      start.setDate(now.getDate() - 30);
      label = 'Past 30 Days';
    } else if (timeRange === '3_MONTHS') {
      start = new Date();
      start.setMonth(now.getMonth() - 3);
      label = 'Past 3 Months';
    } else if (timeRange === '6_MONTHS') {
      start = new Date();
      start.setMonth(now.getMonth() - 6);
      label = 'Past 6 Months';
    } else if (timeRange === 'YTD') {
      start = new Date(now.getFullYear(), 0, 1);
      label = `Year to Date (${now.getFullYear()})`;
    } else if (timeRange === 'CUSTOM_MONTH' && selectedMonth) {
      const [y, m] = selectedMonth.split('-').map(Number);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 0, 23, 59, 59);
      label = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }

    return {
      startDate: start,
      endDate: end,
      dateLabel: label
    };
  }, [timeRange, selectedMonth]);

  // Filter Helper
  const isDateInRange = (dateStr?: string) => {
    if (!dateStr || timeRange === 'ALL') return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  };

  // Filtered Datasets
  const filteredMatches = useMemo(() => matches.filter(m => isDateInRange(m.matchDate || m.createdOn)), [matches, startDate, endDate, timeRange]);
  const filteredFinances = useMemo(() => finances.filter(f => isDateInRange(f.transactionDate || f.createdAt)), [finances, startDate, endDate, timeRange]);
  const filteredInventoryLogs = useMemo(() => inventoryLogs.filter(l => isDateInRange(l.createdAt)), [inventoryLogs, startDate, endDate, timeRange]);

  // 1. MATCH ANALYTICS COMPUTATIONS
  const matchAnalytics = useMemo(() => {
    const total = filteredMatches.length;
    const completed = filteredMatches.filter(m => m.status === 'COMPLETED').length;
    const liveOrOngoing = filteredMatches.filter(m => m.status === 'LIVE' || m.status === 'IN_PROGRESS').length;
    const scheduled = filteredMatches.filter(m => m.status === 'SCHEDULED' || !m.status).length;

    // By Sport
    const sportsMap: Record<string, number> = {};
    filteredMatches.forEach(m => {
      const sp = m.sportType || 'Other';
      sportsMap[sp] = (sportsMap[sp] || 0) + 1;
    });

    // Player Leaderboard (Participation & Wins)
    const playerStats: Record<string, { matches: number; wins: number }> = {};
    filteredMatches.forEach(m => {
      const teamA = (m.teamAPlayers || '').split(',').map(s => s.trim()).filter(Boolean);
      const teamB = (m.teamBPlayers || '').split(',').map(s => s.trim()).filter(Boolean);
      const allPlayers = [...teamA, ...teamB];
      const isCompleted = m.status === 'COMPLETED';

      allPlayers.forEach(p => {
        if (!playerStats[p]) playerStats[p] = { matches: 0, wins: 0 };
        playerStats[p].matches += 1;
      });

      if (isCompleted && m.winner) {
        const winTeam = m.winner.toUpperCase().includes('TEAM A') || m.winner.toUpperCase().includes('A') ? teamA : teamB;
        winTeam.forEach(p => {
          if (playerStats[p]) playerStats[p].wins += 1;
        });
      }
    });

    const topPlayers = Object.entries(playerStats)
      .map(([name, s]) => ({
        name,
        matches: s.matches,
        wins: s.wins,
        winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0
      }))
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 6);

    return {
      total,
      completed,
      liveOrOngoing,
      scheduled,
      sportsMap,
      topPlayers
    };
  }, [filteredMatches]);

  // 2. FINANCIAL ANALYTICS COMPUTATIONS
  const financeAnalytics = useMemo(() => {
    let income = 0;
    let expense = 0;
    const incomeByCat: Record<string, number> = {};
    const expenseByCat: Record<string, number> = {};

    filteredFinances.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.transactionType === 'INCOME') {
        income += amt;
        incomeByCat[tx.category || 'General'] = (incomeByCat[tx.category || 'General'] || 0) + amt;
      } else {
        expense += amt;
        expenseByCat[tx.category || 'General'] = (expenseByCat[tx.category || 'General'] || 0) + amt;
      }
    });

    const net = income - expense;
    const profitMargin = income > 0 ? Math.round((net / income) * 100) : 0;

    // Monthly breakdown
    const monthlyLedger: Record<string, { income: number; expense: number; net: number }> = {};
    filteredFinances.forEach(tx => {
      const d = tx.transactionDate ? tx.transactionDate.slice(0, 7) : 'Unknown';
      if (!monthlyLedger[d]) monthlyLedger[d] = { income: 0, expense: 0, net: 0 };
      const amt = Number(tx.amount) || 0;
      if (tx.transactionType === 'INCOME') monthlyLedger[d].income += amt;
      else monthlyLedger[d].expense += amt;
      monthlyLedger[d].net = monthlyLedger[d].income - monthlyLedger[d].expense;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: net,
      profitMargin,
      incomeByCat,
      expenseByCat,
      monthlyLedger: Object.entries(monthlyLedger).sort(([a], [b]) => a.localeCompare(b))
    };
  }, [filteredFinances]);

  // 3. INVENTORY ANALYTICS COMPUTATIONS
  const inventoryAnalytics = useMemo(() => {
    const totalItems = inventoryItems.length;
    let totalUnits = 0;
    let totalValuation = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const categoryQty: Record<string, number> = {};

    inventoryItems.forEach(item => {
      const q = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      totalUnits += q;
      totalValuation += q * cost;

      if (item.status === 'OUT_OF_STOCK' || q === 0) outOfStock += 1;
      else if (item.status === 'LOW_STOCK' || q <= (item.minThreshold || 5)) lowStock += 1;
      else inStock += 1;

      const cat = item.category || 'General';
      categoryQty[cat] = (categoryQty[cat] || 0) + q;
    });

    // Movements
    let totalRestocked = 0;
    let totalConsumed = 0;
    filteredInventoryLogs.forEach(l => {
      const chg = Math.abs(Number(l.quantityChange) || 0);
      if (l.changeType === 'RESTOCK') totalRestocked += chg;
      else if (l.changeType === 'CONSUMED' || l.changeType === 'DAMAGED') totalConsumed += chg;
    });

    return {
      totalItems,
      totalUnits,
      totalValuation,
      inStock,
      lowStock,
      outOfStock,
      categoryQty,
      totalRestocked,
      totalConsumed
    };
  }, [inventoryItems, filteredInventoryLogs]);

  // 4. ATTENDANCE ANALYTICS COMPUTATIONS
  const attendanceAnalytics = useMemo(() => {
    const totalMembers = members.length || 1;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
    const unmarkedCount = Math.max(0, totalMembers - (presentCount + absentCount));
    const attendanceRate = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;

    return {
      totalMembers,
      presentCount,
      absentCount,
      unmarkedCount,
      attendanceRate
    };
  }, [members, attendanceRecords]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pb-32">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* ══════════════════════════════════════════════════════════════════════
            HEADER & GLOBAL TIME FILTER
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface/80 border border-foreground/10 p-5 sm:p-6 rounded-[28px] shadow-sm backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Club Analytics & Intelligence
              </h1>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                {dateLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/50 mt-1 font-medium max-w-2xl">
              Cross-domain performance telemetry across matches, training attendance, inventory health, and club finances.
            </p>
          </div>

          {/* Time Filter Engine */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Quick Presets */}
            <div className="bg-background/90 p-1 rounded-2xl border border-foreground/10 flex items-center gap-1 shadow-inner overflow-x-auto max-w-full">
              {(
                [
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: '3_MONTHS', label: '3M' },
                  { id: '6_MONTHS', label: '6M' },
                  { id: 'YTD', label: 'YTD' },
                  { id: 'ALL', label: 'All Time' }
                ] as { id: TimeRangePreset; label: string }[]
              ).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setTimeRange(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    timeRange === preset.id
                      ? 'bg-primary text-black shadow-md shadow-primary/25 scale-[1.02]'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Month Picker */}
            <div className="flex items-center gap-1.5 bg-background/90 px-3 py-1.5 rounded-2xl border border-foreground/10 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={e => {
                  setSelectedMonth(e.target.value);
                  setTimeRange('CUSTOM_MONTH');
                }}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Telemetry"
              className="p-2.5 rounded-2xl bg-surface border border-foreground/10 hover:bg-foreground/5 text-foreground/70 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MULTI-DOMAIN TAB NAVIGATION
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {(
            [
              { id: 'OVERVIEW', label: 'Executive Overview', icon: Sparkles, color: 'text-primary' },
              { id: 'MATCHES', label: 'Match Analytics', icon: Activity, color: 'text-red-400' },
              { id: 'ATTENDANCE', label: 'Attendance & Roster', icon: CalendarDays, color: 'text-emerald-400' },
              { id: 'INVENTORY', label: 'Inventory & Assets', icon: Package, color: 'text-orange-400' },
              { id: 'FINANCES', label: 'Treasury & Finances', icon: CreditCard, color: 'text-blue-400' }
            ] as { id: AnalyticsDomain; label: string; icon: any; color: string }[]
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = activeDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDomain(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-surface text-foreground border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/20'
                    : 'bg-surface/50 text-foreground/50 border-foreground/5 hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-foreground/40'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground/50">Aggregating club intelligence...</p>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════════
                TAB 1: EXECUTIVE OVERVIEW DECK
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* 4 Hero KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Matches Card */}
                  <div
                    onClick={() => setActiveDomain('MATCHES')}
                    className="p-5 rounded-3xl bg-surface/90 border border-foreground/10 hover:border-red-500/30 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Matches</span>
                      <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-foreground">{matchAnalytics.total}</div>
                      <div className="text-xs text-foreground/50 mt-0.5">
                        {matchAnalytics.completed} completed • {matchAnalytics.liveOrOngoing} live
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-foreground/5 flex items-center justify-between text-xs font-bold text-red-400">
                      <span>View Match Insights</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Attendance Card */}
                  <div
                    onClick={() => setActiveDomain('ATTENDANCE')}
                    className="p-5 rounded-3xl bg-surface/90 border border-foreground/10 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Attendance Rate</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-foreground">{attendanceAnalytics.attendanceRate}%</div>
                      <div className="text-xs text-foreground/50 mt-0.5">
                        {attendanceAnalytics.presentCount} present today • {attendanceAnalytics.totalMembers} athletes
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-foreground/5 flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>View Attendance Trends</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Inventory Card */}
                  <div
                    onClick={() => setActiveDomain('INVENTORY')}
                    className="p-5 rounded-3xl bg-surface/90 border border-foreground/10 hover:border-orange-500/30 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Gear & Stock</span>
                      <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-foreground">{formatCurrency(inventoryAnalytics.totalValuation)}</div>
                      <div className="text-xs text-foreground/50 mt-0.5">
                        {inventoryAnalytics.totalUnits} units • {inventoryAnalytics.lowStock} low stock alerts
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-foreground/5 flex items-center justify-between text-xs font-bold text-orange-400">
                      <span>View Inventory Health</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Treasury Card */}
                  <div
                    onClick={() => setActiveDomain('FINANCES')}
                    className="p-5 rounded-3xl bg-surface/90 border border-foreground/10 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Net Cashflow</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className={`text-2xl font-black ${financeAnalytics.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(financeAnalytics.netBalance)}
                      </div>
                      <div className="text-xs text-foreground/50 mt-0.5">
                        {financeAnalytics.profitMargin}% margin • Inflow {formatCurrency(financeAnalytics.totalIncome)}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-foreground/5 flex items-center justify-between text-xs font-bold text-blue-400">
                      <span>View Treasury Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Multi-Domain Cross-Telemetry Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Financial Velocity */}
                  <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <h3 className="text-base font-black text-foreground">Monthly Financial Performance</h3>
                      </div>
                      <span className="text-xs font-bold text-foreground/40">{dateLabel}</span>
                    </div>

                    {financeAnalytics.monthlyLedger.length === 0 ? (
                      <div className="py-12 text-center text-xs text-foreground/40">No ledger entries in this period.</div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {financeAnalytics.monthlyLedger.map(([month, data]) => {
                          const maxVal = Math.max(...financeAnalytics.monthlyLedger.map(([, d]) => Math.max(d.income, d.expense)), 1);
                          const incomeWidth = Math.min(100, Math.round((data.income / maxVal) * 100));
                          const expenseWidth = Math.min(100, Math.round((data.expense / maxVal) * 100));

                          return (
                            <div key={month} className="space-y-1.5 p-3 rounded-2xl bg-background/50 border border-foreground/5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-foreground">{month}</span>
                                <span className={data.net >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                  Net: {formatCurrency(data.net)}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="w-12 text-foreground/40">Income:</span>
                                  <div className="flex-1 bg-foreground/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${incomeWidth}%` }} />
                                  </div>
                                  <span className="font-mono text-foreground/70 w-16 text-right">{formatCurrency(data.income)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="w-12 text-foreground/40">Expense:</span>
                                  <div className="flex-1 bg-foreground/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${expenseWidth}%` }} />
                                  </div>
                                  <span className="font-mono text-foreground/70 w-16 text-right">{formatCurrency(data.expense)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sport Distribution & MVP Leaderboard */}
                  <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <h3 className="text-base font-black text-foreground">Top Active Athletes</h3>
                      </div>
                      <span className="text-xs font-bold text-foreground/40">{matchAnalytics.total} Matches</span>
                    </div>

                    {matchAnalytics.topPlayers.length === 0 ? (
                      <div className="py-12 text-center text-xs text-foreground/40">No match records available in this range.</div>
                    ) : (
                      <div className="space-y-2.5">
                        {matchAnalytics.topPlayers.map((player, idx) => (
                          <div
                            key={player.name}
                            className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-foreground/5 hover:border-primary/20 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                idx === 0 ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' :
                                idx === 1 ? 'bg-neutral-300 text-black' :
                                idx === 2 ? 'bg-amber-700 text-white' : 'bg-foreground/10 text-foreground/60'
                              }`}>
                                #{idx + 1}
                              </div>
                              <span className="font-bold text-sm text-foreground">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-foreground/50">{player.matches} matches</span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                {player.winRate}% Win
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: MATCH ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'MATCHES' && (
              <div className="space-y-6">
                {/* Match KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Total Matches</span>
                    <div className="text-2xl sm:text-3xl font-black text-foreground mt-1">{matchAnalytics.total}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Completed</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{matchAnalytics.completed}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-red-400 uppercase">Live / In Progress</span>
                    <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{matchAnalytics.liveOrOngoing}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Sports Tracked</span>
                    <div className="text-2xl sm:text-3xl font-black text-foreground mt-1">{Object.keys(matchAnalytics.sportsMap).length}</div>
                  </div>
                </div>

                {/* Sports Distribution Cards */}
                <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-4">
                  <h3 className="text-base font-black text-foreground">Matches by Sport Category</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(matchAnalytics.sportsMap).map(([sport, count]) => {
                      const icon = AVAILABLE_SPORTS_ICONS[sport] || '🏆';
                      const pct = Math.round((count / (matchAnalytics.total || 1)) * 100);

                      return (
                        <div key={sport} className="p-4 rounded-2xl bg-background/50 border border-foreground/5 space-y-2">
                          <div className="text-2xl">{icon}</div>
                          <div className="font-extrabold text-sm text-foreground">{sport}</div>
                          <div className="flex items-center justify-between text-xs text-foreground/50">
                            <span>{count} matches</span>
                            <span className="font-black text-primary">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Match Logs Table */}
                <div className="bg-surface border border-foreground/10 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-foreground/5 flex items-center justify-between">
                    <h3 className="text-base font-black text-foreground">Match Records ({filteredMatches.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[11px] font-black uppercase text-foreground/40">
                          <th className="px-6 py-3">Sport & Date</th>
                          <th className="px-6 py-3">Matchup</th>
                          <th className="px-6 py-3 text-center">Score</th>
                          <th className="px-6 py-3 text-right">Winner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/5 text-sm">
                        {filteredMatches.slice(0, 10).map((m, i) => (
                          <tr key={m.matchId || i} className="hover:bg-foreground/[0.02]">
                            <td className="px-6 py-3.5">
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                <span>{AVAILABLE_SPORTS_ICONS[m.sportType] || '🏆'}</span>
                                <span>{m.sportType}</span>
                              </div>
                              <div className="text-[11px] text-foreground/40">{m.matchDate || 'Recent'}</div>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="font-semibold text-xs text-foreground">
                                <span className="text-primary">{m.teamAPlayers || 'Team A'}</span>
                                <span className="text-foreground/40 mx-2">vs</span>
                                <span className="text-red-400">{m.teamBPlayers || 'Team B'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-center font-mono font-bold text-xs">
                              {m.score || '-'}
                            </td>
                            <td className="px-6 py-3.5 text-right font-bold text-xs text-emerald-400">
                              {m.winner || (m.status === 'COMPLETED' ? 'Finished' : m.status || 'Pending')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 3: ATTENDANCE ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'ATTENDANCE' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Active Club Roster</span>
                    <div className="text-3xl font-black text-foreground mt-1">{attendanceAnalytics.totalMembers}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Present Today</span>
                    <div className="text-3xl font-black text-emerald-400 mt-1">{attendanceAnalytics.presentCount}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-red-400 uppercase">Absent Today</span>
                    <div className="text-3xl font-black text-red-400 mt-1">{attendanceAnalytics.absentCount}</div>
                  </div>
                </div>

                <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-foreground">Attendance Status Distribution</h3>
                    <span className="text-xs font-bold text-primary">{attendanceAnalytics.attendanceRate}% Check-in Rate</span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-foreground/10 overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(attendanceAnalytics.presentCount / attendanceAnalytics.totalMembers) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(attendanceAnalytics.absentCount / attendanceAnalytics.totalMembers) * 100}%` }} />
                    <div className="bg-foreground/20 h-full flex-1" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Present ({attendanceAnalytics.presentCount})</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span>Absent ({attendanceAnalytics.absentCount})</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-foreground/30" />
                      <span>Unmarked ({attendanceAnalytics.unmarkedCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4: INVENTORY ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'INVENTORY' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Total Valuation</span>
                    <div className="text-2xl sm:text-3xl font-black text-foreground mt-1">{formatCurrency(inventoryAnalytics.totalValuation)}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-emerald-400 uppercase">In Stock</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{inventoryAnalytics.inStock}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-amber-400 uppercase">Low Stock</span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{inventoryAnalytics.lowStock}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-red-400 uppercase">Out of Stock</span>
                    <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{inventoryAnalytics.outOfStock}</div>
                  </div>
                </div>

                <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-4">
                  <h3 className="text-base font-black text-foreground">Equipment Stock by Category</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(inventoryAnalytics.categoryQty).map(([cat, qty]) => (
                      <div key={cat} className="p-4 rounded-2xl bg-background/50 border border-foreground/5 space-y-1">
                        <div className="text-xs font-bold text-foreground/50">{cat}</div>
                        <div className="text-xl font-black text-foreground">{qty} <span className="text-xs font-normal text-foreground/40">units</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 5: FINANCIAL ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'FINANCES' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Total Revenue</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{formatCurrency(financeAnalytics.totalIncome)}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-red-400 uppercase">Total Expenses</span>
                    <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{formatCurrency(financeAnalytics.totalExpense)}</div>
                  </div>
                  <div className="p-5 rounded-3xl bg-surface border border-foreground/10">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Net Margin</span>
                    <div className={`text-2xl sm:text-3xl font-black mt-1 ${financeAnalytics.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(financeAnalytics.netBalance)} ({financeAnalytics.profitMargin}%)
                    </div>
                  </div>
                </div>

                {/* Category Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income by Category */}
                  <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-3">
                    <h3 className="text-base font-black text-emerald-400">Income Breakdown</h3>
                    {Object.keys(financeAnalytics.incomeByCat).length === 0 ? (
                      <div className="py-8 text-center text-xs text-foreground/40">No income records in range.</div>
                    ) : (
                      Object.entries(financeAnalytics.incomeByCat).map(([cat, amt]) => (
                        <div key={cat} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-foreground/5">
                          <span className="font-bold text-sm text-foreground">{cat}</span>
                          <span className="font-mono font-bold text-sm text-emerald-400">{formatCurrency(amt)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Expense by Category */}
                  <div className="bg-surface border border-foreground/10 p-6 rounded-3xl space-y-3">
                    <h3 className="text-base font-black text-red-400">Expense Breakdown</h3>
                    {Object.keys(financeAnalytics.expenseByCat).length === 0 ? (
                      <div className="py-8 text-center text-xs text-foreground/40">No expense records in range.</div>
                    ) : (
                      Object.entries(financeAnalytics.expenseByCat).map(([cat, amt]) => (
                        <div key={cat} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-foreground/5">
                          <span className="font-bold text-sm text-foreground">{cat}</span>
                          <span className="font-mono font-bold text-sm text-red-400">{formatCurrency(amt)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
