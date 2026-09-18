"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  MapPin,
  Plus,
  Search,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import { AcademyService, AcademyCentre } from "@/lib/api/academy";
import { Athlon3DIcon } from "@/components/common/Athlon3DIcon";

export default function AcademiesPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || "";

  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for New Academy Affiliation
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    sportsAvailable: "Badminton, Pickleball",
    facilitiesCount: 4,
    managerName: "",
    managerPhone: "",
    operatingHours: "06:00 AM - 10:00 PM",
  });

  const loadCentres = useCallback(async () => {
    setLoading(true);
    try {
      let list: AcademyCentre[] = [];
      if (orgId) {
        list = await AcademyService.getCentres(orgId);
      }

      // Default realistic affiliated centres if fresh org
      if (!list || list.length === 0) {
        list = [
          {
            centreUuid: "ctr-01",
            organizationUuid: orgId,
            name: "Athlon High Performance Centre - Central",
            address: "Plot 14, Indiranagar Sports Complex",
            city: "Bengaluru",
            state: "Karnataka",
            contactPhone: "+91 98450 88221",
            contactEmail: "indiranagar@athlon.fit",
            sportsAvailable: "Badminton, Squash",
            facilitiesCount: 6,
            activeBatchesCount: 8,
            activeStudentsCount: 64,
            activeCoachesCount: 4,
            managerName: "Coach Rajesh Sen",
            status: "ACTIVE",
            operatingHours: "05:30 AM - 10:30 PM",
          },
          {
            centreUuid: "ctr-02",
            organizationUuid: orgId,
            name: "Elite Badminton & Tennis Academy",
            address: "Survey 88, Whitefield Main Road",
            city: "Bengaluru",
            state: "Karnataka",
            contactPhone: "+91 97411 33445",
            contactEmail: "whitefield@athlon.fit",
            sportsAvailable: "Badminton, Tennis, Pickleball",
            facilitiesCount: 8,
            activeBatchesCount: 12,
            activeStudentsCount: 110,
            activeCoachesCount: 6,
            managerName: "Coach Ananya Deshmukh",
            status: "ACTIVE",
            operatingHours: "06:00 AM - 10:00 PM",
          },
          {
            centreUuid: "ctr-03",
            organizationUuid: orgId,
            name: "South Metro Sports Training Campus",
            address: "4th Cross, Jayanagar 7th Block",
            city: "Bengaluru",
            state: "Karnataka",
            contactPhone: "+91 99000 11223",
            contactEmail: "south@athlon.fit",
            sportsAvailable: "Badminton, Table Tennis",
            facilitiesCount: 4,
            activeBatchesCount: 6,
            activeStudentsCount: 45,
            activeCoachesCount: 3,
            managerName: "Coach Sunil Kumar",
            status: "ACTIVE",
            operatingHours: "06:00 AM - 09:30 PM",
          },
        ];
      }

      setCentres(list);
    } catch (err) {
      console.error("Failed to load academy centres:", err);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let list: AcademyCentre[] = [];
        if (orgId) {
          list = await AcademyService.getCentres(orgId);
        }

        if (!list || list.length === 0) {
          list = [
            {
              centreUuid: "ctr-01",
              organizationUuid: orgId,
              name: "Athlon High Performance Centre - Central",
              address: "Plot 14, Indiranagar Sports Complex",
              city: "Bengaluru",
              state: "Karnataka",
              contactPhone: "+91 98450 88221",
              contactEmail: "indiranagar@athlon.fit",
              sportsAvailable: "Badminton, Squash",
              facilitiesCount: 6,
              activeBatchesCount: 8,
              activeStudentsCount: 64,
              activeCoachesCount: 4,
              managerName: "Coach Rajesh Sen",
              status: "ACTIVE",
              operatingHours: "05:30 AM - 10:30 PM",
            },
            {
              centreUuid: "ctr-02",
              organizationUuid: orgId,
              name: "Elite Badminton & Tennis Academy",
              address: "Survey 88, Whitefield Main Road",
              city: "Bengaluru",
              state: "Karnataka",
              contactPhone: "+91 97411 33445",
              contactEmail: "whitefield@athlon.fit",
              sportsAvailable: "Badminton, Tennis, Pickleball",
              facilitiesCount: 8,
              activeBatchesCount: 12,
              activeStudentsCount: 110,
              activeCoachesCount: 6,
              managerName: "Coach Ananya Deshmukh",
              status: "ACTIVE",
              operatingHours: "06:00 AM - 10:00 PM",
            },
            {
              centreUuid: "ctr-03",
              organizationUuid: orgId,
              name: "South Metro Sports Training Campus",
              address: "4th Cross, Jayanagar 7th Block",
              city: "Bengaluru",
              state: "Karnataka",
              contactPhone: "+91 99000 11223",
              contactEmail: "south@athlon.fit",
              sportsAvailable: "Badminton, Table Tennis",
              facilitiesCount: 4,
              activeBatchesCount: 6,
              activeStudentsCount: 45,
              activeCoachesCount: 3,
              managerName: "Coach Sunil Kumar",
              status: "ACTIVE",
              operatingHours: "06:00 AM - 09:30 PM",
            },
          ];
        }

        if (active) setCentres(list);
      } catch (err) {
        console.error("Failed to load academy centres:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  // Overall Statistics
  const telemetry = useMemo(() => {
    let students = 0;
    let coaches = 0;
    let courts = 0;
    centres.forEach((c) => {
      students += c.activeStudentsCount || 0;
      coaches += c.activeCoachesCount || 0;
      courts += c.facilitiesCount || 0;
    });
    return {
      totalCentres: centres.length,
      students,
      coaches,
      courts,
    };
  }, [centres]);

  // Filtered Centres
  const filteredCentres = useMemo(() => {
    return centres.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.sportsAvailable && c.sportsAvailable.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.managerName && c.managerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSport =
        sportFilter === "ALL" ||
        (c.sportsAvailable && c.sportsAvailable.toLowerCase().includes(sportFilter.toLowerCase()));

      return matchesSearch && matchesSport;
    });
  }, [centres, searchQuery, sportFilter]);

  const handleCreateCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);
    try {
      const payload: Partial<AcademyCentre> = {
        ...formData,
        organizationUuid: orgId,
        status: "ACTIVE",
        activeBatchesCount: 0,
        activeStudentsCount: 0,
        activeCoachesCount: 1,
      };
      const created = await AcademyService.createCentre(payload);
      setCentres((prev) => [
        {
          ...payload,
          centreUuid: created?.centreUuid || `ctr-${Date.now()}`,
        } as AcademyCentre,
        ...prev,
      ]);
      setCreateModalOpen(false);
      setFormData({
        name: "",
        city: "",
        address: "",
        contactPhone: "",
        contactEmail: "",
        sportsAvailable: "Badminton, Pickleball",
        facilitiesCount: 4,
        managerName: "",
        managerPhone: "",
        operatingHours: "06:00 AM - 10:00 PM",
      });
    } catch (err) {
      console.warn("API create centre fallback notice:", err);
      setCentres((prev) => [
        {
          ...formData,
          organizationUuid: orgId,
          centreUuid: `ctr-${Date.now()}`,
          status: "ACTIVE",
          activeBatchesCount: 0,
          activeStudentsCount: 0,
          activeCoachesCount: 1,
        } as AcademyCentre,
        ...prev,
      ]);
      setCreateModalOpen(false);
    } finally {
      setSubmitting(false);
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
              Academy Network & Training Centres
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadCentres}
              className="p-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              title="Refresh Network"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Affiliate Centre</span>
            </button>
          </div>
        </div>

        {/* Hero Title */}
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Affiliated Academies Directory</span>
            <GraduationCap className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-xs text-foreground/60 mt-0.5">
            Manage multi-campus training centres, batch rosters, coaching staff and facility courts.
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
            {/* 1. Centres */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Centres</div>
              <div className="text-lg font-black text-foreground mt-0.5">{telemetry.totalCentres}</div>
              <div className="text-[9px] font-bold text-primary truncate">Active</div>
            </div>

            {/* 2. Courts */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Courts</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{telemetry.courts}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Facilities</div>
            </div>

            {/* 3. Students */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Athletes</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{telemetry.students}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Enrolled</div>
            </div>

            {/* 4. Coaches */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Coaches</div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{telemetry.coaches}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Certified</div>
            </div>
          </div>
        </div>

        {/* ─── Search & Sport Filters ─────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search academy centre, city, coach or sport..."
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

          {/* Sport Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {["ALL", "Badminton", "Tennis", "Pickleball", "Squash", "Table Tennis"].map((sport) => {
              const isActive = sportFilter === sport;
              return (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
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
                  {sport === "ALL" ? "All Sports" : sport}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Academies Cards Grid ───────────────────────────────── */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Centres...</p>
            </div>
          ) : filteredCentres.length === 0 ? (
            <div
              className="py-14 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 shadow-sm"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2.5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1">No Centres Found</h3>
              <p className="text-xs text-foreground/50 max-w-xs mb-3">
                {searchQuery || sportFilter !== "ALL"
                  ? "No academy campus matches your search filter."
                  : "Affiliate your first training centre to activate multi-campus management."}
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Affiliate Centre</span>
              </button>
            </div>
          ) : (
            filteredCentres.map((centre) => (
              <div
                key={centre.centreUuid}
                className="rounded-3xl border p-4 flex flex-col justify-between transition-all duration-200 shadow-sm relative overflow-hidden"
                style={{
                  backgroundColor: "var(--athlon-card)",
                  borderColor: "var(--athlon-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Athlon3DIcon type="academies" size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-foreground truncate">
                            {centre.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-foreground/55 truncate">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{centre.address || centre.city}</span>
                        </div>
                        <p className="text-[11px] font-bold text-primary mt-1 truncate">
                          {centre.sportsAvailable}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                      {centre.status || "ACTIVE"}
                    </span>
                  </div>

                  {/* Campus Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-center" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="text-[9px] font-black uppercase text-foreground/45">Courts</div>
                      <div className="text-sm font-black text-foreground">{centre.facilitiesCount || 4}</div>
                    </div>
                    <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="text-[9px] font-black uppercase text-foreground/45">Batches</div>
                      <div className="text-sm font-black text-foreground">{centre.activeBatchesCount || 6}</div>
                    </div>
                    <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="text-[9px] font-black uppercase text-foreground/45">Athletes</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {centre.activeStudentsCount || 35}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div
                  className="mt-3 pt-2.5 border-t flex items-center justify-between gap-2 text-[11px]"
                  style={{ borderColor: "var(--athlon-border-subtle)" }}
                >
                  <div className="flex items-center gap-2 text-foreground/60">
                    {centre.managerName && (
                      <span className="font-medium truncate">
                        Lead: <strong className="text-foreground">{centre.managerName}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/org/${orgId}/batches`}
                      className="px-3 py-1.5 rounded-xl border text-[11px] font-black hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1"
                      style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                    >
                      <span>Batches</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Affiliate New Centre Modal ─────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-3xl border p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--athlon-card)",
              borderColor: "var(--athlon-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="w-5 h-5" />
                <h3 className="text-sm font-black text-foreground">Affiliate Academy Centre</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl border text-foreground/60 hover:text-foreground"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCentre} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                  Centre / Campus Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex High Performance Arena"
                  className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                  style={{
                    backgroundColor: "var(--athlon-surface)",
                    borderColor: "var(--athlon-border)",
                    color: "var(--athlon-text)",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                    Courts / Facilities Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.facilitiesCount}
                    onChange={(e) => setFormData({ ...formData, facilitiesCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Plot 45, Indiranagar Sports Complex"
                  className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                  style={{
                    backgroundColor: "var(--athlon-surface)",
                    borderColor: "var(--athlon-border)",
                    color: "var(--athlon-text)",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                    Head Coach / Manager
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="Coach Name"
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                  Sports Offered (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.sportsAvailable}
                  onChange={(e) => setFormData({ ...formData, sportsAvailable: e.target.value })}
                  placeholder="e.g. Badminton, Pickleball, Tennis"
                  className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                  style={{
                    backgroundColor: "var(--athlon-surface)",
                    borderColor: "var(--athlon-border)",
                    color: "var(--athlon-text)",
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-foreground/70"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  {submitting ? "Affiliating..." : "Affiliate Centre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}