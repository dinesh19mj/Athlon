"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Shield,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  Gavel,
  Users,
  Coins,
  Clock,
  Settings,
  Flame,
  Award,
  DollarSign,
  HelpCircle,
  Edit3,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { TeamChampionshipService } from "@/lib/api/teamChampionship";
import { OrganizationService } from "@/lib/api/organization";
import { useAuthStore } from "@/lib/store/useAuthStore";

const WIZARD_STEPS = [
  { id: 1, title: "Basic Info", icon: Trophy },
  { id: 2, title: "Auction Setup", icon: Gavel },
  { id: 3, title: "Player Fees", icon: DollarSign },
  { id: 4, title: "Team Rules", icon: Users },
  { id: 5, title: "Categories", icon: Award },
  { id: 6, title: "Match Formats", icon: Flame },
  { id: 7, title: "Events Matrix", icon: Settings },
  { id: 8, title: "Pools & Qualifiers", icon: Shield },
  { id: 9, title: "Match Rules", icon: Clock },
  { id: 10, title: "Review & Publish", icon: Check },
];

const SPORT_MATCH_FORMATS: Record<string, Array<{ name: string; playersPerSide: number }>> = {
  Badminton: [
    { name: "Men's Doubles", playersPerSide: 2 },
    { name: "Men's Singles", playersPerSide: 1 },
    { name: "Mixed Doubles", playersPerSide: 2 },
    { name: "Women's Doubles", playersPerSide: 2 },
    { name: "Women's Singles", playersPerSide: 1 },
  ],
  Cricket: [
    { name: "T20 Match (11-a-side)", playersPerSide: 11 },
    { name: "T10 Match (11-a-side)", playersPerSide: 11 },
    { name: "8-a-side Box Cricket", playersPerSide: 8 },
    { name: "6-a-side Gully Cricket", playersPerSide: 6 },
  ],
  Football: [
    { name: "11-a-side Full Match", playersPerSide: 11 },
    { name: "7-a-side Football", playersPerSide: 7 },
    { name: "5-a-side Futsal", playersPerSide: 5 },
  ],
  Volleyball: [
    { name: "6-a-side Standard", playersPerSide: 6 },
    { name: "4-a-side Volleyball", playersPerSide: 4 },
    { name: "2-a-side Beach Volleyball", playersPerSide: 2 },
  ],
  Basketball: [
    { name: "5-a-side Full Court", playersPerSide: 5 },
    { name: "3x3 Half Court", playersPerSide: 3 },
  ],
  "Table Tennis": [
    { name: "Men's Singles", playersPerSide: 1 },
    { name: "Women's Singles", playersPerSide: 1 },
    { name: "Men's Doubles", playersPerSide: 2 },
    { name: "Women's Doubles", playersPerSide: 2 },
    { name: "Mixed Doubles", playersPerSide: 2 },
  ],
  Tennis: [
    { name: "Men's Singles", playersPerSide: 1 },
    { name: "Women's Singles", playersPerSide: 1 },
    { name: "Men's Doubles", playersPerSide: 2 },
    { name: "Women's Doubles", playersPerSide: 2 },
    { name: "Mixed Doubles", playersPerSide: 2 },
  ],
  Squash: [
    { name: "Men's Singles", playersPerSide: 1 },
    { name: "Women's Singles", playersPerSide: 1 },
    { name: "Doubles", playersPerSide: 2 },
  ],
  Pickleball: [
    { name: "Men's Singles", playersPerSide: 1 },
    { name: "Women's Singles", playersPerSide: 1 },
    { name: "Men's Doubles", playersPerSide: 2 },
    { name: "Women's Doubles", playersPerSide: 2 },
    { name: "Mixed Doubles", playersPerSide: 2 },
  ],
};

export default function CreateTeamChampionshipPage() {
  const router = useRouter();
  const params = useParams();
  const orgUuid = params.orgId as string;
  const { userId, userUuid } = useAuthStore();
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);

  useEffect(() => {
    const loadOrg = async () => {
      try {
        const res = await OrganizationService.getById(orgUuid);
        if (res && res.data) {
          setOrgData(res.data);
        }
      } catch (err) {
        console.error("Failed to load organization", err);
      }
    };
    loadOrg();
  }, [orgUuid]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic
    name: "",
    description: "",
    sport: "Badminton",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "18:00",
    registrationClosingDate: "",
    registrationClosingTime: "23:59",
    venue: "",
    location: "",
    mapLink: "",
    contactPhone: "",
    maxTeams: 8,
    teamRegistrationFee: 0,
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    posterPreview: "",

    // Step 2: Categories (Classification)
    categories: [] as Array<{
      name: string;
      code: string;
      description?: string;
      basePrice: number;
      registrationFee: number;
      playersNeeded: number;
    }>,

    // Step 3: Match Formats
    matchFormats: [] as Array<{
      name: string;
      playersPerSide: number;
    }>,

    // Step 4: Competition Events (Selected Category + Format matrix)
    events: [] as Array<{
      categoryName: string;
      formatName: string;
      eventName: string;
      pointsWeight: number;
    }>,

    // Step 5: Team Rules
    minSquadSize: 6,
    maxSquadSize: 12,
    everyPlayerMustPlayLeague: true,

    // Step 6: Player Registration
    playerFeeMode: "CATEGORY_PAID" as "FREE" | "GLOBAL_PAID" | "CATEGORY_PAID",
    defaultPlayerFee: 200,

    // Step 7: Auction Configuration
    auctionMode: "FULL_AUCTION" as "FULL_AUCTION" | "PARTIAL_AUCTION" | "NO_AUCTION",
    currencyType: "POINTS" as "POINTS" | "REAL_MONEY",
    currencySymbolOrLabel: "pts",
    basePriceStrategy: "CATEGORY_BASED" as "CATEGORY_BASED" | "FIXED_GLOBAL" | "CUSTOM",
    defaultBasePrice: 2000,
    bidIncrement: 500,
    teamBudget: 50000,
    reservedPlayersPerTeam: 2,
    timerSeconds: 30,
    antiSnipingSeconds: 10,

    // Step 8: Pool & Qualification
    numberOfPools: 2,
    qualifiersPerPool: 2,
    poolsList: [
      { name: "Pool A", qualifiers: 2 },
      { name: "Pool B", qualifiers: 2 },
    ] as Array<{ name: string; qualifiers: number }>,

    // Step 9: Match & Lineup Rules (Separated by League & Knockouts)
    leagueMatchFormat: "PLAY_ALL" as "PLAY_ALL" | "BEST_OF_N",
    leagueWinPoints: 2,
    leagueDrawPoints: 1,
    leagueLossPoints: 0,
    leagueMaxSubstitutions: 2,
    leagueLineupDeadlineMinutes: 30,
    leagueTossOrderRule: "ORGANIZER_DEFINED" as "ORGANIZER_DEFINED" | "TEAM_PREFERENCE_PLUS_TOSS",
    leagueLineupRevealPolicy: "SIMULTANEOUS_REVEAL" as "SIMULTANEOUS_REVEAL" | "AFTER_APPROVAL",

    knockoutMatchFormat: "BEST_OF_N" as "PLAY_ALL" | "BEST_OF_N",
    knockoutMaxSubstitutions: 1,
    knockoutLineupDeadlineMinutes: 30,
    knockoutTossOrderRule: "TEAM_PREFERENCE_PLUS_TOSS" as "ORGANIZER_DEFINED" | "TEAM_PREFERENCE_PLUS_TOSS",
    knockoutLineupRevealPolicy: "SIMULTANEOUS_REVEAL" as "SIMULTANEOUS_REVEAL" | "AFTER_APPROVAL",

    allowSubstitutions: true,
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [rulesStageTab, setRulesStageTab] = useState<"LEAGUE" | "KNOCKOUT">("LEAGUE");

  // Step 2 Category handlers
  const [newCatName, setNewCatName] = useState("");
  const [newCatCode, setNewCatCode] = useState("");
  const [newCatPrice, setNewCatPrice] = useState(0);
  const [newCatFee, setNewCatFee] = useState(0);
  const [newCatPlayersNeeded, setNewCatPlayersNeeded] = useState<number>(0);

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const computedFee =
      formData.playerFeeMode === "FREE"
        ? 0
        : formData.playerFeeMode === "GLOBAL_PAID"
          ? formData.defaultPlayerFee
          : newCatFee;

    setFormData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          name: newCatName.trim(),
          code: newCatCode.trim() || newCatName.trim().substring(0, 3).toUpperCase(),
          description: "",
          basePrice: formData.auctionMode === "NO_AUCTION" ? 0 : newCatPrice,
          registrationFee: computedFee,
          playersNeeded: newCatPlayersNeeded || 0,
        },
      ],
    }));
    setNewCatName("");
    setNewCatCode("");
    setNewCatPrice(0);
    setNewCatFee(0);
    setNewCatPlayersNeeded(0);
  };

  const removeCategory = (index: number) => {
    const catToRemove = formData.categories[index];
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
      events: prev.events.filter((e) => e.categoryName !== catToRemove.name),
    }));
  };

  const applyCategoryPreset = (preset: Array<{ name: string; code: string; playersNeeded: number; basePrice?: number; registrationFee?: number }>) => {
    const computedFee = (fee?: number) =>
      formData.playerFeeMode === "FREE"
        ? 0
        : formData.playerFeeMode === "GLOBAL_PAID"
          ? formData.defaultPlayerFee
          : fee || formData.defaultPlayerFee;

    setFormData((prev) => ({
      ...prev,
      categories: preset.map((p) => ({
        name: p.name,
        code: p.code || p.name.substring(0, 3).toUpperCase(),
        description: "",
        basePrice: prev.auctionMode === "NO_AUCTION" ? 0 : (p.basePrice || prev.defaultBasePrice),
        registrationFee: computedFee(p.registrationFee),
        playersNeeded: p.playersNeeded || 0,
      })),
    }));
  };

  // Step 3 Match Format handlers
  const [newFormatName, setNewFormatName] = useState("");
  const [newFormatPlayers, setNewFormatPlayers] = useState(2);

  const addFormat = () => {
    if (!newFormatName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      matchFormats: [
        ...prev.matchFormats,
        { name: newFormatName.trim(), playersPerSide: newFormatPlayers },
      ],
    }));
    setNewFormatName("");
  };

  const removeFormat = (index: number) => {
    const fmtToRemove = formData.matchFormats[index];
    setFormData((prev) => ({
      ...prev,
      matchFormats: prev.matchFormats.filter((_, i) => i !== index),
      events: prev.events.filter((e) => e.formatName !== fmtToRemove.name),
    }));
  };

  // Step 4 Matrix toggle
  const isEventSelected = (catName: string, fmtName: string) => {
    return formData.events.some((e) => e.categoryName === catName && e.formatName === fmtName);
  };

  const toggleEvent = (catName: string, fmtName: string) => {
    setFormData((prev) => {
      const exists = prev.events.some((e) => e.categoryName === catName && e.formatName === fmtName);
      if (exists) {
        return {
          ...prev,
          events: prev.events.filter((e) => !(e.categoryName === catName && e.formatName === fmtName)),
        };
      } else {
        return {
          ...prev,
          events: [
            ...prev.events,
            {
              categoryName: catName,
              formatName: fmtName,
              eventName: `${catName} ${fmtName}`,
              pointsWeight: 1,
            },
          ],
        };
      }
    });
  };

  // Step 8 Pool handlers
  const setPoolTemplate = (count: number) => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const newPools = Array.from({ length: count }, (_, i) => ({
      name: `Pool ${letters[i] || i + 1}`,
      qualifiers: 2,
    }));
    setFormData((prev) => ({
      ...prev,
      numberOfPools: count,
      poolsList: newPools,
    }));
  };

  const addPool = () => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const nextLetter = letters[formData.poolsList.length] || `${formData.poolsList.length + 1}`;
    const newPool = { name: `Pool ${nextLetter}`, qualifiers: 2 };
    setFormData((prev) => {
      const nextList = [...prev.poolsList, newPool];
      return {
        ...prev,
        numberOfPools: nextList.length,
        poolsList: nextList,
      };
    });
  };

  const removePool = (index: number) => {
    if (formData.poolsList.length <= 1) return;
    setFormData((prev) => {
      const nextList = prev.poolsList.filter((_, i) => i !== index);
      return {
        ...prev,
        numberOfPools: nextList.length,
        poolsList: nextList,
      };
    });
  };

  const updatePool = (index: number, field: "name" | "qualifiers", value: any) => {
    setFormData((prev) => {
      const nextList = prev.poolsList.map((p, i) => (i === index ? { ...p, [field]: value } : p));
      return {
        ...prev,
        poolsList: nextList,
      };
    });
  };

  // Poster Handler
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, posterPreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Final Submission
  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      if (!orgData?.orgId) {
        throw new Error("Organization not loaded");
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        sport: formData.sport,
        startDate: formData.startDate ? `${formData.startDate}T${formData.startTime}:00` : undefined,
        endDate: formData.endDate ? `${formData.endDate}T${formData.endTime}:00` : undefined,
        registrationClosingDate: formData.registrationClosingDate
          ? `${formData.registrationClosingDate}T${formData.registrationClosingTime}:00`
          : undefined,
        organizerId: orgData.orgId,
        organizerUuid: orgUuid,
        userId: userId ? Number(userId) : undefined,
        userUuid: userUuid || undefined,
        venue: formData.venue,
        location: formData.location,
        mapLink: formData.mapLink,
        contactPhone: formData.contactPhone,
        posterUrl: posterFile ? undefined : (formData.posterPreview && !formData.posterPreview.startsWith("data:") ? formData.posterPreview : undefined),
        maxTeams: formData.maxTeams,
        teamRegistrationFee: formData.teamRegistrationFee,
        playerFeeMode: formData.playerFeeMode,
        defaultPlayerFee: formData.defaultPlayerFee,
        auctionMode: formData.auctionMode,
        visibility: formData.visibility,

        categories: formData.categories.map((c, idx) => ({
          name: c.name,
          code: c.code,
          description: c.description,
          displayOrder: idx + 1,
          basePrice: c.basePrice,
          registrationFee: c.registrationFee,
          maxPlayers: c.playersNeeded,
        })),

        matchFormats: formData.matchFormats.map((f, idx) => ({
          name: f.name,
          sport: formData.sport,
          playersPerSide: f.playersPerSide,
          displayOrder: idx + 1,
        })),

        events: formData.events.map((e, idx) => ({
          categoryName: e.categoryName,
          formatName: e.formatName,
          eventName: e.eventName,
          pointsWeight: e.pointsWeight,
          displayOrder: idx + 1,
          isMandatory: true,
        })),

        pools: formData.poolsList.map((p) => ({
          poolName: p.name,
          stage: "LEAGUE",
          qualifiersCount: p.qualifiers,
        })),

        rules: {
          minSquadSize: formData.minSquadSize,
          maxSquadSize: formData.maxSquadSize,
          everyPlayerMustPlayLeague: formData.everyPlayerMustPlayLeague,
          allowSubstitutions: formData.allowSubstitutions,

          // League Stage Rules
          leagueMatchFormat: formData.leagueMatchFormat,
          leagueWinPoints: formData.leagueWinPoints,
          leagueDrawPoints: formData.leagueDrawPoints,
          leagueLossPoints: formData.leagueLossPoints,
          leagueLineupDeadlineMinutes: formData.leagueLineupDeadlineMinutes,
          leagueTossOrderRule: formData.leagueTossOrderRule,
          leagueLineupRevealPolicy: formData.leagueLineupRevealPolicy,
          leagueMaxSubstitutions: formData.leagueMaxSubstitutions,

          // Knockout Stage Rules
          knockoutMatchFormat: formData.knockoutMatchFormat,
          knockoutLineupDeadlineMinutes: formData.knockoutLineupDeadlineMinutes,
          knockoutTossOrderRule: formData.knockoutTossOrderRule,
          knockoutLineupRevealPolicy: formData.knockoutLineupRevealPolicy,
          knockoutMaxSubstitutions: formData.knockoutMaxSubstitutions,

          // Legacy fields for backward compatibility
          lineupDeadlineMinutes: formData.leagueLineupDeadlineMinutes,
          tossOrderRule: formData.leagueTossOrderRule,
          lineupRevealPolicy: formData.leagueLineupRevealPolicy,
          maxSubstitutionsPerFixture: formData.leagueMaxSubstitutions,
        },

        auctionSetup: {
          auctionMode: formData.auctionMode,
          currencyType: formData.currencyType,
          currencySymbolOrLabel: formData.currencySymbolOrLabel,
          basePriceStrategy: formData.basePriceStrategy,
          defaultBasePrice: formData.defaultBasePrice,
          bidIncrement: formData.bidIncrement,
          teamBudget: formData.teamBudget,
          reservedPlayersPerTeam: formData.reservedPlayersPerTeam,
          timerSeconds: formData.timerSeconds,
          antiSnipingSeconds: formData.antiSnipingSeconds,
          categoryBasePrices: formData.categories.map((c) => ({
            categoryName: c.name,
            basePrice: c.basePrice,
            minIncrement: formData.bidIncrement,
          })),
        },
      };

      const multipartData = new FormData();
      multipartData.append("request", JSON.stringify(payload));
      if (posterFile) {
        multipartData.append("poster", posterFile);
      }

      const result = await TeamChampionshipService.create(multipartData);
      if (result && result.championshipUuid) {
        router.push(`/org/${orgUuid}/team-championship/${result.championshipUuid}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to create team championship");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* Top Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-4 flex items-center justify-between"
        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/org/${orgUuid}/tournaments`}
            className="p-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground">
              Create Team Championship
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-black">
          <span className="text-primary">Step {currentStep}</span>
          <span className="text-foreground/40">of {WIZARD_STEPS.length}</span>
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
          {WIZARD_STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 border ${isCurrent
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : isCompleted
                    ? "bg-primary/10 text-primary border-primary/25"
                    : "bg-surface text-foreground/50 border-foreground/10 hover:border-foreground/20"
                  }`}
                style={{
                  backgroundColor: isCurrent ? undefined : isCompleted ? undefined : "var(--athlon-card)",
                }}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${isCurrent
                    ? "bg-black/20 text-white"
                    : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/10 text-foreground/60"
                    }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                </div>
                <span className="hidden md:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6">
        <div
          className="rounded-2xl sm:rounded-3xl border p-4 sm:p-8 shadow-xl transition-all"
          style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
        >
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 1 — Basic Information</h2>
                <p className="text-xs text-foreground/60">Configure general championship details and visibility.</p>
              </div>

              <div className="space-y-4">
                {/* VISIBILITY */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-2">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: "PRIVATE",
                        label: "Private",
                        desc: "Me and players I invite can see this Tournament",
                      },
                      {
                        value: "PUBLIC",
                        label: "Public",
                        desc: "Anyone can discover and view this Tournament",
                      },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, visibility: opt.value as any })}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${formData.visibility === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-foreground/10 bg-surface hover:border-foreground/20"
                          }`}
                        style={{
                          backgroundColor:
                            formData.visibility === opt.value ? undefined : "var(--athlon-surface)",
                          borderColor:
                            formData.visibility === opt.value ? undefined : "var(--athlon-border)",
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.visibility === opt.value
                            ? "border-primary"
                            : "border-foreground/30"
                            }`}
                        >
                          {formData.visibility === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <div
                            className={`font-black text-xs ${formData.visibility === opt.value ? "text-primary" : "text-foreground"
                              }`}
                          >
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-foreground/45 mt-0.5">{opt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Open Championship 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Sport *
                    </label>
                    <select
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                      style={{ borderColor: "var(--athlon-border)" }}
                    >
                      <option value="Badminton">Badminton</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Football">Football</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Table Tennis">Table Tennis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Maximum Teams Limit
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={64}
                      value={formData.maxTeams}
                      onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Registration Closing Date
                    </label>
                    <input
                      type="date"
                      value={formData.registrationClosingDate}
                      onChange={(e) => setFormData({ ...formData, registrationClosingDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Team Entry Fee
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.teamRegistrationFee || ""}
                      onChange={(e) => setFormData({ ...formData, teamRegistrationFee: e.target.value === "" ? 0 : Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                    Venue & Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Star Badminton Arena, Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                    Championship Poster
                  </label>
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                  {formData.posterPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border aspect-[16/7] max-h-64" style={{ borderColor: "var(--athlon-border)" }}>
                      <img src={formData.posterPreview} alt="Championship Poster" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, posterPreview: "" })}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      className="w-full border-2 border-dashed rounded-2xl py-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ImageIcon className="w-6 h-6 text-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">
                          Tap to upload championship poster
                        </div>
                        <div className="text-[10px] text-foreground/40 mt-0.5">JPG, PNG or WEBP · Max 5MB</div>
                      </div>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                    Description & Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the championship, tournament rules, cash prizes, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Auction Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 2 — Auction Engine Configuration</h2>
                <p className="text-xs text-foreground/60">Configure bidding units (Points vs Money), budgets, timers, and auction modes.</p>
              </div>

              {/* Auction Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "FULL_AUCTION", title: "Full Auction", desc: "All players selected via auction bidding" },
                  { id: "PARTIAL_AUCTION", title: "Partial Auction", desc: "Reserved players locked + auction remaining" },
                  { id: "NO_AUCTION", title: "No Auction", desc: "Direct squad selection without bidding" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFormData({ ...formData, auctionMode: mode.id as any })}
                    className={`p-4 rounded-2xl border text-left transition-all ${formData.auctionMode === mode.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-foreground/10 bg-surface hover:border-foreground/20 text-foreground/80"
                      }`}
                  >
                    <h4 className="text-xs font-black uppercase tracking-wider">{mode.title}</h4>
                    <p className="text-[11px] text-foreground/60 mt-1">{mode.desc}</p>
                  </button>
                ))}
              </div>

              {formData.auctionMode !== "NO_AUCTION" && (
                <div className="space-y-4 pt-2">
                  {/* Currency Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                        Bidding Currency / Units *
                      </label>
                      <select
                        value={formData.currencyType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currencyType: e.target.value as any,
                            currencySymbolOrLabel: e.target.value === "POINTS" ? "pts" : "₹",
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                        style={{ borderColor: "var(--athlon-border)" }}
                      >
                        <option value="POINTS">Points (e.g. 50,000 pts)</option>
                        <option value="REAL_MONEY">Money (e.g. ₹50,000)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                        Team Purse Budget ({formData.currencySymbolOrLabel}) *
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.teamBudget || ""}
                        onChange={(e) => setFormData({ ...formData, teamBudget: e.target.value === "" ? 0 : Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                        style={{ borderColor: "var(--athlon-border)" }}
                      />
                    </div>
                  </div>

                  {formData.auctionMode === "PARTIAL_AUCTION" && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                        Reserved Players Allowed Per Team
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={formData.maxSquadSize - 1}
                        value={formData.reservedPlayersPerTeam}
                        onChange={(e) => setFormData({ ...formData, reservedPlayersPerTeam: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                        style={{ borderColor: "var(--athlon-border)" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Player Registration Config */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 3 — Player Registration Fees</h2>
                <p className="text-xs text-foreground/60">Configure pricing and payment models for individual player registrations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "FREE", title: "Free Registration", desc: "No entry fee charged to players" },
                  { id: "GLOBAL_PAID", title: "Fixed Global Fee", desc: "Same fee for all players" },
                  { id: "CATEGORY_PAID", title: "Per-Category Pricing", desc: "Different fee based on category tier" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFormData({ ...formData, playerFeeMode: mode.id as any })}
                    className={`p-4 rounded-2xl border text-left transition-all ${formData.playerFeeMode === mode.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-foreground/10 bg-surface hover:border-foreground/20 text-foreground/80"
                      }`}
                  >
                    <h4 className="text-xs font-black uppercase tracking-wider">{mode.title}</h4>
                    <p className="text-[11px] text-foreground/60 mt-1">{mode.desc}</p>
                  </button>
                ))}
              </div>

              {formData.playerFeeMode === "GLOBAL_PAID" && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                    Player Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.defaultPlayerFee || ""}
                    onChange={(e) => setFormData({ ...formData, defaultPlayerFee: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Team Rules */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 4 — Team & Squad Rules</h2>
                <p className="text-xs text-foreground/60">Configure squad sizes and league participation mandates.</p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                  Squad Size (Fixed Players Per Team) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={2}
                    placeholder="e.g. 10"
                    value={formData.maxSquadSize || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value);
                      setFormData({
                        ...formData,
                        minSquadSize: val,
                        maxSquadSize: val,
                      });
                    }}
                    className="w-full pl-4 pr-32 py-3 rounded-xl border bg-background text-sm font-semibold text-foreground focus:border-primary outline-none"
                    style={{ borderColor: "var(--athlon-border)" }}
                  />
                  <span className="absolute right-4 text-xs font-bold text-foreground/40 pointer-events-none">
                    players / team
                  </span>
                </div>
                <p className="text-[11px] text-foreground/50 mt-1.5">
                  Every team in this championship will register exactly this fixed number of squad players.
                </p>
              </div>

              {/* Participation Rule Toggle */}
              <div
                className="p-5 rounded-2xl border space-y-2 flex items-start gap-3"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                <input
                  type="checkbox"
                  id="everyPlayerMustPlay"
                  checked={formData.everyPlayerMustPlayLeague}
                  onChange={(e) => setFormData({ ...formData, everyPlayerMustPlayLeague: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <div>
                  <label htmlFor="everyPlayerMustPlay" className="text-sm font-black text-foreground cursor-pointer">
                    Every Registered Player Must Play in League Stage
                  </label>
                  <p className="text-xs text-foreground/60 leading-relaxed mt-0.5">
                    When enabled, the system automatically audits lineups and flags warning badges if any squad member
                    has not participated before the league stage concludes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Categories (Classification) */}
          {currentStep === 5 && (() => {
            const totalQuota = formData.categories.reduce((acc, c) => acc + (c.playersNeeded || 0), 0);
            const targetCapacity = formData.maxTeams * formData.maxSquadSize;

            return (
              <div className="space-y-6">
                <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <div>
                    <h2 className="text-lg font-black text-foreground">Step 5 — Categories (Player Classification)</h2>
                    <p className="text-xs text-foreground/60">
                      Define classification tiers (e.g. Open, C Level, 70+, Under 18) with registration quotas
                      {formData.auctionMode !== "NO_AUCTION" && ` and auction Base Prices`}.
                    </p>
                  </div>
                </div>

                {/* 1. Category & Auction Pool Overview Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-2xl border bg-surface" style={{ borderColor: "var(--athlon-border)" }}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block">Categories</span>
                    <div className="text-base font-black text-foreground mt-0.5">{formData.categories.length} Tiers</div>
                    <span className="text-[10px] text-foreground/40 font-medium">classification tiers configured</span>
                  </div>

                  <div className="p-3.5 rounded-2xl border bg-surface" style={{ borderColor: "var(--athlon-border)" }}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block">Auction Pool Target</span>
                    <div className="text-base font-black text-primary mt-0.5">
                      {totalQuota > 0 ? `${totalQuota} Players` : "Open Limit"}
                    </div>
                    <span className="text-[10px] text-foreground/40 font-medium">
                      {totalQuota > 0 ? "total registrations to accept" : "organizer accepts all valid entries"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border bg-surface" style={{ borderColor: "var(--athlon-border)" }}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block">Squad Draft Requirement</span>
                    <div className="text-base font-black text-foreground mt-0.5">{targetCapacity} Players</div>
                    <span className="text-[10px] text-foreground/40 font-medium">
                      {formData.maxTeams} teams × {formData.maxSquadSize} squad (extra pool goes unsold)
                    </span>
                  </div>
                </div>

                {/* Add Custom Category Form */}
                <div
                  className="p-5 rounded-2xl border space-y-4"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add Category
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Fee Mode: {formData.playerFeeMode === "FREE" ? "Free" : formData.playerFeeMode === "GLOBAL_PAID" ? `Fixed ₹${formData.defaultPlayerFee}` : "Per-Category"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Open, C Level, Under 18"
                        value={newCatName}
                        onChange={(e) => {
                          setNewCatName(e.target.value);
                          if (!newCatCode) {
                            setNewCatCode(e.target.value.substring(0, 3).toUpperCase());
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                        style={{ borderColor: "var(--athlon-border)" }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                        Target Pool Entries *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={1}
                          placeholder="e.g. 16"
                          value={newCatPlayersNeeded || ""}
                          onChange={(e) => setNewCatPlayersNeeded(e.target.value === "" ? 0 : Number(e.target.value))}
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                          style={{ borderColor: "var(--athlon-border)" }}
                        />
                        <span className="absolute right-2.5 text-[10px] font-bold text-foreground/40 pointer-events-none">
                          qty
                        </span>
                      </div>
                    </div>

                    {formData.auctionMode !== "NO_AUCTION" && (
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Base Price ({formData.currencySymbolOrLabel}) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 2000"
                          value={newCatPrice || ""}
                          onChange={(e) => setNewCatPrice(e.target.value === "" ? 0 : Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                          style={{ borderColor: "var(--athlon-border)" }}
                        />
                      </div>
                    )}

                    {formData.playerFeeMode === "CATEGORY_PAID" ? (
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Reg Fee (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 200"
                          value={newCatFee || ""}
                          onChange={(e) => setNewCatFee(e.target.value === "" ? 0 : Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                          style={{ borderColor: "var(--athlon-border)" }}
                        />
                      </div>
                    ) : (
                      <div className="hidden sm:block sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Reg Fee
                        </label>
                        <div className="px-3 py-2.5 rounded-xl bg-background/50 border text-xs font-bold text-foreground/60" style={{ borderColor: "var(--athlon-border)" }}>
                          {formData.playerFeeMode === "FREE" ? "Free" : `₹${formData.defaultPlayerFee}`}
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={addCategory}
                        disabled={!newCatName.trim()}
                        className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-40"
                      >
                        + Add Tier
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Active Category Cards Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                      Configured Category Tiers ({formData.categories.length})
                    </span>
                    {formData.categories.length > 0 && (
                      <span className="text-[11px] font-bold text-primary">
                        Target Pool Total: {totalQuota} players
                      </span>
                    )}
                  </div>

                  {formData.categories.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed text-center" style={{ borderColor: "var(--athlon-border)" }}>
                      <Award className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground/60">No classification categories added yet</p>
                      <p className="text-[10px] text-foreground/40 mt-1 max-w-sm mx-auto">
                        Add categories above or choose a starter preset to define registration quotas and base prices.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.categories.map((cat, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border transition-all hover:border-primary/40 bg-surface flex flex-col justify-between gap-3 group"
                          style={{ borderColor: "var(--athlon-border-subtle)" }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                #{idx + 1}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-foreground">{cat.name}</h4>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/50 border border-foreground/10 uppercase">
                                  {cat.code || cat.name.substring(0, 3)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeCategory(idx)}
                              className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Metric Pills */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                            <div className="p-2 rounded-xl bg-background text-center border" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                              <span className="block text-[9px] font-black uppercase tracking-wider text-foreground/50">Max Entries</span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                {cat.playersNeeded > 0 ? `${cat.playersNeeded} Max` : "Open"}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-background text-center border" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                              <span className="block text-[9px] font-black uppercase tracking-wider text-foreground/50">Base Price</span>
                              <span className="text-xs font-black text-primary">
                                {formData.auctionMode === "NO_AUCTION" ? "None" : `${cat.basePrice} ${formData.currencySymbolOrLabel}`}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-background text-center border" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                              <span className="block text-[9px] font-black uppercase tracking-wider text-foreground/50">Player Fee</span>
                              <span className="text-xs font-black text-foreground">
                                {cat.registrationFee === 0 ? "Free" : `₹${cat.registrationFee}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* STEP 6: Match Formats */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 6 — Match Formats ({formData.sport})</h2>
                <p className="text-xs text-foreground/60">
                  Select how matches are played for {formData.sport} (e.g. Doubles, Singles, etc.).
                </p>
              </div>

              {/* Add Match Format Box with Sport-Based Dropdown */}
              <div
                className="p-5 rounded-2xl border space-y-4"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Match Format for {formData.sport}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Select Format *
                    </label>
                    <select
                      value={newFormatName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewFormatName(val);
                        if (val.toLowerCase().includes("doubles")) {
                          setNewFormatPlayers(2);
                        } else if (val.toLowerCase().includes("singles")) {
                          setNewFormatPlayers(1);
                        } else {
                          const matched = SPORT_MATCH_FORMATS[formData.sport]?.find((f) => f.name === val);
                          if (matched) {
                            setNewFormatPlayers(matched.playersPerSide);
                          }
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                      style={{ borderColor: "var(--athlon-border)" }}
                    >
                      <option value="">Select format...</option>
                      {(SPORT_MATCH_FORMATS[formData.sport] || []).map((f, fIdx) => (
                        <option key={fIdx} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                      Players Per Side *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={newFormatPlayers}
                      onChange={(e) => setNewFormatPlayers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                      style={{ borderColor: "var(--athlon-border)" }}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={addFormat}
                      disabled={!newFormatName}
                      className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-40"
                    >
                      + Add Format
                    </button>
                  </div>
                </div>
              </div>

              {/* Format List */}
              <div className="space-y-2.5">
                {formData.matchFormats.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed text-center" style={{ borderColor: "var(--athlon-border)" }}>
                    <p className="text-xs font-bold text-foreground/50">No match formats added yet</p>
                    <p className="text-[10px] text-foreground/35 mt-0.5">Add match formats above (e.g. Men's Doubles, Men's Singles).</p>
                  </div>
                ) : (
                  formData.matchFormats.map((fmt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl border transition-all"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {fmt.playersPerSide}v{fmt.playersPerSide}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-foreground">{fmt.name}</h4>
                          <p className="text-[11px] text-foreground/50">
                            Players per side: <strong>{fmt.playersPerSide}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFormat(idx)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Events Matrix */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 7 — Competition Events Matrix</h2>
                <p className="text-xs text-foreground/60">
                  Select which Match Formats apply to which Category to form competition sub-matches.
                </p>
              </div>

              {formData.categories.length === 0 || formData.matchFormats.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed text-center" style={{ borderColor: "var(--athlon-border)" }}>
                  <p className="text-xs font-bold text-foreground/50">Categories & Match Formats Required</p>
                  <p className="text-[10px] text-foreground/35 mt-0.5">Please add at least 1 Category (Step 5) and 1 Match Format (Step 6) to configure events matrix.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "var(--athlon-border)" }}>
                          <th className="p-3 font-black uppercase text-foreground/50">Category</th>
                          {formData.matchFormats.map((fmt, fIdx) => (
                            <th key={fIdx} className="p-3 font-black uppercase text-primary text-center">
                              {fmt.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.categories.map((cat, cIdx) => (
                          <tr
                            key={cIdx}
                            className="border-b hover:bg-foreground/[0.02] transition-colors"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <td className="p-3 font-black text-foreground flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {cat.name}
                            </td>
                            {formData.matchFormats.map((fmt, fIdx) => {
                              const active = isEventSelected(cat.name, fmt.name);
                              return (
                                <td key={fIdx} className="p-3 text-center">
                                  <button
                                    onClick={() => toggleEvent(cat.name, fmt.name)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border ${active
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-surface text-foreground/40 border-foreground/10 hover:border-foreground/30"
                                      }`}
                                  >
                                    {active ? "Active" : "Disabled"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    className="p-4 rounded-2xl border space-y-2"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-primary">
                      Selected Events ({formData.events.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.events.map((e, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs"
                        >
                          {e.eventName}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 8: Pools & Qualifiers */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <div>
                  <h2 className="text-lg font-black text-foreground">Step 8 — Stage Pools & Qualification</h2>
                  <p className="text-xs text-foreground/60">Configure round-robin pools one by one and set advancing knockout quotas.</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[1, 2, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPoolTemplate(count)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${formData.poolsList.length === count
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-surface text-foreground/70 border-foreground/10 hover:border-primary/50"
                        }`}
                    >
                      {count} Pool{count > 1 ? "s" : ""}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={addPool}
                    className="px-2.5 py-1 rounded-xl text-xs font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                  >
                    + Add Pool
                  </button>
                </div>
              </div>

              {/* One-by-One Pool Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.poolsList.map((pool, idx) => {
                  const estTeams = Math.ceil(formData.maxTeams / formData.poolsList.length);
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border space-y-4 transition-all relative group"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[9px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                            Pool Name *
                          </label>
                          <input
                            type="text"
                            value={pool.name}
                            onChange={(e) => updatePool(idx, "name", e.target.value)}
                            placeholder={`Pool ${String.fromCharCode(65 + idx)}`}
                            className="w-full px-3 py-1.5 rounded-xl border bg-background text-xs font-black text-foreground outline-none focus:border-primary h-9"
                            style={{ borderColor: "var(--athlon-border)" }}
                          />
                        </div>

                        {formData.poolsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePool(idx)}
                            title="Remove Pool"
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all self-end mb-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1">
                            Qualifiers to Knockouts *
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min={1}
                              max={8}
                              value={pool.qualifiers || ""}
                              onChange={(e) => updatePool(idx, "qualifiers", e.target.value === "" ? 0 : Number(e.target.value))}
                              className="w-full pl-3 pr-14 py-2 rounded-xl border bg-background text-xs font-black text-foreground outline-none focus:border-primary h-9"
                              style={{ borderColor: "var(--athlon-border)" }}
                            />
                            <span className="absolute right-3 text-[11px] font-bold text-foreground/40 pointer-events-none">
                              teams
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1">
                            Teams in this Pool
                          </label>
                          <div
                            className="flex items-center px-3 rounded-xl bg-background/50 border text-xs font-semibold text-foreground/60 h-9"
                            style={{ borderColor: "var(--athlon-border)" }}
                          >
                            ~{estTeams} teams
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-Time Knockout Progression Summary */}
              {(() => {
                const totalQualifiers = formData.poolsList.reduce((sum, p) => sum + (Number(p.qualifiers) || 0), 0);
                const stageName =
                  totalQualifiers === 2
                    ? "Grand Finals (2 Teams)"
                    : totalQualifiers === 4
                      ? "Semi-Finals & Finals (4 Teams)"
                      : totalQualifiers === 8
                        ? "Quarter-Finals & Beyond (8 Teams)"
                        : totalQualifiers === 16
                          ? "Round of 16 (16 Teams)"
                          : `${totalQualifiers} Teams Knockout Stage`;

                return (
                  <div
                    className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-foreground">
                          Knockout Bracket: <span className="text-primary">{stageName}</span>
                        </div>
                        <div className="text-[11px] text-foreground/50">
                          {formData.poolsList.length} Pool{formData.poolsList.length > 1 ? "s" : ""} configured ·{" "}
                          <strong>{totalQualifiers}</strong> total teams will qualify from the league stage
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {formData.poolsList.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-surface border text-[11px] font-bold text-foreground/80"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          {p.name}: <strong>{p.qualifiers}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP 9: Match Rules */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <h2 className="text-lg font-black text-foreground">Step 9 — Match & Lineup Rules</h2>
                <p className="text-xs text-foreground/60">Configure distinct rules for League and Knockout stages, plus lineup reveal policies.</p>
              </div>

              {/* Stage Switcher Tabs */}
              <div
                className="w-full grid grid-cols-2 p-1 rounded-xl border gap-1"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                <button
                  type="button"
                  onClick={() => setRulesStageTab("LEAGUE")}
                  className={`w-full py-2.5 px-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${rulesStageTab === "LEAGUE"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "text-foreground/70 border-transparent hover:bg-foreground/5"
                    }`}
                >
                  <span className="shrink-0">🏟️</span>
                  <span>League</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rulesStageTab === "LEAGUE" ? "bg-black/20 text-white" : "bg-primary/10 text-primary"}`}>
                    Pools
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRulesStageTab("KNOCKOUT")}
                  className={`w-full py-2.5 px-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${rulesStageTab === "KNOCKOUT"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "text-foreground/70 border-transparent hover:bg-foreground/5"
                    }`}
                >
                  <span className="shrink-0">⚡</span>
                  <span>Knockout</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rulesStageTab === "KNOCKOUT" ? "bg-black/20 text-white" : "bg-primary/10 text-primary"}`}>
                    Playoffs
                  </span>
                </button>
              </div>

              {/* LEAGUE STAGE TAB CONTENT */}
              {rulesStageTab === "LEAGUE" && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  {/* 1. Match Resolution */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70">
                      League Match Resolution *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          value: "PLAY_ALL",
                          title: "Play All Sub-Matches",
                          desc: "All events in tie are played to count towards pool table points and set differences.",
                        },
                        {
                          value: "BEST_OF_N",
                          title: "First to Majority / Best-of-N",
                          desc: "Fixture finishes as soon as one team secures the winning majority of events.",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, leagueMatchFormat: opt.value as any })}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${formData.leagueMatchFormat === opt.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-foreground/10 bg-background hover:border-foreground/20"
                            }`}
                          style={{
                            backgroundColor: formData.leagueMatchFormat === opt.value ? undefined : "var(--athlon-card)",
                            borderColor: formData.leagueMatchFormat === opt.value ? undefined : "var(--athlon-border)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-foreground">{opt.title}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.leagueMatchFormat === opt.value ? "border-primary" : "border-foreground/30"}`}>
                              {formData.leagueMatchFormat === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-foreground/50 mt-1.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Standings Points */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70">
                      League Table Points System
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="p-3 rounded-xl bg-background border text-center" style={{ borderColor: "var(--athlon-border)" }}>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1">Win</span>
                        <input
                          type="number"
                          value={formData.leagueWinPoints}
                          onChange={(e) => setFormData({ ...formData, leagueWinPoints: Number(e.target.value) })}
                          className="w-full text-center text-sm font-black text-primary bg-transparent outline-none"
                        />
                        <span className="text-[9px] font-bold text-foreground/40 block mt-0.5">points</span>
                      </div>

                      <div className="p-3 rounded-xl bg-background border text-center" style={{ borderColor: "var(--athlon-border)" }}>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1">Draw / Tie</span>
                        <input
                          type="number"
                          value={formData.leagueDrawPoints}
                          onChange={(e) => setFormData({ ...formData, leagueDrawPoints: Number(e.target.value) })}
                          className="w-full text-center text-sm font-black text-foreground bg-transparent outline-none"
                        />
                        <span className="text-[9px] font-bold text-foreground/40 block mt-0.5">points</span>
                      </div>

                      <div className="p-3 rounded-xl bg-background border text-center" style={{ borderColor: "var(--athlon-border)" }}>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1">Loss</span>
                        <input
                          type="number"
                          value={formData.leagueLossPoints}
                          onChange={(e) => setFormData({ ...formData, leagueLossPoints: Number(e.target.value) })}
                          className="w-full text-center text-sm font-black text-foreground/60 bg-transparent outline-none"
                        />
                        <span className="text-[9px] font-bold text-foreground/40 block mt-0.5">points</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Match Order & Toss */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70">
                      Match Order & Toss Rule (League)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          value: "ORGANIZER_DEFINED",
                          title: "Organizer Defined Order",
                          desc: "Fixed match sequence for all league ties (e.g. 1st MS, 2nd MD, 3rd XD).",
                        },
                        {
                          value: "TEAM_PREFERENCE_PLUS_TOSS",
                          title: "Team Preference + Toss",
                          desc: "Toss winner picks match order preferences before the tie begins.",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, leagueTossOrderRule: opt.value as any })}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${formData.leagueTossOrderRule === opt.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-foreground/10 bg-background hover:border-foreground/20"
                            }`}
                          style={{
                            backgroundColor: formData.leagueTossOrderRule === opt.value ? undefined : "var(--athlon-card)",
                            borderColor: formData.leagueTossOrderRule === opt.value ? undefined : "var(--athlon-border)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-foreground">{opt.title}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.leagueTossOrderRule === opt.value ? "border-primary" : "border-foreground/30"}`}>
                              {formData.leagueTossOrderRule === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-foreground/50 mt-1.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Lineup & Substitutions */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-4"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Lineup Cutoff
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            value={formData.leagueLineupDeadlineMinutes}
                            onChange={(e) => setFormData({ ...formData, leagueLineupDeadlineMinutes: Number(e.target.value) })}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border bg-background text-xs font-black text-foreground outline-none focus:border-primary h-10"
                            style={{ borderColor: "var(--athlon-border)" }}
                          />
                          <span className="absolute right-3 text-[11px] font-bold text-foreground/40 pointer-events-none">
                            mins
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Lineup Reveal Policy
                        </label>
                        <select
                          value={formData.leagueLineupRevealPolicy}
                          onChange={(e) => setFormData({ ...formData, leagueLineupRevealPolicy: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-bold text-foreground focus:border-primary outline-none h-10"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          <option value="SIMULTANEOUS_REVEAL">Simultaneous Secret Reveal</option>
                          <option value="AFTER_APPROVAL">Organizer Approval Reveal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Max Substitutions
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={formData.leagueMaxSubstitutions}
                            onChange={(e) => setFormData({ ...formData, leagueMaxSubstitutions: Number(e.target.value) })}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border bg-background text-xs font-black text-foreground outline-none focus:border-primary h-10"
                            style={{ borderColor: "var(--athlon-border)" }}
                          />
                          <span className="absolute right-3 text-[11px] font-bold text-foreground/40 pointer-events-none">
                            subs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KNOCKOUT STAGE TAB CONTENT */}
              {rulesStageTab === "KNOCKOUT" && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  {/* 1. Match Resolution */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70">
                      Knockout Match Resolution *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          value: "BEST_OF_N",
                          title: "First to Majority / Best-of-N",
                          desc: "Fixture concludes immediately once a team clinches winning majority (e.g. 3-0 or 3-1).",
                        },
                        {
                          value: "PLAY_ALL",
                          title: "Play All Sub-Matches",
                          desc: "All events are played regardless of whether a team has already won.",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, knockoutMatchFormat: opt.value as any })}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${formData.knockoutMatchFormat === opt.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-foreground/10 bg-background hover:border-foreground/20"
                            }`}
                          style={{
                            backgroundColor: formData.knockoutMatchFormat === opt.value ? undefined : "var(--athlon-card)",
                            borderColor: formData.knockoutMatchFormat === opt.value ? undefined : "var(--athlon-border)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-foreground">{opt.title}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.knockoutMatchFormat === opt.value ? "border-primary" : "border-foreground/30"}`}>
                              {formData.knockoutMatchFormat === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-foreground/50 mt-1.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Match Order & Toss */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-foreground/70">
                      Match Order & Toss Rule (Knockouts)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          value: "TEAM_PREFERENCE_PLUS_TOSS",
                          title: "Team Preference + Toss",
                          desc: "Toss winner picks match order preferences for high-stakes playoff fixtures.",
                        },
                        {
                          value: "ORGANIZER_DEFINED",
                          title: "Organizer Defined Order",
                          desc: "Fixed match sequence decided by the tournament organizer.",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, knockoutTossOrderRule: opt.value as any })}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${formData.knockoutTossOrderRule === opt.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-foreground/10 bg-background hover:border-foreground/20"
                            }`}
                          style={{
                            backgroundColor: formData.knockoutTossOrderRule === opt.value ? undefined : "var(--athlon-card)",
                            borderColor: formData.knockoutTossOrderRule === opt.value ? undefined : "var(--athlon-border)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-foreground">{opt.title}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.knockoutTossOrderRule === opt.value ? "border-primary" : "border-foreground/30"}`}>
                              {formData.knockoutTossOrderRule === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-foreground/50 mt-1.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Lineup & Substitutions */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl border space-y-4"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Lineup Cutoff
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            value={formData.knockoutLineupDeadlineMinutes}
                            onChange={(e) => setFormData({ ...formData, knockoutLineupDeadlineMinutes: Number(e.target.value) })}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border bg-background text-xs font-black text-foreground outline-none focus:border-primary h-10"
                            style={{ borderColor: "var(--athlon-border)" }}
                          />
                          <span className="absolute right-3 text-[11px] font-bold text-foreground/40 pointer-events-none">
                            mins
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Lineup Reveal Policy
                        </label>
                        <select
                          value={formData.knockoutLineupRevealPolicy}
                          onChange={(e) => setFormData({ ...formData, knockoutLineupRevealPolicy: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-bold text-foreground focus:border-primary outline-none h-10"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          <option value="SIMULTANEOUS_REVEAL">Simultaneous Secret Reveal</option>
                          <option value="AFTER_APPROVAL">Organizer Approval Reveal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                          Max Substitutions
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={formData.knockoutMaxSubstitutions}
                            onChange={(e) => setFormData({ ...formData, knockoutMaxSubstitutions: Number(e.target.value) })}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border bg-background text-xs font-black text-foreground outline-none focus:border-primary h-10"
                            style={{ borderColor: "var(--athlon-border)" }}
                          />
                          <span className="absolute right-3 text-[11px] font-bold text-foreground/40 pointer-events-none">
                            subs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 10: Review & Publish */}
          {currentStep === 10 && (() => {
            const totalAdvancing = formData.poolsList.reduce((acc, p) => acc + (p.qualifiers || 0), 0);
            const totalQuota = formData.categories.reduce((acc, c) => acc + (c.playersNeeded || 0), 0);
            const squadCapacity = formData.maxTeams * formData.maxSquadSize;

            const getKnockoutStageName = (count: number) => {
              if (count <= 2) return "Direct Finals (2 Teams)";
              if (count <= 4) return "Semi-Finals & Finals (4 Teams)";
              if (count <= 8) return "Quarter-Finals & Knockouts (8 Teams)";
              if (count <= 16) return "Round of 16 Knockouts (16 Teams)";
              return `Single Elimination (${count} Teams)`;
            };

            return (
              <div className="space-y-6">
                {/* Header with status */}
                <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        Final Review
                      </span>
                      <span className="text-xs font-bold text-foreground/40">Ready for Launch</span>
                    </div>
                    <h2 className="text-xl font-black text-foreground mt-1">Step 10 — Review & Publish Championship</h2>
                    <p className="text-xs text-foreground/60">
                      Verify your championship settings across all steps before opening registration and auction pools.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All 9 Steps Configured
                    </span>
                  </div>
                </div>

                {/* Hero Championship Overview Card */}
                <div
                  className="p-5 sm:p-6 rounded-3xl border bg-gradient-to-br from-primary/10 via-surface to-surface relative overflow-hidden"
                  style={{ borderColor: "var(--athlon-border)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {formData.posterPreview ? (
                        <img
                          src={formData.posterPreview}
                          alt="Poster Preview"
                          className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-2xl border shadow-md shrink-0"
                          style={{ borderColor: "var(--athlon-border)" }}
                        />
                      ) : (
                        <div
                          className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border flex flex-col items-center justify-center bg-primary/10 text-primary shrink-0"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          <Trophy className="w-8 h-8" />
                          <span className="text-[9px] font-black uppercase mt-1">Athlon</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary text-primary-foreground uppercase tracking-wider">
                            {formData.sport}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-foreground/10 text-foreground/70 uppercase">
                            {formData.visibility}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                            {formData.auctionMode ? formData.auctionMode.replace("_", " ") : "AUCTION"}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                          {formData.name || "Untitled Championship"}
                        </h3>
                        <p className="text-xs text-foreground/60 line-clamp-2 max-w-xl">
                          {formData.description || "No public description provided."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="self-start sm:self-center px-3 py-1.5 rounded-xl border bg-background/80 hover:bg-background text-xs font-bold text-foreground/70 hover:text-primary transition-all flex items-center gap-1.5 shadow-sm"
                      style={{ borderColor: "var(--athlon-border)" }}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Info
                    </button>
                  </div>

                  {/* 4-KPI Quick Snapshot */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <div className="p-3 rounded-2xl bg-background/60 border backdrop-blur-sm" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <span className="text-[9px] font-black uppercase tracking-wider text-foreground/50 block">Tournament Capacity</span>
                      <span className="text-sm font-black text-foreground block mt-0.5">{formData.maxTeams} Teams</span>
                      <span className="text-[10px] text-foreground/40 font-medium">{squadCapacity} squad players</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-background/60 border backdrop-blur-sm" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <span className="text-[9px] font-black uppercase tracking-wider text-foreground/50 block">Team Purse Budget</span>
                      <span className="text-sm font-black text-primary block mt-0.5">
                        {formData.auctionMode === "NO_AUCTION" ? "No Auction" : `${formData.teamBudget.toLocaleString()} ${formData.currencySymbolOrLabel}`}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-medium">{formData.currencyType}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-background/60 border backdrop-blur-sm" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <span className="text-[9px] font-black uppercase tracking-wider text-foreground/50 block">Entry Fees</span>
                      <span className="text-sm font-black text-foreground block mt-0.5">
                        {formData.teamRegistrationFee === 0 ? "Free Team Entry" : `₹${formData.teamRegistrationFee} / Team`}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-medium">
                        Player: {formData.playerFeeMode === "FREE" ? "Free" : formData.playerFeeMode === "GLOBAL_PAID" ? `₹${formData.defaultPlayerFee}` : "Per-Category"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-background/60 border backdrop-blur-sm" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <span className="text-[9px] font-black uppercase tracking-wider text-foreground/50 block">Tie Structure</span>
                      <span className="text-sm font-black text-foreground block mt-0.5">{formData.events.length} Sub-Matches</span>
                      <span className="text-[10px] text-foreground/40 font-medium">{formData.poolsList.length} Pools &rarr; {totalAdvancing} Q</span>
                    </div>
                  </div>
                </div>

                {/* Modular Detail Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* 1. Schedule, Venue & Contact (Step 1) */}
                  <div className="p-5 rounded-2xl border bg-surface space-y-3 flex flex-col justify-between" style={{ borderColor: "var(--athlon-border)" }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">1. Schedule & Location</h4>
                        </div>
                        <button onClick={() => setCurrentStep(1)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Tournament Dates</span>
                          <span className="font-black text-foreground text-right">{formData.startDate || "TBD"} &rarr; {formData.endDate || "TBD"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Registration Deadline</span>
                          <span className="font-black text-amber-500 text-right">{formData.registrationClosingDate || "TBD"}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-foreground/50 font-bold shrink-0">Venue / Location</span>
                          <span className="font-black text-foreground text-right max-w-[65%] truncate">{formData.venue || "Location TBD"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Organizer Contact</span>
                          <span className="font-black text-foreground">{formData.contactPhone || "Not specified"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Auction & Purse Economics (Steps 2 & 3) */}
                  <div className="p-5 rounded-2xl border bg-surface space-y-3 flex flex-col justify-between" style={{ borderColor: "var(--athlon-border)" }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                        <div className="flex items-center gap-2">
                          <Gavel className="w-4 h-4 text-primary" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">2. Auction & Financials</h4>
                        </div>
                        <button onClick={() => setCurrentStep(2)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Bidding Model</span>
                          <span className="font-black text-primary">{formData.auctionMode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Team Purse Budget</span>
                          <span className="font-black text-foreground">{formData.teamBudget.toLocaleString()} {formData.currencySymbolOrLabel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Retained / Reserved Players</span>
                          <span className="font-black text-foreground">{formData.reservedPlayersPerTeam} per team</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50 font-bold">Player Reg Fee Mode</span>
                          <span className="font-black text-foreground">
                            {formData.playerFeeMode === "FREE" ? "Free Registration" : formData.playerFeeMode === "GLOBAL_PAID" ? `Fixed ₹${formData.defaultPlayerFee}` : "Per-Category Fee"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Classification Categories & Quotas (Step 5) */}
                  <div className="p-5 rounded-2xl border bg-surface space-y-3 md:col-span-2" style={{ borderColor: "var(--athlon-border)" }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                          3. Classification Categories & Pool Targets ({formData.categories.length} Tiers)
                        </h4>
                      </div>
                      <button onClick={() => setCurrentStep(5)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>

                    {formData.categories.length === 0 ? (
                      <p className="text-xs font-bold text-foreground/40 italic">No classification categories defined</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {formData.categories.map((cat, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 rounded-xl border bg-background space-y-1.5"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-foreground truncate">{cat.name}</span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                                {cat.code || cat.name.substring(0, 3)}
                              </span>
                            </div>
                            <div className="text-[11px] space-y-0.5 text-foreground/60">
                              <div className="flex justify-between">
                                <span>Target Pool:</span>
                                <strong className="text-emerald-600 dark:text-emerald-400">{cat.playersNeeded > 0 ? `${cat.playersNeeded} Max` : "Open"}</strong>
                              </div>
                              {formData.auctionMode !== "NO_AUCTION" && (
                                <div className="flex justify-between">
                                  <span>Base Price:</span>
                                  <strong className="text-primary">{cat.basePrice} {formData.currencySymbolOrLabel}</strong>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Reg Fee:</span>
                                <strong>{cat.registrationFee === 0 ? "Free" : `₹${cat.registrationFee}`}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Events Matrix & Tie Composition (Step 7) */}
                  <div className="p-5 rounded-2xl border bg-surface space-y-3" style={{ borderColor: "var(--athlon-border)" }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                          4. Tie Match Composition ({formData.events.length} Sub-Matches)
                        </h4>
                      </div>
                      <button onClick={() => setCurrentStep(7)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {formData.events.length === 0 ? (
                        <p className="text-xs font-bold text-foreground/40 italic">No events configured in matrix</p>
                      ) : (
                        formData.events.map((ev, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-background border text-xs"
                            style={{ borderColor: "var(--athlon-border-subtle)" }}
                          >
                            <span className="font-black text-foreground flex items-center gap-2">
                              <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                                #{eIdx + 1}
                              </span>
                              {ev.eventName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 border border-foreground/10">
                              {ev.categoryName}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 5. Squad & Pool Progression (Steps 4 & 8) */}
                  <div className="p-5 rounded-2xl border bg-surface space-y-3" style={{ borderColor: "var(--athlon-border)" }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">5. Squad & Tournament Bracket</h4>
                      </div>
                      <button onClick={() => setCurrentStep(4)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50 font-bold">Squad Size (Fixed)</span>
                        <span className="font-black text-foreground">{formData.maxSquadSize} Players / Team</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50 font-bold">League Rotation Mandate</span>
                        <span className="font-black text-foreground">
                          {formData.everyPlayerMustPlayLeague ? "Mandatory (All squad members play)" : "Optional (Captain discretion)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50 font-bold">Configured Pools</span>
                        <span className="font-black text-primary">
                          {formData.poolsList.length} Pools ({formData.poolsList.map((p) => `${p.name}`).join(", ")})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50 font-bold">Advancing to Knockouts</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {totalAdvancing} Teams ({formData.poolsList.map((p) => `${p.name}: ${p.qualifiers} Q`).join(", ")})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50 font-bold">Knockout Structure</span>
                        <span className="font-black text-foreground">{getKnockoutStageName(totalAdvancing)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 6. Match, Toss & Lineup Execution Rules (Step 9) */}
                  <div className="p-5 rounded-2xl border bg-surface space-y-3 md:col-span-2" style={{ borderColor: "var(--athlon-border)" }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                          6. Match, Toss & Lineup Stage Rules
                        </h4>
                      </div>
                      <button onClick={() => setCurrentStep(9)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* League Rules Card */}
                      <div className="p-4 rounded-xl border bg-background space-y-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🏟️</span>
                          <h5 className="text-xs font-black uppercase tracking-wider text-foreground">League Stage Rules</h5>
                        </div>
                        <div className="space-y-1.5 text-xs text-foreground/70">
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Resolution:</span>
                            <strong className="text-foreground">{formData.leagueMatchFormat === "PLAY_ALL" ? "Play All Sub-Matches" : "Best of N (Early Finish)"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Standings Points:</span>
                            <strong className="text-primary">{formData.leagueWinPoints}W / {formData.leagueDrawPoints}D / {formData.leagueLossPoints}L</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Toss & Order:</span>
                            <strong className="text-foreground">{formData.leagueTossOrderRule === "TEAM_PREFERENCE_PLUS_TOSS" ? "Team Preference + Toss" : "Organizer Fixed"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Lineup Cutoff:</span>
                            <strong className="text-foreground">{formData.leagueLineupDeadlineMinutes} mins before tie</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Reveal Policy:</span>
                            <strong className="text-foreground">{formData.leagueLineupRevealPolicy === "SIMULTANEOUS_REVEAL" ? "Simultaneous Reveal" : "Organizer Approval"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Max Subs:</span>
                            <strong className="text-foreground">{formData.leagueMaxSubstitutions} Substitutions</strong>
                          </div>
                        </div>
                      </div>

                      {/* Knockout Rules Card */}
                      <div className="p-4 rounded-xl border bg-background space-y-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">⚡</span>
                          <h5 className="text-xs font-black uppercase tracking-wider text-foreground">Knockout Stage Rules</h5>
                        </div>
                        <div className="space-y-1.5 text-xs text-foreground/70">
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Resolution:</span>
                            <strong className="text-foreground">{formData.knockoutMatchFormat === "BEST_OF_N" ? "First to Majority (Best of N)" : "Play All Sub-Matches"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Toss & Order:</span>
                            <strong className="text-foreground">{formData.knockoutTossOrderRule === "TEAM_PREFERENCE_PLUS_TOSS" ? "Team Preference + Toss" : "Organizer Fixed"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Lineup Cutoff:</span>
                            <strong className="text-foreground">{formData.knockoutLineupDeadlineMinutes} mins before tie</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Reveal Policy:</span>
                            <strong className="text-foreground">{formData.knockoutLineupRevealPolicy === "SIMULTANEOUS_REVEAL" ? "Simultaneous Reveal" : "Organizer Approval"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Max Subs:</span>
                            <strong className="text-foreground">{formData.knockoutMaxSubstitutions} Substitutions</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Final Confirmation Banner */}
                <div
                  className="p-4 sm:p-5 rounded-2xl border bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ borderColor: "var(--athlon-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground">Ready to Launch Championship</h4>
                      <p className="text-xs text-foreground/60">
                        Publishing creates your championship workspace, generates category registration channels, and readies the auction pool.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Navigation Controls */}
          <div
            className="flex items-center justify-between pt-6 border-t mt-8"
            style={{ borderColor: "var(--athlon-border-subtle)" }}
          >
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-foreground/10 text-xs font-bold hover:bg-foreground/5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 10 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isSubmitting}
                onClick={handlePublish}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
              >
                {isSubmitting ? "Publishing..." : "🚀 Publish"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
