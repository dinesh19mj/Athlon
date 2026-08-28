"use client";

import { useState, useEffect, useRef } from "react";
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
  Pause,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  LogIn,
  Filter,
  Search,
  Crown,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
  Award,
  TrendingUp,
  X,
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
import { useAthlonTheme } from "@/hooks/use-athlon-theme";

export default function TeamOwnerAuctionArenaPage() {
  const params = useParams();
  const championshipUuid = params.id as string;
  const router = useRouter();
  const { userId, isAuthenticated } = useAuthStore();
  const { theme: currentTheme } = useAthlonTheme();

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [auctionTeams, setAuctionTeams] = useState<AuctionTeamSummary[]>([]);
  const [auctionPlayers, setAuctionPlayers] = useState<AuctionPlayer[]>([]);
  const [selectedMyTeamId, setSelectedMyTeamId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"floor" | "purses" | "sold" | "unsold">("floor");
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [displayRemainingSeconds, setDisplayRemainingSeconds] = useState<number>(60);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamDetailId, setSelectedTeamDetailId] = useState<number | null>(null);

  const prevActivePlayerId = useRef<number | null>(null);
  const prevCurrentBid = useRef<number | null>(null);

  // Sound Synth Effects
  const playAudioCue = (type: "bid" | "gavel" | "bell") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "bid") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "gavel") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "bell") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // AudioContext unavailable or restricted by browser policy
    }
  };

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

        if (state) {
          // Play audio triggers on changes
          if (state.activePlayer && prevActivePlayerId.current !== state.activePlayer.auctionPlayerId) {
            playAudioCue("bell");
            prevActivePlayerId.current = state.activePlayer.auctionPlayerId;
          }
          if (state.currentBid && prevCurrentBid.current !== null && state.currentBid > prevCurrentBid.current) {
            playAudioCue("bid");
          }
          prevCurrentBid.current = state.currentBid || null;

          setAuctionState(state);
        }

        if (teams) {
          setAuctionTeams(teams);
          if (teams.length > 0 && !selectedMyTeamId) {
            setSelectedMyTeamId(teams[0].team.teamId);
          }
        }

        if (players) setAuctionPlayers(players);
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

  // Sync server authority remaining timer into client state
  useEffect(() => {
    if (auctionState?.remainingTimerSeconds !== undefined && auctionState?.remainingTimerSeconds !== null) {
      setDisplayRemainingSeconds(auctionState.remainingTimerSeconds);
    }
  }, [auctionState?.remainingTimerSeconds, auctionState?.activePlayer?.auctionPlayerId]);

  // Precise 1-second countdown ticker for smooth, single-second countdown
  const isTimerPaused = auctionState?.config?.status === "PAUSED" || Boolean(auctionState?.config?.timerPausedRemainingSeconds);

  useEffect(() => {
    if (isTimerPaused || !auctionState?.activePlayer) return;

    const interval = setInterval(() => {
      setDisplayRemainingSeconds((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused, auctionState?.activePlayer?.auctionPlayerId]);

  const myTeamSummary = auctionTeams.find((at) => at.team.teamId === selectedMyTeamId);
  const currencyLabel = auctionState?.config?.currencySymbolOrLabel || "pts";

  const soldPlayers = auctionPlayers.filter((p) => p.state === "SOLD" || p.state === "ASSIGNED");
  const unsoldPlayers = auctionPlayers.filter((p) => p.state === "UNSOLD");
  const waitingPlayers = auctionPlayers.filter((p) => p.state === "WAITING" || p.state === "CALLED");

  const isMyTeamLeading = Boolean(
    selectedMyTeamId && auctionState?.winningTeamId && auctionState.winningTeamId === selectedMyTeamId
  );

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
      playAudioCue("bid");
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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-wider text-foreground/60">Connecting to Live Auction Floor...</span>
      </div>
    );
  }

  // When the auction is paused by the organizer or offline, block spectator view
  if (championship.stage !== "AUCTION_STAGE") {
    const isPaused = championship.stage === "AUCTION_PAUSED";
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-black font-sans">
        {/* Header */}
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
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-amber-500/15 text-amber-400 border-amber-500/30">
                  {isPaused ? "AUCTION PAUSED" : "AUCTION STANDBY"}
                </span>
                <h1 className="text-sm sm:text-base font-black text-foreground truncate max-w-[200px] sm:max-w-md">
                  {championship.name}
                </h1>
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            className="px-3.5 py-1.5 rounded-xl border bg-surface hover:bg-white/10 text-foreground font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
            style={{ borderColor: "var(--athlon-border)" }}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Auto-Syncing</span>
          </button>
        </header>

        {/* Billboard Paused Screen */}
        <main className="max-w-lg mx-auto px-6 py-16 text-center flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10">
              <Pause className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 animate-ping opacity-75" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{isPaused ? "Auction Session Paused" : "Auction Floor Offline"}</span>
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {isPaused ? "Live Bidding on Hold" : "Auction Not Started Yet"}
            </h2>
            <p className="text-xs text-foreground/60 max-w-sm mx-auto leading-relaxed">
              {isPaused
                ? "The organizer has temporarily paused the live auction floor. Spectating and bidding are currently offline and will automatically resume once the session re-opens."
                : "The organizer has not started the live auction for this championship yet. Please check back when the floor opens."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              onClick={loadData}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Refresh Floor Status</span>
            </button>

            <Link
              href={`/home/team-championship/${championship.championshipUuid}`}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border text-foreground/70 hover:text-foreground font-black text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: "var(--athlon-border)" }}
            >
              <span>Back to Championship</span>
            </Link>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-foreground/30 font-bold border-t" style={{ borderColor: "var(--athlon-border)" }}>
          ATHLON Real-Time Auction Engine • 2s Live Auto-Polling
        </footer>
      </div>
    );
  }

  const isLive = true;

  // Filtered queue players
  const filteredQueuePlayers = waitingPlayers.filter((p) => {
    const matchesCat = categoryFilter === "ALL" || (p.categoryName || "").toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchQuery || p.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-background w-screen h-screen overflow-hidden flex flex-col justify-between select-none text-foreground font-sans"
          : "min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black font-sans"
      }
    >
      {/* 1. Top Navigation & Broadcast Bar */}
      <header
        className={`backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 transition-all ${
          isFullscreen ? "rounded-none bg-surface/90 border-foreground/10" : "sticky top-0 z-40"
        }`}
        style={{ backgroundColor: isFullscreen ? undefined : "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/home/team-championship/${championship.championshipUuid}`}
            className="p-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${
                  isLive
                    ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-red-500 animate-ping" : "bg-amber-400"}`} />
                {isLive ? "LIVE AUCTION ARENA" : "AUCTION STANDBY"}
              </span>

              <h1 className="text-sm sm:text-base font-black text-foreground truncate max-w-[180px] sm:max-w-md">
                {championship.name}
              </h1>

              {!isAuthenticated && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-foreground/70">
                  <Eye className="w-3 h-3 text-primary" /> Spectator Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Team Selector, Purse Badge, Audio Toggle & Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2 rounded-xl border text-xs font-black transition-all flex items-center gap-1 shadow-sm cursor-pointer ${
              soundEnabled
                ? "bg-surface hover:bg-white/10 text-primary border-foreground/15"
                : "bg-surface/50 text-foreground/40 border-foreground/10"
            }`}
            title={soundEnabled ? "Mute Arena Audio" : "Enable Arena Audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Franchise Selector / Purse Display (for Authenticated Users) */}
          {isAuthenticated && auctionTeams.length > 0 && (
            <>
              <select
                value={selectedMyTeamId || ""}
                onChange={(e) => setSelectedMyTeamId(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary hidden md:inline-block cursor-pointer"
                style={{ borderColor: "var(--athlon-border)" }}
              >
                {auctionTeams.map((t) => (
                  <option key={t.team.teamId} value={t.team.teamId}>
                    {t.team.teamName} ({t.team.remainingBudget.toLocaleString()} {currencyLabel})
                  </option>
                ))}
              </select>

              {myTeamSummary && (
                <div className="px-3 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary font-black text-xs shadow-sm hidden sm:flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{myTeamSummary.team.remainingBudget.toLocaleString()} {currencyLabel}</span>
                </div>
              )}
            </>
          )}

          {/* Login CTA for Non-Logged In Users */}
          {!isAuthenticated && (
            <Link
              href={`/auth/login?redirect=/home/team-championship/${championship.championshipUuid}/auction`}
              className="px-3.5 py-2 rounded-xl bg-primary text-black font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In to Bid</span>
            </Link>
          )}

          {/* Maximize to Fullscreen for Projectors / Big Screens */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:px-3.5 sm:py-2 rounded-xl border font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
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
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 ${isFullscreen ? "flex-1 min-h-0 py-4 overflow-y-auto hide-scrollbar" : "mt-6 space-y-6"}`}>
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 border-b pb-3 flex-wrap" style={{ borderColor: "var(--athlon-border)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("floor")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "floor"
                  ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                  : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10 hover:bg-white/5"
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Live Floor</span>
              {auctionState?.activePlayer && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("purses")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "purses"
                  ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                  : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10 hover:bg-white/5"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Franchise Purses ({auctionTeams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sold")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "sold"
                  ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                  : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10 hover:bg-white/5"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Drafted Squads ({soldPlayers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("unsold")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "unsold"
                  ? "bg-primary text-black border-primary shadow-md shadow-primary/20"
                  : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10 hover:bg-white/5"
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Unsold Bench ({unsoldPlayers.length})</span>
            </button>
          </div>

          {/* Bidding Mode Status Pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-surface border border-foreground/15 text-[11px] font-bold text-foreground/70 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mode: <strong>{auctionState?.config?.biddingMode === "AUTOMATIC" ? "⚡ Automatic Live" : "✋ Manual Gavel"}</strong></span>
            </span>
          </div>
        </div>

        {/* TAB 1: AUCTION FLOOR */}
        {activeTab === "floor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLS: ACTIVE PLAYER STAGE SPOTLIGHT & BIDDING CONTROLS */}
            <div className="lg:col-span-8 space-y-6">
              {auctionState?.activePlayer ? (
                <div
                  className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-surface/95 via-surface/80 to-surface/40 backdrop-blur-xl"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  {/* Glowing Stadium Backdrop Aura */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-0" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

                  {/* Top Stage Header: Athlete Spotlight */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left min-w-0 flex-1">
                      {/* Massive Ultra-Large Athlete Photo Frame */}
                      <div className="relative shrink-0 group">
                        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-primary/40 via-indigo-500/30 to-amber-400/30 border-4 border-primary/80 p-1 flex items-center justify-center shadow-2xl shadow-primary/25 overflow-hidden transition-all duration-300 group-hover:scale-105">
                          {auctionState.activePlayer.avatarUrl ? (
                            <img
                              src={auctionState.activePlayer.avatarUrl}
                              alt={auctionState.activePlayer.playerName}
                              className="w-full h-full object-cover rounded-[22px]"
                            />
                          ) : (
                            <span className="text-4xl sm:text-5xl font-black text-primary tracking-wider drop-shadow-lg">
                              {auctionState.activePlayer.playerName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-black/95 border border-primary text-[10px] font-mono font-black text-primary shadow-xl">
                          #{auctionState.activePlayer.auctionPlayerId}
                        </span>
                      </div>

                      {/* Athlete Details */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <span className="px-3 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                            <span>{auctionState.activePlayer.categoryName || "Category Phase"}</span>
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-mono font-black text-[10px] uppercase animate-pulse">
                            Live On-Air
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight truncate drop-shadow-md leading-tight">
                          {auctionState.activePlayer.playerName}
                        </h2>

                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
                          <span className="text-xs px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold flex items-center gap-1.5 shadow-sm">
                            <span className="text-primary/60 text-[10px] uppercase font-black">Base Price:</span>
                            <strong className="font-mono font-black text-sm">
                              {getCategoryBasePrice(auctionState.activePlayer.categoryName, auctionState.activePlayer.categoryId, auctionState.activePlayer.basePrice)} {currencyLabel}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Floor Countdown Timer Pod */}
                    <div
                      className="p-4 sm:p-5 rounded-2xl border text-center shrink-0 shadow-inner min-w-[130px] transition-all relative overflow-hidden"
                      style={{
                        backgroundColor: "var(--athlon-surface)",
                        borderColor: isTimerPaused ? "#f59e0b" : displayRemainingSeconds <= 10 ? "#ef4444" : "var(--athlon-border)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {isTimerPaused ? (
                          <>
                            <Pause className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                              PAUSED
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-primary animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                              Floor Timer
                            </span>
                          </>
                        )}
                      </div>

                      <span
                        className={`text-3xl sm:text-4xl font-black font-mono block leading-none ${
                          isTimerPaused
                            ? "text-amber-300"
                            : displayRemainingSeconds <= 10
                            ? "text-red-400 animate-pulse"
                            : "text-amber-400"
                        }`}
                      >
                        {displayRemainingSeconds}s
                      </span>

                      <span className="text-[9px] font-bold uppercase text-foreground/40 mt-1 block">
                        {isTimerPaused ? "Awaiting Resume" : "Live Bidding"}
                      </span>
                    </div>
                  </div>

                  {/* High Bid & Leading Franchise Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                    <div
                      className="p-5 rounded-2xl border space-y-1 bg-gradient-to-br from-primary/10 to-transparent shadow-inner"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <span className="text-[10px] font-black uppercase text-foreground/50 tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" /> Current High Bid
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-primary font-mono tracking-tight">
                          {(auctionState.currentBid || auctionState.activePlayer.basePrice || 1000).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-primary/70 uppercase">{currencyLabel}</span>
                      </div>
                    </div>

                    <div
                      className={`p-5 rounded-2xl border space-y-1 shadow-inner ${
                        isMyTeamLeading
                          ? "bg-amber-500/15 border-amber-500/40 ring-2 ring-amber-500/20"
                          : "bg-surface"
                      }`}
                      style={{ borderColor: isMyTeamLeading ? undefined : "var(--athlon-border-subtle)" }}
                    >
                      <span className="text-[10px] font-black uppercase text-foreground/50 tracking-wider flex items-center gap-1.5">
                        <Crown className={`w-3.5 h-3.5 ${isMyTeamLeading ? "text-amber-400" : "text-primary"}`} /> Leading Bidder
                      </span>
                      <div className="flex items-center gap-2">
                        <Shield className={`w-5 h-5 ${isMyTeamLeading ? "text-amber-400" : "text-primary"} shrink-0`} />
                        <span className="text-base sm:text-lg font-black text-foreground truncate">
                          {auctionState.winningTeamName || "No Bids Submitted"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Leading Bidder Banner for Current Team Owner */}
                  {isMyTeamLeading && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/40 flex items-center justify-between text-amber-400 text-xs font-black animate-fadeIn">
                      <span className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>👑 Your franchise is currently leading the bidding call!</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black font-black text-[10px] uppercase">
                        Highest Bid
                      </span>
                    </div>
                  )}

                  {/* Interactive Bidding Pad (Dual Experience for Logged in vs Spectator) */}
                  {(() => {
                    const isAutomatic = (auctionState?.config?.biddingMode || "MANUAL") === "AUTOMATIC";
                    const configuredBumps: number[] = auctionState?.config?.quickPointBumps
                      ? auctionState.config.quickPointBumps
                          .split(",")
                          .map((s) => Number(s.trim()))
                          .filter((n) => !isNaN(n) && n > 0)
                      : [100, 250, 500, 1000, 2000];
                    const bumpsToDisplay = configuredBumps.length > 0 ? configuredBumps : [100, 250, 500, 1000, 2000];

                    if (!isAutomatic) {
                      return (
                        <div
                          className="p-5 rounded-2xl border flex items-center justify-between gap-3 text-xs relative z-10"
                          style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                              ✋
                            </div>
                            <div>
                              <span className="font-black text-foreground block text-sm">
                                Manual Floor Mode Active
                              </span>
                              <span className="text-xs text-foreground/60">
                                The auctioneer is recording manual floor bids from team representatives. Assignments will lock live.
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // For Spectators / Non-Logged In Users
                    if (!isAuthenticated) {
                      return (
                        <div
                          className="p-6 rounded-2xl border space-y-3 relative z-10 text-center"
                          style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                        >
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <Zap className="w-8 h-8 text-primary animate-pulse" />
                            <h4 className="text-sm font-black text-foreground">
                              Live Interactive Bidding Active
                            </h4>
                            <p className="text-xs text-foreground/60 leading-relaxed">
                              Franchise team owners are bidding live in real-time. Log in to your Athlon account to participate with your franchise team.
                            </p>
                            <Link
                              href={`/auth/login?redirect=/home/team-championship/${championship.championshipUuid}/auction`}
                              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                              <LogIn className="w-4 h-4" />
                              <span>Log In to Place Bids</span>
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    // For Authenticated Team Owners
                    const currentBid = auctionState.currentBid || auctionState.activePlayer?.basePrice || 0;
                    const minRequiredBid = currentBid + (bumpsToDisplay[0] || 50);
                    const isPurseExhausted = myTeamSummary ? myTeamSummary.team.remainingBudget < minRequiredBid : false;

                    return (
                      <div className="space-y-4 pt-2 relative z-10">
                        {/* Team Franchise Cockpit Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-background border" style={{ borderColor: "var(--athlon-border)" }}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="text-xs font-black uppercase text-foreground/80 shrink-0">
                              Your Franchise:
                            </span>
                            {auctionTeams.length > 1 ? (
                              <select
                                value={selectedMyTeamId || ""}
                                onChange={(e) => setSelectedMyTeamId(Number(e.target.value))}
                                className="px-2.5 py-1 bg-surface border border-foreground/15 rounded-lg text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer flex-1 max-w-xs"
                              >
                                {auctionTeams.map(({ team }) => (
                                  <option key={team.teamId} value={team.teamId}>
                                    {team.teamName} (Purse: {team.remainingBudget.toLocaleString()} {currencyLabel})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs font-black text-primary truncate">
                                {myTeamSummary?.team.teamName || "Your Franchise"}
                              </span>
                            )}
                          </div>

                          {myTeamSummary && (
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <span className="text-[11px] font-bold text-foreground/50">Purse Balance:</span>
                              <span className={`text-sm font-black font-mono px-2.5 py-0.5 rounded-lg ${
                                isPurseExhausted
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-primary/20 text-primary border border-primary/30"
                              }`}>
                                {myTeamSummary.team.remainingBudget.toLocaleString()} {currencyLabel}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Purse Exhaustion Alert Warning */}
                        {isPurseExhausted && myTeamSummary && (
                          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                              <strong>Purse Balance Limit:</strong> {myTeamSummary.team.teamName} has only{" "}
                              <strong>{myTeamSummary.team.remainingBudget.toLocaleString()} {currencyLabel}</strong> remaining. You cannot place bids exceeding your purse.
                            </span>
                          </div>
                        )}

                        {/* Quick Point Bump Action Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                          {bumpsToDisplay.map((inc) => {
                            const nextTargetBid = currentBid + inc;
                            const isAffordable = myTeamSummary ? myTeamSummary.team.remainingBudget >= nextTargetBid : true;

                            return (
                              <button
                                key={inc}
                                disabled={placingBid || !selectedMyTeamId || !isAffordable || isMyTeamLeading}
                                onClick={() => handlePlaceBid(inc)}
                                className={`py-3.5 px-2 rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-0.5 select-none ${
                                  !isAffordable || isMyTeamLeading
                                    ? "bg-surface/50 text-foreground/30 border border-foreground/10 cursor-not-allowed opacity-40"
                                    : "bg-gradient-to-r from-primary via-amber-400 to-primary text-black hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
                                }`}
                                title={
                                  isMyTeamLeading
                                    ? "You are already holding the highest bid!"
                                    : !isAffordable
                                    ? `Requires ${nextTargetBid} pts (Purse: ${myTeamSummary?.team.remainingBudget || 0} pts)`
                                    : `Bid ${nextTargetBid} ${currencyLabel}`
                                }
                              >
                                <span className="font-mono text-base font-black">+{inc}</span>
                                <span className="text-[9px] uppercase font-bold text-black/70 truncate max-w-full">
                                  {isMyTeamLeading ? "Leading" : isAffordable ? `Bid ${nextTargetBid}` : "Exceeds Purse"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Standby Screen when No Player is on Floor */
                <div
                  className="p-16 rounded-3xl border border-dashed text-center space-y-4 shadow-sm"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                    <Gavel className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                      Waiting for Tournament Organizer Call
                    </h3>
                    <p className="text-xs text-foreground/50 mt-1 max-w-md mx-auto leading-relaxed">
                      The live bidding floor is standby. When the auctioneer calls the next athlete, the spotlight stage and bidding options will activate immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Upcoming Players Pool with Category Filters & Search */}
              <div
                className="p-5 rounded-3xl border space-y-4 shadow-sm"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--athlon-border)" }}>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground/90 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" /> Remaining Draft Pool ({waitingPlayers.length})
                    </h3>
                    <p className="text-[11px] text-foreground/50">Athletes queued for upcoming bidding calls</p>
                  </div>

                  {/* Filter / Search Bar */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                      <input
                        type="text"
                        placeholder="Search player..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl border bg-background text-xs text-foreground outline-none focus:border-primary w-36 sm:w-48"
                        style={{ borderColor: "var(--athlon-border)" }}
                      />
                    </div>

                    {championship.categories && championship.categories.length > 0 && (
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                        style={{ borderColor: "var(--athlon-border)" }}
                      >
                        <option value="ALL">All Categories</option>
                        {championship.categories.map((c) => (
                          <option key={c.categoryId || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {filteredQueuePlayers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-foreground/40 font-bold">
                    No athletes found matching the selected filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto hide-scrollbar">
                    {filteredQueuePlayers.slice(0, 18).map((p) => (
                      <div
                        key={p.auctionPlayerId}
                        className="p-3 rounded-2xl border flex items-center justify-between text-xs transition-all hover:bg-white/5"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0 overflow-hidden">
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt={p.playerName} className="w-full h-full object-cover" />
                            ) : (
                              p.playerName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-black text-foreground truncate">{p.playerName}</h5>
                            <span className="text-[10px] text-foreground/50 block truncate">{p.categoryName || "Open"}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-black text-primary ml-1 shrink-0">
                          {getCategoryBasePrice(p.categoryName, p.categoryId, p.basePrice)} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT 4 COLS: LIVE BIDDING PODCAST FEED & FRANCHISE LEADERBOARD */}
            <div className="lg:col-span-4 space-y-6">
              {/* Live Podcast Bids Feed */}
              <div
                className="rounded-3xl border p-5 space-y-4 shadow-xl"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--athlon-border)" }}>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Live Bidding Feed
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase animate-pulse">
                    Live Stream
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto hide-scrollbar">
                  {auctionState?.recentBids && auctionState.recentBids.length > 0 ? (
                    auctionState.recentBids.map((bid, idx) => {
                      const isTopBid = idx === 0;
                      return (
                        <div
                          key={bid.bidId}
                          className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                            isTopBid
                              ? "bg-gradient-to-r from-primary/15 via-surface to-surface border-primary/50 shadow-md ring-1 ring-primary/30"
                              : "hover:bg-white/5 border-foreground/10"
                          }`}
                          style={{ backgroundColor: isTopBid ? undefined : "var(--athlon-surface)" }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              isTopBid ? "bg-primary text-black" : "bg-surface border border-foreground/20 text-foreground/80"
                            }`}>
                              {bid.teamName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-black text-foreground truncate block">{bid.teamName}</span>
                              {isTopBid && (
                                <span className="text-[9px] font-bold uppercase text-primary block">Highest Bid</span>
                              )}
                            </div>
                          </div>

                          <span className="font-mono font-black text-primary text-sm ml-2 shrink-0">
                            {bid.bidAmount.toLocaleString()} {currencyLabel}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-10 text-center text-xs text-foreground/40 space-y-1">
                      <Gavel className="w-6 h-6 mx-auto text-foreground/30 mb-1" />
                      <p className="font-bold">No bids submitted yet</p>
                      <p className="text-[10px]">Team bids will stream here live in real-time.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Franchise Purses Snapshot */}
              <div
                className="rounded-3xl border p-5 space-y-3.5 shadow-sm"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border)" }}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" /> Top Purse Balances
                  </h3>
                  <button
                    onClick={() => setActiveTab("purses")}
                    className="text-[11px] font-black text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {auctionTeams.slice(0, 4).map(({ team }) => (
                    <div
                      key={team.teamId}
                      className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-foreground truncate block">{team.teamName}</span>
                        <span className="text-[10px] text-foreground/40">{team.playersAcquiredCount || 0} Drafted</span>
                      </div>
                      <span className="font-mono font-black text-primary text-xs ml-2 shrink-0">
                        {team.remainingBudget.toLocaleString()} {currencyLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FRANCHISE PURSES & SQUADS */}
        {activeTab === "purses" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {auctionTeams.map((at) => {
              const initialBudget = at.team.initialBudget || 5000;
              const remainingBudget = at.team.remainingBudget ?? initialBudget;
              const spentBudget = at.team.spentBudget || (initialBudget - remainingBudget);
              const percentLeft = Math.max(0, Math.min(100, (remainingBudget / initialBudget) * 100));

              return (
                <div
                  key={at.team.teamId}
                  className="rounded-3xl border p-5 space-y-4 shadow-md flex flex-col justify-between"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-base shadow-inner shrink-0">
                          {at.team.teamName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-foreground truncate">{at.team.teamName}</h4>
                          <span className="text-xs text-foreground/60 font-semibold block">
                            {at.acquiredPlayers?.length || at.team.playersAcquiredCount || 0} / {at.team.squadCapacity || 7} Drafted
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTeamDetailId(at.team.teamId)}
                        className="p-1.5 rounded-xl border border-foreground/15 bg-surface hover:bg-white/10 text-foreground/70 hover:text-primary transition-all cursor-pointer"
                        title="View Drafted Squad"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Purse Budget Meter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-foreground/50">Remaining Purse:</span>
                        <span className="font-black text-primary text-sm">{remainingBudget.toLocaleString()} {currencyLabel}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentLeft > 50 ? "bg-emerald-500" : percentLeft > 20 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-foreground/40 font-bold">
                        <span>Spent: {spentBudget.toLocaleString()} pts</span>
                        <span>{Math.round(percentLeft)}% left</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <span className="text-xs text-foreground/50 font-bold">Initial: {initialBudget.toLocaleString()} pts</span>
                    <button
                      onClick={() => setSelectedTeamDetailId(at.team.teamId)}
                      className="text-xs font-black text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Squad</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
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
                <Trophy className="w-12 h-12 text-foreground/20" />
                <h4 className="text-base font-black text-foreground">No Players Drafted Yet</h4>
                <p className="text-xs text-foreground/50 max-w-sm">
                  Athletes assigned to franchise teams will appear here with final prices and acquiring team details.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {soldPlayers.map((p) => (
                  <div
                    key={p.auctionPlayerId}
                    className="rounded-3xl border p-4 space-y-3 shadow-md flex flex-col justify-between bg-surface/60 transition-all hover:bg-surface"
                    style={{ borderColor: "var(--athlon-border)" }}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm shrink-0 overflow-hidden">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt={p.playerName} className="w-full h-full object-cover" />
                          ) : (
                            p.playerName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-foreground truncate">{p.playerName}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                            {p.categoryName || "Category"}
                          </span>
                        </div>
                      </div>

                      <div
                        className="p-3 rounded-2xl border space-y-1 text-xs"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground/40 font-bold">Acquiring Team:</span>
                          <span className="font-black text-foreground truncate">{p.winningTeamName || "Assigned"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2.5 mt-1" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <span className="text-[10px] font-bold text-foreground/40 uppercase">Final Price</span>
                      <span className="text-sm font-mono font-black text-emerald-400">
                        {(p.finalBid || p.basePrice || 1000).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: UNSOLD BENCH */}
        {activeTab === "unsold" && (
          <div className="space-y-4">
            {unsoldPlayers.length === 0 ? (
              <div
                className="py-16 text-center rounded-3xl border flex flex-col items-center justify-center space-y-3"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400/30" />
                <h4 className="text-base font-black text-foreground">No Unsold Players</h4>
                <p className="text-xs text-foreground/50 max-w-sm">
                  All athletes called so far have been successfully drafted or assigned.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unsoldPlayers.map((p) => (
                  <div
                    key={p.auctionPlayerId}
                    className="rounded-3xl border p-4 space-y-3 shadow-md flex flex-col justify-between bg-red-500/5 border-red-500/20"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-sm shrink-0 overflow-hidden">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt={p.playerName} className="w-full h-full object-cover" />
                          ) : (
                            p.playerName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-foreground truncate">{p.playerName}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase">
                            {p.categoryName || "Category"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 text-xs font-bold text-center">
                        Passed / Available for Re-call
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2.5 mt-1 border-red-500/20">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase">Base Price</span>
                      <span className="text-xs font-mono font-black text-foreground">
                        {getCategoryBasePrice(p.categoryName, p.categoryId, p.basePrice)} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* TEAM SQUAD INSPECTION MODAL */}
      {selectedTeamDetailId && (() => {
        const teamSummary = auctionTeams.find((at) => at.team.teamId === selectedTeamDetailId);
        if (!teamSummary) return null;

        const teamSquad = auctionPlayers.filter((p) => p.winningTeamId === selectedTeamDetailId);

        return (
          <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div
              className="max-w-2xl w-full p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-6 animate-scaleIn max-h-[90vh] overflow-y-auto hide-scrollbar"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--athlon-border)" }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-lg shrink-0">
                    {teamSummary.team.teamName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-foreground">
                      {teamSummary.team.teamName}
                    </h3>
                    <p className="text-xs text-foreground/60">
                      Purse Remaining: <strong>{teamSummary.team.remainingBudget.toLocaleString()} {currencyLabel}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeamDetailId(null)}
                  className="p-2.5 rounded-2xl border border-foreground/15 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drafted Squad Members */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-foreground/70 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Drafted Athletes ({teamSquad.length})</span>
                </h4>

                {teamSquad.length === 0 ? (
                  <div className="p-8 text-center text-xs text-foreground/40 font-bold border border-dashed rounded-2xl">
                    No athletes drafted into this franchise yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamSquad.map((sp) => (
                      <div
                        key={sp.auctionPlayerId}
                        className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 bg-surface"
                        style={{ borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0 overflow-hidden">
                            {sp.avatarUrl ? (
                              <img src={sp.avatarUrl} alt={sp.playerName} className="w-full h-full object-cover" />
                            ) : (
                              sp.playerName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-black text-foreground text-xs truncate">{sp.playerName}</h5>
                            <span className="text-[10px] text-foreground/50">{sp.categoryName || "Open"}</span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-black text-primary shrink-0">
                          {(sp.finalBid || sp.basePrice || 1000).toLocaleString()} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t" style={{ borderColor: "var(--athlon-border)" }}>
                <button
                  onClick={() => setSelectedTeamDetailId(null)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
