'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
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
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  RefreshCw,
  Edit3,
  Check,
  ShieldCheck,
  Award,
  Trophy,
  SlidersHorizontal,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Layers,
  Info
} from 'lucide-react';
import {
  OrganizerOfficial,
  OrganizerRolePermission,
  OrganizerAccessLevel,
  ORGANIZER_ROLES_CONFIG,
  ORGANIZER_MODULES_CONFIG,
  OrganizerOfficialService,
  OrganizerPermissionService,
  AddOrganizerOfficialPayload,
  UpdateOrganizerOfficialPayload,
  SaveOrganizerPermissionsPayload
} from '@/lib/api/organizerPermissions';
import { UserResponse } from '@/lib/api/user';
import { useOrgRole } from '@/hooks/use-org-role';

interface OrganizerRolesPermissionsViewProps {
  orgUuid: string;
  orgName: string;
}

export default function OrganizerRolesPermissionsView({ orgUuid, orgName }: OrganizerRolesPermissionsViewProps) {
  const { role, isAdmin } = useOrgRole(orgUuid);
  const canManage = isAdmin || role === 'ADMIN' || role === 'OWNER';

  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'OFFICIALS' | 'PERMISSIONS'>('OFFICIALS');

  // Officials State
  const [officials, setOfficials] = useState<OrganizerOfficial[]>([]);
  const [loadingOfficials, setLoadingOfficials] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Add Official Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [formRole, setFormRole] = useState<string>('TOURNAMENT_DIRECTOR');
  const [formDesignation, setFormDesignation] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Official Modal State
  const [editingOfficial, setEditingOfficial] = useState<OrganizerOfficial | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Permissions Matrix State
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, OrganizerAccessLevel>>>({});
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<string>('TOURNAMENT_DIRECTOR');
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

  // Initial Data Fetch
  useEffect(() => {
    if (orgUuid) {
      loadOfficials();
      loadPermissions();
    }
  }, [orgUuid]);

  const loadOfficials = async () => {
    try {
      setLoadingOfficials(true);
      const res = await OrganizerOfficialService.getOfficials(orgUuid);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setOfficials(list);
    } catch (err) {
      console.error('Failed to load officials:', err);
    } finally {
      setLoadingOfficials(false);
      setRefreshing(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const res = await OrganizerPermissionService.getOrgPermissions(orgUuid);
      const rawList: OrganizerRolePermission[] = Array.isArray(res) ? res : (res as any)?.data || [];

      const matrix: Record<string, Record<string, OrganizerAccessLevel>> = {};
      ORGANIZER_ROLES_CONFIG.forEach((r) => {
        matrix[r.id] = {};
        ORGANIZER_MODULES_CONFIG.forEach((m) => {
          matrix[r.id][m.id] = r.id === 'ADMIN' ? 'MANAGE' : 'VIEW';
        });
      });

      rawList.forEach((item) => {
        if (item.role && item.moduleId) {
          if (!matrix[item.role]) matrix[item.role] = {};
          matrix[item.role][item.moduleId] = item.accessLevel || 'VIEW';
        }
      });

      setPermissionsMatrix(matrix);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'OFFICIALS') loadOfficials();
    else loadPermissions();
  };

  // Phone Lookup
  const handleVerifyPhone = async (phoneVal: string) => {
    const clean = phoneVal.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setVerifiedUser(null);
      setVerifyError(null);
      return;
    }

    try {
      setVerifyingPhone(true);
      setVerifyError(null);
      const res = await OrganizerOfficialService.lookupUserByPhone(clean);
      const userData = (res as any)?.data || res;
      if (userData && (userData.uuid || userData.userId)) {
        setVerifiedUser(userData);
      } else {
        setVerifiedUser(null);
        setVerifyError('No registered Athlon user found with this phone number.');
      }
    } catch (err: any) {
      setVerifiedUser(null);
      setVerifyError('No active Athlon user found with phone: ' + phoneVal + '. Please ask them to create an account first.');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleOpenAddModal = () => {
    setPhoneInput('');
    setVerifiedUser(null);
    setVerifyError(null);
    setFormRole('TOURNAMENT_DIRECTOR');
    setFormDesignation('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleAddOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.trim().length < 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    try {
      setSubmittingAdd(true);
      const payload: AddOrganizerOfficialPayload = {
        organizationUuid: orgUuid,
        phone: phoneInput.trim(),
        role: formRole,
        designation: formDesignation.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      await OrganizerOfficialService.addOfficialByPhone(payload);
      showToast('Official appointed successfully!');
      setIsAddModalOpen(false);
      loadOfficials();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to appoint official.';
      showToast(errorMsg, 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleUpdateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficial) return;

    try {
      setSubmittingEdit(true);
      const payload: UpdateOrganizerOfficialPayload = {
        officialUuid: editingOfficial.officialUuid,
        role: formRole,
        designation: formDesignation.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      await OrganizerOfficialService.updateOfficial(payload);
      showToast('Official details updated successfully!');
      setEditingOfficial(null);
      loadOfficials();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update official.', 'error');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleRevokeOfficial = async (officialUuid: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke official workspace access for ${name}?`)) return;

    try {
      await OrganizerOfficialService.deleteOfficial(officialUuid);
      showToast('Official access revoked successfully.');
      setOfficials((prev) => prev.filter((o) => o.officialUuid !== officialUuid));
    } catch (err: any) {
      showToast('Failed to revoke access.', 'error');
    }
  };

  // Matrix changes
  const handleToggleMatrixAccess = (moduleId: string, level: OrganizerAccessLevel) => {
    setPermissionsMatrix((prev) => ({
      ...prev,
      [selectedMatrixRole]: {
        ...(prev[selectedMatrixRole] || {}),
        [moduleId]: level,
      },
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSavingPermissions(true);
      const items: { role: string; moduleId: string; accessLevel: OrganizerAccessLevel }[] = [];

      Object.entries(permissionsMatrix).forEach(([r, modules]) => {
        Object.entries(modules).forEach(([m, level]) => {
          items.push({ role: r, moduleId: m, accessLevel: level });
        });
      });

      const payload: SaveOrganizerPermissionsPayload = { permissions: items };
      await OrganizerPermissionService.savePermissions(orgUuid, payload);
      showToast('Permissions matrix saved successfully!');
    } catch (err) {
      showToast('Failed to save permissions matrix.', 'error');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!confirm('Reset all organizer role permissions to standard system default templates?')) return;
    try {
      setResettingPermissions(true);
      await OrganizerPermissionService.resetPermissions(orgUuid);
      showToast('Permissions reset to system defaults.');
      loadPermissions();
    } catch (err) {
      showToast('Failed to reset permissions.', 'error');
    } finally {
      setResettingPermissions(false);
    }
  };

  const filteredOfficials = useMemo(() => {
    return officials.filter((o) => {
      const matchSearch =
        (o.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.phone || '').includes(searchTerm) ||
        (o.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.designation || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = selectedRoleFilter === 'ALL' || o.role === selectedRoleFilter;
      return matchSearch && matchRole;
    });
  }, [officials, searchTerm, selectedRoleFilter]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 border ${toastType === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/95 border-rose-500/40 text-rose-300'
            }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5 animate-in fade-in duration-300">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 flex items-center justify-center text-xl shadow-inner shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black text-foreground tracking-tight">
                  Roles & Permissions
                </h1>
              </div>
              <p className="text-xs font-semibold text-foreground/50 mt-0.5">
                Appoint tournament officials by phone number & configure granular module access.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 md:px-3.5 md:py-2 rounded-xl bg-surface border border-foreground/10 text-foreground/70 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {canManage && activeTab === 'OFFICIALS' && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4 stroke-[3]" />
                <span>Appoint Official</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs (Officials vs Permissions Matrix) */}
        <div className="flex items-center gap-2 p-1 bg-surface border border-foreground/10 rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab('OFFICIALS')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'OFFICIALS'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Officials ({officials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'PERMISSIONS'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions Matrix</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: APPOINTED OFFICIALS DIRECTORY                                      */}
        {/* ========================================================================= */}
        {activeTab === 'OFFICIALS' && (
          <div className="space-y-4">
            {/* Search & Role Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-foreground/10 rounded-2xl p-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search by official name, phone number, role, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Carousel / Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                <button
                  onClick={() => setSelectedRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${selectedRoleFilter === 'ALL'
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-background border-foreground/10 text-foreground/60'
                    }`}
                >
                  All Roles
                </button>
                {ORGANIZER_ROLES_CONFIG.map((r) => {
                  const isSelected = selectedRoleFilter === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleFilter(isSelected ? 'ALL' : r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1 border ${isSelected
                        ? 'bg-primary text-black border-primary shadow-sm'
                        : 'bg-background border-foreground/10 text-foreground/60'
                        }`}
                    >
                      <span>{r.icon}</span>
                      <span className="truncate max-w-[120px]">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Officials List / Grid */}
            {loadingOfficials ? (
              <div className="p-12 text-center text-foreground/50 font-bold text-xs space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p>Loading appointed officials...</p>
              </div>
            ) : filteredOfficials.length === 0 ? (
              <div className="py-14 px-4 text-center space-y-3.5 bg-surface border border-foreground/10 rounded-[26px]">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">No Officials Appointed</h3>
                  <p className="text-xs text-foreground/50 max-w-sm mx-auto mt-1">
                    Enter the phone number of an Athlon user to verify their identity and assign tournament organizing roles.
                  </p>
                </div>
                {canManage && (
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-md shadow-primary/20 inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 stroke-[3]" /> Appoint First Official
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredOfficials.map((official) => {
                  const roleConfig = ORGANIZER_ROLES_CONFIG.find((r) => r.id === official.role) || {
                    id: official.role,
                    label: official.role,
                    icon: '👤',
                    badgeClass: 'bg-foreground/10 text-foreground border-foreground/20',
                    description: '',
                  };

                  return (
                    <div
                      key={official.officialUuid}
                      className="p-4 rounded-3xl bg-surface border border-foreground/10 space-y-3 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all group"
                    >
                      {/* Top Strip */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {official.photo ? (
                            <img
                              src={official.photo}
                              alt={official.fullName}
                              className="w-12 h-12 rounded-2xl object-cover border border-foreground/10 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 flex items-center justify-center text-lg font-black text-primary shrink-0 shadow-inner">
                              {official.fullName?.charAt(0) || 'O'}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm text-foreground truncate">
                              {official.fullName}
                            </h3>
                            {official.designation ? (
                              <p className="text-[11px] font-bold text-primary truncate">
                                {official.designation}
                              </p>
                            ) : (
                              <p className="text-[11px] font-medium text-foreground/40 truncate">
                                Appointed Official
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Role Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 flex items-center gap-1 ${roleConfig.badgeClass}`}
                        >
                          <span>{roleConfig.icon}</span>
                          <span className="truncate max-w-[110px]">{roleConfig.label}</span>
                        </span>
                      </div>

                      {/* Contact & Meta Info */}
                      <div className="bg-background rounded-2xl p-3 border border-foreground/5 space-y-1.5 text-xs font-semibold text-foreground/70">
                        {official.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40 text-[11px]">Phone:</span>
                            <span className="font-mono text-foreground">{official.phone}</span>
                          </div>
                        )}
                        {official.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40 text-[11px]">Email:</span>
                            <span className="truncate max-w-[180px] text-foreground">{official.email}</span>
                          </div>
                        )}
                        {official.notes && (
                          <div className="pt-1 border-t border-foreground/5 text-[11px] text-foreground/50 italic truncate">
                            &quot;{official.notes}&quot;
                          </div>
                        )}
                      </div>

                      {/* Quick Contact & Action Buttons */}
                      <div className="flex items-center justify-between pt-1 gap-1.5">
                        <div className="flex items-center gap-1">
                          {official.phone && (
                            <>
                              <a
                                href={`tel:${official.phone}`}
                                className="p-2 rounded-xl bg-background border border-foreground/10 text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                                title="Call Official"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/91${official.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingOfficial(official);
                                setFormRole(official.role);
                                setFormDesignation(official.designation || '');
                                setFormNotes(official.notes || '');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleRevokeOfficial(official.officialUuid, official.fullName)}
                              className="p-1.5 rounded-xl text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Revoke Access"
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
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GRANULAR PERMISSIONS MATRIX                                        */}
        {/* ========================================================================= */}
        {activeTab === 'PERMISSIONS' && (
          <div className="space-y-4">
            {/* Top Bar for Permissions Matrix */}
            <div className="p-4 rounded-3xl bg-surface border border-foreground/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    Role-Based Access Matrix
                  </h3>
                  <p className="text-xs font-semibold text-foreground/50 mt-0.5">
                    Configure which modules each appointed organizer role can Manage, View, or is Restricted from.
                  </p>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetPermissions}
                      disabled={resettingPermissions}
                      className="px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-foreground/70 hover:text-foreground text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
                    >
                      {resettingPermissions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Reset to Defaults'}
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {savingPermissions ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Save Matrix</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Role Selection Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar pt-2 border-t border-foreground/5">
                {ORGANIZER_ROLES_CONFIG.map((r) => {
                  const isSelected = selectedMatrixRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedMatrixRole(r.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${isSelected
                        ? 'bg-foreground text-background border-foreground shadow-sm'
                        : 'bg-background border-foreground/10 text-foreground/60 hover:text-foreground'
                        }`}
                    >
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Role Description Info Box */}
            {(() => {
              const currentRoleObj = ORGANIZER_ROLES_CONFIG.find((r) => r.id === selectedMatrixRole);
              return (
                <div className="p-3.5 rounded-2xl bg-surface border border-foreground/10 flex items-start gap-2.5 text-xs">
                  <div className="text-xl shrink-0 mt-0.5">{currentRoleObj?.icon || '🛡️'}</div>
                  <div>
                    <h4 className="font-extrabold text-foreground">{currentRoleObj?.label}</h4>
                    <p className="text-foreground/60 text-[11px] font-medium mt-0.5">
                      {currentRoleObj?.description}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Module Permissions Grid */}
            <div className="rounded-3xl bg-surface border border-foreground/10 divide-y divide-foreground/5 overflow-hidden shadow-sm">
              {ORGANIZER_MODULES_CONFIG.map((module) => {
                const currentLevel = permissionsMatrix[selectedMatrixRole]?.[module.id] || 'VIEW';
                const isAdminRole = selectedMatrixRole === 'ADMIN';

                return (
                  <div
                    key={module.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-foreground/[0.01] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-background border border-foreground/10 flex items-center justify-center text-lg shrink-0 shadow-sm">
                        {module.icon}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">{module.label}</h4>
                        <p className="text-xs text-foreground/40 font-medium">{module.desc}</p>
                      </div>
                    </div>

                    {/* Access Level Toggle Group */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        disabled={!canManage || isAdminRole}
                        onClick={() => handleToggleMatrixAccess(module.id, 'MANAGE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${currentLevel === 'MANAGE'
                          ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                          : 'bg-background border-foreground/10 text-foreground/50 hover:text-foreground'
                          }`}
                      >
                        MANAGE
                      </button>

                      <button
                        type="button"
                        disabled={!canManage || isAdminRole}
                        onClick={() => handleToggleMatrixAccess(module.id, 'VIEW')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${currentLevel === 'VIEW'
                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                          : 'bg-background border-foreground/10 text-foreground/50 hover:text-foreground'
                          }`}
                      >
                        VIEW ONLY
                      </button>

                      <button
                        type="button"
                        disabled={!canManage || isAdminRole}
                        onClick={() => handleToggleMatrixAccess(module.id, 'NONE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${currentLevel === 'NONE'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-background border-foreground/10 text-foreground/50 hover:text-foreground'
                          }`}
                      >
                        NO ACCESS
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ➕ APPOINT OFFICIAL MODAL (PHONE LOOKUP & VERIFICATION)                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/15 rounded-t-[32px] md:rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Appoint Tournament Official</h3>
                  <p className="text-[11px] font-semibold text-foreground/50">
                    Verify registered Athlon user by phone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-foreground/50 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOfficial} className="space-y-4">
              {/* Phone Input with Real-Time Verification */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Athlon Registered Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-foreground/40 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number..."
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      handleVerifyPhone(e.target.value);
                    }}
                    required
                    maxLength={14}
                    className="w-full bg-background border border-foreground/10 rounded-2xl pl-12 pr-10 py-2.5 text-xs font-black font-mono text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                  />
                  {verifyingPhone && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-primary" />
                  )}
                  {!verifyingPhone && verifiedUser && (
                    <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                </div>

                {/* Verified User Preview Card */}
                {verifiedUser && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-in fade-in duration-200">
                    {verifiedUser.photo ? (
                      <img
                        src={verifiedUser.photo}
                        alt={verifiedUser.firstName}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center shrink-0">
                        {verifiedUser.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-foreground truncate">
                          {verifiedUser.firstName} {verifiedUser.lastName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground/50 truncate">
                        {verifiedUser.email || verifiedUser.phone}
                      </p>
                    </div>
                  </div>
                )}

                {verifyError && (
                  <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{verifyError}</span>
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Select Organizer Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {ORGANIZER_ROLES_CONFIG.filter((r) => r.id !== 'ADMIN').map((r) => {
                    const isSelected = formRole === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setFormRole(r.id)}
                        className={`p-2.5 rounded-2xl text-left border transition-all flex items-start gap-2 ${isSelected
                          ? 'bg-primary/20 border-primary text-foreground font-black'
                          : 'bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{r.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold truncate">{r.label}</div>
                          <div className="text-[10px] text-foreground/50 line-clamp-1 mt-0.5">
                            {r.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Title / Designation */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Official Designation / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Chief Referee, Head of Desk Operations"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Administrative Memo / Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional internal memo..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingAdd || !phoneInput}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-black text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingAdd ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 stroke-[3]" />
                      <span>Grant Official Workspace Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ EDIT OFFICIAL MODAL                                                     */}
      {/* ========================================================================= */}
      {editingOfficial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/15 rounded-t-[32px] md:rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-lg">
                  ✏️
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Edit Official Role</h3>
                  <p className="text-[11px] font-semibold text-foreground/50 font-mono">
                    {editingOfficial.fullName} ({editingOfficial.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOfficial(null)}
                className="p-1.5 rounded-full text-foreground/50 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateOfficial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Select Organizer Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {ORGANIZER_ROLES_CONFIG.map((r) => {
                    const isSelected = formRole === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setFormRole(r.id)}
                        className={`p-2.5 rounded-2xl text-left border transition-all flex items-start gap-2 ${isSelected
                          ? 'bg-primary/20 border-primary text-foreground font-black'
                          : 'bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{r.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold truncate">{r.label}</div>
                          <div className="text-[10px] text-foreground/50 line-clamp-1 mt-0.5">
                            {r.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Official Designation / Title
                </label>
                <input
                  type="text"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/60">
                  Administrative Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-black text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all"
                >
                  {submittingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Update Official Role</span>
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
