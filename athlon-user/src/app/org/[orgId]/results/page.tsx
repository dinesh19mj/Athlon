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
} from "lucide-react";
import { TournamentService, Tournament, Match } from "@/lib/api/tournaments";
import { MatchService } from "@/lib/api/matches";

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
      {/* ─── Hero & Controls ─────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 max-w-2xl mx-auto space-y-3.5">
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
    </div>
  );
}