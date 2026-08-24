import Link from 'next/link';
import { Trophy as TrophyIcon, CalendarIcon, MapPinIcon, TicketIcon, UsersIcon, ActivityIcon, ChevronRight, Sparkles, Lock as LockIcon } from 'lucide-react';
import { Tournament } from '@/lib/api/tournaments';

interface PublicTournamentCardProps {
  tournament: Tournament;
}

export function PublicTournamentCard({ tournament }: PublicTournamentCardProps) {
  const formatDates = () => {
    try {
      const s = new Date(tournament.startDate);
      const e = new Date(tournament.endDate);
      if (isNaN(s.getTime())) return 'Dates TBA';
      const sStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const eStr = !isNaN(e.getTime()) ? e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return eStr ? `${sStr} - ${eStr}` : sStr;
    } catch {
      return 'Dates TBA';
    }
  };

  const categories = tournament.category ? tournament.category.split(',').map(c => c.trim()).filter(Boolean) : [];
  const formats = tournament.matchFormat ? tournament.matchFormat.split(',').map(f => f.trim()).filter(Boolean) : [];
  const isTeamEvent = tournament.tournamentType === 'TEAM_EVENT';

  return (
    <div
      className="group relative rounded-[22px] overflow-hidden shadow-xl transition-all duration-300 h-full w-full flex flex-col justify-between hover:scale-[1.01]"
      style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
    >
      {/* Card Surface - Deep Dark Neutral */}
      <div
        className="relative rounded-[22px] p-5 h-full flex flex-col justify-between border transition-colors"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Subtle Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(90deg, transparent, var(--athlon-primary), transparent)' }}
        />

        <div>
          {/* Top Row: Sport Badge + Format & Price Tag */}
          <div className="flex items-center justify-between gap-2 mb-3.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: 'var(--athlon-primary)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                {tournament.sport || 'Badminton'}
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: 'var(--athlon-text-muted)',
                  border: '1px solid var(--athlon-border-subtle)',
                }}
              >
                <ActivityIcon className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                {isTeamEvent ? 'Team League' : 'Knockout'}
              </span>
              {tournament.status === 'COMPLETED' || tournament.status === 'FINISHED' ? (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <TrophyIcon className="w-2.5 h-2.5" /> Finished
                </span>
              ) : tournament.status === 'REGISTRATION_CLOSED' ? (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                  Closed
                </span>
              ) : null}
            </div>

            {/* Fee Pill */}
            <div className="shrink-0">
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: 'var(--athlon-primary)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <TicketIcon className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
              </span>
            </div>
          </div>

          {/* Tournament Title */}
          <h3
            className="text-base font-black line-clamp-2 leading-snug tracking-tight mb-4 transition-colors group-hover:text-primary"
            style={{ color: 'var(--athlon-text)' }}
            title={tournament.name}
          >
            {tournament.name}
          </h3>

          {/* Info Bento Grid - Dark Surface */}
          <div
            className="space-y-2 mb-4 p-3 rounded-xl"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              border: '1px solid var(--athlon-border-subtle)',
            }}
          >
            {/* Dates */}
            <div className="flex items-center gap-2.5 text-xs font-semibold" style={{ color: 'var(--athlon-text-secondary)' }}>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--athlon-border-subtle)',
                }}
              >
                <CalendarIcon className="w-3.5 h-3.5" style={{ color: 'var(--athlon-primary)' }} />
              </div>
              <span className="truncate">{formatDates()}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 text-xs font-semibold" style={{ color: 'var(--athlon-text-secondary)' }}>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--athlon-border-subtle)',
                }}
              >
                <MapPinIcon className="w-3.5 h-3.5" style={{ color: 'var(--athlon-primary)' }} />
              </div>
              <span className="truncate" title={tournament.location || 'Venue TBA'}>
                {tournament.location || 'Venue TBA'}
              </span>
            </div>
          </div>

          {/* Categories & Match Formats Pills */}
          {(categories.length > 0 || formats.length > 0) && (
            <div className="pt-2 space-y-2" style={{ borderTop: '1px solid var(--athlon-border-subtle)' }}>
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <TrophyIcon className="w-3 h-3 shrink-0" style={{ color: 'var(--athlon-primary)' }} />
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((cat, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md truncate max-w-[130px]"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--athlon-border-subtle)',
                          color: 'var(--athlon-text-secondary)',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    {categories.length > 3 && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--athlon-text-muted)' }}
                      >
                        +{categories.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {formats.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <UsersIcon className="w-3 h-3 shrink-0" style={{ color: 'var(--athlon-primary)' }} />
                  <div className="flex flex-wrap gap-1">
                    {formats.slice(0, 2).map((fmt, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--athlon-border-subtle)',
                          color: 'var(--athlon-text-muted)',
                        }}
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3.5" style={{ borderTop: '1px solid var(--athlon-border-subtle)' }}>
          {tournament.status === 'COMPLETED' || tournament.status === 'FINISHED' ? (
            <Link
              href={`/home/tournaments/${tournament.tournamentUuid}`}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98] hover:opacity-90"
              style={{
                backgroundColor: 'var(--athlon-primary-soft, rgba(84,172,104,0.12))',
                border: '1px solid var(--athlon-primary, #54AC68)',
                color: 'var(--athlon-primary, #54AC68)',
              }}
            >
              <TrophyIcon className="w-3.5 h-3.5 shrink-0" />
              <span>View Results &amp; Podium</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover/btn:translate-x-1 transition-transform opacity-60" />
            </Link>
          ) : tournament.status === 'REGISTRATION_CLOSED' ? (
            <Link
              href={`/home/tournaments/${tournament.tournamentUuid}`}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98] hover:opacity-90"
              style={{
                backgroundColor: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'rgb(248,113,113)',
              }}
            >
              <LockIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Registration Closed</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover/btn:translate-x-1 transition-transform opacity-60" />
            </Link>
          ) : (
            <Link
              href={`/home/tournaments/${tournament.tournamentUuid}`}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98] hover:opacity-90"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground)',
                boxShadow: '0 4px 20px var(--athlon-glow)',
              }}
            >
              <span>View &amp; Register</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
