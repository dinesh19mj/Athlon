import Link from 'next/link';
import { TrophyIcon, CalendarIcon, MapPinIcon, TicketIcon, UsersIcon, ActivityIcon, ChevronRight, Sparkles } from 'lucide-react';
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
    <div className="group relative rounded-[22px] overflow-hidden shadow-xl hover:shadow-[0_12px_36px_rgba(96,29,74,0.18)] transition-all duration-300 h-full w-full flex flex-col justify-between hover:scale-[1.01]">
      {/* Card Surface */}
      <div className="relative bg-surface/90 backdrop-blur-xl rounded-[22px] p-5 h-full flex flex-col justify-between border border-foreground/10 group-hover:border-[#601D4A]/50 transition-colors">
        
        {/* Top Accent Wine Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#601D4A] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

        <div>
          {/* Top Row: Sport Badge + Format & Price Tag */}
          <div className="flex items-center justify-between gap-2 mb-3.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#601D4A]/10 text-[#601D4A] dark:text-[#c46ea8] border border-[#601D4A]/30 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-[#601D4A] dark:text-[#c46ea8]" />
                {tournament.sport || 'Badminton'}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/60 border border-foreground/10 uppercase tracking-wider flex items-center gap-1">
                <ActivityIcon className="w-3 h-3 text-[#601D4A] dark:text-[#c46ea8]" />
                {isTeamEvent ? 'Team League' : 'Knockout'}
              </span>
            </div>

            {/* Fee Pill */}
            <div className="shrink-0">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#601D4A]/10 text-[#601D4A] dark:text-[#c46ea8] border border-[#601D4A]/30 flex items-center gap-1">
                <TicketIcon className="w-3 h-3 text-[#601D4A] dark:text-[#c46ea8]" />
                {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
              </span>
            </div>
          </div>

          {/* Tournament Title */}
          <h3 
            className="text-base font-black text-foreground group-hover:text-[#601D4A] dark:group-hover:text-[#c46ea8] line-clamp-2 leading-snug tracking-tight mb-4 transition-colors"
            title={tournament.name}
          >
            {tournament.name}
          </h3>

          {/* Info Bento Grid */}
          <div className="space-y-2 mb-4 bg-background/80 p-3 rounded-xl border border-foreground/5">
            {/* Dates */}
            <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
              <div className="w-6 h-6 rounded-lg bg-[#601D4A]/10 border border-[#601D4A]/20 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-3.5 h-3.5 text-[#601D4A] dark:text-[#c46ea8]" />
              </div>
              <span className="truncate">{formatDates()}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
              <div className="w-6 h-6 rounded-lg bg-[#601D4A]/10 border border-[#601D4A]/20 flex items-center justify-center shrink-0">
                <MapPinIcon className="w-3.5 h-3.5 text-[#601D4A] dark:text-[#c46ea8]" />
              </div>
              <span className="truncate" title={tournament.location || 'Venue TBA'}>
                {tournament.location || 'Venue TBA'}
              </span>
            </div>
          </div>

          {/* Categories & Match Formats Pills */}
          {(categories.length > 0 || formats.length > 0) && (
            <div className="pt-2 border-t border-foreground/5 space-y-2">
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <TrophyIcon className="w-3 h-3 text-[#601D4A] dark:text-[#c46ea8] shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((cat, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#601D4A]/10 border border-[#601D4A]/20 text-[#601D4A] dark:text-[#c46ea8] truncate max-w-[130px]"
                      >
                        {cat}
                      </span>
                    ))}
                    {categories.length > 3 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground/5 text-foreground/50">
                        +{categories.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {formats.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <UsersIcon className="w-3 h-3 text-[#601D4A] dark:text-[#c46ea8] shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {formats.slice(0, 2).map((fmt, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10 text-foreground/60"
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
        <div className="mt-5 pt-3.5 border-t border-foreground/5">
          <Link 
            href={`/tournaments/${tournament.tournamentUuid}`}
            className="w-full py-3 px-4 rounded-xl bg-[#601D4A] hover:bg-[#4d173b] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#601D4A]/25 transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
          >
            <span>View & Register</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
