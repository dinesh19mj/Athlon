import React, { useMemo } from 'react';
import { Match, Registration } from '@/lib/api/tournaments';
import { UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BracketViewerProps {
  matches: Match[];
  registrations: Registration[];
  tournamentType?: string;
  onMatchClick?: (match: Match) => void;
}

export const BracketViewer: React.FC<BracketViewerProps> = ({ matches, registrations, tournamentType, onMatchClick }) => {
  const router = useRouter();

  // 1. Build adjacency maps
  const { matchMap, childrenMap, rootMatches } = useMemo(() => {
    const map = new Map(matches.map(m => [m.uuid, m]));
    const childMap = new Map<string, Match[]>();
    
    matches.forEach(m => {
      if (m.nextMatchUuid) {
        if (!childMap.has(m.nextMatchUuid)) childMap.set(m.nextMatchUuid, []);
        childMap.get(m.nextMatchUuid)!.push(m);
      }
    });

    const roots = matches.filter(m => !m.nextMatchUuid || !map.has(m.nextMatchUuid));
    return { matchMap: map, childrenMap: childMap, rootMatches: roots };
  }, [matches]);

  if (!matches || matches.length === 0) return null;

  // Helper to render a single match card
  const MatchCard = ({ match }: { match: Match }) => {
    const teamA = registrations.find(r => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid);
    const teamB = registrations.find(r => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid);
    const isLive = match.status === 'LIVE';
    const isCompleted = match.status === 'COMPLETED';

    return (
      <div 
        onClick={() => onMatchClick ? onMatchClick(match) : router.push(`/scoring/${match.uuid}?tournamentType=${tournamentType || ''}`)}
        className="relative bg-surface-elevated border border-border rounded-xl p-3 w-56 shadow-sm shrink-0 flex flex-col justify-center hover:border-primary/50 cursor-pointer transition-colors z-10"
      >
        <div className="flex flex-col gap-1.5">
          {/* Team A */}
          <div className={`flex items-center justify-between gap-2 p-1.5 rounded-lg ${match.winnerRegistrationUuid === teamA?.registrationUuid && isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-transparent'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                <UsersIcon className="w-2.5 h-2.5 text-text-muted" />
              </div>
              <span className={`text-xs truncate ${teamA ? 'font-bold text-foreground' : 'font-medium text-text-muted italic'}`}>
                {teamA ? teamA.teamName : 'TBD'}
              </span>
            </div>
            {match.winnerRegistrationUuid === teamA?.registrationUuid && isCompleted && (
              <span className="text-[10px] font-black text-primary">WIN</span>
            )}
          </div>
          
          <div className="w-full h-px bg-border/50 my-0.5"></div>

          {/* Team B */}
          <div className={`flex items-center justify-between gap-2 p-1.5 rounded-lg ${match.winnerRegistrationUuid === teamB?.registrationUuid && isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-transparent'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                <UsersIcon className="w-2.5 h-2.5 text-text-muted" />
              </div>
              <span className={`text-xs truncate ${teamB ? 'font-bold text-foreground' : 'font-medium text-text-muted italic'}`}>
                {teamB ? teamB.teamName : 'TBD'}
              </span>
            </div>
            {match.winnerRegistrationUuid === teamB?.registrationUuid && isCompleted && (
              <span className="text-[10px] font-black text-primary">WIN</span>
            )}
          </div>
        </div>

        {/* Status */}
        {(match.status === 'LIVE' || match.status === 'COMPLETED') && (
          <div className="absolute -top-2.5 -right-2.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              isLive ? 'bg-live text-white shadow-sm shadow-live/30' : 
              'bg-success text-white shadow-sm shadow-success/30'
            }`}>
              {match.status}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Recursive Bracket Node Component
  const BracketNode = ({ match }: { match: Match }) => {
    const children = childrenMap.get(match.uuid) || [];
    
    // Sort children so they appear consistently (e.g. by match ID or creation time)
    children.sort((a, b) => a.id - b.id);

    if (children.length === 0) {
      return (
        <div className="flex items-center py-4">
          <MatchCard match={match} />
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <div className="flex flex-col justify-around h-full relative pr-8">
          {children.map(child => (
            <BracketNode key={child.uuid} match={child} />
          ))}
          
          {/* Classic Bracket Connectors (The ']' shape) */}
          <div className="absolute right-0 top-[25%] bottom-[25%] w-4 border-r-2 border-t-2 border-b-2 border-border/60 rounded-r-lg"></div>
          {/* Horizontal line feeding into the parent match */}
          <div className="absolute right-[-2rem] top-1/2 w-8 border-b-2 border-border/60"></div>
        </div>
        
        <div className="pl-8 py-4">
          <MatchCard match={match} />
        </div>
      </div>
    );
  };

  // Render League Format
  if (tournamentType === 'LEAGUE' || tournamentType === 'TEAM_EVENT') {
    // Group matches by poolName
    const pools = new Map<string, Match[]>();
    matches.forEach(m => {
      const pName = m.poolName || 'Unassigned Pool';
      if (!pools.has(pName)) pools.set(pName, []);
      pools.get(pName)!.push(m);
    });

    return (
      <div className="w-full bg-background rounded-xl border border-border/50 p-6 shadow-inner" id="bracket-capture-area">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from(pools.entries()).map(([poolName, poolMatches]) => (
            <div key={poolName} className="bg-surface rounded-xl border border-border/50 p-4">
              <h4 className="text-lg font-black text-foreground mb-4 border-b border-border/50 pb-2">{poolName}</h4>
              <div className="flex flex-col gap-3">
                {poolMatches.map(match => (
                  <MatchCard key={match.uuid} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Knockout Format
  return (
    <div className="w-full bg-background rounded-xl border border-border/50 p-6 shadow-inner">
      <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
        <div id="bracket-capture-area" className="flex flex-col min-w-max p-4 bg-background rounded-lg">
          {rootMatches.map(root => (
            <div key={root.uuid} className="flex justify-start">
               <BracketNode match={root} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
