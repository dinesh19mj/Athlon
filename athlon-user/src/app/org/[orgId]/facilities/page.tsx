'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Wrench,
  MapPin,
  Edit2,
  Trash2,
  X,
  Loader2,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  DollarSign,
  Check,
  Activity,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { AcademyService, AcademyFacility, AcademyCentre } from '@/lib/api/academy';
import { useOrgSports } from '@/lib/hooks/useOrgSports';

/* ─── Sports Metadata ─── */
const SPORT_META: Record<string, { label: string; emoji: string }> = {
  BADMINTON: { label: 'Badminton', emoji: '🏸' },
  CRICKET: { label: 'Cricket', emoji: '🏏' },
  FOOTBALL: { label: 'Football', emoji: '⚽' },
  TENNIS: { label: 'Tennis', emoji: '🎾' },
  TABLE_TENNIS: { label: 'Table Tennis', emoji: '🏓' },
  BASKETBALL: { label: 'Basketball', emoji: '🏀' },
  SWIMMING: { label: 'Swimming', emoji: '🏊' },
  VOLLEYBALL: { label: 'Volleyball', emoji: '🏐' },
  SQUASH: { label: 'Squash', emoji: '🎾' },
  PICKLEBALL: { label: 'Pickleball', emoji: '🏓' },
  OTHER: { label: 'Multi-Sport', emoji: '🏅' },
};

const SPORT_OPTIONS = Object.entries(SPORT_META).map(([key, val]) => ({
  value: key,
  label: `${val.emoji} ${val.label}`,
  emoji: val.emoji,
  name: val.label,
}));

function getSportEmoji(sport?: string) {
  if (!sport) return '🏟️';
  const key = sport.toUpperCase().replace(/\s+/g, '_');
  return SPORT_META[key]?.emoji ?? '🏟️';
}

/* ─── Sport Specific Structures & Surfaces Mapping ─── */
const SPORT_CONFIG: Record<
  string,
  {
    structures: { value: string; label: string }[];
    surfaces: string[];
    defaultStructure: string;
    defaultSurface: string;
  }
> = {
  BADMINTON: {
    structures: [
      { value: 'BADMINTON_COURT', label: 'Indoor Badminton Court' },
      { value: 'OUTDOOR_COURT', label: 'Outdoor Badminton Court' },
      { value: 'ACADEMY_HALL', label: 'Multi-Court Arena Hall' },
    ],
    surfaces: [
      'Synthetic BWF Mat (PVC / Vinyl)',
      'Teak Wooden Flooring',
      'Maple Wood Sprung Floor',
      'Synthetic Acrylic Surface',
      'Cement / Concrete Court',
    ],
    defaultStructure: 'BADMINTON_COURT',
    defaultSurface: 'Synthetic BWF Mat (PVC / Vinyl)',
  },
  CRICKET: {
    structures: [
      { value: 'CRICKET_NET', label: 'Cricket Practice Net' },
      { value: 'INDOOR_NET', label: 'Indoor Bowling Net' },
      { value: 'MAIN_PITCH', label: 'Match Ground / Pitch' },
      { value: 'BOWLING_LANE', label: 'Bowling Machine Lane' },
    ],
    surfaces: [
      'AstroTurf (Synthetic Turf)',
      'Natural Turf (Grass Pitch)',
      'Matting Pitch (Coir / Jute)',
      'Concrete / Cement Pitch',
      'Indoor Polyurethane Mat',
    ],
    defaultStructure: 'CRICKET_NET',
    defaultSurface: 'AstroTurf (Synthetic Turf)',
  },
  FOOTBALL: {
    structures: [
      { value: 'FOOTBALL_TURF', label: '5-a-side / 7-a-side Turf' },
      { value: 'FULL_PITCH', label: '11-a-side Football Pitch' },
      { value: 'FUTSAL_COURT', label: 'Indoor Futsal Arena' },
    ],
    surfaces: [
      'FIFA Approved Artificial Grass (40-50mm)',
      'Natural Bermuda Grass',
      'Rubber Infill Synthetic Turf',
      'Indoor Hardwood Futsal Flooring',
      'Sand-Dressed Turf',
    ],
    defaultStructure: 'FOOTBALL_TURF',
    defaultSurface: 'FIFA Approved Artificial Grass (40-50mm)',
  },
  TENNIS: {
    structures: [
      { value: 'TENNIS_COURT', label: 'Standard Tennis Court' },
      { value: 'CENTRE_COURT', label: 'Tournament Centre Court' },
      { value: 'INDOOR_TENNIS', label: 'Indoor Covered Tennis Court' },
    ],
    surfaces: [
      'Hard Court (Acrylic / Plexipave)',
      'Clay Court (Red Clay / En-Tout-Cas)',
      'Synthetic Grass Turf',
      'Natural Grass Court',
      'Cushioned Hard Court',
    ],
    defaultStructure: 'TENNIS_COURT',
    defaultSurface: 'Hard Court (Acrylic / Plexipave)',
  },
  TABLE_TENNIS: {
    structures: [
      { value: 'TABLE_TENNIS_TABLE', label: 'TT Table Unit / Arena' },
      { value: 'TT_HALL', label: 'Table Tennis Hall' },
    ],
    surfaces: [
      'ITTF Approved PVC Taraflex Mat',
      'Sprung Wooden Flooring',
      'Anti-Glare Epoxy Surface',
      'Standard Vinyl Mat',
    ],
    defaultStructure: 'TABLE_TENNIS_TABLE',
    defaultSurface: 'ITTF Approved PVC Taraflex Mat',
  },
  BASKETBALL: {
    structures: [
      { value: 'BASKETBALL_COURT', label: 'Full Basketball Court' },
      { value: 'HALF_COURT', label: 'Half Court / 3x3 Arena' },
      { value: 'INDOOR_COURT', label: 'Indoor Sports Hall' },
    ],
    surfaces: [
      'Maple Hardwood Sprung Floor',
      'Outdoor Acrylic / Polyurethane',
      'Interlocking Modular Tiles (PP)',
      'Cushioned Concrete',
    ],
    defaultStructure: 'BASKETBALL_COURT',
    defaultSurface: 'Maple Hardwood Sprung Floor',
  },
  SWIMMING: {
    structures: [
      { value: 'SWIMMING_POOL', label: 'Main Lap Pool (25m / 50m)' },
      { value: 'LEARNER_POOL', label: 'Learners / Kids Pool' },
      { value: 'DIVING_WELL', label: 'Diving Well Arena' },
    ],
    surfaces: [
      'Anti-Skid Ceramic Tile Liner',
      'Fiberglass Smooth Finish',
      'Mosaic Glass Tiles',
      'Pebble Crete Non-Slip',
    ],
    defaultStructure: 'SWIMMING_POOL',
    defaultSurface: 'Anti-Skid Ceramic Tile Liner',
  },
  VOLLEYBALL: {
    structures: [
      { value: 'VOLLEYBALL_COURT', label: 'Indoor Volleyball Court' },
      { value: 'BEACH_VOLLEYBALL', label: 'Beach Volleyball Sand Court' },
      { value: 'OUTDOOR_COURT', label: 'Outdoor Hardcourt' },
    ],
    surfaces: [
      'FIVB Approved Taraflex PVC Mat',
      'Fine Sand (Beach Volleyball)',
      'Sprung Maple Wood',
      'Outdoor Acrylic Surface',
    ],
    defaultStructure: 'VOLLEYBALL_COURT',
    defaultSurface: 'FIVB Approved Taraflex PVC Mat',
  },
  SQUASH: {
    structures: [
      { value: 'SQUASH_COURT', label: 'Standard Squash Court (WSF)' },
      { value: 'GLASS_COURT', label: 'All-Glass Show Court' },
    ],
    surfaces: [
      'Hard Maple Unsealed Wood Floor',
      'Beechwood Floating Floor',
      'Plaster Finished White Walls',
    ],
    defaultStructure: 'SQUASH_COURT',
    defaultSurface: 'Hard Maple Unsealed Wood Floor',
  },
  PICKLEBALL: {
    structures: [
      { value: 'PICKLEBALL_COURT', label: 'Dedicated Pickleball Court' },
      { value: 'INDOOR_PICKLEBALL', label: 'Indoor Pickleball Arena' },
    ],
    surfaces: [
      'Cushioned Acrylic Hard Court',
      'Modular Interlocking Sport Tiles',
      'Polyurethane Seamless Floor',
      'Smooth Concrete Surface',
    ],
    defaultStructure: 'PICKLEBALL_COURT',
    defaultSurface: 'Cushioned Acrylic Hard Court',
  },
  OTHER: {
    structures: [
      { value: 'GENERAL_ARENA', label: 'Multi-Purpose Arena' },
      { value: 'OPEN_GROUND', label: 'Open Ground / Pitch' },
      { value: 'STUDIO_ROOM', label: 'Studio / Fitness Room' },
    ],
    surfaces: [
      'Multi-Sport Synthetic Mat',
      'Hardwood Sprung Floor',
      'AstroTurf Synthetic Turf',
      'Rubberized Gym Flooring',
      'Standard Acrylic Court',
    ],
    defaultStructure: 'GENERAL_ARENA',
    defaultSurface: 'Multi-Sport Synthetic Mat',
  },
};

function getSportConfig(sport?: string) {
  if (!sport) return SPORT_CONFIG.BADMINTON;
  const key = sport.toUpperCase().replace(/\s+/g, '_');
  return SPORT_CONFIG[key] || SPORT_CONFIG.OTHER;
}

/* ─── Time Helper Functions ─── */
function formatTime12h(time24: string): string {
  if (!time24) return '06:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function parseTimeTo24h(timeStr: string): { from: string; to: string } {
  if (!timeStr) return { from: '06:00', to: '22:00' };
  const parts = timeStr.split(/\s*[-–—]\s*/);
  if (parts.length < 2) return { from: '06:00', to: '22:00' };

  const to24 = (t: string, fallback: string) => {
    const match = t.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return fallback;
    let [_, hStr, m, period] = match;
    let h = parseInt(hStr, 10);
    if (period) {
      if (period.toUpperCase() === 'PM' && h < 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    }
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  return { from: to24(parts[0], '06:00'), to: to24(parts[1], '22:00') };
}

/* ─── Tiny Input Component ─── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  colSpan = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition"
      />
    </div>
  );
}

export default function FacilitiesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = (params?.orgId as string) || '';
  const initialCentreFilter = searchParams.get('centreUuid') || '';

  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const { sports: orgSports } = useOrgSports(orgId);

  const sportOptions = useMemo(() => {
    if (orgSports.length > 0) {
      return orgSports.map((s) => {
        const key = s.toUpperCase().replace(/[\s\-_/]+/g, '_');
        const meta = SPORT_META[key] || { label: s, emoji: getSportEmoji(s) };
        return {
          value: key,
          label: `${meta.emoji} ${meta.label}`,
          emoji: meta.emoji,
          name: meta.label,
        };
      });
    }
    return [
      {
        value: 'BADMINTON',
        label: '🏸 Badminton',
        emoji: '🏸',
        name: 'Badminton',
      },
    ];
  }, [orgSports]);

  const [facilities, setFacilities] = useState<AcademyFacility[]>([]);
  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedCentre, setSelectedCentre] = useState(initialCentreFilter);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<AcademyFacility | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [centreUuid, setCentreUuid] = useState('');
  const [sportType, setSportType] = useState('BADMINTON');
  const [facilityType, setFacilityType] = useState('BADMINTON_COURT');
  const [surfaceType, setSurfaceType] = useState('Synthetic BWF Mat');
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ACTIVE');

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [facData, cenData] = await Promise.all([
        AcademyService.getFacilities(orgId, selectedCentre || undefined),
        AcademyService.getCentres(orgId),
      ]);
      setFacilities(facData || []);
      setCentres(cenData || []);
    } catch (err: any) {
      console.error('Failed to load facilities data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, selectedCentre]);

  const openCreateModal = () => {
    const defaultKey = sportOptions[0]?.value || 'BADMINTON';
    const config = getSportConfig(defaultKey);
    setEditingFacility(null);
    setName('');
    setCentreUuid(centres[0]?.centreUuid || '');
    setSportType(defaultKey);
    setFacilityType(config.defaultStructure);
    setSurfaceType(config.defaultSurface);
    setOpenTime('06:00');
    setCloseTime('22:00');
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const openEditModal = (fac: AcademyFacility) => {
    const currentSport = fac.sportType || 'BADMINTON';
    const config = getSportConfig(currentSport);
    const parsed = parseTimeTo24h(fac.operatingHours || '06:00 AM - 10:00 PM');
    setEditingFacility(fac);
    setName(fac.name);
    setCentreUuid(fac.centreUuid || '');
    setSportType(currentSport);
    setFacilityType(fac.facilityType || config.defaultStructure);
    setSurfaceType(fac.surfaceType || config.defaultSurface);
    setOpenTime(parsed.from);
    setCloseTime(parsed.to);
    setStatus(fac.status || 'ACTIVE');
    setShowModal(true);
  };

  const handleSportSelect = (sport: string) => {
    setSportType(sport);
    const config = getSportConfig(sport);
    setFacilityType(config.defaultStructure);
    setSurfaceType(config.defaultSurface);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const matchedCentre = centres.find((c) => c.centreUuid === centreUuid);
      const centreName = matchedCentre?.name || undefined;
      const formattedOperatingHours = `${formatTime12h(openTime)} - ${formatTime12h(closeTime)}`;

      if (editingFacility) {
        await AcademyService.updateFacility(editingFacility.facilityUuid, {
          name,
          centreUuid: centreUuid || undefined,
          centreName,
          sportType,
          facilityType,
          surfaceType,
          operatingHours: formattedOperatingHours,
          status,
        });
        setSuccessMsg(`"${name}" updated`);
      } else {
        await AcademyService.createFacility({
          organizationUuid: orgId,
          centreUuid: centreUuid || undefined,
          centreName,
          name,
          sportType,
          facilityType,
          surfaceType,
          operatingHours: formattedOperatingHours,
          status,
        });
        setSuccessMsg(`"${name}" added`);
      }

      setShowModal(false);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error('Failed to save facility:', err);
      setErrorMsg(err.message || 'Failed to save court.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFacility = async (facilityUuid: string, facName: string) => {
    if (!confirm(`Remove "${facName}"?`)) return;
    try {
      await AcademyService.deleteFacility(facilityUuid);
      setFacilities((prev) => prev.filter((f) => f.facilityUuid !== facilityUuid));
      setSuccessMsg(`"${facName}" removed`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Failed to delete facility:', err);
      alert('Could not delete facility.');
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      f.name.toLowerCase().includes(q) ||
      (f.centreName && f.centreName.toLowerCase().includes(q)) ||
      (f.surfaceType && f.surfaceType.toLowerCase().includes(q)) ||
      (f.sportType && f.sportType.toLowerCase().includes(q)) ||
      (f.facilityNumber && f.facilityNumber.toLowerCase().includes(q));

    const matchesSport = selectedSport === 'ALL' || f.sportType === selectedSport;
    const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;
    return matchesQuery && matchesSport && matchesStatus;
  });

  const totalActiveUnits = facilities.filter((f) => f.status === 'ACTIVE').length;
  const inMaintenanceCount = facilities.filter((f) => f.status === 'MAINTENANCE').length;

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── STICKY COMPACT MOBILE HEADER ── */}
      <div
        className="sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-black text-foreground leading-none">Courts &amp; Turfs</h1>
              <p className="text-[10px] text-foreground/45 mt-0.5">
                {facilities.length} court{facilities.length !== 1 ? 's' : ''} • {org?.name}
              </p>
            </div>
          </div>

          <Link
            href={`/org/${orgId}/centres`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <Building2 className="w-3 h-3 text-primary" />
            Campuses ({centres.length})
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search court, surface, sport, campus..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)', border: '1px solid' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Sport Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 hide-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedSport('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
              selectedSport === 'ALL'
                ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
            }`}
          >
            All Sports ({facilities.length})
          </button>

          {sportOptions.map((sport) => {
            const count = facilities.filter((f) => f.sportType === sport.value).length;
            return (
              <button
                key={sport.value}
                type="button"
                onClick={() => setSelectedSport(sport.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedSport === sport.value
                    ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                    : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
                }`}
              >
                <span>{sport.emoji}</span>
                <span>{sport.name}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1 rounded-full ${
                    selectedSport === sport.value ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/50'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Campus Filter Chip (if multiple) */}
        {centres.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 hide-scrollbar">
            <button
              onClick={() => setSelectedCentre('')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition shrink-0 border ${
                selectedCentre === ''
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'bg-white/[0.02] text-foreground/40 border-white/5'
              }`}
            >
              All Campuses
            </button>
            {centres.map((c) => (
              <button
                key={c.centreUuid}
                onClick={() => setSelectedCentre(c.centreUuid)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition shrink-0 border truncate max-w-[150px] ${
                  selectedCentre === c.centreUuid
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-bold'
                    : 'bg-white/[0.02] text-foreground/40 border-white/5'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="px-4 space-y-2 pt-3">
        {successMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-500/12 border border-red-500/25 text-red-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pt-3 space-y-3">

        {/* Telemetry Micro-Pills */}
        {!loading && facilities.length > 0 && (
          <div
            className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl border p-2 text-center"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-mono font-black text-cyan-400">{totalActiveUnits}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Active</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-amber-400">{inMaintenanceCount}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Maintenance</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-primary">{facilities.length}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Total Courts</div>
            </div>
          </div>
        )}

        {/* Count hint */}
        {!loading && filteredFacilities.length > 0 && (
          <p className="text-[10px] text-foreground/35 font-medium px-1">
            Showing {filteredFacilities.length} of {facilities.length}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">Loading courts &amp; turfs…</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[260px] text-center space-y-3 px-6">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl">
              🏟️
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No courts or turfs found</p>
              <p className="text-xs text-foreground/45 mt-1">
                {searchTerm
                  ? 'Try a different filter or search query.'
                  : 'Tap + to add your first court or turf unit.'}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 bg-primary text-black text-xs font-extrabold rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition"
              >
                + Add Court / Unit
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFacilities.map((facility) => {
              const isExpanded = expandedId === facility.facilityUuid;
              const emoji = getSportEmoji(facility.sportType);

              return (
                <div
                  key={facility.facilityUuid}
                  className="rounded-2xl border overflow-hidden transition-all"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* ── Card Header (always visible) ── */}
                  <button
                    className="w-full text-left p-4 flex items-start justify-between gap-3 active:bg-white/[0.02] transition"
                    onClick={() => setExpandedId(isExpanded ? null : facility.facilityUuid)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Sport Emoji Icon */}
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-xl">
                        {emoji}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-foreground truncate leading-tight">
                            {facility.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${
                              facility.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : facility.status === 'MAINTENANCE'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-white/5 text-foreground/40 border border-white/10'
                            }`}
                          >
                            {facility.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-foreground/50">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                            {facility.centreName || 'Main Hub'}
                          </span>
                          {facility.surfaceType && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-foreground/60 border border-white/10 truncate">
                              {facility.surfaceType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-foreground/30">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* ── Quick Spec Strip (always visible) ── */}
                  <div
                    className="grid grid-cols-2 divide-x divide-white/5 border-t text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="py-2 px-2">
                      <div className="text-xs font-extrabold text-cyan-400 truncate">
                        {facility.surfaceType || 'Standard Surface'}
                      </div>
                      <div className="text-[8px] text-foreground/40 font-bold uppercase tracking-wide">Surface Specs</div>
                    </div>
                    <div className="py-2 px-2">
                      <div className="text-xs font-extrabold text-indigo-400 font-mono">
                        {facility.activeBatchesCount ?? 0} Batches
                      </div>
                      <div className="text-[8px] text-foreground/40 font-bold uppercase tracking-wide">Allocated Batches</div>
                    </div>
                  </div>

                  {/* ── Expanded Detail View ── */}
                  {isExpanded && (
                    <div className="border-t space-y-2.5 px-4 py-3" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground/40 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          Operating Hours
                        </span>
                        <span className="text-foreground font-semibold">
                          {facility.operatingHours || '06:00 AM – 10:00 PM'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <Link
                          href={`/org/${orgId}/batches?courtUuid=${facility.facilityUuid}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-primary active:opacity-70"
                        >
                          <Users className="w-3.5 h-3.5" />
                          View Batches
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(facility)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/60 hover:text-foreground border border-transparent hover:border-white/10 transition active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFacility(facility.facilityUuid, facility.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-400/70 hover:text-red-400 border border-transparent hover:border-red-500/20 transition active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING ACTION BUTTON (FAB) ── */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        style={{
          backgroundColor: 'var(--athlon-primary)',
          boxShadow: '0 8px 24px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
        }}
        aria-label="Add Court"
      >
        <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
      </button>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM SHEET MODAL
         ══════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95"
            style={{ backgroundColor: 'var(--athlon-card)', maxHeight: '92dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            {/* Sheet header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-sm font-extrabold text-foreground">
                  {editingFacility ? 'Edit Court / Unit' : 'New Court / Unit'}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFacility} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Section: Identity */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Court Identity</p>
                <div className="space-y-3">
                  <Field
                    label="Court / Unit Name"
                    value={name}
                    onChange={setName}
                    placeholder="e.g. Badminton Court 1, Football Turf A, Cricket Net 1"
                    required
                  />

                  {/* Campus Select */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      Campus / Centre
                    </label>
                    <div className="relative">
                      <select
                        value={centreUuid}
                        onChange={(e) => setCentreUuid(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-card text-foreground">
                          Main Hub (Default)
                        </option>
                        {centres.map((c) => (
                          <option key={c.centreUuid} value={c.centreUuid} className="bg-card text-foreground">
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Sport & Type Selection */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Sport &amp; Surface</p>

                {/* Interactive Sport Selector Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {sportOptions.map((sport) => {
                    const isSelected = sportType === sport.value;
                    return (
                      <button
                        key={sport.value}
                        type="button"
                        onClick={() => handleSportSelect(sport.value)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition text-left border ${
                          isSelected
                            ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                            : 'bg-background/40 text-foreground/70 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-base shrink-0">{sport.emoji}</span>
                        <span className="truncate text-[11px]">{sport.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Dynamic Structure Dropdown based on selected sport */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      Structure
                    </label>
                    <div className="relative">
                      <select
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                      >
                        {getSportConfig(sportType).structures.map((ft) => (
                          <option key={ft.value} value={ft.value} className="bg-card text-foreground">
                            {ft.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Dynamic Surface Type Dropdown based on selected sport */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      Surface Type
                    </label>
                    <div className="relative">
                      <select
                        value={surfaceType}
                        onChange={(e) => setSurfaceType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer truncate pr-7"
                      >
                        {getSportConfig(sportType).surfaces.map((s) => (
                          <option key={s} value={s} className="bg-card text-foreground">
                            {s}
                          </option>
                        ))}
                        {/* Preserve existing custom value if editing an unusual surface */}
                        {surfaceType && !getSportConfig(sportType).surfaces.includes(surfaceType) && (
                          <option value={surfaceType} className="bg-card text-foreground">
                            {surfaceType} (Custom)
                          </option>
                        )}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Timing & Status */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
                  Operating Hours &amp; Status
                </p>
                <div className="space-y-3">
                  {/* From & To Clock Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Opens From ⏰
                      </label>
                      <input
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground font-mono focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition cursor-pointer [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Closes At ⏰
                      </label>
                      <input
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground font-mono focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Formatted Hours Preview badge + Status Dropdown */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[11px] font-bold text-foreground/70 truncate">
                        {formatTime12h(openTime)} – {formatTime12h(closeTime)}
                      </span>
                    </div>

                    <div>
                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                        >
                          <option value="ACTIVE" className="bg-card text-foreground">Active &amp; Ready</option>
                          <option value="MAINTENANCE" className="bg-card text-foreground">Maintenance</option>
                          <option value="INACTIVE" className="bg-card text-foreground">Inactive / Closed</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold text-foreground/70 border transition active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold text-black bg-primary shadow-lg shadow-primary/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingFacility ? 'Update Court' : 'Create Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
