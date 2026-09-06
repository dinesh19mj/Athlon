'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  CheckCircle2,
  Filter,
  Sparkles,
  Loader2,
  Plus,
  Shield,
  Layers,
  Award,
} from 'lucide-react';
import { AcademyStudentService, AcademyStudent, AcademyBatch } from '@/lib/api/academyStudent';
import { RegistrationService } from '@/lib/api/tournaments';
import { UserService } from '@/lib/api/user';

interface AcademyStudentSelectorModalProps {
  orgUuid: string;
  tournamentId: string;
  tournamentName?: string;
  categories?: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AcademyStudentSelectorModal: React.FC<AcademyStudentSelectorModalProps> = ({
  orgUuid,
  tournamentId,
  tournamentName,
  categories = [],
  onClose,
  onSuccess,
}) => {
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchUuid, setSelectedBatchUuid] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStudentUuids, setSelectedStudentUuids] = useState<Set<string>>(new Set());
  const [targetCategory, setTargetCategory] = useState<string>(categories[0] || 'Open Category');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [studentsData, batchesData] = await Promise.allSettled([
          AcademyStudentService.getStudents(orgUuid),
          AcademyStudentService.getBatches(orgUuid),
        ]);

        if (studentsData.status === 'fulfilled') {
          const list = Array.isArray(studentsData.value) ? studentsData.value : [];
          setStudents(list);
        }
        if (batchesData.status === 'fulfilled') {
          const list = Array.isArray(batchesData.value) ? batchesData.value : [];
          setBatches(list);
        }
      } catch (err) {
        console.error('Failed to load academy roster', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [orgUuid]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedBatchUuid !== 'ALL' && s.batchUuid !== selectedBatchUuid) return false;
      if (selectedLevel !== 'ALL' && s.level?.toUpperCase() !== selectedLevel.toUpperCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.fullName?.toLowerCase().includes(q);
        const matchesBatch = s.batchName?.toLowerCase().includes(q);
        const matchesPhone = s.parentPhone?.includes(q);
        if (!matchesName && !matchesBatch && !matchesPhone) return false;
      }
      return true;
    });
  }, [students, selectedBatchUuid, selectedLevel, searchQuery]);

  const handleToggleSelect = (uuid: string) => {
    setSelectedStudentUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedStudentUuids.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentUuids(new Set());
    } else {
      setSelectedStudentUuids(new Set(filteredStudents.map((s) => s.studentUuid)));
    }
  };

  const handleBatchRegister = async () => {
    if (selectedStudentUuids.size === 0) return;
    try {
      setIsSubmitting(true);
      setStatusMessage('Enrolling selected academy students into draw...');

      const selectedStudents = students.filter((s) => selectedStudentUuids.has(s.studentUuid));

      let successCount = 0;
      for (const student of selectedStudents) {
        try {
          const payload = {
            tournamentId: Number(tournamentId),
            tournamentUuid: tournamentId,
            category: targetCategory,
            teamName: student.fullName,
            contactPhone: student.parentPhone || '0000000000',
            contactEmail: student.parentEmail || `${student.studentUuid.substring(0, 8)}@academy.local`,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            players: [
              {
                playerName: student.fullName,
                phoneNumber: student.parentPhone || '',
                age: student.age || undefined,
                gender: student.gender || undefined,
                photo: student.photo || undefined,
              },
            ],
          };

          await RegistrationService.createRegistration(payload as any);
          successCount++;
        } catch (err) {
          console.warn(`Failed to register student ${student.fullName}:`, err);
        }
      }

      setStatusMessage(`Successfully registered ${successCount} students into ${targetCategory}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Batch registration failed', err);
      setStatusMessage('Registration encountered an error. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between gap-4"
          style={{
            borderColor: 'var(--athlon-border)',
            backgroundColor: 'var(--athlon-surface)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">
                Enroll Academy Students
              </h3>
              <p className="text-xs text-foreground/50 font-medium">
                Select enrolled students from batches to auto-register for {tournamentName || 'this tournament'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition-all"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Category Assignment */}
        <div
          className="p-4 border-b space-y-3"
          style={{
            borderColor: 'var(--athlon-border)',
            backgroundColor: 'var(--athlon-surface-elevated, var(--athlon-surface))',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Target Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-primary" /> Target Category
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs font-bold text-foreground bg-background focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                ) : (
                  <option value="Open Category">Open Category</option>
                )}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5 flex items-center gap-1">
                <Filter className="w-3 h-3 text-primary" /> Filter by Batch
              </label>
              <select
                value={selectedBatchUuid}
                onChange={(e) => setSelectedBatchUuid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs font-bold text-foreground bg-background focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <option value="ALL">All Batches ({batches.length})</option>
                {batches.map((b) => (
                  <option key={b.batchUuid} value={b.batchUuid}>
                    {b.batchName} ({b.level || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5 flex items-center gap-1">
                <Award className="w-3 h-3 text-primary" /> Filter by Skill Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs font-bold text-foreground bg-background focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <option value="ALL">All Skill Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ELITE">Elite</option>
              </select>
            </div>
          </div>

          {/* Search bar & Selection Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name, batch, phone..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs bg-background text-foreground focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {selectedStudentUuids.size === filteredStudents.length && filteredStudents.length > 0
                  ? 'Deselect All'
                  : `Select All (${filteredStudents.length})`}
              </button>
              <span className="text-xs font-black text-primary px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20">
                {selectedStudentUuids.size} Selected
              </span>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[48vh] custom-scrollbar">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-foreground/40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-bold">Loading academy roster...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-foreground/40 space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-bold">No enrolled students match your filters</p>
              <p className="text-[11px]">Try adjusting batch or skill level filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentUuids.has(s.studentUuid);
                return (
                  <div
                    key={s.studentUuid}
                    onClick={() => handleToggleSelect(s.studentUuid)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                        : 'hover:border-foreground/20 hover:bg-white/5'
                    }`}
                    style={{
                      borderColor: isSelected ? undefined : 'var(--athlon-border)',
                      backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary text-xs shrink-0 overflow-hidden">
                        {s.photo ? (
                          <img
                            src={UserService.getPhotoUrl(s.photo)}
                            alt={s.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          s.fullName?.charAt(0)?.toUpperCase() || 'S'
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-foreground truncate">{s.fullName}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-foreground/50 mt-0.5">
                          {s.batchName && <span className="font-semibold truncate">{s.batchName}</span>}
                          {s.level && (
                            <span className="px-1.5 py-0.2 rounded bg-foreground/10 text-foreground/70 font-bold uppercase">
                              {s.level}
                            </span>
                          )}
                          {s.age ? <span>• {s.age} yrs</span> : null}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-foreground/20'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            borderColor: 'var(--athlon-border)',
            backgroundColor: 'var(--athlon-surface)',
          }}
        >
          <div className="text-xs text-foreground/60 font-medium">
            {statusMessage ? (
              <span className="text-primary font-bold">{statusMessage}</span>
            ) : (
              <span>
                Ready to enroll <strong className="text-foreground">{selectedStudentUuids.size}</strong> students into{' '}
                <strong className="text-primary">{targetCategory}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBatchRegister}
              disabled={isSubmitting || selectedStudentUuids.size === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-primary text-primary-foreground flex items-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-md shadow-primary/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register {selectedStudentUuids.size} Students</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
