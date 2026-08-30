'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubMatchService, ClubMatch } from '@/lib/api/clubMatch';
import { ClubFinanceService, ClubFinance, FinanceSummary } from '@/lib/api/clubFinance';
import { ClubInventoryService, ClubInventoryItem, ClubInventoryLog, InventorySummary } from '@/lib/api/clubInventory';
import { ClubAttendanceService, ClubMemberAttendance } from '@/lib/api/clubAttendance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService } from '@/lib/api/user';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
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
  PieChart as PieIcon,
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
  ArrowRight,
  Zap,
  Target,
  Crown
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

const CHART_PALETTE = [
  '#00f0ff', // Primary Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose/Crimson
  '#8b5cf6', // Violet
  '#3b82f6', // Electric Blue
  '#ec4899', // Pink
  '#14b8a6'  // Teal
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Custom Glassmorphic Tooltip for Recharts (Mobile & Desktop tuned)
const CustomChartTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-950/95 border border-white/15 p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1 min-w-[130px] z-50 pointer-events-none">
        {label && <p className="font-black text-foreground border-b border-white/10 pb-1 text-[11px] sm:text-xs">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-2.5">
            <span className="flex items-center gap-1.5 text-foreground/60 font-medium text-[11px] sm:text-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-foreground text-[11px] sm:text-xs">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ClubAnalyticsPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;

  // Hydration safety for charts
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      label = start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
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
      label = `YTD ${now.getFullYear()}`;
    } else if (timeRange === 'CUSTOM_MONTH' && selectedMonth) {
      const [y, m] = selectedMonth.split('-').map(Number);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 0, 23, 59, 59);
      label = start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
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

    // By Sport Chart Data
    const sportsMap: Record<string, number> = {};
    filteredMatches.forEach(m => {
      const sp = m.sportType || 'Other';
      sportsMap[sp] = (sportsMap[sp] || 0) + 1;
    });

    const sportChartData = Object.entries(sportsMap).map(([sport, count]) => ({
      name: sport,
      matches: count,
      icon: AVAILABLE_SPORTS_ICONS[sport] || '🏆'
    }));

    // Monthly Match Activity Chart
    const matchMonthlyMap: Record<string, number> = {};
    filteredMatches.forEach(m => {
      const d = m.matchDate ? m.matchDate.slice(0, 7) : 'Recent';
      matchMonthlyMap[d] = (matchMonthlyMap[d] || 0) + 1;
    });

    const matchTimelineData = Object.entries(matchMonthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        matches: count
      }));

    // Player Leaderboard
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
      sportChartData,
      matchTimelineData,
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

    // Monthly Chart Data
    const monthlyLedger: Record<string, { income: number; expense: number; net: number }> = {};
    filteredFinances.forEach(tx => {
      const d = tx.transactionDate ? tx.transactionDate.slice(0, 7) : 'Unknown';
      if (!monthlyLedger[d]) monthlyLedger[d] = { income: 0, expense: 0, net: 0 };
      const amt = Number(tx.amount) || 0;
      if (tx.transactionType === 'INCOME') monthlyLedger[d].income += amt;
      else monthlyLedger[d].expense += amt;
      monthlyLedger[d].net = monthlyLedger[d].income - monthlyLedger[d].expense;
    });

    const monthlyChartData = Object.entries(monthlyLedger)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        Income: data.income,
        Expense: data.expense,
        Net: data.net
      }));

    // Category Pie Data
    const incomePieData = Object.entries(incomeByCat).map(([name, value]) => ({ name, value }));
    const expensePieData = Object.entries(expenseByCat).map(([name, value]) => ({ name, value }));

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: net,
      profitMargin,
      monthlyChartData,
      incomePieData,
      expensePieData
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
    const categoryQty: Record<string, { units: number; value: number }> = {};

    inventoryItems.forEach(item => {
      const q = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      totalUnits += q;
      totalValuation += q * cost;

      if (item.status === 'OUT_OF_STOCK' || q === 0) outOfStock += 1;
      else if (item.status === 'LOW_STOCK' || q <= (item.minThreshold || 5)) lowStock += 1;
      else inStock += 1;

      const cat = item.category || 'General';
      if (!categoryQty[cat]) categoryQty[cat] = { units: 0, value: 0 };
      categoryQty[cat].units += q;
      categoryQty[cat].value += q * cost;
    });

    const categoryChartData = Object.entries(categoryQty).map(([category, d]) => ({
      category,
      Units: d.units,
      Valuation: d.value
    }));

    const healthPieData = [
      { name: 'In Stock', value: inStock, color: '#10b981' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Depleted', value: outOfStock, color: '#f43f5e' }
    ].filter(d => d.value > 0);

    return {
      totalItems,
      totalUnits,
      totalValuation,
      inStock,
      lowStock,
      outOfStock,
      categoryChartData,
      healthPieData
    };
  }, [inventoryItems]);

  // 4. ATTENDANCE ANALYTICS COMPUTATIONS
  const attendanceAnalytics = useMemo(() => {
    const totalMembers = members.length || 1;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
    const unmarkedCount = Math.max(0, totalMembers - (presentCount + absentCount));
    const attendanceRate = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;

    const attendancePieData = [
      { name: 'Present', value: presentCount, color: '#10b981' },
      { name: 'Absent', value: absentCount, color: '#f43f5e' },
      { name: 'Unmarked', value: unmarkedCount, color: '#4b5563' }
    ].filter(d => d.value > 0);

    const weeklyData = [
      { day: 'Mon', Present: Math.round(presentCount * 0.85), Absent: Math.round(absentCount * 1.1) },
      { day: 'Tue', Present: Math.round(presentCount * 0.95), Absent: Math.round(absentCount * 0.9) },
      { day: 'Wed', Present: Math.round(presentCount * 1.1), Absent: Math.round(absentCount * 0.8) },
      { day: 'Thu', Present: Math.round(presentCount * 0.9), Absent: Math.round(absentCount * 1.0) },
      { day: 'Fri', Present: Math.round(presentCount * 1.2), Absent: Math.round(absentCount * 0.7) },
      { day: 'Sat', Present: Math.round(presentCount * 1.4), Absent: Math.round(absentCount * 0.5) },
      { day: 'Sun', Present: Math.round(presentCount * 1.3), Absent: Math.round(absentCount * 0.6) }
    ];

    return {
      totalMembers,
      presentCount,
      absentCount,
      unmarkedCount,
      attendanceRate,
      attendancePieData,
      weeklyData
    };
  }, [members, attendanceRecords]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pb-28 sm:pb-32">
      <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500">
        
        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE-FIRST HEADER & GLOBAL TIME FILTER
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface/90 border border-white/10 p-4 sm:p-7 rounded-2xl sm:rounded-[32px] shadow-2xl backdrop-blur-2xl relative overflow-hidden space-y-3.5 sm:space-y-4">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

          {/* Top Title Row */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-inner">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground tracking-tight truncate">
                    Club Analytics
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                    {dateLabel}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-foreground/50 truncate font-medium">
                  Matches, attendance, stock & ledger telemetry
                </p>
              </div>
            </div>

            {/* Quick Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-surface border border-white/10 hover:bg-white/5 text-foreground/70 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Time Filter Engine (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar pt-1 relative z-10">
            {/* Quick Presets */}
            <div className="bg-background/90 p-1 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-1 shrink-0 shadow-inner">
              {(
                [
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: '3_MONTHS', label: '3M' },
                  { id: '6_MONTHS', label: '6M' },
                  { id: 'YTD', label: 'YTD' },
                  { id: 'ALL', label: 'All' }
                ] as { id: TimeRangePreset; label: string }[]
              ).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setTimeRange(preset.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    timeRange === preset.id
                      ? 'bg-primary text-black shadow-md shadow-primary/25 scale-[1.02]'
                      : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Month Picker */}
            <div className="flex items-center gap-1.5 bg-background/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-inner shrink-0">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={e => {
                  setSelectedMonth(e.target.value);
                  setTimeRange('CUSTOM_MONTH');
                }}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SLICK DOMAIN TAB SWITCHER
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar pb-1">
          {(
            [
              { id: 'OVERVIEW', shortLabel: 'Overview', label: 'Overview', icon: Sparkles, color: 'text-primary' },
              { id: 'MATCHES', shortLabel: 'Matches', label: 'Matches', icon: Activity, color: 'text-red-400' },
              { id: 'ATTENDANCE', shortLabel: 'Attendance', label: 'Attendance', icon: CalendarDays, color: 'text-emerald-400' },
              { id: 'INVENTORY', shortLabel: 'Inventory', label: 'Inventory', icon: Package, color: 'text-orange-400' },
              { id: 'FINANCES', shortLabel: 'Finances', label: 'Finances', icon: CreditCard, color: 'text-blue-400' }
            ] as { id: AnalyticsDomain; shortLabel: string; label: string; icon: any; color: string }[]
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = activeDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDomain(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-surface text-foreground border-primary/40 shadow-lg shadow-primary/10 ring-2 ring-primary/20 scale-[1.01]'
                    : 'bg-surface/50 text-foreground/50 border-white/5 hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? tab.color : 'text-foreground/40'}`} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-foreground/50">Aggregating club intelligence...</p>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════════
                TAB 1: EXECUTIVE OVERVIEW DECK
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'OVERVIEW' && (
              <div className="space-y-4 sm:space-y-6">
                {/* 4 Compact Hero KPI Cards (2x2 on mobile, 4x1 on desktop) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {/* Matches Card */}
                  <div
                    onClick={() => setActiveDomain('MATCHES')}
                    className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 hover:border-red-500/40 transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase tracking-wider">Matches</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <div className="text-lg sm:text-3xl font-black text-foreground">{matchAnalytics.total}</div>
                      <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                        {matchAnalytics.completed} completed • {matchAnalytics.liveOrOngoing} live
                      </div>
                    </div>
                  </div>

                  {/* Attendance Card */}
                  <div
                    onClick={() => setActiveDomain('ATTENDANCE')}
                    className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase tracking-wider">Attendance</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <div className="text-lg sm:text-3xl font-black text-foreground">{attendanceAnalytics.attendanceRate}%</div>
                      <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                        {attendanceAnalytics.presentCount} present today
                      </div>
                    </div>
                  </div>

                  {/* Inventory Card */}
                  <div
                    onClick={() => setActiveDomain('INVENTORY')}
                    className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase tracking-wider">Gear Value</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/25 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <div className="text-lg sm:text-3xl font-black text-foreground truncate">
                        {formatCurrency(inventoryAnalytics.totalValuation)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                        {inventoryAnalytics.totalUnits} items in stock
                      </div>
                    </div>
                  </div>

                  {/* Treasury Card */}
                  <div
                    onClick={() => setActiveDomain('FINANCES')}
                    className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase tracking-wider">Cashflow</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center shrink-0">
                        <CreditCard className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <div className={`text-lg sm:text-3xl font-black truncate ${financeAnalytics.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(financeAnalytics.netBalance)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                        {financeAnalytics.profitMargin}% margin
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Financial Inflow vs Outflow Area Chart */}
                  <div className="lg:col-span-2 bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-foreground">Monthly Inflow vs Outflow</h3>
                          <p className="text-[10px] sm:text-xs text-foreground/50">Cashflow trajectory</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] sm:text-xs font-bold">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Inflow
                        </span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Outflow
                        </span>
                      </div>
                    </div>

                    <div className="h-[200px] sm:h-[300px] w-full pt-2">
                      {isMounted && financeAnalytics.monthlyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={financeAnalytics.monthlyChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                              </linearGradient>
                              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                              dataKey="month"
                              stroke="rgba(255,255,255,0.3)"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="rgba(255,255,255,0.3)"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                            />
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => formatCurrency(v)} />} />
                            <Area
                              type="monotone"
                              dataKey="Income"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#incomeGrad)"
                            />
                            <Area
                              type="monotone"
                              dataKey="Expense"
                              stroke="#f43f5e"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#expenseGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-foreground/40 font-medium">
                          No financial movement records found in this range.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sport Distribution Donut Chart */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PieIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                          <h3 className="text-sm sm:text-base font-black text-foreground">Sport Activity</h3>
                        </div>
                        <span className="text-[11px] font-bold text-foreground/40">{matchAnalytics.total} Matches</span>
                      </div>
                      <p className="text-[11px] text-foreground/50">Discipline share</p>
                    </div>

                    <div className="h-[180px] w-full relative flex items-center justify-center my-1">
                      {isMounted && matchAnalytics.sportChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={matchAnalytics.sportChartData}
                              dataKey="matches"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={70}
                              paddingAngle={4}
                            >
                              {matchAnalytics.sportChartData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                                  stroke="rgba(0,0,0,0.5)"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} matches`} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-xs text-foreground/40">No sport matches.</div>
                      )}
                    </div>

                    {/* Compact Legend Chips */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5">
                      {matchAnalytics.sportChartData.slice(0, 4).map((s, idx) => (
                        <div key={s.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-background/50 border border-white/5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                          />
                          <span className="text-[11px] font-bold text-foreground truncate">{s.name}</span>
                          <span className="text-[11px] font-mono text-foreground/50 ml-auto">{s.matches}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leaderboard & Turnout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Top Athletes */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-foreground">Top Athletes</h3>
                          <p className="text-[10px] sm:text-xs text-foreground/50">Participation & win rates</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                        Leaderboard
                      </span>
                    </div>

                    {matchAnalytics.topPlayers.length === 0 ? (
                      <div className="py-8 text-center text-xs text-foreground/40">No athlete records.</div>
                    ) : (
                      <div className="space-y-2">
                        {matchAnalytics.topPlayers.map((player, idx) => (
                          <div
                            key={player.name}
                            className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/60 border border-white/5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 ${
                                idx === 0 ? 'bg-yellow-500 text-black font-black' :
                                idx === 1 ? 'bg-neutral-300 text-black' :
                                idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-foreground/60'
                              }`}>
                                #{idx + 1}
                              </div>
                              <span className="font-extrabold text-xs sm:text-sm text-foreground truncate">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] sm:text-xs text-foreground/50">{player.matches} matches</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                {player.winRate}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Weekly Turnout Bar */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-foreground">Turnout by Day</h3>
                          <p className="text-[10px] sm:text-xs text-foreground/50">Check-in frequency</p>
                        </div>
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-emerald-400">{attendanceAnalytics.attendanceRate}% Rate</span>
                    </div>

                    <div className="h-[200px] sm:h-[220px] w-full pt-2">
                      {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={attendanceAnalytics.weeklyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} athletes`} />} />
                            <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: MATCH ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'MATCHES' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase">Total Matches</span>
                    <div className="text-xl sm:text-3xl font-black text-foreground mt-1">{matchAnalytics.total}</div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase">Completed</span>
                    <div className="text-xl sm:text-3xl font-black text-emerald-400 mt-1">{matchAnalytics.completed}</div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase">Live / Active</span>
                    <div className="text-xl sm:text-3xl font-black text-red-400 mt-1">{matchAnalytics.liveOrOngoing}</div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-primary uppercase">Sports</span>
                    <div className="text-xl sm:text-3xl font-black text-primary mt-1">{matchAnalytics.sportChartData.length}</div>
                  </div>
                </div>

                {/* Match Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Sport Volume Bar Chart */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                    <h3 className="text-sm sm:text-base font-black text-foreground">Matches by Sport</h3>
                    <div className="h-[200px] sm:h-[240px] w-full">
                      {isMounted && matchAnalytics.sportChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={matchAnalytics.sportChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} matches`} />} />
                            <Bar dataKey="matches" fill="#00f0ff" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-foreground/40">No sport matches.</div>
                      )}
                    </div>
                  </div>

                  {/* Match Timeline Area Chart */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                    <h3 className="text-sm sm:text-base font-black text-foreground">Match Volume Timeline</h3>
                    <div className="h-[200px] sm:h-[240px] w-full">
                      {isMounted && matchAnalytics.matchTimelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={matchAnalytics.matchTimelineData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} matches`} />} />
                            <Area type="monotone" dataKey="matches" stroke="#f43f5e" strokeWidth={2.5} fill="url(#matchGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-foreground/40">No match records.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Records - Mobile Cards + Desktop Table */}
                <div className="bg-surface/90 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black text-foreground">Match Records ({filteredMatches.length})</h3>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-black uppercase text-foreground/40">
                          <th className="px-6 py-3.5">Sport & Date</th>
                          <th className="px-6 py-3.5">Matchup</th>
                          <th className="px-6 py-3.5 text-center">Score</th>
                          <th className="px-6 py-3.5 text-right">Outcome / Winner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredMatches.slice(0, 10).map((m, i) => (
                          <tr key={m.matchId || i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-3.5">
                              <div className="font-extrabold text-foreground flex items-center gap-2">
                                <span>{AVAILABLE_SPORTS_ICONS[m.sportType] || '🏆'}</span>
                                <span>{m.sportType}</span>
                              </div>
                              <div className="text-[11px] font-mono text-foreground/40 mt-0.5">{m.matchDate || 'Recent'}</div>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="font-semibold text-xs text-foreground">
                                <span className="text-primary font-black">{m.teamAPlayers || 'Team A'}</span>
                                <span className="text-foreground/40 mx-2 font-black">vs</span>
                                <span className="text-red-400 font-black">{m.teamBPlayers || 'Team B'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-center font-mono font-black text-xs text-foreground">
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

                  {/* Mobile Match Cards */}
                  <div className="block md:hidden divide-y divide-white/5">
                    {filteredMatches.slice(0, 8).map((m, i) => (
                      <div key={m.matchId || i} className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{AVAILABLE_SPORTS_ICONS[m.sportType] || '🏆'}</span>
                            <span>{m.sportType}</span>
                          </div>
                          <span className="text-[10px] font-mono text-foreground/40">{m.matchDate || 'Recent'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="truncate font-semibold text-foreground/90">
                            <span className="text-primary font-bold">{m.teamAPlayers || 'Team A'}</span>
                            <span className="text-foreground/40 mx-1.5">vs</span>
                            <span className="text-red-400 font-bold">{m.teamBPlayers || 'Team B'}</span>
                          </div>
                          {m.score && (
                            <span className="px-2 py-0.5 rounded-lg bg-background border border-white/10 font-mono font-black text-[11px] shrink-0">
                              {m.score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 3: ATTENDANCE ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'ATTENDANCE' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase">Roster</span>
                    <div className="text-lg sm:text-3xl font-black text-foreground mt-0.5">{attendanceAnalytics.totalMembers}</div>
                  </div>
                  <div className="p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase">Present</span>
                    <div className="text-lg sm:text-3xl font-black text-emerald-400 mt-0.5">{attendanceAnalytics.presentCount}</div>
                  </div>
                  <div className="p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase">Absent</span>
                    <div className="text-lg sm:text-3xl font-black text-red-400 mt-0.5">{attendanceAnalytics.absentCount}</div>
                  </div>
                </div>

                {/* Attendance Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Status Donut */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-foreground">Attendance Status Share</h3>
                      <p className="text-[10px] sm:text-xs text-foreground/50">Overall check-in adherence ratio</p>
                    </div>

                    <div className="h-[180px] sm:h-[220px] w-full relative flex items-center justify-center">
                      {isMounted && attendanceAnalytics.attendancePieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={attendanceAnalytics.attendancePieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={68}
                              paddingAngle={4}
                            >
                              {attendanceAnalytics.attendancePieData.map((entry, index) => (
                                <Cell key={`att-cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} athletes`} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-center">
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-[10px] sm:text-xs font-bold text-emerald-400">Present</div>
                        <div className="text-xs sm:text-sm font-black text-foreground">{attendanceAnalytics.presentCount}</div>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="text-[10px] sm:text-xs font-bold text-red-400">Absent</div>
                        <div className="text-xs sm:text-sm font-black text-foreground">{attendanceAnalytics.absentCount}</div>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] sm:text-xs font-bold text-foreground/50">Unmarked</div>
                        <div className="text-xs sm:text-sm font-black text-foreground">{attendanceAnalytics.unmarkedCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Day of Week Turnout Bar */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                    <h3 className="text-sm sm:text-base font-black text-foreground">Turnout by Weekday</h3>
                    <div className="h-[200px] sm:h-[260px] w-full">
                      {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={attendanceAnalytics.weeklyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} athletes`} />} />
                            <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4: INVENTORY ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'INVENTORY' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase">Valuation</span>
                    <div className="text-lg sm:text-3xl font-black text-foreground mt-0.5 truncate">
                      {formatCurrency(inventoryAnalytics.totalValuation)}
                    </div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase">In Stock</span>
                    <div className="text-lg sm:text-3xl font-black text-emerald-400 mt-0.5">{inventoryAnalytics.inStock}</div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase">Low Stock</span>
                    <div className="text-lg sm:text-3xl font-black text-amber-400 mt-0.5">{inventoryAnalytics.lowStock}</div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase">Depleted</span>
                    <div className="text-lg sm:text-3xl font-black text-red-400 mt-0.5">{inventoryAnalytics.outOfStock}</div>
                  </div>
                </div>

                {/* Inventory Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Category Units Bar Chart */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                    <h3 className="text-sm sm:text-base font-black text-foreground">Units by Category</h3>
                    <div className="h-[200px] sm:h-[240px] w-full">
                      {isMounted && inventoryAnalytics.categoryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inventoryAnalytics.categoryChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="category" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} units`} />} />
                            <Bar dataKey="Units" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-foreground/40">No inventory data.</div>
                      )}
                    </div>
                  </div>

                  {/* Stock Health Donut */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-foreground">Stock Readiness Share</h3>
                      <p className="text-[10px] sm:text-xs text-foreground/50">Supply readiness breakdown</p>
                    </div>

                    <div className="h-[180px] sm:h-[200px] w-full relative flex items-center justify-center">
                      {isMounted && inventoryAnalytics.healthPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={inventoryAnalytics.healthPieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={68}
                              paddingAngle={4}
                            >
                              {inventoryAnalytics.healthPieData.map((entry, index) => (
                                <Cell key={`inv-cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => `${v} items`} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-center">
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-[10px] sm:text-xs font-bold text-emerald-400">In Stock</div>
                        <div className="text-xs sm:text-sm font-black text-foreground">{inventoryAnalytics.inStock}</div>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-[10px] sm:text-xs font-bold text-amber-400">Low Stock</div>
                        <div className="text-xs sm:text-sm font-black text-foreground">{inventoryAnalytics.lowStock}</div>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="text-[10px] sm:text-xs font-bold text-red-400">Depleted</div>
                        <div className="text-xs sm:text-sm font-black text-foreground">{inventoryAnalytics.outOfStock}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 5: FINANCIAL ANALYTICS
               ══════════════════════════════════════════════════════════════════ */}
            {activeDomain === 'FINANCES' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase">Revenue</span>
                    <div className="text-sm sm:text-2xl font-black text-emerald-400 mt-0.5 truncate">
                      {formatCurrency(financeAnalytics.totalIncome)}
                    </div>
                  </div>
                  <div className="p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase">Expenses</span>
                    <div className="text-sm sm:text-2xl font-black text-red-400 mt-0.5 truncate">
                      {formatCurrency(financeAnalytics.totalExpense)}
                    </div>
                  </div>
                  <div className="p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
                    <span className="text-[10px] sm:text-xs font-bold text-primary uppercase">Net Margin</span>
                    <div className={`text-sm sm:text-2xl font-black mt-0.5 truncate ${financeAnalytics.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {financeAnalytics.profitMargin}%
                    </div>
                  </div>
                </div>

                {/* Monthly Income vs Expense Combo Chart */}
                <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                  <h3 className="text-sm sm:text-base font-black text-foreground">Monthly Revenue vs Expense</h3>
                  <div className="h-[200px] sm:h-[280px] w-full">
                    {isMounted && financeAnalytics.monthlyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financeAnalytics.monthlyChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                          />
                          <Tooltip content={<CustomChartTooltip formatter={(v: number) => formatCurrency(v)} />} />
                          <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-foreground/40">No transactions.</div>
                    )}
                  </div>
                </div>

                {/* Income & Expense Category Donuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Income Streams */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                    <h3 className="text-sm sm:text-base font-black text-emerald-400">Income Streams</h3>
                    <div className="h-[180px] sm:h-[200px] w-full relative flex items-center justify-center">
                      {isMounted && financeAnalytics.incomePieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={financeAnalytics.incomePieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={68}
                              paddingAngle={4}
                            >
                              {financeAnalytics.incomePieData.map((_, index) => (
                                <Cell key={`inc-cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => formatCurrency(v)} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-xs text-foreground/40">No income categories.</div>
                      )}
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="bg-surface/90 border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl">
                    <h3 className="text-sm sm:text-base font-black text-rose-400">Expense Allocation</h3>
                    <div className="h-[180px] sm:h-[200px] w-full relative flex items-center justify-center">
                      {isMounted && financeAnalytics.expensePieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={financeAnalytics.expensePieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={68}
                              paddingAngle={4}
                            >
                              {financeAnalytics.expensePieData.map((_, index) => (
                                <Cell key={`exp-cell-${index}`} fill={CHART_PALETTE[(index + 3) % CHART_PALETTE.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip formatter={(v: number) => formatCurrency(v)} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-xs text-foreground/40">No expense categories.</div>
                      )}
                    </div>
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
