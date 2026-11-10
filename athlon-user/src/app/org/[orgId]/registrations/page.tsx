"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Trophy,
  ChevronRight,
  User,
  Phone,
  Calendar,
  CreditCard,
  Share2,
  Download,
  MessageCircle,
  Eye,
  Check,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Tag,
  MapPin,
  X,
  Flame,
  TrendingUp,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  Filter,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { TournamentService, RegistrationService, Tournament, Registration } from "@/lib/api/tournaments";
import { Athlon3DIcon } from "@/components/common/Athlon3DIcon";
import { useAthlonTheme } from "@/hooks/use-athlon-theme";

// Helper: Format date
function formatDateStr(dateStr?: string) {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

// Helper: Tournament status badge config
function getStatusBadgeConfig(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "REGISTRATION_CLOSED" || s === "CLOSED") {
    return {
      label: "Closed",
      className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }
  if (s === "REGISTRATION_OPEN" || s === "OPEN") {
    return {
      label: "Open",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (s === "ONGOING" || s === "LIVE") {
    return {
      label: "Ongoing",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (s === "UPCOMING") {
    return {
      label: "Upcoming",
      className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    };
  }
  if (s === "COMPLETED") {
    return {
      label: "Completed",
      className: "bg-black/5 dark:bg-white/10 text-foreground/50 border-black/10 dark:border-white/10",
    };
  }
  return {
    label: s ? s.replace(/_/g, " ") : "Active",
    className: "bg-primary/15 text-primary border-primary/30",
  };
}

// ─── Main Registrations Page ───────────────────────────────────────────────────
export default function RegistrationsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || "";
  const { mode } = useAthlonTheme();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | "ONGOING" | "COMPLETED">("ALL");
  const [tournamentRegCounts, setTournamentRegCounts] = useState<Record<number, { total: number; approved: number; pending: number; revenue: number }>>({});

  // Load Real Tournaments for this Org
  useEffect(() => {
    async function loadTournaments() {
      setLoading(true);
      try {
        let list: Tournament[] = [];
        if (orgId) {
          const res = await TournamentService.getByOrg(orgId);
          if (res?.data && Array.isArray(res.data)) {
            list = res.data;
          }
        }
        setTournaments(list);

        // Fetch real registration summaries for each tournament
        const counts: Record<number, { total: number; approved: number; pending: number; revenue: number }> = {};
        await Promise.all(
          list.map(async (t) => {
            if (!t.tournamentId) return;
            try {
              const regRes = await RegistrationService.getByTournament(t.tournamentId);
              const regs = regRes?.data || [];
              const approved = regs.filter((r) => r.status === "APPROVED").length;
              const pending = regs.filter((r) => r.status === "PENDING" || !r.status).length;
              const fee = t.registrationFees || 0;
              const paidCount = regs.filter((r) => r.paymentStatus === "PAID").length;
              counts[t.tournamentId] = {
                total: regs.length,
                approved,
                pending,
                revenue: paidCount * fee,
              };
            } catch {
              counts[t.tournamentId] = { total: 0, approved: 0, pending: 0, revenue: 0 };
            }
          })
        );
        setTournamentRegCounts(counts);
      } catch (err) {
        console.error("Failed to load tournaments:", err);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, [orgId]);

  // Filtered Tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.sport && t.sport.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.location && t.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" || t.status?.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tournaments, searchQuery, statusFilter]);

  // Overall Global Telemetry
  const globalStats = useMemo(() => {
    let totalEntries = 0;
    let totalApproved = 0;
    let totalPending = 0;
    let totalRevenue = 0;
    Object.values(tournamentRegCounts).forEach((c) => {
      totalEntries += c.total;
      totalApproved += c.approved;
      totalPending += c.pending;
      totalRevenue += c.revenue;
    });
    return {
      tournamentsCount: tournaments.length,
      totalEntries,
      totalApproved,
      totalPending,
      totalRevenue,
    };
  }, [tournaments, tournamentRegCounts]);

  // If a tournament is selected, render the rich detailed Registration View
  if (selectedTournament) {
    return (
      <TournamentRegistrationDetailView
        tournament={selectedTournament}
        orgId={orgId}
        onBack={() => setSelectedTournament(null)}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-32 text-foreground transition-colors duration-200"
      style={{ backgroundColor: "var(--athlon-background)" }}
    >
      {/* ─── Ultra-Stylish Mobile Hero Section (Untouched) ─────────────────── */}
      <div className="block md:hidden px-4 pt-4 pb-2 max-w-xl mx-auto space-y-3.5">
        {/* Top Mini Navigation Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">
              Registrations
            </span>
          </div>

          <Link
            href={`/org/${orgId}/tournaments`}
            className="px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border shadow-sm active:scale-95 transition-all"
            style={{
              backgroundColor: "var(--athlon-surface)",
              borderColor: "var(--athlon-border-subtle)",
              color: "var(--athlon-text)",
            }}
          >
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span>All Events</span>
          </Link>
        </div>

        {/* Hero Title & Subtitle */}
        <div>
          <p className="text-xs text-foreground/60 mt-1">
            {globalStats.totalEntries} entries across {globalStats.tournamentsCount} active tournaments
          </p>
        </div>

        {/* ─── Telemetry Capsule ────────────────────────── */}
        <div
          className="rounded-xl sm:rounded-2xl p-3.5 border shadow-2xs backdrop-blur-xs"
          style={{
            backgroundColor: "var(--athlon-card)",
            borderColor: "var(--athlon-border)",
          }}
        >
          {/* Top Quick Status Alert Strip */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--athlon-border-subtle)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Verified Inflow</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  ₹{globalStats.totalRevenue.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Action Needed Badge */}
            {globalStats.totalPending > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {globalStats.totalPending} Pending Review
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>All Reviewed</span>
              </div>
            )}
          </div>

          {/* 3-Column Segmented Telemetry Strip */}
          <div className="grid grid-cols-3 gap-2 pt-3 text-center">
            {/* 1. Events */}
            <div className="p-1.5 rounded-lg border text-center" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[8.5px] font-bold uppercase tracking-wider text-foreground/45">Events</div>
              <div className="text-base font-black text-foreground mt-0.5">{globalStats.tournamentsCount}</div>
              <div className="text-[8.5px] font-medium text-primary truncate">Hosted</div>
            </div>

            {/* 2. Total Entries */}
            <div className="p-1.5 rounded-lg border text-center" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[8.5px] font-bold uppercase tracking-wider text-foreground/45">Entries</div>
              <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">{globalStats.totalEntries}</div>
              <div className="text-[8.5px] font-medium text-foreground/50 truncate">{globalStats.totalApproved} Confirmed</div>
            </div>

            {/* 3. Approval Rate */}
            <div className="p-1.5 rounded-lg border text-center" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[8.5px] font-bold uppercase tracking-wider text-foreground/45">Rate</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {globalStats.totalEntries > 0 ? Math.round((globalStats.totalApproved / globalStats.totalEntries) * 100) : 100}%
              </div>
              <div className="text-[8.5px] font-medium text-foreground/50 truncate">Approval</div>
            </div>
          </div>
        </div>

        {/* ─── Search & Status Carousel Filter ─────────────────────────────── */}
        <div className="space-y-2 pt-1">
          {/* Rounded Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournament, sport or venue..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35 shadow-2xs"
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

          {/* Status Filter Carousel Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {(["ALL", "UPCOMING", "ONGOING", "COMPLETED"] as const).map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border shrink-0 ${isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "text-foreground/55 hover:text-foreground"
                    }`}
                  style={
                    !isActive
                      ? { backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }
                      : {}
                  }
                >
                  {st === "ALL" ? "All Events" : st}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Mobile Tournament Cards Stack ───────────────────────────────── */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Tournaments...</p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div
              className="py-14 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 shadow-sm"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2.5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1">No Tournaments Found</h3>
              <p className="text-xs text-foreground/50 max-w-xs mb-3">
                {searchQuery || statusFilter !== "ALL"
                  ? "No tournament matches your search or status filter."
                  : "Create your first tournament to start receiving athlete registrations."}
              </p>
              {searchQuery || statusFilter !== "ALL" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  className="px-4 py-2 border text-foreground text-xs font-bold rounded-xl transition-colors"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href={`/org/${orgId}/tournaments`}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>+ Tournament</span>
                </Link>
              )}
            </div>
          ) : (
            filteredTournaments.map((t) => {
              const counts = tournamentRegCounts[t.tournamentId] || { total: 0, approved: 0, pending: 0, revenue: 0 };
              const isOngoing = t.status?.toUpperCase() === "ONGOING";
              const isUpcoming = t.status?.toUpperCase() === "UPCOMING";
              const capacity = t.playersCount || 32;
              const fillPct = Math.min(100, Math.round((counts.total / capacity) * 100));

              return (
                <div
                  key={t.tournamentId || t.tournamentUuid}
                  onClick={() => setSelectedTournament(t)}
                  className="group relative rounded-xl sm:rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 active:scale-[0.99] cursor-pointer overflow-hidden shadow-2xs hover:border-primary/50"
                  style={{
                    backgroundColor: "var(--athlon-card)",
                    borderColor: counts.pending > 0 ? "rgba(251, 191, 36, 0.4)" : "var(--athlon-border)",
                  }}
                >
                  {/* Top Theme Color Line - Removed on mobile as requested */}

                  {/* Card Content Top */}
                  <div>
                    <div className="flex items-start gap-3">
                      {/* Sport 3D Icon */}
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
                        <Athlon3DIcon type="tournaments" size={20} />
                      </div>

                      {/* Title & Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {t.name}
                          </h3>
                          {(() => {
                            const statusCfg = getStatusBadgeConfig(t.status);
                            return (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider shrink-0 border ${statusCfg.className}`}
                              >
                                {statusCfg.label}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-foreground/55 truncate">
                          <span className="font-extrabold text-foreground/80 uppercase tracking-wider">
                            {t.sport || "Sport"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-foreground/40 shrink-0" />
                            {formatDateStr(t.startDate)}
                          </span>
                          {t.location && (
                            <>
                              <span>•</span>
                              <span className="truncate">{t.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Registration Slot Capacity Progress Bar */}
                    <div className="mt-2.5 pt-2 border-t space-y-1" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                      <div className="flex items-center justify-between text-[10px] font-bold text-foreground/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-primary" /> Slots
                        </span>
                        <span className="font-black text-foreground">
                          {counts.total} / {capacity} ({fillPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Metrics + Arrow */}
                  <div
                    className="mt-2.5 pt-2 border-t flex items-center justify-between gap-2"
                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        <CheckCircle2 className="w-3 h-3" /> {counts.approved}
                      </span>
                      {counts.pending > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 animate-pulse">
                          <Clock className="w-3 h-3" /> {counts.pending}
                        </span>
                      )}
                      {t.registrationFees ? (
                        <span className="text-[10px] font-bold text-foreground/50 px-1.5">
                          ₹{t.registrationFees} fee
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-primary group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>View</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Luxury High-Tech Desktop View (Redesigned) ──────────────────── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-24 space-y-8">
        {/* Executive Header Banner */}
        <div
          className="relative rounded-3xl border p-6 lg:p-8 overflow-hidden shadow-sm"
          style={{
            backgroundColor: "var(--athlon-card)",
            borderColor: "var(--athlon-border)",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              {/* Badge & Breadcrumb */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Athlon Command Center
                </span>
                <span className="text-foreground/30">•</span>
                <span className="text-xs font-semibold text-foreground/50">
                  Registrations & Roster Management
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Tournament Registrations
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {globalStats.tournamentsCount} Active {globalStats.tournamentsCount === 1 ? "Event" : "Events"}
                </span>
              </h1>
              <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl">
                Oversee athlete applications, verify payments, approve official rosters, and track inflow across all your tournaments from a unified operations deck.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/org/${orgId}/tournaments`}
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-xs hover:border-primary/50 transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--athlon-surface)",
                  borderColor: "var(--athlon-border)",
                  color: "var(--athlon-text)",
                }}
              >
                <Trophy className="w-4 h-4 text-primary" />
                <span>All Tournaments</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 4-Metric Executive Telemetry HUD ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Verified Inflow */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all group"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Verified Inflow
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{globalStats.totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Paid & confirmed entry fees</span>
            </div>
          </div>

          {/* 2. Total Registrations */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-blue-500/40 transition-all group"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Total Athletes
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground mt-2">
              {globalStats.totalEntries}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span>{globalStats.totalApproved} Confirmed on roster</span>
            </div>
          </div>

          {/* 3. Pending Review Queue */}
          <div
            className={`rounded-2xl border p-5 relative overflow-hidden shadow-xs transition-all group ${
              globalStats.totalPending > 0
                ? "border-amber-500/40 bg-amber-500/[0.03]"
                : "hover:border-primary/40"
            }`}
            style={{
              backgroundColor: globalStats.totalPending > 0 ? undefined : "var(--athlon-card)",
              borderColor: globalStats.totalPending > 0 ? "rgba(245, 158, 11, 0.35)" : "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Pending Verification
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
              {globalStats.totalPending}
              {globalStats.totalPending > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse uppercase tracking-wider">
                  Needs Action
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <span>{globalStats.totalPending > 0 ? "Pending organizer decision" : "All applications reviewed"}</span>
            </div>
          </div>

          {/* 4. Global Approval Velocity */}
          <div
            className="rounded-2xl border p-5 relative overflow-hidden shadow-xs hover:border-primary/40 transition-all group"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Approval Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground mt-2">
              {globalStats.totalEntries > 0
                ? Math.round((globalStats.totalApproved / globalStats.totalEntries) * 100)
                : 100}%
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground/50">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span>Across {globalStats.tournamentsCount} hosted events</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Status Filter Deck ─────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: "var(--athlon-card)",
            borderColor: "var(--athlon-border)",
          }}
        >
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournament name, sport or venue..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/40 shadow-2xs"
              style={{
                backgroundColor: "var(--athlon-surface)",
                borderColor: "var(--athlon-border-subtle)",
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

          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            {(["ALL", "UPCOMING", "ONGOING", "COMPLETED"] as const).map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "text-foreground/60 hover:text-foreground border-transparent hover:border-black/10 dark:hover:border-white/10"
                  }`}
                  style={!isActive ? { backgroundColor: "var(--athlon-surface)" } : {}}
                >
                  {st === "ALL" ? "All Events" : st}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Desktop Tournament Cards Grid ───────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
              Loading Tournaments & Roster Telemetry...
            </p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div
            className="py-20 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-8 shadow-xs"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-foreground mb-1">No Tournaments Found</h3>
            <p className="text-xs text-foreground/50 max-w-sm mb-4">
              {searchQuery || statusFilter !== "ALL"
                ? "No tournament matches your search query or filter selection."
                : "Create your first tournament to start receiving and managing athlete registrations."}
            </p>
            {searchQuery || statusFilter !== "ALL" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="px-4 py-2 border text-foreground text-xs font-bold rounded-xl transition-colors hover:border-primary"
                style={{
                  backgroundColor: "var(--athlon-surface)",
                  borderColor: "var(--athlon-border)",
                }}
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href={`/org/${orgId}/tournaments`}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 hover:opacity-95 transition-opacity"
              >
                <Trophy className="w-4 h-4" />
                <span>+ Create Tournament</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => {
              const counts = tournamentRegCounts[t.tournamentId] || {
                total: 0,
                approved: 0,
                pending: 0,
                revenue: 0,
              };
              const capacity = t.playersCount || 32;
              const fillPct = Math.min(100, Math.round((counts.total / capacity) * 100));
              const statusCfg = getStatusBadgeConfig(t.status);

              return (
                <div
                  key={t.tournamentId || t.tournamentUuid}
                  onClick={() => setSelectedTournament(t)}
                  className="rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--athlon-card)",
                    borderColor:
                      counts.pending > 0 ? "rgba(245, 158, 11, 0.4)" : "var(--athlon-border)",
                  }}
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
                      counts.pending > 0 ? "bg-amber-500" : "bg-primary/40 group-hover:bg-primary"
                    }`}
                  />

                  <div>
                    {/* Header: 3D Icon, Status & Pending Alert */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Athlon3DIcon type="tournaments" size={24} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </span>
                        {counts.pending > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{counts.pending} Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tournament Title & Info */}
                    <div className="mt-3.5">
                      <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {t.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-foreground/60 flex-wrap">
                        <span className="font-extrabold text-foreground/80 uppercase tracking-wider">
                          {t.sport || "Sport"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                          {formatDateStr(t.startDate)}
                        </span>
                        {t.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                              <span className="truncate">{t.location}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div
                      className="mt-4 pt-3 border-t space-y-1.5"
                      style={{ borderColor: "var(--athlon-border-subtle)" }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-foreground/60">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" /> Roster Capacity
                        </span>
                        <span className="font-black text-foreground">
                          {counts.total} / {capacity}{" "}
                          <span className="text-[10px] font-semibold text-foreground/50">
                            ({fillPct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Telemetry Badges & Action */}
                  <div
                    className="mt-4 pt-3 border-t flex items-center justify-between gap-2"
                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {counts.approved} Approved
                      </span>
                      {t.registrationFees ? (
                        <span className="text-xs font-bold text-foreground/60">
                          ₹{t.registrationFees} / entry
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Free Entry
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-primary group-hover:translate-x-1 transition-transform shrink-0">
                      <span>View Registrations</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tournament Specific Detailed Registration View ────────────────────────────
function TournamentRegistrationDetailView({
  tournament,
  orgId,
  onBack,
}: {
  tournament: Tournament;
  orgId: string;
  onBack: () => void;
}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING" | "REJECTED">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Load Real Registrations for this Tournament
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let list: Registration[] = [];
        if (tournament.tournamentId) {
          const res = await RegistrationService.getByTournament(tournament.tournamentId);
          if (res?.data && Array.isArray(res.data)) {
            list = res.data;
          }
        }
        setRegistrations(list);
      } catch (err) {
        console.error("Error loading tournament registrations:", err);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tournament]);

  // Extract unique categories from registrations
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => {
      if (r.category && r.category.trim()) set.add(r.category.trim());
    });
    return Array.from(set);
  }, [registrations]);

  // Filtered List
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const pName = r.players?.[0]?.playerName || r.teamName || "";
      const pPhone = r.players?.[0]?.phoneNumber || "";
      const tName = r.teamName || "";
      const regCode = `REG-${r.registrationId || r.id}`;

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        tName.toLowerCase().includes(search.toLowerCase()) ||
        pPhone.includes(search) ||
        regCode.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesPayment =
        paymentFilter === "ALL" ||
        (paymentFilter === "PAID" && r.paymentStatus === "PAID") ||
        (paymentFilter === "PENDING" && r.paymentStatus !== "PAID");
      const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesCategory;
    });
  }, [registrations, search, statusFilter, paymentFilter, categoryFilter]);

  // Stats
  const approvedCount = registrations.filter((r) => r.status === "APPROVED").length;
  const pendingCount = registrations.filter((r) => r.status === "PENDING").length;
  const rejectedCount = registrations.filter((r) => r.status === "REJECTED").length;
  const feeAmount = tournament.registrationFees || 500;
  const paidCount = registrations.filter((r) => r.paymentStatus === "PAID").length;
  const totalRevenue = paidCount * feeAmount;

  // Handle Approval Status Update
  const handleStatusUpdate = async (regUuid: string, newStatus: "APPROVED" | "REJECTED" | "PENDING") => {
    setActionInProgress(regUuid);
    try {
      setRegistrations((prev) =>
        prev.map((r) => ((r.uuid === regUuid || r.registrationUuid === regUuid) ? { ...r, status: newStatus } : r))
      );
      if (selectedReg && (selectedReg.uuid === regUuid || selectedReg.registrationUuid === regUuid)) {
        setSelectedReg({ ...selectedReg, status: newStatus });
      }
      await RegistrationService.updateStatus(regUuid, newStatus);
    } catch (e) {
      console.warn("Status update API sync notice:", e);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Payment Status Update
  const handlePaymentUpdate = async (regUuid: string, newPaymentStatus: "PAID" | "PENDING") => {
    setActionInProgress(regUuid);
    try {
      setRegistrations((prev) =>
        prev.map((r) =>
          (r.uuid === regUuid || r.registrationUuid === regUuid)
            ? { ...r, paymentStatus: newPaymentStatus }
            : r
        )
      );
      if (selectedReg && (selectedReg.uuid === regUuid || selectedReg.registrationUuid === regUuid)) {
        setSelectedReg({ ...selectedReg, paymentStatus: newPaymentStatus });
      }
      await RegistrationService.updatePaymentStatus(regUuid, newPaymentStatus);
    } catch (e) {
      console.warn("Payment update API sync notice:", e);
    } finally {
      setActionInProgress(null);
    }
  };

  // Share Registration Link
  const handleShareLink = () => {
    const url = `${window.location.origin}/home/tournaments/${tournament.tournamentUuid || tournament.tournamentId}/register`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ["Reg ID", "Team / Player Name", "Category", "Contact Phone", "Status", "Payment Status", "Registered Date"],
      ...filteredRegistrations.map((r) => [
        `REG-${r.registrationId || r.id}`,
        `"${r.teamName || r.players?.[0]?.playerName || "N/A"}"`,
        `"${r.category || "General"}"`,
        `"${r.players?.[0]?.phoneNumber || ""}"`,
        r.status || "PENDING",
        r.paymentStatus || "PENDING",
        r.createdAt ? formatDateStr(r.createdAt) : "N/A",
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tournament.name.replace(/\s+/g, "_")}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="min-h-screen pb-32 text-foreground transition-colors duration-200"
      style={{ backgroundColor: "var(--athlon-background)" }}
    >
      {/* ─── Mobile Detail View (Untouched) ─────────────────────────── */}
      <div className="block md:hidden">
        {/* Sticky Mobile App Bar */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between gap-2 shadow-sm safe-header"
        style={{
          backgroundColor: "var(--athlon-card)",
          borderColor: "var(--athlon-border)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl border hover:bg-black/[0.04] dark:hover:bg-white/10 text-foreground/70 hover:text-foreground transition-all active:scale-95 shrink-0"
            style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-foreground truncate">{tournament.name}</h2>
            <div className="text-[10px] text-foreground/50 flex items-center gap-1.5 truncate">
              <span className="font-extrabold text-primary uppercase">{tournament.sport || "Sport"}</span>
              <span>•</span>
              <span>{formatDateStr(tournament.startDate)}</span>
            </div>
          </div>
        </div>

        {/* Quick Icon Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleShareLink}
            className="p-2 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm"
            style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
            title="Share registration link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm"
            style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-foreground/70" />
          </button>

          <Link
            href={`/org/${orgId}/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`}
            className="p-2 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md active:scale-95 transition-all"
            title="Manage event"
          >
            <Trophy className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-3.5 space-y-3">
        {/* Horizontal Mini KPI Stat Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <div
            className="px-3 py-2 rounded-2xl border shrink-0 text-center min-w-[85px] shadow-sm"
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            <div className="text-[9px] font-black uppercase tracking-wider text-foreground/45">Total</div>
            <div className="text-base font-black text-foreground mt-0.5">{registrations.length}</div>
          </div>

          <div
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3 py-2 rounded-2xl border shrink-0 text-center min-w-[85px] shadow-sm cursor-pointer ${statusFilter === "APPROVED" ? "ring-2 ring-emerald-500" : ""
              }`}
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{approvedCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-2 rounded-2xl border shrink-0 text-center min-w-[85px] shadow-sm cursor-pointer ${pendingCount > 0 ? "ring-1 ring-amber-500/50" : ""
              } ${statusFilter === "PENDING" ? "ring-2 ring-amber-400" : ""}`}
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            <div className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending</div>
            <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</div>
          </div>

          <div
            onClick={() => setPaymentFilter(paymentFilter === "PAID" ? "ALL" : "PAID")}
            className={`px-3 py-2 rounded-2xl border shrink-0 text-center min-w-[95px] shadow-sm cursor-pointer ${paymentFilter === "PAID" ? "ring-2 ring-primary" : ""
              }`}
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            <div className="text-[9px] font-black uppercase tracking-wider text-foreground/45">Collected</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search athlete, team, phone or ID..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35 shadow-sm"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
              color: "var(--athlon-text)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: "ALL", label: "All", count: registrations.length },
            { id: "PENDING", label: "Pending", count: pendingCount, alert: pendingCount > 0 },
            { id: "APPROVED", label: "Approved", count: approvedCount },
            { id: "REJECTED", label: "Rejected", count: rejectedCount },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm font-black"
                  : "text-foreground/60 hover:text-foreground"
                  }`}
                style={
                  !isSelected
                    ? { backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }
                    : {}
                }
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${isSelected
                    ? "bg-black/25 text-primary-foreground"
                    : tab.alert
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black"
                      : "bg-black/5 dark:bg-white/10 text-foreground/50"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Chips (if any available) */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${categoryFilter === "ALL"
                ? "bg-primary/20 text-primary border border-primary/40 font-black"
                : "border text-foreground/55"
                }`}
              style={categoryFilter !== "ALL" ? { backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" } : {}}
            >
              All Categories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${categoryFilter === cat
                  ? "bg-primary/20 text-primary border border-primary/40 font-black"
                  : "border text-foreground/55"
                  }`}
                style={categoryFilter !== cat ? { backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Athlete Registration Cards */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Entries...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div
              className="py-14 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 shadow-sm"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <Users className="w-6 h-6 text-primary mb-2" />
              <h4 className="text-sm font-black text-foreground mb-1">No Entries Found</h4>
              <p className="text-xs text-foreground/50 max-w-xs mb-3">
                No registrations match your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="px-3.5 py-1.5 border text-foreground text-xs font-bold rounded-xl"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredRegistrations.map((reg, idx) => {
              const regUuid = reg.registrationUuid || reg.uuid || `reg-${reg.id || idx}`;
              const isApproved = reg.status === "APPROVED";
              const isRejected = reg.status === "REJECTED";
              const isPaid = reg.paymentStatus === "PAID";
              const primaryPlayer = reg.players?.[0];
              const displayName = reg.teamName || primaryPlayer?.playerName || "Athlete Entry";
              const regCode = `REG-${String(reg.registrationId || reg.id || idx + 1).padStart(3, "0")}`;
              const isUpdating = actionInProgress === regUuid;

              return (
                <div
                  key={regUuid}
                  className="rounded-3xl border p-4 flex flex-col justify-between shadow-sm relative overflow-hidden gap-3 group"
                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
                >
                  {/* Status Bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${isApproved ? "bg-emerald-500" : isRejected ? "bg-rose-500" : "bg-amber-400"
                      }`}
                  />

                  {/* Top: Name, ID, Dual Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-foreground truncate">{displayName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-mono text-[9px] font-black text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                            {regCode}
                          </span>
                          {reg.category && (
                            <span
                              className="text-[9px] font-bold text-foreground/60 uppercase px-1.5 py-0.2 rounded border truncate max-w-[150px]"
                              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                            >
                              {reg.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dual Status Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${isApproved
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : isRejected
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse"
                            }`}
                        >
                          {isApproved ? <CheckCircle2 className="w-2.5 h-2.5" /> : isRejected ? <XCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          {reg.status || "PENDING"}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${isPaid
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}
                        >
                          {isPaid ? `₹${feeAmount} PAID` : "UNPAID"}
                        </span>
                      </div>
                    </div>

                    {/* Roster Items */}
                    <div className="mt-2.5 space-y-1">
                      {(reg.players && reg.players.length > 0 ? reg.players : [{ playerName: displayName, phoneNumber: "" }]).map((p, pIdx) => {
                        const initial = p.playerName ? p.playerName.charAt(0).toUpperCase() : "A";
                        return (
                          <div
                            key={pIdx}
                            className="flex items-center justify-between py-1.5 px-2.5 rounded-xl border text-xs gap-2 shadow-sm"
                            style={{
                              backgroundColor: "var(--athlon-surface)",
                              borderColor: "var(--athlon-border-subtle)",
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {p.photoUrl ? (
                                <img
                                  src={p.photoUrl}
                                  alt={p.playerName}
                                  className="w-6 h-6 rounded-md object-cover border border-primary/30 shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                                  {initial}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-foreground text-xs truncate">{p.playerName}</div>
                                {p.phoneNumber && (
                                  <div className="text-[9.5px] text-foreground/50 font-mono truncate">{p.phoneNumber}</div>
                                )}
                              </div>
                            </div>

                            {/* Quick Call / WhatsApp */}
                            {p.phoneNumber && (
                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={`tel:${p.phoneNumber.replace(/\s+/g, "")}`}
                                  className="p-1 rounded-lg border hover:bg-primary/15 text-foreground/60 hover:text-primary transition-colors"
                                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border-subtle)" }}
                                  title="Call"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={`https://wa.me/${p.phoneNumber.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-lg border hover:bg-emerald-500/15 text-foreground/60 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                  style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border-subtle)" }}
                                  title="WhatsApp"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div
                    className="pt-2.5 border-t flex items-center justify-between gap-1.5"
                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      {!isApproved && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(regUuid, "APPROVED")}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}
                      {!isRejected && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(regUuid, "REJECTED")}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      )}
                      <button
                        disabled={isUpdating}
                        onClick={() => handlePaymentUpdate(regUuid, isPaid ? "PENDING" : "PAID")}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center gap-1 ${isPaid
                          ? "text-foreground/60 hover:text-foreground"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}
                        style={isPaid ? { backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" } : {}}
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>{isPaid ? "Unpaid" : "Paid"}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedReg(reg)}
                      className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 text-foreground/75 active:scale-95 transition-all ml-auto shadow-sm"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                    >
                      <Eye className="w-3 h-3 text-primary" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

      {/* ─── Luxury High-Tech Desktop Detail View (Redesigned) ────── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-24 space-y-6">
        {/* Desktop Command Navigation Bar */}
        <div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b"
          style={{ borderColor: "var(--athlon-border-subtle)" }}
        >
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border hover:bg-black/[0.04] dark:hover:bg-white/10 text-foreground/70 hover:text-foreground transition-all active:scale-95 shrink-0 shadow-xs"
              style={{
                backgroundColor: "var(--athlon-card)",
                borderColor: "var(--athlon-border)",
              }}
              title="Back to All Tournaments"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={onBack}
                  className="text-xs font-bold text-foreground/50 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>Registrations</span>
                </button>
                <span className="text-foreground/30">/</span>
                <span className="text-xs font-bold text-primary">{tournament.sport || "Tournament"}</span>
                <span className="text-foreground/30">/</span>
                <span className="text-xs font-bold text-foreground/70">Roster Management</span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                  {tournament.name}
                </h1>
                {(() => {
                  const statusCfg = getStatusBadgeConfig(tournament.status);
                  return (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-foreground/60 flex-wrap">
                <span className="font-extrabold text-foreground/80 uppercase tracking-wider">
                  {tournament.sport || "Sport"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                  {formatDateStr(tournament.startDate)} - {formatDateStr(tournament.endDate)}
                </span>
                {tournament.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                      <span>{tournament.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleShareLink}
              className="px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-xs flex items-center gap-2"
              style={{
                backgroundColor: "var(--athlon-card)",
                borderColor: "var(--athlon-border)",
              }}
              title="Copy public registration link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    Link Copied!
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-primary" />
                  <span>Share Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-xs flex items-center gap-2"
              style={{
                backgroundColor: "var(--athlon-card)",
                borderColor: "var(--athlon-border)",
              }}
              title="Download registrations CSV"
            >
              <Download className="w-4 h-4 text-foreground/70" />
              <span>Export CSV</span>
            </button>

            <Link
              href={`/org/${orgId}/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-2 hover:opacity-95"
              title="Manage tournament fixtures & settings"
            >
              <Trophy className="w-4 h-4" />
              <span>Event Console</span>
            </Link>
          </div>
        </div>

        {/* ─── 4-Metric Executive Event Telemetry HUD ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Registrations */}
          <div
            className="rounded-2xl border p-4.5 shadow-xs"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Total Registrations
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground mt-1.5">
              {registrations.length}
            </div>
            <div className="text-[11px] font-medium text-foreground/50 mt-1">
              Capacity: {tournament.playersCount || 32} slots (
              {Math.min(
                100,
                Math.round((registrations.length / (tournament.playersCount || 32)) * 100)
              )}
              % booked)
            </div>
          </div>

          {/* 2. Confirmed Roster */}
          <div
            className="rounded-2xl border p-4.5 shadow-xs"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Confirmed Roster
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
              {approvedCount}
            </div>
            <div className="text-[11px] font-medium text-foreground/50 mt-1">
              {registrations.length > 0
                ? Math.round((approvedCount / registrations.length) * 100)
                : 0}
              % of total applications
            </div>
          </div>

          {/* 3. Pending Review Queue */}
          <div
            className={`rounded-2xl border p-4.5 shadow-xs ${
              pendingCount > 0 ? "border-amber-500/40 bg-amber-500/[0.03]" : ""
            }`}
            style={{
              backgroundColor: pendingCount > 0 ? undefined : "var(--athlon-card)",
              borderColor:
                pendingCount > 0 ? "rgba(245, 158, 11, 0.35)" : "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Pending Verification
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-2">
              {pendingCount}
              {pendingCount > 0 && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-[11px] font-medium text-foreground/50 mt-1">
              {pendingCount > 0
                ? "Awaiting organizer approval"
                : "All entries processed"}
            </div>
          </div>

          {/* 4. Collected Inflow */}
          <div
            className="rounded-2xl border p-4.5 shadow-xs"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Collected Inflow
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-medium text-foreground/50 mt-1">
              {paidCount} paid @ ₹{feeAmount}/entry
            </div>
          </div>
        </div>

        {/* ─── Desktop Filter Toolbar ──────────────────────────────────── */}
        <div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: "var(--athlon-card)",
            borderColor: "var(--athlon-border)",
          }}
        >
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athlete, team, phone or ID..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/40 shadow-2xs"
              style={{
                backgroundColor: "var(--athlon-surface)",
                borderColor: "var(--athlon-border-subtle)",
                color: "var(--athlon-text)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs + Payment Pills + Category Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pills */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border"
              style={{
                backgroundColor: "var(--athlon-surface)",
                borderColor: "var(--athlon-border-subtle)",
              }}
            >
              {[
                { id: "ALL", label: "All", count: registrations.length },
                { id: "PENDING", label: "Pending", count: pendingCount, alert: pendingCount > 0 },
                { id: "APPROVED", label: "Approved", count: approvedCount },
                { id: "REJECTED", label: "Rejected", count: rejectedCount },
              ].map((tab) => {
                const isSelected = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm font-black"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-black/25 text-primary-foreground"
                          : tab.alert
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black"
                          : "bg-black/5 dark:bg-white/10 text-foreground/50"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Payment Filter Pills */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border"
              style={{
                backgroundColor: "var(--athlon-surface)",
                borderColor: "var(--athlon-border-subtle)",
              }}
            >
              {(["ALL", "PAID", "PENDING"] as const).map((pf) => {
                const isSelected = paymentFilter === pf;
                const label = pf === "ALL" ? "All Payment" : pf === "PAID" ? "Paid" : "Unpaid";
                return (
                  <button
                    key={pf}
                    onClick={() => setPaymentFilter(pf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm font-black"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Category Filter Pills (if any available) */}
            {availableCategories.length > 0 && (
              <div
                className="flex items-center gap-1 p-1 rounded-xl border"
                style={{
                  backgroundColor: "var(--athlon-surface)",
                  borderColor: "var(--athlon-border-subtle)",
                }}
              >
                <button
                  onClick={() => setCategoryFilter("ALL")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    categoryFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-sm font-black"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      categoryFilter === cat
                        ? "bg-primary text-primary-foreground shadow-sm font-black"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Desktop Data Table View ─────────────────────────────────── */}
        <div
          className="rounded-2xl border shadow-xs overflow-hidden"
          style={{
            backgroundColor: "var(--athlon-card)",
            borderColor: "var(--athlon-border)",
          }}
        >
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                Loading Registered Athletes & Teams...
              </p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-foreground mb-1">No Entries Match Filter</h4>
              <p className="text-xs text-foreground/50 max-w-sm mb-4">
                No athlete registrations found matching your selected search query or filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="px-4 py-2 border text-foreground text-xs font-bold rounded-xl transition-colors hover:border-primary"
                style={{
                  backgroundColor: "var(--athlon-surface)",
                  borderColor: "var(--athlon-border)",
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: "var(--athlon-border-subtle)",
                      backgroundColor: "var(--athlon-surface)",
                    }}
                  >
                    <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Athlete / Squad
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Reg Code & Date
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Category
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Contact & Comms
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Payment Status
                    </th>
                    <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[10.5px] text-foreground/50">
                      Approval Status
                    </th>
                    <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10.5px] text-foreground/50 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: "var(--athlon-border-subtle)" }}
                >
                  {filteredRegistrations.map((reg, idx) => {
                    const regUuid =
                      reg.registrationUuid || reg.uuid || `reg-${reg.id || idx}`;
                    const isApproved = reg.status === "APPROVED";
                    const isRejected = reg.status === "REJECTED";
                    const isPaid = reg.paymentStatus === "PAID";
                    const primaryPlayer = reg.players?.[0];
                    const displayName =
                      reg.teamName || primaryPlayer?.playerName || "Athlete Entry";
                    const regCode = `REG-${String(
                      reg.registrationId || reg.id || idx + 1
                    ).padStart(3, "0")}`;
                    const isUpdating = actionInProgress === regUuid;
                    const phone = primaryPlayer?.phoneNumber || "";

                    return (
                      <tr
                        key={regUuid}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* 1. Athlete / Squad */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {primaryPlayer?.photoUrl ? (
                              <img
                                src={primaryPlayer.photoUrl}
                                alt={displayName}
                                className="w-9 h-9 rounded-xl object-cover border border-primary/25 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-black text-foreground text-xs truncate max-w-[180px]">
                                {displayName}
                              </div>
                              {reg.players && reg.players.length > 1 && (
                                <div className="text-[10px] text-foreground/50">
                                  +{reg.players.length - 1} teammates
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Reg Code & Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-[10px] font-black text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            {regCode}
                          </span>
                          <div className="text-[10px] text-foreground/50 mt-1">
                            {formatDateStr(reg.createdAt)}
                          </div>
                        </td>

                        {/* 3. Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border text-foreground/70"
                            style={{
                              backgroundColor: "var(--athlon-surface)",
                              borderColor: "var(--athlon-border-subtle)",
                            }}
                          >
                            <Tag className="w-3 h-3 text-primary" />
                            <span>{reg.category || "General"}</span>
                          </span>
                        </td>

                        {/* 4. Contact & Comms */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {phone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-foreground/75">
                                {phone}
                              </span>
                              <a
                                href={`tel:${phone.replace(/\s+/g, "")}`}
                                className="p-1.5 rounded-lg border hover:bg-primary/15 text-foreground/60 hover:text-primary transition-colors"
                                style={{
                                  backgroundColor: "var(--athlon-surface)",
                                  borderColor: "var(--athlon-border-subtle)",
                                }}
                                title="Direct Phone Call"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border hover:bg-emerald-500/15 text-foreground/60 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                style={{
                                  backgroundColor: "var(--athlon-surface)",
                                  borderColor: "var(--athlon-border-subtle)",
                                }}
                                title="Direct WhatsApp Message"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-foreground/40 italic">
                              No Phone
                            </span>
                          )}
                        </td>

                        {/* 5. Payment Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                isPaid
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {isPaid ? `₹${feeAmount} PAID` : "UNPAID"}
                            </span>
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                handlePaymentUpdate(regUuid, isPaid ? "PENDING" : "PAID")
                              }
                              className="text-[10px] font-bold text-foreground/50 hover:text-foreground underline transition-colors disabled:opacity-50"
                              title={isPaid ? "Mark as unpaid" : "Mark as paid"}
                            >
                              {isPaid ? "Mark Unpaid" : "Mark Paid"}
                            </button>
                          </div>
                        </td>

                        {/* 6. Approval Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {!isApproved && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(regUuid, "APPROVED")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {!isRejected && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(regUuid, "REJECTED")}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            )}

                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            )}

                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 text-foreground/75 hover:text-foreground hover:border-primary transition-all shadow-2xs active:scale-95"
                            style={{
                              backgroundColor: "var(--athlon-surface)",
                              borderColor: "var(--athlon-border)",
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {selectedReg && (
        <RegistrationDetailDrawer
          registration={selectedReg}
          tournament={tournament}
          feeAmount={feeAmount}
          onClose={() => setSelectedReg(null)}
          onStatusUpdate={handleStatusUpdate}
          onPaymentUpdate={handlePaymentUpdate}
        />
      )}
    </div>
  );
}

// ─── Deep Inspection Detail Drawer Modal ────────────────────────────────────────
function RegistrationDetailDrawer({
  registration,
  tournament,
  feeAmount,
  onClose,
  onStatusUpdate,
  onPaymentUpdate,
}: {
  registration: Registration;
  tournament: Tournament;
  feeAmount: number;
  onClose: () => void;
  onStatusUpdate: (uuid: string, status: "APPROVED" | "REJECTED" | "PENDING") => Promise<void>;
  onPaymentUpdate: (uuid: string, status: "PAID" | "PENDING") => Promise<void>;
}) {
  const regUuid = registration.registrationUuid || registration.uuid || `reg-${registration.id}`;
  const isApproved = registration.status === "APPROVED";
  const isRejected = registration.status === "REJECTED";
  const isPaid = registration.paymentStatus === "PAID";
  const primaryPlayer = registration.players?.[0];
  const displayName = registration.teamName || primaryPlayer?.playerName || "Athlete Registration";
  const regCode = `REG-${String(registration.registrationId || registration.id || 1).padStart(3, "0")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity" />

      <div
        className="relative z-10 w-full max-w-lg md:max-w-2xl rounded-t-3xl md:rounded-3xl border-t md:border border-x shadow-2xl overflow-hidden flex flex-col max-h-[88vh] md:max-h-[85vh] transition-all"
        style={{
          backgroundColor: "var(--athlon-card)",
          borderColor: "var(--athlon-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="md:hidden w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20 mx-auto mt-3 shrink-0" />

        {/* Header */}
        <div
          className="p-4 border-b relative overflow-hidden shrink-0 flex items-start justify-between gap-3"
          style={{ borderColor: "var(--athlon-border-subtle)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground truncate">{displayName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[9.5px] font-black text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                  {regCode}
                </span>
                <span className="text-xs text-foreground/50 truncate">{tournament.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border text-foreground/60 hover:text-foreground"
            style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Category & Date Strip */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-foreground/45 flex items-center gap-1">
                <Tag className="w-3 h-3 text-primary" /> Category
              </span>
              <div className="text-xs font-black text-foreground mt-0.5">{registration.category || "General"}</div>
            </div>

            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-foreground/45 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Registered
              </span>
              <div className="text-xs font-black text-foreground mt-0.5">{formatDateStr(registration.createdAt)}</div>
            </div>
          </div>

          {/* Fee & Payment Card */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${isPaid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
              }`}
          >
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-foreground/55 block">Entry Fee</span>
              <div className="text-sm font-black mt-0.5 flex items-center gap-1.5">
                <span className={isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                  ₹{feeAmount}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full border ${isPaid
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }`}
                >
                  {isPaid ? "Verified" : "Unpaid"}
                </span>
              </div>
            </div>

            <button
              onClick={() => onPaymentUpdate(regUuid, isPaid ? "PENDING" : "PAID")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm ${isPaid
                ? "border text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              style={isPaid ? { backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" } : {}}
            >
              {isPaid ? "Mark Unpaid" : "Mark Paid"}
            </button>
          </div>

          {/* Athletes Roster */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground/50 flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" /> Athletes ({registration.players?.length || 1})
            </h4>

            <div className="space-y-1.5">
              {(registration.players && registration.players.length > 0
                ? registration.players
                : [{ playerName: displayName, phoneNumber: "" }]
              ).map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm"
                  style={{
                    backgroundColor: "var(--athlon-surface)",
                    borderColor: "var(--athlon-border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                      {p.playerName ? p.playerName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-foreground truncate">{p.playerName}</div>
                      <div className="text-[10px] text-foreground/50 font-mono truncate">{p.phoneNumber || "No phone"}</div>
                    </div>
                  </div>

                  {p.phoneNumber && (
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`tel:${p.phoneNumber.replace(/\s+/g, "")}`}
                        className="px-2 py-1 rounded-lg border hover:bg-primary/15 text-foreground/70 text-xs font-bold flex items-center gap-1"
                        style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <Phone className="w-3 h-3 text-primary" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${p.phoneNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg border hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1"
                        style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border-subtle)" }}
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: "var(--athlon-border-subtle)" }}>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Approval Action</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStatusUpdate(regUuid, "APPROVED")}
                className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${isApproved
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                  }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isApproved ? "✓ Approved" : "Approve"}</span>
              </button>

              <button
                onClick={() => onStatusUpdate(regUuid, "REJECTED")}
                className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${isRejected
                  ? "bg-rose-500 text-white ring-2 ring-rose-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                  }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isRejected ? "✕ Rejected" : "Reject"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t shrink-0"
          style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
        >
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border font-bold text-xs uppercase tracking-wider text-foreground/60"
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}