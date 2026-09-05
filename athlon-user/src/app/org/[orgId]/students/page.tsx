'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgSports, getSportEmoji } from '@/lib/hooks/useOrgSports';
import { useOrgRole } from '@/hooks/use-org-role';
import { UserService, UserResponse } from '@/lib/api/user';
import {
  AcademyStudentService,
  AcademyStudent,
  AcademyBatch,
  AcademyCourt,
  AcademySummary,
  EnrollStudentPayload,
  UpdateStudentPayload,
} from '@/lib/api/academyStudent';
import {
  Search,
  Plus,
  Phone,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Loader2,
  Building2,
  MapPin,
  Check,
  UserPlus,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';

/* ─── Level & Fee Config ─── */
const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
  { value: 'ADVANCED', label: 'Advanced', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  { value: 'ELITE', label: 'Elite', color: 'text-rose-400 bg-rose-500/10 border-rose-500/25' },
  { value: 'PRO', label: 'Pro', color: 'text-primary bg-primary/10 border-primary/25' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
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

export default function StudentsPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;
  const orgName = activeOrg?.name ?? 'Academy Workspace';

  const { isAdmin, isCoach } = useOrgRole();
  const canManage = isAdmin || isCoach;
  const { sports: orgSports } = useOrgSports(orgUuid);

  // Data states
  const [courts, setCourts] = useState<AcademyCourt[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [summary, setSummary] = useState<AcademySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AcademyStudent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<AcademyStudent | null>(null);

  // Smart Phone Lookup State
  const [phoneQuery, setPhoneQuery] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserResponse | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [sportType, setSportType] = useState('Badminton');
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [courtUuid, setCourtUuid] = useState('');
  const [batchUuid, setBatchUuid] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const fetchData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [courtsRes, batchesRes, studentsRes, summaryRes] = await Promise.allSettled([
        AcademyStudentService.getCourts(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
        AcademyStudentService.getStudents(orgUuid),
        AcademyStudentService.getSummary(orgUuid),
      ]);

      if (courtsRes.status === 'fulfilled') setCourts(courtsRes.value || []);
      if (batchesRes.status === 'fulfilled') setBatches(batchesRes.value || []);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value || null);
    } catch (err) {
      console.error('Failed to load students roster data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const openEnrollModal = () => {
    setEditingStudent(null);
    setPhoneQuery('');
    setVerifiedUser(null);
    setFullName('');
    setSportType(orgSports[0] || 'Badminton');
    setGender('MALE');
    setDob('');
    setAge('');
    setBloodGroup('');
    setLevel('BEGINNER');
    setCourtUuid(courts[0]?.courtUuid || '');
    setBatchUuid(batches[0]?.batchUuid || '');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setEmergencyContact('');
    setAddress('');
    setMedicalNotes('');
    setShowEnrollModal(true);
  };

  const openEditModal = (student: AcademyStudent) => {
    setEditingStudent(student);
    setPhoneQuery(student.parentPhone || '');
    setVerifiedUser(null);
    setFullName(student.fullName || '');
    setSportType(student.sportType || orgSports[0] || 'Badminton');
    setGender(student.gender || 'MALE');
    setDob(student.dob || '');
    setAge(student.age !== undefined ? String(student.age) : '');
    setBloodGroup(student.bloodGroup || '');
    setLevel(student.level || 'BEGINNER');
    setCourtUuid(student.courtUuid || '');
    setBatchUuid(student.batchUuid || '');
    setParentName(student.parentName || '');
    setParentPhone(student.parentPhone || '');
    setParentEmail(student.parentEmail || '');
    setEmergencyContact(student.emergencyContact || '');
    setAddress(student.address || '');
    setMedicalNotes(student.medicalNotes || '');
    setShowEnrollModal(true);
  };

  // Smart Phone Lookup
  const handleVerifyPhone = async (cleanPhone: string) => {
    if (cleanPhone.length < 10) return;
    try {
      setVerifyingPhone(true);
      const res = await UserService.getUserByPhone(cleanPhone);
      const user = (res as any)?.data || res;

      if (user && user.uuid) {
        setVerifiedUser(user);
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Athlete';
        if (!fullName) setFullName(name);
        setParentPhone(user.phone || cleanPhone);
        if (user.email) setParentEmail(user.email);
        showToast('Athlon account linked!');
      } else {
        setVerifiedUser(null);
        setParentPhone(cleanPhone);
      }
    } catch {
      setVerifiedUser(null);
      setParentPhone(cleanPhone);
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handlePhoneInputChange = (val: string) => {
    setPhoneQuery(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      handleVerifyPhone(clean);
    }
  };

  // Save / Update Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !orgUuid) return;

    try {
      setSubmitting(true);
      const selectedB = batches.find((b) => b.batchUuid === batchUuid);
      const selectedC = courts.find((c) => c.courtUuid === courtUuid);

      if (editingStudent) {
        const payload: UpdateStudentPayload = {
          studentUuid: editingStudent.studentUuid,
          fullName: fullName.trim(),
          gender,
          dob: dob || undefined,
          age: age ? parseInt(age) : undefined,
          bloodGroup,
          level,
          courtUuid: selectedC?.courtUuid || selectedB?.courtUuid,
          batchUuid: batchUuid || undefined,
          batchName: selectedB?.batchName,
          batchTiming: selectedB ? `${selectedB.startTime} - ${selectedB.endTime}` : undefined,
          parentName,
          parentPhone: parentPhone || phoneQuery,
          parentEmail,
          emergencyContact,
          address,
          medicalNotes,
        };
        const updated = await AcademyStudentService.updateStudent(payload);
        setStudents((prev) =>
          prev.map((s) => (s.studentUuid === updated.studentUuid ? updated : s))
        );
        showToast(`"${fullName}" updated!`);
      } else {
        const payload: EnrollStudentPayload = {
          organizationUuid: orgUuid,
          userUuid: verifiedUser?.uuid,
          fullName: fullName.trim(),
          gender,
          dob: dob || undefined,
          age: age ? parseInt(age) : undefined,
          bloodGroup,
          level,
          courtUuid: selectedC?.courtUuid || selectedB?.courtUuid,
          batchUuid: batchUuid || undefined,
          batchName: selectedB?.batchName,
          batchTiming: selectedB ? `${selectedB.startTime} - ${selectedB.endTime}` : undefined,
          sportType: selectedB?.sportType || sportType || orgSports[0] || 'Badminton',
          parentName,
          parentPhone: parentPhone || phoneQuery,
          parentEmail,
          emergencyContact,
          address,
          medicalNotes,
        };
        const created = await AcademyStudentService.enrollStudent(payload);
        setStudents((prev) => [created, ...prev]);
        showToast(`"${fullName}" enrolled successfully!`);
      }

      setShowEnrollModal(false);
      AcademyStudentService.getSummary(orgUuid).then((res) => setSummary(res));
    } catch (err) {
      console.error('Failed to save student:', err);
      showToast('Failed to save athlete.', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (student: AcademyStudent) => {
    setDeletingStudent(null);
    try {
      await AcademyStudentService.deleteStudent(student.studentUuid);
      setStudents((prev) => prev.filter((s) => s.studentUuid !== student.studentUuid));
      showToast(`"${student.fullName}" removed.`);
      if (orgUuid) AcademyStudentService.getSummary(orgUuid).then((res) => setSummary(res));
    } catch (err) {
      console.error('Failed to delete student:', err);
      showToast('Could not delete athlete.', true);
    }
  };

  // Filtered Students List
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    const matchQuery =
      !q ||
      [s.fullName, s.parentName, s.parentPhone, s.batchName, s.courtName, s.level, s.sportType].some((v) =>
        v?.toLowerCase().includes(q)
      );
    const matchLevel =
      selectedLevel === 'ALL' || s.level?.toUpperCase() === selectedLevel.toUpperCase();
    const matchBatch =
      selectedBatch === 'ALL' || s.batchUuid === selectedBatch;

    return matchQuery && matchLevel && matchBatch;
  });

  const totalStudentsCount = students.length;
  const assignedCount = students.filter((s) => !!s.batchUuid).length;
  const unassignedCount = totalStudentsCount - assignedCount;

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── STICKY COMPACT MOBILE HEADER ── */}
      <div
        className="sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-black text-foreground leading-none">Student Roster</h1>
              <p className="text-[10px] text-foreground/45 mt-0.5">
                {totalStudentsCount} athlete{totalStudentsCount !== 1 ? 's' : ''} • {orgName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${orgUuid}/batches`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Batches ({batches.length})
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search athlete, parent, phone, batch..."
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

        {/* Horizontal Level Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 hide-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedLevel('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
              selectedLevel === 'ALL'
                ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
            }`}
          >
            All Levels ({totalStudentsCount})
          </button>

          {LEVEL_OPTIONS.map((lvl) => {
            const count = students.filter(
              (s) => s.level?.toUpperCase() === lvl.value
            ).length;
            return (
              <button
                key={lvl.value}
                type="button"
                onClick={() => setSelectedLevel(lvl.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedLevel === lvl.value
                    ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                    : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
                }`}
              >
                <span>{lvl.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      selectedLevel === lvl.value
                        ? 'bg-black/20 text-black'
                        : 'bg-white/10 text-foreground/50'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Batch Filter Dropdown Bar */}
        {batches.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 hide-scrollbar">
            <button
              onClick={() => setSelectedBatch('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                selectedBatch === 'ALL'
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-extrabold'
                  : 'bg-white/[0.02] text-foreground/50 border-white/5 hover:border-white/10'
              }`}
            >
              All Batches
            </button>
            {batches.map((b) => (
              <button
                key={b.batchUuid}
                onClick={() => setSelectedBatch(b.batchUuid)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedBatch === b.batchUuid
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-extrabold shadow-sm'
                    : 'bg-white/[0.02] text-foreground/50 border-white/5 hover:border-white/10'
                }`}
              >
                <span>{b.batchName}</span>
                {b.level && (
                  <span className="text-[9px] px-1 rounded bg-white/10 text-foreground/50">
                    {b.level}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="px-4 space-y-2 pt-3">
        {toastSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {toastSuccess}
          </div>
        )}
        {toastError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-500/12 border border-red-500/25 text-red-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {toastError}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="px-4 pt-3 space-y-3">

        {/* Telemetry Micro-Pills */}
        {!loading && students.length > 0 && (
          <div
            className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl border p-2 text-center"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-mono font-black text-primary">{totalStudentsCount}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Athletes</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-indigo-400">{assignedCount}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">In Batches</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-cyan-400">{unassignedCount}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Unassigned</div>
            </div>
          </div>
        )}

        {/* Count hint */}
        {!loading && filteredStudents.length > 0 && (
          <p className="text-[10px] text-foreground/35 font-medium px-1">
            Showing {filteredStudents.length} of {totalStudentsCount}
          </p>
        )}

        {/* Loading / Empty / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">Loading athlete roster…</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[260px] text-center space-y-3 px-6">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No students found</p>
              <p className="text-xs text-foreground/45 mt-1">
                {searchTerm
                  ? 'Try adjusting your search or filters.'
                  : 'Tap + to enroll your first academy athlete.'}
              </p>
            </div>
            {!searchTerm && canManage && (
              <button
                onClick={openEnrollModal}
                className="px-5 py-2.5 bg-primary text-black text-xs font-extrabold rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition"
              >
                + Enroll Student
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isExpanded = expandedId === student.studentUuid;
              const lvlObj =
                LEVEL_OPTIONS.find((l) => l.value === (student.level || 'BEGINNER').toUpperCase()) ||
                LEVEL_OPTIONS[0];
              const sportName = student.sportType || 'Badminton';
              const sportIcon = getSportEmoji(sportName);

              return (
                <div
                  key={student.studentUuid}
                  className="rounded-2xl border overflow-hidden transition-all"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* ── Card Header (Always Visible) ── */}
                  <button
                    className="w-full text-left p-4 flex items-start justify-between gap-3 active:bg-white/[0.02] transition"
                    onClick={() => setExpandedId(isExpanded ? null : student.studentUuid)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Athlete Initials Badge */}
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-xs shrink-0 shadow-inner">
                        {student.fullName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-foreground truncate leading-tight">
                            {student.fullName}
                          </span>
                          {student.userUuid && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                              ✓ Athlon
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase shrink-0 ${lvlObj.color}`}>
                            {student.level || 'Beginner'}
                          </span>
                        </div>

                        {/* Age, Gender & Blood Group */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-foreground/50">
                          <span>
                            {student.age ? `${student.age} yrs` : 'Athlete'} {student.gender ? `• ${student.gender}` : ''}
                          </span>
                          {student.bloodGroup && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-foreground/60 border border-white/10 font-mono font-bold">
                              🩸 {student.bloodGroup}
                            </span>
                          )}
                        </div>

                        {/* Batch & Court Location */}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-foreground/45 truncate">
                          <span className="flex items-center gap-1 text-primary font-semibold truncate">
                            <Sparkles className="w-3 h-3 text-primary shrink-0" />
                            {student.batchName || 'Unassigned Batch'}
                          </span>
                          {student.courtName && (
                            <span className="flex items-center gap-1 truncate text-cyan-400">
                              <Building2 className="w-3 h-3 shrink-0" />
                              {student.courtName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-white/5 border-white/10 text-foreground/70 flex items-center gap-1">
                        <span>{sportIcon}</span>
                        <span>{sportName}</span>
                      </span>
                      <span className="text-foreground/30 mt-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </button>

                  {/* ── Quick Spec Strip (Always Visible) ── */}
                  <div
                    className="grid grid-cols-3 divide-x divide-white/5 border-t text-center"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="py-2 px-1">
                      <div className="text-xs font-extrabold text-primary flex items-center justify-center gap-1 truncate px-1">
                        <span>{sportIcon}</span>
                        <span className="truncate">{sportName}</span>
                      </div>
                      <div className="text-[8px] text-foreground/40 font-bold uppercase tracking-wide">Discipline</div>
                    </div>
                    <div className="py-2 px-1">
                      <div className="text-xs font-extrabold text-cyan-400 truncate px-1">
                        {student.batchTiming || 'Flexible'}
                      </div>
                      <div className="text-[8px] text-foreground/40 font-bold uppercase tracking-wide">Timing</div>
                    </div>
                    <div className="py-2 px-1 flex items-center justify-center">
                      {student.parentPhone ? (
                        <a
                          href={`tel:${student.parentPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold active:scale-95 transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-foreground/30 font-medium">No Phone</span>
                      )}
                    </div>
                  </div>

                  {/* ── Expanded Detail View ── */}
                  {isExpanded && (
                    <div className="border-t space-y-2.5 px-4 py-3" style={{ borderColor: 'var(--athlon-border)' }}>
                      {/* Guardian & Contact */}
                      <div className="space-y-1.5 text-[11px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/40">Guardian</span>
                          <span className="text-foreground font-semibold">{student.parentName || 'Self / Not Listed'}</span>
                        </div>
                        {student.parentPhone && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Phone</span>
                            <span className="font-mono text-primary">{student.parentPhone}</span>
                          </div>
                        )}
                        {student.parentEmail && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Email</span>
                            <span className="text-foreground truncate max-w-[180px]">{student.parentEmail}</span>
                          </div>
                        )}
                        {student.emergencyContact && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Emergency</span>
                            <span className="text-red-400 font-mono">{student.emergencyContact}</span>
                          </div>
                        )}
                      </div>

                      {/* Medical Notes */}
                      {student.medicalNotes && (
                        <div className="text-[10px] text-foreground/50 bg-red-500/5 border border-red-500/10 p-2 rounded-xl flex items-start gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span>{student.medicalNotes}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-[10px] text-foreground/40">Athlete Record</span>

                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(student)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-foreground/60 hover:text-foreground border border-transparent hover:border-white/10 transition active:scale-95"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="p-1.5 rounded-xl text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition active:scale-95"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* ── FLOATING ACTION BUTTON (FAB) ── */}
      {canManage && (
        <button
          onClick={openEnrollModal}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
          style={{
            backgroundColor: 'var(--athlon-primary)',
            boxShadow: '0 8px 24px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
          }}
          aria-label="Enroll Student"
        >
          <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM SHEET MODAL: ENROLL / EDIT STUDENT
         ══════════════════════════════════════════════════════════════════ */}
      {showEnrollModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEnrollModal(false);
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
                <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <UserPlus className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-extrabold text-foreground">
                  {editingStudent ? 'Edit Athlete Profile' : 'Enroll Academy Student'}
                </span>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStudent} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Step 1: Smart Phone Lookup (for new enrollments) */}
              {!editingStudent && (
                <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-wider">
                      Smart Athlon Phone Lookup
                    </label>
                    {verifyingPhone && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneQuery}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-background/80 border border-white/10 rounded-xl text-xs text-foreground font-mono placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition"
                    />
                    {verifiedUser && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Athlete Identity */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Athlete Profile</p>
                <div className="space-y-3">
                  <Field
                    label="Full Name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="e.g. Rohan Sharma"
                    required
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {/* Gender */}
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-2.5 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition appearance-none cursor-pointer"
                        >
                          <option value="MALE" className="bg-card text-foreground">Male</option>
                          <option value="FEMALE" className="bg-card text-foreground">Female</option>
                          <option value="OTHER" className="bg-card text-foreground">Other</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Age */}
                    <Field
                      label="Age (Years)"
                      value={age}
                      onChange={setAge}
                      type="number"
                      placeholder="14"
                    />

                    {/* Blood Group */}
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Blood Group
                      </label>
                      <div className="relative">
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-2.5 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-card text-foreground">Select…</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg} className="bg-card text-foreground">
                              {bg}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Sport selection if academy offers multiple sports */}
                  {orgSports.length > 1 && (
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                        Primary Sport
                      </label>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                        {orgSports.map((s) => {
                          const isSelected = sportType.toLowerCase() === s.toLowerCase();
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSportType(s)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border shrink-0 ${
                                isSelected
                                  ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                                  : 'bg-background/40 text-foreground/70 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <span>{getSportEmoji(s)}</span>
                              <span>{s}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Skill Level */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                      Skill Level
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {LEVEL_OPTIONS.map((lvl) => {
                        const isSelected = level === lvl.value;
                        return (
                          <button
                            key={lvl.value}
                            type="button"
                            onClick={() => setLevel(lvl.value)}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                              isSelected
                                ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                                : 'bg-background/40 text-foreground/60 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Batch & Court Placement */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Batch &amp; Court</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Batch Select */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      Coaching Batch
                    </label>
                    <div className="relative">
                      <select
                        value={batchUuid}
                        onChange={(e) => setBatchUuid(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition appearance-none cursor-pointer truncate pr-7"
                      >
                        <option value="" className="bg-card text-foreground">Unassigned</option>
                        {batches.map((b) => (
                          <option key={b.batchUuid} value={b.batchUuid} className="bg-card text-foreground">
                            {b.batchName} ({b.level || 'All'})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Court Select */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      Court / Venue
                    </label>
                    <div className="relative">
                      <select
                        value={courtUuid}
                        onChange={(e) => setCourtUuid(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition appearance-none cursor-pointer truncate pr-7"
                      >
                        <option value="" className="bg-card text-foreground">Main Venue</option>
                        {courts.map((c) => (
                          <option key={c.courtUuid} value={c.courtUuid} className="bg-card text-foreground">
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Guardian & Contact Details */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Guardian &amp; Emergency</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Parent / Guardian Name"
                      value={parentName}
                      onChange={setParentName}
                      placeholder="e.g. Suresh Sharma"
                    />

                    <Field
                      label="Primary Phone"
                      value={parentPhone}
                      onChange={setParentPhone}
                      placeholder="+91 98765 43210"
                      type="tel"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Email Address"
                      value={parentEmail}
                      onChange={setParentEmail}
                      placeholder="parent@example.com"
                      type="email"
                    />

                    <Field
                      label="Emergency Contact"
                      value={emergencyContact}
                      onChange={setEmergencyContact}
                      placeholder="e.g. +91 98450 11223"
                      type="tel"
                    />
                  </div>

                  <Field
                    label="Medical Notes / Allergies"
                    value={medicalNotes}
                    onChange={setMedicalNotes}
                    placeholder="e.g. Asthma inhaler, Dust allergy"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold text-foreground/70 border transition active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold text-black bg-primary shadow-lg shadow-primary/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingStudent ? 'Update Athlete' : 'Enroll Athlete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 space-y-4"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-foreground">Remove from Roster?</h3>
              <p className="text-xs text-foreground/50 mt-1">
                &quot;{deletingStudent.fullName}&quot; will be removed from the academy roster and batch allocations.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 transition active:scale-95"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(deletingStudent)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold transition active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}