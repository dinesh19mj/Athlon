'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import { OrganizationService } from '@/lib/api/organization';
import { UserService, UserResponse } from '@/lib/api/user';
import {
  AcademyStudentService,
  AcademyStudent,
  AcademyBatch,
  AcademyCourt,
  AcademySummary,
  EnrollStudentPayload,
  UpdateStudentPayload,
  CreateBatchPayload,
  CreateCourtPayload,
} from '@/lib/api/academyStudent';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Phone,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Layers,
  Sparkles,
  CreditCard,
  Edit2,
  Trash2,
  Calendar,
  HeartPulse,
  UserCheck,
  X,
  ChevronDown,
  Mail,
  Shield,
  Loader2,
  TrendingUp,
  Award,
  Zap,
  Info,
  CalendarDays,
  User,
  Building2,
  MapPin,
  Flame,
  Check,
  UserPlus
} from 'lucide-react';

const AVAILABLE_SPORTS = [
  { name: 'Badminton', icon: '🏸' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Football', icon: '⚽' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Table Tennis', icon: '🏓' },
  { name: 'Pickleball', icon: '🥒' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Volleyball', icon: '🏐' },
  { name: 'Squash', icon: '🎾' }
];

const AVAILABLE_SPORTS_ICONS: Record<string, string> = {
  Badminton: '🏸',
  Cricket: '🏏',
  Football: '⚽',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Pickleball: '🥒',
  Basketball: '🏀',
  Volleyball: '🏐',
  Squash: '🎾'
};

const SURFACE_TYPES = [
  'Synthetic Mat',
  'Wooden Flooring',
  'Clay Court',
  'Hard Court',
  'Grass Turf',
  'Artificial Turf',
  'Rubberized Court',
  'Concrete'
];

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BEGINNER: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  INTERMEDIATE: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  ADVANCED: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  ELITE: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  PRO: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' }
};

const FEE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PAID: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  PENDING: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  OVERDUE: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' }
};

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function StudentsPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;

  const { isAdmin, isCoach } = useOrgRole();
  const canManage = isAdmin || isCoach;

  // Academy Sport State
  const [academySport, setAcademySport] = useState<string>('');
  const [selectedSportToSave, setSelectedSportToSave] = useState<string>('Badminton');
  const [isSavingSport, setIsSavingSport] = useState(false);

  // Data states
  const [courts, setCourts] = useState<AcademyCourt[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [summary, setSummary] = useState<AcademySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<string>('ALL');

  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AcademyStudent | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Smart Phone Lookup State in Enrollment Modal
  const [phoneQuery, setPhoneQuery] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserResponse | null>(null);
  const [phoneLookupDone, setPhoneLookupDone] = useState(false);
  const [accountRole, setAccountRole] = useState<'STUDENT' | 'PARENT' | 'GUARDIAN'>('STUDENT');

  // Form State for Enroll / Edit Student
  const [studentForm, setStudentForm] = useState<{
    fullName: string;
    gender: string;
    dob: string;
    age: string;
    bloodGroup: string;
    level: string;
    courtUuid: string;
    batchUuid: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    emergencyContact: string;
    address: string;
    medicalNotes: string;
    monthlyFee: string;
    feeFrequency: string;
    feeStatus: string;
  }>({
    fullName: '',
    gender: 'MALE',
    dob: '',
    age: '',
    bloodGroup: '',
    level: 'BEGINNER',
    courtUuid: '',
    batchUuid: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    address: '',
    medicalNotes: '',
    monthlyFee: '1500',
    feeFrequency: 'MONTHLY',
    feeStatus: 'PAID'
  });

  // Form State for Court Create
  const [courtForm, setCourtForm] = useState<{
    name: string;
    surfaceType: string;
    courtNumber: string;
    location: string;
    hourlyRate: string;
  }>({
    name: '',
    surfaceType: 'Synthetic Mat',
    courtNumber: '',
    location: '',
    hourlyRate: '500'
  });

  // Form State for Batch Create
  const [batchForm, setBatchForm] = useState<{
    courtUuid: string;
    batchName: string;
    level: string;
    coachName: string;
    daysOfWeek: string;
    startTime: string;
    endTime: string;
    maxCapacity: string;
    monthlyFee: string;
  }>({
    courtUuid: '',
    batchName: '',
    level: 'ALL',
    coachName: '',
    daysOfWeek: 'MON,WED,FRI',
    startTime: '06:00',
    endTime: '07:30',
    maxCapacity: '20',
    monthlyFee: '1500'
  });

  // Fetch all academy data + Org Profile for Sport
  const fetchData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [profileRes, courtsRes, batchesRes, studentsRes, summaryRes] = await Promise.allSettled([
        OrganizationService.getProfileByOrgUuid(orgUuid),
        AcademyStudentService.getCourts(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
        AcademyStudentService.getStudents(orgUuid),
        AcademyStudentService.getSummary(orgUuid)
      ]);

      if (profileRes.status === 'fulfilled') {
        const prof = (profileRes.value as any)?.data || profileRes.value;
        if (prof?.sportsOffered) {
          setAcademySport(prof.sportsOffered);
          setSelectedSportToSave(prof.sportsOffered);
        }
      }

      if (courtsRes.status === 'fulfilled') setCourts(courtsRes.value || []);
      if (batchesRes.status === 'fulfilled') setBatches(batchesRes.value || []);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value || null);
    } catch (err) {
      console.error('Failed to load academy data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgUuid]);

  const showToast = (msg: string) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(null), 3500);
  };

  // Save Academy Sport
  const handleSaveAcademySport = async (sportName: string) => {
    if (!orgUuid || !sportName) return;
    try {
      setIsSavingSport(true);
      await OrganizationService.saveProfile({
        organizationUuid: orgUuid,
        sportsOffered: sportName
      });
      setAcademySport(sportName);
      showToast(`Academy sport set to ${sportName}!`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save academy sport.');
    } finally {
      setIsSavingSport(false);
    }
  };

  // Phone Lookup Function
  const handleVerifyPhone = async (phoneToVerify: string) => {
    const cleanPhone = phoneToVerify.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) return;

    try {
      setVerifyingPhone(true);
      setPhoneLookupDone(false);
      const res = await UserService.getUserByPhone(cleanPhone);
      const user = (res as any)?.data || res;

      if (user && user.uuid) {
        setVerifiedUser(user);
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Athlon Athlete';
        // Auto-fill student form based on account role
        if (accountRole === 'STUDENT') {
          setStudentForm(prev => ({
            ...prev,
            fullName: name,
            parentPhone: user.phone || cleanPhone,
            parentEmail: user.email || prev.parentEmail
          }));
        } else {
          setStudentForm(prev => ({
            ...prev,
            parentName: name,
            parentPhone: user.phone || cleanPhone,
            parentEmail: user.email || prev.parentEmail
          }));
        }
      } else {
        setVerifiedUser(null);
        setStudentForm(prev => ({
          ...prev,
          parentPhone: cleanPhone
        }));
      }
    } catch (err) {
      setVerifiedUser(null);
      setStudentForm(prev => ({
        ...prev,
        parentPhone: cleanPhone
      }));
    } finally {
      setVerifyingPhone(false);
      setPhoneLookupDone(true);
    }
  };

  const handlePhoneInputChange = (val: string) => {
    setPhoneQuery(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      handleVerifyPhone(clean);
    } else {
      setVerifiedUser(null);
      setPhoneLookupDone(false);
    }
  };

  // Handle Account Role switch (Student vs Parent vs Guardian)
  const handleRoleChange = (newRole: 'STUDENT' | 'PARENT' | 'GUARDIAN') => {
    setAccountRole(newRole);
    if (verifiedUser) {
      const name = `${verifiedUser.firstName || ''} ${verifiedUser.lastName || ''}`.trim();
      if (newRole === 'STUDENT') {
        setStudentForm(prev => ({
          ...prev,
          fullName: name,
          parentName: prev.parentName === name ? '' : prev.parentName
        }));
      } else {
        setStudentForm(prev => ({
          ...prev,
          parentName: name,
          fullName: prev.fullName === name ? '' : prev.fullName
        }));
      }
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedCourt !== 'ALL' && s.courtUuid !== selectedCourt) return false;
      if (selectedLevel !== 'ALL' && s.level !== selectedLevel) return false;
      if (selectedBatch !== 'ALL' && s.batchUuid !== selectedBatch) return false;
      if (selectedFeeStatus !== 'ALL' && s.feeStatus !== selectedFeeStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const name = (s.fullName || '').toLowerCase();
        const parent = (s.parentName || '').toLowerCase();
        const phone = (s.parentPhone || '');
        const batch = (s.batchName || '').toLowerCase();
        const court = (s.courtName || '').toLowerCase();
        if (!name.includes(q) && !parent.includes(q) && !phone.includes(q) && !batch.includes(q) && !court.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [students, selectedCourt, selectedLevel, selectedBatch, selectedFeeStatus, searchTerm]);

  // Open Enroll Modal
  const handleOpenEnroll = () => {
    setEditingStudent(null);
    setPhoneQuery('');
    setVerifiedUser(null);
    setPhoneLookupDone(false);
    setAccountRole('STUDENT');
    setStudentForm({
      fullName: '',
      gender: 'MALE',
      dob: '',
      age: '',
      bloodGroup: '',
      level: 'BEGINNER',
      courtUuid: courts[0]?.courtUuid || '',
      batchUuid: batches[0]?.batchUuid || '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      emergencyContact: '',
      address: '',
      medicalNotes: '',
      monthlyFee: '1500',
      feeFrequency: 'MONTHLY',
      feeStatus: 'PAID'
    });
    setShowEnrollModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: AcademyStudent) => {
    setEditingStudent(student);
    setPhoneQuery(student.parentPhone || '');
    setVerifiedUser(null);
    setPhoneLookupDone(true);
    setStudentForm({
      fullName: student.fullName || '',
      gender: student.gender || 'MALE',
      dob: student.dob || '',
      age: student.age ? String(student.age) : '',
      bloodGroup: student.bloodGroup || '',
      level: student.level || 'BEGINNER',
      courtUuid: student.courtUuid || '',
      batchUuid: student.batchUuid || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      emergencyContact: student.emergencyContact || '',
      address: student.address || '',
      medicalNotes: student.medicalNotes || '',
      monthlyFee: student.monthlyFee !== undefined ? String(student.monthlyFee) : '1500',
      feeFrequency: student.feeFrequency || 'MONTHLY',
      feeStatus: student.feeStatus || 'PAID'
    });
    setShowEnrollModal(true);
  };

  // Submit Student Enroll or Edit
  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim() || !orgUuid) return;

    try {
      setSubmitting(true);
      const selectedB = batches.find(b => b.batchUuid === studentForm.batchUuid);
      const selectedC = courts.find(c => c.courtUuid === (studentForm.courtUuid || selectedB?.courtUuid));

      if (editingStudent) {
        const payload: UpdateStudentPayload = {
          studentUuid: editingStudent.studentUuid,
          fullName: studentForm.fullName.trim(),
          gender: studentForm.gender,
          dob: studentForm.dob || undefined,
          age: studentForm.age ? parseInt(studentForm.age) : undefined,
          bloodGroup: studentForm.bloodGroup,
          level: studentForm.level,
          courtUuid: selectedC?.courtUuid || selectedB?.courtUuid,
          batchUuid: studentForm.batchUuid || undefined,
          batchName: selectedB?.batchName,
          batchTiming: selectedB ? `${selectedB.startTime} - ${selectedB.endTime}` : undefined,
          sportType: academySport || 'Badminton',
          parentName: studentForm.parentName,
          parentPhone: studentForm.parentPhone || phoneQuery,
          parentEmail: studentForm.parentEmail,
          emergencyContact: studentForm.emergencyContact,
          address: studentForm.address,
          medicalNotes: studentForm.medicalNotes,
          monthlyFee: studentForm.monthlyFee ? parseFloat(studentForm.monthlyFee) : undefined,
          feeFrequency: studentForm.feeFrequency,
          feeStatus: studentForm.feeStatus
        };
        const updated = await AcademyStudentService.updateStudent(payload);
        setStudents(prev => prev.map(s => s.studentUuid === updated.studentUuid ? updated : s));
        showToast('Athlete profile updated successfully!');
      } else {
        const payload: EnrollStudentPayload = {
          organizationUuid: orgUuid,
          userUuid: verifiedUser?.uuid,
          fullName: studentForm.fullName.trim(),
          gender: studentForm.gender,
          dob: studentForm.dob || undefined,
          age: studentForm.age ? parseInt(studentForm.age) : undefined,
          bloodGroup: studentForm.bloodGroup,
          level: studentForm.level,
          courtUuid: selectedC?.courtUuid || selectedB?.courtUuid,
          batchUuid: studentForm.batchUuid || undefined,
          batchName: selectedB?.batchName,
          batchTiming: selectedB ? `${selectedB.startTime} - ${selectedB.endTime}` : undefined,
          sportType: academySport || 'Badminton',
          parentName: studentForm.parentName,
          parentPhone: studentForm.parentPhone || phoneQuery,
          parentEmail: studentForm.parentEmail,
          emergencyContact: studentForm.emergencyContact,
          address: studentForm.address,
          medicalNotes: studentForm.medicalNotes,
          monthlyFee: studentForm.monthlyFee ? parseFloat(studentForm.monthlyFee) : undefined,
          feeFrequency: studentForm.feeFrequency,
          feeStatus: studentForm.feeStatus
        };
        const created = await AcademyStudentService.enrollStudent(payload);
        setStudents(prev => [created, ...prev]);
        showToast('Athlete enrolled successfully into academy!');
      }

      setShowEnrollModal(false);
      AcademyStudentService.getSummary(orgUuid).then(res => setSummary(res));
    } catch (err) {
      console.error('Failed to save student:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentUuid: string) => {
    if (!confirm('Are you sure you want to remove this athlete from the academy roster?')) return;
    try {
      await AcademyStudentService.deleteStudent(studentUuid);
      setStudents(prev => prev.filter(s => s.studentUuid !== studentUuid));
      showToast('Athlete removed from roster.');
      if (orgUuid) AcademyStudentService.getSummary(orgUuid).then(res => setSummary(res));
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  // Quick Fee Status Change
  const handleQuickFeeChange = async (student: AcademyStudent, newFeeStatus: string) => {
    try {
      const updated = await AcademyStudentService.updateStudent({
        studentUuid: student.studentUuid,
        feeStatus: newFeeStatus
      });
      setStudents(prev => prev.map(s => s.studentUuid === updated.studentUuid ? updated : s));
      showToast(`Fee marked as ${newFeeStatus}.`);
      if (orgUuid) AcademyStudentService.getSummary(orgUuid).then(res => setSummary(res));
    } catch (err) {
      console.error('Failed to update fee status:', err);
    }
  };

  // Create Court Submit
  const handleCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtForm.name.trim() || !orgUuid) return;

    try {
      setSubmitting(true);
      const payload: CreateCourtPayload = {
        organizationUuid: orgUuid,
        name: courtForm.name.trim(),
        sportType: academySport || 'Badminton',
        surfaceType: courtForm.surfaceType,
        courtNumber: courtForm.courtNumber,
        location: courtForm.location,
        hourlyRate: courtForm.hourlyRate ? parseFloat(courtForm.hourlyRate) : 500
      };

      const created = await AcademyStudentService.createCourt(payload);
      if (created) {
        setCourts(prev => [created, ...prev]);
        setCourtForm({
          name: '',
          surfaceType: 'Synthetic Mat',
          courtNumber: '',
          location: '',
          hourlyRate: '500'
        });
        showToast('New court venue added successfully!');
      }
    } catch (err) {
      console.error('Failed to create court:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Court
  const handleDeleteCourt = async (courtUuid: string) => {
    if (!confirm('Are you sure you want to delete this court/venue?')) return;
    try {
      await AcademyStudentService.deleteCourt(courtUuid);
      setCourts(prev => prev.filter(c => c.courtUuid !== courtUuid));
      showToast('Court removed.');
    } catch (err) {
      console.error('Failed to delete court:', err);
    }
  };

  // Create Batch Submit
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.batchName.trim() || !orgUuid) return;

    try {
      setSubmitting(true);
      const payload: CreateBatchPayload = {
        organizationUuid: orgUuid,
        courtUuid: batchForm.courtUuid || courts[0]?.courtUuid || undefined,
        batchName: batchForm.batchName.trim(),
        sportType: academySport || 'Badminton',
        level: batchForm.level,
        coachName: batchForm.coachName,
        daysOfWeek: batchForm.daysOfWeek,
        startTime: batchForm.startTime,
        endTime: batchForm.endTime,
        maxCapacity: batchForm.maxCapacity ? parseInt(batchForm.maxCapacity) : 20,
        monthlyFee: batchForm.monthlyFee ? parseFloat(batchForm.monthlyFee) : 1500
      };

      const created = await AcademyStudentService.createBatch(payload);
      setBatches(prev => [created, ...prev]);
      setBatchForm({
        courtUuid: '',
        batchName: '',
        level: 'ALL',
        coachName: '',
        daysOfWeek: 'MON,WED,FRI',
        startTime: '06:00',
        endTime: '07:30',
        maxCapacity: '20',
        monthlyFee: '1500'
      });
      showToast('New training batch created!');
    } catch (err) {
      console.error('Failed to create batch:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Batch
  const handleDeleteBatch = async (batchUuid: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      await AcademyStudentService.deleteBatch(batchUuid);
      setBatches(prev => prev.filter(b => b.batchUuid !== batchUuid));
      showToast('Batch removed.');
    } catch (err) {
      console.error('Failed to delete batch:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pb-28 sm:pb-32">
      {/* Toast Alert */}
      {toastSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastSuccess}</span>
        </div>
      )}

      <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500">
        
        {/* ══════════════════════════════════════════════════════════════════════
            SPORT CONFIGURATION BANNER (IF NOT SET)
           ══════════════════════════════════════════════════════════════════════ */}
        {!academySport && !loading && (
          <div className="bg-gradient-to-br from-primary/20 via-surface/90 to-surface/90 border-2 border-primary/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center font-black">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">Configure Academy Sport</h3>
                <p className="text-xs text-foreground/60">
                  Select the primary sport this academy trains. All courts, batches, and student rosters will be tailored to this discipline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {AVAILABLE_SPORTS.map(s => (
                <button
                  key={s.name}
                  onClick={() => setSelectedSportToSave(s.name)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedSportToSave === s.name
                      ? 'bg-primary text-black border-primary font-black scale-105 shadow-lg shadow-primary/25'
                      : 'bg-surface/80 border-white/10 hover:border-white/20 text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-[11px] font-bold truncate">{s.name}</span>
                </button>
              ))}
            </div>

            {canManage && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveAcademySport(selectedSportToSave)}
                  disabled={isSavingSport}
                  className="px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center gap-2"
                >
                  {isSavingSport && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Set Academy Sport ({selectedSportToSave})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            HEADER & TOP ACTION CONTROLS
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface/90 border border-white/10 p-4 sm:p-7 rounded-2xl sm:rounded-[32px] shadow-2xl backdrop-blur-2xl relative overflow-hidden space-y-3.5 sm:space-y-4">
          <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground tracking-tight truncate">
                    Student Roster
                  </h1>
                  {academySport && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <span>{AVAILABLE_SPORTS_ICONS[academySport] || '🏆'}</span>
                      <span>{academySport}</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                    Academy OS
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-foreground/50 truncate font-medium">
                  {courts.length} Courts • {batches.length} Batches • {students.length} Athletes at {activeOrg?.name || 'Academy'}.
                </p>
              </div>
            </div>

            {/* Action Buttons (Courts, Batches, Enroll) */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => setShowCourtModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-surface border border-white/10 hover:bg-white/5 text-xs sm:text-sm font-bold text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Courts ({courts.length})</span>
              </button>

              <button
                onClick={() => setShowBatchModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-surface border border-white/10 hover:bg-white/5 text-xs sm:text-sm font-bold text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Batches ({batches.length})</span>
              </button>

              {canManage && (
                <button
                  onClick={handleOpenEnroll}
                  className="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TELEMETRY KPI DECK
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase tracking-wider">Athletes</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-3xl font-black text-foreground">
                {summary?.totalStudents ?? students.length}
              </div>
              <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                {summary?.activeStudents ?? students.length} active roster
              </div>
            </div>
          </div>

          <div
            onClick={() => setShowCourtModal(true)}
            className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">Courts & Batches</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-3xl font-black text-foreground">
                {courts.length} <span className="text-xs font-medium text-foreground/40 font-mono">/ {batches.length} batches</span>
              </div>
              <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                {batches.reduce((acc, b) => acc + (b.maxCapacity || 20), 0)} max capacity
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">Fee Adherence</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-3xl font-black text-emerald-400">
                {summary?.feeCollectionPercentage ?? (students.length > 0 ? Math.round((students.filter(s => s.feeStatus === 'PAID').length / students.length) * 100) : 100)}%
              </div>
              <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                {students.filter(s => s.feeStatus === 'PAID').length} paid this cycle
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/10 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-wider">Overdue Fees</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-3xl font-black text-rose-400">
                {students.filter(s => s.feeStatus === 'OVERDUE').length}
              </div>
              <div className="text-[10px] sm:text-xs text-foreground/50 line-clamp-1 mt-0.5">
                {students.filter(s => s.feeStatus === 'PENDING').length} pending invoices
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SEARCH & MULTI-DIMENSIONAL FILTER CONTROLS BAR
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface/90 border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search athlete, parent, phone, court, or batch..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <select
                value={selectedCourt}
                onChange={e => setSelectedCourt(e.target.value)}
                className="bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0 cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL">🏟️ All Courts</option>
                {courts.map(c => (
                  <option key={c.courtUuid} value={c.courtUuid}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0 cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ELITE">Elite</option>
                <option value="PRO">Pro</option>
              </select>

              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className="bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0 cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL">All Batches</option>
                {batches.map(b => (
                  <option key={b.batchUuid} value={b.batchUuid}>
                    {b.batchName}
                  </option>
                ))}
              </select>

              <select
                value={selectedFeeStatus}
                onChange={e => setSelectedFeeStatus(e.target.value)}
                className="bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0 cursor-pointer"
              >
                <option value="ALL">All Fees</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STUDENT ROSTER: DESKTOP TABLE & MOBILE CARDS
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface/90 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm sm:text-base font-black text-foreground">
                Enrolled Athletes ({filteredStudents.length})
              </h3>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-foreground/50">Loading student roster...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-foreground/40">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-sm font-black text-foreground">No students found</p>
              <p className="text-xs text-foreground/50 max-w-sm mx-auto">
                {searchTerm || selectedCourt !== 'ALL' || selectedLevel !== 'ALL' || selectedBatch !== 'ALL'
                  ? 'Try adjusting your filters or search criteria.'
                  : 'Get started by enrolling your first athlete into the academy.'}
              </p>
              {canManage && (
                <button
                  onClick={handleOpenEnroll}
                  className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black hover:brightness-110 transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-black uppercase tracking-wider text-foreground/40">
                      <th className="px-6 py-3.5">Athlete</th>
                      <th className="px-6 py-3.5">Skill Level</th>
                      <th className="px-6 py-3.5">Court / Venue</th>
                      <th className="px-6 py-3.5">Batch / Timing</th>
                      <th className="px-6 py-3.5">Contact & Account</th>
                      <th className="px-6 py-3.5">Monthly Fee</th>
                      <th className="px-6 py-3.5">Fee Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                    {filteredStudents.map(student => {
                      const levelStyle = LEVEL_COLORS[student.level || 'BEGINNER'] || LEVEL_COLORS.BEGINNER;
                      const feeStyle = FEE_COLORS[student.feeStatus || 'PENDING'] || FEE_COLORS.PENDING;

                      return (
                        <tr key={student.studentUuid} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Athlete Name & Age */}
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                                {student.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-foreground flex items-center gap-1.5">
                                  <span>{student.fullName}</span>
                                  {student.userUuid && (
                                    <span title="Linked to Athlon Account" className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-foreground/40 font-medium">
                                  {student.age ? `${student.age} yrs` : 'Athlete'} {student.gender ? `• ${student.gender}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Skill Level */}
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}>
                              {student.level || 'Beginner'}
                            </span>
                          </td>

                          {/* Court / Venue */}
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate">{student.courtName || 'Main Arena'}</span>
                            </div>
                          </td>

                          {/* Batch & Timing */}
                          <td className="px-6 py-3.5">
                            <div className="font-bold text-foreground text-xs">{student.batchName || 'Unassigned'}</div>
                            {student.batchTiming && (
                              <div className="text-[11px] font-mono text-foreground/40 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-primary/70" />
                                {student.batchTiming}
                              </div>
                            )}
                          </td>

                          {/* Contact Info */}
                          <td className="px-6 py-3.5">
                            {student.parentName || student.parentPhone ? (
                              <div>
                                <div className="font-semibold text-foreground text-xs">{student.parentName || 'Parent/Guardian'}</div>
                                {student.parentPhone && (
                                  <a
                                    href={`tel:${student.parentPhone}`}
                                    className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 mt-0.5"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {student.parentPhone}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-foreground/30 text-xs">-</span>
                            )}
                          </td>

                          {/* Monthly Fee */}
                          <td className="px-6 py-3.5 font-mono font-bold text-foreground text-xs">
                            {formatCurrency(student.monthlyFee)}
                          </td>

                          {/* Fee Status Dropdown / Pill */}
                          <td className="px-6 py-3.5">
                            {canManage ? (
                              <select
                                value={student.feeStatus || 'PENDING'}
                                onChange={e => handleQuickFeeChange(student, e.target.value)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border focus:outline-none cursor-pointer ${feeStyle.bg} ${feeStyle.text} ${feeStyle.border}`}
                              >
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                                <option value="OVERDUE">Overdue</option>
                              </select>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${feeStyle.bg} ${feeStyle.text} ${feeStyle.border}`}>
                                {student.feeStatus || 'Pending'}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-3.5 text-right">
                            {canManage && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(student)}
                                  title="Edit Student"
                                  className="p-1.5 rounded-lg bg-surface border border-white/10 hover:bg-white/10 text-foreground/70 transition-all cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student.studentUuid)}
                                  title="Delete Student"
                                  className="p-1.5 rounded-lg bg-surface border border-white/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="block lg:hidden divide-y divide-white/5">
                {filteredStudents.map(student => {
                  const levelStyle = LEVEL_COLORS[student.level || 'BEGINNER'] || LEVEL_COLORS.BEGINNER;
                  const feeStyle = FEE_COLORS[student.feeStatus || 'PENDING'] || FEE_COLORS.PENDING;

                  return (
                    <div key={student.studentUuid} className="p-3.5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                            {student.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-foreground text-xs sm:text-sm truncate flex items-center gap-1.5">
                              <span>{student.fullName}</span>
                              {student.userUuid && (
                                <span className="text-emerald-400 text-[10px] font-bold">✓ Athlon</span>
                              )}
                            </div>
                            <div className="text-[10px] text-foreground/40 font-medium">
                              {student.age ? `${student.age} yrs` : 'Athlete'} {student.gender ? `• ${student.gender}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}>
                            {student.level || 'Beginner'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${feeStyle.bg} ${feeStyle.text} ${feeStyle.border}`}>
                            {student.feeStatus || 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-background/60 p-2 rounded-xl border border-white/5">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-foreground text-xs truncate">
                            <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate">{student.courtName || 'Court 1'}</span>
                            <span className="text-foreground/30">•</span>
                            <span className="text-primary truncate">{student.batchName || 'Unassigned'}</span>
                          </div>
                          {student.batchTiming && (
                            <span className="text-[10px] text-foreground/40 font-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-foreground/40" /> {student.batchTiming}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-foreground/40 uppercase block">Fee</span>
                          <span className="font-mono font-bold text-foreground text-xs">{formatCurrency(student.monthlyFee)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        {student.parentPhone ? (
                          <a
                            href={`tel:${student.parentPhone}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{student.parentName || 'Call Contact'}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-foreground/30">No contact saved</span>
                        )}

                        {canManage && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 rounded-lg bg-surface border border-white/10 text-foreground/70"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.studentUuid)}
                              className="p-1.5 rounded-lg bg-surface border border-white/10 text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SMART PHONE-VERIFIED ENROLL / EDIT STUDENT MODAL
           ══════════════════════════════════════════════════════════════════════ */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-surface border border-white/10 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] sm:max-h-[88vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl relative">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-foreground">
                      {editingStudent ? 'Edit Athlete Profile' : 'Enroll Academy Student'}
                    </h3>
                    <p className="text-[11px] text-foreground/50">
                      {editingStudent ? 'Update roster & batch details' : 'Phone verification & streamlined onboarding'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-foreground/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Smart Phone Lookup (Only for new enrollment) */}
              {!editingStudent && (
                <div className="bg-background/60 border border-white/10 p-3 sm:p-4 rounded-2xl space-y-3">
                  <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center justify-between">
                    <span>1. Athlete / Guardian Phone Number</span>
                    {verifyingPhone && (
                      <span className="text-[10px] text-primary flex items-center gap-1 font-semibold normal-case">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={phoneQuery}
                        onChange={e => handlePhoneInputChange(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyPhone(phoneQuery)}
                      disabled={phoneQuery.replace(/[^0-9]/g, '').length < 10 || verifyingPhone}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition-all disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      Verify
                    </button>
                  </div>

                  {/* Case A: User Found on Athlon */}
                  {verifiedUser && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                            {verifiedUser.firstName ? verifiedUser.firstName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                              <span>{verifiedUser.firstName} {verifiedUser.lastName || ''}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                                Verified Athlon User
                              </span>
                            </div>
                            <div className="text-[10px] text-foreground/50">{verifiedUser.phone || phoneQuery}</div>
                          </div>
                        </div>
                      </div>

                      {/* Account Manager Selector */}
                      <div className="pt-1.5 border-t border-emerald-500/20">
                        <label className="text-[10px] font-bold text-foreground/60 block mb-1">
                          Who does this phone number belong to?
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                          {(['STUDENT', 'PARENT', 'GUARDIAN'] as const).map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleRoleChange(role)}
                              className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                accountRole === role
                                  ? 'bg-emerald-500 text-black shadow-sm font-black'
                                  : 'bg-background/80 text-foreground/70 border border-white/10 hover:bg-white/5'
                              }`}
                            >
                              {role === 'STUDENT' ? '👤 Student' : role === 'PARENT' ? '👨‍👩‍👧 Parent' : '🛡️ Guardian'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case B: Phone Not Registered */}
                  {phoneLookupDone && !verifiedUser && phoneQuery.length >= 10 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-start gap-2 text-xs text-amber-300 animate-in fade-in">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold">Not registered on Athlon yet.</span>
                        <p className="text-[11px] text-amber-300/80 mt-0.5">
                          You can still enroll this athlete into the academy roster using basic details below.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Streamlined Onboarding Form */}
              <form onSubmit={handleSubmitStudent} className="space-y-3.5 text-xs">
                
                {/* Athlete Details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase text-foreground/50 tracking-wider">
                    {!editingStudent ? '2. Athlete Information' : 'Athlete Details'}
                  </h4>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/60 block mb-1">Athlete Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Patel"
                      value={studentForm.fullName}
                      onChange={e => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Gender</label>
                      <select
                        value={studentForm.gender}
                        onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Age (Years)</label>
                      <input
                        type="number"
                        placeholder="e.g. 14"
                        value={studentForm.age}
                        onChange={e => setStudentForm({ ...studentForm, age: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Parent / Contact Name (If account holder is Parent/Guardian) */}
                  {accountRole !== 'STUDENT' && (
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Parent / Guardian Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Suresh Patel"
                        value={studentForm.parentName}
                        onChange={e => setStudentForm({ ...studentForm, parentName: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Court, Batch & Skill Level */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-black uppercase text-foreground/50 tracking-wider">
                    Training Venue & Batch
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Skill Level</label>
                      <select
                        value={studentForm.level}
                        onChange={e => setStudentForm({ ...studentForm, level: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="ELITE">Elite</option>
                        <option value="PRO">Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Court / Venue</label>
                      <select
                        value={studentForm.courtUuid}
                        onChange={e => setStudentForm({ ...studentForm, courtUuid: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer truncate"
                      >
                        <option value="">Auto from Batch</option>
                        {courts.map(c => (
                          <option key={c.courtUuid} value={c.courtUuid}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Training Batch</label>
                      <select
                        value={studentForm.batchUuid}
                        onChange={e => setStudentForm({ ...studentForm, batchUuid: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer truncate"
                      >
                        <option value="">No Batch / Open</option>
                        {batches.map(b => (
                          <option key={b.batchUuid} value={b.batchUuid}>
                            {b.batchName} ({b.startTime || ''} - {b.endTime || ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Fee & Invoicing */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Monthly Fee (₹)</label>
                      <input
                        type="number"
                        placeholder="1500"
                        value={studentForm.monthlyFee}
                        onChange={e => setStudentForm({ ...studentForm, monthlyFee: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Initial Fee Status</label>
                      <select
                        value={studentForm.feeStatus}
                        onChange={e => setStudentForm({ ...studentForm, feeStatus: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md pt-3 pb-1 border-t border-white/10 flex items-center justify-end gap-2 -mx-4 -mb-4 px-4 sm:-mx-6 sm:-mb-6 sm:px-6 z-20">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface border border-white/10 hover:bg-white/5 text-foreground/70 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !studentForm.fullName.trim()}
                    className="px-5 py-2 rounded-xl bg-primary text-black font-black hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingStudent ? 'Update Profile' : 'Enroll Student'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            COURTS / VENUES MODAL
           ══════════════════════════════════════════════════════════════════════ */}
        {showCourtModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-surface border border-white/10 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[85vh] sm:max-h-[88vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-foreground">Courts & Training Venues</h3>
                    <p className="text-[11px] text-foreground/50">Manage academy courts, surface types, and facilities</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCourtModal(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-foreground/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Create Court Form */}
              {canManage && (
                <form onSubmit={handleCreateCourt} className="bg-background/60 border border-white/10 p-3.5 sm:p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Add Court or Venue</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Court / Venue Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Court 1 - Indoor Arena"
                        value={courtForm.name}
                        onChange={e => setCourtForm({ ...courtForm, name: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Surface Type</label>
                      <select
                        value={courtForm.surfaceType}
                        onChange={e => setCourtForm({ ...courtForm, surfaceType: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      >
                        {SURFACE_TYPES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Court Code / Number</label>
                      <input
                        type="text"
                        placeholder="e.g. C-1"
                        value={courtForm.courtNumber}
                        onChange={e => setCourtForm({ ...courtForm, courtNumber: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Location / Wing</label>
                      <input
                        type="text"
                        placeholder="e.g. Ground Floor, North Arena"
                        value={courtForm.location}
                        onChange={e => setCourtForm({ ...courtForm, location: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-xs hover:bg-blue-600 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>+ Add Court</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Courts List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-foreground/50 tracking-wider">Available Courts ({courts.length})</h4>
                {courts.length === 0 ? (
                  <p className="text-xs text-foreground/40 py-4 text-center">No courts registered yet.</p>
                ) : (
                  courts.map(court => (
                    <div
                      key={court.courtUuid}
                      className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-white/5 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                          <span>{court.name}</span>
                          {court.courtNumber && (
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-foreground/70">
                              {court.courtNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-foreground/40 text-[11px] flex items-center gap-2">
                          <span className="text-blue-400 font-bold">{court.surfaceType || 'Synthetic'}</span>
                          {court.location && (
                            <>
                              <span>•</span>
                              <span>{court.location}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {court.activeBatchesCount || 0} Batches
                        </span>
                        {canManage && (
                          <button
                            onClick={() => handleDeleteCourt(court.courtUuid)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BATCH MANAGEMENT MODAL
           ══════════════════════════════════════════════════════════════════════ */}
        {showBatchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-surface border border-white/10 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[85vh] sm:max-h-[88vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-foreground">Academy Batches & Schedules</h3>
                    <p className="text-[11px] text-foreground/50">Organize training batches by court venue and timing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-foreground/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Create Batch Form */}
              {canManage && (
                <form onSubmit={handleCreateBatch} className="bg-background/60 border border-white/10 p-3.5 sm:p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">Create New Training Batch</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Batch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Morning Elite Sparing"
                        value={batchForm.batchName}
                        onChange={e => setBatchForm({ ...batchForm, batchName: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Assign Court / Venue</label>
                      <select
                        value={batchForm.courtUuid}
                        onChange={e => setBatchForm({ ...batchForm, courtUuid: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="">Select Court Venue</option>
                        {courts.map(c => (
                          <option key={c.courtUuid} value={c.courtUuid}>
                            {c.name} ({c.surfaceType || 'Court'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Assigned Coach</label>
                      <input
                        type="text"
                        placeholder="e.g. Vikram Singh"
                        value={batchForm.coachName}
                        onChange={e => setBatchForm({ ...batchForm, coachName: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Days of Week</label>
                      <input
                        type="text"
                        placeholder="e.g. MON,WED,FRI"
                        value={batchForm.daysOfWeek}
                        onChange={e => setBatchForm({ ...batchForm, daysOfWeek: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Start Time</label>
                      <input
                        type="time"
                        value={batchForm.startTime}
                        onChange={e => setBatchForm({ ...batchForm, startTime: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">End Time</label>
                      <input
                        type="time"
                        value={batchForm.endTime}
                        onChange={e => setBatchForm({ ...batchForm, endTime: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-purple-500 text-white font-black text-xs hover:bg-purple-600 transition-all cursor-pointer shadow-md"
                    >
                      + Add Batch
                    </button>
                  </div>
                </form>
              )}

              {/* Batches List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-foreground/50 tracking-wider">Active Batches ({batches.length})</h4>
                {batches.length === 0 ? (
                  <p className="text-xs text-foreground/40 py-4 text-center">No batches configured yet.</p>
                ) : (
                  batches.map(batch => (
                    <div
                      key={batch.batchUuid}
                      className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-white/5 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                          <span>{batch.batchName}</span>
                          {batch.courtName && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                              🏟️ {batch.courtName}
                            </span>
                          )}
                        </div>
                        <div className="text-foreground/40 text-[11px] flex items-center gap-2 mt-0.5">
                          <span className="text-primary font-bold">{batch.daysOfWeek || 'Daily'}</span>
                          <span>•</span>
                          <span className="font-mono">{batch.startTime || ''} - {batch.endTime || ''}</span>
                          {batch.coachName && (
                            <>
                              <span>•</span>
                              <span>Coach {batch.coachName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/5 border border-white/10 text-foreground/70">
                          {batch.enrolledCount || 0} / {batch.maxCapacity || 20} Athletes
                        </span>
                        {canManage && (
                          <button
                            onClick={() => handleDeleteBatch(batch.batchUuid)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}