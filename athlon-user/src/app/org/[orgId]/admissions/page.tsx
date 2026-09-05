'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  HeartPulse,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import { useOrgSports, getSportEmoji } from '@/lib/hooks/useOrgSports';
import {
  AcademyStudentService,
  AcademyStudent,
  AcademyBatch,
  AcademyCourt,
  UpdateStudentPayload,
} from '@/lib/api/academyStudent';

/* ─── Level Config ─── */
const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
  { value: 'ADVANCED', label: 'Advanced', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  { value: 'ELITE', label: 'Elite', color: 'text-rose-400 bg-rose-500/10 border-rose-500/25' },
  { value: 'PRO', label: 'Pro', color: 'text-primary bg-primary/10 border-primary/25' },
];

export default function AcademyAdmissionsPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;
  const orgName = activeOrg?.name ?? 'Academy Workspace';

  const { isAdmin, isCoach } = useOrgRole();
  const canManage = isAdmin || isCoach;
  const { sports: orgSports } = useOrgSports(orgUuid);

  // Data States
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [courts, setCourts] = useState<AcademyCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Tabs: 'enquiries' | 'admitted' | 'archived'
  const [activeTab, setActiveTab] = useState<'enquiries' | 'admitted' | 'archived'>('enquiries');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Admissions Open Toggle State
  const [admissionsOpen, setAdmissionsOpen] = useState(true);

  // Admit / Assign Modal State
  const [admittingStudent, setAdmittingStudent] = useState<AcademyStudent | null>(null);
  const [assignBatchUuid, setAssignBatchUuid] = useState('');
  const [assignCourtUuid, setAssignCourtUuid] = useState('');
  const [assignSportType, setAssignSportType] = useState('Badminton');
  const [assignLevel, setAssignLevel] = useState('BEGINNER');
  const [processingAdmission, setProcessingAdmission] = useState(false);

  // Fetch all students, batches, courts
  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [studentsRes, batchesRes, courtsRes] = await Promise.allSettled([
        AcademyStudentService.getStudents(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
        AcademyStudentService.getCourts(orgUuid),
      ]);

      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);
      if (batchesRes.status === 'fulfilled') setBatches(batchesRes.value || []);
      if (courtsRes.status === 'fulfilled') setCourts(courtsRes.value || []);
    } catch (err) {
      console.error('Failed to load admissions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 3500);
    } else {
      setToastSuccess(msg);
      setTimeout(() => setToastSuccess(null), 3500);
    }
  };

  // Group Students by Status
  const enquiriesList = useMemo(() => {
    return students.filter(
      (s) =>
        s.status === 'ENQUIRY' ||
        s.status === 'PENDING_APPROVAL' ||
        s.status === 'PENDING_ADMISSION' ||
        s.status === 'PENDING'
    );
  }, [students]);

  const admittedList = useMemo(() => {
    return students.filter(
      (s) => s.status === 'ACTIVE' || !s.status || s.status === 'GRADUATED'
    );
  }, [students]);

  const archivedList = useMemo(() => {
    return students.filter(
      (s) => s.status === 'REJECTED' || s.status === 'ARCHIVED' || s.status === 'INACTIVE'
    );
  }, [students]);

  // Current tab dataset
  const currentTabDataset = useMemo(() => {
    if (activeTab === 'enquiries') return enquiriesList;
    if (activeTab === 'admitted') return admittedList;
    return archivedList;
  }, [activeTab, enquiriesList, admittedList, archivedList]);

  // Filtered List for Current Tab
  const filteredStudents = useMemo(() => {
    return currentTabDataset.filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      const matchQuery =
        !q ||
        [s.fullName, s.parentName, s.parentPhone, s.parentEmail, s.batchName, s.courtName, s.sportType, s.level].some(
          (v) => v?.toLowerCase().includes(q)
        );
      const matchSport =
        selectedSport === 'ALL' ||
        (s.sportType && s.sportType.toLowerCase() === selectedSport.toLowerCase());
      const matchLevel =
        selectedLevel === 'ALL' ||
        (s.level && s.level.toUpperCase() === selectedLevel.toUpperCase());
      const matchBatch =
        selectedBatch === 'ALL' || s.batchUuid === selectedBatch;

      return matchQuery && matchSport && matchLevel && matchBatch;
    });
  }, [currentTabDataset, searchTerm, selectedSport, selectedLevel, selectedBatch]);

  // Open Admit Modal
  const openAdmitModal = (student: AcademyStudent) => {
    setAdmittingStudent(student);
    const matchedB = batches.find((b) => b.batchUuid === student.batchUuid) || batches[0];
    setAssignBatchUuid(matchedB?.batchUuid || '');
    setAssignCourtUuid(matchedB?.courtUuid || student.courtUuid || courts[0]?.courtUuid || '');
    setAssignSportType(student.sportType || matchedB?.sportType || orgSports[0] || 'Badminton');
    setAssignLevel(student.level || 'BEGINNER');
  };

  // Submit Admission (Admit / Accept Application)
  const handleConfirmAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admittingStudent || !orgUuid) return;

    try {
      setProcessingAdmission(true);
      const selectedB = batches.find((b) => b.batchUuid === assignBatchUuid);
      const selectedC = courts.find((c) => c.courtUuid === assignCourtUuid);

      const payload: UpdateStudentPayload = {
        studentUuid: admittingStudent.studentUuid,
        status: 'ACTIVE',
        batchUuid: selectedB?.batchUuid || undefined,
        batchName: selectedB?.batchName || undefined,
        batchTiming: selectedB ? `${selectedB.startTime} - ${selectedB.endTime}` : undefined,
        courtUuid: selectedC?.courtUuid || selectedB?.courtUuid || undefined,
        courtName: selectedC?.name || selectedB?.courtName || undefined,
        sportType: assignSportType,
        level: assignLevel,
      };

      const updated = await AcademyStudentService.updateStudent(payload);

      setStudents((prev) =>
        prev.map((s) => (s.studentUuid === updated.studentUuid ? updated : s))
      );

      showToast(`🎉 "${admittingStudent.fullName}" has been admitted and enrolled!`);
      setAdmittingStudent(null);
      await loadData();
    } catch (err) {
      console.error('Failed to admit student:', err);
      showToast('Could not complete admission. Please try again.', true);
    } finally {
      setProcessingAdmission(false);
    }
  };

  // Decline Application
  const handleDeclineEnquiry = async (student: AcademyStudent) => {
    if (!confirm(`Are you sure you want to decline admission for "${student.fullName}"?`)) return;
    try {
      const updated = await AcademyStudentService.updateStudent({
        studentUuid: student.studentUuid,
        status: 'REJECTED',
      });
      setStudents((prev) =>
        prev.map((s) => (s.studentUuid === updated.studentUuid ? updated : s))
      );
      showToast(`Enquiry for "${student.fullName}" declined.`);
      await loadData();
    } catch (err) {
      console.error('Failed to decline enquiry:', err);
      showToast('Could not update status.', true);
    }
  };

  // Re-Open / Move back to Enquiry or Active
  const handleReactivate = async (student: AcademyStudent) => {
    try {
      const updated = await AcademyStudentService.updateStudent({
        studentUuid: student.studentUuid,
        status: 'ACTIVE',
      });
      setStudents((prev) =>
        prev.map((s) => (s.studentUuid === updated.studentUuid ? updated : s))
      );
      showToast(`"${student.fullName}" marked as Active student.`);
    } catch {
      showToast('Could not reactivate.', true);
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── STREAMLINED MOBILE & DESKTOP APP BAR ── */}
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
                  Admissions
                </h1>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${admissionsOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                    }`}
                  title={admissionsOpen ? 'Admissions Open' : 'Admissions Paused'}
                />
              </div>
              <p className="text-[10px] text-foreground/45 truncate">
                {enquiriesList.length} Inbound • {admittedList.length} Enrolled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Master Admissions Toggle Button */}
            <button
              onClick={() => {
                const nextState = !admissionsOpen;
                setAdmissionsOpen(nextState);
                showToast(nextState ? '🟢 Admissions are now OPEN on Marketplace' : '🔴 Admissions are now PAUSED');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold transition active:scale-95 ${admissionsOpen
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
            >
              <span className="hidden xs:inline">{admissionsOpen ? 'Open' : 'Paused'}</span>
              <span className="xs:hidden">{admissionsOpen ? 'Open' : 'Paused'}</span>
            </button>

            {/* Roster Link Button */}
            <Link
              href={`/org/${orgUuid}/students`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="View Athlete Roster"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Roster</span>
            </Link>
          </div>
        </div>

        {/* ── CONCISE SEGMENTED TABS (No Wrapping on Mobile) ── */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/25 border border-white/5 mb-2">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition relative ${activeTab === 'enquiries'
                ? 'bg-primary text-black shadow-sm font-black'
                : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <span>Inquiries</span>
            {enquiriesList.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === 'enquiries'
                    ? 'bg-black/20 text-black'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
              >
                {enquiriesList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admitted')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'admitted'
                ? 'bg-primary text-black shadow-sm font-black'
                : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <span>Enrolled</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === 'admitted' ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/60'
                }`}
            >
              {admittedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'archived'
                ? 'bg-primary text-black shadow-sm font-black'
                : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <span>Archive</span>
            {archivedList.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === 'archived' ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/40'
                  }`}
              >
                {archivedList.length}
              </span>
            )}
          </button>
        </div>

        {/* Compact Search & Filter Row */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applicant name, phone..."
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

          {/* Sport Selector Pill */}
          {orgSports.length > 1 && (
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-white/5 border text-foreground/70 focus:outline-none cursor-pointer"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <option value="ALL">All Sports</option>
              {orgSports.map((s) => (
                <option key={s} value={s}>
                  {getSportEmoji(s)} {s}
                </option>
              ))}
            </select>
          )}
        </div>
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

      {/* ── MAIN CONTENT STREAM ── */}
      <div className="px-3.5 sm:px-4 pt-2 space-y-2.5">

        {/* Count hint */}
        {!loading && filteredStudents.length > 0 && (
          <p className="text-[10px] text-foreground/35 font-medium px-0.5">
            {filteredStudents.length} {activeTab === 'enquiries' ? 'pending inquiries' : activeTab === 'admitted' ? 'enrolled students' : 'archived'}
          </p>
        )}

        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] gap-2.5">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-xs text-foreground/40 font-medium">Loading admissions pipeline...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-2 px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-xl">
              {activeTab === 'enquiries' ? '📩' : activeTab === 'admitted' ? '🎓' : '🗄️'}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {activeTab === 'enquiries'
                  ? 'No inbound inquiries pending'
                  : activeTab === 'admitted'
                    ? 'No enrolled students found'
                    : 'No archived records'}
              </p>
              <p className="text-[11px] text-foreground/45 mt-0.5 max-w-xs">
                {searchTerm
                  ? 'Try clearing your search term.'
                  : activeTab === 'enquiries'
                    ? 'Applications for admission review.'
                    : 'Admit applicants from the Inquiries tab to build your roster.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredStudents.map((student) => {
              const isExpanded = expandedId === student.studentUuid;
              const lvlObj =
                LEVEL_OPTIONS.find((l) => l.value === (student.level || 'BEGINNER').toUpperCase()) ||
                LEVEL_OPTIONS[0];
              const sportName = student.sportType || 'Badminton';
              const sportIcon = getSportEmoji(sportName);
              const cleanPhone = (student.parentPhone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={student.studentUuid}
                  className="rounded-xl border overflow-hidden transition-all shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* ── Card Header ── */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {student.fullName.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-extrabold text-foreground truncate">
                              {student.fullName}
                            </span>
                            {student.userUuid && (
                              <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold">
                                ✓ Verified
                              </span>
                            )}
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border uppercase shrink-0 ${lvlObj.color}`}>
                              {student.level || 'Beginner'}
                            </span>
                          </div>

                          {/* Sport & Timing info */}
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-foreground/50 flex-wrap">
                            <span className="font-semibold text-foreground/75 flex items-center gap-0.5">
                              <span>{sportIcon}</span>
                              <span>{sportName}</span>
                            </span>
                            <span>•</span>
                            <span className="text-primary font-medium truncate max-w-[130px]">
                              {student.batchName || 'General Batch'}
                            </span>
                            {student.batchTiming && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-400 font-mono">{student.batchTiming}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand Toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : student.studentUuid)}
                        className="p-1 rounded-lg text-foreground/35 hover:text-foreground hover:bg-white/5 transition shrink-0"
                        title="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* ── Direct Action Row (Mobile Optimized) ── */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-white/5">
                      {/* Left: Instant Contact Icons */}
                      <div className="flex items-center gap-1">
                        {student.parentPhone && (
                          <a
                            href={`tel:${student.parentPhone}`}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition active:scale-95"
                            title="Call Guardian"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                              `Hello ${student.parentName || student.fullName}, regarding your coaching admission application for ${sportName} at ${orgName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition active:scale-95"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        )}
                        {student.parentEmail && (
                          <a
                            href={`mailto:${student.parentEmail}?subject=${encodeURIComponent(
                              `Admission Enquiry for ${student.fullName} - ${orgName}`
                            )}`}
                            className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition active:scale-95"
                            title="Email Guardian"
                          >
                            <Mail className="w-3 h-3" />
                          </a>
                        )}
                        <span className="text-[9px] text-foreground/30 ml-1">
                          {formatDate(student.enrollmentDate || (student as any).createdAt)}
                        </span>
                      </div>

                      {/* Right: Admit or Decline Buttons */}
                      {canManage && activeTab === 'enquiries' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeclineEnquiry(student)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-foreground/40 hover:text-red-400 text-[10px] font-bold transition active:scale-95"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => openAdmitModal(student)}
                            className="px-2.5 py-1 rounded-lg bg-primary text-black text-[10px] font-black shadow-sm hover:brightness-110 transition active:scale-95 flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Admit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Expanded Detail View ── */}
                  {isExpanded && (
                    <div className="border-t space-y-2 p-3 bg-black/20" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/40">Guardian</span>
                          <span className="text-foreground font-semibold">{student.parentName || 'Self / Not Listed'}</span>
                        </div>
                        {student.parentPhone && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Phone</span>
                            <span className="font-mono text-primary font-bold">{student.parentPhone}</span>
                          </div>
                        )}
                        {student.parentEmail && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Email</span>
                            <span className="text-foreground truncate max-w-[170px]">{student.parentEmail}</span>
                          </div>
                        )}
                        {student.emergencyContact && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Emergency</span>
                            <span className="text-red-400 font-mono">{student.emergencyContact}</span>
                          </div>
                        )}
                        {student.address && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Address</span>
                            <span className="text-foreground truncate max-w-[170px]">{student.address}</span>
                          </div>
                        )}
                      </div>

                      {student.medicalNotes && (
                        <div className="text-[9px] text-foreground/60 bg-red-500/5 border border-red-500/10 p-1.5 rounded-lg flex items-start gap-1">
                          <HeartPulse className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span>{student.medicalNotes}</span>
                        </div>
                      )}

                      {canManage && activeTab === 'archived' && (
                        <div className="flex items-center justify-end pt-1">
                          <button
                            onClick={() => handleReactivate(student)}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Reactivate to Enrolled
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM SHEET MODAL: ADMIT / ACCEPT ATHLETE ENROLMENT
         ══════════════════════════════════════════════════════════════════ */}
      {admittingStudent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAdmittingStudent(null);
          }}
        >
          <div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95"
            style={{ backgroundColor: 'var(--athlon-card)', maxHeight: '90dvh' }}
          >
            {/* Sheet Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-foreground">
                  Confirm Admission
                </span>
              </div>
              <button
                onClick={() => setAdmittingStudent(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAdmission} className="overflow-y-auto flex-1 px-4 py-3.5 space-y-3">
              {/* Applicant Overview Banner */}
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-foreground">{admittingStudent.fullName}</h4>
                  <p className="text-[10px] text-foreground/60">
                    {admittingStudent.parentPhone || 'No Phone'} • {admittingStudent.level || 'Beginner'}
                  </p>
                </div>
                <span className="text-xl">{getSportEmoji(admittingStudent.sportType)}</span>
              </div>

              {/* Coaching Batch Assignment */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                  Assign Coaching Batch *
                </label>
                <div className="relative">
                  <select
                    value={assignBatchUuid}
                    onChange={(e) => setAssignBatchUuid(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-card text-foreground">
                      Select Batch...
                    </option>
                    {batches.map((b) => (
                      <option key={b.batchUuid} value={b.batchUuid} className="bg-card text-foreground">
                        {b.batchName} ({b.startTime || '06:00'} - {b.endTime || '07:30'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                </div>
              </div>

              {/* Sport Discipline */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                  Sport Discipline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {orgSports.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAssignSportType(s)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border ${assignSportType.toLowerCase() === s.toLowerCase()
                          ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                          : 'bg-background/40 text-foreground/70 border-white/10'
                        }`}
                    >
                      <span>{getSportEmoji(s)}</span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                  Skill Level
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setAssignLevel(lvl.value)}
                      className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-bold border transition ${assignLevel === lvl.value
                          ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                          : 'bg-background/40 text-foreground/60 border-white/10'
                        }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setAdmittingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground transition"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingAdmission}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black text-xs font-extrabold shadow-sm active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {processingAdmission ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Admitting...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Admit</span>
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
