'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Search,
  Filter,
  Medal,
  Award,
  Crown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  User,
  Shield,
  Trophy,
  Activity,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Extended Mock data for rankings
const initialRankings = [
  {
    rank: 1,
    name: 'Alex Rivers',
    points: 15200,
    elo: 1850,
    winRate: '92%',
    streak: '8W',
    category: 'Men\'s Singles',
    trend: 'up',
    change: 0,
    isCurrentUser: false,
    matchesPlayed: 45,
  },
  {
    rank: 2,
    name: 'Jordan Lee',
    points: 14850,
    elo: 1790,
    winRate: '88%',
    streak: '5W',
    category: 'Men\'s Singles',
    trend: 'up',
    change: 2,
    isCurrentUser: false,
    matchesPlayed: 42,
  },
  {
    rank: 3,
    name: 'Sam Smith',
    points: 13900,
    elo: 1720,
    winRate: '84%',
    streak: '3W',
    category: 'Men\'s Singles',
    trend: 'down',
    change: -1,
    isCurrentUser: false,
    matchesPlayed: 39,
  },
  {
    rank: 4,
    name: 'Player',
    points: 12450,
    elo: 1650,
    winRate: '79%',
    streak: '4W',
    category: 'Men\'s Singles',
    trend: 'up',
    change: 5,
    isCurrentUser: true,
    matchesPlayed: 35,
  },
  {
    rank: 5,
    name: 'Taylor Davis',
    points: 11200,
    elo: 1580,
    winRate: '75%',
    streak: '2W',
    category: 'Men\'s Singles',
    trend: 'same',
    change: 0,
    isCurrentUser: false,
    matchesPlayed: 32,
  },
  {
    rank: 6,
    name: 'Morgan Chen',
    points: 10800,
    elo: 1520,
    winRate: '71%',
    streak: '1L',
    category: 'Men\'s Singles',
    trend: 'down',
    change: -1,
    isCurrentUser: false,
    matchesPlayed: 30,
  },
  {
    rank: 7,
    name: 'Chris Evans',
    points: 9500,
    elo: 1460,
    winRate: '68%',
    streak: '2L',
    category: 'Men\'s Singles',
    trend: 'down',
    change: -2,
    isCurrentUser: false,
    matchesPlayed: 28,
  },
  {
    rank: 8,
    name: 'Tom Holland',
    points: 8900,
    elo: 1410,
    winRate: '65%',
    streak: '3W',
    category: 'Men\'s Singles',
    trend: 'up',
    change: 3,
    isCurrentUser: false,
    matchesPlayed: 25,
  },
];

export default function PlayerRankingsPage() {
  const router = useRouter();
  const { userEmail } = useAuthStore();
  const displayName = userEmail ? userEmail.split('@')[0] : 'Player';

  const [selectedCategory, setSelectedCategory] = useState<string>("Men's Singles");
  const [searchQuery, setSearchQuery] = useState('');

  const podiumTrackRef = useRef<HTMLDivElement>(null);
  const leaderboardTrackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categories = ["Men's Singles", "Women's Singles", "Men's Doubles", "Mixed Doubles"];

  const filteredRankings = initialRankings.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const podiumPlayers = filteredRankings.slice(0, 3);
  const otherPlayers = filteredRankings.slice(3);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.3)]" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]" />;
    return <span className="w-5 h-5 flex items-center justify-center font-black text-foreground/40">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-32">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* HEADER */}
        <header className="px-4 py-6 flex items-center justify-between shrink-0 relative z-10">
          <button
            onClick={() => router.push('/player')}
            className="p-3 -ml-3 text-foreground/70 hover:text-foreground transition-colors bg-foreground/0 hover:bg-foreground/5 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black uppercase tracking-widest text-foreground drop-shadow-md">
              Global Rankings
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp className="w-3 h-3 text-[#3B82F6]" />
              <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">Season 2026</span>
            </div>
          </div>
          <button className="p-3 -mr-3 text-foreground/70 hover:text-foreground transition-colors bg-foreground/0 hover:bg-foreground/5 rounded-full">
            <Filter className="w-6 h-6" />
          </button>
        </header>

        {/* SEARCH & FILTER */}
        <div className="px-4 pb-6 relative z-10 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
            <input
              type="text"
              placeholder="Search players..."
              className="w-full bg-surface border border-foreground/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-foreground placeholder-white/30 focus:outline-none focus:border-[#3B82F6]/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all shadow-xl"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
            <button className="px-4 py-2 bg-[#3B82F6] text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
              Men's Singles
            </button>
            <button className="px-4 py-2 bg-surface border border-foreground/5 text-foreground/60 hover:text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors">
              Women's Singles
            </button>
            <button className="px-4 py-2 bg-surface border border-foreground/5 text-foreground/60 hover:text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors">
              Mixed Doubles
            </button>
          </div>
        </div>

        {/* RANKINGS LIST */}
        <div className="overflow-y-auto px-4 relative z-10 hide-scrollbar space-y-3">
          {initialRankings.map((player, i) => (
            <div
              key={player.rank}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden ${
                player.isCurrentUser
                  ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 shadow-lg shadow-[#3B82F6]/5'
                  : 'bg-surface border border-foreground/5 hover:bg-foreground/5'
              }`}
            >
              {player.isCurrentUser && <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#3B82F6]" />}

              <div className="w-8 flex justify-center shrink-0">{getRankIcon(player.rank)}</div>

              <div className="flex-1 min-w-0">
                <h3
                  className={`font-extrabold truncate ${
                    player.isCurrentUser ? 'text-[#3B82F6] text-base' : 'text-foreground text-sm'
                  }`}
                >
                  {player.isCurrentUser ? displayName : player.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    {player.points.toLocaleString()} PTS
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                {player.change > 0 ? (
                  <div className="flex items-center gap-0.5 text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold">+{player.change}</span>
                  </div>
                ) : player.change < 0 ? (
                  <div className="flex items-center gap-0.5 text-red-500">
                    <TrendingUp className="w-3 h-3 rotate-180" />
                    <span className="text-[10px] font-bold">{player.change}</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-foreground/20">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - HORIZONTAL SCROLLING PODIUM & LEADERBOARD TRACKS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Header Command Bar */}
        <div
          className="border-b px-8 py-8 bg-gradient-to-b from-card/70 via-card/30 to-background"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground">
                    Athlete Leaderboard &amp; Rankings
                  </h1>
                  <p className="text-xs text-foreground/50">
                    Global Season 2026 ELO points, podium rankings, and division leaderboards
                  </p>
                </div>
              </div>

              {/* Live Search Bar */}
              <div className="relative w-72">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search athlete by name..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.02]'
                      : 'border text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    borderColor: selectedCategory === cat ? 'transparent' : 'var(--athlon-border)',
                    backgroundColor: selectedCategory === cat ? 'var(--athlon-primary)' : 'var(--athlon-surface)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Main Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-8 space-y-12">
          {/* 1. Top 3 Podium Cards Track (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-yellow-500" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Podium Leaders (Top 3)</h2>
                  <p className="text-xs text-foreground/50">Current gold, silver, and bronze division champions</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(podiumTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(podiumTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={podiumTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {podiumPlayers.map((player) => {
                const isGold = player.rank === 1;
                const isSilver = player.rank === 2;
                const isBronze = player.rank === 3;

                return (
                  <div key={player.rank} className="snap-start shrink-0 w-[360px]">
                    <div
                      className={`p-6 rounded-[28px] border relative overflow-hidden h-full flex flex-col justify-between shadow-2xl transition-all group ${
                        isGold
                          ? 'border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 via-card to-card'
                          : isSilver
                          ? 'border-zinc-300/40 bg-gradient-to-b from-zinc-300/10 via-card to-card'
                          : 'border-amber-600/40 bg-gradient-to-b from-amber-600/10 via-card to-card'
                      }`}
                      style={{ backgroundColor: 'var(--athlon-card)' }}
                    >
                      <div
                        className={`h-1.5 w-full absolute top-0 left-0 right-0 ${
                          isGold ? 'bg-yellow-500' : isSilver ? 'bg-zinc-300' : 'bg-amber-600'
                        }`}
                      />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm border shadow-lg ${
                                isGold
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                                  : isSilver
                                  ? 'bg-zinc-300/20 text-zinc-300 border-zinc-300/40'
                                  : 'bg-amber-600/20 text-amber-400 border-amber-600/40'
                              }`}
                            >
                              #{player.rank}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                              {isGold ? 'Division Leader' : isSilver ? 'Rank 2 Contender' : 'Rank 3 Podium'}
                            </span>
                          </div>
                          {getRankIcon(player.rank)}
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-foreground">{player.name}</h3>
                          <span className="text-xs text-primary font-bold font-mono">
                            {player.points.toLocaleString()} PTS
                          </span>
                        </div>

                        {/* Telemetry Row */}
                        <div
                          className="grid grid-cols-3 gap-2 p-3 rounded-2xl border text-center"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">ELO</span>
                            <span className="text-xs font-black text-foreground font-mono">{player.elo}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Win Rate</span>
                            <span className="text-xs font-black text-emerald-400 font-mono">{player.winRate}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Streak</span>
                            <span className="text-xs font-black text-amber-400 font-mono">{player.streak}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between text-xs text-foreground/50 pt-3 mt-4 border-t"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span>{player.matchesPlayed} Matches In-Season</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> Form: Prime
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Full Division Leaderboard Track (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Division Athletes (Ranks 4 – {initialRankings.length})
                  </h2>
                  <p className="text-xs text-foreground/50">Complete rankings ladder with performance telemetry</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(leaderboardTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(leaderboardTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={leaderboardTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {otherPlayers.map((player) => (
                <div key={player.rank} className="snap-start shrink-0 w-[360px]">
                  <div
                    className={`p-6 rounded-[28px] border relative overflow-hidden h-full flex flex-col justify-between shadow-xl transition-all group ${
                      player.isCurrentUser
                        ? 'border-primary/50 bg-gradient-to-b from-primary/10 via-card to-card ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: player.isCurrentUser ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                    }}
                  >
                    {player.isCurrentUser && (
                      <div className="h-1.5 w-full bg-primary absolute top-0 left-0 right-0" />
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-surface border border-foreground/10 flex items-center justify-center font-black text-xs text-foreground/60">
                            #{player.rank}
                          </span>
                          {player.isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/30">
                              You
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {player.change > 0 ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center">
                              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{player.change}
                            </span>
                          ) : player.change < 0 ? (
                            <span className="text-xs font-bold text-red-400 flex items-center">
                              <TrendingUp className="w-3.5 h-3.5 rotate-180 mr-0.5" />
                              {player.change}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-foreground/30">—</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3
                          className={`text-base font-black truncate ${
                            player.isCurrentUser ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {player.isCurrentUser ? displayName : player.name}
                        </h3>
                        <span className="text-xs text-foreground/60 font-mono font-bold">
                          {player.points.toLocaleString()} PTS
                        </span>
                      </div>

                      <div
                        className="grid grid-cols-3 gap-2 p-3 rounded-2xl border text-center"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div>
                          <span className="text-[9px] uppercase font-bold text-foreground/40 block">ELO</span>
                          <span className="text-xs font-black text-foreground font-mono">{player.elo}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-foreground/40 block">Win Rate</span>
                          <span className="text-xs font-black text-emerald-400 font-mono">{player.winRate}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-foreground/40 block">Streak</span>
                          <span className="text-xs font-black text-amber-400 font-mono">{player.streak}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between text-xs text-foreground/50 pt-3 mt-4 border-t"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <span>{player.matchesPlayed} Matches</span>
                      <span className="text-foreground/70 font-semibold">{player.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
