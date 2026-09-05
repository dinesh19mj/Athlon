'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, MapPin, Plus, Phone, Mail, Clock, Users,
  Layers, Search, CheckCircle2, AlertCircle, Edit2, Trash2,
  X, Loader2, ArrowRight, ChevronDown, ChevronUp, Shield,
  Check,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { AcademyService, AcademyCentre } from '@/lib/api/academy';
import {
  LocationService,
  FALLBACK_INDIAN_STATES,
  FALLBACK_STATE_DISTRICTS,
} from '@/lib/api/location';

import { useOrgSports, getSportEmoji } from '@/lib/hooks/useOrgSports';

/* ─── Sport emoji helper ─── */
function sportEmoji(s: string) {
  return getSportEmoji(s);
}

/* ─── Tiny input ─── */
function Field({
  label, value, onChange, placeholder, type = 'text', required = false, colSpan = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition"
      />
    </div>
  );
}

export default function AcademyCentresPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const { sports: orgSports, sportOptions: orgSportOptions } = useOrgSports(orgId);

  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState<AcademyCentre | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Location lists
  const [statesList, setStatesList] = useState<string[]>(FALLBACK_INDIAN_STATES);
  const [districtsList, setDistrictsList] = useState<string[]>(FALLBACK_STATE_DISTRICTS['Karnataka'] || []);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [stateVal, setStateVal] = useState('Karnataka');
  const [districtVal, setDistrictVal] = useState('Bengaluru Urban');
  const [postalCode, setPostalCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 10:00 PM');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await LocationService.getAllStates();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((s) => s.name))).sort();
          setStatesList(names);
        } else {
          setStatesList(FALLBACK_INDIAN_STATES);
        }
      } catch {
        setStatesList(FALLBACK_INDIAN_STATES);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!stateVal) {
      setDistrictsList([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await LocationService.getDistrictsByStateName(stateVal);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((d) => d.name))).sort();
          setDistrictsList(names);
        } else if (FALLBACK_STATE_DISTRICTS[stateVal]) {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[stateVal]);
        } else {
          setDistrictsList([]);
        }
      } catch {
        if (FALLBACK_STATE_DISTRICTS[stateVal]) {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[stateVal]);
        } else {
          setDistrictsList([]);
        }
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [stateVal]);

  const loadCentres = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await AcademyService.getCentres(orgId);
      setCentres(data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { loadCentres(); }, [orgId]);

  const toggleSport = (sportName: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportName)
        ? prev.filter((s) => s !== sportName)
        : [...prev, sportName]
    );
  };

  const resetForm = () => {
    setEditingCentre(null);
    setName('');
    setCode('');
    setAddress('');
    setCity('Bangalore');
    setStateVal('Karnataka');
    setDistrictVal('Bengaluru Urban');
    setPostalCode('');
    setContactPhone('');
    setContactEmail('');
    setOperatingHours('06:00 AM - 10:00 PM');
    setSelectedSports(orgSports.length > 0 ? orgSports : ['Badminton']);
    setManagerName('');
    setManagerPhone('');
  };

  const openCreate = () => { resetForm(); setShowModal(true); };
  const openEdit = (c: AcademyCentre) => {
    setEditingCentre(c);
    setName(c.name || '');
    setCode(c.code || '');
    setAddress(c.address || '');
    setCity(c.city || '');
    setStateVal(c.state || 'Karnataka');
    setDistrictVal(c.district || '');
    setPostalCode(c.postalCode || '');
    setContactPhone(c.contactPhone || '');
    setContactEmail(c.contactEmail || '');
    setOperatingHours(c.operatingHours || '');
    
    // Parse selected sports from comma-separated string
    const existingSports = (c.sportsAvailable || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setSelectedSports(existingSports.length > 0 ? existingSports : ['Badminton']);

    setManagerName(c.managerName || '');
    setManagerPhone(c.managerPhone || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (selectedSports.length === 0) {
      setErrorMsg('Please select at least one sport.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    const sportsString = selectedSports.join(', ');

    try {
      if (editingCentre) {
        await AcademyService.updateCentre(editingCentre.centreUuid, {
          name,
          code,
          address,
          city,
          state: stateVal,
          district: districtVal,
          postalCode,
          contactPhone,
          contactEmail,
          operatingHours,
          sportsAvailable: sportsString,
          managerName,
          managerPhone,
        });
        setSuccessMsg(`"${name}" updated`);
      } else {
        await AcademyService.createCentre({
          organizationUuid: orgId,
          name,
          code,
          address,
          city,
          state: stateVal,
          district: districtVal,
          postalCode,
          contactPhone,
          contactEmail,
          operatingHours,
          sportsAvailable: sportsString,
          managerName,
          managerPhone,
          status: 'ACTIVE',
        });
        setSuccessMsg(`"${name}" added`);
      }
      setShowModal(false);
      await loadCentres();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (centreUuid: string, centreName: string) => {
    if (!confirm(`Remove "${centreName}"?`)) return;
    try {
      await AcademyService.deleteCentre(centreUuid);
      setCentres(prev => prev.filter(c => c.centreUuid !== centreUuid));
      setSuccessMsg(`"${centreName}" removed`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { alert('Could not delete centre.'); }
  };

  const filtered = centres.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.state && c.state.toLowerCase().includes(q)) ||
      (c.sportsAvailable && c.sportsAvailable.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── STICKY COMPACT HEADER ── */}
      <div
        className="sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-black text-foreground leading-none">Campuses</h1>
              <p className="text-[10px] text-foreground/45 mt-0.5">
                {centres.length} centre{centres.length !== 1 ? 's' : ''} • {org?.name}
              </p>
            </div>
          </div>

          <Link
            href={`/org/${orgId}/facilities`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <Layers className="w-3 h-3 text-primary" />
            Courts
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search campus, city, district, sport..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)', border: '1px solid' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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

        {/* Count hint */}
        {!loading && filtered.length > 0 && (
          <p className="text-[10px] text-foreground/35 font-medium px-1">
            Showing {filtered.length} of {centres.length}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">Loading campuses…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[260px] text-center space-y-3 px-6">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center">
              <Building2 className="w-6 h-6 text-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No campuses found</p>
              <p className="text-xs text-foreground/45 mt-1">
                {searchQuery ? 'Try a different search.' : 'Tap + to add your first campus.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={openCreate}
                className="px-5 py-2.5 bg-primary text-black text-xs font-extrabold rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition"
              >
                + Add Campus
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((centre) => {
              const isExpanded = expandedId === centre.centreUuid;
              const sports = (centre.sportsAvailable || 'Badminton').split(',').map(s => s.trim());

              // Build location subtitle
              const locationParts = [
                centre.address,
                centre.city,
                centre.district,
                centre.state,
              ].filter(Boolean);
              const locationDisplay = locationParts.length > 0 ? locationParts.join(', ') : 'Bangalore, Karnataka';

              return (
                <div
                  key={centre.centreUuid}
                  className="rounded-2xl border overflow-hidden transition-all"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* ── Card Header (always visible) ── */}
                  <button
                    className="w-full text-left p-4 flex items-start justify-between gap-3 active:bg-white/[0.02] transition"
                    onClick={() => setExpandedId(isExpanded ? null : centre.centreUuid)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-lg">
                        🏢
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-foreground truncate leading-tight">
                            {centre.name}
                          </span>
                          {centre.code && (
                            <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-foreground/50 shrink-0">
                              {centre.code}
                            </span>
                          )}
                          {centre.district && (
                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9px] font-medium text-primary shrink-0">
                              {centre.district}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="text-[11px] text-foreground/50 truncate">
                            {locationDisplay}
                          </span>
                        </div>

                        {/* Sport chips preview */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {sports.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
                              {sportEmoji(s)} {s}
                            </span>
                          ))}
                          {sports.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-foreground/40 border border-white/10">
                              +{sports.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-foreground/30">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* ── Stats strip (always visible) ── */}
                  <div
                    className="grid grid-cols-4 divide-x divide-white/5 border-t text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {[
                      { label: 'Courts', value: centre.facilitiesCount ?? 0, color: 'text-cyan-400' },
                      { label: 'Batches', value: centre.activeBatchesCount ?? 0, color: 'text-indigo-400' },
                      { label: 'Students', value: centre.activeStudentsCount ?? 0, color: 'text-primary' },
                      { label: 'Coaches', value: centre.activeCoachesCount ?? 0, color: 'text-purple-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="py-2.5 px-1">
                        <div className={`text-sm font-extrabold ${color} font-mono`}>{value}</div>
                        <div className="text-[9px] text-foreground/40 font-bold uppercase tracking-wide">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Expanded detail ── */}
                  {isExpanded && (
                    <div className="border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                      {/* Operating & contact */}
                      <div className="px-4 py-3 space-y-2">
                        {/* District & Location Pill */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground/45 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span>District: <strong className="text-foreground font-semibold">{centre.district || 'Not Specified'}</strong></span>
                          </span>
                          {centre.state && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-foreground/60">
                              {centre.state}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-foreground/50">
                            <Clock className="w-3 h-3 text-primary" />
                            {centre.operatingHours || '06:00 AM – 10:00 PM'}
                          </span>
                          {centre.contactPhone && (
                            <a
                              href={`tel:${centre.contactPhone}`}
                              className="flex items-center gap-1 text-primary font-semibold active:opacity-70"
                            >
                              <Phone className="w-3 h-3" />
                              {centre.contactPhone}
                            </a>
                          )}
                        </div>

                        {centre.contactEmail && (
                          <div className="flex items-center gap-1.5 text-[11px] text-foreground/45">
                            <Mail className="w-3 h-3 text-primary" />
                            {centre.contactEmail}
                          </div>
                        )}

                        {centre.managerName && (
                          <div
                            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[11px]"
                            style={{ backgroundColor: 'var(--athlon-surface)', border: '1px solid var(--athlon-border)' }}
                          >
                            <span className="flex items-center gap-1.5 text-foreground/50">
                              <Shield className="w-3 h-3 text-primary" />
                              Manager
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-foreground text-[11px]">{centre.managerName}</div>
                              {centre.managerPhone && (
                                <div className="text-[10px] text-foreground/40 font-mono">{centre.managerPhone}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action row */}
                      <div
                        className="flex items-center justify-between px-4 py-3 border-t"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <Link
                          href={`/org/${orgId}/facilities?centreUuid=${centre.centreUuid}`}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-primary active:opacity-70"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          View Courts
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(centre)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/60 hover:text-foreground border border-transparent hover:border-white/10 transition active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(centre.centreUuid, centre.name)}
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

      {/* ── FLOATING ACTION BUTTON ── */}
      <button
        onClick={openCreate}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        style={{
          backgroundColor: 'var(--athlon-primary)',
          boxShadow: '0 8px 24px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
        }}
        aria-label="Add Campus"
      >
        <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
      </button>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM SHEET MODAL
         ══════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
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
                <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-extrabold text-foreground">
                  {editingCentre ? 'Edit Campus' : 'New Campus'}
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
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Section: Identity */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Identity</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Campus Name" value={name} onChange={setName} placeholder="Indiranagar Campus" required colSpan />
                  <Field label="Campus Code" value={code} onChange={setCode} placeholder="MAIN-01" />
                  <Field label="Operating Hours" value={operatingHours} onChange={setOperatingHours} placeholder="06:00 AM - 10:00 PM" />
                </div>
              </div>

              {/* Section: Location */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Location</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Street Address" value={address} onChange={setAddress} placeholder="100ft Road, Near Metro" colSpan />
                  
                  {/* Dynamic State Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      State <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={stateVal}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setStateVal(newState);
                          // Default district to first in list or empty
                          const fallbackDistricts = FALLBACK_STATE_DISTRICTS[newState] || [];
                          if (fallbackDistricts.length > 0) {
                            setDistrictVal(fallbackDistricts[0]);
                          } else {
                            setDistrictVal('');
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-card text-foreground">Select State</option>
                        {statesList.map((st) => (
                          <option key={st} value={st} className="bg-card text-foreground">
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Dynamic District Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      District <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      {districtsList.length > 0 ? (
                        <select
                          value={districtVal}
                          onChange={(e) => setDistrictVal(e.target.value)}
                          disabled={loadingDistricts}
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="" disabled className="bg-card text-foreground">
                            {loadingDistricts ? 'Loading...' : 'Select District'}
                          </option>
                          {districtsList.map((dst) => (
                            <option key={dst} value={dst} className="bg-card text-foreground">
                              {dst}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={districtVal}
                          onChange={(e) => setDistrictVal(e.target.value)}
                          placeholder="e.g. Bengaluru Urban"
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition"
                        />
                      )}
                      {districtsList.length > 0 && (
                        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <Field label="City / Town" value={city} onChange={setCity} placeholder="e.g. Bangalore" />
                  <Field label="Postal / PIN Code" value={postalCode} onChange={setPostalCode} placeholder="560038" />
                </div>
              </div>

              {/* Section: Contact */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone / WhatsApp" value={contactPhone} onChange={setContactPhone} placeholder="+91 98765 43210" type="tel" />
                  <Field label="Email" value={contactEmail} onChange={setContactEmail} placeholder="campus@athlon.sport" type="email" />
                  <Field label="Manager Name" value={managerName} onChange={setManagerName} placeholder="Vikram Sethi" />
                  <Field label="Manager Phone" value={managerPhone} onChange={setManagerPhone} placeholder="+91 98450 11223" type="tel" />
                </div>
              </div>

              {/* Section: Sports Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    Sports Available ({selectedSports.length} Selected)
                  </p>
                  {selectedSports.length === 0 && (
                    <span className="text-[10px] text-amber-400 font-semibold">Select at least one</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {orgSportOptions.map((sport) => {
                    const isSelected = selectedSports.includes(sport.name);
                    return (
                      <button
                        key={sport.value}
                        type="button"
                        onClick={() => toggleSport(sport.name)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                          isSelected
                            ? 'bg-primary/15 text-primary border-primary/50 shadow-sm shadow-primary/10 ring-1 ring-primary/20'
                            : 'bg-background/40 text-foreground/70 border-white/10 hover:border-white/20 active:scale-95'
                        }`}
                      >
                        <span className="text-base shrink-0">{sport.emoji}</span>
                        <span className="truncate flex-1">{sport.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 animate-in zoom-in-50" />
                        )}
                      </button>
                    );
                  })}
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
                  disabled={saving || selectedSports.length === 0}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold text-black bg-primary shadow-lg shadow-primary/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCentre ? 'Update' : 'Create Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
