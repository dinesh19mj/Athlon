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
import { useOrganizerEntitlementsStore } from '@/store/useOrganizerEntitlementsStore';

interface OrganizerRolesPermissionsViewProps {
  orgUuid: string;
  orgName: string;
}

export default function OrganizerRolesPermissionsView({ orgUuid, orgName }: OrganizerRolesPermissionsViewProps) {
  const { role, isAdmin } = useOrgRole(orgUuid);
  const canManage = isAdmin || role === 'ADMIN' || role === 'OWNER';

  const {
    walletByOrg,
    loadEntitlements,
    hasFeature,
    getLimit,
    openFeaturePaywall,
    openQuotaPaywall,
  } = useOrganizerEntitlementsStore();
  const organizerWallet = walletByOrg[orgUuid];
  const maxOfficialsLimit = getLimit(orgUuid, 'MAX_OFFICIALS', 2);
  const hasAdvancedPermissions = hasFeature(orgUuid, 'ADVANCED_PERMISSIONS');

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
      loadEntitlements(orgUuid);
      loadOfficials();
      loadPermissions();
    }
  }, [orgUuid, loadEntitlements]);

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
    if (officials.length >= maxOfficialsLimit) {
      openQuotaPaywall(orgUuid, 'MAX_OFFICIALS', officials.length, 'Max Tournament Officials & Referees');
      return;
    }
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
    if (officials.length >= maxOfficialsLimit) {
      setIsAddModalOpen(false);
      openQuotaPaywall(orgUuid, 'MAX_OFFICIALS', officials.length, 'Max Tournament Officials & Referees');
      return;
    }
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
    if (!hasAdvancedPermissions) {
      openFeaturePaywall(orgUuid, 'ADVANCED_PERMISSIONS', 'Custom RBAC Role Permissions Matrix');
      return;
    }
    setPermissionsMatrix((prev) => ({
      ...prev,
      [selectedMatrixRole]: {
        ...(prev[selectedMatrixRole] || {}),
        [moduleId]: level,
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!hasAdvancedPermissions) {
      openFeaturePaywall(orgUuid, 'ADVANCED_PERMISSIONS', 'Custom RBAC Role Permissions Matrix');
      return;
    }
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

      {/* ========================================================================= */}
      {/* 📱 1. MOBILE VIEW (100% UNTOUCHED ORIGINAL LAYOUT FOR MOBILE SCREENS)     */}
      {/* ========================================================================= */}
      <div className="block md:hidden max-w-7xl mx-auto p-2.5 sm:p-4 space-y-3 sm:space-y-5 animate-in fade-in duration-300">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-foreground/5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 flex items-center justify-center text-base sm:text-xl shadow-inner shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg md:text-xl font-black text-foreground tracking-tight leading-tight">
                  Roles &amp; Permissions
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-foreground/50 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Appoint tournament officials by phone number &amp; configure granular module access.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 sm:p-2.5 md:px-3.5 md:py-2 rounded-lg sm:rounded-xl bg-surface border border-foreground/10 text-foreground/70 active:scale-95 transition-all text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {canManage && activeTab === 'OFFICIALS' && (
              <button
                onClick={handleOpenAddModal}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-black text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span>Appoint Official</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs (Officials vs Permissions Matrix) */}
        <div className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 bg-surface border border-foreground/10 rounded-xl sm:rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab('OFFICIALS')}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'OFFICIALS'
              ? 'bg-foreground text-background shadow-xs'
              : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Officials ({officials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'PERMISSIONS'
              ? 'bg-foreground text-background shadow-xs'
              : 'text-foreground/60 hover:text-foreground'
              }`}
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
        {/* TAB 2: GRANULAR PERMISSIONS MATRIX (COMPACT MOBILE + FULL DESKTOP)        */}
        {/* ========================================================================= */}
        {activeTab === 'PERMISSIONS' && (
          <div className="space-y-2.5 sm:space-y-4 animate-in fade-in duration-300">
            {/* 1. Matrix Header & Controls Hub */}
            <div
              className="p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border shadow-md sm:shadow-lg space-y-2.5 sm:space-y-4 transition-all"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
                boxShadow:
                  '0 12px 32px -8px var(--athlon-shadow, rgba(0, 0, 0, 0.12)), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border shadow-xs"
                      style={{
                        backgroundColor: 'var(--athlon-primary-soft)',
                        borderColor: 'var(--athlon-primary)',
                        color: 'var(--athlon-primary)',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Role Governance
                    </span>
                    <span className="text-[10px] sm:text-xs text-foreground/40 font-mono">•</span>
                    <span className="text-[10px] sm:text-xs font-bold text-foreground/60">
                      {ORGANIZER_MODULES_CONFIG.length} Modules
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-foreground flex items-center gap-1.5 sm:gap-2 tracking-tight">
                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    Role-Based Access Matrix
                  </h3>
                  <p className="text-[10px] sm:text-xs text-foreground/60 font-medium hidden sm:block">
                    Configure granular permissions for appointed tournament staff, directors, and referees.
                  </p>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={handleResetPermissions}
                      disabled={resettingPermissions}
                      className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all border active:scale-95 disabled:opacity-50 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {resettingPermissions ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : 'Reset Defaults'}
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-md sm:shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 hover:brightness-110"
                      style={{
                        backgroundColor: 'var(--athlon-primary)',
                        color: '#000000',
                      }}
                    >
                      {savingPermissions ? (
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                          <span>Save Matrix</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Role Selection Horizontal Capsule Rail */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar pt-2 sm:pt-3 border-t"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {ORGANIZER_ROLES_CONFIG.map((r) => {
                  const isSelected = selectedMatrixRole === r.id;
                  const roleMatrix = permissionsMatrix[r.id] || {};
                  const mCount = Object.values(roleMatrix).filter((v) => v === 'MANAGE').length;

                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedMatrixRole(r.id)}
                      className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 border active:scale-95 shadow-xs ${
                        isSelected
                          ? 'shadow-sm sm:shadow-md scale-[1.02]'
                          : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--athlon-primary)'
                          : 'var(--athlon-card)',
                        borderColor: isSelected
                          ? 'var(--athlon-primary)'
                          : 'var(--athlon-border)',
                        color: isSelected ? '#000000' : undefined,
                      }}
                    >
                      <span className="text-xs sm:text-sm">{r.icon}</span>
                      <span className={isSelected ? 'font-black text-black' : 'font-bold'}>
                        {r.label}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] px-1 py-0.2 sm:px-1.5 rounded-md font-mono ${
                          isSelected
                            ? 'bg-black/20 text-black font-black'
                            : 'bg-foreground/5 text-foreground/50'
                        }`}
                      >
                        {mCount}M
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Selected Role Command Hero Card */}
            {(() => {
              const currentRoleObj = ORGANIZER_ROLES_CONFIG.find((r) => r.id === selectedMatrixRole);
              const roleMatrix = permissionsMatrix[selectedMatrixRole] || {};
              const manageCount = Object.values(roleMatrix).filter((v) => v === 'MANAGE').length;
              const viewCount = Object.values(roleMatrix).filter((v) => v === 'VIEW').length;
              const noneCount = Object.values(roleMatrix).filter((v) => v === 'NONE').length;

              return (
                <div
                  className="relative overflow-hidden p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border shadow-sm sm:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Subtle top accent beam */}
                  <div
                    className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
                    }}
                  />

                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div
                      className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center text-lg sm:text-2xl shrink-0 shadow-xs sm:shadow-md"
                      style={{
                        backgroundColor: 'var(--athlon-primary-soft)',
                        borderColor: 'var(--athlon-primary)',
                      }}
                    >
                      {currentRoleObj?.icon || '🛡️'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h4 className="font-black text-xs sm:text-base md:text-lg text-foreground tracking-tight leading-none">
                          {currentRoleObj?.label}
                        </h4>
                        <span
                          className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border"
                          style={{
                            backgroundColor: 'var(--athlon-primary-soft)',
                            borderColor: 'var(--athlon-primary)',
                            color: 'var(--athlon-primary)',
                          }}
                        >
                          Active
                        </span>
                      </div>
                      <p className="text-foreground/70 text-[10px] sm:text-xs font-medium mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none max-w-2xl">
                        {currentRoleObj?.description}
                      </p>
                    </div>
                  </div>

                  {/* Summary Telemetry Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-start md:self-center">
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] sm:text-xs font-black shadow-xs">
                      <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{manageCount} Manage</span>
                    </span>
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 text-[10px] sm:text-xs font-black shadow-xs">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{viewCount} View</span>
                    </span>
                    {noneCount > 0 && (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-[10px] sm:text-xs font-black shadow-xs">
                        <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{noneCount} Locked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 3. Module Permissions Grid List */}
            <div
              className="rounded-2xl sm:rounded-3xl border divide-y divide-border overflow-hidden shadow-md sm:shadow-xl transition-all"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {ORGANIZER_MODULES_CONFIG.map((module) => {
                const currentLevel = permissionsMatrix[selectedMatrixRole]?.[module.id] || 'VIEW';
                const isAdminRole = selectedMatrixRole === 'ADMIN';

                return (
                  <div
                    key={module.id}
                    className="p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <div
                        className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center text-base sm:text-xl shrink-0 shadow-xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: 'var(--athlon-primary-soft)',
                          borderColor: 'var(--athlon-primary)',
                        }}
                      >
                        {module.icon}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <h4 className="font-black text-xs sm:text-sm text-foreground tracking-tight truncate">
                            {module.label}
                          </h4>
                          {isAdminRole && (
                            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-foreground/60 font-medium leading-tight line-clamp-1 sm:line-clamp-none max-w-xl">
                          {module.desc}
                        </p>
                      </div>
                    </div>

                    {/* Tri-State Segmented Control Capsule */}
                    <div
                      className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1 shrink-0 self-stretch sm:self-center shadow-inner"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <button
                        type="button"
                        disabled={!canManage || isAdminRole}
                        onClick={() => handleToggleMatrixAccess(module.id, 'MANAGE')}
                        className={`py-1 sm:py-1.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 ${
                          currentLevel === 'MANAGE'
                            ? 'bg-emerald-500 text-black shadow-sm sm:shadow-md shadow-emerald-500/25 border border-emerald-400 scale-[1.02]'
                            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <ShieldCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>MANAGE</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canManage || isAdminRole}
                        onClick={() => handleToggleMatrixAccess(module.id, 'VIEW')}
                        className={`py-1 sm:py-1.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 ${
                          currentLevel === 'VIEW'
                            ? 'bg-sky-500 text-white shadow-sm sm:shadow-md shadow-sky-500/25 border border-sky-400 scale-[1.02]'
                            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>VIEW ONLY</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canManage || isAdminRole}
                        onClick={() => handleToggleMatrixAccess(module.id, 'NONE')}
                        className={`py-1 sm:py-1.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 ${
                          currentLevel === 'NONE'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 scale-[1.02]'
                            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <EyeOff className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>NO ACCESS</span>
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
      {/* 🖥️ 2. DESKTOP VIEW ONLY (ATHLON 2.0 COMMAND CENTER ARCHITECTURE)           */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-24 space-y-8 animate-in fade-in duration-300">
        {/* Executive Command Banner */}
        <div
          className="relative rounded-3xl border p-6 lg:p-8 overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              {/* Badge & Breadcrumb */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  Tournament Operations Suite
                </span>
                <span className="text-foreground/30">•</span>
                <span className="text-xs font-semibold text-foreground/50">
                  Officials &amp; Governance Matrix
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Roles &amp; Permissions Command
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {officials.length} {officials.length === 1 ? 'Official' : 'Officials'} Appointed
                </span>
              </h1>
              <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl">
                Appoint tournament directors, chief umpires, desk scorers, and finance controllers. Fine-tune granular read/write module clearances across the organization.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl border text-foreground/70 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
                title="Refresh Official Records"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>

              {canManage && activeTab === 'OFFICIALS' && (
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: '#000000',
                  }}
                >
                  <UserPlus className="w-4 h-4 stroke-[3]" />
                  <span>+ Appoint Official</span>
                </button>
              )}

              {canManage && activeTab === 'PERMISSIONS' && (
                <>
                  <button
                    onClick={handleResetPermissions}
                    disabled={resettingPermissions}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 hover:bg-black/[0.04] dark:hover:bg-white/10"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text-muted)',
                    }}
                  >
                    {resettingPermissions ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Defaults'}
                  </button>

                  <button
                    onClick={handleSavePermissions}
                    disabled={savingPermissions}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    style={{
                      backgroundColor: 'var(--athlon-primary)',
                      color: '#000000',
                    }}
                  >
                    {savingPermissions ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Save Clearance Matrix</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4-Metric Executive Telemetry HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Appointed Officials */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-primary/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Appointed Roster
              </span>
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-foreground tracking-tight">
                {officials.length}
              </span>
              <span className="text-xs font-bold text-foreground/40 font-mono">Members</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Active Staff
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Verified phone lookup</span>
            </div>
          </div>

          {/* Card 2: Tournament Leadership */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-amber-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Event Directors
              </span>
              <div className="w-9 h-9 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-amber-500 tracking-tight">
                {officials.filter((o) => o.role === 'TOURNAMENT_DIRECTOR' || o.role === 'ADMIN').length}
              </span>
              <span className="text-xs font-bold text-amber-500/60 font-mono">Leaders</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Executive
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Directors &amp; owners</span>
            </div>
          </div>

          {/* Card 3: Referees & Scorers */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-purple-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Umpires &amp; Scorers
              </span>
              <div className="w-9 h-9 rounded-xl border border-purple-500/20 bg-purple-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-purple-400 tracking-tight">
                {officials.filter((o) => o.role === 'CHIEF_UMPIRE' || o.role === 'DESK_OFFICIAL').length}
              </span>
              <span className="text-xs font-bold text-purple-400/60 font-mono">Officials</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Court Operations
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">Match arbiters</span>
            </div>
          </div>

          {/* Card 4: Governance Compliance */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-xs hover:border-emerald-500/40 group"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Governance Health
              </span>
              <div className="w-9 h-9 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono text-emerald-500 tracking-tight">
                100%
              </span>
              <span className="text-xs font-bold text-emerald-500/60 font-mono">RBAC</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Enforced
              </span>
              <span className="text-[11px] text-foreground/40 font-medium">9 modules secured</span>
            </div>
          </div>
        </div>

        {/* View Switcher Capsule Bar */}
        <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="flex items-center gap-2 p-1 rounded-2xl border bg-surface/50" style={{ borderColor: 'var(--athlon-border)' }}>
            <button
              onClick={() => setActiveTab('OFFICIALS')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'OFFICIALS'
                  ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Appointed Officials ({officials.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PERMISSIONS')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'PERMISSIONS'
                  ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Granular Permissions Matrix</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-foreground/40 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Athlon Multi-Role Access Control</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TAB 1 DESKTOP: OFFICIALS DIRECTORY                                    */}
        {/* ===================================================================== */}
        {activeTab === 'OFFICIALS' && (
          <div className="space-y-6">
            {/* Filter & Search Deck */}
            <div
              className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search by official name, phone number, role, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs font-medium border outline-none transition-all placeholder:text-foreground/40 focus:border-primary"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
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

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSelectedRoleFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedRoleFilter === 'ALL'
                      ? 'bg-primary text-black border-primary shadow-xs'
                      : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
                  }`}
                >
                  All Roles ({officials.length})
                </button>
                {ORGANIZER_ROLES_CONFIG.map((r) => {
                  const isSelected = selectedRoleFilter === r.id;
                  const count = officials.filter((o) => o.role === r.id).length;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleFilter(isSelected ? 'ALL' : r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-primary text-black border-primary shadow-xs'
                          : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                          isSelected ? 'bg-black/20 text-black' : 'bg-foreground/5 text-foreground/50'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Officials Table */}
            <div
              className="rounded-3xl border overflow-hidden shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {loadingOfficials ? (
                <div className="p-16 text-center text-foreground/50 font-bold text-xs space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p>Loading appointed tournament officials...</p>
                </div>
              ) : filteredOfficials.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div
                    className="w-16 h-16 mx-auto rounded-3xl border flex items-center justify-center text-3xl shadow-inner"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    🛡️
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-black text-foreground">No officials match your filters</h3>
                    <p className="text-xs text-foreground/50">
                      {searchTerm || selectedRoleFilter !== 'ALL'
                        ? 'Try clearing search terms or selecting a different role filter.'
                        : 'No tournament officials have been appointed to this workspace yet.'}
                    </p>
                  </div>
                  {canManage && (
                    <div className="pt-2">
                      <button
                        onClick={handleOpenAddModal}
                        className="px-5 py-2.5 rounded-xl text-xs font-black bg-primary text-black shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4 stroke-[3]" />
                        <span>+ Appoint First Official</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className="border-b text-[10px] font-black uppercase tracking-wider text-foreground/40"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <th className="py-3.5 px-6">Official &amp; Identity</th>
                        <th className="py-3.5 px-6">Assigned Role</th>
                        <th className="py-3.5 px-6">Direct Contact</th>
                        <th className="py-3.5 px-6">Administrative Memo</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredOfficials.map((official) => {
                        const roleConfig = ORGANIZER_ROLES_CONFIG.find((r) => r.id === official.role) || {
                          id: official.role,
                          label: official.role,
                          icon: '👤',
                          badgeClass: 'bg-foreground/10 text-foreground border-foreground/20',
                          description: '',
                        };

                        return (
                          <tr
                            key={official.officialUuid}
                            className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                          >
                            {/* Official & Identity */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3.5">
                                {official.photo ? (
                                  <img
                                    src={official.photo}
                                    alt={official.fullName}
                                    className="w-11 h-11 rounded-2xl object-cover border border-foreground/10 shrink-0 group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div
                                    className="w-11 h-11 rounded-2xl border flex items-center justify-center text-sm font-black text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                                    style={{
                                      backgroundColor: 'var(--athlon-primary-soft)',
                                      borderColor: 'var(--athlon-primary)',
                                    }}
                                  >
                                    {official.fullName?.charAt(0) || 'O'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                      {official.fullName}
                                    </p>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified User" />
                                  </div>
                                  <p className="text-xs font-medium text-foreground/50 mt-0.5 truncate">
                                    {official.designation || 'Tournament Official'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Assigned Role */}
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${roleConfig.badgeClass}`}
                              >
                                <span>{roleConfig.icon}</span>
                                <span>{roleConfig.label}</span>
                              </span>
                            </td>

                            {/* Direct Contact */}
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                {official.phone && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-foreground">
                                      {official.phone}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={`tel:${official.phone}`}
                                        className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
                                        title="Call"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                      <a
                                        href={`https://wa.me/91${official.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                        title="WhatsApp"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                                {official.email && (
                                  <p className="text-[11px] text-foreground/40 truncate max-w-xs">
                                    {official.email}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Administrative Memo */}
                            <td className="py-4 px-6">
                              {official.notes ? (
                                <p className="text-xs text-foreground/60 italic max-w-xs truncate" title={official.notes}>
                                  &quot;{official.notes}&quot;
                                </p>
                              ) : (
                                <span className="text-xs text-foreground/30 italic">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Staff
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {canManage && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingOfficial(official);
                                        setFormRole(official.role);
                                        setFormDesignation(official.designation || '');
                                        setFormNotes(official.notes || '');
                                      }}
                                      className="p-2 rounded-xl text-foreground/50 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
                                      title="Edit Role & Details"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRevokeOfficial(official.officialUuid, official.fullName)}
                                      className="p-2 rounded-xl text-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                      title="Revoke Official Access"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2 DESKTOP: PERMISSIONS MATRIX                                     */}
        {/* ===================================================================== */}
        {activeTab === 'PERMISSIONS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Role Capsule Selector Grid */}
            <div
              className="p-5 rounded-3xl border shadow-sm space-y-4"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                    Select Role to Configure
                  </h3>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    Click any role below to view and modify its operational clearance levels.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground/50">
                    Active: <span className="text-primary font-black">{ORGANIZER_ROLES_CONFIG.find((r) => r.id === selectedMatrixRole)?.label}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {ORGANIZER_ROLES_CONFIG.map((r) => {
                  const isSelected = selectedMatrixRole === r.id;
                  const roleMatrix = permissionsMatrix[r.id] || {};
                  const mCount = Object.values(roleMatrix).filter((v) => v === 'MANAGE').length;

                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedMatrixRole(r.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-xs ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 scale-[1.02]'
                          : 'border-border/70 hover:border-foreground/30 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--athlon-surface)' : 'var(--athlon-card)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl group-hover:scale-110 transition-transform">{r.icon}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                            isSelected
                              ? 'bg-primary text-black font-black'
                              : 'bg-foreground/5 text-foreground/50'
                          }`}
                        >
                          {mCount}M
                        </span>
                      </div>
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-primary font-black' : 'text-foreground'}`}>
                        {r.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Role Executive Dossier */}
            {(() => {
              const currentRoleObj = ORGANIZER_ROLES_CONFIG.find((r) => r.id === selectedMatrixRole);
              const roleMatrix = permissionsMatrix[selectedMatrixRole] || {};
              const manageCount = Object.values(roleMatrix).filter((v) => v === 'MANAGE').length;
              const viewCount = Object.values(roleMatrix).filter((v) => v === 'VIEW').length;
              const noneCount = Object.values(roleMatrix).filter((v) => v === 'NONE').length;

              return (
                <div
                  className="relative overflow-hidden p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 shadow-md"
                      style={{
                        backgroundColor: 'var(--athlon-primary-soft)',
                        borderColor: 'var(--athlon-primary)',
                      }}
                    >
                      {currentRoleObj?.icon || '🛡️'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xl text-foreground tracking-tight leading-none">
                          {currentRoleObj?.label}
                        </h4>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                          style={{
                            backgroundColor: 'var(--athlon-primary-soft)',
                            borderColor: 'var(--athlon-primary)',
                            color: 'var(--athlon-primary)',
                          }}
                        >
                          Role Scope
                        </span>
                      </div>
                      <p className="text-foreground/70 text-xs font-medium mt-1 leading-snug max-w-2xl">
                        {currentRoleObj?.description}
                      </p>
                    </div>
                  </div>

                  {/* Clearance Count Badges */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-black shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{manageCount} Manage</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 text-xs font-black shadow-xs">
                      <Eye className="w-4 h-4" />
                      <span>{viewCount} View Only</span>
                    </span>
                    {noneCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-black shadow-xs">
                        <EyeOff className="w-4 h-4" />
                        <span>{noneCount} Locked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Permissions Matrix Desktop Table */}
            <div
              className="rounded-3xl border overflow-hidden shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10px] font-black uppercase tracking-wider text-foreground/40"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <th className="py-4 px-6 w-1/3">Module &amp; Scope</th>
                    <th className="py-4 px-6 w-1/3">Description &amp; Operational Clearance</th>
                    <th className="py-4 px-6 text-right w-1/3">Access Level Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ORGANIZER_MODULES_CONFIG.map((module) => {
                    const currentLevel = permissionsMatrix[selectedMatrixRole]?.[module.id] || 'VIEW';
                    const isAdminRole = selectedMatrixRole === 'ADMIN';

                    return (
                      <tr key={module.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        {/* Module & Scope */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div
                              className="w-11 h-11 rounded-2xl border flex items-center justify-center text-xl shrink-0 shadow-xs"
                              style={{
                                backgroundColor: 'var(--athlon-primary-soft)',
                                borderColor: 'var(--athlon-primary)',
                              }}
                            >
                              {module.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-foreground truncate">
                                {module.label}
                              </h4>
                              <span className="text-[10px] font-mono font-bold text-foreground/40 uppercase">
                                Module ID: #{module.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-6">
                          <p className="text-xs text-foreground/60 leading-relaxed">
                            {module.desc}
                          </p>
                        </td>

                        {/* Tri-State Control Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div
                            className="inline-flex items-center p-1 rounded-2xl gap-1 shadow-inner border"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            <button
                              type="button"
                              disabled={!canManage || isAdminRole}
                              onClick={() => handleToggleMatrixAccess(module.id, 'MANAGE')}
                              className={`py-1.5 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 ${
                                currentLevel === 'MANAGE'
                                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25 border border-emerald-400 scale-[1.02]'
                                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>MANAGE</span>
                            </button>

                            <button
                              type="button"
                              disabled={!canManage || isAdminRole}
                              onClick={() => handleToggleMatrixAccess(module.id, 'VIEW')}
                              className={`py-1.5 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 ${
                                currentLevel === 'VIEW'
                                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400 scale-[1.02]'
                                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>VIEW ONLY</span>
                            </button>

                            <button
                              type="button"
                              disabled={!canManage || isAdminRole}
                              onClick={() => handleToggleMatrixAccess(module.id, 'NONE')}
                              className={`py-1.5 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 ${
                                currentLevel === 'NONE'
                                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 scale-[1.02]'
                                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                              }`}
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>NO ACCESS</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Bottom Sticky Action Bar */}
              {canManage && (
                <div
                  className="p-4 border-t flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <Info className="w-4 h-4 text-primary" />
                    <span>Remember to click &quot;Save Clearance Matrix&quot; after making permission changes.</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetPermissions}
                      disabled={resettingPermissions}
                      className="px-4 py-2 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {resettingPermissions ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Defaults'}
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 hover:brightness-110 disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--athlon-primary)',
                        color: '#000000',
                      }}
                    >
                      {savingPermissions ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Save Clearance Matrix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
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
