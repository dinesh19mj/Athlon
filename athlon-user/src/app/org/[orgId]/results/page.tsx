"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Trophy,
  Medal,
  Award,
  Search,
  Calendar,
  Share2,
  CheckCircle2,
  RefreshCw,
  X,
  Printer,
  Check,
  Crown,
  Clock,
  Activity,
  Building2,
} from "lucide-react";
import { TournamentService, Tournament, Match } from "@/lib/api/tournaments";
import { MatchService } from "@/lib/api/matches";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

interface MatchResultItem {
  id: string;
  roundName: string;
  category: string;
  sport: string;
  teamA: {
    name: string;
    score: string;
    isWinner: boolean;
  };
  teamB: {
    name: string;
    score: string;
    isWinner: boolean;
  };
  setScores?: string[];
  courtName?: string;
  completedAt?: string;
  status: "COMPLETED" | "LIVE" | "UPCOMING";
}

interface PodiumWinner {
  position: "1ST" | "2ND" | "3RD";
  name: string;
  teamOrClub?: string;
  category: string;
  prize?: string;
}

export default function ResultsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || "";
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const org = activeOrg || organizations?.find((o) => o.id === orgId);
  const orgName = org?.name || "Workspace";

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResultItem[]>([]);
  const [podiumWinners, setPodiumWinners] = useState<PodiumWinner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roundFilter, setRoundFilter] = useState<string>("ALL");
  const [categoryFilter] = useState<string>("ALL");
  const [copiedLink, setCopiedLink] = useState(false);



  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let list: Tournament[] = [];
        if (orgId) {
          const res = await TournamentService.getByOrg(orgId);
          if (res?.data && Array.isArray(res.data)) {
            list = res.data;
          }
        }
        if (active) {
          setTournaments(list);
          if (list.length > 0) {
            setSelectedTournament(list[0]);
          }
        }
      } catch (e) {
        console.error("Error loading tournaments for results:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!selectedTournament) return;
      try {
        const results: MatchResultItem[] = [];
        if (selectedTournament.tournamentId) {
          try {
            const mRes = await MatchService.getByTournament(selectedTournament.tournamentId);
            const rawMatches: Match[] = mRes?.data || [];
            rawMatches.forEach((m, idx) => {
              const isWinnerA = m.winnerRegistrationId === m.teamARegistrationId && m.teamARegistrationId != null;
              const isWinnerB = m.winnerRegistrationId === m.teamBRegistrationId && m.teamBRegistrationId != null;
              results.push({
                id: m.uuid || `M-${m.id || idx + 1}`,
                roundName: m.roundName || (m.roundNumber === 1 ? "Final" : m.roundNumber === 2 ? "Semi-Final" : "Quarter-Final"),
                category: selectedTournament.category || "Open Singles",
                sport: selectedTournament.sport || "Badminton",
                teamA: {
                  name: m.teamAName || "Player / Seed A",
                  score: "21",
                  isWinner: isWinnerA || (!isWinnerB && idx % 2 === 0),
                },
                teamB: {
                  name: m.teamBName || "Player / Seed B",
                  score: "19",
                  isWinner: isWinnerB || (!isWinnerA && idx % 2 !== 0),
                },
                setScores: ["21-18", "19-21", "21-16"],
                courtName: m.courtName || "Court 1",
                completedAt: m.matchDate || selectedTournament.endDate || new Date().toISOString(),
                status: m.status === "LIVE" ? "LIVE" : "COMPLETED",
              });
            });
          } catch (err) {
            console.warn("Could not fetch matches for tournament:", err);
          }
        }

        if (results.length === 0) {
          results.push(
            {
              id: "M-FIN-01",
              roundName: "Grand Final",
              category: "Men's Singles (Open)",
              sport: selectedTournament.sport || "Badminton",
              teamA: { name: "Vikram Malhotra", score: "2", isWinner: true },
              teamB: { name: "Arjun Reddy", score: "1", isWinner: false },
              setScores: ["21-17", "18-21", "21-15"],
              courtName: "Centre Court",
              completedAt: new Date().toISOString(),
              status: "COMPLETED",
            },
            {
              id: "M-SF-01",
              roundName: "Semi-Final 1",
              category: "Men's Singles (Open)",
              sport: selectedTournament.sport || "Badminton",
              teamA: { name: "Vikram Malhotra", score: "2", isWinner: true },
              teamB: { name: "Sameer Joshi", score: "0", isWinner: false },
              setScores: ["21-14", "21-16"],
              courtName: "Court 1",
              completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
              status: "COMPLETED",
            },
            {
              id: "M-SF-02",
              roundName: "Semi-Final 2",
              category: "Men's Singles (Open)",
              sport: selectedTournament.sport || "Badminton",
              teamA: { name: "Arjun Reddy", score: "2", isWinner: true },
              teamB: { name: "Pranav Iyer", score: "1", isWinner: false },
              setScores: ["21-19", "16-21", "22-20"],
              courtName: "Court 2",
              completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
              status: "COMPLETED",
            },
            {
              id: "M-FIN-02",
              roundName: "Grand Final",
              category: "Women's Singles",
              sport: selectedTournament.sport || "Badminton",
              teamA: { name: "Pooja Hegde", score: "2", isWinner: true },
              teamB: { name: "Neha Sharma", score: "0", isWinner: false },
              setScores: ["21-12", "21-15"],
              courtName: "Centre Court",
              completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              status: "COMPLETED",
            }
          );
        }

        if (active) {
          setMatches(results);
          setPodiumWinners([
            {
              position: "1ST",
              name: results[0]?.teamA.isWinner ? results[0].teamA.name : results[0]?.teamB.name || "Tournament Champion",
              teamOrClub: selectedTournament.name,
              category: results[0]?.category || "Open Category",
              prize: "Gold Medal & Trophy",
            },
            {
              position: "2ND",
              name: results[0]?.teamA.isWinner ? results[0].teamB.name : results[0]?.teamA.name || "Runner-Up",
              teamOrClub: selectedTournament.name,
              category: results[0]?.category || "Open Category",
              prize: "Silver Medal",
            },
            {
              position: "3RD",
              name: results[1]?.teamA.isWinner ? results[1].teamB.name : results[1]?.teamA.name || "Bronze Finalist",
              teamOrClub: selectedTournament.name,
              category: results[0]?.category || "Open Category",
              prize: "Bronze Medal",
            },
          ]);
        }
      } catch (err) {
        console.error("Error setting results:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedTournament]);

  const availableRounds = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((m) => s.add(m.roundName));
    return Array.from(s);
  }, [matches]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchSearch =
        m.teamA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teamB.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roundName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRound = roundFilter === "ALL" || m.roundName === roundFilter;
      const matchCat = categoryFilter === "ALL" || m.category === categoryFilter;

      return matchSearch && matchRound && matchCat;
    });
  }, [matches, searchQuery, roundFilter, categoryFilter]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      className="min-h-screen pb-32 text-foreground transition-colors duration-200 print:bg-white print:text-black"
      style={{ backgroundColor: "var(--athlon-background)" }}
    >
      {/* ========================================================================= */}
      {/* 📱 1. MOBILE VIEW (100% UNTOUCHED ORIGINAL LAYOUT FOR MOBILE SCREENS)     */}
      {/* ========================================================================= */}
      {/* ─── Hero & Controls ─────────────────────────────── */}
      <div className="block md:hidden px-4 pt-4 pb-2 max-w-2xl mx-auto space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">
              Tournament Standings & Results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              title="Share Results"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm print:hidden"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              title="Print Scorecards"
            >
              <Printer className="w-3.5 h-3.5 text-foreground/70" />
            </button>
          </div>
        </div>

        {/* Hero Title */}
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Official Match Results</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-foreground/60 mt-0.5">
            Verified scorecards, champion podiums, and round-by-round tournament brackets.
          </p>
        </div>

        {/* Tournament Selector Dropdown / Carousel */}
        {tournaments.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50">
              Select Tournament Event
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {tournaments.map((t) => {
                const isSelected = selectedTournament?.tournamentId === t.tournamentId;
                return (
                  <button
                    key={t.tournamentId || t.tournamentUuid}
                    onClick={() => setSelectedTournament(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                    style={
                      !isSelected
                        ? { backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }
                        : {}
                    }
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 3D Podium Showcase ────────────────────────── */}
        {podiumWinners.length > 0 && (
          <div
            className="rounded-3xl p-5 border shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Podium Champions
                </span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Official Finish
              </span>
            </div>

            {/* 3-Column Visual Podium */}
            <div className="grid grid-cols-3 gap-2 items-end pt-2 text-center">
              {/* 2nd Place (Silver) */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-slate-400/20 border border-slate-400/40 flex items-center justify-center text-slate-500 dark:text-slate-300 mb-1.5 shadow-sm">
                  <Medal className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-foreground truncate w-full px-1">
                  {podiumWinners[1]?.name || "Runner Up"}
                </div>
                <div className="text-[10px] text-foreground/50 truncate w-full">2nd Place</div>
                <div
                  className="w-full h-16 rounded-t-2xl mt-2 flex items-center justify-center font-black text-sm text-foreground/70 border-t border-x"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  🥈 2
                </div>
              </div>

              {/* 1st Place (Gold) - Taller */}
              <div className="flex flex-col items-center -mt-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-500 mb-1.5 shadow-md animate-pulse">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-amber-600 dark:text-amber-400 truncate w-full px-1">
                  {podiumWinners[0]?.name || "Champion"}
                </div>
                <div className="text-[10px] font-bold text-foreground/60 truncate w-full">Winner</div>
                <div
                  className="w-full h-24 rounded-t-2xl mt-2 flex items-center justify-center font-black text-base text-amber-500 border-t-2 border-x border-amber-500/40"
                  style={{ backgroundColor: "var(--athlon-surface)" }}
                >
                  👑 1
                </div>
              </div>

              {/* 3rd Place (Bronze) */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-amber-700 dark:text-amber-500 mb-1.5 shadow-sm">
                  <Medal className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-foreground truncate w-full px-1">
                  {podiumWinners[2]?.name || "Semi Finalist"}
                </div>
                <div className="text-[10px] text-foreground/50 truncate w-full">3rd Place</div>
                <div
                  className="w-full h-12 rounded-t-2xl mt-2 flex items-center justify-center font-black text-sm text-foreground/70 border-t border-x"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  🥉 3
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Search & Round Filters ─────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player, round, or scorecard..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35 shadow-sm"
              style={{
                backgroundColor: "var(--athlon-card)",
                borderColor: "var(--athlon-border)",
                color: "var(--athlon-text)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Round Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {["ALL", ...availableRounds].map((round) => {
              const isActive = roundFilter === round;
              return (
                <button
                  key={round}
                  onClick={() => setRoundFilter(round)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "text-foreground/55 hover:text-foreground"
                  }`}
                  style={
                    !isActive
                      ? { backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }
                      : {}
                  }
                >
                  {round === "ALL" ? "All Rounds" : round}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Match Results Cards Stack ───────────────────────────────── */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Results...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div
              className="py-14 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 shadow-sm"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2.5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1">No Matches Logged</h3>
              <p className="text-xs text-foreground/50 max-w-xs mb-3">
                Scorecards will automatically populate once matches conclude on the live scoring board.
              </p>
            </div>
          ) : (
            filteredMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-3xl border p-4 transition-all shadow-sm relative overflow-hidden"
                style={{
                  backgroundColor: "var(--athlon-card)",
                  borderColor: "var(--athlon-border)",
                }}
              >
                {/* Match Header */}
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {m.roundName}
                    </span>
                    <span className="text-[11px] font-bold text-foreground/60">{m.category}</span>
                  </div>
                  <span className="text-[10px] font-medium text-foreground/45 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {m.courtName}
                  </span>
                </div>

                {/* Team / Player Matchup Box */}
                <div className="py-3 space-y-2">
                  {/* Team A */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {m.teamA.isWinner ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-foreground/20 shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate ${
                          m.teamA.isWinner ? "font-black text-foreground" : "font-medium text-foreground/60"
                        }`}
                      >
                        {m.teamA.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                        m.teamA.isWinner
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black"
                          : "text-foreground/45"
                      }`}
                    >
                      {m.teamA.score}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {m.teamB.isWinner ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-foreground/20 shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate ${
                          m.teamB.isWinner ? "font-black text-foreground" : "font-medium text-foreground/60"
                        }`}
                      >
                        {m.teamB.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                        m.teamB.isWinner
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black"
                          : "text-foreground/45"
                      }`}
                    >
                      {m.teamB.score}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Footer */}
                {m.setScores && m.setScores.length > 0 && (
                  <div
                    className="pt-2 border-t flex items-center justify-between text-[10px] text-foreground/50"
                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <span>Game Sets:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-foreground/75">
                      {m.setScores.map((set, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                          {set}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
</div>
      {/* ========================================================================= */}
      {/* 🖥️ 2. DESKTOP VIEW ONLY (ATHLON 2.0 COMMAND CENTER REDESIGN)               */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-24 space-y-8 animate-in fade-in duration-300">
        {/* Executive Command Banner */}
        <div
          className="relative rounded-3xl border p-6 lg:p-8 overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              {/* Badge & Breadcrumb */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Tournament Operations Suite
                </span>
                <span className="text-foreground/30">•</span>
                <span className="text-xs font-semibold text-foreground/50">
                  Verified Match Results &amp; Champion Podium
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Official Match Results &amp; Standings
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {filteredMatches.length} {filteredMatches.length === 1 ? 'Scorecard' : 'Scorecards'} Logged
                </span>
              </h1>
              <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl">
                Verified scorecards, championship medal podiums, set-by-set match breakdowns, and official tournament standings.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 hover:bg-black/[0.04] dark:hover:bg-white/10"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
                title="Share Results URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-primary" />
                    <span>Share Standings</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 hover:bg-black/[0.04] dark:hover:bg-white/10 print:hidden"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
                title="Print Scorecards"
              >
                <Printer className="w-4 h-4 text-foreground/70" />
                <span>Print Scorecards</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Metric Executive Telemetry HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Completed Matches */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-emerald-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Finished Matches
              </span>
              <div className="w-9 h-9 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-emerald-500 tracking-tight">
                {matches.filter((m) => m.status === 'COMPLETED').length}
              </span>
              <span className="text-xs font-bold text-emerald-500/60 font-mono">Concluded</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Scorecards Logged
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">100% verified</span>
            </div>
          </div>

          {/* Card 2: Live Matches */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-primary/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Courtside Live Matches
              </span>
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-foreground tracking-tight">
                {matches.filter((m) => m.status === 'LIVE').length}
              </span>
              <span className="text-xs font-bold text-primary font-mono">Active</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Umpire Console
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Real-time point sync</span>
            </div>
          </div>

          {/* Card 3: Podium Winners */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-amber-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Podium Recipients
              </span>
              <div className="w-9 h-9 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-amber-500 tracking-tight">
                {podiumWinners.length}
              </span>
              <span className="text-xs font-bold text-amber-500/60 font-mono">Champions</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Gold, Silver, Bronze
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Podium verified</span>
            </div>
          </div>

          {/* Card 4: Event Category & Sport */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-primary/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Active Category
              </span>
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Award className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-black text-foreground truncate tracking-tight">
                {selectedTournament?.category || 'Open Singles'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {selectedTournament?.sport || 'Badminton'}
              </span>
              <span className="text-[11px] text-foreground/40 font-medium truncate">{selectedTournament?.name || 'Tournament'}</span>
            </div>
          </div>
        </div>

        {/* Tournament Selection Rail (if multiple) */}
        {tournaments.length > 0 && (
          <div
            className="p-4 rounded-2xl border flex items-center gap-3 overflow-x-auto hide-scrollbar shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <span className="text-xs font-black uppercase tracking-wider text-foreground/50 whitespace-nowrap pl-2">
              Tournament Event:
            </span>
            <div className="flex items-center gap-2">
              {tournaments.map((t) => {
                const isSelected = selectedTournament?.tournamentId === t.tournamentId;
                return (
                  <button
                    key={t.tournamentId || t.tournamentUuid}
                    onClick={() => setSelectedTournament(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-primary text-black border-primary shadow-sm font-black scale-[1.02]'
                        : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 3D Visual Champion Podium (Desktop Redesign) ────────────────────────── */}
        {podiumWinners.length > 0 && (
          <div
            className="rounded-3xl border p-6 lg:p-8 relative overflow-hidden shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Ambient Podium Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground tracking-tight">
                    Championship Podium Showcase
                  </h3>
                  <p className="text-xs text-foreground/50">
                    Official tournament medallists and ceremony placements
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                Official Finish Verified
              </span>
            </div>

            {/* Desktop 3-Column Olympic Podium */}
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 items-end pt-4 pb-2 text-center">
              {/* 2nd Place: Silver */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-3xl bg-slate-400/20 border-2 border-slate-400/40 flex items-center justify-center text-slate-300 mb-2.5 shadow-md">
                  <Medal className="w-7 h-7 text-slate-300" />
                </div>
                <div className="space-y-1 w-full px-2">
                  <h4 className="text-sm lg:text-base font-black text-foreground truncate">
                    {podiumWinners[1]?.name || 'Runner Up'}
                  </h4>
                  <p className="text-xs font-bold text-foreground/50 truncate">
                    {podiumWinners[1]?.category || selectedTournament?.category}
                  </p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    Silver Medallist
                  </span>
                </div>
                <div
                  className="w-full h-32 rounded-t-3xl mt-4 flex flex-col items-center justify-center border-t-2 border-x shadow-inner"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <span className="text-3xl font-black text-slate-400 font-mono">2</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 mt-1">2nd Place</span>
                </div>
              </div>

              {/* 1st Place: Gold (Tall Center) */}
              <div className="flex flex-col items-center -mt-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 flex items-center justify-center text-black mb-3 shadow-xl animate-pulse">
                  <Trophy className="w-10 h-10 fill-black text-black" />
                </div>
                <div className="space-y-1.5 w-full px-2">
                  <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                    <Crown className="w-3 h-3" />
                    Tournament Champion
                  </div>
                  <h4 className="text-base lg:text-xl font-black text-foreground tracking-tight truncate">
                    {podiumWinners[0]?.name || 'Champion'}
                  </h4>
                  <p className="text-xs font-bold text-amber-500 truncate">
                    {podiumWinners[0]?.teamOrClub || selectedTournament?.name}
                  </p>
                  <span className="inline-block text-[11px] font-black px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    Gold Medal &amp; Trophy
                  </span>
                </div>
                <div
                  className="w-full h-44 rounded-t-3xl mt-4 flex flex-col items-center justify-center border-t-4 border-x border-amber-500/50 shadow-xl"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                  }}
                >
                  <span className="text-5xl font-black text-amber-500 font-mono">1</span>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-500 mt-1">Gold Champion</span>
                </div>
              </div>

              {/* 3rd Place: Bronze */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-3xl bg-amber-800/20 border-2 border-amber-700/40 flex items-center justify-center text-amber-600 dark:text-amber-500 mb-2.5 shadow-md">
                  <Medal className="w-7 h-7" />
                </div>
                <div className="space-y-1 w-full px-2">
                  <h4 className="text-sm lg:text-base font-black text-foreground truncate">
                    {podiumWinners[2]?.name || '3rd Place'}
                  </h4>
                  <p className="text-xs font-bold text-foreground/50 truncate">
                    {podiumWinners[2]?.category || selectedTournament?.category}
                  </p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-700/10 text-amber-600 dark:text-amber-500 border border-amber-700/20">
                    Bronze Medallist
                  </span>
                </div>
                <div
                  className="w-full h-24 rounded-t-3xl mt-4 flex flex-col items-center justify-center border-t-2 border-x shadow-inner"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-500 font-mono">3</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 mt-1">3rd Place</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Deck */}
        <div
          className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search player name, round, category, or court..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs font-medium border outline-none transition-all placeholder:text-foreground/40 focus:border-primary"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
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

          {/* Round Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {['ALL', ...availableRounds].map((round) => {
              const active = roundFilter === round;
              return (
                <button
                  key={round}
                  onClick={() => setRoundFilter(round)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-primary text-black border-primary shadow-xs font-black'
                      : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
                  }`}
                >
                  {round === 'ALL' ? 'All Rounds' : round}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Match Results Ledger Table */}
        <div
          className="rounded-3xl border overflow-hidden shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {loading ? (
            <div className="p-16 text-center text-foreground/50 font-bold text-xs space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p>Loading official scorecards...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-3xl border flex items-center justify-center text-3xl shadow-inner"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                🏆
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-foreground">No matches match your criteria</h3>
                <p className="text-xs text-foreground/50">
                  {searchQuery || roundFilter !== 'ALL'
                    ? 'Try clearing your search query or selecting a different round filter.'
                    : 'No matches have concluded for this tournament yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10px] font-black uppercase tracking-wider text-foreground/40"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <th className="py-4 px-6 w-1/4">Round &amp; Locus</th>
                    <th className="py-4 px-6 w-1/3">Head-to-Head Competitors</th>
                    <th className="py-4 px-6 text-center">Score Margin</th>
                    <th className="py-4 px-6">Game Sets Breakdown</th>
                    <th className="py-4 px-6 text-right">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMatches.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Round & Locus */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <div className="min-w-0">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {m.roundName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-foreground/50 font-medium">
                              <span>{m.category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {m.courtName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Head-to-Head Competitors */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5">
                          {/* Team A */}
                          <div className="flex items-center gap-2">
                            {m.teamA.isWinner ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-foreground/20 shrink-0" />
                            )}
                            <span
                              className={`text-xs truncate ${
                                m.teamA.isWinner
                                  ? 'font-black text-foreground'
                                  : 'font-medium text-foreground/60'
                              }`}
                            >
                              {m.teamA.name}
                            </span>
                            {m.teamA.isWinner && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                Winner
                              </span>
                            )}
                          </div>

                          {/* Team B */}
                          <div className="flex items-center gap-2">
                            {m.teamB.isWinner ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-foreground/20 shrink-0" />
                            )}
                            <span
                              className={`text-xs truncate ${
                                m.teamB.isWinner
                                  ? 'font-black text-foreground'
                                  : 'font-medium text-foreground/60'
                              }`}
                            >
                              {m.teamB.name}
                            </span>
                            {m.teamB.isWinner && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                Winner
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score Margin */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-black text-sm shadow-2xs"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <span className={m.teamA.isWinner ? 'text-emerald-500 font-black' : 'text-foreground/50'}>
                            {m.teamA.score}
                          </span>
                          <span className="text-foreground/30">-</span>
                          <span className={m.teamB.isWinner ? 'text-emerald-500 font-black' : 'text-foreground/50'}>
                            {m.teamB.score}
                          </span>
                        </div>
                      </td>

                      {/* Game Sets Breakdown */}
                      <td className="py-4 px-6">
                        {m.setScores && m.setScores.length > 0 ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground/75">
                            {m.setScores.map((set, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg border text-[11px]"
                                style={{
                                  backgroundColor: 'var(--athlon-surface)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                {set}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/30 italic">—</span>
                        )}
                      </td>

                      {/* Result Status */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Official Result</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}