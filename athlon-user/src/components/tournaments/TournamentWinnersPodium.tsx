'use client';

import React, { useMemo } from 'react';
import { Match, Registration } from '@/lib/api/tournaments';
import { Trophy, Crown, Medal, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface PodiumData {
  isFinished: boolean;
  champion: {
    name: string;
    uuid?: string;
    id?: number | string;
    players?: string[];
  } | null;
  runnerUp: {
    name: string;
    uuid?: string;
    id?: number | string;
    players?: string[];
  } | null;
  semiFinalists: {
    name: string;
    uuid?: string;
    id?: number | string;
    players?: string[];
  }[];
}

export function computeTournamentPodium(
  matches: Match[],
  registrations: Registration[] = []
): PodiumData {
  if (!matches || matches.length === 0) {
    return { isFinished: false, champion: null, runnerUp: null, semiFinalists: [] };
  }

  // Find helper to get team details from registration
  const getTeamDetails = (
    uuid?: string | null,
    id?: number | string | null,
    fallbackName?: string | null
  ) => {
    const reg = registrations.find(
      (r) =>
        (uuid && (r.registrationUuid === uuid || r.uuid === uuid)) ||
        (id && (r.registrationId === id || r.id === id))
    );

    const name = reg?.teamName || fallbackName || (uuid || id ? 'Team' : 'TBD');
    const players = reg?.players?.map((p) => p.playerName) || [];
    return { name, uuid: uuid || undefined, id: id || undefined, players };
  };

  // 1. Check if there are playoff / knockout matches
  const targetMatches = matches.filter((m) => !m.poolName && m.poolId == null);
  const knockoutMatches = targetMatches.length > 0 ? targetMatches : matches;

  // Find root match (Championship Final)
  const matchMap = new Map(knockoutMatches.map((m) => [m.uuid, m]));
  const rootMatches = knockoutMatches.filter((m) => !m.nextMatchUuid || !matchMap.has(m.nextMatchUuid));

  if (rootMatches.length === 0) {
    return { isFinished: false, champion: null, runnerUp: null, semiFinalists: [] };
  }

  const finalMatch = rootMatches[0];
  const isFinalCompleted = finalMatch.status === 'COMPLETED';

  if (!isFinalCompleted) {
    return { isFinished: false, champion: null, runnerUp: null, semiFinalists: [] };
  }

  // Determine Champion (Winner of Final) & Runner-Up (Loser of Final)
  const winnerUuid = finalMatch.winnerRegistrationUuid;
  const winnerId = finalMatch.winnerRegistrationId;

  const isWinnerA =
    (winnerUuid && (winnerUuid === finalMatch.teamARegistrationUuid || winnerUuid === finalMatch.teamARegistrationId)) ||
    (winnerId && winnerId === finalMatch.teamARegistrationId);

  const champion = isWinnerA
    ? getTeamDetails(finalMatch.teamARegistrationUuid, finalMatch.teamARegistrationId, finalMatch.teamAName)
    : getTeamDetails(finalMatch.teamBRegistrationUuid, finalMatch.teamBRegistrationId, finalMatch.teamBName);

  const runnerUp = isWinnerA
    ? getTeamDetails(finalMatch.teamBRegistrationUuid, finalMatch.teamBRegistrationId, finalMatch.teamBName)
    : getTeamDetails(finalMatch.teamARegistrationUuid, finalMatch.teamARegistrationId, finalMatch.teamAName);

  // Find Semi-Final matches (feeders to finalMatch)
  const semiFinalMatches = knockoutMatches.filter((m) => m.nextMatchUuid === finalMatch.uuid);
  const semiFinalists: { name: string; uuid?: string; id?: number | string; players?: string[] }[] = [];

  semiFinalMatches.forEach((sf) => {
    if (sf.status === 'COMPLETED') {
      const sfWinnerUuid = sf.winnerRegistrationUuid;
      const sfWinnerId = sf.winnerRegistrationId;
      const sfIsWinnerA =
        (sfWinnerUuid && (sfWinnerUuid === sf.teamARegistrationUuid || sfWinnerUuid === sf.teamARegistrationId)) ||
        (sfWinnerId && sfWinnerId === sf.teamARegistrationId);

      // Loser of semi-final is the 3rd/4th place semi-finalist
      const losingTeam = sfIsWinnerA
        ? getTeamDetails(sf.teamBRegistrationUuid, sf.teamBRegistrationId, sf.teamBName)
        : getTeamDetails(sf.teamARegistrationUuid, sf.teamARegistrationId, sf.teamAName);

      if (losingTeam.name !== 'TBD') {
        semiFinalists.push(losingTeam);
      }
    }
  });

  return {
    isFinished: true,
    champion,
    runnerUp,
    semiFinalists,
  };
}

interface TournamentWinnersPodiumProps {
  matches: Match[];
  registrations?: Registration[];
  tournamentName?: string;
  className?: string;
}

export const TournamentWinnersPodium: React.FC<TournamentWinnersPodiumProps> = ({
  matches,
  registrations = [],
  tournamentName,
  className = '',
}) => {
  const podium = useMemo(
    () => computeTournamentPodium(matches, registrations),
    [matches, registrations]
  );

  if (!podium.isFinished || !podium.champion) {
    return null;
  }

  return (
    <div
      className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-primary, #54AC68)',
        boxShadow: '0 20px 50px -15px var(--athlon-primary-glow, rgba(84,172,104,0.18))',
      }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: 'var(--athlon-primary, #54AC68)' }}
      />
      <div
        className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ backgroundColor: 'var(--athlon-primary, #54AC68)' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{
              backgroundColor: 'var(--athlon-primary, #54AC68)',
              color: '#050807',
            }}
          >
            <Trophy className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" /> Official Tournament Results
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                Match Finished
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
              Winners Podium & Final Standings
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl border text-xs font-bold text-foreground/70 bg-surface/60 backdrop-blur-sm">
            {matches.length} Total Matches Played
          </span>
        </div>
      </div>

      {/* 3D-Style Stadium Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-4 relative z-10">
        {/* 🥈 2nd Place: Runner-Up */}
        {podium.runnerUp && (
          <div
            className="order-2 md:order-1 rounded-2xl border p-5 flex flex-col items-center text-center space-y-3 relative transition-transform hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border-strong, #2D3F63)',
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-300/15 border border-slate-300/30 text-slate-200 flex items-center justify-center font-black text-base shadow-sm">
              🥈
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                2nd Place • Runner-Up
              </span>
              <h4 className="text-base font-black text-foreground line-clamp-1">
                {podium.runnerUp.name}
              </h4>
              {podium.runnerUp.players && podium.runnerUp.players.length > 0 && (
                <p className="text-xs text-foreground/50 font-medium line-clamp-1 mt-0.5">
                  {podium.runnerUp.players.join(' & ')}
                </p>
              )}
            </div>
            <div className="w-full pt-2 border-t border-border/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Championship Finalist
              </span>
            </div>
          </div>
        )}

        {/* 🥇 1st Place: Champion (Elevated) */}
        {podium.champion && (
          <div
            className="order-1 md:order-2 rounded-3xl border-2 p-6 flex flex-col items-center text-center space-y-4 relative shadow-2xl transition-transform hover:-translate-y-1.5 md:-mt-4"
            style={{
              borderColor: 'var(--athlon-primary, #54AC68)',
              background:
                'linear-gradient(180deg, var(--athlon-primary-glow, rgba(84,172,104,0.22)) 0%, var(--athlon-surface) 100%)',
              boxShadow: '0 15px 35px -10px var(--athlon-primary-glow, rgba(84,172,104,0.25))',
            }}
          >
            {/* Champion Badge */}
            <div className="absolute -top-3.5 px-4 py-1 rounded-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" /> Champion
            </div>

            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl shrink-0 mt-2"
              style={{
                backgroundColor: 'var(--athlon-primary, #54AC68)',
                color: '#050807',
              }}
            >
              <Trophy className="w-8 h-8 fill-current" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-primary block mb-1">
                1st Place • Tournament Winner
              </span>
              <h4 className="text-lg sm:text-xl font-black text-foreground">
                {podium.champion.name}
              </h4>
              {podium.champion.players && podium.champion.players.length > 0 && (
                <p className="text-xs text-foreground/60 font-medium line-clamp-1 mt-0.5">
                  {podium.champion.players.join(' & ')}
                </p>
              )}
            </div>

            <div className="w-full pt-2 border-t border-primary/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                🏆 Title Winner 2026
              </span>
            </div>
          </div>
        )}

        {/* 🥉 3rd Place: Semi-Finalists */}
        <div
          className="order-3 rounded-2xl border p-5 flex flex-col items-center text-center space-y-3 relative transition-transform hover:-translate-y-1"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border-strong, #2D3F63)',
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-700/20 border border-amber-700/40 text-amber-500 flex items-center justify-center font-black text-base shadow-sm">
            🥉
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 block mb-1">
              3rd Place • Semi-Finalists
            </span>
            {podium.semiFinalists.length > 0 ? (
              <div className="space-y-1.5">
                {podium.semiFinalists.map((sf, idx) => (
                  <div key={sf.name + idx} className="text-xs font-black text-foreground truncate">
                    {sf.name}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs font-bold text-foreground/60">Playoff Semi-Finalists</span>
            )}
          </div>
          <div className="w-full pt-2 border-t border-border/40">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/80">
              Podium Finishers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
