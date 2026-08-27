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
} from "lucide-react";
import Link from "next/link";
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

  // Load Team Audit
  useEffect(() => {
    if (selectedTeamForAudit && championship?.championshipId) {
      TeamChampionshipService.getSquadAudit(selectedTeamForAudit, championship.championshipId)
        .then(setTeamAudit)
        .catch(console.error);
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

  const handleTogglePauseTimer = async () => {
    if (!championship?.championshipId) return;
    try {
      if (isTimerPaused) {
        const updated = await AuctionService.resumeTimer(championship.championshipId);
        setAuctionState(updated);
      } else {
        const updated = await AuctionService.pauseTimer(championship.championshipId);
        setAuctionState(updated);
      }
    } catch (err: any) {
      console.error("Failed to toggle timer pause:", err);
      alert(err.message || "Failed to toggle timer pause");
    }
  };

  // Sync active player details into manual lock desk
  useEffect(() => {
    if (auctionState?.activePlayer) {
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
    }
  }, [auctionState?.activePlayer?.auctionPlayerId, auctionState?.currentBid, auctionState?.winningTeamId]);

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
                  ? "fixed inset-0 z-[9999] bg-background w-screen h-screen overflow-y-auto p-4 sm:p-8 space-y-6 selection:bg-primary selection:text-black"
                  : "space-y-6"
              }
            >
              {/* 1. Live Broadcast Stage Switcher & Projector Header */}
              <div
                className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${isAuctionLive
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
                          ? "🔴 LIVE AUCTION ARENA (BROADCASTING)"
                          : isAuctionPaused
                            ? "⏸️ LIVE AUCTION PAUSED (OFF-AIR)"
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
                    <p className="text-xs text-foreground/60 mt-0.5">
                      {isAuctionLive
                        ? "Auction is currently live! All users and spectators can watch floor bids in real-time."
                        : isAuctionPaused
                          ? "The auction is paused. Spectators and users see a 'Session Paused' standby screen and cannot view bids until resumed."
                          : "Click 'Start Live Auction' to open the bidding floor and broadcast live to spectators."}
                    </p>
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT 9 COLS: MAXIMUM SIZE PLAYER CALL FLOOR SPOTLIGHT & MANUAL BIDDING PAD */}
                <div className="lg:col-span-9 flex flex-col">
                  <div
                    className="h-[620px] max-h-[calc(100vh-210px)] rounded-3xl border shadow-2xl relative overflow-y-auto overflow-x-hidden flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 custom-scrollbar"
                    style={{
                      backgroundColor: "var(--athlon-card)",
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
                      <div className="flex-1 flex flex-col justify-between py-2 space-y-3 relative z-10">
                        {/* 2. GRAND ATHLETE SPOTLIGHT HERO CARD (MAXIMUM HIGHLIGHT & SCALE) */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-surface/90 via-surface/70 to-surface/50 backdrop-blur-xl border shadow-2xl flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative overflow-hidden" style={{ borderColor: "var(--athlon-border)" }}>

                          {/* Ambient Spotlight Flare behind Athlete */}
                          <div className="absolute top-1/2 left-16 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-0" />

                          {/* Left: Extra Large Athlete Avatar & Identity */}
                          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6 flex-1 min-w-0 relative z-10">
                            {/* Grand Avatar Spotlight Frame */}
                            <div className="relative shrink-0 group">
                              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-primary/40 via-indigo-500/30 to-amber-400/30 border-3 border-primary p-1 flex items-center justify-center shadow-2xl shadow-primary/35 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                {activePlayer.avatarUrl ? (
                                  <img src={activePlayer.avatarUrl} alt={activePlayer.playerName} className="w-full h-full object-cover rounded-[20px]" />
                                ) : (
                                  <span className="text-4xl sm:text-5xl font-black text-primary tracking-wider drop-shadow-md">
                                    {activePlayer.playerName.substring(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-xl bg-black/95 border-2 border-primary text-xs font-mono font-black text-primary shadow-xl">
                                #{activePlayer.auctionPlayerId}
                              </span>
                            </div>

                            {/* Massive Athlete Metadata & Name Highlight */}
                            <div className="text-center sm:text-left space-y-2 min-w-0">
                              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <span className="px-3.5 py-1 rounded-xl bg-primary/20 text-primary border border-primary/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                                  <span>{activePlayer.categoryName || activeCategory?.name || "Category Phase"}</span>
                                </span>
                              </div>

                              {/* Colossal High-Impact Player Name */}
                              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight truncate drop-shadow-md leading-tight">
                                {activePlayer.playerName}
                              </h2>

                              {/* Refined Compact Base Price Pill */}
                              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5">
                                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-bold flex items-center gap-1.5 shadow-sm">
                                  <span className="text-primary/60 text-[10px] uppercase font-black">Base Price:</span>
                                  <strong className="font-mono font-black text-xs">{activePlayerBasePrice} pts</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Live Bidding HUD (High Bid + Countdown Timer - Identical Dimensions) */}
                          <div className="flex items-center gap-3 shrink-0 self-center md:self-center relative z-10">
                            {/* Current High Bid Box */}
                            <div
                              className="text-center bg-background/90 px-4 py-3 rounded-2xl border w-36 sm:w-40 shadow-xl flex flex-col justify-between min-h-[92px]"
                              style={{ borderColor: "var(--athlon-border)" }}
                            >
                              <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-0.5">
                                Current High Bid
                              </span>
                              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary font-mono block leading-none my-auto">
                                {auctionState?.currentBid || activePlayerBasePrice}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-foreground/40 mt-0.5 block uppercase">
                                Points
                              </span>
                            </div>

                            {/* Interactive Click-to-Pause/Resume Timer Container Button (Identical Dimensions) */}
                            <button
                              type="button"
                              onClick={handleTogglePauseTimer}
                              className={`text-center px-4 py-3 rounded-2xl border w-36 sm:w-40 shadow-xl transition-colors duration-150 cursor-pointer select-none group flex flex-col justify-between min-h-[92px] ${isTimerPaused
                                ? "bg-amber-500/15 border-amber-400/80 hover:border-emerald-400 hover:bg-emerald-500/15 shadow-amber-500/10"
                                : "bg-background/90 hover:bg-surface border-foreground/10 hover:border-amber-400/80"
                                }`}
                              style={{ borderColor: isTimerPaused ? "#f59e0b" : "var(--athlon-border)" }}
                              title={
                                isTimerPaused
                                  ? "Timer is paused. Click anywhere on this box to Resume!"
                                  : "Timer is running. Click anywhere on this box to Pause!"
                              }
                            >
                              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                {isTimerPaused ? (
                                  <>
                                    <Play className="w-3 h-3 text-emerald-400 fill-current animate-pulse shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                                      PAUSED
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-3 h-3 text-amber-400/70 group-hover:text-amber-400 transition-colors shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 group-hover:text-amber-400 transition-colors">
                                      Timer
                                    </span>
                                  </>
                                )}
                              </div>

                              <span
                                className={`text-2xl sm:text-3xl lg:text-4xl font-black font-mono block leading-none my-auto ${isTimerPaused ? "text-amber-300" : "text-amber-400 animate-pulse"
                                  }`}
                              >
                                {auctionState?.remainingTimerSeconds ?? 30}s
                              </span>

                              <span className="text-[10px] font-black uppercase mt-0.5 block transition-colors text-foreground/40 group-hover:text-amber-400">
                                {isTimerPaused ? "Resume" : "Pause"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* 3. BIDDING MODE CONTROLS & DESK (Compact & Non-Scrollable) */}
                        <div
                          className="p-3.5 sm:p-4 rounded-2xl border space-y-3 shadow-md bg-surface/50 backdrop-blur-sm"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          {/* Segmented Mode Selector Tab */}
                          <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background border" style={{ borderColor: "var(--athlon-border)" }}>
                              <button
                                onClick={() => handleUpdateAuctionSettings("MANUAL")}
                                className={`px-3 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 ${auctionBiddingMode === "MANUAL"
                                  ? "bg-primary text-black shadow-sm"
                                  : "text-foreground/60 hover:text-foreground hover:bg-surface"
                                  }`}
                              >
                                <span>✋ Manual Bidding</span>
                              </button>
                              <button
                                onClick={() => handleUpdateAuctionSettings("AUTOMATIC")}
                                className={`px-3 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 ${auctionBiddingMode === "AUTOMATIC"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-sm"
                                  : "text-foreground/60 hover:text-foreground hover:bg-surface"
                                  }`}
                              >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>Automatic Live Bidding</span>
                              </button>
                            </div>

                            <button
                              onClick={() => setIsPurseModalOpen(true)}
                              className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1 shrink-0"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>Check Purses</span>
                            </button>
                          </div>

                          {/* ======================================================== */}
                          {/* MODE 1: MANUAL BIDDING DESK (Direct Points & Map to Team) */}
                          {/* ======================================================== */}
                          {auctionBiddingMode === "MANUAL" && (
                            <div className="space-y-3 animate-fadeIn">
                              {/* Inputs: Locked Points & Map To Team */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-black uppercase text-foreground/60 block mb-1">
                                    Final Locked Points
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={manualWinningBid || ""}
                                      onChange={(e) => setManualWinningBid(Number(e.target.value))}
                                      placeholder="Enter final points..."
                                      className="w-full px-3 py-2 rounded-xl border bg-background text-foreground font-mono font-black text-sm outline-none focus:border-primary"
                                      style={{ borderColor: "var(--athlon-border)" }}
                                    />
                                    <span className="absolute right-3 top-2 text-xs font-bold text-foreground/40 pointer-events-none">
                                      pts
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-black uppercase text-foreground/60 block mb-1">
                                    Map to Franchise Team
                                  </label>
                                  <select
                                    value={manualWinningTeamId || ""}
                                    onChange={(e) => setManualWinningTeamId(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl border bg-background text-foreground font-black text-xs outline-none focus:border-primary"
                                    style={{ borderColor: "var(--athlon-border)" }}
                                  >
                                    <option value="">-- Select Team --</option>
                                    {auctionTeams.map((at) => (
                                      <option key={at.team.teamId} value={at.team.teamId}>
                                        {at.team.teamName} (Purse: {at.team.remainingBudget} pts)
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Action CTA Buttons */}
                              <div className="flex items-center gap-2.5 pt-0.5">
                                <button
                                  onClick={handleAssignPlayerManual}
                                  disabled={assigningLoading || !manualWinningTeamId}
                                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                  <Gavel className="w-4 h-4" />
                                  <span>{assigningLoading ? "Processing..." : "🔨 SOLD & MAP TO TEAM"}</span>
                                </button>

                                <button
                                  onClick={handleMarkUnsold}
                                  className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-black text-xs hover:bg-red-500/20 transition-all"
                                >
                                  UNSOLD
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ======================================================== */}
                          {/* MODE 2: AUTOMATIC LIVE ONLINE BIDDING DESK                */}
                          {/* ======================================================== */}
                          {auctionBiddingMode === "AUTOMATIC" && (
                            <div className="space-y-3 animate-fadeIn">
                              {/* 1. Countdown Timer Duration Setting (Collapsible on Demand) */}
                              {!isTimerConfigOpen ? (
                                /* Compact Collapsed Badge */
                                <div
                                  className="flex items-center justify-between p-2 px-3 rounded-xl bg-background border transition-all hover:border-amber-400/40"
                                  style={{ borderColor: "var(--athlon-border)" }}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="text-xs font-black text-foreground">
                                      Timer: <strong className="text-amber-400 font-mono">{timerDurationSeconds}s</strong>
                                    </span>
                                    <span className="text-[10px] text-foreground/40 hidden sm:inline font-semibold truncate">
                                      • Restarts from {timerDurationSeconds}s on each bid
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => setIsTimerConfigOpen(true)}
                                    className="px-2.5 py-1 rounded-lg bg-surface hover:bg-white/10 text-foreground font-black text-[10px] border border-foreground/15 transition-all flex items-center gap-1 shadow-sm shrink-0"
                                  >
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    <span>Adjust Timer</span>
                                  </button>
                                </div>
                              ) : (
                                /* Expanded Config Panel */
                                <div className="space-y-2 p-3 rounded-xl bg-background border animate-fadeIn" style={{ borderColor: "var(--athlon-border)" }}>
                                  <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                                    <span className="text-[10px] font-black uppercase text-foreground/80 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Adjust Timer Countdown Duration
                                    </span>
                                    <button
                                      onClick={() => setIsTimerConfigOpen(false)}
                                      className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-surface transition-all"
                                      title="Close timer settings"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {availableTimerPresets.map((sec) => (
                                      <button
                                        key={sec}
                                        onClick={() => {
                                          handleUpdateAuctionSettings("AUTOMATIC", sec);
                                          setIsTimerConfigOpen(false);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition-all ${timerDurationSeconds === sec
                                          ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 scale-105"
                                          : "bg-surface text-foreground/60 border border-foreground/10 hover:bg-surface/80"
                                          }`}
                                      >
                                        {sec}s {sec === 60 ? "(Default)" : ""}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Custom Timer Seconds Input */}
                                  <div className="flex items-center gap-1.5 pt-1 border-t" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                                    <input
                                      type="number"
                                      placeholder="Custom seconds (e.g. 40)..."
                                      value={customTimerInput}
                                      onChange={(e) => setCustomTimerInput(e.target.value)}
                                      className="px-2.5 py-1 text-xs rounded-lg border bg-surface text-foreground font-mono w-40 outline-none focus:border-amber-400"
                                      style={{ borderColor: "var(--athlon-border)" }}
                                    />
                                    <button
                                      onClick={() => {
                                        const val = parseInt(customTimerInput);
                                        if (!isNaN(val) && val > 0) {
                                          const updatedTimers = Array.from(new Set([...availableTimerPresets, val])).sort((a, b) => a - b);
                                          handleUpdateAuctionSettings("AUTOMATIC", val, undefined, undefined, updatedTimers);
                                          setCustomTimerInput("");
                                          setIsTimerConfigOpen(false);
                                        }
                                      }}
                                      className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-lg transition-all"
                                    >
                                      Set Timer
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 2. Unified Franchise Point Bumps (Broadcasted to Owners) */}
                              <div className="space-y-2 p-3 rounded-xl bg-background border" style={{ borderColor: "var(--athlon-border)" }}>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Coins className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="text-[10px] font-black uppercase text-foreground/80 truncate">
                                      Franchise Point Bumps
                                    </span>
                                    <span className="text-[10px] text-foreground/50 font-bold ml-1 shrink-0">
                                      (<strong className="text-primary font-mono">{selectedPointBumps.length}</strong> Active)
                                    </span>
                                  </div>

                                  {/* Corner Add Custom Bump Button (Opens Modal) */}
                                  <button
                                    onClick={() => {
                                      setCustomBumpInput("");
                                      setIsCustomBumpModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg font-black text-[10px] border bg-surface hover:bg-white/10 text-foreground border-foreground/15 transition-all flex items-center gap-1 shrink-0 shadow-sm hover:border-primary/50"
                                    title="Open modal to add custom point increment"
                                  >
                                    <Plus className="w-3 h-3 text-primary" />
                                    <span>Add Custom</span>
                                  </button>
                                </div>

                                {/* Unified Clickable Point Bump Pills */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {availablePointBumps.map((inc) => {
                                    const isSelected = selectedPointBumps.includes(inc);
                                    return (
                                      <button
                                        key={inc}
                                        onClick={() => {
                                          let nextBumps: number[];
                                          if (isSelected) {
                                            if (selectedPointBumps.length <= 1) {
                                              alert("You must keep at least 1 point bump active.");
                                              return;
                                            }
                                            nextBumps = selectedPointBumps.filter((b) => b !== inc);
                                          } else {
                                            nextBumps = [...selectedPointBumps, inc].sort((a, b) => a - b);
                                          }
                                          handleUpdateAuctionSettings("AUTOMATIC", undefined, nextBumps);
                                        }}
                                        className={`px-3 py-1 rounded-xl font-mono font-black text-xs transition-all flex items-center gap-1 shadow-sm ${isSelected
                                          ? "bg-primary text-black shadow-primary/20 scale-105"
                                          : "bg-surface text-foreground/50 border border-foreground/10 hover:border-primary/40 hover:text-foreground"
                                          }`}
                                        title={isSelected ? "Active - Click to remove" : "Inactive - Click to activate"}
                                      >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        <span>+{inc}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Action CTA Buttons in Automatic Mode */}
                              <div className="flex items-center gap-2.5 pt-0.5">
                                <button
                                  onClick={handleAssignPlayerManual}
                                  disabled={assigningLoading || !auctionState?.winningTeamId}
                                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                  <Gavel className="w-4 h-4" />
                                  <span>
                                    {assigningLoading
                                      ? "Processing..."
                                      : auctionState?.winningTeamName
                                        ? `🔨 SEAL & MAP TO ${auctionState.winningTeamName.toUpperCase()}`
                                        : "WAITING FOR FIRST FRANCHISE BID"}
                                  </span>
                                </button>

                                <button
                                  onClick={handleMarkUnsold}
                                  className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-black text-xs hover:bg-red-500/20 transition-all"
                                >
                                  UNSOLD
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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

                {/* RIGHT 3 COLS: COMPACT CATEGORY PLAYERS TRAY & QUEUE */}
                <div className="lg:col-span-3 flex flex-col">
                  <div
                    className="h-[620px] max-h-[calc(100vh-210px)] rounded-3xl border shadow-md flex flex-col p-4 justify-between overflow-y-auto overflow-x-hidden custom-scrollbar"
                    style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="flex items-center justify-between border-b pb-3 shrink-0" style={{ borderColor: "var(--athlon-border)" }}>
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

                    {/* Scrollable Athlete List Container (Exact Matching Height with Internal Scroll) */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1.5 pr-0.5 mt-2">
                      {categoryPlayers.length === 0 ? (
                        <div className="p-6 rounded-2xl border border-dashed text-center text-xs text-foreground/40 font-bold uppercase">
                          No athletes in this category.
                        </div>
                      ) : (
                        categoryPlayers.map((p) => {
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
                                  <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase block group-hover:hidden">
                                    Unsold
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-foreground/30 group-hover:text-primary font-black opacity-0 group-hover:opacity-100 transition-all">
                                    Call 🔨
                                  </span>
                                )}

                                {isUnsold && (
                                  <span className="text-[9px] font-black text-amber-400 hidden group-hover:inline-block">
                                    Re-Call 🔨
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
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
            </div>
          );
        })()}

        {/* TAB 5: SQUADS & PARTICIPATION AUDIT */}
        {activeTab === "squads" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Picker Sidebar */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground/70 mb-3">Select Team</h4>
              {teams.map((t) => (
                <button
                  key={t.teamId}
                  onClick={() => setSelectedTeamForAudit(t.teamId)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${selectedTeamForAudit === t.teamId
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "bg-card border-foreground/10 text-foreground/70 hover:border-foreground/20"
                    }`}
                  style={{ backgroundColor: selectedTeamForAudit === t.teamId ? undefined : "var(--athlon-card)" }}
                >
                  <span className="text-xs font-black">{t.teamName}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Squad Members & Audit Result */}
            <div
              className="md:col-span-2 rounded-3xl border p-6 space-y-6"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              {teamAudit ? (
                <>
                  <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <div>
                      <h3 className="text-lg font-black text-foreground">{teamAudit.teamName} Squad</h3>
                      <p className="text-xs text-foreground/60">
                        {teamAudit.playersCount} / {teamAudit.squadCapacity} Players Acquired
                      </p>
                    </div>

                    {/* Every Player Must Play Status Badge */}
                    <div>
                      {teamAudit.everyPlayerHasPlayedLeague ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-black uppercase flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> All Players Participated
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs font-black uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> {teamAudit.unplayedPlayers.length} Unplayed Players
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Player Cards */}
                  <div className="space-y-2.5">
                    {teamAudit.players.map((sp) => (
                      <div
                        key={sp.squadId}
                        className="p-3.5 rounded-2xl border flex items-center justify-between text-xs"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${sp.matchesPlayedCount > 0 ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                          />
                          <div>
                            <h4 className="font-black text-foreground">{sp.playerName}</h4>
                            <span className="text-[10px] text-foreground/50">
                              {sp.categoryName || "Open"} • Acquired via <strong>{sp.acquisitionType}</strong> (
                              {sp.purchasePrice} pts)
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${sp.matchesPlayedCount > 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-foreground/5 text-foreground/40 border border-foreground/10"
                            }`}
                        >
                          {sp.matchesPlayedCount > 0 ? "Played" : "Not Played"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-foreground/40">Select a team to view squad details.</div>
              )}
            </div>
          </div>
        )}

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
        {/* ADD CUSTOM POINT BUMP MODAL */}
        {isCustomBumpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
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
