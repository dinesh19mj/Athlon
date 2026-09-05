'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  Building2,
  Calendar,
  Layers,
  Star,
  Activity,
  ShieldCheck,
  Check,
  UserCheck,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import { useOrgSports, getSportEmoji } from '@/lib/hooks/useOrgSports';
import { AcademyStaffService, AcademyStaffResponse } from '@/lib/api/academyStaff';
import { OrganizationService } from '@/lib/api/organization';
import { AcademyStudentService, AcademyBatch } from '@/lib/api/academyStudent';
import { UserService } from '@/lib/api/user';

/* ─── Coach Role Config ─── */
const COACH_ROLES = [
  { value: 'HEAD_COACH', label: 'Head Coach', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { value: 'SENIOR_COACH', label: 'Senior Coach', badgeClass: 'bg-primary/15 text-primary border-primary/30' },
  { value: 'COACH', label: 'Coach', badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  { value: 'ASSISTANT_COACH', label: 'Assistant Coach', badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  { value: 'FITNESS_TRAINER', label: 'Fitness & Conditioning', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
];

export default function CoachesPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;
  const orgName = activeOrg?.name ?? 'Academy';

  const { isAdmin } = useOrgRole();
  const canManage = isAdmin;
  const { sports: orgSports } = useOrgSports(orgUuid);

  // States
  const [coaches, setCoaches] = useState<AcademyStaffResponse[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add Coach Modal State (Top-of-page Dialog)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState('COACH');
  const [addSport, setAddSport] = useState(orgSports[0] || 'Badminton');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 3500);
    } else {
      setToastSuccess(msg);
      setTimeout(() => setToastSuccess(null), 3500);
    }
  };

  // Load Coaches & Batches
  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [coachesRes, batchesRes] = await Promise.allSettled([
        AcademyStaffService.getCoaches(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
      ]);

      let staffList: AcademyStaffResponse[] = [];
      if (coachesRes.status === 'fulfilled') {
        const raw = coachesRes.value;
        staffList = Array.isArray(raw) ? raw : (raw as any)?.data || [];
      }

      setCoaches(staffList);

      if (batchesRes.status === 'fulfilled') {
        setBatches(batchesRes.value || []);
      }
    } catch (err) {
      console.error('Failed to load coaches data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  // Set default sport when orgSports loads
  useEffect(() => {
    if (orgSports.length > 0 && !orgSports.includes(addSport)) {
      setAddSport(orgSports[0]);
    }
  }, [orgSports]);

  // Compute batches per coach
  const getCoachBatches = (coach: AcademyStaffResponse) => {
    return batches.filter((b) => {
      if (b.coachUuid && coach.userUuid && b.coachUuid === coach.userUuid) return true;
      if (b.coachName && coach.fullName && b.coachName.toLowerCase() === coach.fullName.toLowerCase()) return true;
      return false;
    });
  };

  // Filtered coaches
  const filteredCoaches = useMemo(() => {
    return coaches.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchQuery =
        !q ||
        [c.fullName, c.phone, c.email, c.role, c.sportType].some((v) => v?.toLowerCase().includes(q));

      const matchRole =
        selectedRole === 'ALL' ||
        (c.role && c.role.toUpperCase() === selectedRole.toUpperCase());

      const coachBatches = getCoachBatches(c);
      const matchSport =
        selectedSport === 'ALL' ||
        (c.sportType && c.sportType.toLowerCase() === selectedSport.toLowerCase()) ||
        coachBatches.some((b) => b.sportType?.toLowerCase() === selectedSport.toLowerCase());

      return matchQuery && matchRole && matchSport;
    });
  }, [coaches, searchTerm, selectedRole, selectedSport, batches]);

  // Smart Phone Lookup for Athlon User
  const handleVerifyPhone = async (phoneVal: string) => {
    const clean = phoneVal.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setVerifiedUser(null);
      setLookupError(null);
      return;
    }

    try {
      setVerifyingPhone(true);
      setLookupError(null);
      const res = await UserService.getUserByPhone(clean);
      const user = (res as any)?.data || res;

      if (user && (user.uuid || user.userId || user.userUuid)) {
        setVerifiedUser(user);
        setLookupError(null);
      } else {
        setVerifiedUser(null);
        setLookupError('No Athlon user found with this phone number. The coach must have a registered Athlon account.');
      }
    } catch (err: any) {
      setVerifiedUser(null);
      setLookupError('No Athlon user found with this phone number. Please ask the coach to create an Athlon account.');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handlePhoneInputChange = (val: string) => {
    setAddPhone(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      handleVerifyPhone(clean);
    } else {
      setVerifiedUser(null);
      setLookupError(null);
    }
  };

  const openAddCoachModal = () => {
    setAddPhone('');
    setAddRole('COACH');
    setAddSport(orgSports[0] || 'Badminton');
    setVerifiedUser(null);
    setLookupError(null);
    setShowAddModal(true);
  };

  // Handle Add Coach to academy_staff table
  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgUuid || !addPhone.trim()) return;

    try {
      setSubmittingAdd(true);
      const res = await AcademyStaffService.addStaff(orgUuid, {
        phone: addPhone.trim(),
        role: addRole,
        sportType: addSport,
      });

      const added = (res as any)?.data || res;
      showToast(`🎉 Coach "${added.fullName || addPhone}" added successfully!`);
      setShowAddModal(false);
      setAddPhone('');
      setVerifiedUser(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to add coach:', err);
      const msg = err?.response?.data?.message || err?.message || 'Could not add coach to staff.';
      showToast(msg, true);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Handle Remove Coach
  const handleRemoveCoach = async (coach: AcademyStaffResponse) => {
    if (!confirm(`Are you sure you want to remove ${coach.fullName} from the coaching staff?`)) return;
    try {
      const idToRemove = coach.staffUuid || (coach as any).organizationMemberUuid;
      if (idToRemove) {
        await AcademyStaffService.removeStaff(orgUuid, idToRemove);
      }
      setCoaches((prev) => prev.filter((m) => m.staffUuid !== idToRemove && (m as any).organizationMemberUuid !== idToRemove));
      showToast(`${coach.fullName} removed from coaching staff.`);
    } catch (err: any) {
      console.error('Failed to remove coach:', err);
      const msg = err?.response?.data?.message || err?.message || 'Could not remove coach.';
      showToast(msg, true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── STICKY APP BAR (Mobile & Desktop) ── */}
      <div
        className="sticky top-0 z-30 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/org/${orgUuid}/dashboard`}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/70 shrink-0 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black text-foreground leading-tight truncate">
                  Coaches
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {coaches.length} Coaches
                </span>
              </div>
              <p className="text-[10px] text-foreground/45 truncate">
                {batches.length} Active Coaching Batches • {orgName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={`/org/${orgUuid}/batches`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Manage Batches"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Batches</span>
            </Link>
          </div>
        </div>

        {/* ── Search & Filter Row ── */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coach by name, phone, role, sport..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl text-[11px] text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)', border: '1px solid' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Role Filter Selector */}
          <div className="relative shrink-0">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-2.5 pr-7 py-1.5 rounded-xl text-[11px] font-bold border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none cursor-pointer transition shadow-sm"
              style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)' }}
            >
              <option value="ALL" className="bg-[#18181b] text-white font-semibold">All Roles</option>
              {COACH_ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#18181b] text-white font-semibold">
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
          </div>
        </div>

        {/* Sport Discipline Filter Chips */}
        {orgSports.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 hide-scrollbar">
            <button
              onClick={() => setSelectedSport('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                selectedSport === 'ALL'
                  ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                  : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
              }`}
            >
              All Sports
            </button>
            {orgSports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedSport === sport
                    ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                    : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
                }`}
              >
                <span>{getSportEmoji(sport)}</span>
                <span>{sport}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="px-3.5 sm:px-4 space-y-2 pt-2">
        {toastSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{toastSuccess}</span>
          </div>
        )}
        {toastError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/12 border border-red-500/25 text-red-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{toastError}</span>
          </div>
        )}
      </div>

      {/* ── MAIN COACHES STREAM ── */}
      <div className="px-3.5 sm:px-4 pt-2 space-y-2.5">

        {/* Telemetry Summary */}
        {!loading && (
          <div
            className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl border p-2 text-center"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-mono font-black text-primary">{coaches.length}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Coaches</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-amber-400">
                {coaches.filter((c) => (c.role || '').toUpperCase().includes('HEAD')).length || 1}
              </div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Head Coach</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-cyan-400">{batches.length}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Batches</div>
            </div>
          </div>
        )}

        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] gap-2.5">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-xs text-foreground/40 font-medium">Fetching coaching roster...</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-2 px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-xl">
              🥋
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">No coaching staff found</p>
              <p className="text-[11px] text-foreground/45 mt-0.5 max-w-xs">
                {searchTerm
                  ? 'Try clearing your search query.'
                  : 'Tap the "+" button below to verify and add Athlon coaches via phone number.'}
              </p>
            </div>
            {canManage && (
              <button
                onClick={openAddCoachModal}
                className="mt-2 px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Coach</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredCoaches.map((coach) => {
              const isExpanded = expandedId === coach.staffUuid;
              const coachBatches = getCoachBatches(coach);
              const cleanPhone = (coach.phone || '').replace(/[^0-9]/g, '');
              const sportName = coach.sportType || coachBatches[0]?.sportType;
              const roleObj =
                COACH_ROLES.find((r) => r.value === (coach.role || '').toUpperCase()) || {
                  value: coach.role || 'COACH',
                  label: coach.role || 'Coach',
                  badgeClass: 'bg-primary/10 text-primary border-primary/20',
                };

              return (
                <div
                  key={coach.staffUuid || coach.phone}
                  className="rounded-xl border overflow-hidden transition-all shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* ── Card Main Header ── */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-xs shrink-0 shadow-inner">
                          {coach.fullName ? coach.fullName.slice(0, 2).toUpperCase() : 'CO'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-extrabold text-foreground truncate">
                              {coach.fullName || 'Athlon Coach'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border uppercase shrink-0 ${roleObj.badgeClass}`}>
                              {roleObj.label}
                            </span>
                            {sportName && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-white/5 border border-white/10 text-foreground/80 shrink-0 flex items-center gap-0.5">
                                <span>{getSportEmoji(sportName)}</span>
                                <span>{sportName}</span>
                              </span>
                            )}
                            {coach.userUuid && (
                              <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold">
                                ✓ Verified
                              </span>
                            )}
                          </div>

                          {/* Batches Assigned Info */}
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-foreground/50 flex-wrap">
                            <span className="font-semibold text-foreground/75 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary shrink-0" />
                              <span>{coachBatches.length} Batches Assigned</span>
                            </span>
                            {coach.phone && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-foreground/60">{coach.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand Toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : coach.staffUuid)}
                        className="p-1 rounded-lg text-foreground/35 hover:text-foreground hover:bg-white/5 transition shrink-0 cursor-pointer"
                        title="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* ── Direct Communication Row ── */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        {coach.phone && (
                          <a
                            href={`tel:${coach.phone}`}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition active:scale-95"
                            title="Call Coach"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                              `Hello Coach ${coach.fullName}, regarding training batches at ${orgName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition active:scale-95"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        )}
                        {coach.email && (
                          <a
                            href={`mailto:${coach.email}?subject=${encodeURIComponent(
                              `Academy Coaching Updates - ${orgName}`
                            )}`}
                            className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition active:scale-95"
                            title="Email Coach"
                          >
                            <Mail className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Right: Quick Batch Allocations Pill */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/org/${orgUuid}/batches`}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/60 hover:text-foreground text-[10px] font-bold transition active:scale-95 flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3 text-cyan-400" />
                          <span>Batches</span>
                        </Link>
                        {canManage && (
                          <button
                            onClick={() => handleRemoveCoach(coach)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition active:scale-95 cursor-pointer"
                            title="Remove Coach"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded Batches & Profile View ── */}
                  {isExpanded && (
                    <div className="border-t space-y-2 p-3 bg-black/20" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/40">Email</span>
                          <span className="text-foreground truncate max-w-[200px]">{coach.email || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/40">Staff ID</span>
                          <span className="font-mono text-foreground/70">{coach.staffId || '#'}</span>
                        </div>
                      </div>

                      {/* Batches Assigned */}
                      <div className="pt-2 border-t border-white/5">
                        <span className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                          Assigned Coaching Batches ({coachBatches.length})
                        </span>
                        {coachBatches.length === 0 ? (
                          <p className="text-[10px] text-foreground/40 italic">
                            No batches assigned yet. You can assign this coach when creating or editing batches.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {coachBatches.map((b) => (
                              <div
                                key={b.batchUuid}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1 font-bold text-foreground text-[11px] truncate">
                                    <span>{getSportEmoji(b.sportType)}</span>
                                    <span className="truncate">{b.batchName}</span>
                                  </div>
                                  <div className="text-[9px] text-cyan-400 font-mono mt-0.5">
                                    {b.startTime || '06:00'} - {b.endTime || '07:30'}
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                                  {b.level || 'All'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING ACTION BUTTON (MATCHING CAMPUSES PAGE) ── */}
      {canManage && (
        <button
          onClick={openAddCoachModal}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--athlon-primary)',
            boxShadow: '0 8px 24px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
          }}
          aria-label="Add Coach"
        >
          <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TOP-PLACED DIALOG MODAL: ADD ATHLON COACH VIA PHONE VERIFICATION
         ══════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md animate-in fade-in p-3 sm:p-4 pt-10 sm:pt-16 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 sm:zoom-in-95 shadow-2xl border"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground leading-tight">
                    Add Coach to Staff
                  </h3>
                  <p className="text-[10px] text-foreground/45">
                    Saved in Academy Staff database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCoach} className="p-4 space-y-3.5">
              {/* Phone Lookup Input with Live Validation */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                  Coach Phone Number <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile (e.g. 9876543210)"
                    value={addPhone}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 font-mono transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {verifyingPhone ? (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    ) : verifiedUser ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : addPhone.replace(/[^0-9]/g, '').length >= 10 && lookupError ? (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    ) : null}
                  </div>
                </div>
                <p className="text-[10px] text-foreground/40 mt-1">
                  Automatically verifies registered Athlon player or coach account.
                </p>
              </div>

              {/* Verified User Preview Card */}
              {verifiedUser && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 animate-in fade-in">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    {(verifiedUser.firstName || verifiedUser.name || 'C').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground">
                        {`${verifiedUser.firstName || ''} ${verifiedUser.lastName || ''}`.trim() || verifiedUser.name || 'Athlon User'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ Athlon Verified
                      </span>
                    </div>
                    <div className="text-[10px] text-foreground/50 truncate font-mono mt-0.5">
                      {verifiedUser.phone || addPhone} {verifiedUser.email && `• ${verifiedUser.email}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Lookup Error Banner */}
              {lookupError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>{lookupError}</span>
                </div>
              )}

              {/* Sport Discipline Selection */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                  Sport Discipline <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {orgSports.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAddSport(s)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        addSport.toLowerCase() === s.toLowerCase()
                          ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                          : 'bg-background/40 text-foreground/70 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>{getSportEmoji(s)}</span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coaching Role / Designation */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                  Coaching Designation *
                </label>
                <div className="relative">
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full px-3 py-2 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition appearance-none cursor-pointer"
                  >
                    {COACH_ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#18181b] text-white font-medium">
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground transition cursor-pointer"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || verifyingPhone || (!verifiedUser && addPhone.replace(/[^0-9]/g, '').length >= 10 && Boolean(lookupError))}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black text-xs font-extrabold shadow-sm active:scale-95 transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingAdd ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Add Coach</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}