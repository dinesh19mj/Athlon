'use client';

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  Shield,
  Trophy,
  User,
  MapPin,
  Calendar,
  Clock,
  RefreshCcw,
  Sparkles,
  Zap,
  Radio,
  ChevronRight,
  Feather,
  Volume2,
  VolumeX,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Crown,
  Target,
  Timer,
  Percent,
  Home,
  Building2,
  Tv,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import { MatchService, Match } from '@/lib/api/matches';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function LiveScoreDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [scoreData, setScoreData] = useState<LiveScore | null>(null);
  const [matchDetails, setMatchDetails] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const lastAnnouncedCallRef = useRef<string | null>(null);

  useEffect(() => {
    let numericMatchId: number | null = null;

    const fetchState = () => {
      ScoreService.getState(matchId)
        .then((res: any) => {
          if (res && res.data) {
            setScoreData(res.data);
          } else {
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
            .catch(() => {});
        })
        .finally(() => setLoading(false));

      MatchService.getById(matchId)
        .then((res: any) => {
          if (res && res.data) {
            setMatchDetails(res.data);
            if (res.data.id) numericMatchId = res.data.id;
          }
        })
        .catch(() => {});
    };

    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  const meta = scoreData?.scoreMeta || {};
  const config = meta.config || {};
  const games = meta.games || [];
  const currentGameIndex = meta.currentGameIndex || 0;
  const currentGame = games[currentGameIndex] || {};

  // Match finished detection
  const isMatchFinished =
    meta.isFinal === true ||
    (meta.matchWinner !== undefined && meta.matchWinner !== null) ||
    games.some((g: any) => g.isGameOver && !games.some((gg: any) => !gg.isGameOver && gg !== g));
  const matchWinner = meta.matchWinner; // 'A' or 'B'

  const teamAName =
    config.teamAName || matchDetails?.teamAName || (config.teamA ? config.teamA.join(' & ') : 'Team A');
  const teamBName =
    config.teamBName || matchDetails?.teamBName || (config.teamB ? config.teamB.join(' & ') : 'Team B');
  const tournamentName = config.tournamentName || matchDetails?.tournamentName || 'Tournament Match';
  const courtName =
    config.courtName || matchDetails?.courtName || (matchDetails?.courtId ? `Court ${matchDetails.courtId}` : 'Court 1');
  const category = config.category || matchDetails?.tournamentType || 'Doubles';
  const sportType = config.sportType || matchDetails?.sportType || 'Badminton';

  const posA = currentGame.posA || { left: 0, right: 1 };
  const posB = currentGame.posB || { left: 0, right: 1 };
  const currentServer = currentGame.currentServer || 'A';
  const scoreA = currentGame.scoreA || 0;
  const scoreB = currentGame.scoreB || 0;

  const isServeA = currentServer === 'A';
  const isServeB = currentServer === 'B';
  const serveFromRightA = isServeA && scoreA % 2 === 0;
  const serveFromLeftA = isServeA && scoreA % 2 !== 0;
  const serveFromRightB = isServeB && scoreB % 2 === 0;
  const serveFromLeftB = isServeB && scoreB % 2 !== 0;

  const receiveRightB = isServeA && scoreA % 2 === 0;
  const receiveLeftB = isServeA && scoreA % 2 !== 0;
  const receiveRightA = isServeB && scoreB % 2 === 0;
  const receiveLeftA = isServeB && scoreB % 2 !== 0;

  const teamAPlayers =
    config.teamA && config.teamA.length > 0
      ? config.teamA
      : matchDetails?.teamAName
      ? matchDetails.teamAName.split(/\s*&\s*/)
      : ['Player 1 (A)', 'Player 2 (A)'];
  const teamBPlayers =
    config.teamB && config.teamB.length > 0
      ? config.teamB
      : matchDetails?.teamBName
      ? matchDetails.teamBName.split(/\s*&\s*/)
      : ['Player 1 (B)', 'Player 2 (B)'];

  const playerALeft = posA.left !== null && posA.left !== undefined ? teamAPlayers[posA.left] : teamAPlayers[0];
  const playerARight =
    posA.right !== null && posA.right !== undefined ? teamAPlayers[posA.right] : teamAPlayers[1] || teamAPlayers[0];
  const playerBLeft = posB.left !== null && posB.left !== undefined ? teamBPlayers[posB.left] : teamBPlayers[0];
  const playerBRight =
    posB.right !== null && posB.right !== undefined ? teamBPlayers[posB.right] : teamBPlayers[1] || teamBPlayers[0];

  const setsWonA = games.filter((g: any) => g.winner === 'A').length;
  const setsWonB = games.filter((g: any) => g.winner === 'B').length;

  // ── Analytics computation ─────────────────────────────────────────────────
  const totalRallyTimeMs = games.reduce((acc: number, g: any) => acc + (g.totalRallyTimeMs || 0), 0);
  const totalPointsA = games.reduce((acc: number, g: any) => acc + (g.scoreA || 0), 0);
  const totalPointsB = games.reduce((acc: number, g: any) => acc + (g.scoreB || 0), 0);
  const totalPoints = totalPointsA + totalPointsB;
  const winPctA = totalPoints > 0 ? Math.round((totalPointsA / totalPoints) * 100) : 0;
  const winPctB = 100 - winPctA;

  const maxContinuousA = Math.max(...games.map((g: any) => g.maxContinuousPointsA || 0), 0);
  const maxContinuousB = Math.max(...games.map((g: any) => g.maxContinuousPointsB || 0), 0);

  const avgRallyMs = totalPoints > 0 ? Math.round(totalRallyTimeMs / totalPoints) : 0;
  const formatMs = (ms: number) => {
    if (!ms || ms === 0) return '—';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  };

  const winnerName = matchWinner === 'A' ? teamAName : matchWinner === 'B' ? teamBName : null;
  const loserName = matchWinner === 'A' ? teamBName : matchWinner === 'B' ? teamAName : null;

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
    if (!scoreData || !games.length || isMatchFinished) return '';
    if (scoreA === 0 && scoreB === 0) {
      return `${serverFullName || teamAName} to serve ${receiverFullName || teamBName}. Love all. Play.`;
    }
    const serverScore = isServeA ? scoreA : scoreB;
    const receiverScore = isServeA ? scoreB : scoreA;
    let call = `${serverFullName || 'Server'} to ${receiverFullName || 'Receiver'}. `;
    const ptBreak = config.pointBreak || 21;
    const isGamePointServer = serverScore >= ptBreak - 1 && serverScore > receiverScore;
    const isGamePointReceiver = receiverScore >= ptBreak - 1 && receiverScore > serverScore;
    const cap = ptBreak === 21 ? 30 : ptBreak === 15 ? 21 : 30;
    const isCapPoint = serverScore === cap - 1 && receiverScore === cap - 1;
    const hasGamePoint = isGamePointServer || isGamePointReceiver || isCapPoint;
    if (hasGamePoint) {
      const winningTeam = isGamePointServer
        ? currentServer
        : isGamePointReceiver
        ? currentServer === 'A'
          ? 'B'
          : 'A'
        : null;
      let isMatchPoint = false;
      const requiredWins = Math.ceil((config.bestOfSets || 3) / 2);
      if (winningTeam) {
        const winsWinningTeam = games.filter((g: any) => g.winner === winningTeam).length;
        if (winsWinningTeam + 1 >= requiredWins) isMatchPoint = true;
      } else if (isCapPoint) {
        if (setsWonA + 1 >= requiredWins || setsWonB + 1 >= requiredWins) isMatchPoint = true;
      }
      call += isMatchPoint ? 'Match point. ' : 'Game point. ';
    }
    if (serverScore === receiverScore) call += `${serverScore} all`;
    else call += `${serverScore} - ${receiverScore}`;
    return call;
  };

  const umpireCall = generateUmpireCall();

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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - EXACT PRESERVED MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-primary">{tournamentName}</span>
              <span className="text-[10px] text-text-muted">
                {courtName} • {category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMatchFinished && (
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                  !isMuted
                    ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(27,156,86,0.3)]'
                    : 'bg-surface/80 text-text-muted hover:text-foreground border-border'
                }`}
                aria-label={isMuted ? 'Unmute Voice Announcements' : 'Mute Voice Announcements'}
              >
                {!isMuted ? (
                  <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4 text-text-muted" />
                )}
              </button>
            )}

            {isMatchFinished ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Match Finished
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
              </span>
            )}
          </div>
        </header>

        <main className="max-w-xl mx-auto p-4 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-text-muted">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Match Scorecard...</p>
            </div>
          ) : !scoreData ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto">
                <Radio className="w-7 h-7 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Scoring Not Started Yet</p>
                <p className="text-xs text-text-muted mt-1">The umpire hasn't started live scoring for this match.</p>
                <p className="text-[10px] text-text-muted/60 mt-0.5">
                  This page will update automatically when scoring begins.
                </p>
              </div>
              {matchDetails && (
                <div className="bg-surface border border-border rounded-2xl p-4 text-left mx-auto max-w-xs space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-xs font-black text-foreground">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    {matchDetails.teamAName || 'Team A'} vs {matchDetails.teamBName || 'Team B'}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {matchDetails.tournamentName || 'Tournament Match'} • {matchDetails.sportType}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Winner Banner */}
              {isMatchFinished && winnerName && (
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl border animate-in fade-in zoom-in-95 duration-500"
                  style={{
                    borderColor: 'var(--athlon-border)',
                    background: 'linear-gradient(145deg, var(--athlon-card) 0%, var(--athlon-surface) 100%)',
                    boxShadow: '0 20px 50px -10px var(--athlon-glow, rgba(0,0,0,0.5))',
                  }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

                  <div className="relative z-10 p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/20">
                        <Crown className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-primary/80 mb-1">
                        🏆 Match Winner
                      </p>
                      <h2 className="text-2xl font-black text-foreground leading-tight">{winnerName}</h2>
                      {loserName && (
                        <p className="text-xs text-text-muted mt-1 font-medium">
                          defeated <span className="text-foreground/70 font-bold">{loserName}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {games.map((g: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-white/5 border border-white/10"
                        >
                          <span className="text-text-muted text-[10px] uppercase tracking-wider">G{idx + 1}</span>
                          <span
                            className={`font-mono ${
                              g.winner === 'A' ? 'text-primary font-black' : 'text-foreground/80 font-bold'
                            }`}
                          >
                            {g.scoreA}–{g.scoreB}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {setsWonA > setsWonB ? `${setsWonA}–${setsWonB}` : `${setsWonB}–${setsWonA}`} Sets • Match Complete
                    </div>
                  </div>
                </div>
              )}

              {/* Scoreboard Card */}
              <section className="space-y-4">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl border"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="relative z-10 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                          {isMatchFinished ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          )}
                          {isMatchFinished ? 'Final Score' : `Set ${currentGameIndex + 1}`}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted">
                          ({setsWonA} – {setsWonB})
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        Best of {config.bestOfSets || 3}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                            isMatchFinished && matchWinner === 'A'
                              ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                              : 'bg-primary/20 border-primary/30'
                          }`}
                        >
                          {isMatchFinished && matchWinner === 'A' ? (
                            <Trophy className="w-5 h-5 text-black fill-current" />
                          ) : (
                            <span className="text-base font-black text-primary">{teamAName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black text-foreground leading-tight">{teamAName}</p>
                          {isMatchFinished && matchWinner === 'A' && (
                            <span className="text-[9px] font-black text-primary uppercase tracking-wider">Winner 🏆</span>
                          )}
                          {setsWonA > 0 && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {Array.from({ length: setsWonA }).map((_, i) => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 px-2">
                        <div className="flex items-end gap-3">
                          <span
                            className={`text-5xl font-black font-mono tabular-nums leading-none ${
                              isMatchFinished && matchWinner === 'A'
                                ? 'text-primary'
                                : isMatchFinished
                                ? 'text-text-muted/60'
                                : 'text-primary'
                            }`}
                          >
                            {scoreA}
                          </span>
                          <span className="text-text-muted/30 text-2xl font-thin mb-1">:</span>
                          <span
                            className={`text-5xl font-black font-mono tabular-nums leading-none ${
                              isMatchFinished && matchWinner === 'B'
                                ? 'text-emerald-400'
                                : isMatchFinished
                                ? 'text-text-muted/60'
                                : 'text-emerald-400'
                            }`}
                          >
                            {scoreB}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/50">
                          {isMatchFinished ? 'Final Set Points' : 'Current Points'}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                            isMatchFinished && matchWinner === 'B'
                              ? 'bg-emerald-400 border-emerald-400 shadow-lg shadow-emerald-400/30'
                              : 'bg-emerald-400/20 border-emerald-400/30'
                          }`}
                        >
                          {isMatchFinished && matchWinner === 'B' ? (
                            <Trophy className="w-5 h-5 text-black fill-current" />
                          ) : (
                            <span className="text-base font-black text-emerald-400">{teamBName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black text-foreground leading-tight">{teamBName}</p>
                          {isMatchFinished && matchWinner === 'B' && (
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                              Winner 🏆
                            </span>
                          )}
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

                    {games.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {games.map((g: any, idx: number) => {
                            const isActive = !isMatchFinished && idx === currentGameIndex;
                            const won = g.winner === 'A' ? 'A' : g.winner === 'B' ? 'B' : null;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${
                                  isActive
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : won === 'A'
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : won === 'B'
                                    ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                                    : 'bg-white/5 border-white/10 text-text-muted'
                                }`}
                              >
                                <span className="uppercase tracking-wider opacity-60">G{idx + 1}</span>
                                <span className="font-mono">{g.scoreA}–{g.scoreB}</span>
                                {won && (
                                  <span
                                    className={`text-[8px] uppercase font-black ${
                                      won === 'A' ? 'text-primary' : 'text-emerald-400'
                                    }`}
                                  >
                                    {won === 'A' ? teamAName.split(' ')[0] : teamBName.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {umpireCall && !isMatchFinished && (
                      <div
                        onClick={() => setIsMuted((prev) => !prev)}
                        className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3 bg-white/[0.02] hover:bg-white/[0.04] -mx-4 -mb-3 px-4 py-2.5 rounded-b-2xl cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              !isMuted ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'
                            }`}
                          >
                            {!isMuted ? (
                              <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                            ) : (
                              <VolumeX className="w-3 h-3 text-text-muted" />
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-foreground/90 truncate italic tracking-wide">
                            &ldquo;{umpireCall}&rdquo;
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            !isMuted ? 'bg-primary/20 text-primary' : 'text-text-muted'
                          }`}
                        >
                          {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Court View */}
                {!isMatchFinished && (
                  <div className="bg-gradient-to-b from-[#0F472E] via-[#0D3B26] to-[#0A3320] border-2 border-emerald-500/30 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center mb-3 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Court Positions
                      </span>
                    </div>

                    <div className="relative w-full aspect-[4/5] bg-[#0E422B] border-4 border-white/90 rounded-xl overflow-hidden shadow-inner flex flex-col">
                      <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute top-0 bottom-0 left-[6%] w-[1px] bg-white/70" />
                        <div className="absolute top-0 bottom-0 right-[6%] w-[1px] bg-white/70" />
                        <div className="absolute left-0 right-0 top-[6%] h-[1px] bg-white/70" />
                        <div className="absolute left-0 right-0 bottom-[6%] h-[1px] bg-white/70" />
                        <div className="absolute top-0 bottom-1/2 left-1/2 w-[1px] bg-white/70" />
                        <div className="absolute top-1/2 bottom-0 left-1/2 w-[1px] bg-white/70" />
                        <div className="absolute left-0 right-0 top-[38%] h-[1px] bg-white/70" />
                        <div className="absolute left-0 right-0 bottom-[38%] h-[1px] bg-white/70" />
                      </div>

                      {/* TEAM A HALF */}
                      <div className="flex-1 relative flex z-10 border-b-2 border-amber-300">
                        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-primary rounded text-[9px] font-black uppercase tracking-wider border border-primary/30">
                          Team A
                        </div>
                        <div
                          className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${
                            serveFromRightA
                              ? 'bg-primary/20 ring-2 ring-primary ring-inset'
                              : receiveRightA
                              ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset'
                              : ''
                          }`}
                        >
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
                        <div
                          className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${
                            serveFromLeftA
                              ? 'bg-primary/20 ring-2 ring-primary ring-inset'
                              : receiveLeftA
                              ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset'
                              : ''
                          }`}
                        >
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

                      {/* NET */}
                      <div className="h-3 bg-white/80 border-y border-black/30 relative z-30 flex items-center justify-center">
                        <span className="text-[8px] font-black text-black uppercase tracking-widest bg-amber-300 px-2 py-0.2 rounded">
                          NET
                        </span>
                      </div>

                      {/* TEAM B HALF */}
                      <div className="flex-1 relative flex z-10">
                        <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
                          Team B
                        </div>
                        <div
                          className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${
                            serveFromLeftB
                              ? 'bg-emerald-500/20 ring-2 ring-emerald-400 ring-inset'
                              : receiveLeftB
                              ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset'
                              : ''
                          }`}
                        >
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
                        <div
                          className={`flex-1 flex flex-col items-center justify-center p-2 relative transition-all ${
                            serveFromRightB
                              ? 'bg-emerald-500/20 ring-2 ring-emerald-400 ring-inset'
                              : receiveRightB
                              ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset'
                              : ''
                          }`}
                        >
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
                )}
              </section>

              {/* Match Analytics */}
              {isMatchFinished && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider text-foreground">Match Analytics</span>
                  </div>

                  <div className="bg-surface border border-border/60 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1">
                        <Percent className="w-3 h-3" /> Points Won
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">
                        {totalPointsA} pts vs {totalPointsB} pts
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-primary truncate max-w-[40%]">{teamAName.split(' ')[0]}</span>
                        <span className="text-text-muted font-normal text-[10px]">
                          {winPctA}% — {winPctB}%
                        </span>
                        <span className="text-emerald-400 truncate max-w-[40%] text-right">{teamBName.split(' ')[0]}</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-l-full transition-all duration-700"
                          style={{ width: `${winPctA}%`, backgroundColor: 'var(--athlon-primary, #54AC68)' }}
                        />
                        <div
                          className="h-full rounded-r-full"
                          style={{ width: `${winPctB}%`, backgroundColor: '#34d399' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface border border-border/60 rounded-2xl p-4 space-y-1 shadow-md">
                      <div className="flex items-center gap-1.5 text-text-muted mb-1">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Avg Rally</span>
                      </div>
                      <div className="text-xl font-black text-foreground">{formatMs(avgRallyMs)}</div>
                      <p className="text-[10px] text-text-muted">per point</p>
                    </div>

                    <div className="bg-surface border border-border/60 rounded-2xl p-4 space-y-1 shadow-md">
                      <div className="flex items-center gap-1.5 text-text-muted mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Match Duration</span>
                      </div>
                      <div className="text-xl font-black text-foreground">{formatMs(totalRallyTimeMs)}</div>
                      <p className="text-[10px] text-text-muted">total rally time</p>
                    </div>

                    <div className="bg-surface border border-primary/20 rounded-2xl p-4 space-y-1 shadow-md">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Best Run</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-primary">{maxContinuousA}</span>
                        <span className="text-[10px] text-text-muted">pts — {teamAName.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-baseline gap-2 border-t border-primary/10 pt-1 mt-1">
                        <span className="text-lg font-black text-emerald-400">{maxContinuousB}</span>
                        <span className="text-[10px] text-text-muted">pts — {teamBName.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="bg-surface border border-border/60 rounded-2xl p-4 space-y-1 shadow-md">
                      <div className="flex items-center gap-1.5 text-text-muted mb-1">
                        <Target className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Total Points</span>
                      </div>
                      <div className="text-xl font-black text-foreground">{totalPoints}</div>
                      <p className="text-[10px] text-text-muted">
                        across {games.length} set{games.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {games.length > 0 && (
                    <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-lg">
                      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/40">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Activity className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">
                          Set-by-Set Breakdown
                        </span>
                      </div>

                      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-0 text-[10px] font-black uppercase tracking-wider text-text-muted bg-white/[0.02] px-4 py-2 border-b border-border/30">
                        <div className="w-10">Set</div>
                        <div className="text-center">Score</div>
                        <div className="text-center">Winner</div>
                        <div className="text-center">Rally</div>
                        <div className="text-center">Best Run</div>
                      </div>

                      {games.map((g: any, idx: number) => {
                        const isWinnerA = g.winner === 'A';
                        const bestRunA = g.maxContinuousPointsA || 0;
                        const bestRunB = g.maxContinuousPointsB || 0;
                        const rallyMs = g.totalRallyTimeMs || 0;
                        const setPoints = (g.scoreA || 0) + (g.scoreB || 0);
                        const setAvgRally = setPoints > 0 ? Math.round(rallyMs / setPoints) : 0;

                        return (
                          <div
                            key={idx}
                            className={`grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-0 px-4 py-3 border-b last:border-0 border-border/20 items-center ${
                              isWinnerA ? 'bg-primary/[0.03]' : 'bg-emerald-400/[0.03]'
                            }`}
                          >
                            <div className="w-10">
                              <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-text-muted">
                                {idx + 1}
                              </span>
                            </div>
                            <div className="text-center">
                              <span
                                className={`text-sm font-black font-mono ${
                                  isWinnerA ? 'text-primary' : 'text-emerald-400'
                                }`}
                              >
                                {g.scoreA}–{g.scoreB}
                              </span>
                            </div>
                            <div className="text-center">
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  isWinnerA ? 'text-primary bg-primary/10' : 'text-emerald-400 bg-emerald-400/10'
                                }`}
                              >
                                {isWinnerA ? teamAName.split(' ')[0] : teamBName.split(' ')[0]}
                              </span>
                            </div>
                            <div className="text-center text-[10px] font-bold text-text-muted">
                              {formatMs(setAvgRally)}
                            </div>
                            <div className="text-center text-[10px] font-black text-text-muted">
                              <span className="text-primary">{bestRunA}</span>/
                              <span className="text-emerald-400">{bestRunB}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* Player Details & Match Meta */}
              <section className="space-y-4">
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
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 flex-shrink-0">
                          Team A
                        </span>
                      </div>

                      <div className="space-y-2">
                        {teamAPlayers.map((p: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 bg-surface/50 border border-border/30 rounded-lg"
                          >
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
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex-shrink-0">
                          Team B
                        </span>
                      </div>

                      <div className="space-y-2">
                        {teamBPlayers.map((p: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 bg-surface/50 border border-border/30 rounded-lg"
                          >
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

                <div className="relative bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-lg">
                  <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />

                  <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/40">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Match Info</span>
                  </div>

                  <div className="divide-y divide-border/30">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">
                          Tournament
                        </p>
                        <p className="text-sm font-bold text-foreground leading-snug">{tournamentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Feather className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">
                          Sport / Category
                        </p>
                        <p className="text-sm font-bold text-foreground leading-snug">
                          {sportType} <span className="text-text-muted font-normal">•</span> {category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">
                          Court Location
                        </p>
                        <p className="text-sm font-bold text-foreground leading-snug">{courtName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-text-muted leading-none mb-0.5">
                            Match Status
                          </p>
                          <p className="text-sm font-bold text-foreground leading-snug">
                            {isMatchFinished ? 'Completed' : 'In Progress'}
                          </p>
                        </div>
                      </div>
                      {isMatchFinished ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Finished
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Top Navbar */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                }}
              >
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">ATHLON</span>
                <span
                  className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-primary)' }}
                >
                  Sports Platform
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Home</span>
              </Link>
              <Link
                href="/tournaments"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-primary" />
                <span>Tournaments</span>
              </Link>
              <Link
                href="/academies"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Academies</span>
              </Link>
              <Link
                href="/live-score"
                className="px-4 py-2 rounded-xl text-sm font-black bg-red-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/25"
              >
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span>Live Arena</span>
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {!isMatchFinished && (
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                    !isMuted
                      ? 'bg-primary/20 text-primary border-primary/40 shadow-md'
                      : 'bg-surface/80 text-foreground/60 border-foreground/10 hover:text-foreground'
                  }`}
                >
                  {!isMuted ? (
                    <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-foreground/40" />
                  )}
                  <span>{isMuted ? 'Voice Calls: OFF' : 'Voice Calls: ON'}</span>
                </button>
              )}

              <Link
                href="/live-score"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Live Matches</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Desktop Header Command Strip */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider">
                  {tournamentName}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-surface border border-foreground/10 text-xs font-bold text-foreground/70">
                  {courtName} • {category}
                </span>
                {isMatchFinished ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Match Completed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE IN PLAY
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
                {teamAName} vs {teamBName}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="p-3.5 px-5 rounded-2xl border flex items-center gap-3 text-xs"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="text-center">
                  <span className="text-[10px] font-extrabold uppercase text-foreground/50 block">Best Of</span>
                  <span className="text-sm font-black text-foreground font-mono">{config.bestOfSets || 3} Sets</span>
                </div>
                <div className="h-6 w-[1px] bg-foreground/10" />
                <div className="text-center">
                  <span className="text-[10px] font-extrabold uppercase text-foreground/50 block">Current Game</span>
                  <span className="text-sm font-black text-primary font-mono">
                    {isMatchFinished ? 'Final Result' : `Game ${currentGameIndex + 1}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Arena Workspace */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {loading ? (
            <div className="py-32 text-center text-foreground/50 text-xs font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <span>Streaming match scorecard...</span>
            </div>
          ) : !scoreData ? (
            <div
              className="py-28 px-8 rounded-[36px] border border-dashed flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <Radio className="w-12 h-12 text-foreground/30 mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2">Scoring Not Started</h3>
              <p className="text-xs text-foreground/60 max-w-md mb-6 leading-relaxed">
                The match referee has not launched live scorekeeping yet. This command deck will auto-update upon umpire initialization.
              </p>
              <Link href="/live-score" className="px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-md">
                Return to Live Match Arena
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left Column (Scoreboard + Live Court / Analytics) */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* 1. Giant Scoreboard Display */}
                <div
                  className="rounded-[32px] border overflow-hidden shadow-2xl relative"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-primary to-emerald-400" />

                  <div className="p-8 space-y-8">
                    {/* Head-to-Head Giant Pods */}
                    <div
                      className="p-8 rounded-[24px] border flex items-center justify-between gap-8"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      {/* Team A */}
                      <div className="flex flex-col items-center text-center flex-1 gap-3">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary text-2xl font-black shadow-lg shadow-primary/10">
                          {teamAName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-foreground leading-tight">{teamAName}</h2>
                          {isMatchFinished && matchWinner === 'A' && (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-primary mt-1">
                              <Trophy className="w-3.5 h-3.5" /> Match Winner
                            </span>
                          )}
                        </div>
                        <div className="text-6xl font-black font-mono text-primary tabular-nums tracking-tight">
                          {scoreA}
                        </div>
                      </div>

                      {/* Sets Won Meter */}
                      <div className="flex flex-col items-center justify-center gap-2 px-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                          Sets Won
                        </span>
                        <div className="px-5 py-2 rounded-2xl bg-background border border-foreground/10 font-mono font-black text-lg text-foreground shadow-inner">
                          {setsWonA} - {setsWonB}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse">
                          {isMatchFinished ? 'COMPLETED' : 'IN PLAY'}
                        </span>
                      </div>

                      {/* Team B */}
                      <div className="flex flex-col items-center text-center flex-1 gap-3">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black shadow-lg shadow-emerald-500/10">
                          {teamBName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-foreground leading-tight">{teamBName}</h2>
                          {isMatchFinished && matchWinner === 'B' && (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 mt-1">
                              <Trophy className="w-3.5 h-3.5" /> Match Winner
                            </span>
                          )}
                        </div>
                        <div className="text-6xl font-black font-mono text-emerald-400 tabular-nums tracking-tight">
                          {scoreB}
                        </div>
                      </div>
                    </div>

                    {/* Game History Breakdown */}
                    {games.length > 0 && (
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        {games.map((g: any, idx: number) => {
                          const isActive = !isMatchFinished && idx === currentGameIndex;
                          const won = g.winner === 'A' ? 'A' : g.winner === 'B' ? 'B' : null;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border transition-all ${
                                isActive
                                  ? 'bg-primary/15 border-primary/40 text-primary scale-105 shadow-md'
                                  : won === 'A'
                                  ? 'bg-primary/10 border-primary/25 text-primary'
                                  : won === 'B'
                                  ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400'
                                  : 'bg-surface border-foreground/10 text-foreground/50'
                              }`}
                            >
                              <span className="uppercase tracking-wider opacity-60 text-[10px]">Game {idx + 1}:</span>
                              <span className="font-mono">{g.scoreA} – {g.scoreB}</span>
                              {won && (
                                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${won === 'A' ? 'bg-primary/20 text-primary' : 'bg-emerald-400/20 text-emerald-400'}`}>
                                  {won === 'A' ? teamAName.split(' ')[0] : teamBName.split(' ')[0]} Won
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Umpire Spoken Call Bar */}
                    {umpireCall && !isMatchFinished && (
                      <div
                        onClick={() => setIsMuted((prev) => !prev)}
                        className="p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                            {!isMuted ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4 text-foreground/40" />}
                          </div>
                          <p className="text-xs font-semibold text-foreground/90 italic tracking-wide truncate">
                            &ldquo;{umpireCall}&rdquo;
                          </p>
                        </div>
                        <span className="text-[11px] font-black text-primary shrink-0">
                          {!isMuted ? 'Voice Active' : 'Click to Enable Speech'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Interactive Live 2D Badminton Court */}
                {!isMatchFinished && (
                  <div className="bg-gradient-to-b from-[#0F472E] via-[#0D3B26] to-[#0A3320] border-2 border-emerald-500/30 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Live Court Positions & Serving Radar</span>
                      </div>
                      <span className="text-xs text-emerald-300/60 font-mono">Real-time Diagonal Tracking</span>
                    </div>

                    <div className="relative w-full aspect-[16/9] bg-[#0E422B] border-4 border-white/90 rounded-2xl overflow-hidden shadow-inner flex">
                      {/* Court Line Markings */}
                      <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute top-0 bottom-0 left-[6%] w-[1px] bg-white/70" />
                        <div className="absolute top-0 bottom-0 right-[6%] w-[1px] bg-white/70" />
                        <div className="absolute left-0 right-0 top-[6%] h-[1px] bg-white/70" />
                        <div className="absolute left-0 right-0 bottom-[6%] h-[1px] bg-white/70" />
                        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-amber-300/80" />
                        <div className="absolute top-[6%] bottom-[6%] left-[30%] w-[1px] bg-white/70" />
                        <div className="absolute top-[6%] bottom-[6%] right-[30%] w-[1px] bg-white/70" />
                        <div className="absolute top-1/2 left-[6%] right-[6%] h-[1px] bg-white/70" />
                      </div>

                      {/* Team A Half (Left) */}
                      <div className="flex-1 relative flex flex-col z-10 border-r-2 border-amber-300">
                        <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-black/70 backdrop-blur-md text-primary rounded-xl text-[10px] font-black uppercase tracking-wider border border-primary/30">
                          {teamAName} (Team A)
                        </div>

                        <div className="flex-1 flex">
                          <div
                            className={`flex-1 flex flex-col items-center justify-center p-4 relative transition-all ${
                              serveFromRightA ? 'bg-primary/20 ring-2 ring-primary ring-inset' : receiveRightA ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 text-primary font-black text-sm flex items-center justify-center mb-1.5 shadow-md">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-white text-center leading-tight drop-shadow-md">
                              {playerARight}
                            </span>
                            {serveFromRightA && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                                SERVE 🏸
                              </span>
                            )}
                            {receiveRightA && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                                RECEIVE
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex-1 flex flex-col items-center justify-center p-4 relative transition-all ${
                              serveFromLeftA ? 'bg-primary/20 ring-2 ring-primary ring-inset' : receiveLeftA ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 text-primary font-black text-sm flex items-center justify-center mb-1.5 shadow-md">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-white text-center leading-tight drop-shadow-md">
                              {playerALeft}
                            </span>
                            {serveFromLeftA && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                                SERVE 🏸
                              </span>
                            )}
                            {receiveLeftA && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                                RECEIVE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Team B Half (Right) */}
                      <div className="flex-1 relative flex flex-col z-10">
                        <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-black/70 backdrop-blur-md text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                          {teamBName} (Team B)
                        </div>

                        <div className="flex-1 flex">
                          <div
                            className={`flex-1 flex flex-col items-center justify-center p-4 relative transition-all ${
                              serveFromLeftB ? 'bg-emerald-500/20 ring-2 ring-emerald-400 ring-inset' : receiveLeftB ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-center mb-1.5 shadow-md">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-white text-center leading-tight drop-shadow-md">
                              {playerBLeft}
                            </span>
                            {serveFromLeftB && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                                SERVE 🏸
                              </span>
                            )}
                            {receiveLeftB && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                                RECEIVE
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex-1 flex flex-col items-center justify-center p-4 relative transition-all ${
                              serveFromRightB ? 'bg-emerald-500/20 ring-2 ring-emerald-400 ring-inset' : receiveRightB ? 'bg-amber-400/10 ring-2 ring-amber-400/50 ring-inset' : ''
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-center mb-1.5 shadow-md">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-white text-center leading-tight drop-shadow-md">
                              {playerBRight}
                            </span>
                            {serveFromRightB && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg animate-bounce">
                                SERVE 🏸
                              </span>
                            )}
                            {receiveRightB && (
                              <span className="mt-1.5 px-2.5 py-0.5 bg-amber-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                                RECEIVE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Match Analytics (when finished) */}
                {isMatchFinished && (
                  <div
                    className="p-8 rounded-[32px] border space-y-6 shadow-xl"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="flex items-center gap-2.5">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-foreground">Post-Match Telemetry & Analytics</h3>
                      </div>
                      <span className="text-xs text-foreground/50">{totalPoints} Total Rally Points Scored</span>
                    </div>

                    {/* Points Share Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-primary">{teamAName} ({winPctA}%)</span>
                        <span className="text-foreground/40">{totalPointsA} vs {totalPointsB} Points</span>
                        <span className="text-emerald-400">{teamBName} ({winPctB}%)</span>
                      </div>
                      <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden flex">
                        <div className="h-full bg-primary transition-all duration-700" style={{ width: `${winPctA}%` }} />
                        <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${winPctB}%` }} />
                      </div>
                    </div>

                    {/* 4 Metric Pills */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span className="text-[10px] font-extrabold uppercase text-foreground/50">Avg Rally</span>
                        <div className="text-lg font-black text-foreground">{formatMs(avgRallyMs)}</div>
                      </div>
                      <div className="p-4 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span className="text-[10px] font-extrabold uppercase text-foreground/50">Match Time</span>
                        <div className="text-lg font-black text-foreground">{formatMs(totalRallyTimeMs)}</div>
                      </div>
                      <div className="p-4 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span className="text-[10px] font-extrabold uppercase text-primary">Best Run (A)</span>
                        <div className="text-lg font-black text-primary">{maxContinuousA} pts</div>
                      </div>
                      <div className="p-4 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span className="text-[10px] font-extrabold uppercase text-emerald-400">Best Run (B)</span>
                        <div className="text-lg font-black text-emerald-400">{maxContinuousB} pts</div>
                      </div>
                    </div>

                    {/* Set-by-Set Table */}
                    {games.length > 0 && (
                      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--athlon-border)' }}>
                        <div className="grid grid-cols-5 gap-0 text-[11px] font-black uppercase text-foreground/50 bg-surface/80 p-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div>Set</div>
                          <div className="text-center">Score</div>
                          <div className="text-center">Winner</div>
                          <div className="text-center">Rally Time</div>
                          <div className="text-center">Best Run</div>
                        </div>
                        {games.map((g: any, idx: number) => {
                          const isWinnerA = g.winner === 'A';
                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-5 gap-0 p-3.5 border-b last:border-0 text-xs font-bold items-center"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <div className="font-mono font-black text-foreground/60">Set {idx + 1}</div>
                              <div className={`text-center font-mono font-black text-sm ${isWinnerA ? 'text-primary' : 'text-emerald-400'}`}>
                                {g.scoreA} – {g.scoreB}
                              </div>
                              <div className="text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isWinnerA ? 'bg-primary/15 text-primary' : 'bg-emerald-400/15 text-emerald-400'}`}>
                                  {isWinnerA ? teamAName.split(' ')[0] : teamBName.split(' ')[0]}
                                </span>
                              </div>
                              <div className="text-center text-foreground/60">{formatMs(g.totalRallyTimeMs || 0)}</div>
                              <div className="text-center font-mono">
                                <span className="text-primary">{g.maxContinuousPointsA || 0}</span> / <span className="text-emerald-400">{g.maxContinuousPointsB || 0}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column (Podium Winner + Rosters + Match Info) */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Winner Card (if completed) */}
                {isMatchFinished && winnerName && (
                  <div
                    className="p-6 rounded-[28px] border text-center space-y-4 shadow-xl relative overflow-hidden"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="w-16 h-16 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary/15">
                      <Crown className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Match Winner 🏆</span>
                      <h3 className="text-xl font-black text-foreground mt-1">{winnerName}</h3>
                      {loserName && <p className="text-xs text-foreground/50 mt-0.5">defeated {loserName}</p>}
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xs inline-block">
                      {setsWonA > setsWonB ? `${setsWonA}–${setsWonB}` : `${setsWonB}–${setsWonA}`} Sets Victory
                    </div>
                  </div>
                )}

                {/* Team Rosters */}
                <div
                  className="p-6 rounded-[28px] border space-y-4 shadow-md"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Player Rosters</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Team A */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">{teamAName}</span>
                      <div className="space-y-1.5">
                        {teamAPlayers.map((p: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border flex items-center gap-3 bg-surface/50"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-black text-xs">
                              {p.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-foreground truncate">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">{teamBName}</span>
                      <div className="space-y-1.5">
                        {teamBPlayers.map((p: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border flex items-center gap-3 bg-surface/50"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-xs">
                              {p.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-foreground truncate">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Information Card */}
                <div
                  className="p-6 rounded-[28px] border space-y-4 shadow-md text-xs"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <Trophy className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Competition Details</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/50 font-medium">Tournament:</span>
                      <span className="font-bold text-foreground text-right truncate max-w-[200px]">{tournamentName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-foreground/50 font-medium">Category:</span>
                      <span className="font-bold text-foreground">{sportType} • {category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-foreground/50 font-medium">Court:</span>
                      <span className="font-bold text-emerald-400">{courtName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-foreground/50 font-medium">Format:</span>
                      <span className="font-bold text-foreground">Best of {config.bestOfSets || 3} Sets</span>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--athlon-border)' }}>
                      <span className="text-foreground/50 font-medium">Status:</span>
                      <span className={`font-black ${isMatchFinished ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>
                        {isMatchFinished ? 'Completed' : 'Live Broadcast Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Desktop Branded Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 font-black">
                  <Radio className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON LIVE ARENA</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/live-score" className="hover:text-red-400 transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>Real-time tournament radar and scoring engine.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}