'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService, UserResponse } from '@/lib/api/user';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  UserPlus,
  Trash2,
  RefreshCw,
  Trophy,
  Users
} from 'lucide-react';

const ROLES = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ATHLETE', label: 'Athlete' },
  { value: 'COACH', label: 'Coach' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'STUDENT', label: 'Student' }
];

export default function MembersPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserResponse | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const orgUuid = org?.id || orgIdParam;

  useEffect(() => {
    if (orgUuid) {
      loadMembers();
    }
  }, [orgUuid]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await OrganizationService.getMembers(orgUuid);
      const list = Array.isArray(res) ? res : ((res as any)?.data || []);
      setMembers(list);
    } catch (err: any) {
      console.error('Failed to load organization members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  // Verify Phone Number
  const handleVerifyPhone = async () => {
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setVerificationError('Please enter a valid 10-digit phone number.');
      setVerifiedUser(null);
      return;
    }

    try {
      setVerifyingPhone(true);
      setVerificationError(null);
      setVerifiedUser(null);
      setActionError(null);

      const res = await UserService.getUserByPhone(cleanPhone);
      const user = (res as any)?.data || (res as any);
      if (user && user.uuid) {
        setVerifiedUser(user);
      } else {
        setVerificationError(
          `No active Athlon user found with phone number +91 ${cleanPhone}. Please ask the user to register an account or create their profile first.`
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `No active Athlon user found with phone number +91 ${cleanPhone}. Please ask the user to register on Athlon first.`;
      setVerificationError(msg);
      setVerifiedUser(null);
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Auto-trigger verification when 10 digits are typed
  const handlePhoneChange = (val: string) => {
    setPhoneInput(val);
    setVerifiedUser(null);
    setVerificationError(null);
    setActionError(null);

    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      // Auto verify
      setTimeout(() => {
        handleVerifyPhoneExplicit(clean);
      }, 300);
    }
  };

  const handleVerifyPhoneExplicit = async (cleanPhone: string) => {
    try {
      setVerifyingPhone(true);
      setVerificationError(null);
      setVerifiedUser(null);

      const res = await UserService.getUserByPhone(cleanPhone);
      const user = (res as any)?.data || (res as any);
      if (user && user.uuid) {
        setVerifiedUser(user);
      } else {
        setVerificationError(
          `No active Athlon user found with phone number +91 ${cleanPhone}. Please ask the user to create their account/profile first.`
        );
      }
    } catch (err: any) {
      setVerificationError(
        `No active Athlon user found with phone number +91 ${cleanPhone}. Please create the user account first.`
      );
      setVerifiedUser(null);
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Submit Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedUser) return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
      await OrganizationService.addMemberByPhone(orgUuid, {
        phone: cleanPhone,
        role: selectedRole
      });

      setActionSuccess(`Successfully added ${verifiedUser.firstName} to the club directory.`);
      setIsAddModalOpen(false);
      resetModal();
      loadMembers();

      setTimeout(() => {
        setActionSuccess(null);
      }, 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add member to club.';
      setActionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberUuid: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this club?`)) return;

    try {
      await OrganizationService.removeMember(orgUuid, memberUuid);
      setMembers(prev => prev.filter(m => m.organizationMemberUuid !== memberUuid));
      setActionSuccess(`${memberName} was removed from the club.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to remove member.');
    }
  };

  const resetModal = () => {
    setPhoneInput('');
    setSelectedRole('MEMBER');
    setVerifiedUser(null);
    setVerificationError(null);
    setActionError(null);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      (m.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone || '').includes(searchTerm);

    const matchesRole =
      roleFilter === 'ALL' || (m.role || '').toUpperCase() === roleFilter.toUpperCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Club Member Directory</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/25">
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>
          <p className="text-foreground/50 font-medium text-sm">
            Manage athletes, coaches, and staff for {org?.name || 'your club'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => {
              resetModal();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Search, Filter Tabs & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search members by name, phone, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
          {['ALL', 'MEMBER', 'ATHLETE', 'COACH', 'ADMIN', 'STUDENT'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                roleFilter === role
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'bg-background/60 text-foreground/60 hover:text-foreground border border-foreground/5'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground/50">Loading club members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {searchTerm || roleFilter !== 'ALL' ? 'No matching members found' : 'No members added yet'}
              </h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                {searchTerm || roleFilter !== 'ALL'
                  ? 'Try adjusting your search query or role filter.'
                  : 'Start building your club directory by adding members using their phone number.'}
              </p>
            </div>
            {!searchTerm && roleFilter === 'ALL' && (
              <button
                onClick={() => {
                  resetModal();
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Add First Member
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Member</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Phone & Contact</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {filteredMembers.map((member) => (
                    <tr key={member.organizationMemberUuid} className="hover:bg-foreground/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center text-foreground font-bold shrink-0 shadow-inner">
                            {member.photo ? (
                              <img
                                src={UserService.getPhotoUrl(member.photo)}
                                alt={member.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-black text-primary">
                                {member.fullName?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-sm text-foreground flex items-center gap-2">
                              <span>{member.fullName}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <div className="text-xs text-foreground/50">{member.email || 'No email registered'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-foreground/80">
                          <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span>{member.phone ? `+91 ${member.phone}` : '-'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-foreground/5 border border-foreground/10 text-foreground/80">
                          {member.role === 'ADMIN' ? (
                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                          ) : member.role === 'COACH' ? (
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-primary/70" />
                          )}
                          <span>{member.role || 'MEMBER'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {member.status || 'Active'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-foreground/50">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveMember(member.organizationMemberUuid, member.fullName)}
                          className="p-2 rounded-xl text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stylish Member Cards View */}
            <div className="block md:hidden divide-y divide-foreground/5">
              {filteredMembers.map((member) => (
                <div
                  key={member.organizationMemberUuid}
                  className="p-4 space-y-3 hover:bg-foreground/[0.02] transition-colors"
                >
                  {/* Top Row: Avatar + Name + Status + Delete */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center text-foreground font-bold shrink-0 shadow-inner">
                        {member.photo ? (
                          <img
                            src={UserService.getPhotoUrl(member.photo)}
                            alt={member.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-black text-primary">
                            {member.fullName?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm text-foreground flex items-center gap-1.5 truncate">
                          <span className="truncate">{member.fullName}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-foreground/5 border border-foreground/10 text-foreground/70">
                            {member.role === 'ADMIN' ? (
                              <Shield className="w-3 h-3 text-purple-400" />
                            ) : member.role === 'COACH' ? (
                              <Trophy className="w-3 h-3 text-amber-400" />
                            ) : (
                              <User className="w-3 h-3 text-primary/70" />
                            )}
                            <span>{member.role || 'MEMBER'}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            {member.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.organizationMemberUuid, member.fullName)}
                      className="p-2.5 rounded-xl text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Details Strip */}
                  <div className="flex items-center justify-between pt-1 text-xs text-foreground/60 border-t border-foreground/[0.04]">
                    <div className="flex items-center gap-1.5 font-mono text-foreground/80 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-primary/70" />
                      <span>{member.phone ? `+91 ${member.phone}` : '-'}</span>
                    </div>
                    <div className="text-[11px] text-foreground/40 font-medium">
                      Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ADD MEMBER MODAL (POSITIONED FROM TOP & FULLY VISIBLE) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-6 sm:pt-12 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-[28px] border shadow-2xl flex flex-col my-auto sm:my-0 animate-in zoom-in-95 duration-200 overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)'
            }}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-3 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Add Club Member</h3>
                  <p className="text-xs text-foreground/50 font-medium">Verify phone number and assign role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetModal();
                }}
                className="w-9 h-9 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-grow">
              {actionError && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Phone Input Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center justify-between">
                  <span>Athlete Phone Number</span>
                  <span className="text-[10px] text-primary/80 font-bold">10-Digit Mobile</span>
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center px-3.5 py-3 rounded-2xl border bg-background text-sm font-bold text-foreground/70 select-none shadow-inner"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    +91
                  </div>
                  <div className="relative flex-grow">
                    <input
                      type="tel"
                      placeholder="Enter mobile number..."
                      value={phoneInput}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={10}
                      autoFocus
                      className="w-full bg-background border rounded-2xl px-4 py-3 text-sm font-mono font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                    {verifyingPhone ? (
                      <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                    ) : phoneInput.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneInput('');
                          setVerifiedUser(null);
                          setVerificationError(null);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={verifyingPhone || phoneInput.replace(/[^0-9]/g, '').length < 10}
                    className="px-4 py-3 rounded-2xl bg-surface border text-xs font-black text-foreground hover:bg-foreground/5 hover:border-primary/40 transition-all disabled:opacity-40 shrink-0 shadow-sm"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* SIMPLIFIED & STYLISH VERIFIED USER PREVIEW */}
              {verifiedUser && (
                <div className="p-4 rounded-2xl border bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 space-y-2.5 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Account</span>
                  </div>

                  <div className="flex items-center gap-3.5 pt-0.5">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                      {verifiedUser.photo ? (
                        <img
                          src={UserService.getPhotoUrl(verifiedUser.photo)}
                          alt={verifiedUser.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-black text-primary">
                          {verifiedUser.firstName?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-base font-black text-foreground truncate">
                        {verifiedUser.firstName} {verifiedUser.lastName || ''}
                      </h4>
                      <p className="text-xs text-foreground/50 font-medium font-mono">+91 {phoneInput}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* USER NOT FOUND / ERROR BANNER */}
              {verificationError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                        No Active Account Found
                      </h4>
                      <p className="text-xs text-foreground/75 font-medium mt-1 leading-relaxed">
                        {verificationError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE SELECTOR CHIPS */}
              {verifiedUser && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <label className="text-xs font-black uppercase tracking-wider text-foreground/70">
                    Assign Club Role
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setSelectedRole(r.value)}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                          selectedRole === r.value
                            ? 'bg-primary text-black font-black border-primary shadow-md shadow-primary/20 scale-[1.02]'
                            : 'bg-background border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ALWAYS-VISIBLE STICKY BOTTOM ACTION FOOTER */}
            <div
              className="p-4 sm:p-5 border-t bg-surface/95 backdrop-blur-md flex items-center gap-3 shrink-0"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetModal();
                }}
                className="w-1/3 py-3 rounded-2xl bg-surface border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors text-center"
              >
                Cancel
              </button>

              {verifiedUser ? (
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-2xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add to Club
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={verifyingPhone || phoneInput.replace(/[^0-9]/g, '').length < 10}
                  className="w-2/3 py-3 rounded-2xl bg-foreground/10 border border-foreground/10 text-foreground text-xs font-black tracking-wide hover:bg-primary hover:text-black hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifyingPhone ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>Verify Number</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}