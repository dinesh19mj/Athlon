import Link from 'next/link';
import { TrophyIcon, CalendarIcon, MapPinIcon, TicketIcon, UsersIcon, ActivityIcon } from 'lucide-react';
import { Tournament } from '@/lib/api/tournaments';

interface PublicTournamentCardProps {
  tournament: Tournament;
}

export function PublicTournamentCard({ tournament }: PublicTournamentCardProps) {
  const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endDate = new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="bg-surface border border-foreground/10 rounded-2xl p-5 hover:border-[#1B9C56]/50 transition-colors shadow-lg flex flex-col justify-between h-full min-w-[300px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
            {tournament.sport}
          </span>
          <span className="text-xs font-semibold text-foreground/60 flex items-center gap-1">
            <ActivityIcon className="w-3.5 h-3.5" />
            {tournament.tournamentType === 'TEAM_EVENT' ? 'Team League' : 'Knockout'}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2" title={tournament.name}>
          {tournament.name}
        </h3>

        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-sm text-foreground/80">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{startDate} - {endDate}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-foreground/80">
            <MapPinIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate" title={tournament.location}>{tournament.location || 'TBD'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-foreground/80">
            <TicketIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate font-semibold">
              {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}
            </span>
          </div>
        </div>

        {/* Categories & Formats */}
        <div className="border-t border-foreground/5 pt-4 space-y-3">
          {tournament.category && (
            <div className="flex items-start gap-2 text-sm text-foreground/80">
              <TrophyIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {tournament.category.split(',').map((cat, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-background rounded-md border border-border text-foreground/80">
                    {cat.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tournament.matchFormat && (
            <div className="flex items-start gap-2 text-sm text-foreground/80">
              <UsersIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {tournament.matchFormat.split(',').map((format, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-background rounded-md border border-border text-foreground/80">
                    {format.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-foreground/5">
        <Link 
          href={`/tournaments/${tournament.tournamentUuid}`}
          className="w-full flex items-center justify-center py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-black transition-colors"
        >
          View & Register
        </Link>
      </div>
    </div>
  );
}
