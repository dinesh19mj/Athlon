'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  Award,
  Activity,
  Target,
  Zap,
  Clock,
  User,
  Download,
  Edit,
  Trophy,
  Swords,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  Shield,
  Star,
  Check,
  Calendar,
  Layers,
  Flame,
  Printer,
  FileText
} from 'lucide-react';
import { AcademyStudent, AcademyBatch, AcademyStudentService } from '@/lib/api/academyStudent';
import { AcademyMatch, AcademyMatchService } from '@/lib/api/academyMatch';
import { UserService } from '@/lib/api/user';

export interface CoachEvaluation {
  id: string;
  studentUuid: string;
  coachName: string;
  assessmentType: string;
  date: string;
  technical: number;
  physical: number;
  tactical: number;
  mental: number;
  stamina: number;
  strengths: string;
  focusAreas: string;
  notes: string;
}

interface AcademyPerformanceViewProps {
  orgUuid: string;
  orgName: string;
  orgSports?: string[];
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BEGINNER: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' },
  INTERMEDIATE: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30' },
  ADVANCED: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
  ELITE: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30' },
  PRO: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/30' },
};

export default function AcademyPerformanceView({
  orgUuid,
  orgName,
  orgSports = ['Badminton']
}: AcademyPerformanceViewProps) {
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [matches, setMatches] = useState<AcademyMatch[]>([]);
  const [evaluations, setEvaluations] = useState<CoachEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & State
  const [selectedBatchUuid, setSelectedBatchUuid] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentUuid, setSelectedStudentUuid] = useState<string>('');
  const [viewMode, setViewMode] = useState<'DOSSIER' | 'LEADERBOARD'>('DOSSIER');
  const [activeTab, setActiveTab] = useState<'SKILLS' | 'MATCHES' | 'EVALUATIONS'>('SKILLS');

  // Modal State
  const [isAddEvaluationOpen, setIsAddEvaluationOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  // New Evaluation Form State
  const [evalCoachName, setEvalCoachName] = useState('Head Coach');
  const [evalType, setEvalType] = useState('Monthly Benchmark');
  const [evalDate, setEvalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [evalTechnical, setEvalTechnical] = useState(85);
  const [evalPhysical, setEvalPhysical] = useState(80);
  const [evalTactical, setEvalTactical] = useState(75);
  const [evalMental, setEvalMental] = useState(80);
  const [evalStamina, setEvalStamina] = useState(85);
  const [evalStrengths, setEvalStrengths] = useState('');
  const [evalFocusAreas, setEvalFocusAreas] = useState('');
  const [evalNotes, setEvalNotes] = useState('');

  // Load Saved Evaluations from LocalStorage
  useEffect(() => {
    if (!orgUuid) return;
    try {
      const saved = localStorage.getItem(`athlon_evals_${orgUuid}`);
      if (saved) {
        setEvaluations(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load local evaluations', e);
    }
  }, [orgUuid]);

  // Save Evaluations to LocalStorage
  const saveEvaluationsToStorage = (updated: CoachEvaluation[]) => {
    setEvaluations(updated);
    try {
      localStorage.setItem(`athlon_evals_${orgUuid}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save evaluations', e);
    }
  };

  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [studentsRes, batchesRes, matchesRes] = await Promise.allSettled([
        AcademyStudentService.getStudents(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
        AcademyMatchService.getMatches(orgUuid),
      ]);

      if (studentsRes.status === 'fulfilled') {
        const raw = studentsRes.value;
        const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        setStudents(list);
        if (list.length > 0 && !selectedStudentUuid) {
          setSelectedStudentUuid(list[0].studentUuid);
        }
      }

      if (batchesRes.status === 'fulfilled') {
        setBatches(batchesRes.value || []);
      }

      if (matchesRes.status === 'fulfilled') {
        const mRaw = matchesRes.value;
        const mList = Array.isArray(mRaw) ? mRaw : (mRaw as any)?.data || [];
        setMatches(mList);
      }
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const showToast = (msg: string) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(null), 3500);
  };

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesBatch = selectedBatchUuid === 'ALL' || s.batchUuid === selectedBatchUuid;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || s.fullName.toLowerCase().includes(q) || (s.batchName && s.batchName.toLowerCase().includes(q));
      return matchesBatch && matchesSearch;
    });
  }, [students, selectedBatchUuid, searchQuery]);

  // Make sure selected student is valid
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const exists = filteredStudents.some((s) => s.studentUuid === selectedStudentUuid);
      if (!exists) {
        setSelectedStudentUuid(filteredStudents[0].studentUuid);
      }
    }
  }, [filteredStudents, selectedStudentUuid]);

  const currentStudent = useMemo(() => {
    return students.find((s) => s.studentUuid === selectedStudentUuid) || students[0];
  }, [students, selectedStudentUuid]);

  // Aggregate Match Performance for current student
  const studentMatchTelemetry = useMemo(() => {
    if (!currentStudent) return { total: 0, wins: 0, losses: 0, winRate: 0, studentMatches: [], form: [] };

    const name = currentStudent.fullName.toLowerCase().trim();
    const studentMatches = matches.filter((m) => {
      return (
        m.player1Uuid === currentStudent.studentUuid ||
        m.player2Uuid === currentStudent.studentUuid ||
        m.player3Uuid === currentStudent.studentUuid ||
        m.player4Uuid === currentStudent.studentUuid ||
        m.player1Name?.toLowerCase().includes(name) ||
        m.player2Name?.toLowerCase().includes(name) ||
        m.player3Name?.toLowerCase().includes(name) ||
        m.player4Name?.toLowerCase().includes(name)
      );
    });

    let wins = 0;
    const form: ('W' | 'L')[] = [];

    studentMatches.forEach((m) => {
      const isWinner =
        (m.winnerName && m.winnerName.toLowerCase().includes(name)) ||
        (m.winnerTeam === 1 && (m.player1Uuid === currentStudent.studentUuid || m.player2Uuid === currentStudent.studentUuid)) ||
        (m.winnerTeam === 2 && (m.player3Uuid === currentStudent.studentUuid || m.player4Uuid === currentStudent.studentUuid));

      if (isWinner) {
        wins++;
        form.push('W');
      } else {
        form.push('L');
      }
    });

    const total = studentMatches.length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const recentForm = form.slice(-5);

    return { total, wins, losses: total - wins, winRate, studentMatches, form: recentForm };
  }, [currentStudent, matches]);

  // Student Evaluations
  const currentStudentEvaluations = useMemo(() => {
    if (!currentStudent) return [];
    return evaluations.filter((e) => e.studentUuid === currentStudent.studentUuid);
  }, [currentStudent, evaluations]);

  // Aggregate Skill Metrics for current student
  const currentStudentSkills = useMemo(() => {
    if (currentStudentEvaluations.length > 0) {
      const latest = currentStudentEvaluations[0];
      const avg = Math.round((latest.technical + latest.physical + latest.tactical + latest.mental + latest.stamina) / 5);
      return {
        overall: (avg / 10).toFixed(1),
        overallPercent: avg,
        technical: latest.technical,
        physical: latest.physical,
        tactical: latest.tactical,
        mental: latest.mental,
        stamina: latest.stamina,
        source: 'Latest Coach Assessment'
      };
    }

    // Default base metrics calibrated by student level if no custom evaluations yet
    const level = (currentStudent?.level || 'INTERMEDIATE').toUpperCase();
    let base = 75;
    if (level === 'BEGINNER') base = 65;
    else if (level === 'ADVANCED') base = 85;
    else if (level === 'ELITE' || level === 'PRO') base = 92;

    const winBonus = Math.min(10, Math.round((studentMatchTelemetry.winRate - 50) / 5));
    const finalBase = Math.max(50, Math.min(98, base + winBonus));

    return {
      overall: (finalBase / 10).toFixed(1),
      overallPercent: finalBase,
      technical: Math.min(98, finalBase + 3),
      physical: Math.min(98, finalBase - 2),
      tactical: Math.min(98, finalBase - 4),
      mental: Math.min(98, finalBase + 2),
      stamina: Math.min(98, finalBase + 1),
      source: 'Telemetry Baseline'
    };
  }, [currentStudent, currentStudentEvaluations, studentMatchTelemetry]);

  // Add Evaluation Submit Handler
  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const newEval: CoachEvaluation = {
      id: `eval_${Date.now()}`,
      studentUuid: currentStudent.studentUuid,
      coachName: evalCoachName.trim() || 'Head Coach',
      assessmentType: evalType,
      date: evalDate || new Date().toISOString().split('T')[0],
      technical: evalTechnical,
      physical: evalPhysical,
      tactical: evalTactical,
      mental: evalMental,
      stamina: evalStamina,
      strengths: evalStrengths.trim() || 'Consistent footwork, strong baseline rallies.',
      focusAreas: evalFocusAreas.trim() || 'Defensive returns and smash placement under pressure.',
      notes: evalNotes.trim() || 'Showing noticeable progress and competitive drive during sparring sessions.'
    };

    const updated = [newEval, ...evaluations];
    saveEvaluationsToStorage(updated);
    setIsAddEvaluationOpen(false);
    showToast('Coach evaluation recorded successfully!');

    // Reset Form Fields
    setEvalStrengths('');
    setEvalFocusAreas('');
    setEvalNotes('');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-900/90 border border-emerald-500/40 text-emerald-200 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastSuccess}</span>
        </div>
      )}

      {/* ─── 1. HEADER SECTION ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                Performance Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 font-medium">
                Monitor athlete skill progression, sparring win rates, and coach developmental evaluations for {orgName}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap sm:flex-nowrap">
          {/* View Mode Switcher */}
          <div
            className="flex items-center p-1 rounded-2xl border bg-surface flex-grow sm:flex-grow-0 justify-center"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <button
              onClick={() => setViewMode('DOSSIER')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'DOSSIER'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Athlete Dossier
            </button>
            <button
              onClick={() => setViewMode('LEADERBOARD')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'LEADERBOARD'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Leaderboard
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface border text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all shrink-0"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddEvaluationOpen(true)}
              disabled={!currentStudent}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> <span className="hidden sm:inline">Add Evaluation</span><span className="sm:hidden">Evaluate</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground/50">Loading athlete performance telemetry...</p>
        </div>
      ) : students.length === 0 ? (
        <div
          className="p-12 text-center rounded-[32px] border bg-surface space-y-4"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">No Academy Students Enrolled</h3>
            <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
              Enroll athletes in your academy to track their sparring statistics, skill ratings, and coach assessments.
            </p>
          </div>
        </div>
      ) : viewMode === 'LEADERBOARD' ? (
        /* ══════════════════════════════════════════════════════════════
           VIEW 1: ACADEMY TALENT LEADERBOARD & MATRIX
           ══════════════════════════════════════════════════════════════ */
        <div
          className="rounded-[32px] border bg-surface overflow-hidden shadow-sm"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Leaderboard Header Bar */}
          <div
            className="p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Academy Athlete Rankings
              </h3>
              <p className="text-xs text-foreground/60 font-medium mt-0.5">
                Composite progression score based on sparring bouts, win percentage, and coach evaluations.
              </p>
            </div>

            {/* Batch Filter in Leaderboard */}
            <div className="flex items-center gap-2">
              <select
                value={selectedBatchUuid}
                onChange={(e) => setSelectedBatchUuid(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <option value="ALL">All Batches</option>
                {batches.map((b) => (
                  <option key={b.batchUuid} value={b.batchUuid}>
                    {b.batchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-foreground/[0.02]" style={{ borderColor: 'var(--athlon-border)' }}>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Athlete</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50">Batch & Level</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50 text-center">Sparring Record</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50 text-center">Win Rate</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50 text-center">Overall Index</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-foreground/50 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border" style={{ borderColor: 'var(--athlon-border)' }}>
                {filteredStudents.map((student, idx) => {
                  const sName = student.fullName.toLowerCase().trim();
                  const studentMatches = matches.filter(
                    (m) =>
                      m.player1Uuid === student.studentUuid ||
                      m.player2Uuid === student.studentUuid ||
                      m.player3Uuid === student.studentUuid ||
                      m.player4Uuid === student.studentUuid ||
                      m.player1Name?.toLowerCase().includes(sName) ||
                      m.player2Name?.toLowerCase().includes(sName) ||
                      m.player3Name?.toLowerCase().includes(sName) ||
                      m.player4Name?.toLowerCase().includes(sName)
                  );

                  let wins = 0;
                  studentMatches.forEach((m) => {
                    const isWinner =
                      (m.winnerName && m.winnerName.toLowerCase().includes(sName)) ||
                      (m.winnerTeam === 1 && (m.player1Uuid === student.studentUuid || m.player2Uuid === student.studentUuid)) ||
                      (m.winnerTeam === 2 && (m.player3Uuid === student.studentUuid || m.player4Uuid === student.studentUuid));
                    if (isWinner) wins++;
                  });

                  const total = studentMatches.length;
                  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
                  const level = (student.level || 'INTERMEDIATE').toUpperCase();
                  const levelCfg = LEVEL_COLORS[level] || LEVEL_COLORS.INTERMEDIATE;

                  // Compute Index
                  let baseScore = level === 'ELITE' ? 90 : level === 'ADVANCED' ? 82 : level === 'INTERMEDIATE' ? 75 : 65;
                  const overallScore = Math.min(98, baseScore + Math.round((winRate - 50) / 6));

                  return (
                    <tr
                      key={student.studentUuid}
                      className="hover:bg-foreground/[0.02] transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedStudentUuid(student.studentUuid);
                        setViewMode('DOSSIER');
                      }}
                    >
                      <td className="px-6 py-4 font-mono font-black text-sm">
                        {idx === 0 ? (
                          <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs">
                            🥇
                          </span>
                        ) : idx === 1 ? (
                          <span className="w-7 h-7 rounded-xl bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30 flex items-center justify-center text-xs">
                            🥈
                          </span>
                        ) : idx === 2 ? (
                          <span className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-800 dark:text-amber-500 border border-amber-700/30 flex items-center justify-center text-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-foreground/50 ml-2">#{idx + 1}</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                            {student.photo ? (
                              <img src={UserService.getPhotoUrl(student.photo)} alt={student.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-primary">{student.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors block">
                              {student.fullName}
                            </span>
                            <span className="text-[11px] text-foreground/50 font-medium">
                              {student.age ? `${student.age} yrs` : 'Athlete'} • {student.sportType || 'Multi-Sport'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-foreground block truncate max-w-[160px]">
                            {student.batchName || 'General Batch'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${levelCfg.bg} ${levelCfg.text} ${levelCfg.border}`}>
                            {student.level || 'Intermediate'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center font-mono font-bold text-xs text-foreground">
                        <span className="text-emerald-600 dark:text-emerald-400">{wins}W</span> - <span className="text-rose-600 dark:text-rose-400">{total - wins}L</span>
                        <span className="text-foreground/40 text-[10px] block">({total} bouts)</span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`font-mono font-black text-xs ${winRate >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                            {winRate}%
                          </span>
                          <div className="w-14 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${winRate}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-primary/15 border border-primary/25 font-mono font-black text-xs text-primary shadow-sm">
                          {(overallScore / 10).toFixed(1)} / 10
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentUuid(student.studentUuid);
                            setViewMode('DOSSIER');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-surface border text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all inline-flex items-center gap-1"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          Dossier <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Tailored Athlete Ranking Cards View */}
          <div className="block md:hidden divide-y divide-border" style={{ borderColor: 'var(--athlon-border)' }}>
            {filteredStudents.map((student, idx) => {
              const sName = student.fullName.toLowerCase().trim();
              const studentMatches = matches.filter(
                (m) =>
                  m.player1Uuid === student.studentUuid ||
                  m.player2Uuid === student.studentUuid ||
                  m.player3Uuid === student.studentUuid ||
                  m.player4Uuid === student.studentUuid ||
                  m.player1Name?.toLowerCase().includes(sName) ||
                  m.player2Name?.toLowerCase().includes(sName) ||
                  m.player3Name?.toLowerCase().includes(sName) ||
                  m.player4Name?.toLowerCase().includes(sName)
              );

              let wins = 0;
              studentMatches.forEach((m) => {
                const isWinner =
                  (m.winnerName && m.winnerName.toLowerCase().includes(sName)) ||
                  (m.winnerTeam === 1 && (m.player1Uuid === student.studentUuid || m.player2Uuid === student.studentUuid)) ||
                  (m.winnerTeam === 2 && (m.player3Uuid === student.studentUuid || m.player4Uuid === student.studentUuid));
                if (isWinner) wins++;
              });

              const total = studentMatches.length;
              const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
              const level = (student.level || 'INTERMEDIATE').toUpperCase();
              const levelCfg = LEVEL_COLORS[level] || LEVEL_COLORS.INTERMEDIATE;

              let baseScore = level === 'ELITE' ? 90 : level === 'ADVANCED' ? 82 : level === 'INTERMEDIATE' ? 75 : 65;
              const overallScore = Math.min(98, baseScore + Math.round((winRate - 50) / 6));

              return (
                <div
                  key={student.studentUuid}
                  onClick={() => {
                    setSelectedStudentUuid(student.studentUuid);
                    setViewMode('DOSSIER');
                  }}
                  className="p-4 space-y-3.5 hover:bg-foreground/[0.02] active:bg-foreground/[0.04] transition-colors cursor-pointer"
                >
                  {/* Card Top: Rank, Avatar, Name, Batch, Level */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shadow-sm">
                          {student.photo ? (
                            <img src={UserService.getPhotoUrl(student.photo)} alt={student.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-black text-primary">{student.fullName.charAt(0)}</span>
                          )}
                        </div>
                        {/* Rank Badge Indicator */}
                        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-surface border border-foreground/10 flex items-center justify-center text-[10px] font-black font-mono shadow-sm">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-black text-foreground truncate">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-foreground/50 font-medium truncate flex items-center gap-1.5 mt-0.5">
                          <span>{student.batchName || 'Academy Batch'}</span>
                          {student.age && <span>• {student.age} yrs</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${levelCfg.bg} ${levelCfg.text} ${levelCfg.border}`}>
                        {student.level || 'Intermediate'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-primary/15 text-primary border border-primary/25 font-mono font-black text-[11px]">
                        {(overallScore / 10).toFixed(1)} / 10
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Telemetry HUD Strip */}
                  <div
                    className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-background border text-xs"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div>
                      <span className="text-[9px] font-bold text-foreground/50 uppercase block mb-0.5">
                        Sparring Bouts
                      </span>
                      <div className="font-mono font-black text-foreground text-xs flex items-center gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400">{wins}W</span>
                        <span className="text-foreground/40">-</span>
                        <span className="text-rose-600 dark:text-rose-400">{total - wins}L</span>
                        <span className="text-[10px] text-foreground/40 font-normal">({total} total)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-foreground/50 uppercase mb-0.5">
                        <span>Win Rate</span>
                        <span className="font-mono font-black text-foreground">{winRate}%</span>
                      </div>
                      <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${winRate}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Quick Dossier Prompt */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary pt-0.5">
                    <span className="text-[10px] text-foreground/40 font-medium">Tap card to inspect athlete dossier</span>
                    <span className="flex items-center gap-0.5 font-black">
                      View Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           VIEW 2: ATHLETE DOSSIER & DEEP DIVE
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* ─── ATHLETE PICKER DOCK ─── */}
          <div
            className="p-4 rounded-[28px] border bg-surface space-y-3 shadow-sm"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-grow max-w-md">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search athlete by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <select
                  value={selectedBatchUuid}
                  onChange={(e) => setSelectedBatchUuid(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.batchUuid} value={b.batchUuid}>
                      {b.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] font-bold text-foreground/50 self-end sm:self-auto">
                Showing {filteredStudents.length} Athletes
              </div>
            </div>

            {/* Horizontal Athletes Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
              {filteredStudents.map((student) => {
                const isSelected = student.studentUuid === selectedStudentUuid;
                const levelCfg = LEVEL_COLORS[student.level?.toUpperCase() || 'INTERMEDIATE'] || LEVEL_COLORS.INTERMEDIATE;

                return (
                  <button
                    key={student.studentUuid}
                    onClick={() => setSelectedStudentUuid(student.studentUuid)}
                    className={`flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl border transition-all shrink-0 text-left ${
                      isSelected
                        ? 'bg-primary/15 border-primary shadow-md ring-2 ring-primary/20'
                        : 'bg-background hover:bg-foreground/5 border-border'
                    }`}
                    style={{ borderColor: isSelected ? undefined : 'var(--athlon-border)' }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                      {student.photo ? (
                        <img src={UserService.getPhotoUrl(student.photo)} alt={student.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-foreground/70'}`}>
                          {student.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-black truncate max-w-[120px] ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                        {student.fullName}
                      </div>
                      <div className="text-[10px] text-foreground/50 truncate max-w-[120px]">
                        {student.batchName || 'General'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {currentStudent && (
            <>
              {/* ─── ATHLETE HERO PROFILE & TELEMETRY HUD ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* Left Card: Athlete Identity & Overall Score (5 Cols) */}
                <div
                  className="lg:col-span-5 rounded-[32px] border bg-surface p-6 space-y-6 relative overflow-hidden shadow-sm flex flex-col justify-between"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-foreground/10 border-2 border-primary/30 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                          {currentStudent.photo ? (
                            <img src={UserService.getPhotoUrl(currentStudent.photo)} alt={currentStudent.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl sm:text-3xl font-black text-primary">{currentStudent.fullName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                              {currentStudent.fullName}
                            </h2>
                          </div>
                          <p className="text-xs font-bold text-foreground/60 mt-0.5">
                            {currentStudent.batchName || 'Academy Batch'} • {currentStudent.sportType || 'Athlete'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                LEVEL_COLORS[currentStudent.level?.toUpperCase() || 'INTERMEDIATE']?.bg
                              } ${LEVEL_COLORS[currentStudent.level?.toUpperCase() || 'INTERMEDIATE']?.text} ${
                                LEVEL_COLORS[currentStudent.level?.toUpperCase() || 'INTERMEDIATE']?.border
                              }`}
                            >
                              {currentStudent.level || 'Intermediate'} Level
                            </span>
                            {currentStudent.age && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-foreground/5 border border-foreground/10 text-foreground/70">
                                {currentStudent.age} Yrs Old
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overall Rating Gradient Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-emerald-500/10 to-transparent border border-primary/30 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Award className="w-4 h-4" /> Overall Performance Index
                        </span>
                        <span className="text-[10px] font-bold text-foreground/60">{currentStudentSkills.source}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground">
                          {currentStudentSkills.overall}
                        </span>
                        <span className="text-xl font-black text-foreground/40 font-mono">/ 10</span>
                      </div>
                      <div className="w-full bg-foreground/10 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${currentStudentSkills.overallPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact / Emergency Details Snippet */}
                  <div
                    className="pt-4 border-t grid grid-cols-2 gap-3 text-xs"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-foreground/50 uppercase block">Parent / Guardian</span>
                      <span className="font-bold text-foreground truncate block">{currentStudent.parentName || 'Not recorded'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-foreground/50 uppercase block">Enrolled Date</span>
                      <span className="font-bold text-foreground">
                        {currentStudent.enrollmentDate
                          ? new Date(currentStudent.enrollmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Hero: Quick Telemetry Cards (7 Cols) */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Card 1: Sparring Win Rate */}
                  <div
                    className="p-5 rounded-[28px] border bg-surface flex flex-col justify-between shadow-sm space-y-3"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                        Sparring Win Rate
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                        {studentMatchTelemetry.winRate}%
                      </div>
                      <div className="text-[11px] font-bold text-foreground/60 mt-0.5">
                        {studentMatchTelemetry.wins}W - {studentMatchTelemetry.losses}L ({studentMatchTelemetry.total} matches)
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Recent Form */}
                  <div
                    className="p-5 rounded-[28px] border bg-surface flex flex-col justify-between shadow-sm space-y-3"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                        Recent Form
                      </div>
                      {studentMatchTelemetry.form.length === 0 ? (
                        <span className="text-xs font-bold text-foreground/40">No bouts logged</span>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1">
                          {studentMatchTelemetry.form.map((res, i) => (
                            <span
                              key={i}
                              className={`w-6 h-6 rounded-lg text-[10px] font-black font-mono flex items-center justify-center ${
                                res === 'W'
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[11px] font-bold text-foreground/60 mt-1">Last 5 practice matches</div>
                    </div>
                  </div>

                  {/* Card 3: Coach Evaluations */}
                  <div
                    className="p-5 rounded-[28px] border bg-surface flex flex-col justify-between shadow-sm space-y-3 col-span-2 sm:col-span-1"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                        Coach Reviews
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                        {currentStudentEvaluations.length}
                      </div>
                      <div className="text-[11px] font-bold text-foreground/60 mt-0.5">Formal assessments</div>
                    </div>
                  </div>

                  {/* Card 4: Detailed Skill Breakdown Bars (Span 3 Cols) */}
                  <div
                    className="col-span-2 sm:col-span-3 p-5 rounded-[28px] border bg-surface shadow-sm space-y-3"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-primary" /> Key Performance Attributes
                      </span>
                      <span className="text-[10px] font-bold text-foreground/50">Benchmark Metrics</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                      {/* Technical */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-foreground/80">Technical Skills</span>
                          <span className="font-mono text-foreground">{currentStudentSkills.technical}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${currentStudentSkills.technical}%` }} />
                        </div>
                      </div>

                      {/* Physical */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-foreground/80">Physical Fitness & Agility</span>
                          <span className="font-mono text-foreground">{currentStudentSkills.physical}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentStudentSkills.physical}%` }} />
                        </div>
                      </div>

                      {/* Tactical */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-foreground/80">Tactical Awareness</span>
                          <span className="font-mono text-foreground">{currentStudentSkills.tactical}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentStudentSkills.tactical}%` }} />
                        </div>
                      </div>

                      {/* Mental */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-foreground/80">Mental Toughness & Focus</span>
                          <span className="font-mono text-foreground">{currentStudentSkills.mental}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentStudentSkills.mental}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── SUB-NAVIGATION TABS (SKILLS / SPARRING LOG / EVALUATIONS) ─── */}
              <div
                className="flex items-center gap-2 border-b pb-2 overflow-x-auto hide-scrollbar -mx-1 px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setActiveTab('SKILLS')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all flex items-center gap-2 ${
                    activeTab === 'SKILLS'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <Target className="w-4 h-4" /> Skill Radar & Metrics
                </button>
                <button
                  onClick={() => setActiveTab('MATCHES')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all flex items-center gap-2 ${
                    activeTab === 'MATCHES'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <Swords className="w-4 h-4" /> Sparring Matches ({studentMatchTelemetry.studentMatches.length})
                </button>
                <button
                  onClick={() => setActiveTab('EVALUATIONS')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all flex items-center gap-2 ${
                    activeTab === 'EVALUATIONS'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Coach Assessments ({currentStudentEvaluations.length})
                </button>
              </div>

              {/* ─── TAB 1: DETAILED SKILL ATTRIBUTE MATRIX ─── */}
              {activeTab === 'SKILLS' && (
                <div
                  className="rounded-[32px] border bg-surface p-6 space-y-6 shadow-sm"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-foreground">Comprehensive Athletic Matrix</h3>
                      <p className="text-xs text-foreground/60 font-medium">
                        6-dimensional breakdown of athletic fundamentals and progression targets.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddEvaluationOpen(true)}
                      className="text-xs font-black text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Update Attributes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Technical Precision */}
                    <div className="p-4 rounded-2xl bg-background border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">Technical Precision</span>
                        <span className="font-mono font-black text-sm text-foreground">{currentStudentSkills.technical}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${currentStudentSkills.technical}%` }} />
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">
                        Racket / ball control, footwork execution, stroke accuracy, and service variation.
                      </p>
                    </div>

                    {/* 2. Physical Agility */}
                    <div className="p-4 rounded-2xl bg-background border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Physical Agility & Speed</span>
                        <span className="font-mono font-black text-sm text-foreground">{currentStudentSkills.physical}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentStudentSkills.physical}%` }} />
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">
                        Court movement speed, lateral change of direction, explosive recovery, and balance.
                      </p>
                    </div>

                    {/* 3. Tactical IQ */}
                    <div className="p-4 rounded-2xl bg-background border border-purple-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">Tactical Game Sense</span>
                        <span className="font-mono font-black text-sm text-foreground">{currentStudentSkills.tactical}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentStudentSkills.tactical}%` }} />
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">
                        Shot selection, anticipating opponent maneuvers, court positioning, and exploit of weaknesses.
                      </p>
                    </div>

                    {/* 4. Mental Composure */}
                    <div className="p-4 rounded-2xl bg-background border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">Mental Fortitude</span>
                        <span className="font-mono font-black text-sm text-foreground">{currentStudentSkills.mental}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentStudentSkills.mental}%` }} />
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">
                        Composure during close game points, resilience after unforced errors, and match focus.
                      </p>
                    </div>

                    {/* 5. Stamina */}
                    <div className="p-4 rounded-2xl bg-background border border-rose-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">Aerobic Stamina</span>
                        <span className="font-mono font-black text-sm text-foreground">{currentStudentSkills.stamina}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${currentStudentSkills.stamina}%` }} />
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">
                        Long rally endurance, maintaining form in 3rd set deciders, and quick recovery.
                      </p>
                    </div>

                    {/* 6. Coach Discipline */}
                    <div className="p-4 rounded-2xl bg-background border border-primary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-primary">Discipline & Coachability</span>
                        <span className="font-mono font-black text-sm text-foreground">92%</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '92%' }} />
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">
                        Punctuality, active listening during coaching drills, sportsmanship, and teamwork.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: SPARRING MATCHES LOG ─── */}
              {activeTab === 'MATCHES' && (
                <div
                  className="rounded-[32px] border bg-surface overflow-hidden shadow-sm"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div
                    className="p-5 sm:p-6 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div>
                      <h3 className="text-lg font-black text-foreground">Sparring Match History</h3>
                      <p className="text-xs text-foreground/60 font-medium">
                        Head-to-head internal practice bouts logged for {currentStudent.fullName}.
                      </p>
                    </div>
                  </div>

                  {studentMatchTelemetry.studentMatches.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <Swords className="w-10 h-10 text-foreground/30 mx-auto" />
                      <p className="text-sm font-bold text-foreground/60">No sparring matches recorded for this student yet.</p>
                      <p className="text-xs text-foreground/40 max-w-sm mx-auto">
                        Go to Academy Matches to record practice matches and live scores.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border" style={{ borderColor: 'var(--athlon-border)' }}>
                      {studentMatchTelemetry.studentMatches.map((m) => {
                        const sName = currentStudent.fullName.toLowerCase().trim();
                        const isWinner =
                          (m.winnerName && m.winnerName.toLowerCase().includes(sName)) ||
                          (m.winnerTeam === 1 && (m.player1Uuid === currentStudent.studentUuid || m.player2Uuid === currentStudent.studentUuid)) ||
                          (m.winnerTeam === 2 && (m.player3Uuid === currentStudent.studentUuid || m.player4Uuid === currentStudent.studentUuid));

                        const teamANames = [m.player1Name, m.player2Name].filter(Boolean).join(' & ');
                        const teamBNames = [m.player3Name, m.player4Name].filter(Boolean).join(' & ');

                        return (
                          <div key={m.matchId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-foreground/[0.02] transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0 ${
                                  isWinner
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {isWinner ? 'WON' : 'LOST'}
                              </span>
                              <div>
                                <div className="text-xs sm:text-sm font-black text-foreground">
                                  {teamANames} <span className="text-foreground/40 font-normal">vs</span> {teamBNames}
                                </div>
                                <div className="text-[11px] text-foreground/50 font-medium mt-0.5 flex items-center gap-2">
                                  <span>{m.matchDate || 'Recent'}</span>
                                  <span>•</span>
                                  <span>{m.sportType || 'Sparring'} ({m.matchType || 'Singles'})</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 self-end sm:self-auto">
                              <span
                                className="px-3 py-1.5 rounded-xl bg-background border font-mono font-black text-xs text-foreground shadow-inner"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                {m.scoresDetail || `${m.team1Score || 0} - ${m.team2Score || 0}`}
                              </span>
                              {m.winnerName && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                  <Trophy className="w-3 h-3" /> {m.winnerName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: COACH EVALUATIONS TIMELINE ─── */}
              {activeTab === 'EVALUATIONS' && (
                <div
                  className="rounded-[32px] border bg-surface p-6 space-y-6 shadow-sm"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-foreground">Coach Evaluations & Progression Notes</h3>
                      <p className="text-xs text-foreground/60 font-medium">
                        Formal milestone evaluations and developmental homework logged by coaching staff.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddEvaluationOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:opacity-90 shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Evaluation
                    </button>
                  </div>

                  {currentStudentEvaluations.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <FileText className="w-10 h-10 text-foreground/30 mx-auto" />
                      <p className="text-sm font-bold text-foreground/60">No evaluations recorded yet for this athlete.</p>
                      <button
                        onClick={() => setIsAddEvaluationOpen(true)}
                        className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black hover:opacity-90 mt-2"
                      >
                        Create First Evaluation
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentStudentEvaluations.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-5 rounded-2xl bg-background border space-y-3 relative group"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-foreground">{ev.assessmentType}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                                Verified
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-foreground/60">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {ev.date}
                              </span>
                              <span className="flex items-center gap-1 text-primary">
                                <User className="w-3.5 h-3.5" /> {ev.coachName}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center font-mono">
                            <div className="p-2 rounded-xl bg-surface border border-foreground/5">
                              <span className="text-[9px] font-bold text-foreground/50 uppercase block">Tech</span>
                              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{ev.technical}%</span>
                            </div>
                            <div className="p-2 rounded-xl bg-surface border border-foreground/5">
                              <span className="text-[9px] font-bold text-foreground/50 uppercase block">Phys</span>
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{ev.physical}%</span>
                            </div>
                            <div className="p-2 rounded-xl bg-surface border border-foreground/5">
                              <span className="text-[9px] font-bold text-foreground/50 uppercase block">Tact</span>
                              <span className="text-sm font-black text-purple-600 dark:text-purple-400">{ev.tactical}%</span>
                            </div>
                            <div className="p-2 rounded-xl bg-surface border border-foreground/5">
                              <span className="text-[9px] font-bold text-foreground/50 uppercase block">Mental</span>
                              <span className="text-sm font-black text-amber-600 dark:text-amber-400">{ev.mental}%</span>
                            </div>
                            <div className="p-2 rounded-xl bg-surface border border-foreground/5 col-span-2 sm:col-span-1">
                              <span className="text-[9px] font-bold text-foreground/50 uppercase block">Stamina</span>
                              <span className="text-sm font-black text-rose-600 dark:text-rose-400">{ev.stamina}%</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 text-xs">
                            {ev.strengths && (
                              <div>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] block mb-0.5">
                                  Key Strengths:
                                </span>
                                <p className="text-foreground/80 font-medium leading-relaxed">{ev.strengths}</p>
                              </div>
                            )}

                            {ev.focusAreas && (
                              <div>
                                <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] block mb-0.5">
                                  Development Focus:
                                </span>
                                <p className="text-foreground/80 font-medium leading-relaxed">{ev.focusAreas}</p>
                              </div>
                            )}

                            {ev.notes && (
                              <div className="p-3 rounded-xl bg-surface border border-foreground/5 italic text-foreground/70">
                                &ldquo;{ev.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── ADD COACH EVALUATION MODAL ─── */}
      {isAddEvaluationOpen && currentStudent && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 pt-5 sm:pt-10 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-[32px] border shadow-2xl flex flex-col my-auto sm:my-0 animate-in zoom-in-95 duration-200 overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Modal Header */}
            <div
              className="p-5 sm:p-6 pb-4 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                    Record Evaluation
                  </h4>
                  <p className="text-xs text-foreground/60 font-medium">
                    Assessing {currentStudent.fullName} ({currentStudent.batchName || 'Academy'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEvaluationOpen(false)}
                className="w-9 h-9 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddEvaluation} className="flex flex-col flex-grow">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[72vh]">
                {/* Meta Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                      Assessment Type
                    </label>
                    <select
                      value={evalType}
                      onChange={(e) => setEvalType(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="Monthly Benchmark">Monthly Benchmark</option>
                      <option value="Match Sparring Analysis">Match Sparring Analysis</option>
                      <option value="Physical Fitness Test">Physical Fitness Test</option>
                      <option value="Quarterly Progression">Quarterly Progression</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                      Coach Name
                    </label>
                    <input
                      type="text"
                      value={evalCoachName}
                      onChange={(e) => setEvalCoachName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={evalDate}
                      onChange={(e) => setEvalDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-background border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>

                {/* Score Sliders */}
                <div
                  className="p-4 rounded-2xl bg-background border space-y-3.5"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground block">
                    Performance Ratings (0 - 100)
                  </span>

                  {/* Technical */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">Technical Skills</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-black">{evalTechnical}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={evalTechnical}
                      onChange={(e) => setEvalTechnical(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Physical */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">Physical & Agility</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{evalPhysical}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={evalPhysical}
                      onChange={(e) => setEvalPhysical(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Tactical */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">Tactical Awareness</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-black">{evalTactical}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={evalTactical}
                      onChange={(e) => setEvalTactical(parseInt(e.target.value, 10))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Mental */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">Mental Composure</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-black">{evalMental}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={evalMental}
                      onChange={(e) => setEvalMental(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Stamina */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/80">Stamina & Endurance</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-black">{evalStamina}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={evalStamina}
                      onChange={(e) => setEvalStamina(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Key Strengths Observed
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent court coverage and powerful overhead smashes."
                      value={evalStrengths}
                      onChange={(e) => setEvalStrengths(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-background border text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                      Areas for Weekly Progression
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Backhand net drops and recovery after lunges."
                      value={evalFocusAreas}
                      onChange={(e) => setEvalFocusAreas(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-background border text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                      Coach Remarks & Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Recommended for next batch skill assessment next month."
                      value={evalNotes}
                      onChange={(e) => setEvalNotes(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-background border text-xs font-medium text-foreground focus:outline-none focus:border-primary resize-none"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="p-4 sm:p-5 border-t flex items-center justify-end gap-3 bg-background/50"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddEvaluationOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-foreground/70 hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:opacity-90 shadow-lg shadow-primary/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
