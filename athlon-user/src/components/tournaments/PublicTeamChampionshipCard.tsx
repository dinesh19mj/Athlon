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
  Sparkles,
  Flame,
  Award,
  LogIn,
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
      const sStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const eStr = e && !isNaN(e.getTime()) ? e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return eStr && eStr !== sStr ? `${sStr} – ${eStr}` : sStr;
    } catch {
      return 'Dates TBA';
    }
  };

  const getStageBadge = () => {
    const stage = championship.stage || 'REGISTRATION_OPEN';
    switch (stage) {
      case 'REGISTRATION_OPEN':
        return { label: 'Registration Open', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
      case 'AUCTION_STAGE':
        return { label: 'Auction Live', class: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
      case 'LEAGUE_STAGE':
        return { label: 'League Stage', class: 'bg-primary/15 text-primary border-primary/25' };
      case 'KNOCKOUT_STAGE':
        return { label: 'Knockouts', class: 'bg-purple-500/15 text-purple-400 border-purple-500/25' };
      case 'COMPLETED':
        return { label: 'Completed', class: 'bg-foreground/10 text-foreground/70 border-foreground/20' };
      default:
        return { label: stage.replace('_', ' '), class: 'bg-primary/10 text-primary border-primary/20' };
    }
  };

  const stageBadge = getStageBadge();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const posterUrl = championship.posterUrl
    ? championship.posterUrl.startsWith('http') || championship.posterUrl.startsWith('data:')
      ? championship.posterUrl
      : `${baseUrl}/api/tournament/team-championship/getFile?filePath=${encodeURIComponent(championship.posterUrl)}`
    : null;

  const targetHref = hrefPrefix
    ? `${hrefPrefix}/${championship.championshipUuid}`
    : `/home/team-championship/${championship.championshipUuid}`;

  const isRegistrationOpen = (championship.stage || 'REGISTRATION_OPEN') === 'REGISTRATION_OPEN';

  return (
    <div className="group block h-full select-none">
      <div
        className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.01] group-hover:border-primary/50"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Top Gradient Accent Line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />

        {/* Poster or Gradient Header */}
        <Link href={targetHref} className="block relative">
          {posterUrl ? (
            <div className="w-full h-36 relative bg-black/40 overflow-hidden border-b border-white/[0.08]">
              <img
                src={posterUrl}
                alt={championship.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/30" />

              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider backdrop-blur-md border ${stageBadge.class}`}>
                  {stageBadge.label}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-black tracking-tight text-primary bg-black/60 backdrop-blur-md border border-primary/30">
                  {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}/Team` : 'FREE'}
                </span>
              </div>

              <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-primary/30 backdrop-blur-md border border-primary/40 text-primary text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Team Championship
                </span>
              </div>
            </div>
          ) : null}
        </Link>

        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          {!posterUrl && (
            <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Shield className="w-2.5 h-2.5" />
                  {championship.sport} Championship
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border shrink-0 ${stageBadge.class}`}>
                  {stageBadge.label}
                </span>
              </div>

              <span className="text-[10px] font-black text-primary font-mono shrink-0">
                {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}/Team` : 'FREE'}
              </span>
            </div>
          )}

          {/* Title and location */}
          <Link href={targetHref} className="block">
            <div className="space-y-1">
              <h3
                className="font-black text-sm text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors"
                title={championship.name}
              >
                {championship.name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/45 truncate mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{championship.location || 'Venue TBA'}</span>
              </div>
            </div>
          </Link>

          {/* Details Bar: Dates, Teams Quota & Auction Mode */}
          <div
            className="rounded-xl p-2.5 border space-y-2 text-[11px]"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-foreground/80 font-bold text-[10.5px] min-w-0">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{formatDates()}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-foreground/60">
                <Users className="w-3 h-3 text-foreground/40 shrink-0" />
                <span className="text-[9.5px] font-bold">
                  {championship.maxTeams} Teams Max
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-foreground/5 text-[9.5px]">
              <div className="flex items-center gap-1 text-primary font-bold truncate">
                <Gavel className="w-3 h-3 shrink-0" />
                <span className="truncate">{championship.auctionMode?.replace('_', ' ')}</span>
              </div>

              {championship.categories && championship.categories.length > 0 && (
                <div className="flex items-center gap-1 text-foreground/50 font-bold shrink-0">
                  <Award className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{championship.categories.length} Tiers</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Register Team & Register Player or Login to Register */}
          {isRegistrationOpen ? (
            isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={`/home/team-championship/${championship.championshipUuid}/register-team`}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-primary text-black font-extrabold text-[11px] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Users className="w-3 h-3" />
                  <span>Register Team</span>
                </Link>

                <Link
                  href={`/home/team-championship/${championship.championshipUuid}/register-player`}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl border text-[11px] font-bold hover:bg-foreground/5 transition-all text-foreground/90"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <UserPlus className="w-3 h-3 text-primary" />
                  <span>Join Pool</span>
                </Link>
              </div>
            ) : (
              <Link
                href={`/login?redirect=/home/team-championship/${championship.championshipUuid}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-black font-black text-xs shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login to Register</span>
              </Link>
            )
          ) : (
            <Link
              href={targetHref}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-foreground/10 text-foreground font-bold text-xs hover:bg-foreground/15 transition-all"
            >
              <span>View Championship</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
