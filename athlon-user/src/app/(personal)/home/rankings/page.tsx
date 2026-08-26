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
  X,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
    category: "Men's Singles",
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
  const currentUserPlayer = initialRankings.find((p) => p.isCurrentUser);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.3)]" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]" />;
    return <span className="w-5 h-5 flex items-center justify-center font-black text-foreground/40">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - REDESIGNED ATHLON SPORTS RANKINGS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-28 min-h-screen">
        {/* Compact Sticky Top Navbar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-3.5 py-2.5 backdrop-blur-xl border-b transition-all"
          style={{
            backgroundColor: 'var(--athlon-navigation)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/home"
              className="w-8 h-8 rounded-xl flex items-center justify-center border text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                  Rankings
                </h1>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25 font-mono shrink-0">
                  {filteredRankings.length}
                </span>
              </div>
              <p className="text-[10px] text-foreground/50 font-bold truncate">
                Global Season 2026 ELO Ladder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-primary/10 border border-primary/20 text-primary">
              <Zap className="w-3 h-3 text-primary" />
              <span>Season 2026</span>
            </span>
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-3.5 flex flex-col gap-3.5 pt-3">
          {/* Live Search Bar */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete by name..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs font-medium outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/40"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Chips (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-px-3 hide-scrollbar -mx-3.5 px-3.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02] font-black'
                      : 'border-transparent text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                    borderColor: isSelected ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* ─── 3D-STYLE VISUAL PODIUM STAGE (TOP 3) ─── */}
          {!searchQuery && podiumPlayers.length === 3 && (
            <div
              className="p-4 rounded-2xl border relative overflow-hidden shadow-xl"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-[10.5px] font-mono font-black uppercase tracking-wider text-yellow-400">
                    Podium Champions
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-foreground/40 font-mono">Top 3 Standings</span>
              </div>

              {/* Podium Pedestals Row */}
              <div className="flex items-end justify-center gap-2 pt-2">
                {/* 🥈 Rank 2 (Silver) */}
                <div className="flex flex-col items-center flex-1 max-w-[100px]">
                  <div className="relative mb-1.5">
                    <div className="w-11 h-11 rounded-full bg-zinc-800 border-2 border-zinc-300 flex items-center justify-center font-black text-xs text-zinc-200 shadow-md">
                      {podiumPlayers[1]?.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-700 border border-zinc-300 flex items-center justify-center text-[9px] font-black text-zinc-200">
                      2
                    </span>
                  </div>
                  <div className="text-center min-w-0 w-full mb-1">
                    <div className="text-[10.5px] font-black truncate text-foreground">
                      {podiumPlayers[1]?.name}
                    </div>
                    <div className="text-[9px] font-bold text-primary font-mono">
                      {podiumPlayers[1]?.points.toLocaleString()} PTS
                    </div>
                  </div>
                  <div className="h-16 w-full bg-gradient-to-t from-zinc-500/20 to-zinc-500/5 rounded-t-xl border-t-2 border-zinc-300/60 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono font-black text-zinc-300">
                      {podiumPlayers[1]?.elo} ELO
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400">
                      {podiumPlayers[1]?.winRate} WR
                    </span>
                  </div>
                </div>

                {/* 👑 Rank 1 (Gold - Center & Elevated) */}
                <div className="flex flex-col items-center flex-1 max-w-[115px] -mt-3">
                  <div className="relative mb-1.5">
                    <div className="w-14 h-14 rounded-full bg-yellow-950/40 border-2 border-yellow-400 flex items-center justify-center font-black text-sm text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                      {podiumPlayers[0]?.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 border border-yellow-200 flex items-center justify-center text-[10px] font-black text-black">
                      👑
                    </span>
                  </div>
                  <div className="text-center min-w-0 w-full mb-1">
                    <div className="text-xs font-black truncate text-yellow-400">
                      {podiumPlayers[0]?.name}
                    </div>
                    <div className="text-[9.5px] font-black text-primary font-mono">
                      {podiumPlayers[0]?.points.toLocaleString()} PTS
                    </div>
                  </div>
                  <div className="h-24 w-full bg-gradient-to-t from-yellow-500/25 to-yellow-500/5 rounded-t-xl border-t-2 border-yellow-400 flex flex-col items-center justify-center">
                    <span className="text-xs font-mono font-black text-yellow-300">
                      {podiumPlayers[0]?.elo} ELO
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400">
                      {podiumPlayers[0]?.winRate} WR · {podiumPlayers[0]?.streak}
                    </span>
                  </div>
                </div>

                {/* 🥉 Rank 3 (Bronze) */}
                <div className="flex flex-col items-center flex-1 max-w-[100px]">
                  <div className="relative mb-1.5">
                    <div className="w-11 h-11 rounded-full bg-amber-950/40 border-2 border-amber-600 flex items-center justify-center font-black text-xs text-amber-300 shadow-md">
                      {podiumPlayers[2]?.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-800 border border-amber-500 flex items-center justify-center text-[9px] font-black text-amber-200">
                      3
                    </span>
                  </div>
                  <div className="text-center min-w-0 w-full mb-1">
                    <div className="text-[10.5px] font-black truncate text-foreground">
                      {podiumPlayers[2]?.name}
                    </div>
                    <div className="text-[9px] font-bold text-primary font-mono">
                      {podiumPlayers[2]?.points.toLocaleString()} PTS
                    </div>
                  </div>
                  <div className="h-12 w-full bg-gradient-to-t from-amber-600/20 to-amber-600/5 rounded-t-xl border-t-2 border-amber-600/60 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono font-black text-amber-400">
                      {podiumPlayers[2]?.elo} ELO
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400">
                      {podiumPlayers[2]?.winRate} WR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── YOUR CURRENT STANDING HIGHLIGHT (Pinned Card) ─── */}
          {currentUserPlayer && !searchQuery && (
            <div
              className="p-3 rounded-2xl border flex items-center justify-between shadow-lg relative overflow-hidden"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-primary)',
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              <div className="flex items-center gap-2.5 min-w-0 pl-1.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-primary)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  #{currentUserPlayer.rank}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black truncate text-foreground">
                      {displayName}
                    </span>
                    <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
                      You
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/60 mt-0.5">
                    <span className="font-mono">{currentUserPlayer.elo} ELO</span>
                    <span>•</span>
                    <span className="text-emerald-400">{currentUserPlayer.winRate} Win</span>
                    <span>•</span>
                    <span className="text-amber-400">{currentUserPlayer.streak}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-black font-mono text-primary">
                  {currentUserPlayer.points.toLocaleString()}
                </span>
                <span className="text-[8.5px] font-bold text-foreground/40 uppercase tracking-widest">
                  PTS
                </span>
                {currentUserPlayer.change > 0 && (
                  <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <ChevronUp className="w-3 h-3" /> +{currentUserPlayer.change}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ─── FULL LEADERBOARD LADDER ─── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-foreground/60">
                {searchQuery ? 'Search Results' : 'Complete Division Ladder'}
              </span>
              <span className="text-[9.5px] font-bold text-foreground/40 font-mono">
                {filteredRankings.length} Athletes
              </span>
            </div>

            {filteredRankings.length === 0 ? (
              <div
                className="py-12 px-4 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    No Athletes Found
                  </h3>
                  <p className="text-[11px] text-foreground/50 mt-1 max-w-xs mx-auto">
                    No ranking records match "{searchQuery}".
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRankings.map((player) => {
                  const isTop3 = player.rank <= 3;
                  const isGold = player.rank === 1;
                  const isSilver = player.rank === 2;
                  const isBronze = player.rank === 3;

                  return (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all shadow-sm ${
                        player.isCurrentUser ? 'ring-1' : ''
                      }`}
                      style={{
                        backgroundColor: player.isCurrentUser ? 'var(--athlon-card)' : 'var(--athlon-surface)',
                        borderColor: player.isCurrentUser ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                            isGold
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                              : isSilver
                              ? 'bg-zinc-300/20 text-zinc-300 border-zinc-300/40'
                              : isBronze
                              ? 'bg-amber-600/20 text-amber-400 border-amber-600/40'
                              : 'bg-black/20 text-foreground/60 border-white/5'
                          }`}
                        >
                          #{player.rank}
                        </div>

                        {/* Avatar / Initial */}
                        <div
                          className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                        >
                          {player.name.charAt(0)}
                        </div>

                        {/* Player Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4
                              className={`text-xs font-black truncate ${
                                player.isCurrentUser ? 'text-primary' : 'text-foreground'
                              }`}
                            >
                              {player.isCurrentUser ? displayName : player.name}
                            </h4>
                            {player.isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 text-[8px] font-black uppercase shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] text-foreground/55 font-medium truncate mt-0.5">
                            <span className="font-mono font-bold text-foreground/75">{player.elo} ELO</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{player.winRate} Win</span>
                            <span>•</span>
                            <span>{player.matchesPlayed} Matches</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Points & Delta */}
                      <div className="flex flex-col items-end shrink-0 ml-2">
                        <span className="text-xs font-black font-mono text-primary">
                          {player.points.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {player.change > 0 ? (
                            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                              <ChevronUp className="w-3 h-3" /> +{player.change}
                            </span>
                          ) : player.change < 0 ? (
                            <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5">
                              <ChevronDown className="w-3 h-3" /> {player.change}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-foreground/30 flex items-center gap-0.5">
                              <Minus className="w-2.5 h-2.5" /> 0
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
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
