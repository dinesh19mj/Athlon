'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  Search,
  RefreshCw,
  Share2,
  ArrowLeft,
  Shield,
  Crown,
  Zap,
  Coins,
  UserCheck,
  Check,
  X,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Award,
  Trophy,
  Flame,
  User,
  SlidersHorizontal,
  Copy,
  CheckCheck,
} from 'lucide-react';
import {
  CommunityService,
  CommunityMemberDto,
  CommunityResponse,
  CommunityRole,
  CommunityMemberStatus,
} from '@/lib/api/community';
import { UserService, UserResponse } from '@/lib/api/user';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';

interface RoleConfig {
  role: CommunityRole;
  label: string;
  icon: any;
  badgeClass: string;
  avatarRing: string;
  description: string;
}

const ROLE_CONFIGS: Record<CommunityRole, RoleConfig> = {
  OWNER: {
    role: 'OWNER',
    label: 'Host',
    icon: Crown,
    badgeClass: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/35 shadow-[0_2px_10px_rgba(245,158,11,0.15)]',
    avatarRing: 'ring-2 ring-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    description: 'Circle creator with full management and ownership privileges',
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Community Admin',
    icon: Shield,
    badgeClass: 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/35 shadow-[0_2px_10px_rgba(168,85,247,0.15)]',
    avatarRing: 'ring-2 ring-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    description: 'Can schedule sessions, approve requests & manage rosters',
  },
  COORDINATOR: {
    role: 'COORDINATOR',
    label: 'Event Coordinator',
    icon: Zap,
    badgeClass: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/35 shadow-[0_2px_10px_rgba(6,182,212,0.15)]',
    avatarRing: 'ring-2 ring-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    description: 'Organizes friendly matches, court bookings & lineups',
  },
  CAPTAIN: {
    role: 'CAPTAIN',
    label: 'Team Captain',
    icon: Trophy,
    badgeClass: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/35 shadow-[0_2px_10px_rgba(59,130,246,0.15)]',
    avatarRing: 'ring-2 ring-blue-400/70 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    description: 'Leads squads in team championships and scrimmages',
  },
  TREASURER: {
    role: 'TREASURER',
    label: 'Kitty Treasurer',
    icon: Coins,
    badgeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/35 shadow-[0_2px_10px_rgba(16,185,129,0.15)]',
    avatarRing: 'ring-2 ring-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    description: 'Manages community kitty, shuttle expenses & court funds',
  },
  MEMBER: {
    role: 'MEMBER',
    label: 'Member',
    icon: UserCheck,
    badgeClass: 'bg-surface/80 text-foreground/75 border border-border',
    avatarRing: 'ring-1 ring-border',
    description: 'Active community player participating in weekly sessions',
  },
};

export default function CommunityMembersPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { isAdmin, canManage } = useOrgRole(orgId);

  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [members, setMembers] = useState<CommunityMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'ADMINS' | 'REQUESTS'>('ALL');
  const [sortBy, setSortBy] = useState<'ACTIVITY' | 'RECENT' | 'NAME'>('ACTIVITY');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invite / Add Member Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<CommunityRole>('MEMBER');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Role Edit & Delete Confirmation
  const [memberToEditRole, setMemberToEditRole] = useState<CommunityMemberDto | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<CommunityMemberDto | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    if (!orgId) return;
    try {
      setRefreshing(true);
      const [commRes, memRes] = await Promise.allSettled([
        CommunityService.getCommunity(orgId),
        CommunityService.getMembers(orgId),
      ]);

      if (commRes.status === 'fulfilled') {
        const commData = (commRes.value as any)?.data || commRes.value;
        if (commData) setCommunity(commData);
      }

      if (memRes.status === 'fulfilled') {
        const memData = (memRes.value as any)?.data || memRes.value;
        setMembers(Array.isArray(memData) ? memData : []);
      }
    } catch (err) {
      console.error('Failed to load community members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/communities?join=${orgId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast('Community invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      showToast(inviteUrl);
    }
  };

  const handleResolveJoin = async (targetUserUuid: string, status: CommunityMemberStatus) => {
    try {
      setIsProcessingAction(true);
      await CommunityService.resolveJoinRequest(orgId, targetUserUuid, status);
      showToast(status === 'ACTIVE' ? 'Player approved to community!' : 'Join request declined');
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to resolve request');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    try {
      setIsProcessingAction(true);
      await CommunityService.removeMember(orgId, memberToDelete.userUuid);
      showToast('Member removed from circle');
      setMemberToDelete(null);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to remove member');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateRole = async (newRole: CommunityRole) => {
    if (!memberToEditRole) return;
    try {
      setIsProcessingAction(true);
      await CommunityService.updateMemberRole(orgId, memberToEditRole.userUuid, newRole);
      showToast(`Role updated to ${ROLE_CONFIGS[newRole]?.label || newRole}`);
      setMemberToEditRole(null);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update role');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleLookupUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setSearchingUser(true);
    setSearchError(null);
    setFoundUser(null);
    try {
      const res = await UserService.getUserByPhone(phoneInput.trim());
      const u = (res as any)?.data || res;
      if (u && (u.uuid || u.phone || u.firstName)) {
        setFoundUser(u);
      } else {
        setSearchError('No athlete found with this phone number. Ask them to sign up first.');
      }
    } catch {
      setSearchError('User lookup failed. Please verify the phone number.');
    } finally {
      setSearchingUser(false);
    }
  };

  const handleAddFoundUser = async () => {
    if (!foundUser) return;
    try {
      setIsAddingMember(true);
      const athleteName = [foundUser.firstName, foundUser.lastName].filter(Boolean).join(' ') || 'Athlete';
      await CommunityService.joinCommunity(orgId, 'Added by community admin');
      showToast(`${athleteName} added to community`);
      setShowInviteModal(false);
      setFoundUser(null);
      setPhoneInput('');
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Filtered members calculation
  const { activeMembers, requestedMembers, adminMembers, totalGamesPlayed } = useMemo(() => {
    const active = members.filter((m) => m.status === 'ACTIVE');
    const requested = members.filter((m) => m.status === 'REQUESTED');
    const admins = active.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN' || m.role === 'COORDINATOR' || m.role === 'CAPTAIN');
    const totalGames = active.reduce((sum, m) => sum + (m.sessionsJoined ?? m.sessionsAttended ?? 0), 0);
    return {
      activeMembers: active,
      requestedMembers: requested,
      adminMembers: admins,
      totalGamesPlayed: totalGames,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (activeTab === 'ACTIVE') list = [...activeMembers];
    else if (activeTab === 'ADMINS') list = [...adminMembers];
    else if (activeTab === 'REQUESTS') list = [...requestedMembers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((m) => {
        const name = (m.fullName || m.userName || '').toLowerCase();
        const role = (m.role || '').toLowerCase();
        const skill = (m.skillLevel || '').toLowerCase();
        return name.includes(q) || role.includes(q) || skill.includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      // Owners always first
      if (a.role === 'OWNER') return -1;
      if (b.role === 'OWNER') return 1;
      if (sortBy === 'ACTIVITY') {
        const gamesA = a.sessionsJoined ?? a.sessionsAttended ?? 0;
        const gamesB = b.sessionsJoined ?? b.sessionsAttended ?? 0;
        return gamesB - gamesA;
      }
      if (sortBy === 'NAME') {
        const nameA = a.fullName || a.userName || '';
        const nameB = b.fullName || b.userName || '';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }, [members, activeTab, activeMembers, adminMembers, requestedMembers, searchQuery, sortBy]);

  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const sportName = community?.primarySport || org?.name || 'Badminton';
  const locationLabel = community?.location || community?.city || (org as any)?.city || 'Local Circle';

  return (
    <div
      className="min-h-full w-full pb-28 md:pb-16 text-foreground"
      style={{
        backgroundColor: 'var(--athlon-bg)',
        paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-lg md:max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col gap-3.5 md:gap-6 pt-1.5">
        {/* ── HYPER-STYLISH ATHLETIC ARENA HERO (Theme Adaptive) ── */}
        <section
          className="relative w-full rounded-[26px] overflow-hidden border p-4 sm:p-5 shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow:
              '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Top Edge Neon Energy Rail */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none z-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
            }}
          />

          {/* Stadium Floodlight Spotlights */}
          <div
            className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-60 animate-pulse duration-1000 z-0"
            style={{
              background: 'radial-gradient(circle, var(--athlon-primary) 0%, rgba(52, 211, 153, 0.3) 40%, transparent 75%)',
            }}
          />

          {/* Specular Sheen Arc */}
          <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

          <div className="relative z-10 space-y-3.5">
            {/* Top Control Bar inside Hero */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href={`/org/${orgId}/dashboard`}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 transition-all shrink-0 shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>

                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary truncate">
                    🏸 {sportName}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Plan & Limits, Invite & Refresh */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/org/${orgId}/community/subscription`}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[9.5px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm backdrop-blur-md cursor-pointer bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
                  title="Community Plan & Member Capacity"
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  <span className="hidden sm:inline">Plan</span>
                </Link>

                <button
                  onClick={handleCopyInviteLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[9.5px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm backdrop-blur-md cursor-pointer"
                  style={{
                    backgroundColor: copiedLink ? 'var(--athlon-primary)' : 'var(--athlon-surface)',
                    borderColor: copiedLink ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                    color: copiedLink ? 'var(--athlon-primary-foreground)' : 'var(--athlon-text)',
                  }}
                  title="Copy Invite Link"
                >
                  {copiedLink ? <CheckCheck className="w-3 h-3 stroke-[2.5]" /> : <Share2 className="w-3 h-3 text-primary" />}
                  <span>{copiedLink ? 'Copied' : 'Invite'}</span>
                </button>

                <button
                  onClick={loadData}
                  disabled={refreshing}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 cursor-pointer shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Refresh Roster"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-[19px] sm:text-[21px] font-black leading-[1.14] tracking-tight uppercase text-foreground">
                <span>Community</span>{' '}
                <span className="text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]">
                  Members
                </span>
              </h1>
              <p className="text-[11px] text-text-secondary leading-relaxed font-medium pt-0.5">
                Active player roster, circle captains &amp; roll call
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center justify-center gap-1.5 text-[9.5px] font-bold px-3 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md tracking-wider uppercase cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                  color: 'var(--athlon-primary-foreground)',
                  boxShadow: '0 4px 16px var(--athlon-primary-glow)',
                }}
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Player</span>
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'ADMINS' ? 'ALL' : 'ADMINS')}
                className="flex items-center justify-center gap-1.5 border text-[9.5px] font-bold px-3 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm tracking-wider uppercase backdrop-blur-md cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              >
                <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                <span>Captains</span>
              </button>
            </div>

            {/* Live Telemetry Strip with Dynamic Counts */}
            <div
              className="grid grid-cols-3 divide-x rounded-2xl p-2.5 mt-1 border backdrop-blur-md"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-foreground font-mono leading-none">
                  {loading ? '...' : activeMembers.length}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                  Roster
                </span>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-primary font-mono leading-none">
                  {loading ? '...' : totalGamesPlayed}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                  Sessions
                </span>
              </div>

              <div
                onClick={() => requestedMembers.length > 0 && setActiveTab('REQUESTS')}
                className={`flex flex-col items-center justify-center text-center px-1 ${
                  requestedMembers.length > 0 ? 'cursor-pointer' : ''
                }`}
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span
                  className={`text-xs font-black font-mono leading-none ${
                    requestedMembers.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {loading ? '...' : requestedMembers.length > 0 ? requestedMembers.length : adminMembers.length}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                  {requestedMembers.length > 0 ? 'Requests' : 'Captains'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SEARCH & FILTER CONTROLS (Design System Section 4.2 & 4.3) ── */}
        <div className="space-y-2.5">
          {/* Search Input */}
          <div
            className="flex items-center w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border transition-all backdrop-blur-md focus-within:ring-1 focus-within:ring-primary shadow-inner"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <Search className="w-3.5 h-3.5 text-foreground/40 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search member by name, role, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none placeholder:text-foreground/40 text-foreground font-medium truncate"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:text-foreground text-foreground/40 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar -mx-1 px-1">
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: 'ALL', label: 'All', count: members.length },
                { id: 'ACTIVE', label: 'Active Players', count: activeMembers.length },
                { id: 'ADMINS', label: 'Host & Captains', count: adminMembers.length },
                ...(requestedMembers.length > 0
                  ? [{ id: 'REQUESTS', label: 'Join Requests', count: requestedMembers.length, urgent: true }]
                  : []),
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-primary shadow-[0_2px_12px_var(--athlon-primary-glow)] font-black'
                        : 'text-foreground/70 border-border bg-card/60 hover:bg-card'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                      borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                      color: isSelected ? 'var(--athlon-primary-foreground)' : undefined,
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono font-bold ${
                        isSelected ? 'bg-black/20 text-black' : 'bg-surface text-foreground/50'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'ACTIVITY' ? 'NAME' : 'ACTIVITY')}
              className="shrink-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-[10.5px] font-bold text-foreground/70 hover:bg-surface cursor-pointer ml-auto"
              style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-card)' }}
              title="Toggle Sort"
            >
              <SlidersHorizontal className="w-3 h-3 text-primary" />
              <span>{sortBy === 'ACTIVITY' ? 'Active' : 'Name'}</span>
            </button>
          </div>
        </div>

        {/* ── PENDING REQUESTS URGENT CARD (WHEN TAB IS REQUESTS OR REQUESTS EXIST) ── */}
        {requestedMembers.length > 0 && (activeTab === 'REQUESTS' || activeTab === 'ALL') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pending Membership Requests ({requestedMembers.length})</span>
              </span>
            </div>

            <div className="space-y-2">
              {requestedMembers.map((req) => {
                const name = req.fullName || req.userName || 'New Athlete';
                return (
                  <div
                    key={req.communityMemberUuid || req.userUuid}
                    className="p-3.5 rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-xs text-foreground truncate">{name}</h4>
                          <span className="px-2 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Requested
                          </span>
                        </div>
                        {req.requestMessage ? (
                          <p className="text-[11px] text-foreground/75 italic line-clamp-1">
                            &quot;{req.requestMessage}&quot;
                          </p>
                        ) : (
                          <p className="text-[10px] text-foreground/50 font-medium">
                            Requested to join via session link
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleResolveJoin(req.userUuid, 'ACTIVE')}
                        disabled={isProcessingAction}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-[9.5px] uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleResolveJoin(req.userUuid, 'REJECTED')}
                        disabled={isProcessingAction}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[9.5px] uppercase tracking-wider hover:bg-rose-500/25 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION TITLE ROW (Design System Section 2) ── */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span>Roster List</span>
              <span className="text-[9.5px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.2 rounded-full">
                ({filteredMembers.length})
              </span>
            </h2>
          </div>
          {filteredMembers.length > 0 && (
            <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
              {activeTab === 'ALL' ? 'All Members' : activeTab === 'ACTIVE' ? 'Active Players' : 'Captains'}
            </span>
          )}
        </div>

        {/* ── MEMBERS GRID / ROSTER LIST ── */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-foreground/50">Loading player roster...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div
            className="py-12 text-center rounded-[26px] border space-y-3 p-6"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-surface border flex items-center justify-center text-foreground/40 mx-auto shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-foreground">No members found</h3>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              {searchQuery
                ? `No members match "${searchQuery}". Try searching for another name or role.`
                : activeTab === 'REQUESTS'
                  ? 'No pending join requests right now.'
                  : 'No players have joined this circle yet. Share your community invite link with athletes!'}
            </p>
            {canManage && (
              <button
                onClick={handleCopyInviteLink}
                className="mt-1 px-4 py-2 rounded-xl bg-primary text-black font-bold text-[9.5px] uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Community Invite</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
            {filteredMembers.map((member) => {
              const name = member.fullName || member.userName || 'Community Athlete';
              const initial = name.charAt(0).toUpperCase();
              const isOwner = member.role === 'OWNER';
              const roleConfig = ROLE_CONFIGS[member.role] || ROLE_CONFIGS.MEMBER;
              const RoleIcon = roleConfig.icon;
              const isPending = member.status === 'REQUESTED';
              const gamesPlayed = member.sessionsJoined ?? member.sessionsAttended ?? 0;

              return (
                <div
                  key={member.communityMemberUuid || member.userUuid || member.memberId}
                  className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
                    isOwner
                      ? 'border-amber-500/35 hover:border-amber-400 shadow-amber-500/5'
                      : 'hover:border-primary/40'
                  }`}
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: !isOwner ? 'var(--athlon-border)' : undefined,
                  }}
                >
                  {/* Subtle Accent Glow for Host */}
                  {isOwner && (
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
                  )}

                  {/* Top: Avatar, Names & Badges */}
                  <div className="flex items-start justify-between gap-2.5 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar with Halo Ring */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-11 h-11 rounded-xl text-sm font-black flex items-center justify-center text-primary shadow-sm overflow-hidden transition-transform group-hover:scale-105 ${roleConfig.avatarRing}`}
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                          }}
                        >
                          {member.userAvatar || member.photoUrl ? (
                            <img
                              src={member.userAvatar || member.photoUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-extrabold">{initial}</span>
                          )}
                        </div>

                        {/* Pulsating Active Status Indicator */}
                        {member.status === 'ACTIVE' && (
                          <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-card absolute -bottom-0.5 -right-0.5 shadow-md flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          </span>
                        )}
                      </div>

                      {/* Name & Role Badge */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-black text-sm text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                            {name}
                          </h3>

                          {/* Role Badge */}
                          <span
                            className={`px-2 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${roleConfig.badgeClass}`}
                          >
                            <RoleIcon className="w-2.5 h-2.5 stroke-[2.5]" />
                            <span>{roleConfig.label}</span>
                          </span>
                        </div>

                        {/* Subtitle Details: Joined Date & Skill */}
                        <div className="flex items-center gap-1.5 text-[10.5px] text-foreground/50 font-medium flex-wrap">
                          {member.joinedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-foreground/40" />
                              <span>Joined {formatJoinedDate(member.joinedAt)}</span>
                            </span>
                          )}

                          {member.skillLevel && member.skillLevel !== 'ALL' && (
                            <>
                              <span className="text-foreground/30">•</span>
                              <span className="text-primary font-bold px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20 text-[9.5px]">
                                {member.skillLevel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    {canManage && !isOwner && !isPending && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setMemberToEditRole(member)}
                          className="px-2.5 py-1 rounded-lg border text-[9.5px] font-bold uppercase tracking-wider hover:bg-surface transition-all cursor-pointer text-foreground/75 active:scale-95 shadow-sm"
                          style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                          title="Change Role"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="w-7 h-7 rounded-lg border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                          style={{ backgroundColor: 'var(--athlon-surface)' }}
                          title="Remove Member"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bento Performance Mini-Bar inside Card */}
                  <div
                    className="p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Games Counter */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                          <Activity className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="font-mono font-black text-foreground text-xs leading-none">
                            {gamesPlayed} {gamesPlayed === 1 ? 'game' : 'games'}
                          </div>
                          <div className="text-[8.5px] font-bold text-foreground/45 uppercase tracking-wider">
                            Sessions
                          </div>
                        </div>
                      </div>

                      {/* Matches Counter if present */}
                      {member.matchesPlayed !== undefined && member.matchesPlayed > 0 && (
                        <div className="flex items-center gap-1.5 border-l pl-2.5 border-border/50">
                          <div className="w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                            <Trophy className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="font-mono font-black text-foreground text-xs leading-none">
                              {member.matchesPlayed} matches
                            </div>
                            <div className="text-[8.5px] font-bold text-foreground/45 uppercase tracking-wider">
                              Record
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Member Status Pill */}
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{member.status || 'ACTIVE'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ROLE EDIT BOTTOM SHEET / MODAL ── */}
      {memberToEditRole && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-[32px] border p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <h3 className="text-base font-black text-foreground">Assign Community Role</h3>
                <p className="text-xs text-foreground/50 font-semibold mt-0.5">
                  Update permissions for <span className="text-primary font-bold">{memberToEditRole.fullName || memberToEditRole.userName}</span>
                </p>
              </div>
              <button
                onClick={() => setMemberToEditRole(null)}
                className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1 max-h-[60vh] overflow-y-auto pr-1">
              {(Object.keys(ROLE_CONFIGS) as CommunityRole[])
                .filter((r) => r !== 'OWNER')
                .map((roleKey) => {
                  const cfg = ROLE_CONFIGS[roleKey];
                  const Icon = cfg.icon;
                  const isSelected = memberToEditRole.role === roleKey;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleUpdateRole(roleKey)}
                      disabled={isProcessingAction}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${isSelected
                        ? 'border-primary bg-primary/15 shadow-sm'
                        : 'hover:bg-surface border-border'
                        }`}
                      style={{
                        backgroundColor: !isSelected ? 'var(--athlon-surface)' : undefined,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.badgeClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {cfg.label}
                          </div>
                          <div className="text-[11px] text-foreground/50 font-medium mt-0.5">
                            {cfg.description}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0 mt-1 stroke-[3]" />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MEMBER CONFIRMATION MODAL ── */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-[32px] border p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/10">
              <Trash2 className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-foreground">Remove from Circle?</h3>
              <p className="text-xs text-foreground/60 font-medium">
                Are you sure you want to remove <span className="text-foreground font-bold">{memberToDelete.fullName || memberToDelete.userName}</span> from this community roster?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-3 rounded-2xl border text-xs font-bold hover:bg-surface transition-colors cursor-pointer text-foreground"
                style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={isProcessingAction}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-xs font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/25 cursor-pointer active:scale-95"
              >
                {isProcessingAction ? 'Removing...' : 'Remove Player'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVITE & ADD MEMBER MODAL (MODERN LUXURY ATHLON MODAL) ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-[32px] border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Ambient Energy Glow */}
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
              style={{ backgroundColor: 'var(--athlon-primary)' }}
            />

            {/* Modal Header */}
            <div
              className="p-5 sm:p-6 pb-4 border-b flex items-center justify-between shrink-0 relative z-10"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary truncate">
                      Community Roster
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight truncate">
                    Add Community Player
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setFoundUser(null);
                  setPhoneInput('');
                  setSearchError(null);
                }}
                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-grow relative z-10">
              {/* Quick Share Link Banner */}
              <div
                className="p-4 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-foreground flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-primary" />
                    <span>Instant 1-Tap Invite Link</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-black flex items-center gap-1.5 cursor-pointer text-[11px] transition-all active:scale-95"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </button>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">
                  Share this invite link with your WhatsApp or Telegram group so players can join instantly.
                </p>
              </div>

              {/* Athlete Phone Lookup Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>Lookup Registered Athlete</span>
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    phoneInput.replace(/[^0-9]/g, '').length === 10
                      ? 'text-primary'
                      : 'text-foreground/40'
                  }`}>
                    {phoneInput.replace(/[^0-9]/g, '').length}/10 digits
                  </span>
                </div>

                <div
                  className="p-1.5 rounded-2xl border flex items-center gap-2 shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-xs font-black text-foreground font-mono shrink-0 select-none flex items-center gap-1">
                    <span>+91</span>
                  </div>

                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile..."
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    maxLength={10}
                    className="w-full bg-transparent px-2 py-2 text-sm font-mono font-black text-foreground placeholder:text-foreground/30 focus:outline-none flex-grow min-w-0"
                  />

                  {searchingUser ? (
                    <div className="p-2 shrink-0">
                      <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  ) : phoneInput.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneInput('');
                        setFoundUser(null);
                        setSearchError(null);
                      }}
                      className="p-2 text-foreground/30 hover:text-foreground transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}

                  {!foundUser && (
                    <button
                      type="button"
                      onClick={handleLookupUser}
                      disabled={searchingUser || phoneInput.replace(/[^0-9]/g, '').length < 10}
                      className="px-3.5 py-2 rounded-xl bg-primary text-black text-[11px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 fill-black" />
                      <span>Lookup</span>
                    </button>
                  )}
                </div>
              </div>

              {searchError && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
                        Athlete Not Found
                      </h4>
                      <p className="text-xs text-foreground/75 font-medium leading-relaxed mt-0.5">
                        {searchError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Found Athlete Card */}
              {foundUser && (
                <div
                  className="p-4 rounded-3xl border space-y-3 animate-in zoom-in-95 duration-200 shadow-sm relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 via-primary to-emerald-400" />

                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Verified Athlete
                    </span>
                    <span className="text-[10px] font-bold text-foreground/50">
                      Ready to Add
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 pt-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                      {foundUser.photo ? (
                        <img
                          src={UserService.getPhotoUrl(foundUser.photo)}
                          alt={foundUser.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-black text-primary font-mono">
                          {foundUser.firstName ? foundUser.firstName.charAt(0).toUpperCase() : 'A'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-foreground truncate">
                        {[foundUser.firstName, foundUser.lastName].filter(Boolean).join(' ') || 'Athlete'}
                      </h4>
                      <p className="text-xs text-foreground/60 font-mono font-bold mt-0.5">
                        +91 {foundUser.phone || phoneInput}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions Footer */}
            <div
              className="p-4 sm:p-5 border-t flex items-center gap-3 shrink-0 relative z-10"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setFoundUser(null);
                  setPhoneInput('');
                  setSearchError(null);
                }}
                className="w-1/3 py-2.5 px-3 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground transition-all active:scale-95 text-center cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                Cancel
              </button>

              {foundUser ? (
                <button
                  type="button"
                  onClick={handleAddFoundUser}
                  disabled={isAddingMember}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {isAddingMember ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding to Circle...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Add to Circle</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLookupUser}
                  disabled={searchingUser || phoneInput.replace(/[^0-9]/g, '').length < 10}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {searchingUser ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Lookup Athlete</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3D FLOATING ACTION BUTTON ── */}
      {canManage && (
        <Athlon3DFAB
          onClick={() => setShowInviteModal(true)}
          label="Add Player"
          title="Add / Invite Member"
          ariaLabel="Add / Invite Member"
          className="fixed bottom-22 right-4 md:bottom-8 md:right-8 z-40"
        />
      )}
    </div>
  );
}
