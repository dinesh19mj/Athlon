"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Send,
  Sliders,
  DollarSign,
  Tv,
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
  const [rightSidebarTab, setRightSidebarTab] = useState<"feed" | "queue" | "purses" | "sold">("feed");
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [displayRemainingSeconds, setDisplayRemainingSeconds] = useState<number>(60);
  const [queueCategoryFilter, setQueueCategoryFilter] = useState<string>("ALL");
  const [queueSearchQuery, setQueueSearchQuery] = useState("");
  const [selectedTeamModalId, setSelectedTeamModalId] = useState<number | null>(null);
  const [isCustomBidOpen, setIsCustomBidOpen] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState<string>("");

  const prevActivePlayerId = useRef<number | null>(null);
  const prevCurrentBid = useRef<number | null>(null);

  // Sound Synth Effects
  const playAudioCue = (type: "bid" | "gavel" | "bell" | "warning") => {
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "gavel") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.45, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
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
      } else if (type === "warning") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio unavailable
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
          // Play audio triggers on state change
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

  // Smooth 1-second countdown ticker
  const isTimerPaused = auctionState?.config?.status === "PAUSED" || Boolean(auctionState?.config?.timerPausedRemainingSeconds);

  useEffect(() => {
    if (isTimerPaused || !auctionState?.activePlayer) return;

    const interval = setInterval(() => {
      setDisplayRemainingSeconds((prev) => {
        if (prev <= 0) return 0;
        if (prev === 6 || prev === 3) playAudioCue("warning");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused, auctionState?.activePlayer?.auctionPlayerId]);

  const myTeamSummary = auctionTeams.find((at) => at.team.teamId === selectedMyTeamId);
  const currencyLabel = auctionState?.config?.currencySymbolOrLabel || "pts";

  const soldPlayers = useMemo(() => auctionPlayers.filter((p) => p.state === "SOLD" || p.state === "ASSIGNED"), [auctionPlayers]);
  const unsoldPlayers = useMemo(() => auctionPlayers.filter((p) => p.state === "UNSOLD"), [auctionPlayers]);
  const waitingPlayers = useMemo(() => auctionPlayers.filter((p) => p.state === "WAITING" || p.state === "CALLED"), [auctionPlayers]);

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

  const handlePlaceCustomBid = async () => {
    const val = Number(customBidAmount);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }
    const current = auctionState?.currentBid || auctionState?.activePlayer?.basePrice || 0;
    if (val <= current) {
      alert(`Custom bid must be greater than current bid (${current} ${currencyLabel})`);
      return;
    }
    if (myTeamSummary && val > myTeamSummary.team.remainingBudget) {
      alert(`Bid amount exceeds ${myTeamSummary.team.teamName}'s purse (${myTeamSummary.team.remainingBudget} ${currencyLabel})`);
      return;
    }

    if (!championship?.championshipId || !auctionState?.activePlayer || !selectedMyTeamId) return;

    try {
      setPlacingBid(true);
      await AuctionService.placeBid(
        championship.championshipId,
        auctionState.activePlayer.auctionPlayerId,
        selectedMyTeamId,
        val,
        userId ? Number(userId) : undefined
      );
      playAudioCue("bid");
      setIsCustomBidOpen(false);
      setCustomBidAmount("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading || !championship) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Flame className="w-6 h-6 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Athlon Auction Arena</h3>
          <p className="text-xs text-foreground/50">Establishing secure real-time live floor stream...</p>
        </div>
      </div>
    );
  }

  // When auction is paused or not started yet
  if (championship.stage !== "AUCTION_STAGE") {
    const isPaused = championship.stage === "AUCTION_PAUSED";
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-black font-sans relative overflow-hidden">
        {/* Ambient Stadium Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header */}
        <header
          className="sticky top-0 z-40 backdrop-blur-2xl border-b px-5 sm:px-8 py-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
        >
          <div className="flex items-center gap-3.5">
            <Link
              href={`/home/team-championship/${championship.championshipUuid}`}
              className="p-2.5 rounded-2xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-amber-500/15 text-amber-400 border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
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
            className="px-4 py-2 rounded-xl border bg-surface hover:bg-white/10 text-foreground font-black text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            style={{ borderColor: "var(--athlon-border)" }}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Live Sync</span>
          </button>
        </header>

        {/* Billboard Paused Screen */}
        <main className="max-w-xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-6 relative z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-surface to-background border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
              <Pause className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 animate-ping opacity-75" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{isPaused ? "Auction Broadcaster Paused" : "Arena Floor Offline"}</span>
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {isPaused ? "Live Bidding Session on Hold" : "Auction Not Started Yet"}
            </h2>
            <p className="text-xs sm:text-sm text-foreground/60 max-w-md mx-auto leading-relaxed">
              {isPaused
                ? "The tournament administrator has temporarily paused the bidding arena. Live telemetry and player draft will automatically resume once the floor opens."
                : "The live auction for this championship has not started yet. Please stay on this page or check back when the broadcast goes live."}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
            <button
              onClick={loadData}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary text-black font-black text-xs sm:text-sm shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Check Floor Status</span>
            </button>

            <Link
              href={`/home/team-championship/${championship.championshipUuid}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border text-foreground/80 hover:text-foreground font-black text-xs sm:text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: "var(--athlon-border)" }}
            >
              <span>Back to Championship</span>
            </Link>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-foreground/40 font-bold border-t" style={{ borderColor: "var(--athlon-border)" }}>
          ATHLON High-Speed Auction Engine • 2s Real-Time Polling Active
        </footer>
      </div>
    );
  }

  // Filtered queue players
  const filteredQueuePlayers = waitingPlayers.filter((p) => {
    const matchesCat = queueCategoryFilter === "ALL" || (p.categoryName || "").toLowerCase() === queueCategoryFilter.toLowerCase();
    const matchesSearch = !queueSearchQuery || p.playerName.toLowerCase().includes(queueSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-background w-screen h-screen overflow-hidden flex flex-col justify-between select-none text-foreground font-sans"
          : "min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black font-sans relative"
      }
    >
      {/* Dynamic Stadium Glow Halo */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-0" />

      {/* ─── 1. TOP BROADCAST CONTROL BAR ─── */}
      <header
        className={`backdrop-blur-2xl border-b px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 transition-all z-40 ${
          isFullscreen ? "rounded-none bg-surface/90 border-foreground/10" : "sticky top-0"
        }`}
        style={{ backgroundColor: isFullscreen ? undefined : "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href={`/home/team-championship/${championship.championshipUuid}`}
            className="p-2.5 rounded-2xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70 shrink-0"
            title="Back to Championship Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border flex items-center gap-1.5 shrink-0 bg-red-500/20 text-red-400 border-red-500/30 animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                LIVE ON-AIR ARENA
              </span>

              <h1 className="text-sm sm:text-base font-black text-foreground truncate max-w-[180px] sm:max-w-md tracking-tight">
                {championship.name}
              </h1>

              {!isAuthenticated && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-foreground/70">
                  <Eye className="w-3 h-3 text-primary" /> Spectator Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Franchise Selector / Login / Audio & Fullscreen */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center shadow-sm cursor-pointer ${
              soundEnabled
                ? "bg-surface hover:bg-white/10 text-primary border-primary/40 shadow-primary/10"
                : "bg-surface/50 text-foreground/40 border-foreground/10"
            }`}
            title={soundEnabled ? "Mute Arena Audio Effects" : "Enable Arena Audio Effects"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Locked Franchise & Purse Pill (for Logged-in Users) */}
          {isAuthenticated && myTeamSummary && (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-surface/90 border border-foreground/15 text-xs font-black text-foreground shadow-sm hidden md:flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[150px]">{myTeamSummary.team.teamName}</span>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/40 text-primary font-black text-xs shadow-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary animate-pulse" />
                <span>{myTeamSummary.team.remainingBudget.toLocaleString()} <span className="text-[10px] font-sans font-bold">{currencyLabel}</span></span>
              </div>
            </div>
          )}

          {/* Login CTA for Non-Logged In Users */}
          {!isAuthenticated && (
            <Link
              href={`/auth/login?redirect=/home/team-championship/${championship.championshipUuid}/auction`}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-primary via-emerald-400 to-primary text-black font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In to Bid</span>
            </Link>
          )}

          {/* Maximize to Fullscreen for Big Screens & Projectors */}
          <button
            onClick={toggleFullscreen}
            className={`p-2.5 sm:px-4 sm:py-2 rounded-2xl border font-black text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
              isFullscreen
                ? "bg-amber-500 text-black border-amber-400 hover:bg-amber-400"
                : "bg-surface hover:bg-white/10 text-foreground border-foreground/15"
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Arena Theater"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Maximize</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── 2. MAIN ARENA COCKPIT ─── */}
      <main className={isFullscreen ? "flex-1 min-h-0 overflow-hidden w-full flex flex-col" : "max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6"}>
        
        {/* Main Stage Grid (Left 8 Cols Stage + Right 4 Cols Telemetry Console) */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 ${isFullscreen ? "flex-1 min-h-0 gap-0 divide-x divide-foreground/10 bg-surface/15" : "gap-6 items-stretch"}`}>
          
          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* LEFT 8 COLS: THE GRAND STADIUM SPOTLIGHT STAGE & BID COMMAND DOCK  */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <div className={`flex flex-col min-h-0 ${isFullscreen ? "lg:col-span-8 h-full p-5 sm:p-7 overflow-y-auto hide-scrollbar" : "lg:col-span-8"}`}>
            {auctionState?.activePlayer ? (
              <div
                className={`rounded-[32px] border shadow-2xl relative flex flex-col justify-between transition-all duration-300 ${
                  isFullscreen
                    ? "h-full p-0 border-0 shadow-none bg-transparent"
                    : "h-[680px] max-h-[calc(100vh-140px)] p-6 sm:p-7 overflow-y-auto hide-scrollbar"
                }`}
                style={{
                  backgroundColor: isFullscreen ? "transparent" : "var(--athlon-card)",
                  borderColor: isMyTeamLeading ? "#f59e0b" : "var(--athlon-primary, #6366f1)",
                  boxShadow: isFullscreen ? "none" : `0 20px 50px -10px rgba(0,0,0,0.7), 0 0 35px -5px ${isMyTeamLeading ? "rgba(245,158,11,0.25)" : "var(--athlon-glow, rgba(99,102,241,0.25))"}`,
                }}
              >
                {/* Stadium Radial Aura */}
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/15 rounded-full blur-3xl pointer-events-none -z-0" />
                <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

                {/* 1. Stage Header: Category Badge, Base Price, Live Dial */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4 relative z-10" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3.5 py-1 rounded-xl bg-primary/20 text-primary border border-primary/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span>{auctionState.activePlayer.categoryName || "Category Phase"}</span>
                    </span>

                    <span className="px-3 py-1 rounded-xl bg-surface border border-foreground/15 text-xs font-bold text-foreground/80 flex items-center gap-1.5 shadow-sm">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Base: <strong className="text-primary font-mono">{getCategoryBasePrice(auctionState.activePlayer.categoryName, auctionState.activePlayer.categoryId, auctionState.activePlayer.basePrice)} {currencyLabel}</strong></span>
                    </span>
                  </div>

                  {/* Floor Dial Status */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-mono font-black text-[10px] uppercase animate-pulse">
                      🔴 Bid Call Active
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-mono font-black text-xs text-foreground/70">
                      Lot #{auctionState.activePlayer.auctionPlayerId}
                    </span>
                  </div>
                </div>

                {/* 2. Hero Centerpiece: Massive Athlete Showcase */}
                <div className="flex flex-col md:flex-row items-center gap-7 relative z-10 py-2">
                  {/* Ultra-Large Athlete Avatar Frame */}
                  <div className="relative shrink-0 group">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-tr from-primary/40 via-indigo-500/30 to-amber-400/30 border-4 border-primary/80 p-1.5 flex items-center justify-center shadow-2xl shadow-primary/30 overflow-hidden transition-all duration-300 group-hover:scale-105">
                      {auctionState.activePlayer.avatarUrl ? (
                        <img
                          src={auctionState.activePlayer.avatarUrl}
                          alt={auctionState.activePlayer.playerName}
                          className="w-full h-full object-cover rounded-[20px]"
                        />
                      ) : (
                        <span className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-wider drop-shadow-lg">
                          {auctionState.activePlayer.playerName.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-xl bg-black/95 border-2 border-primary text-xs font-mono font-black text-primary shadow-xl">
                      #{auctionState.activePlayer.auctionPlayerId}
                    </span>
                  </div>

                  {/* Athlete Information & Headline */}
                  <div className="text-center md:text-left space-y-3 min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
                      <Flame className="w-4 h-4 text-primary fill-primary/30 animate-pulse" />
                      <span>Spotlight Athlete</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight truncate drop-shadow-md leading-tight">
                      {auctionState.activePlayer.playerName}
                    </h2>
                  </div>

                  {/* Segmented Digital Stadium Countdown Dial */}
                  <div
                    className="p-5 rounded-3xl border text-center shrink-0 shadow-2xl min-w-[140px] md:min-w-[160px] flex flex-col justify-between gap-1 transition-all relative overflow-hidden backdrop-blur-xl"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: isTimerPaused ? "#f59e0b" : displayRemainingSeconds <= 10 ? "#ef4444" : "var(--athlon-border)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {isTimerPaused ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                            PAUSED
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-primary animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                            Timer
                          </span>
                        </>
                      )}
                    </div>

                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono block leading-none my-1 tracking-tight ${
                        isTimerPaused
                          ? "text-amber-300"
                          : displayRemainingSeconds <= 10
                          ? "text-red-400 animate-pulse"
                          : "text-amber-400"
                      }`}
                    >
                      {displayRemainingSeconds}s
                    </span>

                    <span className="text-[9.5px] font-bold uppercase text-foreground/40 block">
                      {isTimerPaused ? "Timer on Hold" : displayRemainingSeconds <= 10 ? "Closing Bids!" : "Remaining"}
                    </span>
                  </div>
                </div>

                {/* 3. Dual High-Impact Telemetry Displays */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 pt-2">
                  {/* Current High Bid Card */}
                  <div
                    className="p-5 rounded-3xl border space-y-1.5 bg-gradient-to-br from-primary/15 via-surface to-background/80 shadow-xl relative overflow-hidden"
                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-black uppercase text-foreground/60 tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary" /> Current High Bid
                      </span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    </div>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-3xl sm:text-5xl font-black text-primary font-mono tracking-tighter drop-shadow-sm">
                        {(auctionState.currentBid || auctionState.activePlayer.basePrice || 1000).toLocaleString()}
                      </span>
                      <span className="text-sm font-black text-primary/70 uppercase">{currencyLabel}</span>
                    </div>
                  </div>

                  {/* Leading Franchise Bidder Card */}
                  <div
                    className={`p-5 rounded-3xl border space-y-1.5 shadow-xl relative overflow-hidden transition-all ${
                      isMyTeamLeading
                        ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-surface border-amber-500/50 ring-2 ring-amber-500/30"
                        : "bg-surface"
                    }`}
                    style={{ borderColor: isMyTeamLeading ? undefined : "var(--athlon-border-subtle)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-black uppercase text-foreground/60 tracking-wider flex items-center gap-1.5">
                        <Crown className={`w-4 h-4 ${isMyTeamLeading ? "text-amber-400 animate-bounce" : "text-primary"}`} /> Leading Franchise
                      </span>
                      {isMyTeamLeading && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[9px] uppercase">
                          Your Team
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 pt-0.5 min-w-0">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                        isMyTeamLeading ? "bg-amber-400 text-black" : "bg-primary/20 text-primary border border-primary/30"
                      }`}>
                        {auctionState.winningTeamName ? auctionState.winningTeamName.charAt(0) : "?"}
                      </div>
                      <span className="text-lg sm:text-xl font-black text-foreground truncate drop-shadow-sm">
                        {auctionState.winningTeamName || "No Bids Placed Yet"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Winning Banner Callout (when logged in team holds high bid) */}
                {isMyTeamLeading && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-transparent border border-amber-500/50 flex items-center justify-between text-amber-400 text-xs font-black shadow-lg animate-fadeIn">
                    <span className="flex items-center gap-2.5">
                      <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>👑 YOUR FRANCHISE IS CURRENTLY HOLDING THE HIGHEST BID!</span>
                    </span>
                    <span className="hidden sm:inline px-3 py-1 rounded-xl bg-amber-400 text-black font-black text-[10px] uppercase">
                      Top Bid
                    </span>
                  </div>
                )}

                {/* 5. INTERACTIVE BIDDING DOCK (Automatic vs Manual vs Spectator) */}
                {(() => {
                  const isAutomatic = (auctionState?.config?.biddingMode || "MANUAL") === "AUTOMATIC";
                  const configuredBumps: number[] = auctionState?.config?.quickPointBumps
                    ? auctionState.config.quickPointBumps
                        .split(",")
                        .map((s) => Number(s.trim()))
                        .filter((n) => !isNaN(n) && n > 0)
                    : [100, 250, 500, 1000, 2000];
                  const bumpsToDisplay = configuredBumps.length > 0 ? configuredBumps : [100, 250, 500, 1000, 2000];

                  // Manual Mode Callout
                  if (!isAutomatic) {
                    return (
                      <div
                        className="p-5 rounded-3xl border flex items-center justify-between gap-4 text-xs relative z-10 shadow-inner"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
                            ✋
                          </div>
                          <div>
                            <span className="font-black text-foreground block text-sm">
                              Manual Auctioneer Floor Active
                            </span>
                            <span className="text-xs text-foreground/60">
                              Bids are announced by franchise floor managers and keyed in directly by the tournament auctioneer. Watch live for assignments.
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Non-Logged In Spectator Pad
                  if (!isAuthenticated) {
                    return (
                      <div
                        className="p-6 rounded-3xl border space-y-3 relative z-10 text-center shadow-lg bg-surface/80"
                        style={{ borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                          <Zap className="w-8 h-8 text-primary animate-pulse" />
                          <h4 className="text-base font-black text-foreground">
                            Live Interactive Franchise Bidding
                          </h4>
                          <p className="text-xs text-foreground/60 leading-relaxed">
                            Team owners are bidding live in real-time. Log in to your Athlon account to place bids with your franchise purse balance.
                          </p>
                          <Link
                            href={`/auth/login?redirect=/home/team-championship/${championship.championshipUuid}/auction`}
                            className="mt-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-primary via-emerald-400 to-primary text-black font-black text-xs sm:text-sm shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <LogIn className="w-4 h-4" />
                            <span>Log In to Place Bids</span>
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  // Authenticated Franchise Owner Bidding Controls
                  const currentBid = auctionState.currentBid || auctionState.activePlayer?.basePrice || 0;
                  const minRequiredBid = currentBid + (bumpsToDisplay[0] || 50);
                  const isPurseExhausted = myTeamSummary ? myTeamSummary.team.remainingBudget < minRequiredBid : false;

                  return (
                    <div className="space-y-4 pt-2 relative z-10">
                      {/* Franchise Cockpit Command Card */}
                      {myTeamSummary && (() => {
                        const initialBudget = myTeamSummary.team.initialBudget || 5000;
                        const remainingBudget = myTeamSummary.team.remainingBudget ?? initialBudget;
                        const percentLeft = Math.max(0, Math.min(100, (remainingBudget / initialBudget) * 100));

                        return (
                          <div
                            className="p-4 sm:p-5 rounded-3xl border bg-gradient-to-br from-surface/90 via-surface/60 to-background/90 backdrop-blur-xl shadow-xl space-y-3.5 relative overflow-hidden"
                            style={{ borderColor: "var(--athlon-border)" }}
                          >
                            {/* Subtle Ambient Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                              {/* Left: Team Crest & Identity */}
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/30 via-indigo-500/20 to-primary/10 border-2 border-primary/60 flex items-center justify-center text-primary font-black text-xl shadow-lg shadow-primary/20 shrink-0">
                                  {myTeamSummary.team.teamName.charAt(0).toUpperCase()}
                                </div>

                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary/80">
                                    <Shield className="w-3 h-3 text-primary" />
                                    <span>Active Franchise Team</span>
                                  </div>

                                  <h4 className="text-base sm:text-xl font-black text-foreground truncate tracking-tight">
                                    {myTeamSummary.team.teamName}
                                  </h4>
                                </div>
                              </div>

                              {/* Right: Purse Telemetry Pill & Meter */}
                              <div className="flex flex-col sm:items-end gap-1.5 shrink-0 self-stretch sm:self-auto justify-center bg-black/25 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-white/5">
                                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-black uppercase text-foreground/50 tracking-wider">
                                  <span className="flex items-center gap-1">
                                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Purse Balance</span>
                                  </span>
                                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-foreground/70">
                                    {Math.round(percentLeft)}% left
                                  </span>
                                </div>

                                <div className="flex items-baseline justify-between sm:justify-end gap-2">
                                  <span
                                    className={`text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none ${
                                      isPurseExhausted ? "text-red-400" : "text-primary"
                                    }`}
                                  >
                                    {remainingBudget.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-black text-primary/70 uppercase font-sans">
                                    {currencyLabel}
                                  </span>
                                </div>

                                {/* Micro Battery / Progress Bar */}
                                <div className="w-full sm:w-36 h-1.5 rounded-full bg-foreground/10 overflow-hidden mt-0.5">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      percentLeft > 50 ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : percentLeft > 20 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${percentLeft}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Purse Exhaustion Alert Warning */}
                            {isPurseExhausted && (
                              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-pulse relative z-10 shadow-inner">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                                <span>
                                  <strong>Purse Balance Limit:</strong> {myTeamSummary.team.teamName} has only{" "}
                                  <strong>{myTeamSummary.team.remainingBudget.toLocaleString()} {currencyLabel}</strong> remaining. You cannot place bids exceeding your purse balance.
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Quick Point Bump Action Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {bumpsToDisplay.map((inc) => {
                          const nextTargetBid = currentBid + inc;
                          const isAffordable = myTeamSummary ? myTeamSummary.team.remainingBudget >= nextTargetBid : true;

                          return (
                            <button
                              key={inc}
                              disabled={placingBid || !selectedMyTeamId || !isAffordable || isMyTeamLeading}
                              onClick={() => handlePlaceBid(inc)}
                              className={`py-4 px-2.5 rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-1 select-none cursor-pointer ${
                                !isAffordable || isMyTeamLeading
                                  ? "bg-surface/50 text-foreground/30 border border-foreground/10 cursor-not-allowed opacity-40"
                                  : "bg-gradient-to-r from-primary via-emerald-400 to-primary text-black hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 cursor-pointer"
                              }`}
                              title={
                                isMyTeamLeading
                                  ? "You are currently holding the highest bid!"
                                  : !isAffordable
                                  ? `Requires ${nextTargetBid} pts (Purse: ${myTeamSummary?.team.remainingBudget || 0} pts)`
                                  : `Place bid for ${nextTargetBid} ${currencyLabel}`
                              }
                            >
                              <span className="font-mono text-lg font-black tracking-tight">+{inc}</span>
                              <span className="text-[9px] uppercase font-extrabold text-black/75 truncate max-w-full">
                                {isMyTeamLeading ? "Leading" : isAffordable ? `Bid ${nextTargetBid.toLocaleString()}` : "Exceeds Purse"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Bid Drawer Trigger */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCustomBidOpen((prev) => !prev)}
                          className="text-xs font-bold text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                        >
                          <Sliders className="w-3.5 h-3.5 text-primary" />
                          <span>{isCustomBidOpen ? "Hide Custom Bid" : "Custom Bid Amount"}</span>
                        </button>
                      </div>

                      {/* Custom Bid Input Drawer */}
                      {isCustomBidOpen && (
                        <div className="p-4 rounded-3xl bg-surface border space-y-3 animate-fadeIn" style={{ borderColor: "var(--athlon-border)" }}>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <Coins className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                placeholder={`Enter amount > ${currentBid}...`}
                                value={customBidAmount}
                                onChange={(e) => setCustomBidAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-background border border-foreground/15 text-foreground font-mono font-black text-sm outline-none focus:border-primary"
                              />
                            </div>
                            <button
                              onClick={handlePlaceCustomBid}
                              disabled={placingBid || !customBidAmount}
                              className="px-6 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Custom Bid</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Standby Floor Screen */
              <div
                className={`rounded-[32px] border border-dashed text-center space-y-4 shadow-sm relative overflow-hidden flex flex-col items-center justify-center ${
                  isFullscreen ? "h-full p-8 border-0 bg-transparent" : "h-[680px] max-h-[calc(100vh-140px)] p-16"
                }`}
                style={{ backgroundColor: isFullscreen ? "transparent" : "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto shadow-inner">
                  <Gavel className="w-10 h-10 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                    Arena Floor Standby
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/50 leading-relaxed">
                    The tournament auctioneer is drawing the next athlete. When called to the floor, live stage telemetry and bidding buttons will activate immediately.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT 4 COLS: LIVE TELEMETRY FEED, QUEUE POOL & FRANCHISE CONSOLE  */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <div className={`flex flex-col min-h-0 ${isFullscreen ? "lg:col-span-4 h-full p-4 sm:p-5 bg-surface/30 backdrop-blur-md" : "lg:col-span-4"}`}>
            <div
              className={`rounded-[32px] border shadow-2xl relative flex flex-col backdrop-blur-2xl transition-all duration-300 ${
                isFullscreen
                  ? "h-full p-0 border-0 shadow-none bg-transparent overflow-hidden gap-3.5"
                  : "h-[680px] max-h-[calc(100vh-140px)] p-5 sm:p-6 overflow-hidden gap-4"
              }`}
              style={{ backgroundColor: isFullscreen ? "transparent" : "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              {/* Header Navigation Tabs for Right Console */}
              <div className="shrink-0">
                <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-background/90 border shadow-inner" style={{ borderColor: "var(--athlon-border)" }}>
                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("feed")}
                    className={`flex-1 py-2 px-1.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      rightSidebarTab === "feed"
                        ? "bg-primary text-black shadow-md"
                        : "text-foreground/60 hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <Radio className="w-3 h-3 text-red-500 animate-pulse shrink-0" />
                    <span>Feed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("queue")}
                    className={`flex-1 py-2 px-1.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      rightSidebarTab === "queue"
                        ? "bg-primary text-black shadow-md"
                        : "text-foreground/60 hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <Users className="w-3 h-3 shrink-0" />
                    <span>Queue ({waitingPlayers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("purses")}
                    className={`flex-1 py-2 px-1.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      rightSidebarTab === "purses"
                        ? "bg-primary text-black shadow-md"
                        : "text-foreground/60 hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <Shield className="w-3 h-3 shrink-0" />
                    <span>Teams</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("sold")}
                    className={`flex-1 py-2 px-1.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      rightSidebarTab === "sold"
                        ? "bg-primary text-black shadow-md"
                        : "text-foreground/60 hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Drafted ({soldPlayers.length})</span>
                  </button>
                </div>
              </div>

              {/* TAB CONTENT PANELS (FLEX-1 WITH CLEAN INDEPENDENT SCROLLING) */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* 1. LIVE BIDDING FEED */}
                {rightSidebarTab === "feed" && (
                  <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2.5 pr-0.5">
                    {auctionState?.recentBids && auctionState.recentBids.length > 0 ? (
                      auctionState.recentBids.map((bid, idx) => {
                        const isTopBid = idx === 0;
                        return (
                          <div
                            key={bid.bidId}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                              isTopBid
                                ? "bg-gradient-to-r from-primary/20 via-surface to-surface border-primary/50 shadow-md ring-1 ring-primary/30 animate-fadeIn"
                                : "bg-surface border-foreground/10 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                                isTopBid ? "bg-primary text-black" : "bg-surface border border-foreground/20 text-foreground/80"
                              }`}>
                                {bid.teamName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-black text-foreground truncate block text-xs">{bid.teamName}</span>
                                {isTopBid ? (
                                  <span className="text-[9px] font-black uppercase text-primary block">👑 High Bidder</span>
                                ) : (
                                  <span className="text-[9px] text-foreground/40 block">Placed Bid</span>
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
                      <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-xs text-foreground/40 space-y-2 p-6">
                        <Radio className="w-8 h-8 mx-auto text-foreground/30 animate-pulse" />
                        <p className="font-bold">No bids submitted yet</p>
                        <p className="text-[10.5px]">Incoming live franchise bids will appear here in real-time.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DRAFT QUEUE POOL */}
                {rightSidebarTab === "queue" && (
                  <div className="flex-1 min-h-0 flex flex-col space-y-3">
                    {/* Search & Category Filter */}
                    <div className="space-y-2 shrink-0">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                        <input
                          type="text"
                          placeholder="Search upcoming athlete..."
                          value={queueSearchQuery}
                          onChange={(e) => setQueueSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-foreground/15 text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {championship.categories && championship.categories.length > 0 && (
                        <select
                          value={queueCategoryFilter}
                          onChange={(e) => setQueueCategoryFilter(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          <option value="ALL">All Categories ({waitingPlayers.length})</option>
                          {championship.categories.map((c) => (
                            <option key={c.categoryId || c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2 pr-0.5">
                      {filteredQueuePlayers.length === 0 ? (
                        <div className="p-8 text-center text-xs text-foreground/40 font-bold">
                          No athletes in queue matching filter.
                        </div>
                      ) : (
                        filteredQueuePlayers.map((p) => (
                          <div
                            key={p.auctionPlayerId}
                            className="p-3 rounded-2xl border flex items-center justify-between text-xs transition-all hover:bg-white/5 bg-surface"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
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
                                <span className="text-[9.5px] text-foreground/50 block truncate">{p.categoryName || "Open"}</span>
                              </div>
                            </div>

                            <span className="text-xs font-mono font-black text-primary ml-1 shrink-0">
                              {getCategoryBasePrice(p.categoryName, p.categoryId, p.basePrice)} pts
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 3. FRANCHISE PURSES SNAPSHOT */}
                {rightSidebarTab === "purses" && (
                  <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-3 pr-0.5">
                    {auctionTeams.map((at) => {
                      const initialBudget = at.team.initialBudget || 5000;
                      const remainingBudget = at.team.remainingBudget ?? initialBudget;
                      const spentBudget = at.team.spentBudget || (initialBudget - remainingBudget);
                      const percentLeft = Math.max(0, Math.min(100, (remainingBudget / initialBudget) * 100));

                      return (
                        <div
                          key={at.team.teamId}
                          onClick={() => setSelectedTeamModalId(at.team.teamId)}
                          className="p-3.5 rounded-2xl border space-y-2.5 bg-surface hover:bg-white/5 transition-all cursor-pointer shadow-sm"
                          style={{ borderColor: "var(--athlon-border-subtle)" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                {at.team.teamName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-black text-foreground text-xs truncate">{at.team.teamName}</h5>
                                <span className="text-[10px] text-foreground/50">{at.team.playersAcquiredCount || 0} Drafted</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono font-black text-primary text-xs block">
                                {remainingBudget.toLocaleString()} pts
                              </span>
                              <span className="text-[9.5px] text-foreground/40 font-bold block">{Math.round(percentLeft)}% left</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentLeft > 50 ? "bg-emerald-500" : percentLeft > 20 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${percentLeft}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. DRAFTED PLAYERS */}
                {rightSidebarTab === "sold" && (
                  <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2.5 pr-0.5">
                    {soldPlayers.length === 0 ? (
                      <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-xs text-foreground/40 space-y-1 p-6">
                        <Trophy className="w-8 h-8 mx-auto text-foreground/30 mb-1" />
                        <p className="font-bold">No drafted players yet</p>
                        <p className="text-[10px]">Athletes sold to teams will show here.</p>
                      </div>
                    ) : (
                      soldPlayers.map((p) => (
                        <div
                          key={p.auctionPlayerId}
                          className="p-3 rounded-2xl border flex items-center justify-between text-xs bg-surface"
                          style={{ borderColor: "var(--athlon-border-subtle)" }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0 overflow-hidden">
                              {p.avatarUrl ? (
                                <img src={p.avatarUrl} alt={p.playerName} className="w-full h-full object-cover" />
                              ) : (
                                p.playerName.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-black text-foreground truncate">{p.playerName}</h5>
                              <span className="text-[9.5px] text-foreground/60 font-semibold truncate block">
                                Drafted by <strong>{p.winningTeamName || "Franchise"}</strong>
                              </span>
                            </div>
                          </div>

                          <span className="font-mono font-black text-emerald-400 text-xs ml-2 shrink-0">
                            {(p.finalBid || p.basePrice || 1000).toLocaleString()} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── 3. TEAM SQUAD AUDIT MODAL ─── */}
      {selectedTeamModalId && (() => {
        const teamSummary = auctionTeams.find((at) => at.team.teamId === selectedTeamModalId);
        if (!teamSummary) return null;

        const teamSquad = auctionPlayers.filter((p) => p.winningTeamId === selectedTeamModalId);

        return (
          <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div
              className="max-w-2xl w-full p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-6 animate-scaleIn max-h-[90vh] overflow-y-auto hide-scrollbar"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--athlon-border)" }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-lg shrink-0 shadow-inner">
                    {teamSummary.team.teamName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-foreground">
                      {teamSummary.team.teamName}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Purse Remaining: <strong className="text-primary font-mono">{teamSummary.team.remainingBudget.toLocaleString()} {currencyLabel}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeamModalId(null)}
                  className="p-2.5 rounded-2xl border border-foreground/15 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drafted Squad Members Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-foreground/70 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Drafted Squad Athletes ({teamSquad.length})</span>
                </h4>

                {teamSquad.length === 0 ? (
                  <div className="p-10 text-center text-xs text-foreground/40 font-bold border border-dashed rounded-2xl">
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
                  onClick={() => setSelectedTeamModalId(null)}
                  className="px-7 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
