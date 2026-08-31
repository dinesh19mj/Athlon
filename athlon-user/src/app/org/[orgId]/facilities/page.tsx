'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building,
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
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { AcademyService, AcademyFacility, AcademyCentre } from '@/lib/api/academy';

const SPORT_OPTIONS = [
  { value: 'BADMINTON', label: '🏸 Badminton' },
  { value: 'CRICKET', label: '🏏 Cricket' },
  { value: 'FOOTBALL', label: '⚽ Football' },
  { value: 'TENNIS', label: '🎾 Tennis' },
  { value: 'VOLLEYBALL', label: '🏐 Volleyball' },
  { value: 'OTHER', label: '🏅 Multi-Sport' },
];

const FACILITY_TYPES = [
  { value: 'BADMINTON_COURT', label: 'Badminton Court' },
  { value: 'CRICKET_NET', label: 'Cricket Practice Net' },
  { value: 'FOOTBALL_TURF', label: 'Football / Futsal Turf' },
  { value: 'TENNIS_COURT', label: 'Tennis Court' },
  { value: 'GROUND', label: 'Open Ground / Pitch' },
  { value: 'OTHER', label: 'General Arena' },
];

export default function FacilitiesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = (params?.orgId as string) || '';
  const initialCentreFilter = searchParams.get('centreUuid') || '';

  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const [facilities, setFacilities] = useState<AcademyFacility[]>([]);
  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedCentre, setSelectedCentre] = useState(initialCentreFilter);

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
  const [facilityNumber, setFacilityNumber] = useState('Court 1');
  const [locationDetails, setLocationDetails] = useState('Ground Floor, Main Hall');
  const [capacity, setCapacity] = useState(8);
  const [hourlyRate, setHourlyRate] = useState<number | ''>(600);
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 10:00 PM');
  const [isAvailableForBooking, setIsAvailableForBooking] = useState(true);
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
    setEditingFacility(null);
    setName('');
    setCentreUuid(centres[0]?.centreUuid || '');
    setSportType('BADMINTON');
    setFacilityType('BADMINTON_COURT');
    setSurfaceType('Synthetic BWF Mat');
    setFacilityNumber('Court 1');
    setLocationDetails('Main Hall');
    setCapacity(8);
    setHourlyRate(600);
    setOperatingHours('06:00 AM - 10:00 PM');
    setIsAvailableForBooking(true);
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const openEditModal = (fac: AcademyFacility) => {
    setEditingFacility(fac);
    setName(fac.name);
    setCentreUuid(fac.centreUuid || '');
    setSportType(fac.sportType || 'BADMINTON');
    setFacilityType(fac.facilityType || 'BADMINTON_COURT');
    setSurfaceType(fac.surfaceType || 'Synthetic BWF Mat');
    setFacilityNumber(fac.facilityNumber || '');
    setLocationDetails(fac.locationDetails || '');
    setCapacity(fac.capacity || 8);
    setHourlyRate(fac.hourlyRate || '');
    setOperatingHours(fac.operatingHours || '06:00 AM - 10:00 PM');
    setIsAvailableForBooking(fac.isAvailableForBooking ?? true);
    setStatus(fac.status || 'ACTIVE');
    setShowModal(true);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const matchedCentre = centres.find((c) => c.centreUuid === centreUuid);
      const centreName = matchedCentre?.name || undefined;

      if (editingFacility) {
        await AcademyService.updateFacility(editingFacility.facilityUuid, {
          name,
          centreUuid: centreUuid || undefined,
          centreName,
          sportType,
          facilityType,
          surfaceType,
          facilityNumber,
          locationDetails,
          capacity: Number(capacity) || 8,
          hourlyRate: hourlyRate !== '' ? Number(hourlyRate) : undefined,
          operatingHours,
          isAvailableForBooking,
          status,
        });
        setSuccessMsg(`Facility "${name}" updated successfully!`);
      } else {
        await AcademyService.createFacility({
          organizationUuid: orgId,
          centreUuid: centreUuid || undefined,
          centreName,
          name,
          sportType,
          facilityType,
          surfaceType,
          facilityNumber,
          locationDetails,
          capacity: Number(capacity) || 8,
          hourlyRate: hourlyRate !== '' ? Number(hourlyRate) : undefined,
          operatingHours,
          isAvailableForBooking,
          status,
        });
        setSuccessMsg(`New facility "${name}" added successfully!`);
      }

      setShowModal(false);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to save facility:', err);
      setErrorMsg(err.message || 'Failed to save facility.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFacility = async (facilityUuid: string, facName: string) => {
    if (!confirm(`Are you sure you want to remove "${facName}"?`)) return;
    try {
      await AcademyService.deleteFacility(facilityUuid);
      setFacilities((prev) => prev.filter((f) => f.facilityUuid !== facilityUuid));
      setSuccessMsg(`Facility "${facName}" deleted.`);
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
      (f.sportType && f.sportType.toLowerCase().includes(q));

    const matchesSport = selectedSport === 'ALL' || f.sportType === selectedSport;
    return matchesQuery && matchesSport;
  });

  const totalActiveUnits = facilities.filter((f) => f.status === 'ACTIVE').length;
  const inMaintenanceCount = facilities.filter((f) => f.status === 'MAINTENANCE').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6 sm:pt-8 md:pt-10 pb-28 px-4 sm:px-6">
      {/* ══════════════════════════════════════════════════════════════════════
          HEADER SECTION
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 p-5 sm:p-6 rounded-3xl border border-border backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/10">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Facilities, Courts &amp; Turfs
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {facilities.length} Arena Units
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Multi-sport court configurations, turf allocation, capacity, and surface specs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${orgId}/centres`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-bold border border-border transition active:scale-95 shadow-sm"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span>Campuses ({centres.length})</span>
          </Link>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-extrabold transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Court / Unit</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{facilities.length} Units</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              {totalActiveUnits} Active &amp; Ready
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">82%</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Peak Slot Utilization
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface text-text-secondary flex items-center justify-center shrink-0 border border-border">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{inMaintenanceCount} Units</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Under Maintenance
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FILTERS & SEARCH BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by court name, surface, or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 hide-scrollbar">
          {centres.length > 1 && (
            <select
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground font-semibold focus:outline-none focus:border-primary shrink-0"
            >
              <option value="">All Campuses ({centres.length})</option>
              {centres.map((c) => (
                <option key={c.centreUuid} value={c.centreUuid}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border shrink-0">
            <button
              type="button"
              onClick={() => setSelectedSport('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedSport === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              All Sports
            </button>
            {SPORT_OPTIONS.map((sport) => (
              <button
                key={sport.value}
                type="button"
                onClick={() => setSelectedSport(sport.value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedSport === sport.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FACILITIES GRID
         ══════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Loading Courts &amp; Facilities...
          </p>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card/60 rounded-3xl border border-border border-dashed space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-text-muted border border-border">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Facilities Found</h3>
          <p className="text-xs text-text-secondary max-w-sm">
            {searchTerm ? 'No units match your search query.' : 'Add courts, nets, or turfs to begin scheduling batches and recording attendance.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md"
          >
            + Add First Court / Unit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.facilityUuid}
              className="bg-card border border-border hover:border-primary/40 rounded-3xl p-6 space-y-4 transition-all shadow-xl hover:shadow-2xl group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase">
                        {facility.sportType || 'BADMINTON'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          facility.status === 'ACTIVE'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : facility.status === 'MAINTENANCE'
                            ? 'bg-surface text-text-secondary border border-border'
                            : 'bg-surface text-text-muted border border-border'
                        }`}
                      >
                        {facility.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-foreground text-base mt-2 group-hover:text-primary transition-colors">
                      {facility.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(facility)}
                      className="p-1.5 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface transition border border-transparent hover:border-border"
                      title="Edit Court"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFacility(facility.facilityUuid, facility.name)}
                      className="p-1.5 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition border border-transparent hover:border-error/20"
                      title="Delete Court"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-text-secondary bg-surface/50 p-3 rounded-2xl border border-border/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Campus:</span>
                    <span className="text-foreground font-semibold truncate max-w-[180px]">
                      {facility.centreName || 'Main Campus'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Surface Type:</span>
                    <span className="text-foreground font-semibold">{facility.surfaceType || 'BWF Synthetic Mat'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Max Capacity:</span>
                    <span className="text-foreground font-semibold">{facility.capacity || 8} Athletes</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Hourly Rate:</span>
                    <span className="text-primary font-bold">
                      {facility.hourlyRate ? `₹${facility.hourlyRate} / hr` : 'Coaching Only'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{facility.operatingHours || '06:00 AM - 10:00 PM'}</span>
                </span>

                <Link
                  href={`/org/${orgId}/admissions`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>Batches</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD / EDIT FACILITY MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-card/80">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                {editingFacility ? 'Edit Court / Facility' : 'Add Arena Court / Facility'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-foreground hover:bg-surface transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Facility / Court Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Badminton Court 1 (BWF Mat), Cricket Net A"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Campus Location
                  </label>
                  <select
                    value={centreUuid}
                    onChange={(e) => setCentreUuid(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  >
                    <option value="">Main Hub (Default)</option>
                    {centres.map((c) => (
                      <option key={c.centreUuid} value={c.centreUuid}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Sport Type
                  </label>
                  <select
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  >
                    {SPORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Facility Type
                  </label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  >
                    {FACILITY_TYPES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Surface Specification
                  </label>
                  <input
                    type="text"
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value)}
                    placeholder="e.g. Synthetic BWF Mat, Wooden Flooring, AstroTurf"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Max Capacity (Concurrent Players)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Hourly Slot Rate (₹, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 600"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="06:00 AM - 10:00 PM"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-bold border border-border transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFacility ? 'Update Court' : 'Save Court'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
