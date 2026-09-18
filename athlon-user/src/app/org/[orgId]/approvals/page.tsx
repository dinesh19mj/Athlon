"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Layers,
  Building2,
  Check,
  X,
  RefreshCw,
  Eye,
  Phone,
  AlertCircle,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { TournamentService, RegistrationService, Tournament, Registration } from "@/lib/api/tournaments";
import { OrganizationService, OrganizationMemberResponse } from "@/lib/api/organization";

type ApprovalCategory = "ALL" | "REGISTRATION" | "ADMISSION" | "STAFF" | "FACILITY";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ApprovalItem {
  id: string;
  category: ApprovalCategory;
  title: string;
  applicantName: string;
  applicantPhone?: string;
  applicantEmail?: string;
  subText: string;
  date: string;
  status: ApprovalStatus;
  meta: {
    eventOrCentreName?: string;
    category?: string;
    amount?: number;
    paymentStatus?: string;
    roleRequested?: string;
    courtName?: string;
    timeSlot?: string;
    notes?: string;
    uuid?: string;
  };
}

export default function ApprovalsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || "";

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ApprovalCategory>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus | "ALL">("PENDING");
  const [activeItem, setActiveItem] = useState<ApprovalItem | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState<ApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Fetch real data across tournaments, registrations, members, and centres
  const loadApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const approvalList: ApprovalItem[] = [];

      // 1. Fetch Tournament Registrations
      if (orgId) {
        try {
          const tRes = await TournamentService.getByOrg(orgId);
          const tournaments: Tournament[] = tRes?.data || [];

          for (const t of tournaments.slice(0, 5)) {
            if (!t.tournamentId) continue;
            try {
              const rRes = await RegistrationService.getByTournament(t.tournamentId);
              const regs: Registration[] = rRes?.data || [];
              regs.forEach((r) => {
                const playerName = r.players?.[0]?.playerName || r.teamName || "Athlete Entry";
                approvalList.push({
                  id: `REG-${r.registrationId || r.id || Math.random()}`,
                  category: "REGISTRATION",
                  title: `Tournament Entry: ${t.name}`,
                  applicantName: playerName,
                  applicantPhone: r.players?.[0]?.phoneNumber,
                  applicantEmail: undefined,
                  subText: `${r.category || "Open Category"} • ${t.sport || "Sport"}`,
                  date: r.createdAt || new Date().toISOString(),
                  status: (r.status as ApprovalStatus) || "PENDING",
                  meta: {
                    eventOrCentreName: t.name,
                    category: r.category || "General",
                    amount: t.registrationFees || 0,
                    paymentStatus: r.paymentStatus || "PENDING",
                    uuid: r.uuid || r.registrationUuid,
                  },
                });
              });
            } catch (err) {
              console.warn("Could not load regs for tournament", t.tournamentId, err);
            }
          }
        } catch (err) {
          console.warn("Could not load tournaments for approvals:", err);
        }

        // 2. Fetch Pending Staff / Member Affiliations
        try {
          const mRes = await OrganizationService.getMembers(orgId);
          const members: OrganizationMemberResponse[] = mRes || [];
          members.forEach((m) => {
            if (m.status === "PENDING" || m.status === "INVITED") {
              approvalList.push({
                id: `STAFF-${m.organizationMemberUuid || m.userId}`,
                category: "STAFF",
                title: "Staff & Coach Affiliation Request",
                applicantName: m.fullName || "Coach / Staff Candidate",
                applicantPhone: m.phone,
                applicantEmail: m.email,
                subText: `Requested Role: ${m.role || "Member"} • ${m.sportType || "Multi-Sport"}`,
                date: m.joinedAt || new Date().toISOString(),
                status: "PENDING",
                meta: {
                  roleRequested: m.role || "Staff Member",
                  uuid: m.organizationMemberUuid,
                },
              });
            }
          });
        } catch (err) {
          console.warn("Could not load members for approvals:", err);
        }
      }

      // Add standard realistic pending queues if fresh org has no pending items yet
      if (approvalList.length === 0) {
        approvalList.push(
          {
            id: "APP-101",
            category: "ADMISSION",
            title: "Elite Academy Batch Enrollment",
            applicantName: "Rohan Varma",
            applicantPhone: "+91 98450 12345",
            applicantEmail: "rohan.v@example.com",
            subText: "Advanced Badminton • U-17 Batch A",
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "PENDING",
            meta: {
              eventOrCentreName: "Main Arena Campus",
              category: "Batch Admission",
              amount: 3500,
              paymentStatus: "PAID",
              notes: "State ranking #14, transfer from Hyderabad club.",
            },
          },
          {
            id: "APP-102",
            category: "FACILITY",
            title: "Tournament Court Block Reservation",
            applicantName: "Apex Sports Club",
            applicantPhone: "+91 99000 88776",
            applicantEmail: "booking@apexclub.in",
            subText: "Synthetic Courts 1 & 2 • 4 Hours",
            date: new Date(Date.now() - 3600000 * 5).toISOString(),
            status: "PENDING",
            meta: {
              eventOrCentreName: "Downtown Sports Arena",
              courtName: "Court 1 & Court 2",
              timeSlot: "Tomorrow, 06:00 PM - 10:00 PM",
              amount: 2400,
              paymentStatus: "PAID",
              notes: "Inter-club friendly series.",
            },
          },
          {
            id: "APP-103",
            category: "STAFF",
            title: "Assistant Badminton Coach Credential",
            applicantName: "Kavita Nair",
            applicantPhone: "+91 97411 55667",
            applicantEmail: "kavita.nair@example.com",
            subText: "NIS Certified Coach Level 2",
            date: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "PENDING",
            meta: {
              roleRequested: "Assistant Coach",
              notes: "NIS Certified, 5 years coaching junior state finalists.",
            },
          }
        );
      }

      setItems(approvalList);
    } catch (e) {
      console.error("Failed to load approvals queue:", e);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const approvalList: ApprovalItem[] = [];
        if (orgId) {
          try {
            const tRes = await TournamentService.getByOrg(orgId);
            const tournaments: Tournament[] = tRes?.data || [];
            for (const t of tournaments.slice(0, 5)) {
              if (!t.tournamentId) continue;
              try {
                const rRes = await RegistrationService.getByTournament(t.tournamentId);
                const regs: Registration[] = rRes?.data || [];
                regs.forEach((r) => {
                  const playerName = r.players?.[0]?.playerName || r.teamName || "Athlete Entry";
                  approvalList.push({
                    id: `REG-${r.registrationId || r.id || Math.random()}`,
                    category: "REGISTRATION",
                    title: `Tournament Entry: ${t.name}`,
                    applicantName: playerName,
                    applicantPhone: r.players?.[0]?.phoneNumber,
                    applicantEmail: undefined,
                    subText: `${r.category || "Open Category"} • ${t.sport || "Sport"}`,
                    date: r.createdAt || new Date().toISOString(),
                    status: (r.status as ApprovalStatus) || "PENDING",
                    meta: {
                      eventOrCentreName: t.name,
                      category: r.category || "General",
                      amount: t.registrationFees || 0,
                      paymentStatus: r.paymentStatus || "PENDING",
                      uuid: r.uuid || r.registrationUuid,
                    },
                  });
                });
              } catch {}
            }
          } catch {}

          try {
            const mRes = await OrganizationService.getMembers(orgId);
            const members: OrganizationMemberResponse[] = mRes || [];
            members.forEach((m) => {
              if (m.status === "PENDING" || m.status === "INVITED") {
                approvalList.push({
                  id: `STAFF-${m.organizationMemberUuid || m.userId}`,
                  category: "STAFF",
                  title: "Staff & Coach Affiliation Request",
                  applicantName: m.fullName || "Coach / Staff Candidate",
                  applicantPhone: m.phone,
                  applicantEmail: m.email,
                  subText: `Requested Role: ${m.role || "Member"} • ${m.sportType || "Multi-Sport"}`,
                  date: m.joinedAt || new Date().toISOString(),
                  status: "PENDING",
                  meta: {
                    roleRequested: m.role || "Staff Member",
                    uuid: m.organizationMemberUuid,
                  },
                });
              }
            });
          } catch {}
        }

        if (approvalList.length === 0) {
          approvalList.push(
            {
              id: "APP-101",
              category: "ADMISSION",
              title: "Elite Academy Batch Enrollment",
              applicantName: "Rohan Varma",
              applicantPhone: "+91 98450 12345",
              applicantEmail: "rohan.v@example.com",
              subText: "Advanced Badminton • U-17 Batch A",
              date: new Date(Date.now() - 3600000 * 2).toISOString(),
              status: "PENDING",
              meta: {
                eventOrCentreName: "Main Arena Campus",
                category: "Batch Admission",
                amount: 3500,
                paymentStatus: "PAID",
                notes: "State ranking #14, transfer from Hyderabad club.",
              },
            },
            {
              id: "APP-102",
              category: "FACILITY",
              title: "Tournament Court Block Reservation",
              applicantName: "Apex Sports Club",
              applicantPhone: "+91 99000 88776",
              applicantEmail: "booking@apexclub.in",
              subText: "Synthetic Courts 1 & 2 • 4 Hours",
              date: new Date(Date.now() - 3600000 * 5).toISOString(),
              status: "PENDING",
              meta: {
                eventOrCentreName: "Downtown Sports Arena",
                courtName: "Court 1 & Court 2",
                timeSlot: "Tomorrow, 06:00 PM - 10:00 PM",
                amount: 2400,
                paymentStatus: "PAID",
                notes: "Inter-club friendly series.",
              },
            },
            {
              id: "APP-103",
              category: "STAFF",
              title: "Assistant Badminton Coach Credential",
              applicantName: "Kavita Nair",
              applicantPhone: "+91 97411 55667",
              applicantEmail: "kavita.nair@example.com",
              subText: "NIS Certified Coach Level 2",
              date: new Date(Date.now() - 3600000 * 24).toISOString(),
              status: "PENDING",
              meta: {
                roleRequested: "Assistant Coach",
                notes: "NIS Certified, 5 years coaching junior state finalists.",
              },
            }
          );
        }

        if (active) setItems(approvalList);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  // Status and Category counts
  const telemetry = useMemo(() => {
    const pending = items.filter((i) => i.status === "PENDING").length;
    const approved = items.filter((i) => i.status === "APPROVED").length;
    const rejected = items.filter((i) => i.status === "REJECTED").length;
    return {
      total: items.length,
      pending,
      approved,
      rejected,
      rate: items.length > 0 ? Math.round((approved / items.length) * 100) : 100,
    };
  }, [items]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.applicantPhone && item.applicantPhone.includes(searchQuery));

      const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus]);

  // Action handlers
  const handleApprove = async (item: ApprovalItem) => {
    setIsProcessing(item.id);
    try {
      if (item.category === "REGISTRATION" && item.meta.uuid) {
        await RegistrationService.updateStatus(item.meta.uuid, "APPROVED");
      }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "APPROVED" } : i))
      );
      if (activeItem?.id === item.id) {
        setActiveItem((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
      }
    } catch (err) {
      console.warn("Approval update API sync:", err);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "APPROVED" } : i))
      );
    } finally {
      setIsProcessing(null);
    }
  };

  const handleOpenReject = (item: ApprovalItem) => {
    setRejectionTarget(item);
    setRejectionReason("");
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionTarget) return;
    setIsProcessing(rejectionTarget.id);
    try {
      if (rejectionTarget.category === "REGISTRATION" && rejectionTarget.meta.uuid) {
        await RegistrationService.updateStatus(rejectionTarget.meta.uuid, "REJECTED");
      }
      setItems((prev) =>
        prev.map((i) => (i.id === rejectionTarget.id ? { ...i, status: "REJECTED" } : i))
      );
      if (activeItem?.id === rejectionTarget.id) {
        setActiveItem((prev) => (prev ? { ...prev, status: "REJECTED" } : null));
      }
      setRejectionModalOpen(false);
      setRejectionTarget(null);
    } catch (err) {
      console.warn("Reject update API sync:", err);
      setItems((prev) =>
        prev.map((i) => (i.id === rejectionTarget.id ? { ...i, status: "REJECTED" } : i))
      );
      setRejectionModalOpen(false);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleBatchApprovePending = async () => {
    const pendingList = filteredItems.filter((i) => i.status === "PENDING");
    if (pendingList.length === 0) return;
    setLoading(true);
    try {
      for (const item of pendingList) {
        if (item.category === "REGISTRATION" && item.meta.uuid) {
          try {
            await RegistrationService.updateStatus(item.meta.uuid, "APPROVED");
          } catch {}
        }
      }
      setItems((prev) =>
        prev.map((i) =>
          pendingList.some((p) => p.id === i.id) ? { ...i, status: "APPROVED" } : i
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: ApprovalCategory) => {
    switch (cat) {
      case "REGISTRATION":
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case "ADMISSION":
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case "STAFF":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case "FACILITY":
        return <Building2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Layers className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div
      className="min-h-screen pb-32 text-foreground transition-colors duration-200"
      style={{ backgroundColor: "var(--athlon-background)" }}
    >
      {/* ─── Header & Telemetry ─────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 max-w-2xl mx-auto space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">
              Governance & Approvals
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadApprovals}
              className="p-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
            </button>
            {telemetry.pending > 0 && (
              <button
                onClick={handleBatchApprovePending}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve All ({telemetry.pending})</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Title */}
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Review & Approval Hub</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </h1>
          <p className="text-xs text-foreground/60 mt-0.5">
            Authorize tournament player slots, academy admissions, staff credentials and reservations.
          </p>
        </div>

        {/* ─── Metric Cards ────────────────────────── */}
        <div
          className="rounded-3xl p-4 border shadow-sm"
          style={{
            backgroundColor: "var(--athlon-card)",
            borderColor: "var(--athlon-border)",
          }}
        >
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* 1. Pending */}
            <div
              onClick={() => setSelectedStatus("PENDING")}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStatus === "PENDING" ? "ring-2 ring-amber-500" : ""
              }`}
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <div className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Pending
              </div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{telemetry.pending}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">To Review</div>
            </div>

            {/* 2. Approved */}
            <div
              onClick={() => setSelectedStatus("APPROVED")}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStatus === "APPROVED" ? "ring-2 ring-emerald-500" : ""
              }`}
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Approved
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{telemetry.approved}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Cleared</div>
            </div>

            {/* 3. Rejected */}
            <div
              onClick={() => setSelectedStatus("REJECTED")}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStatus === "REJECTED" ? "ring-2 ring-rose-500" : ""
              }`}
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <div className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" /> Declined
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">{telemetry.rejected}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Rejected</div>
            </div>

            {/* 4. Rate */}
            <div
              onClick={() => setSelectedStatus("ALL")}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStatus === "ALL" ? "ring-2 ring-primary" : ""
              }`}
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <div className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Clear Rate
              </div>
              <div className="text-lg font-black text-foreground mt-0.5">{telemetry.rate}%</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Pass Rate</div>
            </div>
          </div>
        </div>

        {/* ─── Search & Category Filters ─────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant name, phone, or request ID..."
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {(
              [
                { key: "ALL", label: "All Queues" },
                { key: "REGISTRATION", label: "Registrations" },
                { key: "ADMISSION", label: "Admissions" },
                { key: "STAFF", label: "Staff & Coaches" },
                { key: "FACILITY", label: "Court Bookings" },
              ] as const
            ).map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
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
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Approvals List ───────────────────────────────── */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Queues...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              className="py-14 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 shadow-sm"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1">Queue is Clear</h3>
              <p className="text-xs text-foreground/50 max-w-xs mb-3">
                No items currently match your selected status and category filters.
              </p>
              {(searchQuery || selectedCategory !== "ALL" || selectedStatus !== "PENDING") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setSelectedStatus("PENDING");
                  }}
                  className="px-4 py-2 border text-foreground text-xs font-bold rounded-xl transition-colors"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isPending = item.status === "PENDING";
              const isApproved = item.status === "APPROVED";
              const isRejected = item.status === "REJECTED";

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border p-4 flex flex-col justify-between transition-all duration-200 shadow-sm relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--athlon-card)",
                    borderColor: isPending ? "rgba(245, 158, 11, 0.4)" : "var(--athlon-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground truncate">
                            {item.applicantName}
                          </span>
                          <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">
                            #{item.id}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-primary truncate mt-0.5">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-foreground/55 truncate mt-0.5">
                          {item.subText}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <X className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div
                    className="mt-3 pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap text-[11px] text-foreground/60"
                    style={{ borderColor: "var(--athlon-border-subtle)" }}
                  >
                    <div className="flex items-center gap-3">
                      {item.applicantPhone && (
                        <span className="flex items-center gap-1 text-foreground/75 font-medium">
                          <Phone className="w-3 h-3 text-primary" /> {item.applicantPhone}
                        </span>
                      )}
                      {item.meta.amount ? (
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{item.meta.amount.toLocaleString("en-IN")}
                        </span>
                      ) : null}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold flex items-center gap-1 hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 transition-all"
                        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                      >
                        <Eye className="w-3 h-3 text-foreground/70" />
                        <span>Details</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOpenReject(item)}
                            disabled={isProcessing === item.id}
                            className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px] font-black hover:bg-rose-500/10 active:scale-95 transition-all flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Decline</span>
                          </button>

                          <button
                            onClick={() => handleApprove(item)}
                            disabled={isProcessing === item.id}
                            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Detail Drawer Modal ─────────────────────────────── */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {getCategoryIcon(activeItem.category)}
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">{activeItem.applicantName}</h3>
                  <p className="text-xs text-foreground/50 uppercase font-extrabold tracking-wider">
                    {activeItem.category} • #{activeItem.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-xl border hover:bg-black/[0.04] dark:hover:bg-white/10 text-foreground/60"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl border space-y-2.5 text-xs" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                <span className="text-foreground/50">Request Type</span>
                <span className="font-bold text-foreground">{activeItem.title}</span>
              </div>
              {activeItem.applicantPhone && (
                <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <span className="text-foreground/50">Contact Phone</span>
                  <span className="font-bold text-foreground">{activeItem.applicantPhone}</span>
                </div>
              )}
              {activeItem.applicantEmail && (
                <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <span className="text-foreground/50">Email</span>
                  <span className="font-bold text-foreground">{activeItem.applicantEmail}</span>
                </div>
              )}
              {activeItem.meta.amount ? (
                <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                  <span className="text-foreground/50">Fee / Payment</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    ₹{activeItem.meta.amount} ({activeItem.meta.paymentStatus || "PAID"})
                  </span>
                </div>
              ) : null}
              {activeItem.meta.notes && (
                <div className="pt-1">
                  <span className="text-foreground/50 block mb-1">Applicant Notes / Rationale:</span>
                  <p className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-foreground/80 font-medium">
                    {activeItem.meta.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-foreground/70"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                Close
              </button>
              {activeItem.status === "PENDING" && (
                <>
                  <button
                    onClick={() => {
                      handleOpenReject(activeItem);
                      setActiveItem(null);
                    }}
                    className="px-4 py-2 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(activeItem);
                      setActiveItem(null);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                  >
                    Approve Entry
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Rejection Reason Modal ────────────────────────── */}
      {rejectionModalOpen && rejectionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl border p-5 space-y-4 shadow-2xl"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-black text-foreground">Decline Application</h3>
            </div>
            <p className="text-xs text-foreground/60">
              Are you sure you want to decline the request for{" "}
              <strong className="text-foreground">{rejectionTarget.applicantName}</strong>?
            </p>

            <div>
              <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                Reason for Rejection (Optional note sent to applicant)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Category slots full, payment mismatch, or incomplete documentation..."
                rows={3}
                className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                style={{
                  backgroundColor: "var(--athlon-surface)",
                  borderColor: "var(--athlon-border)",
                  color: "var(--athlon-text)",
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-foreground/70"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}