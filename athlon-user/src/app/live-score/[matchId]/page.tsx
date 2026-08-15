'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Activity, Shield, Trophy, User, MapPin, Calendar, Clock, 
  RefreshCcw, Sparkles, Zap, Radio, ChevronRight, Feather, Volume2, VolumeX
} from 'lucide-react';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import { MatchService, Match } from '@/lib/api/matches';

export default function LiveScoreDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();

  const [scoreData, setScoreData] = useState<LiveScore | null>(null);
  const [matchDetails, setMatchDetails] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const lastAnnouncedCallRef = useRef<string | null>(null);

  useEffect(() => {
    let numericMatchId: number | null = null;

    const fetchState = () => {
      // First try the direct state endpoint (returns null if no score yet, never 500)
      ScoreService.getState(matchId)
        .then((res: any) => {
          if (res && res.data) {
            setScoreData(res.data);
          } else {
            // Fallback: search ALL scores (including completed) by UUID or numeric matchId
            return ScoreService.getAll().then((allRes: any) => {
              if (allRes && allRes.data) {
                const byUuid = allRes.data.find((s: any) => s.matchUuid === matchId);
                const byId = numericMatchId
                  ? allRes.data.find((s: any) => s.matchId === numericMatchId)
                  : null;
                const found = byUuid || byId || null;
                if (found) setScoreData(found);
              }
            });
          }
        })
        .catch(() => {
          // If state endpoint still fails, fall back to all scores list
          ScoreService.getAll()
            .then((allRes: any) => {
              if (allRes && allRes.data) {
                const byUuid = allRes.data.find((s: any) => s.matchUuid === matchId);
                const byId = numericMatchId
                  ? allRes.data.find((s: any) => s.matchId === numericMatchId)
                  : null;
                if (byUuid || byId) setScoreData(byUuid || byId);
              }
            })
            .catch(() => {/* silent fail - no score data yet */});
        })
        .finally(() => setLoading(false));

      MatchService.getById(matchId)
        .then((res: any) => {
          if (res && res.data) {
            setMatchDetails(res.data);
            // Cache numeric matchId for fallback score lookup
            if (res.data.id) numericMatchId = res.data.id;
          }
        })
        .catch(() => {/* silent fail */});
    };

    fetchState();
    const interval = setInterval(fetchState, 3000); // Live poll every 3 seconds
    return () => clearInterval(interval);
  }, [matchId]);

  const meta = scoreData?.scoreMeta || {};
  const config = meta.config || {};
  const games = meta.games || [];
  const currentGameIndex = meta.currentGameIndex || 0;
  const currentGame = games[currentGameIndex] || {};

  const teamAName = config.teamAName || matchDetails?.teamAName || (config.teamA ? config.teamA.join(' & ') : 'Team A');
  const teamBName = config.teamBName || matchDetails?.teamBName || (config.teamB ? config.teamB.join(' & ') : 'Team B');
  const tournamentName = config.tournamentName || matchDetails?.tournamentName || 'Tournament Match';
  const courtName = config.courtName || matchDetails?.courtName || (matchDetails?.courtId ? `Court ${matchDetails.courtId}` : 'Court 1');
  const category = config.category || matchDetails?.tournamentType || 'Doubles';
  const sportType = config.sportType || matchDetails?.sportType || 'Badminton';

  // Positions and Serving
  const posA = currentGame.posA || { left: 0, right: 1 };
  const posB = currentGame.posB || { left: 0, right: 1 };
  const currentServer = currentGame.currentServer || 'A';
  const scoreA = currentGame.scoreA || 0;
  const scoreB = currentGame.scoreB || 0;

  const isServeA = currentServer === 'A';
  const isServeB = currentServer === 'B';
  const serveFromRightA = isServeA && (scoreA % 2 === 0);
  const serveFromLeftA = isServeA && (scoreA % 2 !== 0);
  const serveFromRightB = isServeB && (scoreB % 2 === 0);
  const serveFromLeftB = isServeB && (scoreB % 2 !== 0);

  // Receiver calculation (Diagonal rule: Right serves to Right, Left serves to Left)
  const receiveRightB = isServeA && (scoreA % 2 === 0);
  const receiveLeftB = isServeA && (scoreA % 2 !== 0);
  const receiveRightA = isServeB && (scoreB % 2 === 0);
  const receiveLeftA = isServeB && (scoreB % 2 !== 0);

  const teamAPlayers = (config.teamA && config.teamA.length > 0) 
    ? config.teamA 
    : (matchDetails?.teamAName ? matchDetails.teamAName.split(/\s*&\s*/) : ['Player 1 (A)', 'Player 2 (A)']);
  const teamBPlayers = (config.teamB && config.teamB.length > 0) 
    ? config.teamB 
    : (matchDetails?.teamBName ? matchDetails.teamBName.split(/\s*&\s*/) : ['Player 1 (B)', 'Player 2 (B)']);

  const playerALeft = posA.left !== null && posA.left !== undefined ? teamAPlayers[posA.left] : teamAPlayers[0];
  const playerARight = posA.right !== null && posA.right !== undefined ? teamAPlayers[posA.right] : teamAPlayers[1] || teamAPlayers[0];

  const playerBLeft = posB.left !== null && posB.left !== undefined ? teamBPlayers[posB.left] : teamBPlayers[0];
  const playerBRight = posB.right !== null && posB.right !== undefined ? teamBPlayers[posB.right] : teamBPlayers[1] || teamBPlayers[0];

  const setsWonA = games.filter((g: any) => g.winner === 'A').length;
  const setsWonB = games.filter((g: any) => g.winner === 'B').length;

  // Server and Receiver Full Names for Voice
  let serverFullName = '';
  let receiverFullName = '';

  if (isServeA) {
    if (scoreA % 2 === 0) {
      serverFullName = playerARight;
      receiverFullName = playerBRight;
    } else {
      serverFullName = playerALeft;
      receiverFullName = playerBLeft;
    }
  } else {
    if (scoreB % 2 === 0) {
      serverFullName = playerBRight;
      receiverFullName = playerARight;
    } else {
      serverFullName = playerBLeft;
      receiverFullName = playerALeft;
    }
  }

  const generateUmpireCall = () => {
    if (!scoreData || !games.length) return '';
    if (scoreA === 0 && scoreB === 0) {
      return `${serverFullName || teamAName} to serve ${receiverFullName || teamBName}. Love all. Play.`;
    }

    const serverScore = isServeA ? scoreA : scoreB;
    const receiverScore = isServeA ? scoreB : scoreA;

    let call = `${serverFullName || 'Server'} to ${receiverFullName || 'Receiver'}. `;

    const ptBreak = config.pointBreak || 21;
    const isGamePointServer = serverScore >= (ptBreak - 1) && serverScore > receiverScore;
    const isGamePointReceiver = receiverScore >= (ptBreak - 1) && receiverScore > serverScore;
    const cap = ptBreak === 21 ? 30 : ptBreak === 15 ? 21 : 30;
    const isCapPoint = serverScore === cap - 1 && receiverScore === cap - 1;

    const hasGamePoint = isGamePointServer || isGamePointReceiver || isCapPoint;

    if (hasGamePoint) {
      const winningTeam = isGamePointServer ? currentServer : (isGamePointReceiver ? (currentServer === 'A' ? 'B' : 'A') : null);

      let isMatchPoint = false;
      const requiredWins = Math.ceil((config.bestOfSets || 3) / 2);
      if (winningTeam) {
        const winsWinningTeam = games.filter((g: any) => g.winner === winningTeam).length;
        if (winsWinningTeam + 1 >= requiredWins) {
          isMatchPoint = true;
        }
      } else if (isCapPoint) {
        if (setsWonA + 1 >= requiredWins || setsWonB + 1 >= requiredWins) {
          isMatchPoint = true;
        }
      }

      call += isMatchPoint ? 'Match point. ' : 'Game point. ';
    }

    if (serverScore === receiverScore) {
      call += `${serverScore} all`;
    } else {
      call += `${serverScore} - ${receiverScore}`;
    }

    return call;
  };

  const umpireCall = generateUmpireCall();

  // Voice Announcement Effect (Speaks on score changes when unmuted)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (!isMuted && umpireCall) {
        if (lastAnnouncedCallRef.current !== umpireCall) {
          lastAnnouncedCallRef.current = umpireCall;
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(umpireCall);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else if (isMuted) {
        lastAnnouncedCallRef.current = null;
        window.speechSynthesis.cancel();
      }
    }
  }, [umpireCall, isMuted]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#1B9C56]">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">{tournamentName}</span>
            <span className="text-[10px] text-text-muted">{courtName} • {category}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speaker Icon Button */}
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              !isMuted 
                ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(27,156,86,0.3)]' 
                : 'bg-surface/80 text-text-muted hover:text-foreground border-border'
            }`}
            aria-label={isMuted ? "Unmute Voice Announcements" : "Mute Voice Announcements"}
            title={isMuted ? "Unmute Voice Announcements" : "Mute Voice Announcements"}
          >
            {!isMuted ? (
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-text-muted" />
            )}
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">

        {loading ? (
          <div className="py-20 text-center text-text-muted">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Live Match Court...</p>
          </div>
        ) : !scoreData ? (
          /* Graceful empty state when match hasn't started scoring yet */
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto">
              <Radio className="w-7 h-7 text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Scoring Not Started Yet</p>
              <p className="text-xs text-text-muted mt-1">The umpire hasn't started live scoring for this match.</p>
              <p className="text-[10px] text-text-muted/60 mt-0.5">This page will update automatically when scoring begins.</p>
            </div>
            {matchDetails && (
              <div className="bg-surface border border-border rounded-2xl p-4 text-left mx-auto max-w-xs space-y-3 mt-4">
                <div className="flex items-center gap-2 text-xs font-black text-foreground">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {matchDetails.teamAName || 'Team A'} vs {matchDetails.teamBName || 'Team B'}
                </div>
                <p className="text-[10px] text-text-muted">{matchDetails.tournamentName || 'Tournament Match'} • {matchDetails.sportType}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* TOP HALF: SCOREBOARD + BADMINTON COURT VIEW */}
            <section className="space-y-4">
              
              {/* Scoreboard Card — Premium Design */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Dark gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#0d1117]" />
                {/* Subtle radial glow in center */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]" />

                <div className="relative z-10 px-4 pt-4 pb-3">

                  {/* Top row: Set info + Best of */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Set {currentGameIndex + 1}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">
                        ({setsWonA} – {setsWonB})
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Best of {config.bestOfSets || 3}
                    </span>
                  </div>

                  {/* Main score row */}
                  <div className="flex items-center justify-between gap-2">

                    {/* Team A */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-base font-black text-primary">{teamAName.charAt(0)}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-foreground leading-tight">{teamAName}</p>
                        {setsWonA > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {Array.from({ length: setsWonA }).map((_, i) => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center gap-1.5 px-2">
                      <div className="flex items-end gap-3">
                        <span className="text-5xl font-black font-mono text-primary tabular-nums leading-none">{scoreA}</span>
                        <span className="text-text-muted/30 text-2xl font-thin mb-1">:</span>
                        <span className="text-5xl font-black font-mono text-emerald-400 tabular-nums leading-none">{scoreB}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/50">Current Points</span>
                    </div>

                    {/* Team B */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
                        <span className="text-base font-black text-emerald-400">{teamBName.charAt(0)}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-foreground leading-tight">{teamBName}</p>
                        {setsWonB > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {Array.from({ length: setsWonB }).map((_, i) => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Game history pills */}
                  {games.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {games.map((g: any, idx: number) => {
                          const isActive = idx === currentGameIndex;
                          const won = g.winner === 'A' ? 'A' : g.winner === 'B' ? 'B' : null;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${
                                isActive
                                  ? 'bg-primary/10 border-primary/30 text-primary'
                                  : won === 'A'
                                  ? 'bg-primary/5 border-primary/10 text-primary/60'
                                  : won === 'B'
                                  ? 'bg-emerald-400/5 border-emerald-400/10 text-emerald-400/60'
                                  : 'bg-white/5 border-white/10 text-text-muted'
                              }`}
                            >
                              <span className="uppercase tracking-wider opacity-60">G{idx + 1}</span>
                              <span className="font-mono">{g.scoreA}–{g.scoreB}</span>
                              {won && !isActive && (
                                <span className={`text-[8px] uppercase font-black ${won === 'A' ? 'text-primary' : 'text-emerald-400'}`}>
                                  {won === 'A' ? teamAName.split(' ')[0] : teamBName.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Umpire Call commentary pill */}
                  {umpireCall && (
                    <div 
                      onClick={() => setIsMuted(prev => !prev)}
                      className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3 bg-white/[0.02] hover:bg-white/[0.04] -mx-4 -mb-3 px-4 py-2.5 rounded-b-2xl cursor-pointer transition-colors group"
                      title={isMuted ? "Click to unmute voice" : "Click to mute voice"}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${!isMuted ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted group-hover:text-foreground'}`}>
                          {!isMuted ? <Volume2 className="w-3 h-3 text-primary animate-pulse" /> : <VolumeX className="w-3 h-3 text-text-muted" />}
                        </div>
                        <p className="text-[11px] font-semibold text-foreground/90 truncate italic tracking-wide">
                          "{umpireCall}"
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        !isMuted 
                          ? 'bg-primary/20 text-primary' 
                          : 'text-text-muted group-hover:text-foreground'
                      }`}>
                        {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )}

                </div>
              </div>


              {/* REAL-TIME BADMINTON COURT VIEW */}
              <div className="bg-gradient-to-b from-[#0F472E] via-[#0D3B26] to-[#0A3320] border-2 border-emerald-500/30 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center mb-3 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Court Positions
                  </span>
                </div>

                {/* Court Container */}
                <div className="relative w-full aspect-[4/5] bg-[#0E422B] border-4 border-white/90 rounded-xl overflow-hidden shadow-inner flex flex-col">
                  
                  {/* Background Court Line Markings */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Outer Side Tramlines */}
                    <div className="absolute top-0 bottom-0 left-[6%] w-[1px] bg-white/70" />
                    <div className="absolute top-0 bottom-0 right-[6%] w-[1px] bg-white/70" />
                    {/* Back Service Lines */}
                    <div className="absolute left-0 right-0 top-[6%] h-[1px] bg-white/70" />
                    <div className="absolute left-0 right-0 bottom-[6%] h-[1px] bg-white/70" />
                    {/* Center Service Line Top */}
                    <div className="absolute top-0 bottom-1/2 left-1/2 w-[1px] bg-white/70" />
                    {/* Center Service Line Bottom */}
                    <div className="absolute top-1/2 bottom-0 left-1/2 w-[1px] bg-white/70" />
                    {/* Short Service Line Top */}
                    <div className="absolute left-0 right-0 top-[38%] h-[1px] bg-white/70" />
                    {/* Short Service Line Bottom */}
                    <div className="absolute left-0 right-0 bottom-[38%] h-[1px] bg-white/70" />
                  </div>

                  {/* TEAM A HALF (Top Half - Facing Net) */}
                  <div className="flex-1 relative flex z-10 border-b-2 border-amber-300">
                    {/* Team A Badge */}
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-primary rounded text-[9px] font-black uppercase tracking-wider border border-primary/30">
                      Team A
                    </div>

                    {/* Team A Right Service Court (Screen Left from viewer perspective, Right from player perspective) */}
                    <div className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${serveFromRightA ? 'bg-primary/20 ring-2 ring-primary ring-inset' : receiveRightA ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary font-black text-xs flex items-center justify-center mb-1 shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-white text-center leading-tight drop-shadow-md break-words max-w-full px-1">
                        {playerARight}
                      </span>
                      {serveFromRightA && (
                        <span className="mt-1 px-2 py-0.5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                          SERVE 🏸
                        </span>
                      )}
                      {receiveRightA && (
                        <span className="mt-1 px-2 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                          RECEIVE
                        </span>
                      )}
                    </div>

                    {/* Team A Left Service Court (Screen Right from viewer perspective, Left from player perspective) */}
                    <div className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${serveFromLeftA ? 'bg-primary/20 ring-2 ring-primary ring-inset' : receiveLeftA ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary font-black text-xs flex items-center justify-center mb-1 shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-white text-center leading-tight drop-shadow-md break-words max-w-full px-1">
                        {playerALeft}
                      </span>
                      {serveFromLeftA && (
                        <span className="mt-1 px-2 py-0.5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                          SERVE 🏸
                        </span>
                      )}
                      {receiveLeftA && (
                        <span className="mt-1 px-2 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                          RECEIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CENTER NET BAR */}
                  <div className="h-3 bg-white/80 border-y border-black/30 relative z-30 flex items-center justify-center">
                    <span className="text-[8px] font-black text-black uppercase tracking-widest bg-amber-300 px-2 py-0.2 rounded">
                      NET
                    </span>
                  </div>

                  {/* TEAM B HALF (Bottom Half) */}
                  <div className="flex-1 relative flex z-10">
                    {/* Team B Badge */}
                    <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
                      Team B
                    </div>

                    {/* Team B Left Court Box */}
                    <div className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${serveFromLeftB ? 'bg-emerald-500/20 ring-2 ring-emerald-400 ring-inset' : receiveLeftB ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center mb-1 shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-white text-center leading-tight drop-shadow-md break-words max-w-full px-1">
                        {playerBLeft}
                      </span>
                      {serveFromLeftB && (
                        <span className="mt-1 px-2 py-0.5 bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                          SERVE 🏸
                        </span>
                      )}
                      {receiveLeftB && (
                        <span className="mt-1 px-2 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                          RECEIVE
                        </span>
                      )}
                    </div>

                    {/* Team B Right Court Box */}
                    <div className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${serveFromRightB ? 'bg-emerald-500/20 ring-2 ring-emerald-400 ring-inset' : receiveRightB ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center mb-1 shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-white text-center leading-tight drop-shadow-md break-words max-w-full px-1">
                        {playerBRight}
                      </span>
                      {serveFromRightB && (
                        <span className="mt-1 px-2 py-0.5 bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                          SERVE 🏸
                        </span>
                      )}
                      {receiveRightB && (
                        <span className="mt-1 px-2 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                          RECEIVE
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </section>

            {/* SECOND HALF: PLAYER & TOURNAMENT DETAILS */}
            <section className="space-y-4">
              
              {/* Teams & Player Roster Card — Premium Player Cards */}
              <div className="bg-surface border border-border/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Player Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Team A Roster */}
                  <div className="bg-background/60 border border-primary/20 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-xs font-black text-foreground truncate">{teamAName}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 flex-shrink-0">Team A</span>
                    </div>

                    <div className="space-y-2">
                      {teamAPlayers.map((p: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 bg-surface/50 border border-border/30 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 shadow-sm">
                            {p.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate leading-snug">{p}</p>
                            <p className="text-[9px] font-semibold text-text-muted">Player {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team B Roster */}
                  <div className="bg-background/60 border border-emerald-500/20 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-black text-foreground truncate">{teamBName}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex-shrink-0">Team B</span>
                    </div>

                    <div className="space-y-2">
                      {teamBPlayers.map((p: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 bg-surface/50 border border-border/30 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-xs flex-shrink-0 shadow-sm">
                            {p.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate leading-snug">{p}</p>
                            <p className="text-[9px] font-semibold text-text-muted">Player {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament & Match Metadata Card — Premium Row Design */}
              <div className="relative bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-lg">
                {/* Gradient accent top bar */}
                <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />

                {/* Header */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/40">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Match Info</span>
                </div>

                {/* Row list */}
                <div className="divide-y divide-border/30">
                  {/* Tournament */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">Tournament</p>
                      <p className="text-sm font-bold text-foreground leading-snug">{tournamentName}</p>
                    </div>
                  </div>

                  {/* Sport & Category */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Feather className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">Sport / Category</p>
                      <p className="text-sm font-bold text-foreground leading-snug">{sportType} <span className="text-text-muted font-normal">•</span> {category}</p>
                    </div>
                  </div>

                  {/* Court Location */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">Court Location</p>
                      <p className="text-sm font-bold text-foreground leading-snug">{courtName}</p>
                    </div>
                  </div>

                  {/* Match Status */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">Match Status</p>
                        <p className="text-sm font-bold text-foreground leading-snug">In Progress</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                </div>
              </div>

            </section>
          </>
        )}

      </main>
    </div>
  );
}