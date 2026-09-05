'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Play,
  Plus,
  Trash2,
  Trophy,
  Swords,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Search,
  CheckCircle2,
  Flame,
  Zap,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  Calendar,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { usePracticeMatchStore, PracticeMatchRecord } from '@/lib/store/usePracticeMatchStore';

type SportType = 'Badminton' | 'Cricket' | 'Football' | 'Volleyball';

export default function MobilePracticeHubPage() {
  const router = useRouter();
  const { records, removeRecord, clearAll } = usePracticeMatchStore();
  const [mounted, setMounted] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeMatches = useMemo(() => records.filter((r) => r.status === 'live'), [records]);
  const pastMatches = useMemo(() => records.filter((r) => r.status === 'completed'), [records]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedSportFilter !== 'ALL' && r.sport.toLowerCase() !== selectedSportFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTeamA = r.teamALabel?.toLowerCase().includes(q);
        const matchesTeamB = r.teamBLabel?.toLowerCase().includes(q);
        const matchesSport = r.sport?.toLowerCase().includes(q);
        const matchesCat = r.category?.toLowerCase().includes(q);
        return matchesTeamA || matchesTeamB || matchesSport || matchesCat;
      }
      return true;
    });
  }, [records, selectedSportFilter, searchQuery]);

  const sportsList: {
    id: SportType;
    label: string;
    icon: string;
    tagline: string;
    badge: string;
    gradient: string;
    accentColor: string;
    href: string;
  }[] = [
    {
      id: 'Badminton',
      label: 'Badminton',
      icon: '🏸',
      tagline: 'Singles & Doubles • 21 Pts',
      badge: 'Voice Umpire',
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30',
      accentColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15',
      href: '/match-setup?sport=Badminton',
    },
    {
      id: 'Cricket',
      label: 'Cricket',
      icon: '🏏',
      tagline: 'Box & Gully • Ball-by-Ball',
      badge: 'Scorecard',
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30',
      accentColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/15',
      href: '/match-setup?sport=Cricket',
    },
    {
      id: 'Football',
      label: 'Football',
      icon: '⚽',
      tagline: 'Futsal & Turf • Goals & Timer',
      badge: 'Live Timer',
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/30',
      accentColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/15',
      href: '/match-setup?sport=Football',
    },
    {
      id: 'Volleyball',
      label: 'Volleyball',
      icon: '🏐',
      tagline: 'Best of Sets • Rally Scores',
      badge: 'Rally Points',
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent border-purple-500/30',
      accentColor: 'text-purple-600 dark:text-purple-400 bg-purple-500/15',
      href: '/match-setup?sport=Volleyball',
    },
  ];

  const handleResumeMatch = (record: PracticeMatchRecord) => {
    router.push(record.liveRoute);
  };

  const handleRematch = (record: PracticeMatchRecord) => {
    const params = new URLSearchParams({
      sport: record.sport,
      teamAName: record.teamALabel,
      teamBName: record.teamBLabel,
    });
    router.push(`/match-setup?${params.toString()}`);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary/20">
      
      {/* ══════════════════════════════════════════════════════════════════════
          1. STYLISH MOBILE TOP BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-foreground/10 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/home"
              className="p-2 -ml-2 rounded-xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0 active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="w-9 h-9 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
              ⚡
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-foreground truncate">
                  Digital Umpire
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
              <p className="text-[10.5px] font-semibold text-foreground/50 truncate">
                Local Device Vault • Offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10.5px] font-black font-mono">
              {records.length} {records.length === 1 ? 'Match' : 'Matches'}
            </span>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN MOBILE CONTAINER
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* ══════════════════════════════════════════════════════════════════════
            2. HERO TACTICAL VAULT CARD
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-[28px] bg-surface border border-foreground/10 p-4 shadow-sm space-y-3.5">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          {/* Top Info Strip */}
          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="w-3 h-3" />
              Match Commander
            </span>

            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-foreground/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Private Vault</span>
            </span>
          </div>

          {/* Metrics Counter Pill Strip */}
          <div className="relative grid grid-cols-3 gap-2 pt-1 border-t border-foreground/10">
            <div className="p-2.5 rounded-2xl bg-foreground/5 border border-foreground/5 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground/45">
                Total Saved
              </div>
              <div className="text-xl font-black font-mono text-primary mt-0.5">
                {records.length}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-foreground/5 border border-foreground/5 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground/45">
                Live Now
              </div>
              <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5 flex items-center justify-center gap-1">
                <span>{activeMatches.length}</span>
                {activeMatches.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-foreground/5 border border-foreground/5 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground/45">
                Completed
              </div>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {pastMatches.length}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            3. 1-TAP SPORT LAUNCHPAD (MOBILE CAROUSEL TILES)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-primary" /> Start New Match
            </span>
            <span className="text-[10px] font-bold text-foreground/40">Tap Sport to Score</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {sportsList.map((sport) => (
              <Link
                key={sport.id}
                href={sport.href}
                className="p-3.5 rounded-2xl bg-surface border border-foreground/10 hover:border-primary/40 active:scale-95 transition-all flex flex-col justify-between gap-3 relative overflow-hidden group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {sport.icon}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${sport.accentColor}`}>
                    {sport.badge}
                  </span>
                </div>

                <div>
                  <div className="font-black text-sm text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{sport.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[10px] text-foreground/50 line-clamp-1 mt-0.5 font-medium">
                    {sport.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            4. ACTIVE LIVE MATCHES IN PROGRESS (IF ANY)
           ══════════════════════════════════════════════════════════════════════ */}
        {activeMatches.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Active Match In Progress ({activeMatches.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {activeMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-surface border-2 border-rose-500/40 shadow-md relative overflow-hidden space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/25">
                      <Flame className="w-3 h-3 fill-current" /> {m.sport}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-foreground/50">
                      Started {formatTime(m.createdAt)}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-black text-foreground">
                      {m.teamALabel} <span className="text-rose-500 font-extrabold mx-1">VS</span> {m.teamBLabel}
                    </div>
                    <div className="text-[11px] text-foreground/50 mt-0.5 font-medium">
                      {m.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-foreground/10">
                    <button
                      onClick={() => handleResumeMatch(m)}
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/25 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Scoring</span>
                    </button>
                    <button
                      onClick={() => removeRecord(m.id)}
                      className="p-2.5 rounded-xl bg-foreground/5 hover:bg-rose-500/10 text-foreground/50 hover:text-rose-500 transition-colors active:scale-95"
                      title="Discard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            5. LOCAL MATCH VAULT & HISTORY STREAM
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-3 pt-2">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Match Vault History
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9.5px] font-black font-mono bg-foreground/5 text-foreground/70 border border-foreground/10">
                {records.length}
              </span>
            </div>

            {records.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      clearAll();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[10.5px] font-black"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 rounded-lg bg-surface border border-foreground/10 text-[10.5px] font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-[10.5px] font-bold text-foreground/40 hover:text-rose-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by player or team..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-foreground/10 text-foreground placeholder:text-foreground/30 text-xs font-bold focus:outline-none focus:border-primary transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sport Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
            {['ALL', 'Badminton', 'Cricket', 'Football', 'Volleyball'].map((sp) => {
              const isSelected = selectedSportFilter === sp;
              return (
                <button
                  key={sp}
                  onClick={() => setSelectedSportFilter(sp)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shadow-sm ${
                    isSelected
                      ? 'bg-primary text-black border-primary font-black'
                      : 'bg-surface border-foreground/10 text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {sp === 'ALL' ? 'All Sports' : sp}
                </button>
              );
            })}
          </div>

          {/* Vault Match Stream Cards */}
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-surface border border-foreground/10 flex flex-col items-center justify-center gap-2.5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/30 text-2xl">
                ⚔️
              </div>
              <div>
                <h4 className="text-xs font-black text-foreground">No Local Matches in Vault</h4>
                <p className="text-[11px] text-foreground/50 max-w-xs mt-0.5">
                  {searchQuery || selectedSportFilter !== 'ALL'
                    ? 'No matches match your filter.'
                    : 'Scored practice matches will be saved here on your device.'}
                </p>
              </div>
              <Link
                href="/match-setup"
                className="mt-1 px-4 py-2 rounded-xl bg-primary text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Setup New Match
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRecords.map((m) => {
                const isLive = m.status === 'live';
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-surface border border-foreground/10 hover:border-foreground/20 transition-all shadow-sm flex flex-col justify-between gap-2.5 group"
                  >
                    <div>
                      {/* Meta Top Line */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9.5px] font-black uppercase tracking-wider">
                            {m.sport}
                          </span>
                          <span className="text-[9.5px] font-bold text-foreground/40 font-mono">
                            {formatDate(m.createdAt)} • {formatTime(m.createdAt)}
                          </span>
                        </div>

                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-wider border border-rose-500/25 animate-pulse">
                            Live
                          </span>
                        ) : m.winner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/25">
                            <Trophy className="w-2.5 h-2.5" /> Won by Team {m.winner}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-foreground/5 text-foreground/60 text-[9px] font-bold uppercase">
                            Finished
                          </span>
                        )}
                      </div>

                      {/* Teams & Score */}
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-foreground truncate">
                          {m.teamALabel} <span className="text-foreground/40 font-normal text-xs mx-1">vs</span> {m.teamBLabel}
                        </div>
                        <div className="text-[10.5px] text-foreground/50 font-medium">
                          {m.category}
                        </div>

                        {(m.scoreA || m.scoreB) && (
                          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-background border border-foreground/10 text-[11px] font-mono font-black text-primary">
                            Score: {m.scoreA || '0'} - {m.scoreB || '0'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Line */}
                    <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                      {isLive ? (
                        <button
                          onClick={() => handleResumeMatch(m)}
                          className="px-3 py-1 rounded-xl bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-current" /> Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRematch(m)}
                          className="px-2.5 py-1 rounded-xl bg-surface hover:bg-foreground/5 border border-foreground/10 text-[11px] font-bold text-foreground/80 flex items-center gap-1 transition-colors active:scale-95"
                          title="Rematch"
                        >
                          <RotateCcw className="w-3 h-3 text-primary" /> Rematch
                        </button>
                      )}

                      <button
                        onClick={() => removeRecord(m.id)}
                        className="p-1 rounded-lg text-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors active:scale-95"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          6. FLOATING ACTION BUTTON (FAB) FOR MATCH SETUP (ICON ONLY: +)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-24 right-4 z-40">
        <Link
          href="/match-setup"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/95 text-black flex items-center justify-center shadow-2xl border-[2.5px] border-black/10 hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
          style={{
            boxShadow: '0 10px 25px -2px var(--athlon-primary-glow, rgba(16, 185, 129, 0.5)), 0 4px 12px rgba(0,0,0,0.3)',
          }}
          title="Setup New Match"
        >
          {/* Glass Specular Highlight */}
          <div className="absolute inset-x-1 top-0 h-[40%] rounded-t-full bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
          <Plus className="w-6 h-6 stroke-[3] text-black relative z-10 transition-transform group-hover:rotate-90 duration-200" />
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
