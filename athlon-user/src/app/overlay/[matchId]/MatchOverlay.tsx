'use client';

import React, { useEffect, useState } from 'react';
import { ScoringService } from '@/lib/api/scoring';
import { MatchState, Team } from '@/lib/store/useMatchStore';

export default function MatchOverlay({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [state, setState] = useState<any | null>(null);

  useEffect(() => {
    params.then(p => setMatchId(p.matchId));
  }, [params]);

  useEffect(() => {
    if (!matchId) return;

    const fetchState = async () => {
      try {
        const res = await ScoringService.getState(matchId as string);
        if (res && res.data && res.data.scoreMeta) {
          setState(res.data.scoreMeta);
        }
      } catch (err) {
        console.error('Failed to fetch overlay state', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (!state || !state.config) return null;

  const isCricket = state.runsA !== undefined;
  const isVolleyball = state.pointsA !== undefined;
  const isBottomBar = isCricket || isVolleyball;
  const teamAStr = Array.isArray(state.config.teamA) ? state.config.teamA.join(' / ') : state.config.teamA;
  const teamBStr = Array.isArray(state.config.teamB) ? state.config.teamB.join(' / ') : state.config.teamB;

  return (
    <div className="min-h-screen bg-transparent p-8 font-sans antialiased text-foreground selection:bg-transparent relative w-full overflow-hidden">
      {/* Logo: Top Right */}
      <div className="absolute top-8 right-8 z-30">
        <img src="/athlon-logo.png" alt="Athlon Sports" className="h-20 object-contain drop-shadow-xl" />
      </div>

      {!isBottomBar ? (
        <div className="absolute top-8 left-8 flex flex-col items-start relative mt-2 w-full max-w-[440px] z-20">
          <div className={`w-full bg-surface rounded-2xl py-1 shadow-2xl border border-foreground/5 relative overflow-hidden flex flex-col gap-1`}>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-[#8B5CF6] to-[#3B82F6] opacity-80" />

            {/* TEAM A ROW */}
            <div className={`flex items-center justify-between relative pl-10 pr-4 py-1`}>
              <div className="flex items-center gap-3">
                <span className="text-foreground/40 font-mono text-xs absolute left-3">-</span>
                <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-full h-1/3 bg-[#FF9933]" />
                  <div className="w-full h-1/3 bg-white" />
                  <div className="w-full h-1/3 bg-[#138808]" />
                  <div className="absolute w-1.5 h-1.5 rounded-full border border-[#000080]" />
                </div>
                <span className="text-[15px] font-medium text-foreground/90 truncate">{teamAStr}</span>
              </div>
              <div className="flex items-center gap-3">
                <ScoreValue state={state} isTeamA={true} />
              </div>
            </div>

            <div className="h-[1px] w-full bg-foreground/5 pl-10" />

            {/* TEAM B ROW */}
            <div className={`flex items-center justify-between relative pl-10 pr-4 py-1`}>
              <div className="flex items-center gap-3">
                <span className="text-foreground/40 font-mono text-xs absolute left-3">-</span>
                <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-full h-1/3 bg-[#FF9933]" />
                  <div className="w-full h-1/3 bg-white" />
                  <div className="w-full h-1/3 bg-[#138808]" />
                  <div className="absolute w-1.5 h-1.5 rounded-full border border-[#000080]" />
                </div>
                <span className="text-[15px] font-medium text-foreground/90 truncate">{teamBStr}</span>
              </div>
              <div className="flex items-center gap-3">
                <ScoreValue state={state} isTeamA={false} />
              </div>
            </div>
          </div>
        </div>
      ) : isCricket ? (
        <CricketOverlay state={state} />
      ) : (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center w-full max-w-4xl z-20">
          <div className={`w-full bg-surface rounded-2xl py-3 px-8 shadow-2xl border border-foreground/5 relative overflow-hidden flex items-center justify-between gap-8`}>
            <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] opacity-80" />

            {/* TEAM A */}
            <div className={`flex items-center justify-between gap-6 relative flex-1`}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-full h-1/3 bg-[#FF9933]" />
                  <div className="w-full h-1/3 bg-white" />
                  <div className="w-full h-1/3 bg-[#138808]" />
                  <div className="absolute w-2 h-2 rounded-full border border-[#000080]" />
                </div>
                <span className="text-[20px] font-bold text-foreground/90 truncate">{teamAStr}</span>
              </div>
              <ScoreValue state={state} isTeamA={true} isBottomBar={true} />
            </div>

            <div className="text-foreground/20 font-black italic px-4">VS</div>

            {/* TEAM B */}
            <div className={`flex items-center justify-between gap-6 relative flex-1 flex-row-reverse`}>
              <div className="flex items-center gap-3">
                <span className="text-[20px] font-bold text-foreground/90 truncate">{teamBStr}</span>
                <div className="w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-full h-1/3 bg-[#FF9933]" />
                  <div className="w-full h-1/3 bg-white" />
                  <div className="w-full h-1/3 bg-[#138808]" />
                  <div className="absolute w-2 h-2 rounded-full border border-[#000080]" />
                </div>
              </div>
              <ScoreValue state={state} isTeamA={false} isBottomBar={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent to render the specific score value depending on the sport
function ScoreValue({ state, isTeamA, isBottomBar = false }: { state: any, isTeamA: boolean, isBottomBar?: boolean }) {
  const alignClass = isBottomBar ? (isTeamA ? 'text-right' : 'text-left') : 'text-right';
  const widthClass = isBottomBar ? '' : 'w-6';

  if (state.goalsA !== undefined) {
    // FOOTBALL
    return (
      <span className={`text-lg font-bold ${widthClass} ${alignClass} text-[#1B9C56]`}>
        {isTeamA ? state.goalsA : state.goalsB}
      </span>
    );
  } else if (state.runsA !== undefined) {
    // CRICKET
    const runs = isTeamA ? state.runsA : state.runsB;
    const wickets = isTeamA ? state.wicketsA : state.wicketsB;
    const balls = isTeamA ? state.validBallsA : state.validBallsB;
    const oversStr = Math.floor(balls / 6) + "." + (balls % 6);
    return (
      <span className={`text-2xl font-black ${isBottomBar ? '' : 'w-24 text-lg'} ${alignClass} text-[#1B9C56] tracking-tight`}>
        {runs}/{wickets} <span className="text-base text-foreground/50 font-medium">({oversStr})</span>
      </span>
    );
  } else if (state.games !== undefined) {
    // RACQUET SPORTS (Badminton / Tennis)
    const { config, games, currentGameIndex, teamsFlipped } = state;
    const currentGame = games[currentGameIndex];
    
    if (!currentGame) return null;
    
    const isServe = isTeamA ? (currentGame.currentServer === 'A') : (currentGame.currentServer === 'B');
    const teamThemeClass = isServe ? 'text-[#1B9C56]' : 'text-[#3B82F6]';
    const dotClass = isServe ? 'bg-[#1B9C56] shadow-[0_0_8px_#1B9C56]' : 'bg-transparent';

    return (
      <>
        <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        <div className={`flex items-center gap-3 ${isBottomBar && !isTeamA ? 'flex-row-reverse' : ''}`}>
          {Array.from({ length: config.bestOfSets || 3 }).map((_, i) => {
            const g = games[i];
            if (!g && i > currentGameIndex) return <span key={i} className={`text-lg font-bold ${widthClass} ${alignClass} text-foreground/20`}>-</span>;
            return (
              <span key={i} className={`text-lg font-bold ${widthClass} ${alignClass} ${i === currentGameIndex ? teamThemeClass : 'text-foreground/80'}`}>
                {g ? (isTeamA ? g.scoreA : g.scoreB) : 0}
              </span>
            );
          })}
        </div>
      </>
    );
  } else if (state.pointsA !== undefined) {
    // VOLLEYBALL
    const { config, currentSet, setsA, setsB, pointsA, pointsB } = state;
    const sets = isTeamA ? setsA : setsB;
    const points = isTeamA ? pointsA : pointsB;

    return (
      <div className={`flex items-center gap-4 ${isBottomBar && !isTeamA ? 'flex-row-reverse' : ''}`}>
        <span className={`text-xl font-medium ${isBottomBar ? '' : 'w-12'} ${alignClass} text-foreground/60`}>S{sets}</span>
        <span className={`text-3xl font-black ${isBottomBar ? '' : 'w-8'} ${alignClass} text-[#1B9C56]`}>{points}</span>
      </div>
    );
  }

  return null;
}

// Complex Cricket Layout mirroring the provided design exactly
function CricketOverlay({ state }: { state: any }) {
    const isTeamA = state.currentInnings === 'A';
    const battingTeamStr = Array.isArray(isTeamA ? state.config.teamA : state.config.teamB) ? (isTeamA ? state.config.teamA : state.config.teamB).join(' / ') : (isTeamA ? state.config.teamA : state.config.teamB);
    const bowlingTeamStr = Array.isArray(isTeamA ? state.config.teamB : state.config.teamA) ? (isTeamA ? state.config.teamB : state.config.teamA).join(' / ') : (isTeamA ? state.config.teamB : state.config.teamA);
    const runs = isTeamA ? state.runsA : state.runsB;
    const wickets = isTeamA ? state.wicketsA : state.wicketsB;
    const balls = isTeamA ? state.validBallsA : state.validBallsB;
    const oversStr = Math.floor(balls / 6) + "." + (balls % 6);

    const crr = (runs / (balls / 6) || 0).toFixed(2);
    let rrr = "0.00";
    if (state.currentInnings === 'B') {
        const target = state.runsA + 1;
        const runsNeeded = target - state.runsB;
        const ballsRemaining = (state.config.totalOvers * 6) - state.validBallsB;
        rrr = (runsNeeded / (ballsRemaining / 6) || 0).toFixed(2);
    }

    const inningsStr = state.currentInnings === 'A' ? '1ST INNINGS' : '2ND INNINGS';
    const thisOverBalls = (state.currentOverHistory || []).slice(-6);

    const formatTeamName = (name: string) => {
        if (!name) return { first: '', rest: '' };
        const parts = name.split(' ');
        if (parts.length > 1) {
            return { first: parts[0], rest: parts.slice(1).join(' ') };
        }
        return { first: '', rest: name };
    };

    const batTeam = formatTeamName(battingTeamStr);
    const bowlTeam = formatTeamName(bowlingTeamStr);

    return (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none font-sans overflow-hidden z-50">
            
            {/* Top Bar Floating Elements */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-between w-full max-w-[1200px] px-8">
                {/* Date */}
                <div className="bg-[#0f110c] border border-[#74cc1e]/30 text-white font-bold text-sm px-8 py-2 relative flex items-center gap-2" style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)' }}>
                   <span className="text-[#74cc1e]">📅</span> 25 MAY 2024
                </div>

                {/* Tournament Header */}
                <div className="bg-[#0f110c] text-white font-black text-2xl px-12 py-2 flex items-center gap-6 relative" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }}>
                   <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#74cc1e] to-transparent opacity-20" />
                   <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#74cc1e] to-transparent opacity-20" />
                   
                   <div className="w-10 h-10 flex items-center justify-center font-bold text-white bg-[#4a9110] italic">A</div>
                   <span className="tracking-widest">ATHLON CUP 2024</span>
                   <div className="text-[#74cc1e] italic opacity-80">//</div>
                </div>

                {/* Location */}
                <div className="bg-[#0f110c] border border-[#74cc1e]/30 text-[#e0e0e0] font-bold text-sm px-8 py-2 flex items-center gap-2" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }}>
                   <span className="text-[#74cc1e]">📍</span> CITY ARENA, KOCHI
                </div>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[1100px] flex flex-col gap-3 font-sans">
                
                {/* Main Graphic Block */}
                <div className="w-full relative shadow-2xl">
                    
                    {/* Dark Background Base */}
                    <div className="absolute inset-0 bg-[#161616] rounded-xl border border-white/10" style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0% 100%)' }} />

                    <div className="relative flex flex-col">
                        
                        {/* Top Row: Teams and Score */}
                        <div className="flex h-[110px] items-stretch">
                            
                            {/* Batting Team (Green) */}
                            <div className="flex-1 flex items-center justify-between px-10 relative bg-gradient-to-r from-[#0C150A] to-[#142310]" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)' }}>
                                {/* Top colored border */}
                                <div className="absolute top-0 left-0 right-10 h-[3px] bg-[#74cc1e]" />
                                
                                <div className="flex gap-6 items-center w-full">
                                    {/* Shield Logo */}
                                    <div className="w-[70px] h-[80px] bg-black/80 rounded-b-full rounded-t-sm border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(116,204,30,0.3)]">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full border-[3px] border-[#333] flex items-center justify-center">
                                                <div className="w-full h-[2px] bg-[#333] rotate-45" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#74cc1e] font-bold text-base tracking-widest leading-none">{batTeam.first}</span>
                                        <span className="text-white font-black text-[32px] italic tracking-wider leading-none mt-1 shadow-black drop-shadow-md">{batTeam.rest}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Center Score Block */}
                            <div className="w-[340px] shrink-0 bg-[#0A0A0A] relative z-20 flex flex-col items-center justify-center -mx-8 shadow-2xl border-t-2 border-[#74cc1e]" style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)' }}>
                                {/* 1st Innings Pill */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#74cc1e] text-black font-extrabold text-[11px] px-6 py-1 rounded-full tracking-widest shadow-lg">
                                    {inningsStr}
                                </div>

                                <div className="text-white font-black text-[75px] leading-none tracking-tighter mt-4 flex items-end drop-shadow-xl tabular-nums">
                                    {runs}<span className="text-5xl text-gray-300 mx-1">/</span>{wickets}
                                </div>
                                <div className="text-[#74cc1e] font-bold text-sm tracking-widest mt-1">
                                    <span className="text-white text-base mr-1">{oversStr}</span>OVERS
                                </div>
                            </div>

                            {/* Bowling Team (Blue) */}
                            <div className="flex-1 flex items-center justify-between px-10 relative bg-gradient-to-l from-[#08111A] to-[#121A24]" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%)' }}>
                                {/* Top colored border */}
                                <div className="absolute top-0 right-0 left-10 h-[3px] bg-[#1E88E5]" />
                                
                                <div className="flex gap-6 items-center flex-row-reverse w-full">
                                    {/* Shield Logo */}
                                    <div className="w-[70px] h-[80px] bg-black/80 rounded-b-full rounded-t-sm border-2 border-[#1E88E5] flex items-center justify-center shadow-[0_0_15px_rgba(30,136,229,0.3)]">
                                        <div className="w-12 h-12 rounded-full bg-[#1E88E5] flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full border-[3px] border-[#0A1929] flex items-center justify-center">
                                                <div className="w-full h-[2px] bg-[#0A1929] -rotate-45" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[#1E88E5] font-bold text-base tracking-widest leading-none">{bowlTeam.first}</span>
                                        <span className="text-white font-black text-[32px] italic tracking-wider leading-none mt-1 shadow-black drop-shadow-md">{bowlTeam.rest}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Separator glowing line */}
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#74cc1e]/50 to-transparent relative z-30 shadow-[0_0_8px_#74cc1e]" />

                        {/* Bottom Row: Batters & Bowlers (Mocked data to match design perfectly) */}
                        <div className="flex h-[50px] items-center text-sm font-medium px-8 text-[#e0e0e0] bg-[#161616]" style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0% 100%)' }}>
                            
                            {/* Batters */}
                            <div className="flex-1 flex items-center justify-between pr-8 border-r border-white/10 h-full">
                                <div className="flex flex-col w-full h-full justify-center gap-1">
                                    <div className="flex justify-between w-full">
                                        <div className="flex items-center gap-2"><span className="w-2 h-4 bg-[#74cc1e] inline-block skew-x-[-20deg]" /> ARJUN</div>
                                        <div className="font-bold text-white"><span className="text-lg mr-2">56</span> <span className="text-gray-400 text-xs">(42)</span></div>
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <div className="flex items-center gap-2"><span className="w-2 h-4 bg-transparent inline-block" /> VIKRAM</div>
                                        <div className="font-bold text-white"><span className="text-lg mr-2">32</span> <span className="text-gray-400 text-xs">(28)</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Run Rates Center */}
                            <div className="w-[300px] shrink-0 flex items-center justify-center gap-8 text-sm font-bold tracking-widest relative z-30">
                                <div><span className="text-gray-400 mr-2">CRR</span> <span className="text-white text-base">{crr}</span></div>
                                <div className="w-px h-6 bg-white/20" />
                                <div><span className="text-gray-400 mr-2">RRR</span> <span className="text-white text-base">{rrr}</span></div>
                            </div>

                            {/* Bowlers */}
                            <div className="flex-1 flex items-center justify-between pl-8 border-l border-white/10 h-full">
                                <div className="flex flex-col w-full h-full justify-center gap-1">
                                    <div className="flex justify-between w-full">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1E88E5]" /> RAHUL</div>
                                        <div className="font-bold text-white"><span className="text-lg mr-2">2/18</span> <span className="text-gray-400 text-xs">(3.2)</span></div>
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-transparent" /> KARTHIK</div>
                                        <div className="font-bold text-white"><span className="text-lg mr-2">1/22</span> <span className="text-gray-400 text-xs">(4.0)</span></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Lowest Ticker Bar */}
                <div className="w-full h-11 bg-[#0A0A0A] border border-white/10 rounded-full flex items-center justify-between px-6 shadow-2xl relative overflow-hidden mt-1">
                    <div className="absolute top-0 bottom-0 left-0 w-32 bg-[#74cc1e]/10" />
                    
                    <div className="flex items-center gap-4 z-10">
                        <div className="text-[#74cc1e] animate-pulse">((o))</div>
                        <div className="flex flex-col justify-center leading-none">
                            <span className="text-[#74cc1e] text-[9px] font-bold tracking-widest">LIVE FROM</span>
                            <span className="text-white text-[11px] font-bold uppercase tracking-wider mt-0.5">CITY ARENA, KOCHI</span>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="flex items-center gap-6 z-10 flex-1 justify-center">
                        <span className="text-[#74cc1e] text-[11px] font-bold tracking-widest">THIS OVER</span>
                        <div className="flex gap-2">
                            {thisOverBalls.length === 0 ? (
                                <span className="text-gray-500 text-xs italic">Start of Over</span>
                            ) : thisOverBalls.map((b: any, i: number) => {
                                let label = b.runs.toString();
                                if (b.extra === 'WD') label = 'WD';
                                if (b.extra === 'NB') label = 'NB';
                                if (b.isWicket) label = 'W';
                                if (b.runs === 0 && !b.extra && !b.isWicket) label = '•';

                                const isBoundary = b.runs === 4 || b.runs === 6;
                                const isWicket = b.isWicket;
                                const bg = isWicket ? 'bg-[#ff3b3b]' : (isBoundary ? 'bg-[#74cc1e]' : 'bg-[#444]');
                                const textCol = isBoundary ? 'text-black' : 'text-white';

                                return (
                                    <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${bg} ${textCol} shadow-inner`}>
                                        {label}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="flex items-center gap-8 z-10">
                        <div className="flex flex-col leading-none">
                            <span className="text-[#74cc1e] text-[9px] font-bold tracking-widest">PARTNERSHIP</span>
                            <span className="text-white text-[13px] font-bold tracking-wider mt-0.5">88 <span className="text-[10px] text-gray-400">(65)</span></span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[#74cc1e] text-[9px] font-bold tracking-widest">LAST WICKET</span>
                            <span className="text-white text-[13px] font-bold tracking-wider mt-0.5">ROHIT 12 <span className="text-[10px] text-gray-400">(15)</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
