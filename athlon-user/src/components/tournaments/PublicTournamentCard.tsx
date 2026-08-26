import Link from 'next/link';
import {
  Trophy,
  Calendar,
  MapPin,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle2,
  Lock,
  Clock,
} from 'lucide-react';
import { Tournament } from '@/lib/api/tournaments';

interface PublicTournamentCardProps {
  tournament: Tournament;
  hrefPrefix?: string;
}

export function PublicTournamentCard({ tournament, hrefPrefix }: PublicTournamentCardProps) {
  const formatDates = () => {
    try {
      const s = new Date(tournament.startDate);
      const e = new Date(tournament.endDate);
      if (isNaN(s.getTime())) return 'Dates TBA';
      const sStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const eStr = !isNaN(e.getTime()) ? e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return eStr && eStr !== sStr ? `${sStr} – ${eStr}` : sStr;
    } catch {
      return 'Dates TBA';
    }
  };

  const formatClosingDate = () => {
    if (!tournament.registrationClosingDate) return null;
    try {
      const c = new Date(tournament.registrationClosingDate);
      if (isNaN(c.getTime())) return null;
      return c.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  const closingDate = formatClosingDate();
  const categories = tournament.category
    ? tournament.category.split(',').map((c) => c.trim()).filter(Boolean)
    : [];
  const formats = tournament.matchFormat
    ? tournament.matchFormat.split(',').map((f) => f.trim()).filter(Boolean)
    : [];
  const isTeamEvent = tournament.tournamentType === 'TEAM_EVENT';
  const isFinished = tournament.status === 'COMPLETED' || tournament.status === 'FINISHED';
  const isClosed = tournament.status === 'REGISTRATION_CLOSED';

  const href = hrefPrefix
    ? `${hrefPrefix}/${tournament.tournamentUuid || tournament.tournamentId}`
    : `/home/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`;

  return (
    <Link
      href={href}
      className="group block h-full select-none"
    >
      <div
        className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.015] group-hover:border-primary/50"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Top Gradient Accent Line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          {/* Header Row: Badges & Fee */}
          <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {/* Sport Pill */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                {tournament.sport || 'Badminton'}
              </span>

              {/* Tournament Format Pill */}
              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/70 shrink-0">
                {isTeamEvent ? 'Team League' : 'Knockout'}
              </span>

              {/* Status Badge (if special) */}
              {isFinished ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Finished
                </span>
              ) : isClosed ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 shrink-0">
                  <Lock className="w-2.5 h-2.5" /> Closed
                </span>
              ) : null}
            </div>

            {/* Fee Tag */}
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black tracking-tight text-primary bg-primary/10 border border-primary/25 shrink-0">
              {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
            </span>
          </div>

          {/* Tournament Name & Trophy Icon */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-snug"
                title={tournament.name}
              >
                {tournament.name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/45 truncate mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{tournament.location || 'Venue TBA'}</span>
              </div>
            </div>
          </div>

          {/* Bento Detail Bar: Date, Closing Date & Categories */}
          <div
            className="rounded-xl p-2.5 border space-y-2 text-[11px]"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border-subtle)',
            }}
          >
            {/* Dates & Formats */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-foreground/80 font-bold text-[10.5px] min-w-0">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{formatDates()}</span>
              </div>

              {formats.length > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Users className="w-3 h-3 text-foreground/40 shrink-0" />
                  <span className="text-[9px] font-bold text-foreground/60">
                    {formats.slice(0, 2).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Registration Closing Date Notice (if available) */}
            {closingDate && !isFinished && (
              <div className="flex items-center justify-between gap-2 text-[10px] bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Clock className="w-3 h-3 text-primary shrink-0" />
                  <span>Registration Closes</span>
                </div>
                <span className="font-extrabold text-primary tabular-nums">
                  {closingDate}
                </span>
              </div>
            )}

            {/* Categories Chips */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap border-t border-foreground/5 pt-1.5">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground/40 shrink-0">
                  Events:
                </span>
                {categories.slice(0, 3).map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-background border border-foreground/10 text-foreground/75 font-semibold text-[8.5px] truncate max-w-[90px]"
                  >
                    {cat}
                  </span>
                ))}
                {categories.length > 3 && (
                  <span className="px-1 py-0.2 rounded bg-background text-foreground/40 font-bold text-[8px]">
                    +{categories.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Callout */}
          <div className="flex items-center justify-between pt-1 border-t border-foreground/5 text-xs">
            <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-1">
              {!isFinished && !isClosed && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {isFinished ? 'Finished' : isClosed ? 'Closed' : 'Open Entry'}
            </span>

            <span
              className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${
                isFinished
                  ? 'text-emerald-400'
                  : isClosed
                  ? 'text-red-400'
                  : 'text-primary'
              }`}
            >
              {isFinished
                ? 'Podium & Results'
                : isClosed
                ? 'View Details'
                : 'Register Now'}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
