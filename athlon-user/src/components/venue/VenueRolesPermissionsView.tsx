'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  UserPlus,
  Trash2,
  RefreshCw,
  Edit3,
  Check,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  Lock,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  Tag,
  Layers
} from 'lucide-react';
import {
  VenueStaff,
  VenueRolePermission,
  VenueAccessLevel,
  VENUE_ROLES_CONFIG,
  VENUE_MODULES_CONFIG,
  VENUE_DEFAULT_PERMISSIONS,
  VenueStaffService,
  VenuePermissionService,
  AddVenueStaffPayload,
  UpdateVenueStaffPayload,
  SaveVenuePermissionsPayload
} from '@/lib/api/venuePermissions';
import { UserResponse } from '@/lib/api/user';
import { useOrgRole } from '@/hooks/use-org-role';

interface VenueRolesPermissionsViewProps {
  orgUuid: string;
  orgName: string;
}

export default function VenueRolesPermissionsView({ orgUuid, orgName }: VenueRolesPermissionsViewProps) {
  const { role, isAdmin } = useOrgRole(orgUuid);
  const canManage = isAdmin || role === 'ADMIN' || role === 'OWNER';

  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'STAFF' | 'PERMISSIONS'>('STAFF');

  // Staff Directory State
  const [staffList, setStaffList] = useState<VenueStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [formRole, setFormRole] = useState<string>('FRONT_DESK');
  const [formDesignation, setFormDesignation] = useState<string>('');
  const [formFacilities, setFormFacilities] = useState<string>('ALL');
  const [formNotes, setFormNotes] = useState<string>('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState<VenueStaff | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Permissions Matrix State
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, VenueAccessLevel>>>({});
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<string>('FRONT_DESK');
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [resettingPermissions, setResettingPermissions] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ─── 1. Load Staff Directory ────────────────────────────────────────── */
  const loadStaff = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoadingStaff(true);
    try {
      const res = await VenueStaffService.getStaff(orgUuid);
      if (res.success && Array.isArray(res.data)) {
        setStaffList(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load venue staff:', err);
      showToast('Could not retrieve venue staff directory', 'error');
    } finally {
      if (showLoadingSpinner) setLoadingStaff(false);
      setRefreshing(false);
    }
  };

  /* ─── 2. Load Permissions Matrix ─────────────────────────────────────── */
  const loadPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const res = await VenuePermissionService.getOrgPermissions(orgUuid);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const matrix: Record<string, Record<string, VenueAccessLevel>> = {};
        res.data.forEach((p) => {
          if (!matrix[p.role]) matrix[p.role] = {};
          matrix[p.role][p.moduleId] = p.accessLevel;
        });
        setPermissionsMatrix(matrix);
      } else {
        setPermissionsMatrix(VENUE_DEFAULT_PERMISSIONS);
      }
    } catch (err) {
      console.warn('Using default permissions matrix fallback:', err);
      setPermissionsMatrix(VENUE_DEFAULT_PERMISSIONS);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (orgUuid) {
      loadStaff();
      loadPermissions();
    }
  }, [orgUuid]);

  /* ─── 3. Verify Phone for Adding Staff ───────────────────────────────── */
  const handleVerifyPhone = async () => {
    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setVerifyError('Please enter a valid 10-digit mobile number');
      return;
    }

    setVerifyingPhone(true);
    setVerifyError(null);
    setVerifiedUser(null);

    try {
      const res = await VenueStaffService.lookupUserByPhone(cleanPhone);
      if (res.success && res.data) {
        setVerifiedUser(res.data);
        setVerifyError(null);
      } else {
        setVerifyError(res.message || 'No registered Athlon athlete/user found with this phone number.');
      }
    } catch (err: any) {
      setVerifyError('No active Athlon user found with this mobile number. Ask the staff member to sign up on Athlon first.');
    } finally {
      setVerifyingPhone(false);
    }
  };

  /* ─── 4. Add Staff Member ────────────────────────────────────────────── */
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedUser) {
      setVerifyError('Please verify the mobile number first.');
      return;
    }

    setSubmittingAdd(true);
    try {
      const payload: AddVenueStaffPayload = {
        organizationUuid: orgUuid,
        phone: phoneInput.trim(),
        role: formRole,
        designation: formDesignation.trim() || undefined,
        assignedFacilities: formFacilities.trim() || 'ALL',
        notes: formNotes.trim() || undefined,
      };

      const res = await VenueStaffService.addStaffByPhone(payload);
      if (res.success) {
        showToast(`Added ${res.data.fullName || 'staff member'} successfully as ${formRole}!`, 'success');
        setIsAddModalOpen(false);
        // Reset form
        setPhoneInput('');
        setVerifiedUser(null);
        setVerifyError(null);
        setFormDesignation('');
        setFormFacilities('ALL');
        setFormNotes('');
        setFormRole('FRONT_DESK');
        loadStaff(false);
      } else {
        showToast(res.message || 'Failed to add staff member', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Could not add staff member';
      showToast(msg, 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  /* ─── 5. Update Staff Member ─────────────────────────────────────────── */
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSubmittingEdit(true);
    try {
      const payload: UpdateVenueStaffPayload = {
        staffUuid: editingStaff.staffUuid,
        role: editingStaff.role,
        designation: editingStaff.designation || '',
        assignedFacilities: editingStaff.assignedFacilities || 'ALL',
        notes: editingStaff.notes || '',
        isActive: editingStaff.isActive,
      };

      const res = await VenueStaffService.updateStaff(payload);
      if (res.success) {
        showToast(`Updated ${editingStaff.fullName || 'staff member'} successfully!`, 'success');
        setEditingStaff(null);
        loadStaff(false);
      } else {
        showToast(res.message || 'Failed to update staff member', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Could not update staff member';
      showToast(msg, 'error');
    } finally {
      setSubmittingEdit(false);
    }
  };

  /* ─── 6. Remove Staff Member ─────────────────────────────────────────── */
  const handleRemoveStaff = async (staff: VenueStaff) => {
    const confirmName = staff.fullName || 'this staff member';
    if (!window.confirm(`Are you sure you want to deactivate ${confirmName} from this venue workspace?`)) {
      return;
    }

    try {
      const res = await VenueStaffService.deleteStaff(staff.staffUuid);
      if (res.success) {
        showToast(`Deactivated ${confirmName}`, 'success');
        loadStaff(false);
      } else {
        showToast(res.message || 'Failed to deactivate staff member', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not deactivate staff member', 'error');
    }
  };

  /* ─── 7. Toggle Permission in Matrix ─────────────────────────────────── */
  const handleSetPermission = (roleId: string, moduleId: string, level: VenueAccessLevel) => {
    setPermissionsMatrix((prev) => {
      const roleMap = { ...(prev[roleId] || VENUE_DEFAULT_PERMISSIONS[roleId] || {}) };
      roleMap[moduleId] = level;
      return {
        ...prev,
        [roleId]: roleMap,
      };
    });
  };

  /* ─── 8. Save Permissions Matrix ─────────────────────────────────────── */
  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    try {
      const permissionsToSave: { role: string; moduleId: string; accessLevel: VenueAccessLevel }[] = [];

      VENUE_ROLES_CONFIG.forEach((r) => {
        const rolePerms = permissionsMatrix[r.id] || VENUE_DEFAULT_PERMISSIONS[r.id] || {};
        VENUE_MODULES_CONFIG.forEach((m) => {
          const level = rolePerms[m.id] || 'VIEW';
          permissionsToSave.push({
            role: r.id,
            moduleId: m.id,
            accessLevel: level,
          });
        });
      });

      const payload: SaveVenuePermissionsPayload = {
        permissions: permissionsToSave,
      };

      const res = await VenuePermissionService.savePermissions(orgUuid, payload);
      if (res.success) {
        showToast('Venue role permission matrix saved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save permissions matrix', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not save permission matrix', 'error');
    } finally {
      setSavingPermissions(false);
    }
  };

  /* ─── 9. Reset Permissions to Defaults ───────────────────────────────── */
  const handleResetToDefaults = async () => {
    if (!window.confirm('Reset all venue role permissions to system defaults? Custom matrix overrides will be cleared.')) {
      return;
    }

    setResettingPermissions(true);
    try {
      const res = await VenuePermissionService.resetPermissions(orgUuid);
      if (res.success) {
        setPermissionsMatrix(VENUE_DEFAULT_PERMISSIONS);
        showToast('Permission matrix reset to system defaults', 'success');
      } else {
        showToast(res.message || 'Failed to reset permissions', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not reset permissions', 'error');
    } finally {
      setResettingPermissions(false);
    }
  };

  /* ─── Filtered Staff List ────────────────────────────────────────────── */
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        searchTerm === '' ||
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.designation?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        selectedRoleFilter === 'ALL' || s.role?.toUpperCase() === selectedRoleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [staffList, searchTerm, selectedRoleFilter]);

  const currentRoleConfig = useMemo(() => {
    return VENUE_ROLES_CONFIG.find((r) => r.id === selectedMatrixRole) || VENUE_ROLES_CONFIG[1];
  }, [selectedMatrixRole]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            toastType === 'success'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/20'
              : 'bg-red-500 text-white border-red-400 shadow-red-500/20'
          }`}
        >
          {toastType === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header Banner ── */}
      <div
        className="rounded-3xl border p-5 sm:p-7 relative overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Venue Access Control &amp; Operations Team
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Venue Roles &amp; Permission Matrix
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60 font-medium">
              Manage front desk executives, court supervisors, facility caretakers, and customize fine-grained module access for{' '}
              <strong className="text-foreground font-bold">{orgName}</strong>.
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Venue Staff</span>
              </button>
            </div>
          )}
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-border">
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === 'STAFF'
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-surface/80 border-border text-foreground/70 hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff &amp; Operations Team ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === 'PERMISSIONS'
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-surface/80 border-border text-foreground/70 hover:text-foreground'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Role Permission Matrix</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: STAFF & OPERATIONS TEAM DIRECTORY
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Filter & Search Bar */}
          <div
            className="p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search staff by name, phone, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface text-xs font-bold text-foreground outline-none border border-border focus:border-primary transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-foreground/50 shrink-0">Role:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full sm:w-52 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="ALL">All Venue Roles ({staffList.length})</option>
                {VENUE_ROLES_CONFIG.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setRefreshing(true);
                  loadStaff(false);
                }}
                disabled={refreshing}
                title="Refresh Directory"
                className="p-2 rounded-xl bg-surface border border-border text-foreground/60 hover:text-foreground active:scale-95 transition-all shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>
            </div>
          </div>

          {/* Staff Cards Grid */}
          {loadingStaff ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl border bg-card/60"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div
              className="p-12 text-center rounded-3xl border space-y-3"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <Users className="w-12 h-12 text-foreground/30 mx-auto" />
              <h3 className="text-base font-black text-foreground">No Venue Staff Found</h3>
              <p className="text-xs text-foreground/50 max-w-sm mx-auto">
                {searchTerm || selectedRoleFilter !== 'ALL'
                  ? 'No staff members match your search criteria. Try clearing filters.'
                  : 'Get started by adding your venue managers, front desk executives, and court supervisors.'}
              </p>
              {canManage && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md shadow-primary/20"
                >
                  + Add First Staff Member
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => {
                const roleConfig = VENUE_ROLES_CONFIG.find((r) => r.id === staff.role) || VENUE_ROLES_CONFIG[2];

                return (
                  <div
                    key={staff.staffUuid}
                    className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-3"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    {/* Top User Ident */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center font-black text-primary text-sm shadow-inner">
                          {staff.photo ? (
                            <img src={staff.photo} alt={staff.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{staff.fullName?.slice(0, 2).toUpperCase() || 'ST'}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-foreground truncate tracking-tight">
                            {staff.fullName || 'Venue Staff'}
                          </h4>
                          <p className="text-[11px] font-mono font-semibold text-foreground/60 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-primary shrink-0" />
                            <span>{staff.phone || 'Phone verified'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Role Pill Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${roleConfig.badgeClass}`}>
                        {roleConfig.icon} {roleConfig.id.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Metadata & Designation */}
                    <div className="p-2.5 rounded-xl bg-surface/70 border border-border/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground/50 font-bold">Custom Title:</span>
                        <span className="font-extrabold text-foreground truncate max-w-[160px]">
                          {staff.designation || 'Standard Role'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground/50 font-bold">Facilities Assigned:</span>
                        <span className="font-bold text-primary truncate max-w-[160px]">
                          {staff.assignedFacilities || 'All Courts & Turfs'}
                        </span>
                      </div>

                      {staff.notes && (
                        <p className="text-[10.5px] text-foreground/60 italic truncate pt-0.5 border-t border-border/50">
                          &ldquo;{staff.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {canManage && (
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Staff
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingStaff(staff)}
                            className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-foreground/70 hover:text-foreground border border-border transition-colors"
                            title="Edit Role & Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveStaff(staff)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                            title="Deactivate Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: ROLE PERMISSION MATRIX
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'PERMISSIONS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Role Switcher Pills */}
          <div
            className="p-2 rounded-2xl border flex items-center gap-2 overflow-x-auto hide-scrollbar"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {VENUE_ROLES_CONFIG.map((r) => {
              const isSelected = selectedMatrixRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedMatrixRole(r.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                      : 'border-border bg-surface hover:bg-surface-hover text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Info Card */}
          <div
            className="p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-xl shrink-0">
                {currentRoleConfig.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-foreground">{currentRoleConfig.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${currentRoleConfig.badgeClass}`}>
                    {currentRoleConfig.id}
                  </span>
                </div>
                <p className="text-xs text-foreground/60 font-medium max-w-xl">
                  {currentRoleConfig.description}
                </p>
              </div>
            </div>

            {/* Quick Bulk Presets */}
            {canManage && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    VENUE_MODULES_CONFIG.forEach((m) => handleSetPermission(currentRoleConfig.id, m.id, 'MANAGE'));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-black hover:bg-emerald-500/25 transition-all"
                >
                  Set All MANAGE
                </button>
                <button
                  onClick={() => {
                    VENUE_MODULES_CONFIG.forEach((m) => handleSetPermission(currentRoleConfig.id, m.id, 'VIEW'));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[11px] font-black hover:bg-blue-500/25 transition-all"
                >
                  Set All VIEW
                </button>
              </div>
            )}
          </div>

          {/* 9-Module Permission Matrix Grid */}
          <div
            className="rounded-3xl border overflow-hidden shadow-sm"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Module Permissions for {currentRoleConfig.label}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-foreground/50">
                {VENUE_MODULES_CONFIG.length} Modules Managed
              </span>
            </div>

            <div className="divide-y divide-border">
              {VENUE_MODULES_CONFIG.map((mod) => {
                const rolePerms = permissionsMatrix[currentRoleConfig.id] || VENUE_DEFAULT_PERMISSIONS[currentRoleConfig.id] || {};
                const currentLevel: VenueAccessLevel = rolePerms[mod.id] || 'VIEW';

                return (
                  <div
                    key={mod.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/30 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 max-w-lg">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-lg shrink-0 shadow-inner">
                        {mod.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-foreground">{mod.name}</h5>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-surface border border-border text-foreground/60">
                            {mod.category}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/50 font-medium">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    {/* MANAGE / VIEW / NONE Tri-State Selector */}
                    <div className="flex items-center gap-1.5 bg-surface p-1 rounded-2xl border border-border shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => handleSetPermission(currentRoleConfig.id, mod.id, 'MANAGE')}
                        disabled={!canManage}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          currentLevel === 'MANAGE'
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25 scale-[1.03]'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>MANAGE</span>
                      </button>

                      <button
                        onClick={() => handleSetPermission(currentRoleConfig.id, mod.id, 'VIEW')}
                        disabled={!canManage}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          currentLevel === 'VIEW'
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 scale-[1.03]'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>VIEW</span>
                      </button>

                      <button
                        onClick={() => handleSetPermission(currentRoleConfig.id, mod.id, 'NONE')}
                        disabled={!canManage}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          currentLevel === 'NONE'
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30 scale-[1.03]'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>NONE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            {canManage && (
              <div className="p-4 sm:p-5 border-t border-border bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleResetToDefaults}
                  disabled={resettingPermissions}
                  className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resettingPermissions ? 'animate-spin' : ''}`} />
                  <span>Reset All Roles to Default Matrix</span>
                </button>

                <button
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
                >
                  {savingPermissions ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Permission Matrix</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: ADD VENUE STAFF BY PHONE
         ══════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Add Venue Staff Member</h3>
                  <p className="text-xs text-foreground/50">Verify Athlon athlete/user account by phone number</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setVerifiedUser(null);
                  setVerifyError(null);
                }}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddStaff} className="p-5 space-y-4">
              {/* Phone Verification Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Staff Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="tel"
                      placeholder="10-digit phone number (e.g. 9876543210)"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        setVerifiedUser(null);
                        setVerifyError(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={verifyingPhone || !phoneInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-xs font-black flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {verifyingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Verify</span>
                  </button>
                </div>

                {/* Verification Result Feedback */}
                {verifiedUser && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                    {verifiedUser.photo ? (
                      <img
                        src={verifiedUser.photo}
                        alt={verifiedUser.firstName}
                        className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                        {verifiedUser.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-foreground truncate">
                        {`${verifiedUser.firstName || ''} ${verifiedUser.lastName || ''}`.trim() || verifiedUser.email}
                      </p>
                      <p className="text-[10px] text-foreground/60 font-mono">
                        {verifiedUser.phone || phoneInput} • {verifiedUser.city || 'Athlon Verified'}
                      </p>
                    </div>
                  </div>
                )}

                {verifyError && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{verifyError}</span>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Venue Operational Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {VENUE_ROLES_CONFIG.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Custom Designation / Job Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Turf Operations Executive"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Assigned Facilities */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Assigned Courts / Facilities (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Badminton Courts 1-4, Main Football Turf"
                  value={formFacilities}
                  onChange={(e) => setFormFacilities(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Operational Notes</label>
                <textarea
                  rows={2}
                  placeholder="Shift timings, emergency contact, or specific responsibility notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-bold text-foreground border border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || !verifiedUser}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingAdd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm &amp; Add Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: EDIT VENUE STAFF
         ══════════════════════════════════════════════════════════════════════ */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Edit Staff Member</h3>
                  <p className="text-xs text-foreground/50">{editingStaff.fullName}</p>
                </div>
              </div>
              <button onClick={() => setEditingStaff(null)} className="p-2 rounded-xl text-foreground/40 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Venue Role</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  {VENUE_ROLES_CONFIG.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Custom Designation</label>
                <input
                  type="text"
                  value={editingStaff.designation || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Assigned Facilities</label>
                <input
                  type="text"
                  value={editingStaff.assignedFacilities || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, assignedFacilities: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Notes</label>
                <textarea
                  rows={2}
                  value={editingStaff.notes || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-bold text-foreground border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:brightness-110 flex items-center gap-2"
                >
                  {submittingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
