"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gavel,
  Flame,
  Coins,
  Users,
  Shield,
  Clock,
  Plus,
  Radio,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  Layers,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Link from "next/link";
import {
  AuctionService,
  AuctionState,
  AuctionPlayer,
  AuctionTeamSummary,
  AuctionBid,
} from "@/lib/api/auction";
import { TeamChampionshipService, TeamChampionship } from "@/lib/api/teamChampionship";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function TeamOwnerAuctionArenaPage() {
  const params = useParams();
  const championshipUuid = params.id as string;
  const router = useRouter();
  const { userId, isAuthenticated } = useAuthStore();

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [auctionTeams, setAuctionTeams] = useState<AuctionTeamSummary[]>([]);
  const [auctionPlayers, setAuctionPlayers] = useState<AuctionPlayer[]>([]);
  const [selectedMyTeamId, setSelectedMyTeamId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"floor" | "purses" | "sold">("floor");
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const getCategoryBasePrice = (categoryName?: string, categoryId?: number, fallbackBasePrice?: number) => {
    const cat = championship?.categories?.find(
      (c) => c.name?.toLowerCase() === (categoryName || "").toLowerCase() || (categoryId && c.categoryId === categoryId)
    );
    return cat?.basePrice && cat.basePrice > 0 ? cat.basePrice : (fallbackBasePrice && fallbackBasePrice > 0 ? fallbackBasePrice : 1000);
  };

  const loadData = async () => {
    try {
      const champ = await TeamChampionshipService.getById(championshipUuid);
      setChampionship(champ);

      if (champ?.championshipId) {
        const [state, teams, players] = await Promise.all([
          AuctionService.getState(champ.championshipId).catch(() => null),
          AuctionService.getTeams(champ.championshipId).catch(() => []),
          AuctionService.getPlayers(champ.championshipId).catch(() => []),
        ]);

        if (state) setAuctionState(state);
        if (teams) setAuctionTeams(teams);
        if (players) setAuctionPlayers(players);

        if (teams && teams.length > 0 && !selectedMyTeamId) {
          setSelectedMyTeamId(teams[0].team.teamId);
        }
      }
    } catch (err) {
      console.error("Failed to load auction arena", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [championshipUuid]);

  const myTeamSummary = auctionTeams.find((at) => at.team.teamId === selectedMyTeamId);
  const currencyLabel = auctionState?.config?.currencySymbolOrLabel || "pts";

  const soldPlayers = auctionPlayers.filter((p) => p.state === "SOLD" || p.state === "ASSIGNED");
  const unsoldPlayers = auctionPlayers.filter((p) => p.state === "UNSOLD");
  const waitingPlayers = auctionPlayers.filter((p) => p.state === "WAITING" || p.state === "CALLED");

  const handlePlaceBid = async (increment: number) => {
    if (!championship?.championshipId || !auctionState?.activePlayer || !selectedMyTeamId) return;

    try {
      setPlacingBid(true);
      const current = auctionState.currentBid || auctionState.activePlayer.basePrice;
      const nextBid = current + increment;
      await AuctionService.placeBid(
        championship.championshipId,
        auctionState.activePlayer.auctionPlayerId,
        selectedMyTeamId,
        nextBid,
        userId ? Number(userId) : undefined
      );
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading || !championship) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-wider text-foreground/60">Connecting to Live Auction Floor...</span>
      </div>
    );
  }

  const isLive = championship.stage === "AUCTION_STAGE" || auctionState?.config?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black font-sans">
      {/* 1. Top Navigation Bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 flex items-center justify-between"
        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/home/team-championship/${championship.championshipUuid}`}
            className="p-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                  isLive
                    ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-red-500 animate-ping" : "bg-amber-400"}`} />
                {isLive ? "LIVE AUCTION ARENA" : "AUCTION STANDBY"}
              </span>
              <h1 className="text-sm sm:text-base font-black text-foreground truncate max-w-[200px] sm:max-w-md">
                {championship.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Actions: Team Selector, Purse Badge, & Maximize Fullscreen */}
        <div className="flex items-center gap-2">
          {auctionTeams.length > 0 && (
            <>
              <select
                value={selectedMyTeamId || ""}
                onChange={(e) => setSelectedMyTeamId(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary hidden sm:inline-block"
                style={{ borderColor: "var(--athlon-border)" }}
              >
                {auctionTeams.map((t) => (
                  <option key={t.team.teamId} value={t.team.teamId}>
                    {t.team.teamName} ({t.team.remainingBudget} {currencyLabel})
                  </option>
                ))}
              </select>

              {myTeamSummary && (
                <div className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary font-black text-xs shadow-sm flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{myTeamSummary.team.remainingBudget} {currencyLabel}</span>
                </div>
              )}
            </>
          )}

          {/* Maximize to Fullscreen for Projectors / Big Screens */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border font-black text-xs transition-all flex items-center gap-1.5 shadow-sm ${
              isFullscreen
                ? "bg-amber-500 text-black border-amber-400 hover:bg-amber-400"
                : "bg-surface hover:bg-white/10 text-foreground border-foreground/15"
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Maximize to Fullscreen for Projector Screen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Maximize</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "var(--athlon-border)" }}>
          <button
            onClick={() => setActiveTab("floor")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === "floor"
                ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Auction Floor</span>
            {auctionState?.activePlayer && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("purses")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === "purses"
                ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Franchise Purses ({auctionTeams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === "sold"
                ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Drafted Squads ({soldPlayers.length})</span>
          </button>
        </div>

        {/* TAB 1: AUCTION FLOOR */}
        {activeTab === "floor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Floor Card */}
            <div className="lg:col-span-2 space-y-6">
              {auctionState?.activePlayer ? (
                <div
                  className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary/15 via-transparent to-transparent"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  {/* Glowing Spotlight Accent */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-amber-500/20 border border-primary/40 flex items-center justify-center font-black text-xl text-primary shadow-lg shadow-primary/20 shrink-0 uppercase">
                        {auctionState.activePlayer.playerName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" /> On the Auction Floor
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5 tracking-tight">
                          {auctionState.activePlayer.playerName}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase">
                            {auctionState.activePlayer.categoryName || "Open"}
                          </span>
                          <span className="text-xs text-foreground/60 font-semibold">
                            Base: <strong className="text-primary font-mono">{getCategoryBasePrice(auctionState.activePlayer.categoryName, auctionState.activePlayer.categoryId, auctionState.activePlayer.basePrice)} {currencyLabel}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div
                      className="p-4 rounded-2xl border text-center self-start sm:self-center shrink-0 shadow-inner"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">
                        Timer Remaining
                      </span>
                      <span className="text-3xl font-black text-amber-400 font-mono">
                        {auctionState.remainingTimerSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* Current High Bid & Winning Leader */}
                  <div
                    className="p-5 rounded-2xl border grid grid-cols-2 gap-4 relative z-10"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-foreground/40 block">Current High Bid</span>
                      <span className="text-2xl sm:text-3xl font-black text-primary font-mono">
                        {auctionState.currentBid} {currencyLabel}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-foreground/40 block">Highest Bidding Team</span>
                      <span className="text-base sm:text-lg font-black text-foreground flex items-center gap-1.5 mt-0.5">
                        <Shield className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{auctionState.winningTeamName || "Waiting for first bid"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Bidding Controls */}
                  <div className="space-y-3 pt-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground/80">
                        Place Bid for {myTeamSummary?.team.teamName || "Your Franchise"}
                      </span>
                      {myTeamSummary && (
                        <span className="text-xs font-bold text-foreground/50">
                          Purse: <strong className="text-primary font-mono">{myTeamSummary.team.remainingBudget} {currencyLabel}</strong>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        auctionState.config?.bidIncrement || 500,
                        (auctionState.config?.bidIncrement || 500) * 2,
                        (auctionState.config?.bidIncrement || 500) * 5,
                      ].map((inc, idx) => (
                        <button
                          key={idx}
                          disabled={placingBid}
                          onClick={() => handlePlaceBid(inc)}
                          className="py-4 rounded-2xl bg-gradient-to-r from-primary via-amber-400 to-primary text-black font-black text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25 disabled:opacity-40"
                        >
                          +{inc} {currencyLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="p-16 rounded-3xl border border-dashed text-center space-y-4 shadow-sm"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                    <Gavel className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                      Floor Standby: Waiting for Organizer Call
                    </h3>
                    <p className="text-xs text-foreground/50 mt-1 max-w-md mx-auto">
                      The tournament organizer is preparing the next player call. Bidding increments and floor status will update live in real-time.
                    </p>
                  </div>
                </div>
              )}

              {/* Waiting Players Pool Strip */}
              <div
                className="p-5 rounded-3xl border space-y-3"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Remaining Draft Pool ({waitingPlayers.length})
                  </h3>
                  <span className="text-[11px] text-foreground/40 font-bold">Upcoming Bids</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto hide-scrollbar">
                  {waitingPlayers.slice(0, 12).map((p) => (
                    <div
                      key={p.auctionPlayerId}
                      className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="font-black text-foreground truncate">{p.playerName}</h5>
                        <span className="text-[10px] text-foreground/40">{p.categoryName || "Open"}</span>
                      </div>
                      <span className="text-[11px] font-mono font-black text-primary ml-1 shrink-0">
                        {getCategoryBasePrice(p.categoryName, p.categoryId, p.basePrice)} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Bids Activity Sidebar */}
            <div className="space-y-6">
              <div
                className="rounded-3xl border p-5 space-y-4 shadow-lg"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--athlon-border)" }}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" /> Live Bidding Feed
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto hide-scrollbar">
                  {auctionState?.recentBids && auctionState.recentBids.length > 0 ? (
                    auctionState.recentBids.map((bid) => (
                      <div
                        key={bid.bidId}
                        className="p-3 rounded-xl border flex items-center justify-between text-xs transition-all hover:scale-[1.01]"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                            {bid.teamName.charAt(0)}
                          </div>
                          <span className="font-black text-foreground truncate">{bid.teamName}</span>
                        </div>
                        <span className="font-mono font-black text-primary text-sm ml-2 shrink-0">
                          {bid.bidAmount} {currencyLabel}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-foreground/40">
                      No bids submitted for the current call yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FRANCHISE PURSES */}
        {activeTab === "purses" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auctionTeams.map(({ team }) => {
              const spentPct = team.initialBudget > 0 ? (team.spentBudget / team.initialBudget) * 100 : 0;

              return (
                <div
                  key={team.teamId}
                  className="rounded-[22px] border p-5 space-y-4 shadow-sm flex flex-col justify-between"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-sm shadow-inner shrink-0">
                        {team.teamName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-foreground truncate">{team.teamName}</h4>
                        <span className="text-[11px] text-foreground/50 font-semibold">
                          Acquired: {team.playersAcquiredCount} / {team.squadCapacity || 7} Players
                        </span>
                      </div>
                    </div>

                    {/* Purse Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-foreground/40 font-bold">Remaining Budget:</span>
                        <span className="font-black text-primary">{team.remainingBudget} {currencyLabel}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, 100 - spentPct))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-xl border flex items-center justify-between text-xs mt-2"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <span className="text-foreground/50">Spent Purse:</span>
                    <span className="font-mono font-bold text-foreground">{team.spentBudget} {currencyLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SOLD PLAYERS */}
        {activeTab === "sold" && (
          <div className="space-y-4">
            {soldPlayers.length === 0 ? (
              <div
                className="py-16 text-center rounded-3xl border flex flex-col items-center justify-center space-y-3"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <Trophy className="w-10 h-10 text-foreground/30" />
                <h4 className="text-sm font-black text-foreground">No Players Drafted Yet</h4>
                <p className="text-xs text-foreground/50">Sold and assigned athletes will appear here with final prices.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {soldPlayers.map((p) => (
                  <div
                    key={p.auctionPlayerId}
                    className="rounded-[22px] border p-4 space-y-3 shadow-sm flex flex-col justify-between"
                    style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-foreground truncate">{p.playerName}</h4>
                          <span className="text-[10px] text-foreground/40 font-mono">#{p.playerId}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                          {p.categoryName || "Open"}
                        </span>
                      </div>

                      <div
                        className="p-2.5 rounded-xl border space-y-1 text-xs"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground/40 font-bold">Winning Team:</span>
                          <span className="font-bold text-foreground truncate">{p.winningTeamName || "Assigned"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2 mt-1" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <span className="text-[10px] font-bold text-foreground/40 uppercase">Sold For</span>
                      <span className="text-xs font-mono font-black text-primary">{p.finalBid || p.basePrice} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
