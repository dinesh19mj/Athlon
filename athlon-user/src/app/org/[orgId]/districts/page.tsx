"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Search,
  Plus,
  RefreshCw,
  X,
  Globe,
  UserCheck,
} from "lucide-react";
import { Athlon3DIcon } from "@/components/common/Athlon3DIcon";

interface DistrictChapter {
  id: string;
  name: string;
  code: string;
  zone: string;
  state: string;
  secretaryName: string;
  secretaryPhone?: string;
  secretaryEmail?: string;
  affiliatedClubsCount: number;
  sanctionedTournamentsCount: number;
  registeredPlayersCount: number;
  status: "ACTIVE" | "PENDING_RENEWAL" | "PROVISIONAL";
}

export default function DistrictsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || "";

  const [districts, setDistricts] = useState<DistrictChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New District Chapter Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    zone: "Central Zone",
    state: "Karnataka",
    secretaryName: "",
    secretaryPhone: "",
    secretaryEmail: "",
    affiliatedClubsCount: 12,
  });

  const loadDistricts = useCallback(async () => {
    setLoading(true);
    try {
      // Realistic District Association Chapters
      const list: DistrictChapter[] = [
        {
          id: "DIST-01",
          name: "Bengaluru Urban District Badminton Association",
          code: "BLR-U",
          zone: "South Zone",
          state: "Karnataka",
          secretaryName: "N. Ramachandran",
          secretaryPhone: "+91 98450 77112",
          secretaryEmail: "secretary.blr@budba.in",
          affiliatedClubsCount: 48,
          sanctionedTournamentsCount: 14,
          registeredPlayersCount: 850,
          status: "ACTIVE",
        },
        {
          id: "DIST-02",
          name: "Mysuru District Sports Federation",
          code: "MYS-D",
          zone: "South Zone",
          state: "Karnataka",
          secretaryName: "Dr. K. Swamy",
          secretaryPhone: "+91 94480 33221",
          secretaryEmail: "contact@mysurusports.org",
          affiliatedClubsCount: 22,
          sanctionedTournamentsCount: 6,
          registeredPlayersCount: 420,
          status: "ACTIVE",
        },
        {
          id: "DIST-03",
          name: "Dakshina Kannada District Chapter",
          code: "DK-01",
          zone: "Coastal Zone",
          state: "Karnataka",
          secretaryName: "Praveen Alva",
          secretaryPhone: "+91 98800 66554",
          secretaryEmail: "alva@dksports.in",
          affiliatedClubsCount: 18,
          sanctionedTournamentsCount: 5,
          registeredPlayersCount: 310,
          status: "ACTIVE",
        },
        {
          id: "DIST-04",
          name: "Hubballi-Dharwad District Association",
          code: "HBD-01",
          zone: "North Zone",
          state: "Karnataka",
          secretaryName: "Girish Kulkarni",
          secretaryPhone: "+91 97420 99881",
          secretaryEmail: "hdba@karnatakasports.in",
          affiliatedClubsCount: 15,
          sanctionedTournamentsCount: 4,
          registeredPlayersCount: 260,
          status: "PROVISIONAL",
        },
      ];

      setDistricts(list);
    } catch (err) {
      console.error("Failed to load district chapters:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list: DistrictChapter[] = [
          {
            id: "DIST-01",
            name: "Bengaluru Urban District Badminton Association",
            code: "BLR-U",
            zone: "South Zone",
            state: "Karnataka",
            secretaryName: "N. Ramachandran",
            secretaryPhone: "+91 98450 77112",
            secretaryEmail: "secretary.blr@budba.in",
            affiliatedClubsCount: 48,
            sanctionedTournamentsCount: 14,
            registeredPlayersCount: 850,
            status: "ACTIVE",
          },
          {
            id: "DIST-02",
            name: "Mysuru District Sports Federation",
            code: "MYS-D",
            zone: "South Zone",
            state: "Karnataka",
            secretaryName: "Dr. K. Swamy",
            secretaryPhone: "+91 94480 33221",
            secretaryEmail: "contact@mysurusports.org",
            affiliatedClubsCount: 22,
            sanctionedTournamentsCount: 6,
            registeredPlayersCount: 420,
            status: "ACTIVE",
          },
          {
            id: "DIST-03",
            name: "Dakshina Kannada District Chapter",
            code: "DK-01",
            zone: "Coastal Zone",
            state: "Karnataka",
            secretaryName: "Praveen Alva",
            secretaryPhone: "+91 98800 66554",
            secretaryEmail: "alva@dksports.in",
            affiliatedClubsCount: 18,
            sanctionedTournamentsCount: 5,
            registeredPlayersCount: 310,
            status: "ACTIVE",
          },
          {
            id: "DIST-04",
            name: "Hubballi-Dharwad District Association",
            code: "HBD-01",
            zone: "North Zone",
            state: "Karnataka",
            secretaryName: "Girish Kulkarni",
            secretaryPhone: "+91 97420 99881",
            secretaryEmail: "hdba@karnatakasports.in",
            affiliatedClubsCount: 15,
            sanctionedTournamentsCount: 4,
            registeredPlayersCount: 260,
            status: "PROVISIONAL",
          },
        ];

        if (active) setDistricts(list);
      } catch (err) {
        console.error("Failed to load district chapters:", err);
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
    let clubs = 0;
    let tournaments = 0;
    let athletes = 0;
    districts.forEach((d) => {
      clubs += d.affiliatedClubsCount;
      tournaments += d.sanctionedTournamentsCount;
      athletes += d.registeredPlayersCount;
    });
    return {
      totalDistricts: districts.length,
      clubs,
      tournaments,
      athletes,
    };
  }, [districts]);

  // Filtered Districts
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.secretaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.zone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = zoneFilter === "ALL" || d.zone === zoneFilter;

      return matchesSearch && matchesZone;
    });
  }, [districts, searchQuery, zoneFilter]);

  const handleCreateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);
    try {
      const newDistrict: DistrictChapter = {
        id: `DIST-0${districts.length + 1}`,
        name: formData.name,
        code: formData.code || `D-${districts.length + 1}`,
        zone: formData.zone,
        state: formData.state,
        secretaryName: formData.secretaryName || "Association Secretary",
        secretaryPhone: formData.secretaryPhone,
        secretaryEmail: formData.secretaryEmail,
        affiliatedClubsCount: formData.affiliatedClubsCount || 8,
        sanctionedTournamentsCount: 0,
        registeredPlayersCount: 0,
        status: "ACTIVE",
      };

      setDistricts((prev) => [newDistrict, ...prev]);
      setCreateModalOpen(false);
      setFormData({
        name: "",
        code: "",
        zone: "Central Zone",
        state: "Karnataka",
        secretaryName: "",
        secretaryPhone: "",
        secretaryEmail: "",
        affiliatedClubsCount: 12,
      });
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
              Regional & District Association Chapters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDistricts}
              className="p-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 shadow-sm"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              title="Refresh Districts"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add District</span>
            </button>
          </div>
        </div>

        {/* Hero Title */}
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>District Association Network</span>
            <Globe className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-xs text-foreground/60 mt-0.5">
            Regional governance chapters, affiliated local clubs, coordinator directory and sanctioned tournaments.
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
            {/* 1. Districts */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Chapters</div>
              <div className="text-lg font-black text-foreground mt-0.5">{telemetry.totalDistricts}</div>
              <div className="text-[9px] font-bold text-primary truncate">Districts</div>
            </div>

            {/* 2. Clubs */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Clubs</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{telemetry.clubs}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Affiliated</div>
            </div>

            {/* 3. Tournaments */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Events</div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{telemetry.tournaments}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Sanctioned</div>
            </div>

            {/* 4. Players */}
            <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}>
              <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Players</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{telemetry.athletes}</div>
              <div className="text-[9px] font-bold text-foreground/45 truncate">Athletes</div>
            </div>
          </div>
        </div>

        {/* ─── Search & Zone Filters ─────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district name, secretary, or code..."
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

          {/* Zone Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {["ALL", "South Zone", "Coastal Zone", "North Zone", "Central Zone"].map((zone) => {
              const isActive = zoneFilter === zone;
              return (
                <button
                  key={zone}
                  onClick={() => setZoneFilter(zone)}
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
                  {zone === "ALL" ? "All Zones" : zone}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── District Cards Stack ───────────────────────────────── */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Chapters...</p>
            </div>
          ) : filteredDistricts.length === 0 ? (
            <div
              className="py-14 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 shadow-sm"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2.5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1">No Districts Found</h3>
              <p className="text-xs text-foreground/50 max-w-xs mb-3">
                No district chapter matches your current search or zone filters.
              </p>
            </div>
          ) : (
            filteredDistricts.map((d) => (
              <div
                key={d.id}
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
                        <Athlon3DIcon type="facilities" size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-foreground truncate">
                            {d.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-foreground/55 truncate">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span>{d.zone} • {d.state}</span>
                        </div>
                        <p className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider mt-1">
                          Code: {d.code}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                        d.status === "ACTIVE"
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  {/* Chapter Regional Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-center" style={{ borderColor: "var(--athlon-border-subtle)" }}>
                    <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="text-[9px] font-black uppercase text-foreground/45">Clubs</div>
                      <div className="text-sm font-black text-foreground">{d.affiliatedClubsCount}</div>
                    </div>
                    <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="text-[9px] font-black uppercase text-foreground/45">Tournaments</div>
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400">{d.sanctionedTournamentsCount}</div>
                    </div>
                    <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="text-[9px] font-black uppercase text-foreground/45">Players</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {d.registeredPlayersCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div
                  className="mt-3 pt-2.5 border-t flex items-center justify-between gap-2 text-[11px]"
                  style={{ borderColor: "var(--athlon-border-subtle)" }}
                >
                  <div className="flex items-center gap-2 text-foreground/60 min-w-0">
                    <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      Sec: <strong className="text-foreground">{d.secretaryName}</strong>
                    </span>
                  </div>

                  {d.secretaryPhone && (
                    <span className="text-[11px] font-medium text-foreground/50 shrink-0">
                      {d.secretaryPhone}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Add District Chapter Modal ─────────────────────────────── */}
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
                <Globe className="w-5 h-5" />
                <h3 className="text-sm font-black text-foreground">Register District Chapter</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl border text-foreground/60 hover:text-foreground"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDistrict} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                  District Association Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Belagavi District Badminton Association"
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
                    District Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BLG-01"
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/35"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">Zone / Region</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  >
                    <option value="South Zone">South Zone</option>
                    <option value="Coastal Zone">Coastal Zone</option>
                    <option value="North Zone">North Zone</option>
                    <option value="Central Zone">Central Zone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                  General Secretary / Coordinator Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.secretaryName}
                  onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                  placeholder="Secretary full name"
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
                    value={formData.secretaryPhone}
                    onChange={(e) => setFormData({ ...formData, secretaryPhone: e.target.value })}
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
                    Affiliated Clubs Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.affiliatedClubsCount}
                    onChange={(e) => setFormData({ ...formData, affiliatedClubsCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                  />
                </div>
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
                  {submitting ? "Registering..." : "Register Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}