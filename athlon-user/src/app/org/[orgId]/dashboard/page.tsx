'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Trophy,
  Users,
  CreditCard,
  Activity,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building,
  MapPin,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Package,
  BarChart2,
  Video,
  Play,
  Radio,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  UserCheck,
  Building2,
  Newspaper,
  AlertTriangle,
  Edit3,
  Trash2,
  IndianRupee,
  X,
  Crown,
  Medal,
  Flame,
  Star,
  Award,
  CalendarDays,
  Boxes,
  Tag,
} from 'lucide-react';

import HomeRoleHeader from '@/components/home/HomeRoleHeader';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';
import { Athlon3DIcon, Athlon3DIconProps } from '@/components/common/Athlon3DIcon';
import { ClubFinanceService, FinanceSummary } from '@/lib/api/clubFinance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { ClubInventoryService, InventorySummary, ClubInventoryItem, AdjustStockPayload } from '@/lib/api/clubInventory';
import { OrganizerInventoryService, OrganizerInventorySummary } from '@/lib/api/organizerInventory';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { ClubMatchService, ClubMatch } from '@/lib/api/clubMatch';
import { UserService } from '@/lib/api/user';
import { useOrgRole } from '@/hooks/use-org-role';
import { usePermissions } from '@/hooks/use-permissions';
import { CoachService, CoachDashboardSummary, CoachSchedule, CoachTrainee } from '@/lib/api/coach';
import { VenueService, FacilityService, BookingService, VenueDto, FacilityDto, BookingDto } from '@/lib/api/venue';

function getOrg3DIconType(name: string): Athlon3DIconProps['type'] {
  const n = name.toLowerCase();
  if (n.includes('tournament') || n.includes('event') || n.includes('cup') || n.includes('league')) return 'tournaments';
  if (n.includes('stream') || n.includes('broadcast') || n.includes('livestream') || (n.includes('live') && !n.includes('calendar') && !n.includes('score') && !n.includes('grid'))) return 'livestream';
  if (n.includes('post') || n.includes('blog') || n.includes('gallery') || n.includes('feed') || n.includes('media') || n.includes('article')) return 'posts';
  if (n.includes('admission') || n.includes('intake') || n.includes('enroll')) return 'registered';
  if (n.includes('trainee') || n.includes('student') || n.includes('pupil') || n.includes('client') || n.includes('athlete')) return 'students';
  if (n.includes('calendar') || n.includes('session') || n.includes('schedule') || n.includes('slot') || n.includes('timetable')) return 'schedule';
  if (n.includes('booking') || n.includes('reservation')) return 'bookings';
  if (n.includes('batch') || n.includes('group') || n.includes('squad') || n.includes('package') || n.includes('recurring') || n.includes('series')) return 'batches';
  if (n.includes('coach') || n.includes('trainer') || n.includes('instructor')) return 'coaches';
  if (n.includes('member') || n.includes('staff') || n.includes('team')) return 'members';
  if (n.includes('attendance') || n.includes('check-in') || n.includes('roll')) return 'attendance';
  if (n.includes('performance') || n.includes('telemetry') || n.includes('analytic') || n.includes('report') || n.includes('occupancy') || n.includes('stat') || n.includes('metric')) return 'performance';
  if (n.includes('match') || n.includes('fixture') || n.includes('sparring')) return 'matches';
  if (n.includes('block') || n.includes('maint') || n.includes('hold')) return 'blocks';
  if (n.includes('setup') || n.includes('console') || n.includes('officiat')) return 'setup';
  if (n.includes('umpire') || n.includes('referee')) return 'umpire';
  if (n.includes('leaderboard') || n.includes('rank') || n.includes('standing') || n.includes('result')) return 'rankings';
  if (n.includes('inventory') || n.includes('equipment') || n.includes('shuttle') || n.includes('gear')) return 'inventory';
  if (n.includes('pricing') || n.includes('rate') || n.includes('tariff') || n.includes('price')) return 'pricing';
  if (n.includes('finance') || n.includes('fee') || n.includes('billing') || n.includes('payout') || n.includes('revenue') || n.includes('card') || n.includes('ledger')) return 'finances';
  if (n.includes('centre') || n.includes('campus') || n.includes('branch')) return 'facilities';
  if (n.includes('facility') || n.includes('infrastructure') || n.includes('district') || n.includes('court') || n.includes('arena') || n.includes('map')) return 'facilities';
  if (n.includes('profile') || n.includes('venue profile')) return 'profile';
  if (n.includes('setting') || n.includes('config') || n.includes('preference')) return 'settings';
  if (n.includes('registration') || n.includes('register') || n.includes('approv') || n.includes('entry') || n.includes('pass')) return 'registered';
  if (n.includes('academ') || n.includes('club')) return 'academies';
  return 'home';
}

import { AcademyService, AcademyDashboardSummary } from '@/lib/api/academy';
import { AcademyStudentService } from '@/lib/api/academyStudent';
import { AcademyStaffService } from '@/lib/api/academyStaff';

const INVENTORY_CATEGORY_DATA: Record<string, { label: string; icon: string; bg: string }> = {
  SHUTTLES: { label: 'Shuttles & Tubes', icon: '🏸', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  BALLS: { label: 'Balls', icon: '⚽', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  RACQUETS: { label: 'Racquets & Paddles', icon: '🎾', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  APPAREL: { label: 'Bibs & Apparel', icon: '🎽', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  MEDICAL: { label: 'First Aid & Medical', icon: '⚕️', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  TRAINING_GEAR: { label: 'Training Cones & Ladders', icon: '🔺', bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  NETS_POSTS: { label: 'Nets & Court Hardware', icon: '🥅', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  OTHER: { label: 'Other Supplies', icon: '📦', bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

function ClubInventoryAlertCard({
  item,
  orgId,
}: {
  item: any;
  orgId: string;
}) {
  const catObj = INVENTORY_CATEGORY_DATA[item.category] || {
    label: item.category || 'Supplies',
    icon: '🏸',
    bg: 'bg-primary/10 text-primary border-primary/20',
  };

  const isOutOfStock = item.status === 'OUT_OF_STOCK' || item.quantity <= 0;
  const isLowStock = (item.status === 'LOW_STOCK' || item.quantity <= (item.minThreshold || 2)) && !isOutOfStock;
  const safeMax = Math.max((item.minThreshold || 2) * 2.5, 10);
  const fillPct = Math.min(100, Math.max(isOutOfStock ? 0 : 8, (item.quantity / safeMax) * 100));

  return (
    <Link
      href={`/org/${orgId}/inventory`}
      className="group relative block p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: isOutOfStock
          ? 'rgba(239, 68, 68, 0.4)'
          : 'var(--athlon-border)',
      }}
    >
      {/* Top Ambient Highlight Gradient */}
      <div
        className={`h-1 w-full absolute top-0 left-0 right-0 ${isOutOfStock
          ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500'
          : 'bg-gradient-to-r from-primary/60 via-primary to-primary/40'
          }`}
      />

      {/* Ambient Radial Aura */}
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 opacity-30 group-hover:opacity-70 ${isOutOfStock ? 'bg-rose-500/20' : 'bg-primary/25'
          }`}
      />

      {/* Main Content Layout */}
      <div className="relative z-10 space-y-3.5">
        {/* Top Header: Category Icon, Name, Category & Location, Urgency Pill */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Category Icon Box */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              {catObj.icon}
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="font-black text-sm sm:text-base text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-tight">
                {item.itemName}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-foreground/60 px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10">
                  {catObj.label}
                </span>
                {item.location && (
                  <span className="text-[9.5px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate max-w-[85px]">{item.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Urgency Status Pill */}
          <div
            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm shrink-0 ${isOutOfStock
              ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
              : 'bg-primary/15 text-primary border-primary/30'
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500 animate-ping' : 'bg-primary animate-pulse'
                }`}
            />
            <span>{isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK'}</span>
          </div>
        </div>

        {/* Telemetry Gauge Box */}
        <div
          className="p-3 sm:p-3.5 rounded-xl border space-y-2.5"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-foreground/50">
              Available Stock:
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span
                className={`text-2xl font-black tracking-tight ${isOutOfStock ? 'text-rose-500' : 'text-primary'
                  }`}
              >
                {item.quantity}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground/50">
                {item.unit || 'Pieces'}
              </span>
            </div>
          </div>

          {/* Slim Gauge Bar */}
          <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOutOfStock
                ? 'bg-rose-500 w-0'
                : 'bg-gradient-to-r from-primary/50 via-primary to-primary shadow-[0_0_8px_var(--athlon-primary-glow)]'
                }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-foreground/60 font-bold pt-0.5">
            <span className="flex items-center gap-1 text-primary">
              <AlertTriangle className="w-3 h-3 shrink-0 text-primary" />
              <span>Threshold: ≤ {item.minThreshold} {item.unit || 'Pieces'}</span>
            </span>
            {item.unitCost != null && (
              <span className="text-foreground/70">
                ₹{Number(item.unitCost).toLocaleString('en-IN')} / {item.unit || 'Piece'}
              </span>
            )}
          </div>
        </div>

        {/* Footer Action Prompt */}
        <div className="flex items-center justify-between text-xs font-black text-primary group-hover:text-primary/90 pt-0.5">
          <span className="flex items-center gap-1 uppercase tracking-wider text-[10.5px]">
            <span>Restock in Inventory</span>
          </span>
          <div className="w-6 h-6 rounded-full bg-primary/15 group-hover:bg-primary group-hover:text-black text-primary flex items-center justify-center transition-all duration-300 shadow-sm group-hover:translate-x-1">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ClubLeaderboardPodiumCard({
  topThree,
  orgId,
  loading,
}: {
  topThree: {
    memberUuid: string;
    fullName: string;
    photo?: string;
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    points: number;
  }[];
  orgId: string;
  loading?: boolean;
}) {
  return (
    <div
      className="p-4 sm:p-5 rounded-[24px] border shadow-lg space-y-4 relative overflow-hidden transition-all duration-300 hover:shadow-2xl group"
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* Top Accent Gradient Line with Theme Colors */}
      <div className="h-1 w-full absolute top-0 left-0 right-0 bg-gradient-to-r from-primary/40 via-primary to-primary/40 shadow-sm" />

      {/* Ambient Championship Backdrop Glow with Selected Theme Color */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/15 dark:bg-primary/25 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/35 transition-all" />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">
                All-Time Top 3
              </h3>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25">
                Podium
              </span>
            </div>

          </div>
        </div>

        <Link
          href={`/org/${orgId}/leaderboard`}
          className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary hover:text-black border border-primary/25 text-[10px] font-black uppercase tracking-wider text-primary transition-all flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
        >
          <span>Full Ladder</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Podium Display Arena */}
      {loading ? (
        <div className="h-32 bg-surface/50 rounded-2xl border border-foreground/5 animate-pulse" />
      ) : topThree.length === 0 ? (
        <div className="py-8 text-center space-y-2.5 border border-dashed rounded-2xl" style={{ borderColor: 'var(--athlon-border)' }}>
          <Medal className="w-8 h-8 text-primary/40 mx-auto" />
          <p className="text-xs font-bold text-foreground/70">No recorded club matches yet</p>
          <Link href={`/org/${orgId}/matches`} className="text-[11px] font-bold text-primary hover:underline inline-block">
            Record First Match &rarr;
          </Link>
        </div>
      ) : (
        <div className="relative z-10 pt-5 pb-1">
          {/* Stepped 3-Column Podium Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
            {/* 🥈 2nd Place (Silver) */}
            {topThree[1] ? (
              <Link
                href={`/org/${orgId}/leaderboard`}
                className="flex flex-col items-center group/card transition-all duration-300 hover:-translate-y-1"
              >
                {/* Silver Avatar & Silver Crown */}
                <div className="relative mb-2 flex flex-col items-center">
                  <Crown
                    className="w-4 h-4 text-slate-400 fill-slate-300 absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_8px_rgba(203,213,225,0.7)]"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.25)] flex items-center justify-center overflow-hidden group-hover/card:scale-105 transition-transform">
                    {topThree[1].photo ? (
                      <img
                        src={UserService.getPhotoUrl(topThree[1].photo)}
                        alt={topThree[1].fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-400">
                        {topThree[1].fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-white/40 leading-none">
                    2ND
                  </span>
                </div>

                {/* Silver Pedestal Box */}
                <div className="w-full pt-3.5 pb-2.5 px-2 rounded-2xl bg-gradient-to-b from-slate-400/10 via-surface/60 to-surface border border-slate-400/25 flex flex-col items-center text-center space-y-0.5 group-hover/card:border-primary/50 shadow-sm transition-colors">
                  <span className="text-[11px] font-black text-foreground truncate w-full group-hover/card:text-primary transition-colors">
                    {topThree[1].fullName}
                  </span>
                  <div className="font-mono text-xs font-black text-slate-400 group-hover/card:text-primary/90 flex items-baseline gap-0.5 transition-colors">
                    <span>{topThree[1].points}</span>
                    <span className="text-[8px] font-bold uppercase text-foreground/40">pts</span>
                  </div>
                  {topThree[1].matchesPlayed > 0 && (
                    <span className="text-[8.5px] font-bold text-foreground/40 font-mono">
                      {topThree[1].wins}W • {topThree[1].winRate}%
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="h-28 rounded-2xl border border-dashed border-foreground/10 flex flex-col items-center justify-center text-[10px] text-foreground/30 font-bold p-2 text-center">
                <span>🥈 2nd Place</span>
              </div>
            )}

            {/* 🥇 1st Place (Gold Champion - Center Elevated) */}
            {topThree[0] ? (
              <Link
                href={`/org/${orgId}/leaderboard`}
                className="flex flex-col items-center group/card transition-all duration-300 hover:-translate-y-1.5 -translate-y-1.5"
              >
                {/* Gold Crown & Avatar */}
                <div className="relative mb-2.5 flex flex-col items-center">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400 absolute -top-4.5 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface border-2 border-amber-400 flex items-center justify-center overflow-hidden group-hover/card:scale-105 transition-transform"
                    style={{
                      boxShadow: '0 0 20px rgba(251,191,36,0.35)',
                    }}
                  >
                    {topThree[0].photo ? (
                      <img
                        src={UserService.getPhotoUrl(topThree[0].photo)}
                        alt={topThree[0].fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-black text-amber-400">
                        {topThree[0].fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-amber-200/50 leading-none">
                    1ST
                  </span>
                </div>

                {/* Champion Pedestal Box */}
                <div className="w-full pt-4 pb-3 px-2 rounded-2xl bg-gradient-to-b from-primary/20 via-primary/10 to-surface border border-primary/40 flex flex-col items-center text-center space-y-0.5 group-hover/card:border-primary shadow-md transition-all">
                  <span className="text-xs font-black text-foreground truncate w-full group-hover/card:text-primary transition-colors">
                    {topThree[0].fullName}
                  </span>
                  <div className="font-mono text-sm font-black text-primary flex items-baseline gap-0.5">
                    <span>{topThree[0].points}</span>
                    <span className="text-[9px] font-bold uppercase text-primary/70">pts</span>
                  </div>
                  {topThree[0].matchesPlayed > 0 && (
                    <span className="text-[9px] font-extrabold text-primary font-mono">
                      {topThree[0].wins}W • {topThree[0].winRate}% Win
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="h-32 rounded-2xl border border-dashed border-foreground/10 flex flex-col items-center justify-center text-[10px] text-foreground/30 font-bold p-2 text-center">
                <span>🥇 Champion</span>
              </div>
            )}

            {/* 🥉 3rd Place (Bronze) */}
            {topThree[2] ? (
              <Link
                href={`/org/${orgId}/leaderboard`}
                className="flex flex-col items-center group/card transition-all duration-300 hover:-translate-y-1"
              >
                {/* Bronze Avatar & Bronze Crown */}
                <div className="relative mb-2 flex flex-col items-center">
                  <Crown
                    className="w-4 h-4 text-amber-700 fill-amber-700 absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_8px_rgba(180,83,9,0.7)]"
                    style={{ animationDelay: '0.3s' }}
                  />
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface border-2 border-amber-700/80 shadow-[0_0_15px_rgba(180,83,9,0.25)] flex items-center justify-center overflow-hidden group-hover/card:scale-105 transition-transform">
                    {topThree[2].photo ? (
                      <img
                        src={UserService.getPhotoUrl(topThree[2].photo)}
                        alt={topThree[2].fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-black text-amber-700">
                        {topThree[2].fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 bg-gradient-to-r from-amber-600 to-amber-800 text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-amber-500/40 leading-none">
                    3RD
                  </span>
                </div>

                {/* Bronze Pedestal Box */}
                <div className="w-full pt-3.5 pb-2.5 px-2 rounded-2xl bg-gradient-to-b from-amber-700/10 via-surface/60 to-surface border border-amber-700/25 flex flex-col items-center text-center space-y-0.5 group-hover/card:border-primary/50 shadow-sm transition-colors">
                  <span className="text-[11px] font-black text-foreground truncate w-full group-hover/card:text-primary transition-colors">
                    {topThree[2].fullName}
                  </span>
                  <div className="font-mono text-xs font-black text-amber-700 dark:text-amber-500 group-hover/card:text-primary/90 flex items-baseline gap-0.5 transition-colors">
                    <span>{topThree[2].points}</span>
                    <span className="text-[8px] font-bold uppercase text-foreground/40">pts</span>
                  </div>
                  {topThree[2].matchesPlayed > 0 && (
                    <span className="text-[8.5px] font-bold text-foreground/40 font-mono">
                      {topThree[2].wins}W • {topThree[2].winRate}%
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="h-28 rounded-2xl border border-dashed border-foreground/10 flex flex-col items-center justify-center text-[10px] text-foreground/30 font-bold p-2 text-center">
                <span>🥉 3rd Place</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CoachScheduleCard({
  session,
  orgId,
  onCheckIn,
}: {
  session: CoachSchedule;
  orgId: string;
  onCheckIn?: (sessionUuid: string) => void;
}) {
  const isDone = session.isCheckedIn || session.status === 'COMPLETED';

  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between group"
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/30 absolute top-0 left-0 right-0" />
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            <Clock className="w-2.5 h-2.5" />
            <span>{session.timeSlot}</span>
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isDone
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-primary/15 text-primary border-primary/30'
            }`}
          >
            {isDone ? '✓ Checked In' : session.status}
          </span>
        </div>

        <div>
          <h4 className="font-black text-sm text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
            {session.focusArea || session.packageName || 'Training Drill & Sparring'}
          </h4>
          <p className="text-[11px] font-semibold text-foreground/60 flex items-center gap-1.5 mt-0.5">
            <UserCheck className="w-3 h-3 text-primary" />
            <span>{session.traineeName}</span>
          </p>
        </div>

        <div
          className="p-2.5 rounded-xl bg-surface border flex items-center justify-between text-[10px] font-bold text-foreground/70"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="truncate max-w-[140px]">{session.venue || session.court || 'Main Court'}</span>
          </span>
          <span className="text-primary font-bold">
            {isDone ? 'In Progress' : 'Scheduled'}
          </span>
        </div>
      </div>

      <div
        className="pt-3 mt-1 border-t flex items-center justify-between text-xs font-black text-primary"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {!isDone ? (
          <button
            onClick={() => onCheckIn?.(session.sessionUuid)}
            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-black transition-all flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Check In</span>
          </button>
        ) : (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live Session
          </span>
        )}
        <Link href={`/org/${orgId}/batches`} className="text-[10px] text-foreground/40 hover:text-primary transition-colors font-semibold uppercase">
          Details &rarr;
        </Link>
      </div>
    </div>
  );
}

function CoachTraineeCard({
  trainee,
  orgId,
}: {
  trainee: CoachTrainee;
  orgId: string;
}) {
  const isActive = trainee.status === 'ACTIVE';

  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between group"
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center font-black text-sm text-primary shadow-sm">
              {trainee.fullName ? trainee.fullName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h4 className="font-black text-sm text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                {trainee.fullName}
              </h4>
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                {trainee.skillLevel || 'Beginner'}
              </span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            {isActive ? '● Active' : `● ${trainee.status}`}
          </span>
        </div>

        <div
          className="p-2.5 rounded-xl bg-surface border space-y-1"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-foreground/50 font-semibold">Plan / Tier:</span>
            <span className="font-bold text-foreground truncate max-w-[150px]">{trainee.packageName || 'Personal Coaching'}</span>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-foreground/50 font-semibold">Attendance:</span>
            <span className="font-mono font-bold text-primary">{trainee.attendanceRate ?? 100}%</span>
          </div>
        </div>
      </div>

      <div
        className="pt-3 mt-1 border-t flex items-center justify-between text-xs font-black text-primary"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <Link href={`/org/${orgId}/students`} className="hover:underline flex items-center gap-1">
          <span>Student Profile</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
        <span className="text-[10px] text-foreground/40 font-semibold">
          {trainee.enrollmentDate ? `Enrolled ${trainee.enrollmentDate}` : 'Enrolled'}
        </span>
      </div>
    </div>
  );
}

function CoachCredentialsCard({
  coachProfile,
  orgId,
}: {
  coachProfile: {
    experienceYears: number;
    certifications: string[];
    specializations: string[];
    playingAchievements: string;
    sport: string;
  };
  orgId: string;
}) {
  return (
    <div
      className="p-5 sm:p-6 rounded-[28px] border relative overflow-hidden space-y-4 shadow-xl group"
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/30 absolute top-0 left-0 right-0" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 flex items-center justify-center text-xl text-primary shrink-0 shadow-inner">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-foreground tracking-tight">
                Coach Credentials & Experience
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                {coachProfile.sport}
              </span>
            </div>
            <p className="text-xs text-foreground/50 font-medium mt-0.5">
              Federated coaching qualifications, technical focus, and sports pedigree
            </p>
          </div>
        </div>

        <Link
          href={`/org/${orgId}/settings?tab=profile`}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-center self-start sm:self-auto shrink-0"
        >
          Edit Credentials
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Experience Metric */}
        <div
          className="p-3.5 rounded-2xl bg-surface border space-y-1"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">
            Coaching Tenure
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-primary font-mono">{coachProfile.experienceYears}+</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground/70">Years Active</span>
          </div>
        </div>

        {/* Certifications Metric */}
        <div
          className="p-3.5 rounded-2xl bg-surface border space-y-1.5 md:col-span-2"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">
            Certifications & Licenses
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {coachProfile.certifications.map((c) => (
              <span
                key={c}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary border border-primary/30"
              >
                🏅 {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Specializations & Highlights */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">
          Core Specializations & Tactics
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {coachProfile.specializations.map((s) => (
            <span
              key={s}
              className="text-[10.5px] font-semibold px-2.5 py-1 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground/80"
            >
              🎯 {s}
            </span>
          ))}
        </div>
      </div>

      {coachProfile.playingAchievements && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-foreground/80 italic">
          &ldquo;{coachProfile.playingAchievements}&rdquo;
        </div>
      )}
    </div>
  );
}



export default function OrganizationDashboard() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { role, isAdmin, isCoach, isMember, canManage } = useOrgRole(org?.id);
  const { canAccessModule } = usePermissions(org?.id);

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [coachesCount, setCoachesCount] = useState<number>(0);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [organizerInventorySummary, setOrganizerInventorySummary] = useState<OrganizerInventorySummary | null>(null);
  const [inventoryItems, setInventoryItems] = useState<ClubInventoryItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [clubMatches, setClubMatches] = useState<ClubMatch[]>([]);
  const [academyDashboard, setAcademyDashboard] = useState<AcademyDashboardSummary | null>(null);
  const [coachDashboard, setCoachDashboard] = useState<CoachDashboardSummary | null>(null);
  const [coachSchedules, setCoachSchedules] = useState<CoachSchedule[]>([]);
  const [coachTrainees, setCoachTrainees] = useState<CoachTrainee[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('ALL');
  const [selectedSportFilter, setSelectedSportFilter] = useState('ALL');

  const [coachProfile, setCoachProfile] = useState<{
    experienceYears: number;
    certifications: string[];
    specializations: string[];
    playingAchievements: string;
    sport: string;
  }>({
    experienceYears: 6,
    certifications: ['BWF Level 1 Coach', 'NIS Certified'],
    specializations: ['Singles Tactics', 'Footwork & Agility'],
    playingAchievements: 'State Championship Medalist',
    sport: 'Badminton',
  });

  const [venueData, setVenueData] = useState<VenueDto | null>(null);
  const [venueFacilities, setVenueFacilities] = useState<FacilityDto[]>([]);
  const [venueBookings, setVenueBookings] = useState<BookingDto[]>([]);
  const [venueTotalRevenue, setVenueTotalRevenue] = useState<number>(0);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCheckInSession = async (sessionUuid: string) => {
    try {
      const res = await CoachService.checkInSchedule(sessionUuid);
      const updatedSchedule = (res as any)?.data || res;
      if (updatedSchedule) {
        setCoachSchedules((prev) =>
          prev.map((s) => (s.sessionUuid === sessionUuid ? (updatedSchedule as CoachSchedule) : s))
        );
        setToastMessage('Session checked in successfully!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to check in session:', err);
    }
  };
  const [selectedItemForUsage, setSelectedItemForUsage] = useState<ClubInventoryItem | null>(null);
  const [usageAmount, setUsageAmount] = useState('1');
  const [usageMemberUuid, setUsageMemberUuid] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [isUsageSubmitting, setIsUsageSubmitting] = useState(false);

  const toolsTrackRef = useRef<HTMLDivElement>(null);
  const eventsTrackRef = useRef<HTMLDivElement>(null);
  const liveTrackRef = useRef<HTMLDivElement>(null);
  const sessionsTrackRef = useRef<HTMLDivElement>(null);
  const inventoryTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (org?.id) {
      setLoadingMetrics(true);

      if (org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER') {
        VenueService.getVenuesByOrganization(org.id)
          .then(async (vRes: any) => {
            const vList = (vRes as any)?.data || vRes;
            const v = Array.isArray(vList) ? vList[0] : vList;
            if (v && (v.venueId || v.venueUuid)) {
              setVenueData(v);
              const [facRes, bookRes] = await Promise.allSettled([
                FacilityService.getFacilitiesByVenue(v.venueId),
                BookingService.getBookingsByVenue(v.venueId),
              ]);
              if (facRes.status === 'fulfilled') {
                const flist = (facRes.value as any)?.data || facRes.value;
                if (Array.isArray(flist)) setVenueFacilities(flist);
              }
              if (bookRes.status === 'fulfilled') {
                const blist = (bookRes.value as any)?.data || bookRes.value;
                if (Array.isArray(blist)) {
                  setVenueBookings(blist);
                  const rev = blist.reduce((acc: number, b: BookingDto) => {
                    if (b.paymentStatus === 'PAID' || b.paymentStatus === 'PARTIALLY_PAID') {
                      return acc + (Number(b.totalAmount) || 0);
                    }
                    return acc;
                  }, 0);
                  setVenueTotalRevenue(rev);
                }
              }
            }
          })
          .catch(() => {});
      }

      Promise.allSettled([
        ClubFinanceService.getSummary(org.id),
        OrganizationService.getMembers(org.id),
        ClubInventoryService.getSummary(org.id),
        ClubInventoryService.getItems(org.id).catch(() => []),
        TournamentService.getByOrg(org.id),
        org.type === 'ACADEMY' ? AcademyService.getDashboard(org.id) : Promise.resolve(null),
        org.type === 'ACADEMY' ? AcademyStudentService.getStudents(org.id).catch(() => []) : Promise.resolve([]),
        org.type === 'ACADEMY' ? AcademyStaffService.getCoaches(org.id).catch(() => []) : Promise.resolve([]),
        org.type === 'CLUB' ? ClubMatchService.getMatchesByOrg(org.id).catch(() => []) : Promise.resolve([]),
        org.type === 'COACH' ? CoachService.getDashboardSummary(org.id).catch(() => null) : Promise.resolve(null),
        org.type === 'COACH' ? CoachService.getSchedules(org.id).catch(() => []) : Promise.resolve([]),
        org.type === 'COACH' ? CoachService.getTrainees(org.id).catch(() => []) : Promise.resolve([]),
        OrganizationService.getProfileByOrgUuid(org.id).catch(() => null),
        (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION') ? OrganizerInventoryService.getSummary(org.id).catch(() => null) : Promise.resolve(null),
      ]).then(([finRes, memRes, invRes, itemsRes, tournRes, acadRes, studRes, coachRes, matchesRes, coachDashRes, coachSchedRes, coachTrainRes, profRes, orgInvRes]) => {
        if (finRes.status === 'fulfilled') {
          const sum = (finRes.value as any)?.data || finRes.value;
          setFinanceSummary(sum);
        }
        if (memRes.status === 'fulfilled') {
          const memList = Array.isArray(memRes.value) ? memRes.value : ((memRes.value as any)?.data || []);
          setMembers(memList);
        }
        if (invRes.status === 'fulfilled') {
          const invSum = (invRes.value as any)?.data || invRes.value;
          setInventorySummary(invSum);
        }
        if (itemsRes.status === 'fulfilled') {
          const list = Array.isArray(itemsRes.value) ? itemsRes.value : ((itemsRes.value as any)?.data || []);
          setInventoryItems(list);
        }
        if (tournRes.status === 'fulfilled') {
          const tList = Array.isArray(tournRes.value) ? tournRes.value : ((tournRes.value as any)?.data || []);
          setTournaments(tList);
        }
        if (acadRes.status === 'fulfilled' && acadRes.value) {
          setAcademyDashboard(acadRes.value as AcademyDashboardSummary);
        }
        if (studRes.status === 'fulfilled') {
          const sList = Array.isArray(studRes.value) ? studRes.value : ((studRes.value as any)?.data || []);
          setStudentsCount(sList.length);
        }
        if (coachRes.status === 'fulfilled') {
          const cList = Array.isArray(coachRes.value) ? coachRes.value : ((coachRes.value as any)?.data || []);
          setCoachesCount(cList.length);
        }
        if (matchesRes.status === 'fulfilled') {
          const mList = Array.isArray(matchesRes.value) ? matchesRes.value : ((matchesRes.value as any)?.data || []);
          setClubMatches(mList);
        }
        if (coachDashRes && coachDashRes.status === 'fulfilled' && coachDashRes.value) {
          const cDash = (coachDashRes.value as any)?.data || coachDashRes.value;
          setCoachDashboard(cDash as CoachDashboardSummary);
        }
        if (coachSchedRes && coachSchedRes.status === 'fulfilled') {
          const sList = Array.isArray(coachSchedRes.value) ? coachSchedRes.value : ((coachSchedRes.value as any)?.data || []);
          setCoachSchedules(sList);
        }
        if (coachTrainRes && coachTrainRes.status === 'fulfilled') {
          const tList = Array.isArray(coachTrainRes.value) ? coachTrainRes.value : ((coachTrainRes.value as any)?.data || []);
          setCoachTrainees(tList);
        }
        if (profRes && profRes.status === 'fulfilled' && profRes.value) {
          const p = (profRes.value as any)?.data || profRes.value;
          let exp = 6;
          let certs = ['BWF Level 1 Coach', 'NIS Certified'];
          let specs = ['Singles Tactics', 'Footwork & Agility'];
          let achieve = 'State Championship Medalist';
          if (p.amenities) {
            try {
              const parsed = JSON.parse(p.amenities);
              if (parsed && typeof parsed === 'object') {
                if (parsed.experienceYears !== undefined) exp = parsed.experienceYears;
                if (Array.isArray(parsed.certifications)) certs = parsed.certifications;
                if (Array.isArray(parsed.specializations)) specs = parsed.specializations;
                if (parsed.playingAchievements) achieve = parsed.playingAchievements;
              }
            } catch {
              // Ignore
            }
          }
          setCoachProfile({
            experienceYears: exp,
            certifications: certs,
            specializations: specs,
            playingAchievements: achieve,
            sport: p.sportsOffered || 'Badminton',
          });
        }
        if (orgInvRes && orgInvRes.status === 'fulfilled' && orgInvRes.value) {
          const orgInvSum = (orgInvRes.value as any)?.data || orgInvRes.value;
          setOrganizerInventorySummary(orgInvSum as OrganizerInventorySummary);
        }
        setLoadingMetrics(false);
      });
    }
  }, [org?.id, org?.type]);

  // Compute live all-time leaderboard standings
  const allTimeLeaderboard = useMemo(() => {
    if (!members.length) return [];

    return members.map((member: any) => {
      const name = (member.fullName || member.name || member.user?.name || '').trim().toLowerCase();

      const playerMatches = clubMatches.filter((m) => {
        const teamA = (m.teamAPlayers || '').toLowerCase();
        const teamB = (m.teamBPlayers || '').toLowerCase();
        return (name && teamA.includes(name)) || (name && teamB.includes(name));
      });

      let wins = 0;
      let losses = 0;

      playerMatches.forEach((m) => {
        const winner = (m.winner || '').toLowerCase();
        if (name && winner.includes(name)) {
          wins++;
        } else if (m.winner) {
          losses++;
        }
      });

      const mp = wins + losses;
      const winRate = mp > 0 ? Math.round((wins / mp) * 100) : 0;
      const points = wins * 3 + mp * 1; // 3 pts per win, 1 pt per match

      return {
        memberUuid: member.organizationMemberUuid || member.memberUuid || member.userUuid || String(Math.random()),
        fullName: member.fullName || member.name || member.user?.name || 'Athlete',
        photo: member.photo || member.user?.photo,
        matchesPlayed: mp,
        wins,
        losses,
        winRate,
        points,
      };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });
  }, [members, clubMatches]);

  const allTimeTopThree = useMemo(() => {
    const active = allTimeLeaderboard.filter((p) => p.matchesPlayed > 0);
    return (active.length > 0 ? active : allTimeLeaderboard).slice(0, 3);
  }, [allTimeLeaderboard]);

  const lowStockItems = useMemo(() => {
    const list = inventoryItems.filter(
      (item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK' || item.quantity <= (item.minThreshold || 2)
    );
    if (list.length === 0 && inventoryItems.length === 0 && org?.type === 'CLUB') {
      return [
        {
          itemUuid: 'demo-shuttle-1',
          itemName: 'Shuttle',
          category: 'SHUTTLES',
          quantity: 2,
          minThreshold: 2,
          unit: 'Pieces',
          location: 'Court1',
          unitCost: 1200,
          status: 'LOW_STOCK' as const,
        },
      ];
    }
    return list;
  }, [inventoryItems, org?.type]);

  const handleQuickStockChange = async (item: ClubInventoryItem, delta: number) => {
    try {
      const newQty = Math.max(0, item.quantity + delta);
      const newStatus = newQty === 0 ? 'OUT_OF_STOCK' : newQty <= item.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

      setInventoryItems((prev) =>
        prev.map((i) => (i.itemUuid === item.itemUuid ? { ...i, quantity: newQty, status: newStatus as any } : i))
      );

      const payload: AdjustStockPayload = {
        itemUuid: item.itemUuid,
        changeType: delta < 0 ? 'CONSUMED' : 'RESTOCK',
        quantityChange: delta,
        notes: `Quick dashboard adjust (${delta > 0 ? '+1' : '-1'})`,
      };

      if (!item.itemUuid.startsWith('demo-')) {
        await ClubInventoryService.adjustStock(payload);
      }

      setToastMessage(`${delta > 0 ? `+${delta}` : delta} ${item.unit || 'Pieces'} updated!`);
      setTimeout(() => setToastMessage(null), 2500);

      if (org?.id && !item.itemUuid.startsWith('demo-')) {
        ClubInventoryService.getSummary(org.id).then((res) => {
          const sum = (res as any)?.data || res;
          setInventorySummary(sum);
        }).catch(() => { });
      }
    } catch (err) {
      console.error('Failed to quick-adjust inventory:', err);
    }
  };

  const handleDeleteInventoryItem = async (itemUuid: string) => {
    if (!confirm('Are you sure you want to remove this item from club inventory?')) return;
    try {
      if (!itemUuid.startsWith('demo-')) {
        await ClubInventoryService.deleteItem(itemUuid);
      }
      setInventoryItems((prev) => prev.filter((i) => i.itemUuid !== itemUuid));
      setToastMessage('Item removed from inventory');
      setTimeout(() => setToastMessage(null), 2500);
      if (org?.id && !itemUuid.startsWith('demo-')) {
        ClubInventoryService.getSummary(org.id).then((res) => {
          const sum = (res as any)?.data || res;
          setInventorySummary(sum);
        }).catch(() => { });
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleLogUsageSubmit = async () => {
    if (!selectedItemForUsage || !usageAmount || parseInt(usageAmount, 10) <= 0) return;
    try {
      setIsUsageSubmitting(true);
      const qtyNum = parseInt(usageAmount, 10);
      const change = -Math.abs(qtyNum);

      const payload: AdjustStockPayload = {
        itemUuid: selectedItemForUsage.itemUuid,
        changeType: 'CONSUMED',
        quantityChange: change,
        memberUuid: usageMemberUuid && usageMemberUuid.trim() !== '' ? usageMemberUuid.trim() : undefined,
        notes: usageNotes.trim() || 'Logged usage from dashboard',
      };

      if (!selectedItemForUsage.itemUuid.startsWith('demo-')) {
        await ClubInventoryService.adjustStock(payload);
      }

      const newQty = Math.max(0, selectedItemForUsage.quantity + change);
      const newStatus = newQty === 0 ? 'OUT_OF_STOCK' : newQty <= selectedItemForUsage.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

      setInventoryItems((prev) =>
        prev.map((i) => (i.itemUuid === selectedItemForUsage.itemUuid ? { ...i, quantity: newQty, status: newStatus as any } : i))
      );

      setSelectedItemForUsage(null);
      setUsageAmount('1');
      setUsageMemberUuid('');
      setUsageNotes('');
      setToastMessage(`Logged usage: -${qtyNum} ${selectedItemForUsage.unit || 'Pieces'}`);
      setTimeout(() => setToastMessage(null), 3000);

      if (org?.id && !selectedItemForUsage.itemUuid.startsWith('demo-')) {
        ClubInventoryService.getSummary(org.id).then((res) => {
          const sum = (res as any)?.data || res;
          setInventorySummary(sum);
        }).catch(() => { });
      }
    } catch (err) {
      console.error('Failed to log usage:', err);
    } finally {
      setIsUsageSubmitting(false);
    }
  };

  const newMembersThisWeek = useMemo(() => {
    return members.filter((m) => {
      if (!m.joinedAt) return false;
      const joined = new Date(m.joinedAt);
      const diffDays = (Date.now() - joined.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }).length;
  }, [members]);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!org) return null;

  // Determine quick actions based on organization type and role permissions
  const getQuickActions = () => {
    const actions = [];

    if (org.type === 'ACADEMY') {
      const allAcademyTools = [
        {
          key: 'tournaments',
          id: `/org/${org.id}/tournaments`,
          label: 'Tournaments',
          description: 'Internal leagues & draws',
          icon: Trophy,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
        },
        {
          key: 'students',
          id: `/org/${org.id}/students`,
          label: 'Students',
          description: 'Enrollments & active roster',
          icon: GraduationCap,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          key: 'batches',
          id: `/org/${org.id}/batches`,
          label: 'Batches',
          description: 'Coaching groups & schedules',
          icon: Layers,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
        },
        {
          key: 'schedule',
          id: `/org/${org.id}/schedule`,
          label: 'Schedule',
          description: 'Training calendars & slots',
          icon: Calendar,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
        },
        {
          key: 'attendance',
          id: `/org/${org.id}/attendance`,
          label: 'Attendance',
          description: 'Daily check-ins & roll call',
          icon: ClipboardList,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          key: 'centres',
          id: `/org/${org.id}/centres`,
          label: 'Centres',
          description: 'Campus branches & locations',
          icon: Building2,
          color: 'text-violet-400',
          bg: 'bg-violet-500/10',
        },
        {
          key: 'facilities',
          id: `/org/${org.id}/facilities`,
          label: 'Facilities',
          description: 'Courts, turfs & arenas',
          icon: MapPin,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
        },
        {
          key: 'coaches',
          id: `/org/${org.id}/coaches`,
          label: 'Coaches',
          description: 'Coaching staff & roster',
          icon: UserCheck,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
        },
        {
          key: 'staff',
          id: `/org/${org.id}/staff`,
          label: 'Staff',
          description: 'Administration & roles',
          icon: ShieldCheck,
          color: 'text-slate-400',
          bg: 'bg-white/5',
        },
        {
          key: 'performance',
          id: `/org/${org.id}/performance`,
          label: 'Performance',
          description: 'Telemetry & analytics',
          icon: TrendingUp,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          key: 'matches',
          id: `/org/${org.id}/matches`,
          label: 'Matches',
          description: 'Internal academy sparring',
          icon: Activity,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
        },
        {
          key: 'inventory',
          id: `/org/${org.id}/inventory`,
          label: 'Inventory',
          description: 'Shuttles & equipment stock',
          icon: Package,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
        },
        {
          key: 'posts',
          id: `/org/${org.id}/posts`,
          label: 'Feed & Gallery',
          description: 'Blogs, YouTube drills & photos',
          icon: Newspaper,
          color: 'text-pink-400',
          bg: 'bg-pink-500/10',
        },
        {
          key: 'finances',
          id: `/org/${org.id}/finances`,
          label: 'Finances',
          description: 'Fee collection & ledgers',
          icon: CreditCard,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          key: 'settings',
          id: `/org/${org.id}/settings`,
          label: 'Settings',
          description: 'Academy configuration & preferences',
          icon: Settings,
          color: 'text-neutral-400',
          bg: 'bg-neutral-500/10',
        },
      ];

      // Filter tools based on dynamic role permissions
      const permitted = allAcademyTools.filter((tool) => canAccessModule(tool.key));
      return permitted;
    } else if (org.type === 'CLUB') {
      actions.push({
        id: `/org/${org.id}/tournaments`,
        label: 'Tournaments',
        description: 'Club tournaments & draws',
        icon: Trophy,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/members`,
        label: 'Members',
        description: 'Registered club members',
        icon: Users,
        color: 'text-[#3B82F6]',
        bg: 'bg-blue-500/10',
      });
      actions.push({
        id: `/org/${org.id}/matches`,
        label: 'Matches',
        description: 'Club league fixtures',
        icon: Activity,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
      });
      actions.push({
        id: `/org/${org.id}/attendance`,
        label: 'Attendance',
        description: 'Court bookings & check-ins',
        icon: ClipboardList,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      });
      actions.push({
        id: `/org/${org.id}/leaderboard`,
        label: 'Leaderboard',
        description: 'Club ELO rankings',
        icon: BarChart2,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
      });
      actions.push({
        id: `/org/${org.id}/inventory`,
        label: 'Inventory',
        description: 'Shuttles & equipment',
        icon: Package,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
      });
      actions.push({
        id: `/org/${org.id}/posts`,
        label: 'Feed & Gallery',
        description: 'Club blogs, highlights & photos',
        icon: Newspaper,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
      });
      actions.push({
        id: `/org/${org.id}/analytics`,
        label: 'Analytics',
        description: 'Matches, attendance, stock & ledger',
        icon: TrendingUp,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
      });
    }

    if (org.type === 'COACH') {
      actions.push({
        id: `/org/${org.id}/students`,
        label: 'Trainees',
        description: 'Student Enrolment & Roster',
        icon: Users,
        color: 'text-primary',
        bg: 'bg-primary/10',
      });
      actions.push({
        id: `/org/${org.id}/batches`,
        label: 'Sessions',
        description: 'Training Slots & Calendar',
        icon: CalendarDays,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/attendance`,
        label: 'Attendance',
        description: 'Daily Check-in & Logs',
        icon: ClipboardList,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
      });
      actions.push({
        id: `/org/${org.id}/fees`,
        label: 'Coaching Fees',
        description: 'Fee Tiers & Collections',
        icon: CreditCard,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      });
    }

    if (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION') {
      actions.push({
        id: `/org/${org.id}/tournaments`,
        label: 'Tournaments',
        description: 'Championships, Draws & Schedules',
        icon: Trophy,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
      });
      actions.push({
        id: `/org/${org.id}/inventory`,
        label: 'Inventory',
        description: 'Match gear, trophies & kits',
        icon: Boxes,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
      });
    }

    if (org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER') {
      return [
        // 1. Daily Operations & Reservations
        {
          id: `/org/${org.id}/venue/calendar`,
          label: 'Live Calendar',
          shortLabel: 'Calendar',
          description: 'Visual interactive slot grid & real-time holds',
          icon: CalendarDays,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          id: `/org/${org.id}/venue/bookings`,
          label: 'Bookings',
          shortLabel: 'Bookings',
          description: 'Slot bookings, walk-ins & check-in',
          icon: ClipboardList,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          id: `/org/${org.id}/venue/recurring`,
          label: 'Recurring Series',
          shortLabel: 'Recurring',
          description: 'Academy & club block series with conflict check',
          icon: Layers,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
        },
        // 2. Facility & Arena Setup
        {
          id: `/org/${org.id}/venue/facilities`,
          label: 'Facilities',
          shortLabel: 'Facilities',
          description: 'Turfs, courts, pitches & multi-sport arenas',
          icon: Building,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
        },
        {
          id: `/org/${org.id}/venue/pricing`,
          label: 'Pricing Rules',
          shortLabel: 'Pricing',
          description: 'Dynamic peak, weekend & off-peak rate tiers',
          icon: Tag,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
        },
        {
          id: `/org/${org.id}/venue/blocks`,
          label: 'Blocks & Maint.',
          shortLabel: 'Blocks',
          description: 'Maintenance slots & admin closures',
          icon: Shield,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
        },
        // 3. Insights & Revenue
        {
          id: `/org/${org.id}/venue/reports`,
          label: 'Reports & Revenue',
          shortLabel: 'Reports',
          description: 'Occupancy matrix & financial earnings',
          icon: TrendingUp,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
        },
        {
          id: `/org/${org.id}/finances`,
          label: 'Finances',
          shortLabel: 'Finances',
          description: 'Settlements & payouts',
          icon: CreditCard,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        // 4. Workspace Settings & Profile
        {
          id: `/org/${org.id}/settings`,
          label: 'Settings',
          shortLabel: 'Settings',
          description: 'Workspace configuration, venue profile & hours',
          icon: Settings,
          color: 'text-foreground/60',
          bg: 'bg-white/5',
        },
      ];
    }

    // Common actions for non-academy org types
    actions.push({
      id: `/org/${org.id}/finances`,
      label: 'Finances',
      description: 'Billing, payouts & revenue',
      icon: CreditCard,
      color: 'text-primary',
      bg: 'bg-primary/10',
    });
    actions.push({
      id: `/org/${org.id}/settings`,
      label: 'Settings',
      description: 'Workspace configuration',
      icon: Settings,
      color: 'text-foreground/60',
      bg: 'bg-white/5',
    });

    return actions;
  };

  const getOrgIcon = () => {
    switch (org.type) {
      case 'ACADEMY':
        return Users;
      case 'CLUB':
        return Building;
      case 'COACH':
        return Award;
      case 'ORGANIZER':
        return Trophy;
      case 'ASSOCIATION':
        return ShieldCheck;
      case 'COURT':
        return MapPin;
      default:
        return Building;
    }
  };

  const quickActions = getQuickActions();
  const OrgIcon = getOrgIcon();

  // Mock workspace events for Organizer
  const orgTournaments = [
    {
      id: 'tourn-1',
      title: 'State Championship League 2026',
      type: 'Team Championship',
      sport: 'Badminton',
      status: 'LIVE IN PLAY',
      teams: 8,
      matches: 24,
      venue: 'Main Indoor Arena',
      badge: 'Live',
    },
    {
      id: 'tourn-2',
      title: 'Summer Smash Masters Open',
      type: 'Open Tournament',
      sport: 'Badminton',
      status: 'REGISTRATIONS OPEN',
      teams: 48,
      matches: 64,
      venue: 'Central Court Complex',
      badge: 'Upcoming',
    },
    {
      id: 'tourn-3',
      title: 'Junior District Cup 2026',
      type: 'Junior Knockout',
      sport: 'Badminton',
      status: 'SCHEDULED',
      teams: 32,
      matches: 31,
      venue: 'Sports Authority Stadium',
      badge: 'Upcoming',
    },
  ];

  // Mock live courts for Organizer
  const liveCourts = [
    {
      id: 'court-1',
      court: 'Court 1',
      tournament: 'State Championship League 2026',
      match: 'Warriors BC vs Smashers United',
      score: '21-18, 14-12',
      status: 'Set 2 In Play',
      streamLive: true,
    },
    {
      id: 'court-2',
      court: 'Court 2',
      tournament: 'State Championship League 2026',
      match: 'Apex Shuttlers vs Lightning Stars',
      score: '19-21, 21-17, 8-5',
      status: 'Deciding Set',
      streamLive: true,
    },
    {
      id: 'court-3',
      court: 'Court 3',
      tournament: 'State Championship League 2026',
      match: 'Royal Strikers vs Phoenix Club',
      score: 'Warm-up / Lineup Check',
      status: 'Ready to Start',
      streamLive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* HERO SECTION (Video Container) */}
        <div className="px-6 relative z-10 mt-6 mb-6 max-w-7xl mx-auto">
          <section className="relative w-full min-h-[160px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-lg">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <video
                key={backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
            </div>
          </section>
        </div>

        {/* ROLE SWITCHER HEADER */}
        <div className="px-6 mb-6 max-w-7xl mx-auto">
          <HomeRoleHeader activeRole={org.id} organizations={organizations} showSearch={false} />
        </div>

        {/* UNIFIED ORG STATS & METRICS CARD */}
        <div className="px-6 relative z-10 mb-4 max-w-7xl mx-auto">
          <div
            className="rounded-[18px] shadow-sm overflow-hidden border relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Org Info Header */}
            <div
              className="flex items-center justify-between p-3.5 border-b relative z-10"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl border overflow-hidden shrink-0 shadow-inner flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <OrgIcon className="w-4 h-4" style={{ color: 'var(--athlon-text-muted)' }} />
                    )}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2"
                    style={{ borderColor: 'var(--athlon-card)' }}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className="font-bold text-xs tracking-wide uppercase truncate"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    {org.name}
                  </span>
                </div>
              </div>

              {/* Role Capsule Badge */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-xl px-2 py-1 shrink-0">
                  <span className="text-primary font-black text-[10px] leading-none">{org.type}</span>
                  <OrgIcon className="w-3 h-3 text-primary shrink-0 opacity-90" />
                </div>
                <span className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${isAdmin
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                  : isCoach
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/25'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                  }`}>
                  {isAdmin ? '👑 Admin' : isCoach ? '🧢 Coach' : '👤 Member'}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div
              className="grid grid-cols-3 divide-x relative z-10"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {org.type === 'COACH' ? (
                <>
                  {/* 1. Trainees */}
                  <Link
                    href={`/org/${org.id}/students`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Users className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">TRAINEES</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{coachDashboard?.activeTraineesCount ?? coachTrainees.length}</span>
                        <span className="text-[8px] text-primary font-semibold">Active</span>
                      </div>
                    )}
                  </Link>

                  {/* 2. Today's Sessions */}
                  <Link
                    href={`/org/${org.id}/batches`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <CalendarDays className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">SESSIONS</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{coachDashboard?.totalSessionsToday ?? coachSchedules.length} Slots</span>
                        <span className="text-[8px] text-amber-500 font-semibold">Today</span>
                      </div>
                    )}
                  </Link>

                  {/* 3. Fee Earnings / Cash */}
                  <Link
                    href={`/org/${org.id}/fees`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <CreditCard className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">FEES</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>
                          ₹
                          {coachDashboard?.monthlyRevenuePaid != null
                            ? Number(coachDashboard.monthlyRevenuePaid).toLocaleString('en-IN')
                            : Number(financeSummary?.netBalance || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">Month</span>
                      </div>
                    )}
                  </Link>
                </>
              ) : org.type === 'ACADEMY' ? (
                <>
                  {/* 1. Students */}
                  <Link
                    href={`/org/${org.id}/students`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <GraduationCap className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">STUDENTS</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{studentsCount || academyDashboard?.activeStudents || 0}</span>
                        <span className="text-[8px] text-blue-600 dark:text-blue-400 font-semibold">Enrolled</span>
                      </div>
                    )}
                  </Link>

                  {/* 2. Coaches */}
                  <Link
                    href={`/org/${org.id}/coaches`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <UserCheck className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">COACHES</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{coachesCount || academyDashboard?.activeCoaches || 0}</span>
                        <span className="text-[8px] text-purple-600 dark:text-purple-400 font-semibold">Coaches</span>
                      </div>
                    )}
                  </Link>

                  {/* 3. Staff */}
                  <Link
                    href={`/org/${org.id}/staff`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">STAFF</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{members.length}</span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">Staff</span>
                      </div>
                    )}
                  </Link>
                </>
              ) : org.type === 'ORGANIZER' || org.type === 'ASSOCIATION' ? (
                <>
                  {/* 1. Tournaments */}
                  <Link
                    href={`/org/${org.id}/tournaments`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">TOURNAMENTS</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{tournaments.length}</span>
                        <span className="text-[8px] text-amber-500 font-semibold">Hosted</span>
                      </div>
                    )}
                  </Link>

                  {/* 2. Active Tournaments */}
                  <Link
                    href={`/org/${org.id}/tournaments`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Activity className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">ACTIVE</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1 truncate max-w-[90px]"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>
                          {
                            tournaments.filter(
                              (t) => (t.status || '').toUpperCase() !== 'COMPLETED'
                            ).length
                          }
                        </span>
                        <span className="text-[8px] text-blue-500 font-semibold">Ongoing</span>
                      </div>
                    )}
                  </Link>

                  {/* 3. Inventory Assets */}
                  <Link
                    href={`/org/${org.id}/inventory`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Package className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">INVENTORY</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>
                          {organizerInventorySummary?.totalQuantity ??
                            inventorySummary?.totalQuantity ??
                            inventoryItems.length}
                        </span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Assets
                        </span>
                      </div>
                    )}
                  </Link>
                </>
              ) : org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER' ? (
                <>
                  {/* 1. Facilities / Courts */}
                  <Link
                    href={`/org/${org.id}/venue/facilities`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Building className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">FACILITIES</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{venueFacilities.length || 1}</span>
                        <span className="text-[8px] text-purple-600 dark:text-purple-400 font-semibold">Active</span>
                      </div>
                    )}
                  </Link>

                  {/* 2. Bookings */}
                  <Link
                    href={`/org/${org.id}/venue/bookings`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <CalendarDays className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">BOOKINGS</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{venueBookings.length}</span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">Slots</span>
                      </div>
                    )}
                  </Link>

                  {/* 3. Venue Revenue */}
                  <Link
                    href={`/org/${org.id}/venue/reports`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <TrendingUp className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">REVENUE</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>₹{Number(venueTotalRevenue || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[8px] text-rose-600 dark:text-rose-400 font-semibold">Earned</span>
                      </div>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  {/* 1. Members */}
                  <Link
                    href={`/org/${org.id}/members`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Users className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">MEMBERS</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>{members.length}</span>
                        <span className="text-[8px] text-blue-600 dark:text-blue-400 font-semibold">Roster</span>
                      </div>
                    )}
                  </Link>

                  {/* 2. Top Rank / Leaderboard */}
                  <Link
                    href={`/org/${org.id}/leaderboard`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">RANK #1</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1 truncate max-w-[90px]"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span className="truncate">{allTimeTopThree[0]?.fullName?.split(' ')[0] || 'Top 3'}</span>
                        <span className="text-[8px] text-amber-500 font-bold shrink-0">
                          {allTimeTopThree[0]?.points ? `${allTimeTopThree[0].points} pts` : '🏆'}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* 3. Available Cash */}
                  <Link
                    href={`/org/${org.id}/finances`}
                    className="flex flex-col items-center justify-center py-2.5 px-1.5 gap-0.5 hover:opacity-80 transition-opacity text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div
                      className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <CreditCard className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">CASH</span>
                    </div>
                    {loadingMetrics ? (
                      <div className="h-4 w-8 bg-foreground/10 rounded animate-pulse my-0.5" />
                    ) : (
                      <div
                        className="font-bold text-xs leading-tight flex items-baseline gap-1"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span>₹{Number(financeSummary?.netBalance || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">Balance</span>
                      </div>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Management Tools & Modules (Mobile) */}
        <div className="px-6 max-w-7xl mx-auto mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Management Tools &amp; Modules
              </h2>
            </div>
            <span className="text-[10px] font-bold text-foreground/50">
              {quickActions.length} Tools
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar -mx-6 px-6">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div
                  className="w-[72px] h-[72px] rounded-[20px] flex flex-col items-center justify-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 border"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <Athlon3DIcon type={getOrg3DIconType(action.label)} size={40} active={true} />
                </div>
                <span
                  className="text-[10px] font-bold text-center transition-colors group-hover:text-primary max-w-[76px] truncate"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  {(action as any).shortLabel || action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* COACH SPECIFIC MOBILE SECTIONS */}
        {org.type === 'COACH' && (
          <div className="px-6 max-w-7xl mx-auto mt-6 space-y-6">
            {/* 1. Today's Coaching Schedule & Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                    Today's Coaching Schedule
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25">
                    {coachSchedules.length} Slots
                  </span>
                </div>
                <Link
                  href={`/org/${org.id}/batches`}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {coachSchedules.length > 0 ? (
                <div className="space-y-3">
                  {coachSchedules.map((session, sIdx) => (
                    <CoachScheduleCard
                      key={`mob-${session.sessionUuid || (session as any).id || sIdx}`}
                      session={session}
                      orgId={org.id}
                      onCheckIn={handleCheckInSession}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="p-5 rounded-2xl border text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <CalendarDays className="w-6 h-6 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No coaching slots scheduled for today</p>
                  <Link
                    href={`/org/${org.id}/batches`}
                    className="text-[11px] font-bold text-primary hover:underline inline-block"
                  >
                    + Schedule Slot
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Enrolled Trainees & Active Clients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                    Enrolled Trainees
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25">
                    {coachTrainees.length} Active
                  </span>
                </div>
                <Link
                  href={`/org/${org.id}/students`}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {coachTrainees.length > 0 ? (
                <div className="space-y-3">
                  {coachTrainees.map((trainee, tIdx) => (
                    <CoachTraineeCard
                      key={`mob-trainee-${trainee.traineeUuid || (trainee as any).id || tIdx}`}
                      trainee={trainee}
                      orgId={org.id}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="p-5 rounded-2xl border text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Users className="w-6 h-6 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No trainees enrolled yet</p>
                  <Link
                    href={`/org/${org.id}/students`}
                    className="text-[11px] font-bold text-primary hover:underline inline-block"
                  >
                    + Enroll Trainee
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Coach Credentials & Experience Showcase */}
            <CoachCredentialsCard coachProfile={coachProfile} orgId={org.id} />
          </div>
        )}

        {/* CLUB SPECIFIC MOBILE SECTIONS */}
        {org.type === 'CLUB' && (
          <div className="px-6 max-w-7xl mx-auto mt-6 space-y-6">
            {/* 1. All-Time Top 3 Leaderboard (Mobile) */}
            <ClubLeaderboardPodiumCard
              topThree={allTimeTopThree}
              orgId={org.id}
              loading={loadingMetrics}
            />

            {/* 2. Low Stock Inventory Alerts (Mobile) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                    Low Stock Alerts
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25">
                    {lowStockItems.length}
                  </span>
                </div>
                <Link
                  href={`/org/${org.id}/inventory`}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingMetrics ? (
                <div className="p-4 rounded-3xl bg-surface border border-foreground/5 animate-pulse space-y-3">
                  <div className="h-10 bg-foreground/10 rounded-2xl" />
                  <div className="h-20 bg-foreground/5 rounded-2xl" />
                </div>
              ) : lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <ClubInventoryAlertCard
                      key={`mob-${item.itemUuid}`}
                      item={item}
                      orgId={org.id}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[22px] border p-6 text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Package className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-foreground/80">All club supplies &amp; gear in good stock</p>
                  <Link href={`/org/${org.id}/inventory`} className="text-[11px] font-bold text-primary hover:underline inline-block">
                    View Supplies Catalog &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACADEMY SPECIFIC MOBILE SECTIONS */}
        {org.type === 'ACADEMY' && (
          <>
            {/* 1. Today's Scheduled Coaching Sessions (Mobile) */}
            <div className="px-6 max-w-7xl mx-auto mt-6">
              <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                    Today's Scheduled Coaching Sessions
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-primary tracking-wider">
                  {loadingMetrics ? 'Loading...' : `${academyDashboard?.upcomingBatches?.length ?? 0} ${(academyDashboard?.upcomingBatches?.length ?? 0) === 1 ? 'Batch' : 'Batches'}`}
                </span>
              </div>

              {loadingMetrics ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] h-[180px] rounded-[22px] border bg-surface/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                  ))}
                </div>
              ) : (academyDashboard?.upcomingBatches && academyDashboard.upcomingBatches.length > 0) ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {academyDashboard.upcomingBatches.map((batch) => {
                    const enrolled = Number(batch.enrolledCount || 0);
                    const max = Number(batch.maxCapacity || 1);
                    const capacityPercent = Math.min(100, Math.round((enrolled / max) * 100));

                    return (
                      <div
                        key={batch.batchUuid}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <div
                          className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group hover:border-primary/50"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Top Theme Primary Accent Line */}
                          <div className="h-[3px] w-full bg-primary" />

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            {/* Header Row: Level Badge, Sport & Capacity Tag */}
                            <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                                  {batch.level || 'COACHING'}
                                </span>

                                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/70 shrink-0">
                                  {batch.sportType || 'Badminton'}
                                </span>
                              </div>

                              {/* Slot Tag */}
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black tracking-tight text-primary bg-primary/10 border border-primary/25 shrink-0">
                                {enrolled} / {max} Enrolled
                              </span>
                            </div>

                            {/* Batch Name & Time */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                                <Calendar className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-snug"
                                  title={batch.batchName}
                                >
                                  {batch.batchName}
                                </h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/50 truncate mt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="truncate">
                                    {batch.startTime?.substring(0, 5)} - {batch.endTime?.substring(0, 5)} {batch.daysOfWeek ? `(${batch.daysOfWeek})` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bento Detail Bar: Coach, Court & Fill Progress */}
                            <div
                              className="rounded-xl p-2.5 border space-y-2.5 text-[11px]"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                {/* Coach Info */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-[9px] shrink-0">
                                    {(batch.coachName || 'C').charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[8.5px] uppercase font-bold text-foreground/40 block leading-none">Coach</span>
                                    <span className="text-[11px] font-black text-primary truncate block mt-0.5">
                                      {batch.coachName || 'Unassigned'}
                                    </span>
                                  </div>
                                </div>

                                {/* Court Location */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[8.5px] uppercase font-bold text-foreground/40 block leading-none">Court</span>
                                    <span className="text-[10.5px] font-bold text-foreground/80 truncate block mt-0.5">
                                      {batch.courtName?.split('(')[0]?.trim() || 'Court 1'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Batch Capacity Bar */}
                              <div className="space-y-1 pt-1 border-t border-foreground/5">
                                <div className="flex items-center justify-between text-[9px] font-bold text-foreground/50">
                                  <span>Batch Capacity</span>
                                  <span className="font-mono text-primary">{capacityPercent}% full</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${capacityPercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Footer Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-foreground/5">
                              <Link
                                href={`/org/${org.id}/attendance`}
                                className="py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 transition-all text-center"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Roll Call</span>
                              </Link>

                              <Link
                                href={`/org/${org.id}/batches`}
                                className="py-2.5 rounded-xl bg-surface border text-foreground/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-white/5 active:scale-95 transition-all text-center"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                <span>Batch Info</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-[22px] border p-6 text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Calendar className="w-8 h-8 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No coaching batches scheduled today</p>
                  <Link href={`/org/${org.id}/batches`} className="text-[11px] font-bold text-primary hover:underline inline-block">
                    Create / Manage Batches &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Academy Campuses & Training Arenas (Mobile) */}
            <div className="px-6 max-w-7xl mx-auto mt-6">
              <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                    Academy Campuses &amp; Training Arenas
                  </h2>
                </div>
                <Link
                  href={`/org/${org.id}/centres`}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingMetrics ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] h-[180px] rounded-[22px] border bg-surface/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                  ))}
                </div>
              ) : (academyDashboard?.centres && academyDashboard.centres.length > 0) ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {academyDashboard.centres.map((centre) => (
                    <div
                      key={centre.centreUuid}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                    >
                      <div
                        className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group hover:border-primary/50"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        {/* Top Theme Primary Accent Line */}
                        <div className="h-[3px] w-full bg-primary" />

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          {/* Header Row */}
                          <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                              <Building className="w-2.5 h-2.5 text-primary" />
                              Campus Arena
                            </span>

                            <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              {centre.status || 'Active'}
                            </span>
                          </div>

                          {/* Centre Name & Location */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                              <Building className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-snug">
                                {centre.name}
                              </h3>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/45 truncate mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">{centre.city || 'Campus'}{centre.operatingHours ? ` • ${centre.operatingHours}` : ''}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bento Metric Strip */}
                          <div
                            className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-foreground/40 block">Courts</span>
                              <span className="text-xs font-black text-foreground font-mono">{centre.facilitiesCount ?? 0}</span>
                            </div>
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-foreground/40 block">Batches</span>
                              <span className="text-xs font-black text-foreground font-mono">{centre.activeBatchesCount ?? 0}</span>
                            </div>
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-foreground/40 block">Students</span>
                              <span className="text-xs font-black text-primary font-mono">{centre.activeStudentsCount ?? 0}</span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
                            <span className="text-[9.5px] text-foreground/50 truncate max-w-[65%]">
                              Sports: <span className="text-foreground font-bold">{centre.sportsAvailable || 'Badminton'}</span>
                            </span>

                            <Link
                              href={`/org/${org.id}/facilities?centreUuid=${centre.centreUuid}`}
                              className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-0.5 hover:underline shrink-0"
                            >
                              <span>Courts</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[22px] border p-6 text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Building className="w-8 h-8 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No campus locations registered</p>
                  <Link href={`/org/${org.id}/centres`} className="text-[11px] font-bold text-primary hover:underline inline-block">
                    Add Campus Centre &rarr;
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* VENUE / COURT SPECIFIC MOBILE SECTIONS */}
        {(org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER') && (
          <div className="px-6 max-w-7xl mx-auto mt-6 space-y-6">
            {/* 1. Live Slot Matrix Fast Access */}
            <div
              className="p-5 rounded-[22px] border relative overflow-hidden bg-gradient-to-br from-card via-surface to-card shadow-lg group"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Live Booking Grid</span>
                </div>
                <span className="text-[10px] font-bold text-foreground/50">{venueFacilities.length} Facilities Active</span>
              </div>
              <h3 className="text-base font-black text-foreground mb-1">Visual Interactive Slot Calendar</h3>
              <p className="text-xs text-foreground/60 mb-4">View real-time slot occupancy, book counter walk-ins, and manage 10-minute holds.</p>
              <Link
                href={`/org/${org.id}/venue/calendar`}
                className="w-full py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Open Live Calendar Matrix</span>
              </Link>
            </div>

            {/* 2. Recent Bookings / Walk-ins */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                    Recent Bookings
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25">
                    {venueBookings.length}
                  </span>
                </div>
                <Link
                  href={`/org/${org.id}/venue/bookings`}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>All Bookings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {venueBookings.length > 0 ? (
                <div className="space-y-2.5">
                  {venueBookings.slice(0, 5).map((b, idx) => (
                    <div
                      key={b.bookingUuid || idx}
                      className="p-3.5 rounded-2xl border bg-card flex items-center justify-between gap-3 shadow-sm"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground truncate">{b.guestName || 'Walk-in Player'}</span>
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                            b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : b.bookingStatus === 'HELD'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-foreground/50 mt-0.5 flex items-center gap-1.5">
                          <span>{b.facilityName || 'Court'}</span>
                          <span>•</span>
                          <span>{b.bookingDate} ({b.startTime?.substring(0, 5)} - {b.endTime?.substring(0, 5)})</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-foreground block font-mono">₹{Number(b.totalAmount || 0).toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-emerald-500 block uppercase">{b.paymentStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-5 rounded-2xl border text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Calendar className="w-6 h-6 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No bookings recorded yet</p>
                  <Link
                    href={`/org/${org.id}/venue/calendar`}
                    className="text-[11px] font-bold text-primary hover:underline inline-block"
                  >
                    + Book Counter Walk-in
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Facilities & Turfs Quick List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                    Facilities &amp; Turfs
                  </h2>
                </div>
                <Link
                  href={`/org/${org.id}/venue/facilities`}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {venueFacilities.map((fac) => (
                  <div
                    key={fac.facilityUuid}
                    className="p-3.5 rounded-2xl border bg-card flex flex-col justify-between gap-2 shadow-sm"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase text-primary tracking-wider">{fac.sports?.[0]?.sportName || fac.facilityType}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <h4 className="text-xs font-black text-foreground truncate">{fac.name}</h4>
                      <p className="text-[10px] text-foreground/50">{fac.surfaceType || 'Synthetic'} • {fac.facilityType}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-[10px] font-bold" style={{ borderColor: 'var(--athlon-border)' }}>
                      <span className="text-foreground/60">Base Slot</span>
                      <span className="text-primary font-mono font-bold">₹{fac.pricingRules?.[0]?.price ?? 500}/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - PREMIUM COMMAND DECK WITH HORIZONTAL SCROLLING TRACKS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Hero Command Banner (No background video) */}
        <section
          className="border-b px-8 py-10 bg-gradient-to-b from-card/80 via-card/40 to-background relative overflow-hidden"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Ambient Radar Glow */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-yellow-500/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            {/* Header Strip */}
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-[24px] border p-1 shadow-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-[20px]" />
                  ) : (
                    <OrgIcon className="w-8 h-8 text-primary" />
                  )}
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">{org.name}</h1>
                    <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/30">
                      {org.type === 'COURT' ? 'VENUE MANAGER' : `${org.type} Workspace`}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${isAdmin
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      : isCoach
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      }`}>
                      {isAdmin ? '👑 Admin' : isCoach ? '🧢 Coach' : '👤 Member'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50">
                    {isAdmin
                      ? (org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER'
                        ? 'Central sports facility operations console, visual slot matrix, dynamic pricing & bookings'
                        : 'Central management operations console, event coordination, and financial ledger')
                      : 'Sports portal • View schedule, booking history, and venue facilities'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isAdmin && (
                  org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER' ? (
                    <Link
                      href={`/org/${org.id}/venue/calendar`}
                      className="flex items-center gap-2 bg-primary text-black text-xs font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                      style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span>Live Booking Grid</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/org/${org.id}/tournaments/create`}
                      className="flex items-center gap-2 bg-primary text-black text-xs font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                      style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Create Tournament</span>
                    </Link>
                  )
                )}

                <Link
                  href={`/org/${org.id}/settings`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>{isAdmin ? 'Settings' : 'Workspace Info'}</span>
                </Link>
              </div>
            </div>

            {/* 4 Workspace Telemetry Highlight Cards */}
            {org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER' ? (
              <div className="grid grid-cols-4 gap-4">
                <Link
                  href={`/org/${org.id}/venue/calendar`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Live Slot Matrix</span>
                    <CalendarDays className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground font-mono">Live Grid</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">Active</span>
                  </div>
                  <span className="text-[11px] text-foreground/45 block">15/30/60m Multi-Court Matrix</span>
                </Link>

                <Link
                  href={`/org/${org.id}/venue/facilities`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-purple-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Active Facilities</span>
                    <Building className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        {venueFacilities.length || 1}
                      </span>
                      <span className="text-xs font-bold text-purple-400 font-mono">Turfs &amp; Courts</span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Configured Sports Facilities</span>
                </Link>

                <Link
                  href={`/org/${org.id}/venue/bookings`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Total Bookings</span>
                    <ClipboardList className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        {venueBookings.length}
                      </span>
                      <span className="text-xs font-bold text-blue-400 font-mono">Slots Reserved</span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Online app &amp; walk-in bookings</span>
                </Link>

                <Link
                  href={`/org/${org.id}/venue/reports`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-rose-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Venue Revenue</span>
                    <TrendingUp className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-28 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        ₹{Number(venueTotalRevenue || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">Settled</span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Collected slot booking revenue</span>
                </Link>
              </div>
            ) : org.type === 'ACADEMY' ? (
              <div className="grid grid-cols-4 gap-4">
                <Link
                  href={`/org/${org.id}/students`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Active Students</span>
                    <GraduationCap className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        {academyDashboard?.activeStudents ?? 0}
                      </span>
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {academyDashboard?.activeBatches ?? 0} Batches
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Grassroots to Elite Training Roster</span>
                </Link>

                <Link
                  href={`/org/${org.id}/attendance`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Today's Attendance</span>
                    <ClipboardList className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {academyDashboard?.todaysAttendancePercentage != null ? `${academyDashboard.todaysAttendancePercentage}%` : '0%'}
                      </span>
                      <span className="text-xs font-bold text-emerald-500 font-mono">
                        {academyDashboard?.todaysSessionsCount ?? 0} Slots
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Live QR &amp; Coach Digital Roll Call</span>
                </Link>

                <Link
                  href={`/org/${org.id}/finances`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Coaching Fees</span>
                    <CreditCard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-28 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        ₹{Number(academyDashboard?.feesCollected || financeSummary?.totalIncome || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-rose-400 font-mono">
                        ₹{Number(academyDashboard?.pendingFees || 0).toLocaleString('en-IN')} Due
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Monthly coaching billing cycle</span>
                </Link>

                <Link
                  href={`/org/${org.id}/centres`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-purple-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Campuses &amp; Courts</span>
                    <Building className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        {academyDashboard?.totalCentres ?? 0} Campuses
                      </span>
                      <span className="text-xs font-bold text-purple-400 font-mono">
                        {academyDashboard?.totalFacilities ?? 0} Courts
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {academyDashboard?.facilityUtilizationPercentage != null ? `${academyDashboard.facilityUtilizationPercentage}%` : '0%'} Arena Utilization Rate
                  </span>
                </Link>
              </div>
            ) : org.type === 'ORGANIZER' || org.type === 'ASSOCIATION' ? (
              <div className="grid grid-cols-4 gap-4">
                <Link
                  href={`/org/${org.id}/tournaments`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-yellow-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Tournaments Hosted</span>
                    <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-20 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-yellow-400 font-mono">{tournaments.length} Events</span>
                      <span className="text-xs font-bold text-yellow-500 font-mono">
                        {tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS' || (t as any).status === 'ONGOING').length > 0
                          ? `${tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS' || (t as any).status === 'ONGOING').length} Live`
                          : 'Championships'}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Championships, Draws &amp; Schedules</span>
                </Link>

                <Link
                  href={`/org/${org.id}/inventory`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Tournament Inventory</span>
                    <Package className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-20 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary font-mono">
                        {organizerInventorySummary?.totalQuantity ?? inventorySummary?.totalQuantity ?? inventoryItems.length} Units
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {organizerInventorySummary?.inStockCount ?? inventorySummary?.inStockCount ?? 0} In Stock
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {organizerInventorySummary?.lowStockCount ? `${organizerInventorySummary.lowStockCount} low stock alerts` : 'Match gear, tablets & awards'}
                  </span>
                </Link>

                <Link
                  href={`/org/${org.id}/members`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Staff &amp; Umpires</span>
                    <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-16 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">{members.length}</span>
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        Crew &amp; Staff
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Assigned organizers &amp; court desk officials</span>
                </Link>

                <Link
                  href={`/org/${org.id}/finances`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Tournament Finances</span>
                    <CreditCard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        ₹{Number(financeSummary?.totalIncome || 0).toLocaleString('en-IN')}
                      </span>
                      {financeSummary && (
                        <span className={`text-xs font-bold font-mono ${Number(financeSummary.netBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {Number(financeSummary.netBalance || 0) >= 0
                            ? `+₹${Number(financeSummary.netBalance || 0).toLocaleString('en-IN')} Net`
                            : `-₹${Math.abs(Number(financeSummary.netBalance || 0)).toLocaleString('en-IN')} Net`}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {financeSummary ? `${financeSummary.transactionCount} transactions recorded` : 'Entry fees & tournament expenses'}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <Link
                  href={`/org/${org.id}/finances`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Monthly Revenue</span>
                    <CreditCard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        ₹{Number(financeSummary?.totalIncome || 0).toLocaleString('en-IN')}
                      </span>
                      {financeSummary && (
                        <span className={`text-xs font-bold font-mono ${Number(financeSummary.netBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                          {Number(financeSummary.netBalance || 0) >= 0
                            ? `+₹${Number(financeSummary.netBalance || 0).toLocaleString('en-IN')} Net`
                            : `-₹${Math.abs(Number(financeSummary.netBalance || 0)).toLocaleString('en-IN')} Net`}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {financeSummary ? `${financeSummary.transactionCount} transactions recorded` : 'Verified payouts & fee collections'}
                  </span>
                </Link>

                <Link
                  href={`/org/${org.id}/members`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Active Members</span>
                    <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-16 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">{members.length}</span>
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {newMembersThisWeek > 0 ? `+${newMembersThisWeek} this week` : 'Active Roster'}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Registered athlete roster</span>
                </Link>

                <Link
                  href={`/org/${org.id}/tournaments`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-yellow-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Tournaments Active</span>
                    <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-20 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-yellow-400 font-mono">{tournaments.length} Events</span>
                      <span className="text-xs font-bold text-yellow-500 font-mono">
                        {tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS').length > 0
                          ? `${tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS').length} Live`
                          : 'Scheduled'}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Championships &amp; Opens</span>
                </Link>

                <Link
                  href={`/org/${org.id}/inventory`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Club Supplies &amp; Gear</span>
                    <Package className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-20 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary font-mono">
                        {inventorySummary?.totalQuantity || 0} Units
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {inventorySummary?.inStockCount || 0} In Stock
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {inventorySummary?.lowStockCount ? `${inventorySummary.lowStockCount} low stock alerts` : 'Shuttles & equipment ready'}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Desktop Main Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-10 space-y-12">
          {/* 1. Management Quick Action Tools (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Management Tools &amp; Modules</h2>
                  <p className="text-xs text-foreground/50">
                    Quick operations console for {org.name} ({quickActions.length} tools available)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(toolsTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(toolsTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={toolsTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.id}
                  className="snap-start shrink-0 w-[240px] p-5 rounded-[24px] border relative overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all group"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-surface border border-white/10 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                      <Athlon3DIcon type={getOrg3DIconType(action.label)} size={36} active={true} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-primary pt-3 border-t mt-4" style={{ borderColor: 'var(--athlon-border)' }}>
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 2. VENUE / COURT SPECIFIC TRACKS */}
          {(org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER') ? (
            <>
              {/* Today's Bookings Track */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Recent Slot Reservations &amp; Walk-ins</h2>
                      <p className="text-xs text-foreground/50">
                        {loadingMetrics ? 'Loading bookings...' : `${venueBookings.length} total bookings recorded • Real-time slot status`}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/org/${org.id}/venue/bookings`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View All Bookings</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {venueBookings.length > 0 ? (
                  <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8">
                    {venueBookings.map((b, idx) => (
                      <div key={b.bookingUuid || idx} className="snap-start shrink-0 w-[340px]">
                        <div
                          className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-emerald-500/40 transition-all group"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 absolute top-0 left-0 right-0" />

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : b.bookingStatus === 'HELD'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              }`}>
                                {b.bookingStatus}
                              </span>
                              <span className="text-xs font-mono font-black text-foreground">₹{Number(b.totalAmount || 0).toLocaleString()}</span>
                            </div>

                            <div>
                              <h3 className="text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                                {b.guestName || 'Walk-in Player'}
                              </h3>
                              <p className="text-xs text-foreground/50 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{b.bookingDate} ({b.startTime?.substring(0, 5)} - {b.endTime?.substring(0, 5)})</span>
                              </p>
                            </div>

                            <div
                              className="p-3 rounded-2xl border flex items-center justify-between text-xs"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                            >
                              <span className="font-bold text-foreground truncate">{b.facilityName || 'Main Facility'}</span>
                              <span className="font-mono text-emerald-400 font-bold uppercase">{b.paymentStatus}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t flex items-center justify-between text-xs font-black text-primary" style={{ borderColor: 'var(--athlon-border)' }}>
                            <Link href={`/org/${org.id}/venue/bookings`} className="hover:underline flex items-center gap-1">
                              <span>Booking Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                            <span className="text-[10px] text-foreground/40 uppercase">{b.bookingSource || 'APP'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-[24px] border text-center space-y-3" style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}>
                    <Calendar className="w-10 h-10 text-foreground/30 mx-auto" />
                    <p className="text-sm font-bold text-foreground/70">No bookings recorded in this venue yet</p>
                    <Link
                      href={`/org/${org.id}/venue/calendar`}
                      className="px-4 py-2 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span>Launch Slot Calendar</span>
                    </Link>
                  </div>
                )}
              </section>

              {/* Facilities Track */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-purple-400" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Configured Facilities &amp; Turfs</h2>
                      <p className="text-xs text-foreground/50">
                        {venueFacilities.length} multi-sport facilities configured for online &amp; counter booking
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/org/${org.id}/venue/facilities`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Manage Facilities</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  {venueFacilities.map((fac) => (
                    <div
                      key={fac.facilityUuid}
                      className="p-5 rounded-[24px] border bg-card relative overflow-hidden flex flex-col justify-between shadow-lg space-y-3 hover:border-purple-500/40 transition-all group"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {fac.sports?.[0]?.sportName || fac.facilityType}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">● {fac.status || 'Active'}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                          {fac.name}
                        </h3>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          {fac.surfaceType || 'Synthetic'} surface • {fac.facilityType}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}>
                        <span className="text-foreground/60 font-semibold">Base Slot Rate</span>
                        <span className="font-mono font-black text-primary">₹{fac.pricingRules?.[0]?.price ?? 500}/hr</span>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--athlon-border)' }}>
                        <Link href={`/org/${org.id}/venue/pricing`} className="text-[11px] font-bold text-foreground/60 hover:text-primary transition-colors">
                          Pricing Rules &rarr;
                        </Link>
                        <Link href={`/org/${org.id}/venue/calendar`} className="text-[11px] font-black text-primary hover:underline">
                          View Calendar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : org.type === 'ACADEMY' ? (
            <>
              {/* Today's Training Sessions Track */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Today's Scheduled Coaching Sessions</h2>
                      <p className="text-xs text-foreground/50">
                        {loadingMetrics ? 'Loading sessions...' : `${academyDashboard?.upcomingBatches?.length ?? 0} ${(academyDashboard?.upcomingBatches?.length ?? 0) === 1 ? 'Batch' : 'Batches'} active today • Real-time student check-in`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollTrack(sessionsTrackRef, 'left')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack(sessionsTrackRef, 'right')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingMetrics ? (
                  <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="snap-start shrink-0 w-[360px] h-[260px] rounded-[28px] border bg-card/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                    ))}
                  </div>
                ) : (academyDashboard?.upcomingBatches && academyDashboard.upcomingBatches.length > 0) ? (
                  <div
                    ref={sessionsTrackRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {academyDashboard.upcomingBatches.map((batch) => (
                      <div key={batch.batchUuid} className="snap-start shrink-0 w-[360px]">
                        <div
                          className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-primary/40 transition-all group"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-blue-500 absolute top-0 left-0 right-0" />

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                                {batch.level || 'COACHING'}
                              </span>
                              <span className="text-xs text-foreground/50 font-bold">{batch.sportType || 'Badminton'}</span>
                            </div>

                            <div>
                              <h3 className="text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                                {batch.batchName}
                              </h3>
                              <p className="text-xs text-foreground/50 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{batch.startTime?.substring(0, 5)} - {batch.endTime?.substring(0, 5)} {batch.daysOfWeek ? `(${batch.daysOfWeek})` : ''}</span>
                              </p>
                            </div>

                            <div
                              className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-center"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                            >
                              <div>
                                <span className="text-[9px] uppercase font-bold text-foreground/40 block">Enrolled</span>
                                <span className="text-sm font-black text-foreground font-mono">
                                  {batch.enrolledCount ?? 0} / {batch.maxCapacity ?? 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-foreground/40 block">Coach</span>
                                <span className="text-sm font-black text-primary truncate block">
                                  {batch.coachName || 'Unassigned'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{batch.courtName || 'Court'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                            <Link
                              href={`/org/${org.id}/attendance`}
                              className="py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Roll Call</span>
                            </Link>

                            <Link
                              href={`/org/${org.id}/batches`}
                              className="py-2.5 rounded-xl bg-surface border text-foreground/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-white/5 transition-all text-center"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <span>Batch Info</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="p-8 rounded-[28px] border text-center space-y-2 max-w-xl"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Calendar className="w-8 h-8 text-foreground/30 mx-auto" />
                    <h3 className="text-sm font-bold text-foreground/80">No coaching sessions scheduled today</h3>
                    <p className="text-xs text-foreground/50">Configure your batch roster, timings, and court allocations.</p>
                    <Link href={`/org/${org.id}/batches`} className="text-xs font-bold text-primary hover:underline inline-block pt-1">
                      Manage Batches &rarr;
                    </Link>
                  </div>
                )}
              </section>

              {/* Campus Centres & Arenas Track */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-purple-400" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Academy Campuses &amp; Training Arenas</h2>
                      <p className="text-xs text-foreground/50">
                        {loadingMetrics ? 'Loading campuses...' : `${academyDashboard?.centres?.length ?? 0} Campus ${(academyDashboard?.centres?.length ?? 0) === 1 ? 'location' : 'locations'} • Multi-court sports infrastructure`}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/org/${org.id}/centres`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Manage Campuses</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loadingMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-6 rounded-[28px] border bg-card/50 h-[220px] animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                    ))}
                  </div>
                ) : (academyDashboard?.centres && academyDashboard.centres.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {academyDashboard.centres.map((centre) => (
                      <div
                        key={centre.centreUuid}
                        className="p-6 rounded-[28px] border bg-card space-y-4 shadow-xl hover:border-purple-500/40 transition-all group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-primary shrink-0 shadow-md">
                              <Building className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-foreground group-hover:text-purple-400 transition-colors">
                                {centre.name}
                              </h3>
                              <p className="text-xs text-foreground/50 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{centre.city || 'Campus'}{centre.operatingHours ? ` • ${centre.operatingHours}` : ''}</span>
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            {centre.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div
                          className="grid grid-cols-3 gap-2 p-3 rounded-2xl border text-center"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Courts / Units</span>
                            <span className="text-sm font-black text-foreground font-mono">{centre.facilitiesCount ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Active Batches</span>
                            <span className="text-sm font-black text-foreground font-mono">{centre.activeBatchesCount ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Students</span>
                            <span className="text-sm font-black text-primary font-mono">{centre.activeStudentsCount ?? 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                          <span className="text-xs text-foreground/50 truncate">
                            Sports: <span className="text-foreground font-semibold">{centre.sportsAvailable || 'Badminton'}</span>
                          </span>

                          <Link
                            href={`/org/${org.id}/facilities?centreUuid=${centre.centreUuid}`}
                            className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
                          >
                            <span>Courts</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="p-8 rounded-[28px] border text-center space-y-2 max-w-xl"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Building className="w-8 h-8 text-foreground/30 mx-auto" />
                    <h3 className="text-sm font-bold text-foreground/80">No campus locations registered</h3>
                    <p className="text-xs text-foreground/50">Add sports campuses, training arenas, and courts.</p>
                    <Link href={`/org/${org.id}/centres`} className="text-xs font-bold text-primary hover:underline inline-block pt-1">
                      Add Campus Centre &rarr;
                    </Link>
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              {/* COACH SPECIFIC DESKTOP SECTIONS */}
              {org.type === 'COACH' && (
                <>
                  {/* 1. Today's Coaching Schedule Track */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <div>
                          <h2 className="text-lg font-black text-foreground">Today's Coaching Schedule &amp; Training Slots</h2>
                          <p className="text-xs text-foreground/50">
                            Personal 1-on-1, small squads, and tactical sparring sessions scheduled for today
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/org/${org.id}/batches`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>View Full Schedule &amp; Calendar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {coachSchedules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coachSchedules.map((session, sIdx) => (
                          <CoachScheduleCard
                            key={`desk-${session.sessionUuid || (session as any).id || sIdx}`}
                            session={session}
                            orgId={org.id}
                            onCheckIn={handleCheckInSession}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="p-8 rounded-[28px] border text-center space-y-2"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <CalendarDays className="w-8 h-8 text-foreground/30 mx-auto" />
                        <h3 className="text-sm font-bold text-foreground/80">No coaching slots scheduled for today</h3>
                        <p className="text-xs text-foreground/50">Add time slots, client focus areas, and court venues.</p>
                        <Link
                          href={`/org/${org.id}/batches`}
                          className="text-xs font-bold text-primary hover:underline inline-block pt-1"
                        >
                          + Create Coaching Slot &rarr;
                        </Link>
                      </div>
                    )}
                  </section>

                  {/* 2. Enrolled Trainees & Active Clients Track */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <h2 className="text-lg font-black text-foreground">Enrolled Trainees &amp; Client Roster</h2>
                          <p className="text-xs text-foreground/50">
                            Active personal training clients, package assignments, and fee renewal status
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/org/${org.id}/students`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Manage Trainees Roster</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {coachTrainees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {coachTrainees.map((trainee, tIdx) => (
                          <CoachTraineeCard
                            key={`desk-trainee-${trainee.traineeUuid || (trainee as any).id || tIdx}`}
                            trainee={trainee}
                            orgId={org.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="p-8 rounded-[28px] border text-center space-y-2"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <Users className="w-8 h-8 text-foreground/30 mx-auto" />
                        <h3 className="text-sm font-bold text-foreground/80">No trainees enrolled yet</h3>
                        <p className="text-xs text-foreground/50">Enroll personal training students, allocate packages, and track skill levels.</p>
                        <Link
                          href={`/org/${org.id}/students`}
                          className="text-xs font-bold text-primary hover:underline inline-block pt-1"
                        >
                          + Enroll New Trainee &rarr;
                        </Link>
                      </div>
                    )}
                  </section>

                  {/* 3. Coach Credentials & Experience Showcase Card */}
                  <section className="space-y-4">
                    <CoachCredentialsCard coachProfile={coachProfile} orgId={org.id} />
                  </section>
                </>
              )}

              {/* 1. All-Time Leaderboard Track / Podium Section for Club */}
              {org.type === 'CLUB' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">Club Leaderboard • All-Time Top 3</h2>
                        <p className="text-xs text-foreground/50">
                          {loadingMetrics
                            ? 'Calculating standings...'
                            : `${allTimeLeaderboard.length} athletes ranked • Computed from official club match records`}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/org/${org.id}/leaderboard`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Full Club Ladder</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <ClubLeaderboardPodiumCard
                    topThree={allTimeTopThree}
                    orgId={org.id}
                    loading={loadingMetrics}
                  />
                </section>
              )}

              {/* 2. Low Stock Inventory Track for Club */}
              {org.type === 'CLUB' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">Low Stock Inventory &amp; Supplies Radar</h2>
                        <p className="text-xs text-foreground/50">
                          {loadingMetrics
                            ? 'Loading supplies...'
                            : `${lowStockItems.length} ${lowStockItems.length === 1 ? 'item requires' : 'items require'} restock attention • Fast consumption counters`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/org/${org.id}/inventory`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Manage All Inventory</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => scrollTrack(inventoryTrackRef, 'left')}
                          className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                          style={{ borderColor: 'var(--athlon-border)' }}
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollTrack(inventoryTrackRef, 'right')}
                          className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                          style={{ borderColor: 'var(--athlon-border)' }}
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {loadingMetrics ? (
                    <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8">
                      {[1, 2].map((i) => (
                        <div key={i} className="snap-start shrink-0 w-[360px] h-[220px] rounded-[28px] border bg-card/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                      ))}
                    </div>
                  ) : lowStockItems.length > 0 ? (
                    <div
                      ref={inventoryTrackRef}
                      className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                    >
                      {lowStockItems.map((item) => (
                        <div key={`desk-${item.itemUuid}`} className="snap-start shrink-0 w-[320px]">
                          <ClubInventoryAlertCard
                            item={item}
                            orgId={org.id}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="p-8 rounded-[28px] border text-center space-y-2 max-w-xl"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Package className="w-8 h-8 text-emerald-500 mx-auto" />
                      <h3 className="text-sm font-bold text-foreground/80">All supplies adequately stocked</h3>
                      <p className="text-xs text-foreground/50">Shuttles, tubes, balls, and equipment are ready for club play.</p>
                      <Link href={`/org/${org.id}/inventory`} className="text-xs font-bold text-primary hover:underline inline-block pt-1">
                        Manage Supplies Catalog &rarr;
                      </Link>
                    </div>
                  )}
                </section>
              )}

              {/* 2. Active Tournaments & Championships (Horizontal Scroll) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">
                        {org.type === 'CLUB' ? 'Club Tournaments & Draws' : 'Active Tournaments & Leagues'}
                      </h2>
                      <p className="text-xs text-foreground/50">
                        {org.type === 'CLUB'
                          ? 'Internal member tournaments, friendly knockouts, and scorecards'
                          : 'Manage draws, schedules, umpire allocations, and results'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollTrack(eventsTrackRef, 'left')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack(eventsTrackRef, 'right')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={eventsTrackRef}
                  className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                >
                  {orgTournaments.map((tournament) => (
                    <div key={tournament.id} className="snap-start shrink-0 w-[360px]">
                      <div
                        className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-yellow-500/40 transition-all group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-primary absolute top-0 left-0 right-0" />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                              {tournament.type}
                            </span>
                            <span className="text-xs text-foreground/50 font-bold">{tournament.sport}</span>
                          </div>

                          <h3 className="text-base font-black text-foreground truncate group-hover:text-yellow-400 transition-colors">
                            {tournament.title}
                          </h3>

                          <div
                            className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div>
                              <span className="text-[9px] uppercase font-bold text-foreground/40 block">Teams / Entrants</span>
                              <span className="text-sm font-black text-foreground font-mono">{tournament.teams}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-foreground/40 block">Total Fixtures</span>
                              <span className="text-sm font-black text-primary font-mono">{tournament.matches}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{tournament.venue}</span>
                          </div>
                        </div>

                        <Link
                          href={`/org/${org.id}/tournaments`}
                          className="w-full py-2.5 rounded-xl bg-surface border border-yellow-500/30 text-yellow-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-yellow-500/10 transition-all"
                        >
                          <span>Manage Event</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Courtside Live Scoring & Streams Track (Horizontal Scroll) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Courtside Live Stream &amp; Scoring Console</h2>
                      <p className="text-xs text-foreground/50">Real-time point-by-point umpire radar and stream broadcast links</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollTrack(liveTrackRef, 'left')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack(liveTrackRef, 'right')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={liveTrackRef}
                  className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                >
                  {liveCourts.map((court) => (
                    <div key={court.id} className="snap-start shrink-0 w-[360px]">
                      <div
                        className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-red-500/40 transition-all group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="h-1 w-full bg-red-500 animate-pulse absolute top-0 left-0 right-0" />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <Radio className="w-3 h-3 text-red-500 animate-pulse" /> {court.court}
                            </span>
                            <span className="text-xs text-foreground/50 font-bold">{court.status}</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-foreground/40 block truncate">
                              {court.tournament}
                            </span>
                            <h3 className="text-sm font-black text-foreground truncate mt-0.5">{court.match}</h3>
                          </div>

                          <div
                            className="p-3 rounded-2xl border flex items-center justify-between text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="text-[10px] font-extrabold uppercase text-foreground/50">Current Score</span>
                            <span className="text-base font-black text-red-400 font-mono">{court.score}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                          <Link
                            href={`/org/${org.id}/match-setup`}
                            className="py-2.5 rounded-xl bg-surface border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-red-500/10 transition-all text-center"
                          >
                            <Play className="w-3.5 h-3.5" /> <span>Umpire</span>
                          </Link>

                          <Link
                            href={`/org/${org.id}/livestream`}
                            className="py-2.5 rounded-xl bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25 hover:bg-red-600 transition-all text-center"
                          >
                            <Video className="w-3.5 h-3.5" /> <span>Broadcast</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Quick Log Usage Modal */}
      {selectedItemForUsage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-[28px] border p-6 shadow-2xl space-y-5 relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black">
                  🏸
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Log Usage</h3>
                  <p className="text-xs text-foreground/50">
                    {selectedItemForUsage.itemName} ({selectedItemForUsage.quantity} {selectedItemForUsage.unit || 'Pieces'} available)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForUsage(null)}
                className="p-1.5 rounded-full text-foreground/40 hover:text-foreground hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                  Quantity Consumed ({selectedItemForUsage.unit || 'Pieces'})
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUsageAmount(amt.toString())}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${usageAmount === amt.toString()
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                        : 'bg-surface border-foreground/10 text-foreground/70 hover:text-foreground'
                        }`}
                    >
                      {amt}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForUsage.quantity}
                    value={usageAmount}
                    onChange={(e) => setUsageAmount(e.target.value)}
                    className="w-16 px-3 py-2 rounded-xl bg-surface border border-foreground/10 text-xs font-black text-center text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {members.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                    Issued to / Member (Optional)
                  </label>
                  <select
                    value={usageMemberUuid}
                    onChange={(e) => setUsageMemberUuid(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-foreground/10 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Club Member...</option>
                    {members.map((m: any) => (
                      <option key={m.memberUuid || m.userUuid || m.id} value={m.memberUuid || m.userUuid || m.id}>
                        {m.name || m.user?.name || m.user?.displayName || 'Member'} ({m.role || 'MEMBER'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                  Match / Session Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Court 1 Evening Match Play"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-foreground/10 text-xs font-bold text-foreground focus:outline-none focus:border-primary placeholder:text-foreground/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForUsage(null)}
                className="flex-1 py-2.5 rounded-xl border border-foreground/10 text-foreground/70 font-bold text-xs hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUsageSubmitting || !usageAmount || parseInt(usageAmount, 10) <= 0}
                onClick={handleLogUsageSubmit}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-40"
              >
                {isUsageSubmitting ? 'Logging...' : 'Confirm Usage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-foreground text-background font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
