"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Trophy,
  Shield,
  Users,
  UserCheck,
  Gavel,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  DollarSign,
  Plus,
  ChevronDown,
  ChevronUp,
  Coins,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  Check,
  X,
  Swords,
  Layers,
  Sparkles,
  Lock,
  Eye,
  Flame,
  Radio,
  ExternalLink,
  Maximize2,
  Minimize2,
  Tv,
  Shuffle,
  Dices,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Crown,
  Settings,
  Palette,
  LayoutGrid,
  List,
  User,
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  BadgePercent,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { useAthlonTheme } from "@/hooks/use-athlon-theme";
import {
  TeamChampionshipService,
  TeamChampionship,
  ChampionshipTeamRegistration,
  ChampionshipPlayerRegistration,
  ChampionshipSquadPlayer,
  TeamChampionshipFixture,
  TeamChampionshipSubMatch,
  TeamChampionshipPool,
  StandingsRow,
  TeamSquadAudit,
} from "@/lib/api/teamChampionship";
import {
  AuctionService,
  AuctionState,
  AuctionPlayer,
  AuctionTeamSummary,
  AuctionBid,
} from "@/lib/api/auction";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function TeamChampionshipDashboardPage() {
  const params = useParams();
  const orgUuid = params.orgId as string;
  const championshipUuid = params.id as string;
  const router = useRouter();
  const { userId } = useAuthStore();

  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "players" | "auction-players" | "auction" | "squads" | "fixtures" | "lineups" | "standings"
  >("overview");

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [teams, setTeams] = useState<ChampionshipTeamRegistration[]>([]);
  const [players, setPlayers] = useState<ChampionshipPlayerRegistration[]>([]);
  const [fixtures, setFixtures] = useState<TeamChampionshipFixture[]>([]);
  const [pools, setPools] = useState<TeamChampionshipPool[]>([]);
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Auction State
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [auctionPlayers, setAuctionPlayers] = useState<AuctionPlayer[]>([]);
  const [auctionTeams, setAuctionTeams] = useState<AuctionTeamSummary[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [searchPlayerQuery, setSearchPlayerQuery] = useState("");
  const [selectedAuctionCategoryFilter, setSelectedAuctionCategoryFilter] = useState<string>("ALL");
  const [searchAuctionPlayerQuery, setSearchAuctionPlayerQuery] = useState("");
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [isAuctionFullscreen, setIsAuctionFullscreen] = useState(false);

  // Redesigned Live Auction State
  const [selectedAuctionPhaseCatId, setSelectedAuctionPhaseCatId] = useState<number | null>(null);
  const [manualWinningTeamId, setManualWinningTeamId] = useState<number | null>(null);
  const [manualWinningBid, setManualWinningBid] = useState<number | null>(null);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [isPurseModalOpen, setIsPurseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [highlightedTeamId, setHighlightedTeamId] = useState<number | null>(null);
  const [auctionBiddingMode, setAuctionBiddingMode] = useState<"MANUAL" | "AUTOMATIC">("MANUAL");
  const [availableTimerPresets, setAvailableTimerPresets] = useState<number[]>([15, 30, 45, 60, 90, 120]);
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(60);
  const [isTimerConfigOpen, setIsTimerConfigOpen] = useState<boolean>(false);
  const [availablePointBumps, setAvailablePointBumps] = useState<number[]>([50, 100, 200, 250, 500, 1000, 2000, 5000]);
  const [selectedPointBumps, setSelectedPointBumps] = useState<number[]>([100, 250, 500, 1000, 2000]);
  const [isCustomBumpModalOpen, setIsCustomBumpModalOpen] = useState<boolean>(false);
  const [customTimerInput, setCustomTimerInput] = useState<string>("");
  const [customBumpInput, setCustomBumpInput] = useState<string>("");
  const [categoryTrayFilter, setCategoryTrayFilter] = useState<"ALL" | "WAITING" | "SOLD" | "UNSOLD">("ALL");
  const [rightTrayTab, setRightTrayTab] = useState<"BIDS" | "QUEUE">("QUEUE");
  const [isManualLocked, setIsManualLocked] = useState(false);
  const [displayRemainingSeconds, setDisplayRemainingSeconds] = useState<number>(60);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { theme: currentTheme, themeKey, setTheme, availableThemes } = useAthlonTheme();

  // Snipper / Spinner States
  const [isSpinningCategory, setIsSpinningCategory] = useState(false);
  const [spinningCategoryName, setSpinningCategoryName] = useState<string>("");
  const [categoryWheelRotation, setCategoryWheelRotation] = useState<number>(0);
  const [categoryWheelCategories, setCategoryWheelCategories] = useState<any[]>([]);
  const [categoryWheelWinner, setCategoryWheelWinner] = useState<any | null>(null);
  const [isCategorySectionExpanded, setIsCategorySectionExpanded] = useState<boolean>(false);
  const [isSpinningPlayer, setIsSpinningPlayer] = useState(false);
  const [spinningPlayerName, setSpinningPlayerName] = useState<string>("");
  const [playerWheelRotation, setPlayerWheelRotation] = useState<number>(0);
  const [playerWheelPlayers, setPlayerWheelPlayers] = useState<AuctionPlayer[]>([]);
  const [playerWheelWinner, setPlayerWheelWinner] = useState<AuctionPlayer | null>(null);

  const CATEGORY_WHEEL_COLORS = [
    "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"
  ];

  // Synthesized Web Audio Sound Effects
  const playAudioEffect = (type: "tick" | "win" | "gavel") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === "tick") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "win") {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === "gavel") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) { }
  };

  const toggleAuctionFullscreen = () => {
    if (!isAuctionFullscreen) {
      setIsAuctionFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
    } else {
      setIsAuctionFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsAuctionFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Fixture & Lineup State
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [fixtureDetail, setFixtureDetail] = useState<any>(null);
  const [selectedTeamForAudit, setSelectedTeamForAudit] = useState<number | null>(null);
  const [teamAudit, setTeamAudit] = useState<TeamSquadAudit | null>(null);
  const [squadSearchQuery, setSquadSearchQuery] = useState("");
  const [squadFilterStatus, setSquadFilterStatus] = useState<"ALL" | "PLAYED" | "UNPLAYED" | "AUCTION" | "RESERVED" | "DIRECT">("ALL");
  const [squadTeamSearch, setSquadTeamSearch] = useState("");
  const [squadViewLayout, setSquadViewLayout] = useState<"grid" | "list">("grid");
  const [loadingSquadAudit, setLoadingSquadAudit] = useState(false);

  // Team & Player Registration Modal States
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [teamSubmitting, setTeamSubmitting] = useState(false);
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    captainName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [playerSubmitting, setPlayerSubmitting] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    categoryId: 0,
    basePrice: 0,
  });

  const loadData = async () => {
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(championshipUuid);
    if (!isValidUuid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [champRes, teamsRes, playersRes, fixturesRes, poolsRes, standingsRes] = await Promise.all([
        TeamChampionshipService.getById(championshipUuid),
        TeamChampionshipService.getTeams(championshipUuid),
        TeamChampionshipService.getPlayers(championshipUuid),
        TeamChampionshipService.getFixtures(championshipUuid),
        TeamChampionshipService.getPools(championshipUuid),
        TeamChampionshipService.getStandings(championshipUuid),
      ]);

      setChampionship(champRes);
      setTeams(teamsRes || []);
      setPlayers(playersRes || []);
      setFixtures(fixturesRes || []);
      setPools(poolsRes || []);
      setStandings(standingsRes || []);

      if (teamsRes && teamsRes.length > 0 && !selectedTeamForAudit) {
        setSelectedTeamForAudit(teamsRes[0].teamId);
      }
    } catch (err) {
      console.error("Failed to load championship data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [championshipUuid]);

  // Restore cached auction settings on load
  useEffect(() => {
    if (!championshipUuid || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`athlon_auction_settings_${championshipUuid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.biddingMode) setAuctionBiddingMode(parsed.biddingMode);
        if (parsed.timerSeconds) setTimerDurationSeconds(parsed.timerSeconds);
        if (Array.isArray(parsed.availableTimers) && parsed.availableTimers.length > 0) {
          setAvailableTimerPresets(parsed.availableTimers);
        }
        if (Array.isArray(parsed.selectedBumps) && parsed.selectedBumps.length > 0) {
          setSelectedPointBumps(parsed.selectedBumps);
        }
        if (Array.isArray(parsed.availableBumps) && parsed.availableBumps.length > 0) {
          setAvailablePointBumps(parsed.availableBumps);
        }
      }
    } catch (e) { }
  }, [championshipUuid]);

  // Load Auction State
  const loadAuction = async () => {
    if (!championship?.championshipId) return;
    try {
      // Find auction config
      const state = await AuctionService.getState(championship.championshipId);
      setAuctionState(state);
      const [plRes, tmRes] = await Promise.all([
        AuctionService.getPlayers(championship.championshipId),
        AuctionService.getTeams(championship.championshipId),
      ]);
      setAuctionPlayers(plRes || []);
      setAuctionTeams(tmRes || []);
    } catch (err) {
      console.error("Auction not initialized or failed to load", err);
    }
  };

  useEffect(() => {
    if (activeTab === "auction" && championship) {
      loadAuction();
      const interval = setInterval(loadAuction, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, championship]);

  // Auto-select first team when entering squads tab if none is selected
  useEffect(() => {
    if (activeTab === "squads" && !selectedTeamForAudit && teams.length > 0) {
      setSelectedTeamForAudit(teams[0].teamId);
    }
  }, [activeTab, teams, selectedTeamForAudit]);

  // Load Team Audit
  useEffect(() => {
    if (selectedTeamForAudit && championship?.championshipId) {
      setLoadingSquadAudit(true);
      TeamChampionshipService.getSquadAudit(selectedTeamForAudit, championship.championshipId)
        .then(setTeamAudit)
        .catch(console.error)
        .finally(() => setLoadingSquadAudit(false));
    }
  }, [selectedTeamForAudit, championship]);

  // Load Fixture Detail
  useEffect(() => {
    if (selectedFixtureId) {
      TeamChampionshipService.getFixtureDetail(selectedFixtureId, true)
        .then(setFixtureDetail)
        .catch(console.error);
    }
  }, [selectedFixtureId]);

  // Auction Actions
  const handleCallPlayer = async (auctionPlayerId: number) => {
    if (!championship?.championshipId) return;
    if (championship.stage !== "AUCTION_STAGE") {
      alert("Please start the Live Auction first before placing players on the bidding floor!");
      return;
    }
    await AuctionService.callPlayer(championship.championshipId, auctionPlayerId, userId ? Number(userId) : undefined);
    loadAuction();
  };

  const handlePlaceBid = async (teamId: number, bidAmount: number) => {
    if (!championship?.championshipId || !auctionState?.activePlayer) return;
    await AuctionService.placeBid(
      championship.championshipId,
      auctionState.activePlayer.auctionPlayerId,
      teamId,
      bidAmount,
      userId ? Number(userId) : undefined
    );
    loadAuction();
  };

  const handleAssignPlayerManual = async () => {
    if (!championship?.championshipId || !auctionState?.activePlayer) return;
    const targetTeamId = manualWinningTeamId || auctionState.winningTeamId;
    if (!targetTeamId) {
      alert("Please select a franchise team to map this player to!");
      return;
    }
    const finalPoints = (manualWinningBid !== null && manualWinningBid > 0)
      ? manualWinningBid
      : (auctionState.currentBid || auctionState.activePlayer.basePrice || 1000);

    try {
      setAssigningLoading(true);
      playAudioEffect("gavel");
      await AuctionService.assignPlayer(
        championship.championshipId,
        auctionState.activePlayer.auctionPlayerId,
        targetTeamId,
        finalPoints,
        userId ? Number(userId) : undefined
      );
      playAudioEffect("win");
      await loadAuction();
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to assign player to team");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleMarkUnsold = async () => {
    if (!championship?.championshipId || !auctionState?.activePlayer) return;
    await AuctionService.markUnsold(championship.championshipId, auctionState.activePlayer.auctionPlayerId);
    loadAuction();
  };

  const isTimerPaused = auctionState?.config?.status === "PAUSED" || Boolean(auctionState?.config?.timerPausedRemainingSeconds);

  // Sync server authority remaining timer to local display
  useEffect(() => {
    if (auctionState?.remainingTimerSeconds !== undefined && auctionState?.remainingTimerSeconds !== null) {
      setDisplayRemainingSeconds(auctionState.remainingTimerSeconds);
    }
  }, [auctionState?.remainingTimerSeconds, auctionState?.activePlayer?.auctionPlayerId]);

  // Precise 1-second countdown ticker for smooth, single-second countdown
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

  const handleTogglePauseTimer = async () => {
    if (!championship?.championshipId) return;
    try {
      if (isTimerPaused) {
        const updated = await AuctionService.resumeTimer(championship.championshipId);
        setAuctionState(updated);
        if (updated?.remainingTimerSeconds !== undefined) {
          setDisplayRemainingSeconds(updated.remainingTimerSeconds);
        }
      } else {
        const updated = await AuctionService.pauseTimer(championship.championshipId);
        setAuctionState(updated);
        if (updated?.remainingTimerSeconds !== undefined) {
          setDisplayRemainingSeconds(updated.remainingTimerSeconds);
        }
      }
    } catch (err: any) {
      console.error("Failed to toggle timer pause:", err);
      alert(err.message || "Failed to toggle timer pause");
    }
  };

  const handleResetTimer = async () => {
    if (!championship?.championshipId) return;
    try {
      const fullSecs = auctionState?.config?.timerSeconds || timerDurationSeconds || 60;
      setDisplayRemainingSeconds(fullSecs);
      const updated = await AuctionService.resetTimer(championship.championshipId);
      setAuctionState(updated);
      setIsManualLocked(false);
    } catch (err: any) {
      console.error("Failed to reset timer:", err);
      alert(err.message || "Failed to reset timer");
    }
  };

  // Sync active player details into manual lock desk
  useEffect(() => {
    if (auctionState?.activePlayer) {
      setIsManualLocked(false);
      const activeCat = championship?.categories?.find(
        (c) =>
          c.name?.toLowerCase() === (auctionState.activePlayer?.categoryName || "").toLowerCase() ||
          c.categoryId === auctionState.activePlayer?.categoryId
      );
      const effBasePrice = activeCat?.basePrice && activeCat.basePrice > 0
        ? activeCat.basePrice
        : (auctionState.activePlayer.basePrice > 0 ? auctionState.activePlayer.basePrice : 1000);

      const current = auctionState.currentBid && auctionState.currentBid > 0 ? auctionState.currentBid : effBasePrice;
      setManualWinningBid(current);
      if (auctionState.winningTeamId) {
        setManualWinningTeamId(auctionState.winningTeamId);
      } else if (auctionTeams.length > 0 && !manualWinningTeamId) {
        setManualWinningTeamId(auctionTeams[0].team.teamId);
      }
      // Automatically switch right tray to live podcast stream only when automatic bidding is active
      if (auctionBiddingMode === "AUTOMATIC") {
        setRightTrayTab("BIDS");
      }
    }
  }, [auctionState?.activePlayer?.auctionPlayerId, auctionState?.currentBid, auctionState?.winningTeamId, auctionBiddingMode]);

  // Sync Auction Config (Bidding Mode, Timer, Point Bumps)
  useEffect(() => {
    if (auctionState?.config) {
      if (auctionState.config.biddingMode) {
        setAuctionBiddingMode(auctionState.config.biddingMode);
      }
      if (auctionState.config.timerSeconds) {
        setTimerDurationSeconds(auctionState.config.timerSeconds);
        setAvailableTimerPresets((prev) => Array.from(new Set([...prev, auctionState.config.timerSeconds!])).sort((a, b) => a - b));
      }
      if (auctionState.config.quickPointBumps) {
        const bumps = auctionState.config.quickPointBumps
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0);
        if (bumps.length > 0) {
          setSelectedPointBumps(bumps);
          setAvailablePointBumps((prev) => Array.from(new Set([...prev, ...bumps])).sort((a, b) => a - b));
        }
      }
    }
  }, [auctionState?.config?.biddingMode, auctionState?.config?.timerSeconds, auctionState?.config?.quickPointBumps]);

  const handleUpdateAuctionSettings = async (
    newMode?: "MANUAL" | "AUTOMATIC",
    newTimer?: number,
    newBumps?: number[],
    newAvailableBumps?: number[],
    newAvailableTimers?: number[]
  ) => {
    if (!championship?.championshipId) return;
    const mode = newMode || auctionBiddingMode;
    const timer = newTimer || timerDurationSeconds;
    const bumps = newBumps || selectedPointBumps;
    const availableBumps = newAvailableBumps || availablePointBumps;
    const availableTimers = newAvailableTimers || availableTimerPresets;

    if (newMode) setAuctionBiddingMode(newMode);
    if (newTimer) setTimerDurationSeconds(newTimer);
    if (newBumps) setSelectedPointBumps(bumps);
    if (newAvailableBumps) setAvailablePointBumps(availableBumps);
    if (newAvailableTimers) setAvailableTimerPresets(availableTimers);

    // Save to localStorage immediately so refresh preserves custom values
    try {
      if (typeof window !== "undefined" && championshipUuid) {
        localStorage.setItem(
          `athlon_auction_settings_${championshipUuid}`,
          JSON.stringify({
            biddingMode: mode,
            timerSeconds: timer,
            selectedBumps: bumps,
            availableBumps: availableBumps,
            availableTimers: availableTimers,
          })
        );
      }
    } catch (e) { }

    try {
      await AuctionService.createOrUpdateConfig({
        championshipId: championship.championshipId,
        championshipUuid: championship.championshipUuid,
        biddingMode: mode,
        timerSeconds: timer,
        quickPointBumps: bumps.join(","),
      });
      loadAuction();
    } catch (e) {
      console.error("Failed to update auction settings", e);
    }
  };

  // Spinner 1: Round Wheel Category Snipper
  const runCategorySnipper = () => {
    if (championship?.stage !== "AUCTION_STAGE") {
      alert("Please click 'Start Live Auction' above to begin the live session before spinning categories!");
      return;
    }

    const availableCategories = (championship?.categories || []).filter((c) => {
      const catPlayers = auctionPlayers.filter(
        (p) =>
          (p.categoryId === c.categoryId ||
            (p.categoryName && c.name && p.categoryName.toLowerCase().trim() === c.name.toLowerCase().trim())) &&
          p.state === "WAITING"
      );
      return catPlayers.length > 0;
    });

    const candidateList = availableCategories.length > 0 ? availableCategories : (championship?.categories || []);
    if (candidateList.length === 0) {
      alert("No categories found to spin!");
      return;
    }

    if (candidateList.length === 1) {
      setSelectedAuctionPhaseCatId(candidateList[0].categoryId || null);
      setIsCategorySectionExpanded(false);
      playAudioEffect("win");
      return;
    }

    const shuffled = [...candidateList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCategoryWheelCategories(shuffled);
    setIsSpinningCategory(true);
    setCategoryWheelWinner(null);
    setSpinningCategoryName("");

    const numCats = shuffled.length;
    const winningIndex = Math.floor(Math.random() * numCats);
    const sliceAngle = 360 / numCats;
    const sliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const randomOffset = (Math.random() * 0.6 - 0.3) * sliceAngle;
    const winningSliceTarget = sliceCenter + randomOffset;

    // 4 to 5 full rotations + landing slice under top pointer (270deg offset in CSS wheel)
    const spins = 4 + Math.floor(Math.random() * 2);
    const baseRotation = Math.ceil(categoryWheelRotation / 360) * 360;
    const targetRotation = baseRotation + spins * 360 + (360 - winningSliceTarget);

    setTimeout(() => {
      setCategoryWheelRotation(targetRotation);
    }, 60);

    // Audio tick ticker during wheel rotation
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playAudioEffect("tick");
      if (tickCount > 28) clearInterval(tickInterval);
    }, 160);

    // After animation finishes (5 seconds)
    setTimeout(() => {
      clearInterval(tickInterval);
      const selected = shuffled[winningIndex];
      setCategoryWheelWinner(selected);
      setSpinningCategoryName(selected.name);
      setSelectedAuctionPhaseCatId(selected.categoryId || null);
      setIsCategorySectionExpanded(false);
      playAudioEffect("win");

      setTimeout(() => {
        setIsSpinningCategory(false);
        setCategoryWheelWinner(null);
      }, 2400);
    }, 5100);
  };

  // Spinner 2: Round Wheel Player Snipper within Selected Category
  const runPlayerSnipper = () => {
    if (championship?.stage !== "AUCTION_STAGE") {
      alert("Please click 'Start Live Auction' above to begin the live session before spinning players!");
      return;
    }

    const categories = championship?.categories || [];
    const activeCategory = categories.find((c) => c.categoryId === selectedAuctionPhaseCatId) || categories[0];
    const activeCatId = activeCategory?.categoryId;

    let eligiblePlayers = auctionPlayers.filter((p) => {
      // Exclude SOLD, ASSIGNED, and UNSOLD players strictly
      if (p.state !== "WAITING") return false;
      if (!activeCategory) return true;
      if (p.categoryId && activeCatId && p.categoryId === activeCatId) return true;
      if (
        p.categoryName &&
        activeCategory.name &&
        p.categoryName.toLowerCase().trim() === activeCategory.name.toLowerCase().trim()
      ) {
        return true;
      }
      return false;
    });

    if (eligiblePlayers.length === 0) {
      alert(`No waiting players left in category "${activeCategory?.name || "Selected"}" to spin! (Sold & Unsold athletes are excluded from the wheel)`);
      return;
    }

    if (eligiblePlayers.length === 1) {
      handleCallPlayer(eligiblePlayers[0].auctionPlayerId);
      playAudioEffect("win");
      return;
    }

    const shuffled = [...eligiblePlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPlayerWheelPlayers(shuffled);
    setIsSpinningPlayer(true);
    setPlayerWheelWinner(null);
    setSpinningPlayerName("");

    const numPlayers = shuffled.length;
    const winningIndex = Math.floor(Math.random() * numPlayers);
    const sliceAngle = 360 / numPlayers;
    const sliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const randomOffset = (Math.random() * 0.6 - 0.3) * sliceAngle;
    const winningSliceTarget = sliceCenter + randomOffset;

    const spins = 4 + Math.floor(Math.random() * 2);
    const baseRotation = Math.ceil(playerWheelRotation / 360) * 360;
    const targetRotation = baseRotation + spins * 360 + (360 - winningSliceTarget);

    setTimeout(() => {
      setPlayerWheelRotation(targetRotation);
    }, 60);

    // Audio tick ticker during wheel rotation
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playAudioEffect("tick");
      if (tickCount > 28) clearInterval(tickInterval);
    }, 160);

    // After animation finishes (5 seconds)
    setTimeout(() => {
      clearInterval(tickInterval);
      const selected = shuffled[winningIndex];
      setPlayerWheelWinner(selected);
      setSpinningPlayerName(selected.playerName);
      playAudioEffect("win");

      setTimeout(async () => {
        setIsSpinningPlayer(false);
        setPlayerWheelWinner(null);
        await handleCallPlayer(selected.auctionPlayerId);
      }, 2400);
    }, 5100);
  };

  const isAuctionLive = championship?.stage === "AUCTION_STAGE";
  const isAuctionPaused = championship?.stage === "AUCTION_PAUSED";

  const handleToggleAuctionStage = async (
    newStage: "AUCTION_STAGE" | "AUCTION_PAUSED" | "LEAGUE_STAGE" | "REGISTRATION_OPEN"
  ) => {
    if (!championship) return;
    try {
      setChampionship((prev) => (prev ? { ...prev, stage: newStage } : null));
      await TeamChampionshipService.updateStage(championshipUuid, newStage);
      await loadData();
    } catch (err: any) {
      console.error("Failed to update championship stage:", err);
      alert(err.message || "Failed to update championship stage");
    }
  };

  // Team Status & Payment Handlers
  const handleUpdateTeamStatus = async (teamId: number, status: string) => {
    try {
      setTeams((prev) =>
        prev.map((t) => (t.teamId === teamId ? { ...t, status } : t))
      );
      await TeamChampionshipService.updateTeamStatus(teamId, status);
    } catch (err: any) {
      console.error("Failed to update team status:", err);
      TeamChampionshipService.getTeams(championshipUuid).then((res) => setTeams(res || []));
    }
  };

  const handleUpdateTeamPayment = async (teamId: number, paymentStatus: string) => {
    try {
      setTeams((prev) =>
        prev.map((t) => (t.teamId === teamId ? { ...t, paymentStatus } : t))
      );
      await TeamChampionshipService.updateTeamPayment(teamId, paymentStatus);
    } catch (err: any) {
      console.error("Failed to update team payment:", err);
      TeamChampionshipService.getTeams(championshipUuid).then((res) => setTeams(res || []));
    }
  };

  // Player Status & Payment Handlers
  const handleUpdatePlayerStatus = async (playerId: number, status: string) => {
    try {
      setPlayers((prev) =>
        prev.map((p) => (p.playerId === playerId ? { ...p, status } : p))
      );
      await TeamChampionshipService.updatePlayerStatus(playerId, status);
    } catch (err: any) {
      console.error("Failed to update player status:", err);
      TeamChampionshipService.getPlayers(championshipUuid).then((res) => setPlayers(res || []));
    }
  };

  const handleUpdatePlayerPayment = async (playerId: number, paymentStatus: string) => {
    try {
      setPlayers((prev) =>
        prev.map((p) => (p.playerId === playerId ? { ...p, paymentStatus } : p))
      );
      await TeamChampionshipService.updatePlayerPayment(playerId, paymentStatus);
    } catch (err: any) {
      console.error("Failed to update player payment:", err);
      TeamChampionshipService.getPlayers(championshipUuid).then((res) => setPlayers(res || []));
    }
  };

  // Register Team Handler
  const handleRegisterTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.teamName || !championship?.championshipId) return;
    try {
      setTeamSubmitting(true);
      await TeamChampionshipService.registerTeam({
        championshipId: championship.championshipId,
        championshipUuid: championshipUuid,
        teamName: teamForm.teamName,
        captainName: teamForm.captainName,
        contactPhone: teamForm.contactPhone,
        contactEmail: teamForm.contactEmail,
        paymentStatus: "PAID",
        paymentAmount: championship.teamRegistrationFee || 0,
      });
      setTeamForm({ teamName: "", captainName: "", contactPhone: "", contactEmail: "" });
      setIsAddTeamModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to register team");
    } finally {
      setTeamSubmitting(false);
    }
  };

  // Register Player Handler
  const handleRegisterPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.fullName || !championship?.championshipId) return;
    try {
      setPlayerSubmitting(true);
      const selectedCat = championship.categories?.find((c) => c.categoryId === Number(playerForm.categoryId));
      await TeamChampionshipService.registerPlayer({
        championshipId: championship.championshipId,
        championshipUuid: championshipUuid,
        fullName: playerForm.fullName,
        phone: playerForm.phone,
        email: playerForm.email,
        categoryId: playerForm.categoryId ? Number(playerForm.categoryId) : undefined,
        categoryName: selectedCat ? selectedCat.name : "Open",
        basePrice: playerForm.basePrice || selectedCat?.basePrice || 0,
        paymentStatus: "PAID",
        feeAmount: selectedCat?.registrationFee || championship.defaultPlayerFee || 0,
      });
      setPlayerForm({ fullName: "", phone: "", email: "", categoryId: 0, basePrice: 0 });
      setIsAddPlayerModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to register player");
    } finally {
      setPlayerSubmitting(false);
    }
  };

  // Generate Fixtures
  const handleGeneratePools = async () => {
    if (!championship?.championshipId) return;
    await TeamChampionshipService.generatePoolFixtures(championship.championshipId, 2);
    loadData();
    setActiveTab("fixtures");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-foreground/60">Loading Championship...</p>
        </div>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground p-6">
        <div
          className="text-center space-y-4 max-w-md p-8 rounded-3xl border shadow-xl"
          style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-foreground">Championship Not Found</h2>
          <p className="text-xs text-foreground/60">
            The requested championship ID is invalid or could not be located. Please check the URL or select a championship from your dashboard.
          </p>
          <Link
            href={`/org/${orgUuid}/tournaments`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const currencyLabel = championship.auctionMode !== "NO_AUCTION" ? "pts" : "₹";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* Top Banner */}
      <div
        className="border-b px-4 sm:px-8 py-6 relative overflow-hidden"
        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/org/${orgUuid}/tournaments`}
                className="p-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                {championship.sport} Championship
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-foreground/10 text-foreground/70">
                {championship.stage}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{championship.name}</h1>
            <p className="text-xs text-foreground/60 max-w-xl">{championship.location || "Venue details inside"}</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleGeneratePools}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <Swords className="w-4 h-4" /> Generate Pool Fixtures
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-8"
        style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar py-2.5">
          {(() => {
            const auctionEligiblePlayers = players.filter(
              (p) => p.status === "APPROVED" && p.paymentStatus === "PAID"
            );

            return [
              { id: "overview", label: "Overview", icon: Trophy },
              { id: "teams", label: `Teams (${teams.length})`, icon: Users },
              { id: "players", label: `Player Pool (${players.length})`, icon: UserCheck },
              { id: "auction-players", label: `Auction Players (${auctionEligiblePlayers.length})`, icon: Coins },
              { id: "auction", label: "Live Auction Arena", icon: Gavel },
              { id: "squads", label: "Squads & Participation", icon: Shield },
              { id: "fixtures", label: `Fixtures (${fixtures.length})`, icon: Calendar },
              { id: "standings", label: "Standings & Knockout", icon: Layers },
            ];
          })().map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 border ${isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="md:col-span-2 rounded-3xl border p-6 space-y-6"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              {championship.posterUrl && (
                <div
                  className="relative rounded-2xl overflow-hidden border max-h-64 flex items-center justify-center bg-black/40 shadow-sm"
                  style={{ borderColor: "var(--athlon-border)" }}
                >
                  <img
                    src={
                      championship.posterUrl.startsWith("http") || championship.posterUrl.startsWith("data:")
                        ? championship.posterUrl
                        : `/api/tournament/team-championship/getFile?filePath=${encodeURIComponent(championship.posterUrl)}`
                    }
                    alt={championship.name}
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
              )}

              <h3 className="text-base font-black uppercase tracking-wider text-foreground">Championship Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase block">Sport</span>
                  <span className="text-sm font-black text-primary">{championship.sport}</span>
                </div>
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase block">Max Teams</span>
                  <span className="text-sm font-black text-foreground">{championship.maxTeams} Teams</span>
                </div>
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase block">Auction Mode</span>
                  <span className="text-sm font-black text-primary">{championship.auctionMode}</span>
                </div>
              </div>

              {/* Categories & Match Formats */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground/70">Configured Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {championship.categories?.map((c) => (
                    <span
                      key={c.categoryId}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground/70">
                  Competition Sub-Match Events ({championship.events?.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {championship.events?.map((e) => (
                    <div
                      key={e.eventId}
                      className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold"
                      style={{ borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <span>{e.eventName}</span>
                      <span className="text-primary font-black">{e.pointsWeight} pt</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage Progression Checklist */}
            <div
              className="rounded-3xl border p-6 space-y-4"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <h3 className="text-base font-black uppercase tracking-wider text-foreground">Stage Roadmap</h3>
              <div className="space-y-3">
                {[
                  { title: "1. Team & Player Registration", done: teams.length > 0 },
                  { title: "2. Player Auction / Squad Draft", done: championship.stage !== "REGISTRATION_OPEN" },
                  { title: "3. Pool Fixtures Generation", done: fixtures.length > 0 },
                  { title: "4. Lineups Submission & Toss", done: fixtures.some((f) => f.tossWinnerTeamId) },
                  { title: "5. Live Match Scoring", done: fixtures.some((f) => f.status === "COMPLETED") },
                  { title: "6. Knockout Progression", done: false },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-bold">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${s.done
                        ? "bg-emerald-500 text-black font-black"
                        : "bg-foreground/10 text-foreground/40 font-bold"
                        }`}
                    >
                      {s.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className={s.done ? "text-foreground" : "text-foreground/50"}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === "teams" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Registered Teams ({teams.length})</h3>
                <p className="text-xs text-foreground/50">Manage franchise entries, approval verification, and payment status</p>
              </div>
            </div>

            {teams.length === 0 ? (
              <div
                className="py-12 px-4 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <Shield className="w-10 h-10 text-foreground/30" />
                <div>
                  <h4 className="text-sm font-black text-foreground">No Teams Registered Yet</h4>
                  <p className="text-xs text-foreground/50 mt-0.5">Share the championship registration link with franchises to receive entries.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {teams.map((t) => {
                  const isApproved = t.status === "APPROVED";
                  const isRejected = t.status === "REJECTED";
                  const isPaid = t.paymentStatus === "PAID";
                  const teamInitials = t.teamName
                    ? t.teamName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                    : "TM";

                  return (
                    <div
                      key={t.teamId}
                      className="group relative rounded-[24px] border transition-all duration-300 hover:shadow-2xl hover:border-primary/40 flex flex-col justify-between overflow-hidden"
                      style={{
                        backgroundColor: "var(--athlon-card)",
                        borderColor: "var(--athlon-border)",
                      }}
                    >
                      {/* Top Status Gradient Bar */}
                      <div
                        className={`h-1.5 w-full bg-gradient-to-r ${isApproved
                          ? "from-emerald-500 via-teal-400 to-primary"
                          : isRejected
                            ? "from-red-500 via-rose-400 to-amber-500"
                            : "from-amber-400 via-orange-400 to-primary"
                          }`}
                      />

                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Header: Franchise Crest & Identity */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Team Avatar Shield */}
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-inner border shrink-0 transition-transform duration-300 group-hover:scale-105 ${isApproved
                                ? "bg-gradient-to-br from-emerald-500/20 to-primary/10 text-emerald-400 border-emerald-500/30"
                                : isRejected
                                  ? "bg-gradient-to-br from-red-500/20 to-rose-500/10 text-red-400 border-red-500/30"
                                  : "bg-gradient-to-br from-amber-500/20 to-primary/10 text-amber-400 border-amber-500/30"
                                }`}
                            >
                              {teamInitials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-base font-black text-foreground tracking-tight truncate">
                                  {t.teamName}
                                </h4>
                                {isApproved && (
                                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-500/20" />
                                )}
                              </div>
                              <span className="text-[11px] font-mono font-bold text-foreground/40 block">
                                Franchise #{t.teamId}
                              </span>
                            </div>
                          </div>

                          {/* Dual Status Capsule Pills */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {/* Approval Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 ${isApproved
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : isRejected
                                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isApproved
                                  ? "bg-emerald-400 animate-pulse"
                                  : isRejected
                                    ? "bg-red-400"
                                    : "bg-amber-400 animate-pulse"
                                  }`}
                              />
                              {t.status || "PENDING"}
                            </span>

                            {/* Payment Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${isPaid
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/25"
                                }`}
                            >
                              {isPaid ? "PAID" : "UNPAID"}
                            </span>
                          </div>
                        </div>

                        {/* Captain & Contact Quick Card */}
                        <div
                          className="p-3 sm:p-3.5 rounded-2xl border space-y-2"
                          style={{
                            backgroundColor: "var(--athlon-surface)",
                            borderColor: "var(--athlon-border-subtle)",
                          }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground/50 font-bold flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-primary" /> Captain
                            </span>
                            <span className="font-extrabold text-foreground tracking-tight">
                              {t.captainName || "Not assigned"}
                            </span>
                          </div>

                          <div
                            className="flex items-center justify-between text-xs border-t pt-2"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <span className="text-foreground/50 font-bold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Phone
                            </span>
                            {t.contactPhone ? (
                              <a
                                href={`tel:${t.contactPhone}`}
                                className="font-mono font-black text-foreground hover:text-primary transition-colors flex items-center gap-1"
                              >
                                <span>{t.contactPhone}</span>
                              </a>
                            ) : (
                              <span className="font-mono text-foreground/40">No contact</span>
                            )}
                          </div>
                        </div>

                        {/* Organizer Action Deck */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40">
                              Organizer Actions
                            </span>
                          </div>

                          {/* Approval & Rejection Segmented Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() =>
                                handleUpdateTeamStatus(t.teamId, isApproved ? "PENDING" : "APPROVED")
                              }
                              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border shadow-sm active:scale-95 ${isApproved
                                ? "bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/25 font-black"
                                : "bg-surface hover:bg-emerald-500/10 text-foreground/80 hover:text-emerald-400 border-foreground/10"
                                }`}
                              title={isApproved ? "Click to set back to Pending" : "Approve Team Franchise"}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{isApproved ? "Approved" : "Approve"}</span>
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateTeamStatus(t.teamId, isRejected ? "PENDING" : "REJECTED")
                              }
                              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border shadow-sm active:scale-95 ${isRejected
                                ? "bg-red-500 text-white border-red-400 shadow-red-500/25 font-black"
                                : "bg-surface hover:bg-red-500/10 text-foreground/80 hover:text-red-400 border-foreground/10"
                                }`}
                              title={isRejected ? "Click to set back to Pending" : "Reject Team Registration"}
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{isRejected ? "Rejected" : "Reject"}</span>
                            </button>
                          </div>

                          {/* Payment Action Button */}
                          <button
                            onClick={() =>
                              handleUpdateTeamPayment(t.teamId, isPaid ? "PENDING" : "PAID")
                            }
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border shadow-sm active:scale-95 ${isPaid
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/30"
                              : "bg-gradient-to-r from-primary via-amber-400 to-primary text-black border-primary shadow-primary/20 hover:brightness-110"
                              }`}
                          >
                            <DollarSign className="w-4 h-4 stroke-[2.5]" />
                            <span>{isPaid ? "Payment Verified (Click to Mark Unpaid)" : "Mark Payment as Paid"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Bottom Footer: Fee & View Squad CTA */}
                      <div
                        className="p-3 sm:p-4 border-t flex items-center justify-between mt-1"
                        style={{
                          backgroundColor: "var(--athlon-surface)",
                          borderColor: "var(--athlon-border-subtle)",
                        }}
                      >
                        <div className="flex items-center gap-1 text-foreground/60 text-xs">
                          <span className="text-[10px] uppercase font-bold text-foreground/40">Fee:</span>
                          <span className="font-mono font-black text-foreground">
                            {championship?.teamRegistrationFee ? `₹${championship.teamRegistrationFee}` : "FREE ENTRY"}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedTeamForAudit(t.teamId);
                            setActiveTab("squads");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/30 text-xs font-black transition-all flex items-center gap-1 shadow-sm active:scale-95"
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
          </div>
        )}

        {/* TAB 3: PLAYERS POOL */}
        {activeTab === "players" && (() => {
          // Extract unique categories
          const categoriesList = Array.from(
            new Set([
              ...(championship?.categories?.map((c) => c.name) || []),
              ...players.map((p) => p.categoryName || "Open"),
            ])
          ).filter(Boolean);

          const filteredPlayers = players.filter(
            (p) =>
              p.fullName.toLowerCase().includes(searchPlayerQuery.toLowerCase()) ||
              (p.phone && p.phone.includes(searchPlayerQuery)) ||
              (p.categoryName && p.categoryName.toLowerCase().includes(searchPlayerQuery.toLowerCase()))
          );

          // Group by category
          const groupedPlayers: Record<string, typeof players> = {};
          categoriesList.forEach((catName) => {
            const catPlayers = filteredPlayers.filter(
              (p) => (p.categoryName || "Open").toLowerCase() === catName.toLowerCase()
            );
            if (catPlayers.length > 0 || selectedCategoryFilter === catName) {
              groupedPlayers[catName] = catPlayers;
            }
          });

          // Unassigned / Others
          const otherPlayers = filteredPlayers.filter(
            (p) => !categoriesList.some((c) => c.toLowerCase() === (p.categoryName || "Open").toLowerCase())
          );
          if (otherPlayers.length > 0) {
            groupedPlayers["Other"] = otherPlayers;
          }

          const displayedCategories = Object.entries(groupedPlayers).filter(
            ([catName]) => selectedCategoryFilter === "ALL" || selectedCategoryFilter === catName
          );

          return (
            <div className="space-y-6">
              {/* Top Controls: Title, Search, and Category Pills */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-foreground">
                      Player Registration Pool ({players.length})
                    </h3>
                    <p className="text-xs text-foreground/50">
                      Athletes registered for championship draft pool grouped by category
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                      <input
                        type="text"
                        placeholder="Search player or phone..."
                        value={searchPlayerQuery}
                        onChange={(e) => setSearchPlayerQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary w-52 sm:w-64 transition-all"
                        style={{ borderColor: "var(--athlon-border)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Filter Pills */}
                {categoriesList.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategoryFilter("ALL")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border ${selectedCategoryFilter === "ALL"
                        ? "bg-primary text-black border-primary shadow-sm shadow-primary/20"
                        : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
                        }`}
                    >
                      <span>All Categories</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/20 text-inherit">
                        {players.length}
                      </span>
                    </button>

                    {categoriesList.map((catName) => {
                      const count = players.filter(
                        (p) => (p.categoryName || "Open").toLowerCase() === catName.toLowerCase()
                      ).length;
                      const isSelected = selectedCategoryFilter === catName;

                      return (
                        <button
                          key={catName}
                          onClick={() => setSelectedCategoryFilter(isSelected ? "ALL" : catName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border ${isSelected
                            ? "bg-primary text-black border-primary shadow-sm shadow-primary/20"
                            : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
                            }`}
                        >
                          <span>{catName}</span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/20 text-inherit">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category-Wise Grouped Player Lists */}
              {displayedCategories.length === 0 ? (
                <div
                  className="py-12 px-4 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  <Users className="w-10 h-10 text-foreground/30" />
                  <div>
                    <h4 className="text-sm font-black text-foreground">No Players Found</h4>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {searchPlayerQuery
                        ? `No registered players match "${searchPlayerQuery}"`
                        : "No athletes registered in this category yet."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {displayedCategories.map(([catName, catPlayers]) => {
                    const categoryConfig = championship?.categories?.find(
                      (c) => c.name?.toLowerCase() === catName.toLowerCase()
                    );

                    return (
                      <div key={catName} className="space-y-4">
                        {/* Category Group Header Banner */}
                        <div
                          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-sm"
                          style={{
                            backgroundColor: "var(--athlon-card)",
                            borderColor: "var(--athlon-border)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shadow-sm">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                                  {catName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-[10px] font-black">
                                  {catPlayers.length} {catPlayers.length === 1 ? "Athlete" : "Athletes"}
                                </span>
                              </div>
                              {categoryConfig?.maxPlayers && (
                                <span className="text-[11px] text-foreground/40 font-bold">
                                  Quota: {catPlayers.length} / {categoryConfig.maxPlayers} Registered
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                            Base: {categoryConfig?.basePrice || catPlayers[0]?.basePrice || 1000} pts
                          </span>
                        </div>

                        {/* Players Grid in this Category */}
                        {catPlayers.length === 0 ? (
                          <div
                            className="p-6 text-center rounded-2xl border text-xs text-foreground/40"
                            style={{
                              backgroundColor: "var(--athlon-surface)",
                              borderColor: "var(--athlon-border-subtle)",
                            }}
                          >
                            No athletes currently registered in {catName}.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {catPlayers.map((p) => {
                              const isApproved = p.status === "APPROVED";
                              const isRejected = p.status === "REJECTED";
                              const isPaid = p.paymentStatus === "PAID";
                              const playerCategory = championship?.categories?.find(
                                (c) => c.name?.toLowerCase() === (p.categoryName || "").toLowerCase() || c.categoryId === p.categoryId
                              );
                              const effectiveBasePrice = playerCategory?.basePrice && playerCategory.basePrice > 0
                                ? playerCategory.basePrice
                                : (p.basePrice && p.basePrice > 0 ? p.basePrice : 1000);
                              const initials = p.fullName
                                ? p.fullName
                                  .split(" ")
                                  .map((w) => w[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                                : "PL";

                              return (
                                <div
                                  key={p.playerId}
                                  className="group relative rounded-[22px] border transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between overflow-hidden"
                                  style={{
                                    backgroundColor: "var(--athlon-card)",
                                    borderColor: "var(--athlon-border)",
                                  }}
                                >
                                  {/* Top Status Gradient Bar */}
                                  <div
                                    className={`h-1 w-full bg-gradient-to-r ${isApproved
                                      ? "from-emerald-500 via-teal-400 to-primary"
                                      : isRejected
                                        ? "from-red-500 via-rose-400 to-amber-500"
                                        : "from-amber-400 via-orange-400 to-primary"
                                      }`}
                                  />

                                  <div className="p-4 space-y-3">
                                    {/* Player Identity Header */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-inner border shrink-0 ${isApproved
                                            ? "bg-gradient-to-br from-emerald-500/20 to-primary/10 text-emerald-400 border-emerald-500/30"
                                            : isRejected
                                              ? "bg-gradient-to-br from-red-500/20 to-rose-500/10 text-red-400 border-red-500/30"
                                              : "bg-gradient-to-br from-amber-500/20 to-primary/10 text-amber-400 border-amber-500/30"
                                            }`}
                                        >
                                          {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs font-black text-foreground truncate">
                                            {p.fullName}
                                          </h4>
                                          <span className="text-[10px] text-foreground/40 font-mono block">
                                            Draft #{p.playerId}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Dual Status Badges */}
                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${isApproved
                                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                            : isRejected
                                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                            }`}
                                        >
                                          {p.status || "PENDING"}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${isPaid
                                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                                            : "bg-amber-500/15 text-amber-300 border-amber-500/25"
                                            }`}
                                        >
                                          {isPaid ? "PAID" : "UNPAID"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Player Details Card */}
                                    <div
                                      className="p-2.5 rounded-xl border space-y-1 text-xs"
                                      style={{
                                        backgroundColor: "var(--athlon-surface)",
                                        borderColor: "var(--athlon-border-subtle)",
                                      }}
                                    >
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-foreground/40 font-bold">Phone:</span>
                                        {p.phone ? (
                                          <a
                                            href={`tel:${p.phone}`}
                                            className="font-mono font-bold text-foreground hover:text-primary transition-colors"
                                          >
                                            {p.phone}
                                          </a>
                                        ) : (
                                          <span className="font-mono text-foreground/40">N/A</span>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between text-[11px] truncate">
                                        <span className="text-foreground/40 font-bold">Eligible:</span>
                                        <span className="font-semibold text-foreground/80 truncate">
                                          {p.eligibleFormats || "All Formats"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Organizer Action Buttons */}
                                    <div className="space-y-1.5 pt-1">
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                          onClick={() =>
                                            handleUpdatePlayerStatus(
                                              p.playerId,
                                              isApproved ? "PENDING" : "APPROVED"
                                            )
                                          }
                                          className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 border shadow-sm active:scale-95 ${isApproved
                                            ? "bg-emerald-500 text-black border-emerald-400 font-black"
                                            : "bg-surface hover:bg-emerald-500/10 text-foreground/80 hover:text-emerald-400 border-foreground/10"
                                            }`}
                                          title="Approve Player"
                                        >
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          <span>{isApproved ? "Approved" : "Approve"}</span>
                                        </button>

                                        <button
                                          onClick={() =>
                                            handleUpdatePlayerStatus(
                                              p.playerId,
                                              isRejected ? "PENDING" : "REJECTED"
                                            )
                                          }
                                          className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 border shadow-sm active:scale-95 ${isRejected
                                            ? "bg-red-500 text-white border-red-400 font-black"
                                            : "bg-surface hover:bg-red-500/10 text-foreground/80 hover:text-red-400 border-foreground/10"
                                            }`}
                                          title="Reject Player"
                                        >
                                          <X className="w-3 h-3 stroke-[3]" />
                                          <span>{isRejected ? "Rejected" : "Reject"}</span>
                                        </button>
                                      </div>

                                      <button
                                        onClick={() =>
                                          handleUpdatePlayerPayment(
                                            p.playerId,
                                            isPaid ? "PENDING" : "PAID"
                                          )
                                        }
                                        className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 border shadow-sm active:scale-95 ${isPaid
                                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-amber-500/15 hover:text-amber-400"
                                          : "bg-gradient-to-r from-primary via-amber-400 to-primary text-black border-primary shadow-primary/20 hover:brightness-110"
                                          }`}
                                      >
                                        <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>
                                          {isPaid ? "Paid (Click to Mark Unpaid)" : "Mark Payment as Paid"}
                                        </span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Card Footer: Base Price */}
                                  <div
                                    className="px-4 py-2.5 border-t flex items-center justify-between mt-1 text-[11px]"
                                    style={{
                                      backgroundColor: "var(--athlon-surface)",
                                      borderColor: "var(--athlon-border-subtle)",
                                    }}
                                  >
                                    <span className="font-bold text-foreground/40 uppercase text-[10px]">
                                      Base Price
                                    </span>
                                    <span className="font-mono font-black text-primary">
                                      {effectiveBasePrice} pts
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3.5: AUCTION PLAYERS (APPROVED & PAID PLAYERS CATEGORY-WISE) */}
        {activeTab === "auction-players" && (() => {
          const eligiblePlayers = players.filter(
            (p) => p.status === "APPROVED" && p.paymentStatus === "PAID"
          );

          // Extract unique categories for approved & paid players
          const categoriesList = Array.from(
            new Set([
              ...(championship?.categories?.map((c) => c.name) || []),
              ...eligiblePlayers.map((p) => p.categoryName || "Open"),
            ])
          ).filter(Boolean);

          const filteredPlayers = eligiblePlayers.filter(
            (p) =>
              p.fullName.toLowerCase().includes(searchAuctionPlayerQuery.toLowerCase()) ||
              (p.phone && p.phone.includes(searchAuctionPlayerQuery)) ||
              (p.categoryName && p.categoryName.toLowerCase().includes(searchAuctionPlayerQuery.toLowerCase()))
          );

          // Group by category
          const groupedPlayers: Record<string, typeof players> = {};
          categoriesList.forEach((catName) => {
            const catPlayers = filteredPlayers.filter(
              (p) => (p.categoryName || "Open").toLowerCase() === catName.toLowerCase()
            );
            if (catPlayers.length > 0 || selectedAuctionCategoryFilter === catName) {
              groupedPlayers[catName] = catPlayers;
            }
          });

          // Unassigned / Others
          const otherPlayers = filteredPlayers.filter(
            (p) => !categoriesList.some((c) => c.toLowerCase() === (p.categoryName || "Open").toLowerCase())
          );
          if (otherPlayers.length > 0) {
            groupedPlayers["Other"] = otherPlayers;
          }

          const displayedCategories = Object.entries(groupedPlayers).filter(
            ([catName]) => selectedAuctionCategoryFilter === "ALL" || selectedAuctionCategoryFilter === catName
          );

          return (
            <div className="space-y-6">
              {/* Header / Search / Filter Pills */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-foreground">
                        Auction Players Pool ({eligiblePlayers.length})
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase">
                        Verified &amp; Paid
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      Approved athletes eligible for the live auction draft, organized category-wise
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                      <input
                        type="text"
                        placeholder="Search auction athlete..."
                        value={searchAuctionPlayerQuery}
                        onChange={(e) => setSearchAuctionPlayerQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary w-52 sm:w-64 transition-all"
                        style={{ borderColor: "var(--athlon-border)" }}
                      />
                    </div>

                    <button
                      onClick={() => setActiveTab("auction")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 shrink-0"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Live Auction Arena</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                {categoriesList.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedAuctionCategoryFilter("ALL")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border ${selectedAuctionCategoryFilter === "ALL"
                        ? "bg-primary text-black border-primary shadow-sm shadow-primary/20"
                        : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
                        }`}
                    >
                      <span>All Categories</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/20 text-inherit">
                        {eligiblePlayers.length}
                      </span>
                    </button>

                    {categoriesList.map((catName) => {
                      const count = eligiblePlayers.filter(
                        (p) => (p.categoryName || "Open").toLowerCase() === catName.toLowerCase()
                      ).length;
                      const isSelected = selectedAuctionCategoryFilter === catName;

                      return (
                        <button
                          key={catName}
                          onClick={() => setSelectedAuctionCategoryFilter(isSelected ? "ALL" : catName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border ${isSelected
                            ? "bg-primary text-black border-primary shadow-sm shadow-primary/20"
                            : "bg-surface text-foreground/70 hover:text-foreground border-foreground/10"
                            }`}
                        >
                          <span>{catName}</span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/20 text-inherit">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category-Wise Grouped Player Lists */}
              {displayedCategories.length === 0 ? (
                <div
                  className="py-16 px-4 text-center rounded-3xl border flex flex-col items-center justify-center space-y-3"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  <Coins className="w-12 h-12 text-foreground/30" />
                  <div>
                    <h4 className="text-sm font-black text-foreground">No Approved &amp; Paid Players in Auction Pool</h4>
                    <p className="text-xs text-foreground/50 mt-1 max-w-sm mx-auto">
                      Go to the <strong>Player Pool</strong> tab and mark players as <strong>Approved</strong> and <strong>Paid</strong> to add them to this Auction Players list.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {displayedCategories.map(([catName, catPlayers]) => {
                    const categoryConfig = championship?.categories?.find(
                      (c) => c.name?.toLowerCase() === catName.toLowerCase()
                    );

                    return (
                      <div key={catName} className="space-y-4">
                        {/* Category Group Header Banner */}
                        <div
                          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-sm"
                          style={{
                            backgroundColor: "var(--athlon-card)",
                            borderColor: "var(--athlon-border)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shadow-sm">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                                  {catName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black">
                                  {catPlayers.length} Auction {catPlayers.length === 1 ? "Athlete" : "Athletes"}
                                </span>
                              </div>
                              {categoryConfig?.maxPlayers && (
                                <span className="text-[11px] text-foreground/40 font-bold">
                                  Category Quota: {catPlayers.length} / {categoryConfig.maxPlayers}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                              Base: {categoryConfig?.basePrice || catPlayers[0]?.basePrice || 1000} pts
                            </span>
                          </div>
                        </div>

                        {/* Players Grid */}
                        {catPlayers.length === 0 ? (
                          <div
                            className="p-6 text-center rounded-2xl border text-xs text-foreground/40"
                            style={{
                              backgroundColor: "var(--athlon-surface)",
                              borderColor: "var(--athlon-border-subtle)",
                            }}
                          >
                            No verified auction athletes in {catName}.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {catPlayers.map((p) => {
                              const playerCategory = championship?.categories?.find(
                                (c) => c.name?.toLowerCase() === (p.categoryName || "").toLowerCase() || c.categoryId === p.categoryId
                              );
                              const effectiveBasePrice = playerCategory?.basePrice && playerCategory.basePrice > 0
                                ? playerCategory.basePrice
                                : (p.basePrice && p.basePrice > 0 ? p.basePrice : 1000);

                              const initials = p.fullName
                                ? p.fullName
                                  .split(" ")
                                  .map((w) => w[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                                : "PL";

                              const matchingAuctionPlayer = auctionPlayers.find(
                                (ap) => ap.playerId === p.playerId
                              );

                              return (
                                <div
                                  key={p.playerId}
                                  className="group relative rounded-[22px] border transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between overflow-hidden"
                                  style={{
                                    backgroundColor: "var(--athlon-card)",
                                    borderColor: "var(--athlon-border)",
                                  }}
                                >
                                  {/* Top Emerald Gradient Bar */}
                                  <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-primary" />

                                  <div className="p-4 space-y-3">
                                    {/* Player Identity */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-inner border shrink-0 bg-gradient-to-br from-emerald-500/20 to-primary/10 text-emerald-400 border-emerald-500/30">
                                          {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs font-black text-foreground truncate">
                                            {p.fullName}
                                          </h4>
                                          <span className="text-[10px] text-foreground/40 font-mono block">
                                            Auction #{p.playerId}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Verified & Paid Badges */}
                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                                          APPROVED
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                                          PAID
                                        </span>
                                      </div>
                                    </div>

                                    {/* Player Details Card */}
                                    <div
                                      className="p-2.5 rounded-xl border space-y-1 text-xs"
                                      style={{
                                        backgroundColor: "var(--athlon-surface)",
                                        borderColor: "var(--athlon-border-subtle)",
                                      }}
                                    >
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-foreground/40 font-bold">Phone:</span>
                                        {p.phone ? (
                                          <a
                                            href={`tel:${p.phone}`}
                                            className="font-mono font-bold text-foreground hover:text-primary transition-colors"
                                          >
                                            {p.phone}
                                          </a>
                                        ) : (
                                          <span className="font-mono text-foreground/40">N/A</span>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between text-[11px] truncate">
                                        <span className="text-foreground/40 font-bold">Eligible:</span>
                                        <span className="font-semibold text-foreground/80 truncate">
                                          {p.eligibleFormats || "All Formats"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action to Call to Floor or Auction Status */}
                                    <div className="pt-1">
                                      <button
                                        onClick={() => {
                                          if (matchingAuctionPlayer?.auctionPlayerId) {
                                            handleCallPlayer(matchingAuctionPlayer.auctionPlayerId);
                                          }
                                          setActiveTab("auction");
                                        }}
                                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-primary via-amber-400 to-primary text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                      >
                                        <Gavel className="w-3.5 h-3.5" />
                                        <span>Call to Floor</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Card Footer: Base Price */}
                                  <div
                                    className="px-4 py-2.5 border-t flex items-center justify-between mt-1 text-[11px]"
                                    style={{
                                      backgroundColor: "var(--athlon-surface)",
                                      borderColor: "var(--athlon-border-subtle)",
                                    }}
                                  >
                                    <span className="font-bold text-foreground/40 uppercase text-[10px]">
                                      Base Price
                                    </span>
                                    <span className="font-mono font-black text-primary">
                                      {effectiveBasePrice} pts
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 4: REDESIGNED LIVE AUCTION ARENA */}
        {activeTab === "auction" && (() => {
          const categories = championship?.categories || [];
          const activeCategory = categories.find((c) => c.categoryId === selectedAuctionPhaseCatId) || categories[0];
          const activeCatId = activeCategory?.categoryId;

          const categoryPlayers = auctionPlayers.filter((p) => {
            if (!activeCategory) return true;
            if (p.categoryId && activeCatId && p.categoryId === activeCatId) return true;
            if (p.categoryName && activeCategory.name && p.categoryName.toLowerCase().trim() === activeCategory.name.toLowerCase().trim()) return true;
            return false;
          });

          const waitingCategoryPlayers = categoryPlayers.filter((p) => p.state === "WAITING" || p.state === "UNSOLD");
          const activePlayer = auctionState?.activePlayer;

          const activePlayerCat = categories.find(
            (c) => c.name?.toLowerCase() === (activePlayer?.categoryName || "").toLowerCase() || c.categoryId === activePlayer?.categoryId
          );
          const activePlayerBasePrice = activePlayerCat?.basePrice && activePlayerCat.basePrice > 0
            ? activePlayerCat.basePrice
            : (activePlayer?.basePrice && activePlayer.basePrice > 0 ? activePlayer.basePrice : 1000);

          return (
            <div
              className={
                isAuctionFullscreen
                  ? "fixed inset-0 z-[9999] bg-background w-screen h-screen overflow-hidden flex flex-col justify-between select-none"
                  : "space-y-6"
              }
            >
              {/* 1. Live Broadcast Stage Switcher & Projector Header */}
              <div
                className={`border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 transition-all ${isAuctionFullscreen
                  ? "rounded-none px-6 py-3.5 bg-surface/90 backdrop-blur-xl border-foreground/10"
                  : "p-4 sm:p-5 rounded-3xl border shadow-xl"
                  } ${isAuctionLive
                    ? "bg-gradient-to-r from-red-500/15 via-primary/10 to-transparent border-red-500/30"
                    : isAuctionPaused
                      ? "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/30"
                      : "bg-surface/60 border-foreground/10"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner border shrink-0 ${isAuctionLive
                      ? "bg-red-500 text-white border-red-400 animate-pulse"
                      : isAuctionPaused
                        ? "bg-amber-500 text-black border-amber-400"
                        : "bg-primary/15 text-primary border-primary/30"
                      }`}
                  >
                    {isAuctionLive ? <Radio className="w-5 h-5" /> : isAuctionPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-foreground tracking-tight">
                        {isAuctionLive
                          ? "LIVE AUCTION ARENA (BROADCASTING)"
                          : isAuctionPaused
                            ? "LIVE AUCTION PAUSED (OFF-AIR)"
                            : "Live Auction Arena (Standby)"}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${isAuctionLive
                          ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                          : isAuctionPaused
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            : "bg-surface text-foreground/50 border-foreground/20"
                          }`}
                      >
                        {isAuctionLive
                          ? "PUBLIC ON-AIR"
                          : isAuctionPaused
                            ? "PAUSED • SPECTATORS BLOCKED"
                            : "OFFLINE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {isAuctionLive ? (
                    <>
                      <button
                        onClick={() => handleToggleAuctionStage("AUCTION_PAUSED")}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        title="Pause auction so spectators cannot view"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Auction</span>
                      </button>

                      <button
                        onClick={() => handleToggleAuctionStage("LEAGUE_STAGE")}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-black text-xs transition-all flex items-center gap-1.5"
                        title="Conclude auction and proceed to fixtures"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Conclude Auction</span>
                      </button>
                    </>
                  ) : isAuctionPaused ? (
                    <>
                      <button
                        onClick={() => handleToggleAuctionStage("AUCTION_STAGE")}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-500/25 flex items-center gap-2 animate-pulse"
                        title="Resume live auction broadcasting"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Resume Live Auction</span>
                      </button>

                      <button
                        onClick={() => handleToggleAuctionStage("LEAGUE_STAGE")}
                        className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-foreground/80 border border-foreground/15 font-black text-xs transition-all flex items-center gap-1.5"
                        title="Conclude auction"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Conclude</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleAuctionStage("AUCTION_STAGE")}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-500/25 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Live Auction</span>
                    </button>
                  )}

                  {/* Franchise Purses On-Demand Trigger */}
                  <button
                    onClick={() => setIsPurseModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                    title="View Franchise Purses & Balances"
                  >
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span>Franchise Purses ({auctionTeams.length})</span>
                  </button>

                  {/* Category Phase Button (Replaces Spectator View) */}
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                    title="Choose or Spin Category Phase"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Category: {activeCategory?.name || "All Categories"}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {/* Theme Selector Trigger - ONLY Icon in Maximize Screen */}
                  {isAuctionFullscreen && (
                    <button
                      type="button"
                      onClick={() => setIsThemeModalOpen(true)}
                      className="w-10 h-10 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/25 hover:border-primary text-primary transition-all flex items-center justify-center shadow-sm cursor-pointer active:scale-95 group"
                      title={`Select Arena Theme (Current: ${currentTheme?.name || "Default"})`}
                    >
                      <Palette className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    </button>
                  )}

                  {/* Maximize to Fullscreen for Projectors / Big Screens */}
                  <button
                    onClick={toggleAuctionFullscreen}
                    className={`px-4 py-2.5 rounded-xl border font-black text-xs transition-all flex items-center gap-2 shadow-sm ${isAuctionFullscreen
                      ? "bg-amber-500 text-black border-amber-400 hover:bg-amber-400"
                      : "bg-surface hover:bg-white/10 text-foreground border-foreground/15"
                      }`}
                    title={isAuctionFullscreen ? "Exit Fullscreen" : "Maximize to Fullscreen for Projector Screen"}
                  >
                    {isAuctionFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-primary" />
                        <span>Maximize Screen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. MAIN SINGLE-PAGE ARENA COCKPIT (Floor Spotlight + Category Queue Tray) */}
              <div className={`grid grid-cols-1 lg:grid-cols-12 ${isAuctionFullscreen ? "flex-1 min-h-0 gap-0 divide-x divide-foreground/10 bg-surface/10" : "gap-5 items-stretch"}`}>
                {/* LEFT 9 COLS: MAXIMUM SIZE PLAYER CALL FLOOR SPOTLIGHT & MANUAL BIDDING PAD */}
                <div className={`flex flex-col min-h-0 ${isAuctionFullscreen ? "lg:col-span-9 h-full p-5 sm:p-7 overflow-y-auto hide-scrollbar" : "lg:col-span-9"}`}>
                  <div
                    className={`flex flex-col justify-between transition-all duration-300 ${isAuctionFullscreen
                      ? "h-full p-0 border-0 shadow-none bg-transparent"
                      : "h-[620px] max-h-[calc(100vh-180px)] rounded-3xl border shadow-2xl p-4 sm:p-5 overflow-y-auto hide-scrollbar"
                      }`}
                    style={{
                      backgroundColor: isAuctionFullscreen ? "transparent" : "var(--athlon-card)",
                      borderColor: activePlayer ? "var(--athlon-primary, #6366f1)" : "var(--athlon-border)",
                    }}
                  >
                    {/* Glowing Stadium Backdrop Aura for Live Floor */}
                    {activePlayer && (
                      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
                    )}

                    {/* 1. Floor Glass Header */}
                    <div className="flex items-center justify-between border-b pb-3 shrink-0 relative z-10" style={{ borderColor: "var(--athlon-border)" }}>
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-primary fill-primary/30" /> Player Call Floor
                        </span>
                        {activePlayer && (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 font-mono font-black text-[10px] uppercase animate-pulse">
                            Live On-Air
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Category Switch Quick Pill */}
                        <button
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 border border-foreground/15 text-foreground font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{activeCategory?.name || "Category"}</span>
                          <ChevronDown className="w-3 h-3 text-foreground/40" />
                        </button>

                        {/* Franchise Purses Quick Click */}
                        <button
                          onClick={() => setIsPurseModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 border border-foreground/15 text-foreground font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          <span>Purses ({auctionTeams.length})</span>
                        </button>
                      </div>
                    </div>

                    {activePlayer ? (
                      <div className="w-full flex-1 flex flex-col justify-between py-1 relative z-10">
                        {auctionBiddingMode === "AUTOMATIC" ? (
                          /* ======================================================== */
                          /* GRAND AUTOMATIC LIVE STAGE SHOWCASE (MAX SCALE & IMPACT) */
                          /* ======================================================== */
                          <div className="w-full flex-1 flex flex-col justify-between space-y-4 animate-fadeIn">
                            {/* Grand Center Stage Container */}
                            <div
                              className="w-full rounded-3xl bg-gradient-to-br from-surface/90 via-surface/70 to-surface/40 backdrop-blur-xl border shadow-2xl p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shrink-0"
                              style={{ borderColor: "var(--athlon-border)" }}
                            >
                              {/* Ambient Spotlight Flare */}
                              <div className="absolute top-1/2 left-20 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-0" />
                              <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

                              {/* Left: Extra Large Athlete Photo & Details */}
                              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 min-w-0 relative z-10 flex-1">
                                {/* Massive Ultra-Large Athlete Photo Frame */}
                                <div className="relative shrink-0 group">
                                  <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-tr from-primary/40 via-indigo-500/30 to-amber-400/30 border-4 border-primary/80 p-1.5 flex items-center justify-center shadow-2xl shadow-primary/30 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                    {activePlayer.avatarUrl ? (
                                      <img
                                        src={activePlayer.avatarUrl}
                                        alt={activePlayer.playerName}
                                        className="w-full h-full object-cover rounded-[20px]"
                                      />
                                    ) : (
                                      <span className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-wider drop-shadow-lg">
                                        {activePlayer.playerName.substring(0, 2).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <span className="absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-xl bg-black/95 border-2 border-primary text-xs font-mono font-black text-primary shadow-xl">
                                    #{activePlayer.auctionPlayerId}
                                  </span>
                                </div>

                                {/* Athlete Identity & Category Information */}
                                <div className="text-center sm:text-left space-y-2 min-w-0">
                                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                    <span className="px-3.5 py-1 rounded-xl bg-primary/20 text-primary border border-primary/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                                      <span>{activePlayer.categoryName || activeCategory?.name || "Category Phase"}</span>
                                    </span>
                                  </div>

                                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight truncate drop-shadow-md leading-tight">
                                    {activePlayer.playerName}
                                  </h2>

                                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5">
                                    <span className="text-xs px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold flex items-center gap-1.5 shadow-sm">
                                      <span className="text-primary/60 text-[10px] uppercase font-black">Base Price:</span>
                                      <strong className="font-mono font-black text-sm">{activePlayerBasePrice} pts</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Grand High Bid & Live Timer Pod */}
                              <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3.5 shrink-0 relative z-10 w-full sm:w-auto md:w-60">
                                {/* Leading Bidder Spotlight Box */}
                                <div
                                  className={`w-full text-center px-4 py-3 rounded-2xl border shadow-xl flex flex-col justify-between transition-all ${auctionState?.winningTeamName
                                    ? "bg-gradient-to-br from-amber-500/15 via-primary/10 to-background/90 border-amber-400/70 shadow-amber-500/15 ring-1 ring-amber-400/30"
                                    : "bg-background/90 border-foreground/10"
                                    }`}
                                  style={{ borderColor: auctionState?.winningTeamName ? undefined : "var(--athlon-border)" }}
                                >
                                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Crown className={`w-3.5 h-3.5 ${auctionState?.winningTeamName ? "text-amber-400 fill-amber-400 animate-bounce" : "text-foreground/40"}`} />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/60">
                                      {auctionState?.winningTeamName ? "Current High Bid" : "Opening Floor"}
                                    </span>
                                  </div>

                                  <div className="my-0.5">
                                    <span className="text-3xl sm:text-4xl font-black text-primary font-mono block leading-tight drop-shadow-sm">
                                      {auctionState?.currentBid || activePlayerBasePrice} <span className="text-xs font-bold text-foreground/50 font-sans">pts</span>
                                    </span>
                                  </div>

                                  <div className="mt-0.5 pt-1 border-t border-foreground/10 flex items-center justify-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="text-xs font-black text-foreground truncate max-w-[170px]">
                                      {auctionState?.winningTeamName || "Waiting for Bids"}
                                    </span>
                                  </div>
                                </div>

                                {/* Live Timer Box */}
                                <button
                                  type="button"
                                  onClick={handleTogglePauseTimer}
                                  className={`w-full text-center px-4 py-3 rounded-2xl border shadow-xl transition-all cursor-pointer select-none group flex flex-col justify-between ${isTimerPaused
                                    ? "bg-amber-500/15 border-amber-400/80 hover:border-emerald-400 hover:bg-emerald-500/15 shadow-amber-500/10"
                                    : "bg-background/90 hover:bg-surface border-foreground/10 hover:border-amber-400/80"
                                    }`}
                                  style={{ borderColor: isTimerPaused ? "#f59e0b" : "var(--athlon-border)" }}
                                  title={isTimerPaused ? "Click to Start / Resume Timer" : "Click to Pause Timer"}
                                >
                                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    {isTimerPaused ? (
                                      <>
                                        <Play className="w-3 h-3 text-emerald-400 fill-current animate-pulse shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                                          {displayRemainingSeconds === (auctionState?.config?.timerSeconds || timerDurationSeconds || 60)
                                            ? "STANDBY"
                                            : "PAUSED"}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Pause className="w-3 h-3 text-amber-400/70 group-hover:text-amber-400 transition-colors shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 group-hover:text-amber-400 transition-colors">
                                          Live Timer
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  <span
                                    className={`text-2xl sm:text-3xl font-black font-mono block leading-none my-0.5 ${isTimerPaused ? "text-amber-300" : "text-amber-400 animate-pulse"
                                      }`}
                                  >
                                    {displayRemainingSeconds}s
                                  </span>

                                  <span className="text-[10px] font-black uppercase mt-0.5 block transition-colors text-foreground/40 group-hover:text-emerald-400">
                                    {isTimerPaused ? "Start Timer" : "Pause"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Bottom Action Gavel & Controls Bar */}
                            <div className="flex items-center gap-2.5 pt-0.5 shrink-0">
                              <button
                                onClick={handleAssignPlayerManual}
                                disabled={assigningLoading || !auctionState?.winningTeamId}
                                className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-black text-xs sm:text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
                              >
                                <Gavel className="w-4 h-4" />
                                <span>
                                  {assigningLoading
                                    ? "Processing..."
                                    : auctionState?.winningTeamName
                                      ? `SEAL & MAP TO ${auctionState.winningTeamName.toUpperCase()} (${auctionState.currentBid || activePlayerBasePrice} PTS)`
                                      : "WAITING FOR FIRST FRANCHISE BID"}
                                </span>
                              </button>

                              <button
                                onClick={handleMarkUnsold}
                                className="px-5 py-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black text-xs sm:text-sm transition-all"
                              >
                                UNSOLD
                              </button>

                              {/* Switch Back to Manual Mode Pill */}
                              <button
                                onClick={() => handleUpdateAuctionSettings("MANUAL")}
                                className="px-3.5 py-3.5 rounded-2xl border border-foreground/15 bg-surface hover:bg-white/10 text-foreground/70 hover:text-foreground font-black text-xs transition-all flex items-center gap-1.5"
                                title="Switch to Manual Gavel mode"
                              >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Manual Mode</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ======================================================== */
                          /* MODE 1: MANUAL BIDDING DESK (Direct Points & Map to Team) */
                          /* ======================================================== */
                          (() => {
                            const isTimerExpired = displayRemainingSeconds <= 0;
                            const isReadyToLock = isTimerExpired || isManualLocked;

                            return (
                              <div className="w-full flex-1 flex flex-col justify-between space-y-4 animate-fadeIn">
                                {/* Grand Center Stage Container (Same high impact scale as automatic) */}
                                <div
                                  className="w-full rounded-3xl bg-gradient-to-br from-surface/90 via-surface/70 to-surface/40 backdrop-blur-xl border shadow-2xl p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shrink-0"
                                  style={{ borderColor: "var(--athlon-border)" }}
                                >
                                  {/* Ambient Spotlight Flare */}
                                  <div className="absolute top-1/2 left-20 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-0" />
                                  <div className="absolute bottom-0 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

                                  {/* Left: Extra Large Athlete Photo & Details */}
                                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 min-w-0 relative z-10 flex-1">
                                    {/* Massive Ultra-Large Athlete Photo Frame */}
                                    <div className="relative shrink-0 group">
                                      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-tr from-primary/40 via-indigo-500/30 to-amber-400/30 border-4 border-primary/80 p-1.5 flex items-center justify-center shadow-2xl shadow-primary/30 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                        {activePlayer.avatarUrl ? (
                                          <img
                                            src={activePlayer.avatarUrl}
                                            alt={activePlayer.playerName}
                                            className="w-full h-full object-cover rounded-[20px]"
                                          />
                                        ) : (
                                          <span className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-wider drop-shadow-lg">
                                            {activePlayer.playerName.substring(0, 2).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <span className="absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-xl bg-black/95 border-2 border-primary text-xs font-mono font-black text-primary shadow-xl">
                                        #{activePlayer.auctionPlayerId}
                                      </span>
                                    </div>

                                    {/* Athlete Identity & Category Information */}
                                    <div className="text-center sm:text-left space-y-2 min-w-0">
                                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                        <span className="px-3.5 py-1 rounded-xl bg-primary/20 text-primary border border-primary/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                                          <span>{activePlayer.categoryName || activeCategory?.name || "Category Phase"}</span>
                                        </span>
                                      </div>

                                      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight truncate drop-shadow-md leading-tight">
                                        {activePlayer.playerName}
                                      </h2>

                                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5">
                                        <span className="text-xs px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold flex items-center gap-1.5 shadow-sm">
                                          <span className="text-primary/60 text-[10px] uppercase font-black">Base Price:</span>
                                          <strong className="font-mono font-black text-sm">{activePlayerBasePrice} pts</strong>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Timer Pod + Restart Timer Button */}
                                  <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto md:w-60">
                                    {/* Interactive Countdown Timer */}
                                    <button
                                      type="button"
                                      onClick={handleTogglePauseTimer}
                                      className={`w-full text-center px-4 py-3 rounded-2xl border shadow-xl transition-all cursor-pointer select-none group flex flex-col justify-between ${isTimerPaused
                                        ? "bg-amber-500/15 border-amber-400/80 hover:border-emerald-400 hover:bg-emerald-500/15 shadow-amber-500/10"
                                        : isTimerExpired
                                          ? "bg-red-500/15 border-red-400/80 shadow-red-500/10"
                                          : "bg-background/90 hover:bg-surface border-foreground/10 hover:border-amber-400/80"
                                        }`}
                                      style={{ borderColor: isTimerPaused ? "#f59e0b" : isTimerExpired ? "#ef4444" : "var(--athlon-border)" }}
                                      title={isTimerPaused ? "Click to Start / Resume Timer" : "Click to Pause Timer"}
                                    >
                                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                        {isTimerPaused ? (
                                          <>
                                            <Play className="w-3 h-3 text-emerald-400 fill-current animate-pulse shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                                              {displayRemainingSeconds === (auctionState?.config?.timerSeconds || timerDurationSeconds || 60)
                                                ? "STANDBY"
                                                : "PAUSED"}
                                            </span>
                                          </>
                                        ) : isTimerExpired ? (
                                          <>
                                            <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 animate-pulse">
                                              TIMER FINISHED
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <Pause className="w-3 h-3 text-amber-400/70 group-hover:text-amber-400 transition-colors shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 group-hover:text-amber-400 transition-colors">
                                              Floor Countdown
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      <span
                                        className={`text-2xl sm:text-3xl font-black font-mono block leading-none my-0.5 ${isTimerExpired ? "text-red-400" : isTimerPaused ? "text-amber-300" : "text-amber-400 animate-pulse"
                                          }`}
                                      >
                                        {displayRemainingSeconds}s
                                      </span>

                                      <span className="text-[10px] font-black uppercase mt-0.5 block transition-colors text-foreground/40 group-hover:text-emerald-400">
                                        {isTimerExpired ? "Locked" : isTimerPaused ? "Start Timer" : "Pause"}
                                      </span>
                                    </button>

                                    {/* Dedicated Restart Timer Button */}
                                    <button
                                      type="button"
                                      onClick={handleResetTimer}
                                      className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-white/10 border border-foreground/15 text-foreground font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:border-amber-400/60"
                                      title="Reset timer countdown back to initial full seconds"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Restart Timer</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Lock Controls or Timer In-Progress Bar */}
                                {isReadyToLock ? (
                                  /* ======================================================== */
                                  /* ULTRA-STYLED FINAL GAVEL LOCK & TEAM ASSIGNMENT DESK    */
                                  /* ======================================================== */
                                  (() => {
                                    const selectedManualTeam = auctionTeams.find((at) => at.team.teamId === manualWinningTeamId);
                                    const isExceedingPurse = Boolean(
                                      selectedManualTeam && (manualWinningBid || 0) > selectedManualTeam.team.remainingBudget
                                    );

                                    return (
                                      <div
                                        className="p-5 sm:p-6 rounded-3xl border shadow-2xl bg-gradient-to-br from-surface/95 via-surface/85 to-background/90 backdrop-blur-2xl space-y-4 animate-fadeIn relative overflow-hidden ring-1 ring-primary/20 shrink-0"
                                        style={{ borderColor: "var(--athlon-border)" }}
                                      >
                                        {/* Subtle Glow Flare */}
                                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
                                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

                                        {/* 1. Header Bar */}
                                        <div className="flex items-center justify-between border-b pb-3 relative z-10" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                                              <Gavel className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                                                Final Gavel Lock & Team Assignment
                                              </h4>
                                              <p className="text-[10px] text-foreground/50 font-medium">
                                                Review final floor bid and confirm the winning franchise
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-[11px] uppercase shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                            <span>Bidding Finalized</span>
                                          </div>
                                        </div>

                                        {/* 2. Dual Interactive Glass Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                          {/* Card A: Final Locked Points */}
                                          <div
                                            className="p-4 rounded-2xl bg-background/80 border shadow-inner flex flex-col justify-between space-y-3 transition-all hover:border-primary/40 group"
                                            style={{ borderColor: "var(--athlon-border)" }}
                                          >
                                            <div className="flex items-center justify-between">
                                              <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
                                                <Coins className="w-3.5 h-3.5 text-primary" /> Final Locked Points
                                              </label>
                                              <span className="text-[10px] font-mono text-foreground/40 font-bold">
                                                Base: {activePlayerBasePrice} pts
                                              </span>
                                            </div>

                                            {/* Input Box */}
                                            <div className="relative">
                                              <input
                                                type="number"
                                                value={manualWinningBid || ""}
                                                onChange={(e) => setManualWinningBid(Number(e.target.value))}
                                                placeholder="0"
                                                className="w-full pl-4 pr-14 py-3 rounded-xl border bg-surface text-foreground font-mono font-black text-2xl sm:text-3xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                style={{ borderColor: "var(--athlon-border)" }}
                                              />
                                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase font-mono text-primary/70 pointer-events-none px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                                                PTS
                                              </span>
                                            </div>

                                            {/* Quick Point Increment Helpers */}
                                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                              <span className="text-[10px] text-foreground/40 font-bold uppercase mr-1">Quick:</span>
                                              {[50, 100, 250, 500, 1000].map((inc) => (
                                                <button
                                                  key={inc}
                                                  type="button"
                                                  onClick={() => setManualWinningBid((prev) => (Number(prev) || 0) + inc)}
                                                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-white/10 border border-foreground/10 text-foreground font-mono font-bold text-[10px] transition-all hover:border-primary/40 hover:text-primary active:scale-95"
                                                >
                                                  +{inc}
                                                </button>
                                              ))}
                                              <button
                                                type="button"
                                                onClick={() => setManualWinningBid(activePlayerBasePrice)}
                                                className="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-mono font-black text-[10px] transition-all ml-auto active:scale-95"
                                                title="Reset to Base Price"
                                              >
                                                Reset Base
                                              </button>
                                            </div>
                                          </div>

                                          {/* Card B: Map to Franchise Team */}
                                          <div
                                            className="p-4 rounded-2xl bg-background/80 border shadow-inner flex flex-col justify-between space-y-3 transition-all hover:border-primary/40 group"
                                            style={{ borderColor: "var(--athlon-border)" }}
                                          >
                                            <div className="flex items-center justify-between">
                                              <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5 text-primary" /> Map to Franchise Team
                                              </label>
                                              {selectedManualTeam && (
                                                <span
                                                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${isExceedingPurse
                                                    ? "bg-red-500/15 border-red-500/30 text-red-400"
                                                    : "bg-primary/15 border-primary/30 text-primary"
                                                    }`}
                                                >
                                                  Purse: {selectedManualTeam.team.remainingBudget} pts
                                                </span>
                                              )}
                                            </div>

                                            {/* Team Selector Dropdown */}
                                            <div className="relative">
                                              <select
                                                value={manualWinningTeamId || ""}
                                                onChange={(e) => setManualWinningTeamId(Number(e.target.value))}
                                                className="w-full px-4 py-3.5 rounded-xl border bg-surface text-foreground font-black text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none shadow-inner"
                                                style={{ borderColor: "var(--athlon-border)" }}
                                              >
                                                <option value="">-- Choose Winning Franchise Team --</option>
                                                {auctionTeams.map((at) => (
                                                  <option key={at.team.teamId} value={at.team.teamId}>
                                                    {at.team.teamName} • Purse: {at.team.remainingBudget} pts
                                                  </option>
                                                ))}
                                              </select>
                                              <ChevronDown className="w-4 h-4 text-foreground/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>

                                            {/* Selected Team Live Summary Strip */}
                                            <div className="flex items-center justify-between pt-0.5 text-xs">
                                              {selectedManualTeam ? (
                                                isExceedingPurse ? (
                                                  <span className="text-red-400 font-bold text-[11px] flex items-center gap-1">
                                                    ⚠️ Bid exceeds remaining purse ({selectedManualTeam.team.remainingBudget} pts)
                                                  </span>
                                                ) : (
                                                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                                    ✓ Purse remaining after seal: {selectedManualTeam.team.remainingBudget - (manualWinningBid || 0)} pts
                                                  </span>
                                                )
                                              ) : (
                                                <span className="text-foreground/40 text-[11px] font-medium">
                                                  Select which franchise won the bidding round
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* 3. Action Button HUD */}
                                        <div className="flex items-center gap-3 pt-2 relative z-10">
                                          <button
                                            onClick={handleAssignPlayerManual}
                                            disabled={
                                              assigningLoading ||
                                              !manualWinningTeamId ||
                                              !manualWinningBid ||
                                              isExceedingPurse
                                            }
                                            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-black text-sm sm:text-base hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                                          >
                                            <Gavel className="w-5 h-5" />
                                            <span>
                                              {assigningLoading
                                                ? "Processing Gavel Seal..."
                                                : isExceedingPurse
                                                  ? "EXCEEDS REMAINING PURSE"
                                                  : selectedManualTeam
                                                    ? `SEAL & MAP TO ${selectedManualTeam.team.teamName.toUpperCase()} (${manualWinningBid || 0} PTS)`
                                                    : "SELECT A FRANCHISE TEAM TO SEAL"}
                                            </span>
                                          </button>

                                          <button
                                            onClick={handleMarkUnsold}
                                            className="px-6 py-4 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black text-xs sm:text-sm transition-all shrink-0"
                                          >
                                            UNSOLD
                                          </button>

                                          <button
                                            onClick={handleResetTimer}
                                            className="px-5 py-4 rounded-2xl border border-foreground/15 bg-surface hover:bg-white/10 text-foreground font-black text-xs transition-all flex items-center gap-2 shrink-0 hover:border-amber-400/50"
                                            title="Restart countdown timer and resume live floor bids"
                                          >
                                            <RotateCcw className="w-4 h-4 text-amber-400" />
                                            <span>Resume Bid</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  /* LIVE FLOOR RUNNING: Clean bar with Lock Now button */
                                  <div className="flex items-center gap-2.5 pt-0.5 shrink-0">
                                    <button
                                      onClick={() => setIsManualLocked(true)}
                                      className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-black text-xs sm:text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
                                    >
                                      <Lock className="w-4 h-4" />
                                      <span>Lock Bidding & Enter Final Points</span>
                                    </button>

                                    <button
                                      onClick={handleMarkUnsold}
                                      className="px-5 py-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black text-xs sm:text-sm transition-all"
                                    >
                                      UNSOLD
                                    </button>

                                    <button
                                      onClick={() => handleUpdateAuctionSettings("AUTOMATIC")}
                                      className="px-3.5 py-3.5 rounded-2xl border border-foreground/15 bg-surface hover:bg-white/10 text-foreground/70 hover:text-foreground font-black text-xs transition-all flex items-center gap-1.5"
                                      title="Switch to Automatic Live Bidding mode"
                                    >
                                      <Zap className="w-4 h-4 text-amber-400" />
                                      <span className="hidden sm:inline">Automatic Mode</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    ) : (
                      /* Standby Floor Display */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed text-center space-y-4 my-auto" style={{ borderColor: "var(--athlon-border)" }}>
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-inner">
                          <Gavel className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-foreground uppercase tracking-tight">
                            No Athlete on the Floor
                          </h4>
                          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                            Phase: <strong>{activeCategory?.name || "All Categories"}</strong> ({waitingCategoryPlayers.length} athletes waiting).
                          </p>
                        </div>

                        <div className="pt-2">
                          {isAuctionLive ? (
                            <button
                              onClick={runPlayerSnipper}
                              disabled={isSpinningPlayer || waitingCategoryPlayers.length === 0}
                              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-indigo-500 to-primary text-black font-black text-sm hover:scale-102 active:scale-98 transition-all shadow-xl shadow-primary/30 flex items-center gap-2.5 mx-auto disabled:opacity-50"
                            >
                              <RotateCcw className={`w-4 h-4 ${isSpinningPlayer ? "animate-spin" : ""}`} />
                              <span>{isSpinningPlayer ? "Spinning Athlete..." : "🎲 Spin & Call Next Athlete"}</span>
                            </button>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs max-w-xs mx-auto">
                              ⚠️ Click <strong>&quot;Start Live Auction&quot;</strong> above to begin spinning athletes!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT 3 COLS: LIVE BIDDING PODCAST & CATEGORY PLAYERS TRAY */}
                <div className={`flex flex-col min-h-0 ${isAuctionFullscreen ? "lg:col-span-3 h-full p-4 sm:p-5 bg-surface/30 backdrop-blur-md" : "lg:col-span-3"}`}>
                  <div
                    className={`flex flex-col justify-between ${isAuctionFullscreen
                      ? "h-full min-h-0 p-0 border-0 shadow-none bg-transparent overflow-hidden"
                      : "h-[620px] max-h-[calc(100vh-180px)] rounded-3xl border shadow-md p-4 overflow-y-auto hide-scrollbar"
                      }`}
                    style={{ backgroundColor: isAuctionFullscreen ? "transparent" : "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    {/* Header: Mode Switcher (for Automatic Bidding) OR Direct Category Header (for Manual Bidding) */}
                    {auctionBiddingMode === "AUTOMATIC" ? (
                      <div className="border-b pb-2.5 shrink-0 space-y-2" style={{ borderColor: "var(--athlon-border)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-background border flex-1" style={{ borderColor: "var(--athlon-border)" }}>
                            <button
                              type="button"
                              onClick={() => setRightTrayTab("BIDS")}
                              className={`flex-1 py-1 px-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${rightTrayTab === "BIDS"
                                ? "bg-primary text-black shadow-sm"
                                : "text-foreground/60 hover:text-foreground hover:bg-surface"
                                }`}
                            >
                              <Radio className={`w-3 h-3 ${rightTrayTab === "BIDS" && activePlayer ? "animate-pulse text-red-600" : ""}`} />
                              <span>Podcast ({auctionState?.recentBids?.length || 0})</span>
                              {activePlayer && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setRightTrayTab("QUEUE")}
                              className={`flex-1 py-1 px-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${rightTrayTab === "QUEUE"
                                ? "bg-primary text-black shadow-sm"
                                : "text-foreground/60 hover:text-foreground hover:bg-surface"
                                }`}
                            >
                              <Users className="w-3 h-3" />
                              <span>Queue ({categoryPlayers.length})</span>
                            </button>
                          </div>

                          {/* Spin Player Shortcut Button */}
                          <button
                            onClick={() => {
                              if (!isAuctionLive) {
                                alert("Please click 'Start Live Auction' above before spinning players!");
                                return;
                              }
                              runPlayerSnipper();
                            }}
                            disabled={!isAuctionLive || isSpinningPlayer || waitingCategoryPlayers.length === 0}
                            className={`px-2.5 py-1.5 rounded-xl font-black text-[10px] shadow-sm transition-all flex items-center gap-1 shrink-0 ${isAuctionLive && waitingCategoryPlayers.length > 0
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                              : "bg-surface text-foreground/40 border border-foreground/15 cursor-not-allowed opacity-50"
                              }`}
                            title={isAuctionLive ? "Spin next waiting player" : "Start Live Auction first to enable"}
                          >
                            <Shuffle className="w-3 h-3" />
                            <span>Spin</span>
                          </button>
                        </div>

                        {rightTrayTab === "QUEUE" && (
                          <div className="flex items-center justify-between text-[10px] text-foreground/50 px-0.5">
                            <span>{activeCategory?.name || "Category"}: <strong>{categoryPlayers.length} athletes</strong></span>
                            <span>Base: <strong className="text-primary font-mono">{activeCategory?.basePrice || 1000} pts</strong></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-b pb-2.5 shrink-0" style={{ borderColor: "var(--athlon-border)" }}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                            <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate">
                              {activeCategory?.name || "Category"} ({categoryPlayers.length})
                            </h4>
                          </div>
                          <span className="text-[10px] text-foreground/50 block">
                            Base: <strong className="text-primary font-mono">{activeCategory?.basePrice || 1000} pts</strong>
                          </span>
                        </div>

                        {/* Spin Player Shortcut Button */}
                        <button
                          onClick={() => {
                            if (!isAuctionLive) {
                              alert("Please click 'Start Live Auction' above before spinning players!");
                              return;
                            }
                            runPlayerSnipper();
                          }}
                          disabled={!isAuctionLive || isSpinningPlayer || waitingCategoryPlayers.length === 0}
                          className={`px-2.5 py-1.5 rounded-xl font-black text-[10px] shadow-sm transition-all flex items-center gap-1 shrink-0 ${isAuctionLive && waitingCategoryPlayers.length > 0
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                            : "bg-surface text-foreground/40 border border-foreground/15 cursor-not-allowed opacity-50"
                            }`}
                          title={isAuctionLive ? "Spin next waiting player" : "Start Live Auction first to enable"}
                        >
                          <Shuffle className="w-3 h-3" />
                          <span>Spin</span>
                        </button>
                      </div>
                    )}

                    {/* CONTENT 1: LIVE BIDDING PODCAST STREAM (Only in Automatic Bidding Mode) */}
                    {auctionBiddingMode === "AUTOMATIC" && rightTrayTab === "BIDS" ? (
                      <div className="flex-1 flex flex-col min-h-0 mt-2">
                        <div className="flex items-center justify-between pb-2 px-0.5 text-[10px] font-black uppercase tracking-wider text-foreground/50">
                          <span className="flex items-center gap-1.5">
                            <Radio className="w-3 h-3 text-red-400 animate-pulse" /> Real-Time Bids Feed
                          </span>
                          <span className="font-mono text-primary font-bold">
                            High: {auctionState?.currentBid || activePlayerBasePrice} pts
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pr-0.5">
                          {auctionState?.recentBids && auctionState.recentBids.length > 0 ? (
                            auctionState.recentBids.map((bid, idx) => {
                              const isWinning = idx === 0 || bid.isWinningBid;
                              const teamInitials = bid.teamName
                                ? bid.teamName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                                : "T";

                              return (
                                <div
                                  key={bid.bidId || idx}
                                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-md ${isWinning
                                    ? "bg-gradient-to-r from-amber-500/20 via-primary/15 to-surface/80 border-amber-400/70 shadow-amber-500/10 ring-1 ring-amber-400/30"
                                    : "bg-surface/70 hover:bg-surface border-foreground/10"
                                    }`}
                                >
                                  {/* Left: Team Avatar & Name */}
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-inner border shrink-0 ${isWinning
                                        ? "bg-gradient-to-br from-amber-400 to-primary text-black border-amber-300 font-black shadow-md shadow-amber-500/30"
                                        : "bg-primary/15 text-primary border-primary/30"
                                        }`}
                                    >
                                      {teamInitials}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="font-black text-xs text-foreground truncate">
                                          {bid.teamName}
                                        </h5>
                                        {isWinning && (
                                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-400 text-black shrink-0 animate-pulse">
                                            Leader
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-foreground/40 block">
                                        {isWinning ? "Current Highest Bidder" : "Submitted Bid"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right: Bidding Points Amount */}
                                  <div className="text-right shrink-0">
                                    <span
                                      className={`text-sm sm:text-base font-black font-mono block leading-none ${isWinning ? "text-amber-300 drop-shadow-sm" : "text-foreground font-mono"
                                        }`}
                                    >
                                      {bid.bidAmount.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold text-foreground/40 uppercase block mt-0.5">
                                      Points
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            /* Standby Podcast State when no bids placed yet */
                            <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed text-center space-y-3 my-auto" style={{ borderColor: "var(--athlon-border)" }}>
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-inner">
                                <Radio className="w-6 h-6 animate-pulse" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-xs font-black text-foreground uppercase tracking-tight">
                                  {activePlayer ? `Floor Open for ${activePlayer.playerName}` : "No Active Bidding Session"}
                                </h5>
                                <p className="text-[10px] text-foreground/50 max-w-xs mx-auto">
                                  {activePlayer
                                    ? "Franchise bids will broadcast live here one-by-one as owners place bids."
                                    : "Call an athlete to the floor to begin live franchise podcast bidding."}
                                </p>
                              </div>
                              {activePlayer && (
                                <div className="px-3 py-1 rounded-xl bg-surface border border-foreground/10 text-[10px] font-mono text-foreground/70">
                                  Opening Base: <strong className="text-primary">{activePlayerBasePrice} pts</strong>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* CONTENT 2: CATEGORY QUEUE (ATHLETE LIST & FILTERS) */
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Filter Pills: All | Active | Sold | Unsold */}
                        {(() => {
                          const waitingCategoryCount = categoryPlayers.filter((p) => p.state === "WAITING" || p.state === "CALLED" || p.state === "BIDDING").length;
                          const soldCategoryCount = categoryPlayers.filter((p) => p.state === "SOLD" || p.state === "ASSIGNED").length;
                          const unsoldCategoryCount = categoryPlayers.filter((p) => p.state === "UNSOLD").length;

                          const displayedPlayers = categoryPlayers.filter((p) => {
                            if (categoryTrayFilter === "WAITING") return p.state === "WAITING" || p.state === "CALLED" || p.state === "BIDDING";
                            if (categoryTrayFilter === "SOLD") return p.state === "SOLD" || p.state === "ASSIGNED";
                            if (categoryTrayFilter === "UNSOLD") return p.state === "UNSOLD";
                            return true;
                          });

                          return (
                            <>
                              <div className="flex items-center gap-1.5 pt-2 pb-1 overflow-x-auto hide-scrollbar shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setCategoryTrayFilter("ALL")}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 border ${categoryTrayFilter === "ALL"
                                    ? "bg-primary text-black border-primary shadow-sm"
                                    : "bg-surface text-foreground/60 border-foreground/10 hover:text-foreground"
                                    }`}
                                >
                                  All ({categoryPlayers.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCategoryTrayFilter("WAITING")}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 border flex items-center gap-1 ${categoryTrayFilter === "WAITING"
                                    ? "bg-amber-400 text-black border-amber-400 shadow-sm font-black"
                                    : "bg-surface text-foreground/60 border-foreground/10 hover:text-foreground"
                                    }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${categoryTrayFilter === "WAITING" ? "bg-black" : "bg-amber-400"}`} />
                                  Active ({waitingCategoryCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCategoryTrayFilter("SOLD")}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 border flex items-center gap-1 ${categoryTrayFilter === "SOLD"
                                    ? "bg-emerald-400 text-black border-emerald-400 shadow-sm font-black"
                                    : "bg-surface text-foreground/60 border-foreground/10 hover:text-foreground"
                                    }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${categoryTrayFilter === "SOLD" ? "bg-black" : "bg-emerald-400"}`} />
                                  Sold ({soldCategoryCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCategoryTrayFilter("UNSOLD")}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0 border flex items-center gap-1 ${categoryTrayFilter === "UNSOLD"
                                    ? "bg-red-400 text-black border-red-400 shadow-sm font-black"
                                    : "bg-surface text-foreground/60 border-foreground/10 hover:text-foreground"
                                    }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${categoryTrayFilter === "UNSOLD" ? "bg-black" : "bg-red-400"}`} />
                                  Unsold ({unsoldCategoryCount})
                                </button>
                              </div>

                              {/* Scrollable Athlete List Container (Filtered) */}
                              <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1.5 pr-0.5 mt-1.5">
                                {displayedPlayers.length === 0 ? (
                                  <div className="p-6 rounded-2xl border border-dashed text-center text-xs text-foreground/40 font-bold uppercase my-auto">
                                    No {categoryTrayFilter.toLowerCase()} athletes in this category.
                                  </div>
                                ) : (
                                  displayedPlayers.map((p) => {
                                    const isOnFloor = activePlayer?.auctionPlayerId === p.auctionPlayerId;
                                    const isSold = p.state === "SOLD" || p.state === "ASSIGNED";
                                    const isUnsold = p.state === "UNSOLD";
                                    const isWaiting = p.state === "WAITING";
                                    const effectiveBase = activeCategory?.basePrice && activeCategory.basePrice > 0
                                      ? activeCategory.basePrice
                                      : (p.basePrice && p.basePrice > 0 ? p.basePrice : 1000);

                                    return (
                                      <div
                                        key={p.auctionPlayerId}
                                        onClick={() => {
                                          if (!isAuctionLive) {
                                            alert("Please click 'Start Live Auction' above to begin the bidding session first!");
                                            return;
                                          }
                                          if (!isOnFloor && !isSold && !activePlayer) {
                                            handleCallPlayer(p.auctionPlayerId);
                                          }
                                        }}
                                        className={`group p-2 sm:p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${!isAuctionLive
                                          ? "bg-surface/50 border-foreground/10 opacity-70 cursor-not-allowed"
                                          : isOnFloor
                                            ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20"
                                            : isSold
                                              ? "bg-emerald-500/5 border-emerald-500/15 opacity-65 cursor-default"
                                              : isUnsold
                                                ? "bg-red-500/5 border-red-500/20 hover:border-amber-500/50 hover:bg-amber-500/10 cursor-pointer"
                                                : "bg-surface hover:bg-white/10 hover:border-primary/50 cursor-pointer border-foreground/10"
                                          }`}
                                        title={
                                          !isAuctionLive
                                            ? "Start live auction first"
                                            : isOnFloor
                                              ? "Currently on Floor"
                                              : isSold
                                                ? `Sold to ${p.winningTeamName || "Team"} for ${p.finalBid} pts`
                                                : isUnsold
                                                  ? "Click to re-call unsold athlete to floor"
                                                  : "Click to call athlete to floor"
                                        }
                                      >
                                        {/* Athlete Avatar & Info */}
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0 overflow-hidden">
                                            {p.avatarUrl ? (
                                              <img src={p.avatarUrl} alt={p.playerName} className="w-full h-full object-cover" />
                                            ) : (
                                              p.playerName.substring(0, 2).toUpperCase()
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <h5 className="font-black text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                              {p.playerName}
                                            </h5>
                                            <span className="text-[10px] text-foreground/50 block">
                                              Base: <strong className="text-primary font-mono">{effectiveBase} pts</strong>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Right Status Indicator */}
                                        <div className="shrink-0">
                                          {isOnFloor ? (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                              Floor
                                            </span>
                                          ) : isSold ? (
                                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase block truncate max-w-[85px]">
                                              Sold
                                            </span>
                                          ) : isUnsold ? (
                                            <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase block">
                                              Unsold
                                            </span>
                                          ) : (
                                            <span className="px-1.5 py-0.5 rounded-md bg-surface text-foreground/40 border border-foreground/10 text-[9px] font-black uppercase block group-hover:border-primary/40 group-hover:text-primary transition-colors">
                                              Pool
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. ROUND WHEEL CATEGORY SNIPPER MODAL (BIG SCREEN THEATER SIZE) */}
              {isSpinningCategory && (
                <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                  <div className="max-w-2xl w-full p-6 sm:p-10 rounded-3xl border border-primary/40 bg-card text-center space-y-6 shadow-2xl shadow-primary/30 animate-scaleIn relative overflow-hidden flex flex-col items-center">
                    <div className="space-y-1.5 relative z-10">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-primary flex items-center justify-center gap-2">
                        <Dices className="w-5 h-5" /> Category Snipper
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                        {categoryWheelWinner ? "Category Selected!" : "Spinning Category Wheel..."}
                      </h3>
                    </div>

                    {/* Circular Spinning Wheel (Big 440px Theater Size) */}
                    <div className="relative w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] my-2 flex items-center justify-center">
                      {/* Top Pointer Arrow */}
                      <div className="absolute -top-4 z-30 flex flex-col items-center pointer-events-none">
                        <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[30px] sm:border-t-[36px] border-t-amber-400 drop-shadow-[0_6px_14px_rgba(245,158,11,0.9)]" />
                        <div className="w-3 h-3 rounded-full bg-amber-200 -mt-1.5 shadow-md" />
                      </div>

                      {/* Rotating Wheel Disk */}
                      <div
                        className="w-full h-full rounded-full border-8 border-white/25 shadow-[0_0_60px_rgba(99,102,241,0.35)] relative overflow-hidden transition-transform ease-out"
                        style={{
                          transform: `rotate(${categoryWheelRotation}deg)`,
                          transitionDuration: "5000ms",
                          transitionTimingFunction: "cubic-bezier(0.12, 0.8, 0.25, 1)",
                          background: (() => {
                            const cats = categoryWheelCategories.length > 0 ? categoryWheelCategories : categories;
                            if (cats.length === 0) return "#6366f1";
                            if (cats.length === 1) return CATEGORY_WHEEL_COLORS[0];
                            const slice = 360 / cats.length;
                            const parts = cats.map(
                              (_, i) =>
                                `${CATEGORY_WHEEL_COLORS[i % CATEGORY_WHEEL_COLORS.length]} ${i * slice}deg ${(i + 1) * slice
                                }deg`
                            );
                            return `conic-gradient(from 0deg, ${parts.join(", ")})`;
                          })(),
                        }}
                      >
                        {/* Slice Labels */}
                        {(categoryWheelCategories.length > 0 ? categoryWheelCategories : categories).map((cat, i, arr) => {
                          const sliceAngle = 360 / arr.length;
                          const labelAngle = i * sliceAngle + sliceAngle / 2;

                          return (
                            <div
                              key={cat.categoryId || i}
                              className="absolute top-1/2 left-1/2 origin-left -translate-y-1/2 flex items-center justify-end pointer-events-none w-[150px] sm:w-[210px]"
                              style={{
                                transform: `rotate(${labelAngle - 90}deg)`,
                              }}
                            >
                              <span className="text-white font-black text-xs sm:text-base tracking-wider uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] pr-3 sm:pr-4 truncate max-w-[110px] sm:max-w-[160px]">
                                {cat.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center Jewel / Hub */}
                      <div className="absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface border-4 sm:border-6 border-primary shadow-2xl flex items-center justify-center text-primary font-black text-xl">
                        <Award className="w-9 h-9 sm:w-11 sm:h-11 text-primary" />
                      </div>
                    </div>

                    {/* Winner Banner or Ticker */}
                    <div className="h-16 flex items-center justify-center relative z-10 w-full">
                      {categoryWheelWinner ? (
                        <div className="px-8 py-3 rounded-2xl bg-emerald-500 text-black font-black text-xl sm:text-2xl uppercase shadow-2xl shadow-emerald-500/40 animate-bounce">
                          🎉 {categoryWheelWinner.name}
                        </div>
                      ) : (
                        <div className="text-sm sm:text-base font-black text-foreground/50 uppercase tracking-widest animate-pulse">
                          Drawing next phase...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. ROUND WHEEL PLAYER SNIPPER MODAL (BIG SCREEN THEATER SIZE) */}
              {isSpinningPlayer && (
                <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                  <div className="max-w-2xl w-full p-6 sm:p-10 rounded-3xl border border-amber-500/40 bg-card text-center space-y-6 shadow-2xl shadow-amber-500/30 animate-scaleIn relative overflow-hidden flex flex-col items-center">
                    <div className="space-y-1.5 relative z-10">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-2">
                        <Shuffle className="w-5 h-5 text-amber-400" /> Player Snipper • {activeCategory?.name || "All Categories"}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                        {playerWheelWinner ? "Athlete Selected!" : "Spinning Player Wheel..."}
                      </h3>
                    </div>

                    {/* Circular Spinning Wheel (Big 440px Theater Size) */}
                    <div className="relative w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] my-2 flex items-center justify-center">
                      {/* Top Pointer Arrow */}
                      <div className="absolute -top-4 z-30 flex flex-col items-center pointer-events-none">
                        <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[30px] sm:border-t-[36px] border-t-amber-400 drop-shadow-[0_6px_14px_rgba(245,158,11,0.9)]" />
                        <div className="w-3 h-3 rounded-full bg-amber-200 -mt-1.5 shadow-md" />
                      </div>

                      {/* Rotating Wheel Disk */}
                      <div
                        className="w-full h-full rounded-full border-8 border-white/25 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative overflow-hidden transition-transform ease-out"
                        style={{
                          transform: `rotate(${playerWheelRotation}deg)`,
                          transitionDuration: "5000ms",
                          transitionTimingFunction: "cubic-bezier(0.12, 0.8, 0.25, 1)",
                          background: (() => {
                            const pl = playerWheelPlayers.length > 0 ? playerWheelPlayers : categoryPlayers.filter((p) => p.state === "WAITING");
                            if (pl.length === 0) return "#f59e0b";
                            if (pl.length === 1) return CATEGORY_WHEEL_COLORS[0];
                            const slice = 360 / pl.length;
                            const parts = pl.map(
                              (_, i) =>
                                `${CATEGORY_WHEEL_COLORS[i % CATEGORY_WHEEL_COLORS.length]} ${i * slice}deg ${(i + 1) * slice
                                }deg`
                            );
                            return `conic-gradient(from 0deg, ${parts.join(", ")})`;
                          })(),
                        }}
                      >
                        {/* Slice Labels */}
                        {(playerWheelPlayers.length > 0 ? playerWheelPlayers : categoryPlayers.filter((p) => p.state === "WAITING")).map((p, i, arr) => {
                          const sliceAngle = 360 / arr.length;
                          const labelAngle = i * sliceAngle + sliceAngle / 2;

                          return (
                            <div
                              key={p.auctionPlayerId || i}
                              className="absolute top-1/2 left-1/2 origin-left -translate-y-1/2 flex items-center justify-end pointer-events-none w-[150px] sm:w-[210px]"
                              style={{
                                transform: `rotate(${labelAngle - 90}deg)`,
                              }}
                            >
                              <span className="text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] pr-3 sm:pr-4 truncate max-w-[110px] sm:max-w-[160px]">
                                {p.playerName}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center Jewel / Hub */}
                      <div className="absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface border-4 sm:border-6 border-amber-400 shadow-2xl flex items-center justify-center text-amber-400 font-black text-xl">
                        <Flame className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400" />
                      </div>
                    </div>

                    {/* Winner Banner or Ticker */}
                    <div className="h-16 flex items-center justify-center relative z-10 w-full">
                      {playerWheelWinner ? (
                        <div className="px-8 py-3 rounded-2xl bg-amber-400 text-black font-black text-xl sm:text-2xl uppercase shadow-2xl shadow-amber-400/40 animate-bounce">
                          🔥 {playerWheelWinner.playerName}
                        </div>
                      ) : (
                        <div className="text-sm sm:text-base font-black text-foreground/50 uppercase tracking-widest animate-pulse">
                          Selecting next athlete for auction floor...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* 7. FRANCHISE PURSES MODAL (ON-DEMAND - BIG SCREEN THEATER SIZE) */}
              {isPurseModalOpen && (
                <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6">
                  <div
                    className="max-w-5xl w-full p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-6 animate-scaleIn max-h-[92vh] overflow-y-auto hide-scrollbar"
                    style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: "var(--athlon-border)" }}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
                            Franchise Purse & Squad Standings
                          </h3>
                          <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">
                            Live remaining purse balance and acquired athlete counts for all {auctionTeams.length} participating franchises.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsPurseModalOpen(false)}
                        className="p-2.5 rounded-2xl border border-foreground/15 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Grid of Team Cards (3-col large format) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {auctionTeams.map((at) => {
                        const initialBudget = at.team.initialBudget || 5000;
                        const remainingBudget = at.team.remainingBudget ?? initialBudget;
                        const spentBudget = at.team.spentBudget || (initialBudget - remainingBudget);
                        const percentLeft = Math.max(0, Math.min(100, (remainingBudget / initialBudget) * 100));
                        const isSelected = manualWinningTeamId === at.team.teamId;

                        return (
                          <div
                            key={at.team.teamId}
                            onClick={() => {
                              setManualWinningTeamId(at.team.teamId);
                              setIsPurseModalOpen(false);
                            }}
                            className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 shadow-md ${isSelected
                              ? "bg-primary/20 border-primary ring-2 ring-primary/40 shadow-primary/10"
                              : "bg-surface/70 hover:bg-surface border-foreground/15 hover:border-primary/40"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-base sm:text-lg font-black text-foreground truncate">
                                  {at.team.teamName}
                                </h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-bold text-foreground/70">
                                    <Users className="w-3 h-3 text-primary" />
                                    <span>{at.acquiredPlayers?.length || at.team.playersAcquiredCount || 0} Drafted</span>
                                  </span>

                                  {/* View Icon to inspect highlighted team details */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHighlightedTeamId(at.team.teamId);
                                    }}
                                    className="p-1.5 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-black border border-primary/30 font-black text-xs transition-all flex items-center gap-1 shadow-sm"
                                    title="View full franchise details & drafted squad"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="text-[10px]">View</span>
                                  </button>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xl sm:text-2xl font-mono font-black text-primary block tracking-tight">
                                  {remainingBudget} <span className="text-xs font-sans font-bold">pts</span>
                                </span>
                                <span className="text-[11px] text-foreground/50 font-bold block mt-0.5">
                                  Spent: {spentBudget} pts
                                </span>
                              </div>
                            </div>

                            {/* Large Progress Bar with Percentage Tag */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[11px] font-bold text-foreground/50">
                                <span>Purse Remaining</span>
                                <span>{Math.round(percentLeft)}%</span>
                              </div>
                              <div className="w-full bg-foreground/10 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all rounded-full ${percentLeft > 50 ? "bg-emerald-500" : percentLeft > 20 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                  style={{ width: `${percentLeft}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--athlon-border)" }}>
                      <span className="text-xs text-foreground/50 font-bold">
                        Click any team card to map for current player, or click "View" to see full squad details
                      </span>
                      <button
                        onClick={() => setIsPurseModalOpen(false)}
                        className="px-8 py-3 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                      >
                        Done / Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. HIGHLIGHTED TEAM DETAILS SEPARATE MODAL */}
              {highlightedTeamId && (() => {
                const highlightedSummary = auctionTeams.find((at) => at.team.teamId === highlightedTeamId);
                const matchingTeamReg = teams.find((t) => t.teamId === highlightedTeamId);
                const teamName = highlightedSummary?.team.teamName || matchingTeamReg?.teamName || `Team #${highlightedTeamId}`;
                const initialBudget = highlightedSummary?.team.initialBudget || 5000;
                const remainingBudget = highlightedSummary?.team.remainingBudget ?? initialBudget;
                const spentBudget = highlightedSummary?.team.spentBudget || (initialBudget - remainingBudget);
                const percentLeft = Math.max(0, Math.min(100, (remainingBudget / initialBudget) * 100));

                const squadPlayers = auctionPlayers.filter(
                  (p) =>
                    p.winningTeamId === highlightedTeamId ||
                    (p.winningTeamName && p.winningTeamName.toLowerCase().trim() === teamName.toLowerCase().trim()) ||
                    highlightedSummary?.acquiredPlayers?.some((ap) => ap.auctionPlayerId === p.auctionPlayerId)
                );

                return (
                  <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
                    <div
                      className="max-w-4xl w-full p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-6 animate-scaleIn max-h-[92vh] overflow-y-auto hide-scrollbar"
                      style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: "var(--athlon-border)" }}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-amber-500/20 border-2 border-primary flex items-center justify-center text-2xl font-black text-primary shadow-xl shadow-primary/25">
                            <Shield className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase">
                                Franchise Showcase
                              </span>
                              {matchingTeamReg?.captainName && (
                                <span className="text-xs text-foreground/50 font-bold">
                                  Captain: {matchingTeamReg.captainName}
                                </span>
                              )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
                              {teamName}
                            </h2>
                          </div>
                        </div>

                        <button
                          onClick={() => setHighlightedTeamId(null)}
                          className="p-2.5 rounded-2xl border border-foreground/15 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* 3 Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl border bg-surface/60 border-foreground/10 space-y-1">
                          <span className="text-[10px] font-black uppercase text-foreground/40 block">Initial Purse</span>
                          <span className="text-xl sm:text-2xl font-mono font-black text-foreground">
                            {initialBudget} <span className="text-xs font-sans font-bold text-foreground/40">pts</span>
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl border bg-surface/60 border-foreground/10 space-y-1">
                          <span className="text-[10px] font-black uppercase text-foreground/40 block">Total Spent</span>
                          <span className="text-xl sm:text-2xl font-mono font-black text-foreground">
                            {spentBudget} <span className="text-xs font-sans font-bold text-foreground/40">pts</span>
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl border bg-primary/10 border-primary/30 space-y-1 shadow-sm">
                          <span className="text-[10px] font-black uppercase text-primary block">Remaining Balance</span>
                          <span className="text-2xl sm:text-3xl font-mono font-black text-primary">
                            {remainingBudget} <span className="text-xs font-sans font-bold">pts</span>
                          </span>
                        </div>
                      </div>

                      {/* Budget Health Progress Bar */}
                      <div className="p-4 rounded-2xl bg-surface/40 border border-foreground/10 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-foreground/70">
                          <span>Remaining Budget Health</span>
                          <span className="text-primary font-mono">{Math.round(percentLeft)}%</span>
                        </div>
                        <div className="w-full bg-foreground/10 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${percentLeft > 50 ? "bg-emerald-500" : percentLeft > 20 ? "bg-amber-500" : "bg-red-500"
                              }`}
                            style={{ width: `${percentLeft}%` }}
                          />
                        </div>
                      </div>

                      {/* Full Drafted Squad List */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                          <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>Acquired Squad Athletes ({squadPlayers.length})</span>
                          </h4>
                          <span className="text-xs text-foreground/50 font-bold">Auction Draft Results</span>
                        </div>

                        {squadPlayers.length === 0 ? (
                          <div className="p-10 rounded-2xl border border-dashed text-center text-xs text-foreground/40 font-bold uppercase">
                            No athletes drafted into this franchise yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {squadPlayers.map((sp) => (
                              <div
                                key={sp.auctionPlayerId}
                                className="p-4 rounded-2xl border bg-surface/80 border-foreground/10 flex items-center justify-between gap-3 shadow-sm"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0 overflow-hidden">
                                    {sp.avatarUrl ? (
                                      <img src={sp.avatarUrl} alt={sp.playerName} className="w-full h-full object-cover" />
                                    ) : (
                                      sp.playerName.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-sm font-black text-foreground truncate">{sp.playerName}</h5>
                                    <span className="text-[10px] text-foreground/50 uppercase font-bold block">
                                      {sp.categoryName || "Category"}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-mono font-black text-emerald-400 block">
                                    {sp.finalBid} pts
                                  </span>
                                  <span className="text-[9px] text-foreground/40 uppercase font-bold">
                                    Bought
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Modal Actions */}
                      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--athlon-border)" }}>
                        <button
                          onClick={() => {
                            setManualWinningTeamId(highlightedTeamId);
                            setHighlightedTeamId(null);
                            setIsPurseModalOpen(false);
                          }}
                          className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Select this Team for Active Player</span>
                        </button>

                        <button
                          onClick={() => setHighlightedTeamId(null)}
                          className="px-6 py-3 rounded-2xl border border-foreground/15 bg-surface hover:bg-white/5 text-foreground font-black text-xs transition-all"
                        >
                          Back to All Teams
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* 9. CATEGORY PHASE SELECTION MODAL (ON-DEMAND) */}
              {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                  <div
                    className="max-w-3xl w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 animate-scaleIn max-h-[90vh] overflow-y-auto hide-scrollbar"
                    style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--athlon-border)" }}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
                          <Layers className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                            Auction Category Phase
                          </h3>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            Choose a category phase manually or spin the Round Snipper wheel to draw the next phase.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCategoryModalOpen(false)}
                        className="p-2.5 rounded-2xl border border-foreground/15 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Top Action / Round Snipper Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-primary/15 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                      <div>
                        <span className="text-xs font-black uppercase text-indigo-400 block">
                          Randomized Phase Draw
                        </span>
                        <p className="text-xs text-foreground/70">
                          Spin the tournament-style round wheel to choose from available categories.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (!isAuctionLive) {
                            alert("Please click 'Start Live Auction' above before spinning the category wheel!");
                            return;
                          }
                          setIsCategoryModalOpen(false);
                          runCategorySnipper();
                        }}
                        disabled={!isAuctionLive}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 ${isAuctionLive
                          ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-primary text-white shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer"
                          : "bg-surface text-foreground/40 border border-foreground/15 cursor-not-allowed opacity-50"
                          }`}
                        title={isAuctionLive ? "Spin category wheel" : "Start Live Auction first to enable"}
                      >
                        <Dices className="w-4 h-4" />
                        <span>🎰 Spin Round Wheel</span>
                      </button>
                    </div>

                    {/* Category Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {categories.map((cat, idx) => {
                        const catPlayers = auctionPlayers.filter(
                          (p) =>
                          (p.categoryId === cat.categoryId ||
                            (p.categoryName && cat.name && p.categoryName.toLowerCase().trim() === cat.name.toLowerCase().trim()))
                        );
                        const waitingCount = catPlayers.filter((p) => p.state === "WAITING" || p.state === "UNSOLD").length;
                        const soldCount = catPlayers.filter((p) => p.state === "SOLD" || p.state === "ASSIGNED").length;
                        const isSelected = activeCategory?.categoryId === cat.categoryId;
                        const accentColor = CATEGORY_WHEEL_COLORS[idx % CATEGORY_WHEEL_COLORS.length];

                        return (
                          <div
                            key={cat.categoryId}
                            onClick={() => {
                              setSelectedAuctionPhaseCatId(cat.categoryId || null);
                              setIsCategoryModalOpen(false);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:scale-102 ${isSelected
                              ? "bg-primary/20 border-primary ring-2 ring-primary/40 shadow-primary/10"
                              : "bg-surface/80 hover:bg-surface border-foreground/15 hover:border-primary/40"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: accentColor }}
                                />
                                <span className="font-black text-sm text-foreground truncate">{cat.name}</span>
                              </div>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-primary text-black font-black text-[9px] uppercase">
                                  Active
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 pt-1 border-t border-foreground/10">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-foreground/50">Base Price</span>
                                <strong className="text-primary font-mono">{cat.basePrice || 1000} pts</strong>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-foreground/60 font-semibold">
                                <span>{waitingCount} waiting</span>
                                <span>{soldCount} sold</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end pt-3 border-t" style={{ borderColor: "var(--athlon-border)" }}>
                      <button
                        onClick={() => setIsCategoryModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        Done / Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. ARENA THEME SELECTOR MODAL (EXCLUSIVE TO MAXIMIZE / FULLSCREEN SCREEN) */}
              {isAuctionFullscreen && isThemeModalOpen && (
                <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                  <div
                    className="max-w-2xl w-full p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-6 animate-scaleIn max-h-[90vh] overflow-y-auto hide-scrollbar"
                    style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--athlon-border)" }}>
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0"
                          style={{ backgroundColor: "rgba(var(--athlon-primary-rgb, 99, 102, 241), 0.15)", border: "1px solid var(--athlon-primary)" }}
                        >
                          <Palette className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                            <span>Arena Broadcast Theme</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                              {currentTheme.name}
                            </span>
                          </h3>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            Select a color scheme for the live auction big-screen broadcast. Applied in real-time.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsThemeModalOpen(false)}
                        className="p-2.5 rounded-2xl border border-foreground/15 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Theme Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                      {availableThemes.map((t) => {
                        const isSelected = t.key === themeKey;
                        const tc = t.colors;

                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => {
                              setTheme(t.key);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group active:scale-[0.97] cursor-pointer flex flex-col justify-between gap-4 ${isSelected
                              ? 'shadow-xl ring-2'
                              : 'hover:bg-white/[0.04]'
                              }`}
                            style={{
                              backgroundColor: isSelected ? tc.surface : 'var(--athlon-surface)',
                              borderColor: isSelected ? tc.primary : 'var(--athlon-border)',
                              outlineColor: tc.primary,
                              boxShadow: isSelected ? `0 8px 24px -4px ${tc.glow}` : 'none',
                            }}
                          >
                            {/* Top: Swatch Orb + Check Icon */}
                            <div className="flex items-center justify-between">
                              <div className="relative">
                                <div
                                  className="w-9 h-9 rounded-full shadow-md transition-transform duration-200 group-hover:scale-110 flex items-center justify-center"
                                  style={{
                                    backgroundColor: tc.primary,
                                    boxShadow: `0 0 16px ${tc.primaryGlow}`,
                                  }}
                                >
                                  <div className="w-3 h-3 rounded-full bg-white/40 blur-[1px]" />
                                </div>
                              </div>

                              {isSelected ? (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm"
                                  style={{ backgroundColor: tc.primary, color: tc.primaryForeground }}
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </div>
                              ) : (
                                <span className="w-3 h-3 rounded-full bg-foreground/10 group-hover:bg-primary/40 transition-colors" />
                              )}
                            </div>

                            {/* Bottom: Theme Name & Details */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <div className="text-sm font-black tracking-tight truncate" style={{ color: isSelected ? tc.text : 'inherit' }}>
                                  {t.name}
                                </div>
                                {t.key === 'algae' && (
                                  <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/60 shrink-0">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 pt-1">
                                <div className="w-3 h-3 rounded-md" style={{ backgroundColor: tc.primary }} />
                                <div className="w-3 h-3 rounded-md" style={{ backgroundColor: tc.surface }} />
                                <div className="w-3 h-3 rounded-md" style={{ backgroundColor: tc.card }} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--athlon-border)" }}>
                      <span className="text-xs text-foreground/50 font-bold">
                        Click any theme card to instantly preview and switch arena color palette.
                      </span>
                      <button
                        onClick={() => setIsThemeModalOpen(false)}
                        className="px-7 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 5: SQUADS & PARTICIPATION AUDIT */}
        {activeTab === "squads" && (() => {
          const filteredTeams = teams.filter((t) =>
            t.teamName.toLowerCase().includes(squadTeamSearch.toLowerCase()) ||
            (t.captainName && t.captainName.toLowerCase().includes(squadTeamSearch.toLowerCase()))
          );

          const activeTeamObj = teams.find((t) => t.teamId === selectedTeamForAudit);
          const players = teamAudit?.players || [];
          const totalRosteredAthletes = championship?.registeredPlayersCount || players.length || 0;
          const currencySymbol = championship?.auctionMode === "NO_AUCTION" ? "pts" : "pts";
          const totalPurseSpent = players.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
          const totalMatchesCap = players.reduce((sum, p) => sum + (p.matchesPlayedCount || 0), 0);
          const playedCount = players.filter((p) => (p.matchesPlayedCount || 0) > 0).length;
          const unplayedCount = players.filter((p) => (p.matchesPlayedCount || 0) === 0).length;
          const auctionCount = players.filter((p) => p.acquisitionType === "AUCTION").length;
          const reservedCount = players.filter((p) => p.acquisitionType === "RESERVED").length;
          const directCount = players.filter((p) => p.acquisitionType === "DIRECT").length;
          const compliancePct = players.length > 0 ? Math.round((playedCount / players.length) * 100) : 100;
          const isFullSquad = teamAudit ? teamAudit.playersCount >= teamAudit.squadCapacity : false;

          // Filter squad players by search query and category/status filter
          const displayedPlayers = players.filter((p) => {
            const matchesSearch =
              !squadSearchQuery.trim() ||
              p.playerName.toLowerCase().includes(squadSearchQuery.toLowerCase()) ||
              (p.categoryName && p.categoryName.toLowerCase().includes(squadSearchQuery.toLowerCase())) ||
              p.acquisitionType.toLowerCase().includes(squadSearchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (squadFilterStatus === "PLAYED") return (p.matchesPlayedCount || 0) > 0;
            if (squadFilterStatus === "UNPLAYED") return (p.matchesPlayedCount || 0) === 0;
            if (squadFilterStatus === "AUCTION") return p.acquisitionType === "AUCTION";
            if (squadFilterStatus === "RESERVED") return p.acquisitionType === "RESERVED";
            if (squadFilterStatus === "DIRECT") return p.acquisitionType === "DIRECT";
            return true;
          });

          return (
            <div className="space-y-4">
              {/* COMPACT CLEAN HEADER STRIP */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground tracking-tight">
                      Squads & Participation Audit
                    </h2>
                    <p className="text-[11px] text-foreground/50">
                      {teams.length} Franchises • {totalRosteredAthletes} Rostered Athletes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-surface border text-foreground/70 font-bold text-[11px] flex items-center gap-1.5" style={{ borderColor: "var(--athlon-border)" }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Mandatory League Participation
                  </span>
                </div>
              </div>

              {/* MAIN CONTENT TWO-COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT RAIL: FRANCHISE SELECTOR (4 Cols on LG) */}
                <div
                  className="lg:col-span-4 rounded-3xl border p-4 sm:p-5 space-y-4"
                  style={{
                    backgroundColor: "var(--athlon-card)",
                    borderColor: "var(--athlon-border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground/70">
                        Competing Franchises
                      </h3>
                      <span className="text-[10px] text-foreground/50">{teams.length} teams registered</span>
                    </div>
                    <button
                      onClick={() => setIsAddTeamModalOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-tight flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Team
                    </button>
                  </div>

                  {/* Team Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="text"
                      placeholder="Search franchise or captain..."
                      value={squadTeamSearch}
                      onChange={(e) => setSquadTeamSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border bg-background/50 text-xs font-medium outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/40"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>

                  {/* Team Cards List */}
                  <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                    {filteredTeams.length === 0 ? (
                      <div className="py-8 text-center text-xs text-foreground/40">No matching teams found</div>
                    ) : (
                      filteredTeams.map((t) => {
                        const isSelected = selectedTeamForAudit === t.teamId;
                        const capacity = championship?.rules?.maxSquadSize || 7;
                        const count = teamAudit && teamAudit.teamId === t.teamId ? teamAudit.playersCount : (auctionPlayers ? auctionPlayers.filter(ap => ap.winningTeamId === t.teamId).length : 0);
                        const pct = Math.min(100, Math.round((count / (capacity || 1)) * 100));

                        return (
                          <button
                            key={t.teamId}
                            onClick={() => setSelectedTeamForAudit(t.teamId)}
                            className={`w-full p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                              isSelected
                                ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border-primary shadow-md shadow-primary/5"
                                : "bg-surface/50 border-foreground/10 hover:border-foreground/20 hover:bg-surface"
                            }`}
                            style={{
                              borderColor: isSelected ? undefined : "var(--athlon-border-subtle)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {/* Team Avatar */}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-all ${
                                  isSelected
                                    ? "bg-primary text-black border-primary font-black"
                                    : "bg-background text-foreground/80 border-foreground/10 group-hover:border-foreground/30"
                                }`}
                              >
                                {t.logoUrl ? (
                                  <img
                                    src={t.logoUrl}
                                    alt={t.teamName}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  t.teamName.substring(0, 2).toUpperCase()
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <h4 className="text-xs font-black text-foreground truncate">{t.teamName}</h4>
                                  <ChevronRight
                                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                      isSelected ? "text-primary translate-x-0.5" : "text-foreground/30 group-hover:text-foreground/60"
                                    }`}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-foreground/50 mb-1.5">
                                  <span className="truncate">{t.captainName ? `Capt: ${t.captainName}` : "No Captain Assigned"}</span>
                                  <span className="font-mono font-bold text-foreground/70 shrink-0">
                                    {count}/{capacity}
                                  </span>
                                </div>

                                {/* Mini Progress Bar */}
                                <div className="w-full h-1 rounded-full bg-foreground/10 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      pct >= 100 ? "bg-emerald-400" : isSelected ? "bg-primary" : "bg-foreground/40"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL: SQUAD COMMAND CENTER & AUDIT INTELLIGENCE (8 Cols on LG) */}
                <div className="lg:col-span-8 space-y-6">
                  {loadingSquadAudit ? (
                    <div
                      className="rounded-3xl border p-12 text-center space-y-4 animate-pulse"
                      style={{
                        backgroundColor: "var(--athlon-card)",
                        borderColor: "var(--athlon-border)",
                      }}
                    >
                      <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto opacity-70" />
                      <p className="text-xs font-bold text-foreground/60">Fetching franchise squad & participation audit...</p>
                    </div>
                  ) : teamAudit ? (
                    <>
                      {/* FRANCHISE HERO HUD */}
                      <div
                        className="rounded-3xl border p-5 sm:p-6 space-y-5 relative overflow-hidden"
                        style={{
                          backgroundColor: "var(--athlon-card)",
                          borderColor: "var(--athlon-border)",
                        }}
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-2 border-primary/30 flex items-center justify-center font-black text-xl text-primary shrink-0 shadow-lg shadow-primary/5">
                              {teamAudit.logoUrl ? (
                                <img
                                  src={teamAudit.logoUrl}
                                  alt={teamAudit.teamName}
                                  className="w-full h-full object-cover rounded-2xl"
                                />
                              ) : (
                                teamAudit.teamName.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-foreground tracking-tight">
                                  {teamAudit.teamName}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                                  Franchise Roster
                                </span>
                              </div>
                              <p className="text-xs text-foreground/60 mt-0.5">
                                {teamAudit.captainName ? `Captain: ${teamAudit.captainName}` : "Official Squad Audit"} • {teamAudit.playersCount} Athletes Rostered
                              </p>
                            </div>
                          </div>

                          {/* Top Right Action & Compliance Badge */}
                          <div className="flex items-center gap-2">
                            {teamAudit.everyPlayerHasPlayedLeague ? (
                              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase flex items-center gap-1.5 shadow-sm">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>100% League Compliant</span>
                              </span>
                            ) : (
                              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-black uppercase flex items-center gap-1.5 shadow-sm animate-pulse">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span>{teamAudit.unplayedPlayers.length} Participation Pending</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 4 Hero Stat Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {/* 1. Squad Capacity */}
                          <div
                            className="p-3.5 rounded-2xl border bg-surface/40 space-y-1.5"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <div className="flex items-center justify-between text-foreground/50 text-[10px] font-black uppercase tracking-wider">
                              <span>Squad Capacity</span>
                              <Users className="w-3 h-3 text-primary" />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-foreground font-mono">
                                {teamAudit.playersCount}
                              </span>
                              <span className="text-xs font-bold text-foreground/40 font-mono">
                                / {teamAudit.squadCapacity}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isFullSquad ? "bg-emerald-400" : "bg-primary"
                                }`}
                                style={{
                                  width: `${Math.min(100, (teamAudit.playersCount / (teamAudit.squadCapacity || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* 2. League Compliance */}
                          <div
                            className="p-3.5 rounded-2xl border bg-surface/40 space-y-1.5"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <div className="flex items-center justify-between text-foreground/50 text-[10px] font-black uppercase tracking-wider">
                              <span>Participation</span>
                              <Activity className="w-3 h-3 text-emerald-400" />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-emerald-400 font-mono">
                                {playedCount}
                              </span>
                              <span className="text-xs font-bold text-foreground/40 font-mono">
                                / {players.length} played
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-foreground/50">
                              {compliancePct}% of roster played
                            </div>
                          </div>

                          {/* 3. Total Purse Invested */}
                          <div
                            className="p-3.5 rounded-2xl border bg-surface/40 space-y-1.5"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <div className="flex items-center justify-between text-foreground/50 text-[10px] font-black uppercase tracking-wider">
                              <span>Purse Spent</span>
                              <Coins className="w-3 h-3 text-amber-400" />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-foreground font-mono">
                                {totalPurseSpent.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-black uppercase text-foreground/60">
                                {currencySymbol}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-foreground/50">
                              {auctionCount} via auction
                            </div>
                          </div>

                          {/* 4. Match Caps */}
                          <div
                            className="p-3.5 rounded-2xl border bg-surface/40 space-y-1.5"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <div className="flex items-center justify-between text-foreground/50 text-[10px] font-black uppercase tracking-wider">
                              <span>Match Appearances</span>
                              <Swords className="w-3 h-3 text-blue-400" />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-foreground font-mono">
                                {totalMatchesCap}
                              </span>
                              <span className="text-[10px] font-bold text-foreground/40">caps</span>
                            </div>
                            <div className="text-[10px] font-bold text-foreground/50">
                              Across all fixtures
                            </div>
                          </div>
                        </div>

                        {/* Every Player Must Play Status Notice Banner */}
                        <div
                          className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs ${
                            teamAudit.everyPlayerHasPlayedLeague
                              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                              : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                          }`}
                        >
                          {teamAudit.everyPlayerHasPlayedLeague ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                          )}
                          <div className="space-y-1">
                            <div className="font-black uppercase tracking-wide text-xs">
                              {teamAudit.everyPlayerHasPlayedLeague
                                ? "League Participation Rule Satisfied"
                                : `Action Required: ${teamAudit.unplayedPlayers.length} Player(s) Awaiting Match Time`}
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed text-foreground/80">
                              {teamAudit.everyPlayerHasPlayedLeague
                                ? "All acquired squad members have played at least one league match fixture. This roster is in full compliance for tournament knockout progression."
                                : `The tournament requires every squad athlete to participate during the league stage. Pending athlete(s): ${teamAudit.unplayedPlayers.join(
                                    ", "
                                  )}. Make sure they are selected in upcoming fixture lineups.`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SQUAD ATHLETES SECTION & TOOLBAR */}
                      <div
                        className="rounded-3xl border p-5 sm:p-6 space-y-5"
                        style={{
                          backgroundColor: "var(--athlon-card)",
                          borderColor: "var(--athlon-border)",
                        }}
                      >
                        {/* Toolbar: Search, Filters & View Toggle */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSquadFilterStatus("ALL")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                                squadFilterStatus === "ALL"
                                  ? "bg-primary text-black shadow-sm"
                                  : "bg-surface text-foreground/60 hover:text-foreground border border-foreground/10"
                              }`}
                            >
                              All ({players.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setSquadFilterStatus("PLAYED")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                squadFilterStatus === "PLAYED"
                                  ? "bg-emerald-500 text-black shadow-sm"
                                  : "bg-surface text-foreground/60 hover:text-emerald-400 border border-foreground/10"
                              }`}
                            >
                              <Check className="w-3 h-3" /> Played ({playedCount})
                            </button>

                            <button
                              type="button"
                              onClick={() => setSquadFilterStatus("UNPLAYED")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                squadFilterStatus === "UNPLAYED"
                                  ? "bg-amber-500 text-black shadow-sm"
                                  : "bg-surface text-foreground/60 hover:text-amber-400 border border-foreground/10"
                              }`}
                            >
                              <Clock className="w-3 h-3" /> Unplayed ({unplayedCount})
                            </button>

                            {auctionCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setSquadFilterStatus("AUCTION")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                  squadFilterStatus === "AUCTION"
                                    ? "bg-purple-500 text-white shadow-sm"
                                    : "bg-surface text-foreground/60 hover:text-purple-400 border border-foreground/10"
                                }`}
                              >
                                <Gavel className="w-3 h-3" /> Auction ({auctionCount})
                              </button>
                            )}

                            {reservedCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setSquadFilterStatus("RESERVED")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                  squadFilterStatus === "RESERVED"
                                    ? "bg-amber-500 text-black shadow-sm"
                                    : "bg-surface text-foreground/60 hover:text-amber-400 border border-foreground/10"
                                }`}
                              >
                                <Sparkles className="w-3 h-3" /> Reserved ({reservedCount})
                              </button>
                            )}
                          </div>

                          {/* Search Input & Grid/List Layout Toggle */}
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1 md:w-56">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                              <input
                                type="text"
                                placeholder="Filter squad athlete..."
                                value={squadSearchQuery}
                                onChange={(e) => setSquadSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-background/50 text-xs font-medium outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/40"
                                style={{ borderColor: "var(--athlon-border)" }}
                              />
                            </div>

                            <div className="flex items-center border rounded-xl p-0.5 bg-surface" style={{ borderColor: "var(--athlon-border)" }}>
                              <button
                                type="button"
                                onClick={() => setSquadViewLayout("grid")}
                                title="Grid View"
                                className={`p-1.5 rounded-lg transition-all ${
                                  squadViewLayout === "grid" ? "bg-primary/20 text-primary" : "text-foreground/40 hover:text-foreground"
                                }`}
                              >
                                <LayoutGrid className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSquadViewLayout("list")}
                                title="List View"
                                className={`p-1.5 rounded-lg transition-all ${
                                  squadViewLayout === "list" ? "bg-primary/20 text-primary" : "text-foreground/40 hover:text-foreground"
                                }`}
                              >
                                <List className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ATHLETE DISPLAY AREA */}
                        {displayedPlayers.length === 0 ? (
                          <div className="py-16 text-center space-y-2">
                            <Users className="w-10 h-10 text-foreground/20 mx-auto" />
                            <h4 className="text-sm font-bold text-foreground/60">No Athletes Found</h4>
                            <p className="text-xs text-foreground/40">
                              {players.length === 0
                                ? "No players have been acquired or assigned to this franchise squad yet."
                                : "No squad members match the current search or filter criteria."}
                            </p>
                          </div>
                        ) : squadViewLayout === "grid" ? (
                          /* GRID VIEW */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {displayedPlayers.map((sp) => {
                              const hasPlayed = (sp.matchesPlayedCount || 0) > 0;

                              return (
                                <div
                                  key={sp.squadId}
                                  className="p-4 rounded-2xl border bg-surface/50 hover:bg-surface transition-all flex flex-col justify-between space-y-3 group hover:border-foreground/20 relative overflow-hidden"
                                  style={{ borderColor: "var(--athlon-border-subtle)" }}
                                >
                                  {/* Top Row: Avatar, Name, Category & Acquisition */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      {/* Player Avatar */}
                                      <div className="w-12 h-12 rounded-xl bg-background border border-foreground/10 flex items-center justify-center font-black text-sm text-foreground shrink-0 overflow-hidden relative shadow-sm">
                                        {sp.avatarUrl ? (
                                          <img
                                            src={sp.avatarUrl}
                                            alt={sp.playerName}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          sp.playerName.substring(0, 2).toUpperCase()
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <h4 className="text-sm font-black text-foreground truncate">
                                            {sp.playerName}
                                          </h4>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                                            {sp.categoryName || "Open Tier"}
                                          </span>

                                          {sp.acquisitionType === "AUCTION" ? (
                                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase flex items-center gap-1">
                                              <Gavel className="w-2.5 h-2.5" />
                                              <span>{sp.purchasePrice?.toLocaleString() || 0} {currencySymbol}</span>
                                            </span>
                                          ) : sp.acquisitionType === "RESERVED" ? (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase flex items-center gap-1">
                                              <Sparkles className="w-2.5 h-2.5" /> Reserved
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase">
                                              Direct
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Participation Status Badge */}
                                    <div className="shrink-0">
                                      {hasPlayed ? (
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                                          <span>Played ({sp.matchesPlayedCount})</span>
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-black uppercase flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-amber-400" />
                                          <span>Needs Match</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bottom Details Footer */}
                                  <div
                                    className="pt-2.5 border-t flex items-center justify-between text-[10px] text-foreground/50"
                                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>Eligible Formats:</span>
                                      <span className="font-bold text-foreground/70">
                                        {sp.eligibleFormats || "All Formats"}
                                      </span>
                                    </div>
                                    <div className="font-mono font-bold text-foreground/60">
                                      {sp.matchesPlayedCount || 0} matches
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* LIST / TABLE VIEW */
                          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b bg-surface/70 text-foreground/60 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                                    <th className="py-3 px-4">Athlete Name</th>
                                    <th className="py-3 px-4">Category Tier</th>
                                    <th className="py-3 px-4">Acquisition Mode</th>
                                    <th className="py-3 px-4">Acquisition Cost</th>
                                    <th className="py-3 px-4 text-center">Matches Played</th>
                                    <th className="py-3 px-4 text-right">League Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                                  {displayedPlayers.map((sp) => {
                                    const hasPlayed = (sp.matchesPlayedCount || 0) > 0;
                                    return (
                                      <tr key={sp.squadId} className="hover:bg-surface/50 transition-colors">
                                        <td className="py-3 px-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-background border border-foreground/10 flex items-center justify-center font-black text-xs text-foreground">
                                              {sp.playerName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-black text-foreground">{sp.playerName}</span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4">
                                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                                            {sp.categoryName || "Open"}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4">
                                          <span className="font-bold text-foreground/80">{sp.acquisitionType}</span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                                          {sp.purchasePrice ? `${sp.purchasePrice.toLocaleString()} ${currencySymbol}` : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                                          {sp.matchesPlayedCount || 0}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                          {hasPlayed ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                                              <Check className="w-3 h-3" /> Played
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-black uppercase border border-amber-500/20">
                                              <Clock className="w-3 h-3" /> Unplayed
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      className="rounded-3xl border p-16 text-center space-y-3"
                      style={{
                        backgroundColor: "var(--athlon-card)",
                        borderColor: "var(--athlon-border)",
                      }}
                    >
                      <Shield className="w-12 h-12 text-foreground/20 mx-auto" />
                      <h4 className="text-base font-black text-foreground/70">Select a Franchise</h4>
                      <p className="text-xs text-foreground/40 max-w-sm mx-auto">
                        Choose a team from the left sidebar to view its rostered athletes, purse allocation, and league participation audit.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 6: FIXTURES */}
        {activeTab === "fixtures" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">Championship Match Schedule ({fixtures.length} Fixtures)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixtures.map((f) => (
                <div
                  key={f.fixtureId}
                  className="rounded-3xl border p-6 space-y-4 hover:border-primary/50 transition-all cursor-pointer"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  onClick={() => {
                    setSelectedFixtureId(f.fixtureId);
                    setActiveTab("lineups");
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {f.roundName} • Pool Stage
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-foreground/5 text-foreground/60">
                      {f.status}
                    </span>
                  </div>

                  {/* Team vs Team Card */}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-foreground">{f.teamAName}</h4>
                      <span className="text-xl font-black text-primary">{f.teamAPoints}</span>
                    </div>

                    <span className="text-xs font-black text-foreground/40 uppercase">VS</span>

                    <div className="space-y-1 text-right">
                      <h4 className="text-sm font-black text-foreground">{f.teamBName}</h4>
                      <span className="text-xl font-black text-primary">{f.teamBPoints}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <span className="text-[11px] text-foreground/40">{f.courtName || "Court 1"}</span>
                    <span className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      Lineups & Sub-Matches <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: LINEUPS & SUB-MATCHES (FIXTURE DRILLDOWN) */}
        {activeTab === "lineups" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab("fixtures")}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Fixtures List
              </button>
            </div>

            {fixtureDetail ? (
              <div
                className="rounded-3xl border p-6 sm:p-8 space-y-6"
                style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      {fixtureDetail.fixture.teamAName} vs {fixtureDetail.fixture.teamBName}
                    </h3>
                    <p className="text-xs text-foreground/60">
                      Toss Winner: <strong>{fixtureDetail.toss?.tossWinnerTeamName || "Toss not conducted"}</strong>
                    </p>
                  </div>

                  {/* Simultaneous Reveal Status */}
                  <div>
                    {fixtureDetail.lineupsRevealed ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-black uppercase flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Lineups Public & Revealed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs font-black uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Secret Submission Stage
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-Matches Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground/70">
                    Individual Sub-Match Events
                  </h4>
                  {fixtureDetail.subMatches?.map((sm: TeamChampionshipSubMatch) => (
                    <div
                      key={sm.subMatchId}
                      className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase">
                          Match #{sm.orderSequence} • {sm.eventName}
                        </span>
                        <div className="font-bold text-foreground">
                          {sm.teamAPlayers || "Team A Lineup Pending"} vs {sm.teamBPlayers || "Team B Lineup Pending"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-primary">{sm.scoreSummary || "0 - 0"}</span>
                        <button
                          onClick={() => router.push(`/live-score/${sm.subMatchId}`)}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-black hover:scale-105 transition-all shadow-sm"
                        >
                          Live Score
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-foreground/40">Select a fixture from the list to manage lineups.</div>
            )}
          </div>
        )}

        {/* TAB 8: STANDINGS */}
        {activeTab === "standings" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-foreground">Pool Standings Table</h3>
            <div
              className="rounded-3xl border overflow-hidden shadow-xl"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-foreground/[0.02]" style={{ borderColor: "var(--athlon-border)" }}>
                      <th className="p-4 font-black uppercase text-foreground/50">Rank & Team</th>
                      <th className="p-4 font-black uppercase text-foreground/50 text-center">Played</th>
                      <th className="p-4 font-black uppercase text-foreground/50 text-center">Won</th>
                      <th className="p-4 font-black uppercase text-foreground/50 text-center">Lost</th>
                      <th className="p-4 font-black uppercase text-foreground/50 text-center">Sub-Matches Diff</th>
                      <th className="p-4 font-black uppercase text-primary text-center">Points</th>
                      <th className="p-4 font-black uppercase text-foreground/50 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr
                        key={row.teamId}
                        className="border-b hover:bg-foreground/[0.02] transition-colors"
                        style={{ borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <td className="p-4 font-black text-foreground flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-foreground/10 flex items-center justify-center text-xs">
                            {row.rank}
                          </span>
                          <span>{row.teamName}</span>
                        </td>
                        <td className="p-4 text-center font-bold text-foreground/70">{row.played}</td>
                        <td className="p-4 text-center font-bold text-emerald-400">{row.won}</td>
                        <td className="p-4 text-center font-bold text-red-400">{row.lost}</td>
                        <td className="p-4 text-center font-bold text-foreground/70">
                          {row.subMatchDiff > 0 ? `+${row.subMatchDiff}` : row.subMatchDiff}
                        </td>
                        <td className="p-4 text-center font-black text-primary text-sm">{row.points}</td>
                        <td className="p-4 text-center">
                          {row.isQualified ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase">
                              Qualified
                            </span>
                          ) : (
                            <span className="text-[10px] text-foreground/40 font-bold uppercase">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER TEAM */}
        {isAddTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div
              className="w-full max-w-md rounded-3xl border p-6 space-y-6 shadow-2xl relative"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Register New Team</h3>
                    <p className="text-xs text-foreground/60">Add a competing squad to the championship</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterTeamSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phoenix Smashers"
                    value={teamForm.teamName}
                    onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Captain Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={teamForm.captainName}
                    onChange={(e) => setTeamForm({ ...teamForm, captainName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={teamForm.contactPhone}
                      onChange={(e) => setTeamForm({ ...teamForm, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Contact Email</label>
                    <input
                      type="email"
                      placeholder="captain@example.com"
                      value={teamForm.contactEmail}
                      onChange={(e) => setTeamForm({ ...teamForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground/70">Registration Fee</span>
                  <span className="font-black text-primary">₹{championship?.teamRegistrationFee || 0}</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTeamModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={teamSubmitting || !teamForm.teamName}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
                  >
                    {teamSubmitting ? "Registering..." : "Confirm Registration"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER PLAYER */}
        {isAddPlayerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div
              className="w-full max-w-md rounded-3xl border p-6 space-y-6 shadow-2xl relative"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Register Player to Pool</h3>
                    <p className="text-xs text-foreground/60">Add a player to the auction / draft pool</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddPlayerModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterPlayerSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Virat K"
                    value={playerForm.fullName}
                    onChange={(e) => setPlayerForm({ ...playerForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Phone</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={playerForm.phone}
                      onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Email</label>
                    <input
                      type="email"
                      placeholder="player@example.com"
                      value={playerForm.email}
                      onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Category Tier *</label>
                  <select
                    value={playerForm.categoryId}
                    onChange={(e) => {
                      const catId = Number(e.target.value);
                      const cat = championship?.categories?.find((c) => c.categoryId === catId);
                      setPlayerForm({
                        ...playerForm,
                        categoryId: catId,
                        basePrice: cat?.basePrice || 0,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                    style={{ borderColor: "var(--athlon-border)" }}
                  >
                    <option value={0}>Select Category Tier</option>
                    {championship?.categories?.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name} ({c.basePrice} pts base)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Base Price (pts / ₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={playerForm.basePrice}
                    onChange={(e) => setPlayerForm({ ...playerForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-bold outline-none focus:border-primary"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPlayerModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={playerSubmitting || !playerForm.fullName}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
                  >
                    {playerSubmitting ? "Registering..." : "Add to Pool"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ADD CUSTOM POINT BUMP MODAL (ON-DEMAND - WORKS IN BOTH REGULAR AND MAXIMIZE FULLSCREEN) */}
        {isCustomBumpModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div
              className="w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl animate-scaleUp"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Add Custom Point Increment</h3>
                    <p className="text-xs text-foreground/60">Create a new live bidding point bump for team owners</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomBumpModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseInt(customBumpInput);
                  if (!isNaN(val) && val > 0) {
                    const newAvailable = Array.from(new Set([...availablePointBumps, val])).sort((a, b) => a - b);
                    const nextBumps = Array.from(new Set([...selectedPointBumps, val])).sort((a, b) => a - b);
                    handleUpdateAuctionSettings("AUTOMATIC", undefined, nextBumps, newAvailable);
                    setCustomBumpInput("");
                    setIsCustomBumpModalOpen(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-foreground/70 block">
                    Point Bump Amount (pts)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      autoFocus
                      required
                      placeholder="e.g. 300, 750, 1500..."
                      value={customBumpInput}
                      onChange={(e) => setCustomBumpInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border bg-background text-foreground font-mono font-black text-lg outline-none focus:border-primary pr-14 shadow-inner"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-mono font-bold text-foreground/40 pointer-events-none">
                      pts
                    </span>
                  </div>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block">
                    Popular Increments
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[150, 300, 400, 750, 1500, 2500, 3000, 5000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setCustomBumpInput(preset.toString())}
                        className="px-2.5 py-1 rounded-lg bg-surface hover:bg-primary/20 hover:text-primary border border-foreground/10 text-xs font-mono font-bold transition-all"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <button
                    type="button"
                    onClick={() => setIsCustomBumpModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customBumpInput || parseInt(customBumpInput) <= 0}
                    className="px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black hover:scale-102 active:scale-98 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add & Broadcast Bump</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
