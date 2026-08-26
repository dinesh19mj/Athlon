import Link from 'next/link';
import {
  Shield,
  Trophy,
  Calendar,
  MapPin,
  Users,
  UserPlus,
  Gavel,
  ChevronRight,
  Award,
  LogIn,
  Layers,
  Sparkles,
  Clock,
} from 'lucide-react';
import { TeamChampionship } from '@/lib/api/teamChampionship';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface PublicTeamChampionshipCardProps {
  championship: TeamChampionship;
  hrefPrefix?: string;
}

export function PublicTeamChampionshipCard({
  championship,
  hrefPrefix,
}: PublicTeamChampionshipCardProps) {
  const { isAuthenticated } = useAuthStore();

  const formatDates = () => {
    try {
      if (!championship.startDate) return 'Dates TBA';
      const s = new Date(championship.startDate);
      const e = championship.endDate ? new Date(championship.endDate) : null;
      if (isNaN(s.getTime())) return 'Dates TBA';

      // If no end date or start and end fall on the exact same calendar day, display only one date
      if (!e || isNaN(e.getTime()) || s.toDateString() === e.toDateString()) {
        return s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }

      const sStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const eStr = e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${sStr} – ${eStr}`;
    } catch {
      return 'Dates TBA';
    }
  };

  const formatClosingDate = () => {
    if (!championship.registrationClosingDate) return null;
    try {
      const c = new Date(championship.registrationClosingDate);
      if (isNaN(c.getTime())) return null;
      return c.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  const closingDate = formatClosingDate();

  const getStageBadge = () => {
    const stage = championship.stage || 'REGISTRATION_OPEN';
    switch (stage) {
      case 'REGISTRATION_OPEN':
        return {
          label: 'Registration Open',
          class: 'bg-primary/15 text-primary border-primary/30',
        };
      case 'AUCTION_STAGE':
        return {
          label: 'Auction Live',
          class: 'bg-primary/10 text-primary border-primary/25',
        };
      case 'LEAGUE_STAGE':
        return {
          label: 'League Stage',
          class: 'bg-primary/15 text-primary border-primary/30',
        };
      case 'KNOCKOUT_STAGE':
        return {
          label: 'Knockouts',
          class: 'bg-primary/15 text-primary border-primary/30',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          class: 'bg-foreground/10 text-foreground/70 border-foreground/20',
        };
      default:
        return {
          label: stage.replace('_', ' '),
          class: 'bg-primary/10 text-primary border-primary/20',
        };
    }
  };

  const stageBadge = getStageBadge();

  const targetHref = hrefPrefix
    ? `${hrefPrefix}/${championship.championshipUuid}`
    : `/home/team-championship/${championship.championshipUuid}`;

  const isRegistrationOpen = (championship.stage || 'REGISTRATION_OPEN') === 'REGISTRATION_OPEN';

  return (
    <div className="group block h-full select-none">
      <div
        className="relative rounded-[24px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.01] group-hover:border-primary/50"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Top Theme Primary Accent Line */}
        <div className="h-[3px] w-full bg-primary" />

        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          {/* Top Badges Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 shadow-sm">
                  <Shield className="w-3 h-3" />
                  {championship.sport || 'Sports'} League
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider border shadow-sm ${stageBadge.class}`}
                >
                  {stageBadge.label}
                </span>
              </div>

              <span className="text-xs font-black text-primary font-mono shrink-0 px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}/Team` : 'FREE ENTRY'}
              </span>
            </div>

            {/* Title & Venue */}
            <Link href={targetHref} className="block group-hover:opacity-95 transition-opacity">
              <div className="space-y-1">
                <h3
                  className="font-black text-base text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors"
                  title={championship.name}
                >
                  {championship.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50 truncate">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{championship.location || championship.venue || 'Venue TBA'}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Details Bar: Dates, Teams Quota, Closing Date & Auction Mode */}
          <div
            className="rounded-2xl p-3 border space-y-2.5 text-xs shadow-inner"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-foreground/80 font-bold min-w-0">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{formatDates()}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-foreground/70">
                <Users className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                <span className="font-bold">
                  {championship.maxTeams || 6} Teams Max
                </span>
              </div>
            </div>

            {/* Registration Closing Date Notice */}
            {closingDate && isRegistrationOpen && (
              <div className="flex items-center justify-between gap-2 text-[10.5px] bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Registration Closes</span>
                </div>
                <span className="font-black text-primary font-mono tabular-nums">
                  {closingDate}
                </span>
              </div>
            )}

            <div
              className="flex items-center justify-between gap-2 pt-2 border-t text-[11px]"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-1.5 text-primary font-bold truncate">
                <Gavel className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{championship.auctionMode?.replace('_', ' ') || 'Auction'}</span>
              </div>

              {championship.categories && championship.categories.length > 0 && (
                <div className="flex items-center gap-1 text-foreground/60 font-bold shrink-0">
                  <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{championship.categories.length} Tiers</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Register Team & Register Player or Login */}
          {isRegistrationOpen ? (
            isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={`/home/team-championship/${championship.championshipUuid}/register-team`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Register Team</span>
                </Link>

                <Link
                  href={`/home/team-championship/${championship.championshipUuid}/register-player`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold hover:bg-foreground/5 transition-all text-foreground/90"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5 text-primary" />
                  <span>Join Pool</span>
                </Link>
              </div>
            ) : (
              <Link
                href={`/login?redirect=/home/team-championship/${championship.championshipUuid}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Register</span>
              </Link>
            )
          ) : (
            <Link
              href={targetHref}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-foreground font-bold text-xs hover:bg-white/5 transition-all"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <span>View Championship Details</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
