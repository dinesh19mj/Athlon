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
    <div className="min-h-screen pb-28 md:pb-16 text-foreground" style={{ backgroundColor: 'var(--athlon-background)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HERO HEADER BAR ── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl px-4 sm:px-6 py-3.5 transition-all"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/org/${orgId}/dashboard`}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-foreground/75 hover:text-foreground hover:bg-surface transition-all active:scale-95 shrink-0 shadow-sm"
              style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 inline-flex items-center gap-1">
                  <span>🏸</span>
                  <span className="truncate">{sportName}</span>
                </span>
                <span className="text-[10px] text-foreground/45 font-semibold hidden xs:inline">• {locationLabel}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-snug truncate mt-0.5">
                Community Members
              </h1>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyInviteLink}
              className={`px-3 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${copiedLink
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'hover:bg-surface text-foreground'
                }`}
              style={{
                borderColor: !copiedLink ? 'var(--athlon-border)' : undefined,
                backgroundColor: !copiedLink ? 'var(--athlon-surface)' : undefined,
              }}
              title="Copy Invite Link"
            >
              {copiedLink ? <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Invite'}</span>
            </button>

            <button
              onClick={loadData}
              disabled={refreshing}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-surface transition-all active:scale-95 cursor-pointer shadow-sm"
              style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* ── BENTO OVERVIEW STATS STRIP ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* Card 1: Active Roster */}
          <div
            className="p-3 sm:p-4 rounded-[22px] border relative overflow-hidden flex flex-col justify-between shadow-sm group hover:border-primary/40 transition-colors"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between text-foreground/50">
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider truncate">Roster</span>
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground font-mono">{activeMembers.length}</span>
              <span className="text-[10px] text-foreground/50 font-bold hidden sm:inline">athletes</span>
            </div>
            <div className="text-[9.5px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Circle</span>
            </div>
          </div>

          {/* Card 2: Sessions / Games Played */}
          <div
            className="p-3 sm:p-4 rounded-[22px] border relative overflow-hidden flex flex-col justify-between shadow-sm group hover:border-amber-500/40 transition-colors"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between text-foreground/50">
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider truncate">Sessions</span>
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground font-mono">{totalGamesPlayed}</span>
              <span className="text-[10px] text-foreground/50 font-bold hidden sm:inline">played</span>
            </div>
            <div className="text-[9.5px] text-amber-400 font-bold mt-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>Match Roster</span>
            </div>
          </div>

          {/* Card 3: Leadership / Requests */}
          <div
            onClick={() => requestedMembers.length > 0 && setActiveTab('REQUESTS')}
            className={`p-3 sm:p-4 rounded-[22px] border relative overflow-hidden flex flex-col justify-between shadow-sm transition-all ${requestedMembers.length > 0
              ? 'border-rose-500/40 bg-rose-500/10 cursor-pointer hover:bg-rose-500/15'
              : 'hover:border-purple-500/40'
              }`}
            style={{
              backgroundColor: requestedMembers.length === 0 ? 'var(--athlon-card)' : undefined,
              borderColor: requestedMembers.length === 0 ? 'var(--athlon-border)' : undefined,
            }}
          >
            <div className="flex items-center justify-between text-foreground/50">
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider truncate">
                {requestedMembers.length > 0 ? 'Requests' : 'Captains'}
              </span>
              {requestedMembers.length > 0 ? (
                <UserPlus className="w-3.5 h-3.5 text-rose-400 animate-bounce shrink-0" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground font-mono">
                {requestedMembers.length > 0 ? requestedMembers.length : adminMembers.length}
              </span>
              <span className="text-[10px] text-foreground/50 font-bold hidden sm:inline">
                {requestedMembers.length > 0 ? 'pending' : 'leads'}
              </span>
            </div>
            <div className={`text-[9.5px] font-bold mt-0.5 flex items-center gap-1 ${requestedMembers.length > 0 ? 'text-rose-400' : 'text-purple-400'}`}>
              <span>{requestedMembers.length > 0 ? 'Tap to Review' : 'Admins & Hosts'}</span>
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-foreground/45 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member by name, role, or skill level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-[22px] border text-xs sm:text-sm font-semibold outline-none transition-all placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/15 shadow-sm"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-7 h-7 rounded-xl flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground hover:bg-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${activeTab === 'ALL'
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'border hover:bg-surface text-foreground/75'
                  }`}
                style={{
                  borderColor: activeTab !== 'ALL' ? 'var(--athlon-border)' : undefined,
                  backgroundColor: activeTab !== 'ALL' ? 'var(--athlon-card)' : undefined,
                }}
              >
                <span>All</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeTab === 'ALL' ? 'bg-black/20 text-black' : 'bg-surface text-foreground/55'}`}>
                  {members.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${activeTab === 'ACTIVE'
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'border hover:bg-surface text-foreground/75'
                  }`}
                style={{
                  borderColor: activeTab !== 'ACTIVE' ? 'var(--athlon-border)' : undefined,
                  backgroundColor: activeTab !== 'ACTIVE' ? 'var(--athlon-card)' : undefined,
                }}
              >
                <span>Active Players</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeTab === 'ACTIVE' ? 'bg-black/20 text-black' : 'bg-surface text-foreground/55'}`}>
                  {activeMembers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ADMINS')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${activeTab === 'ADMINS'
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'border hover:bg-surface text-foreground/75'
                  }`}
                style={{
                  borderColor: activeTab !== 'ADMINS' ? 'var(--athlon-border)' : undefined,
                  backgroundColor: activeTab !== 'ADMINS' ? 'var(--athlon-card)' : undefined,
                }}
              >
                <span>Host &amp; Captains</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeTab === 'ADMINS' ? 'bg-black/20 text-black' : 'bg-surface text-foreground/55'}`}>
                  {adminMembers.length}
                </span>
              </button>

              {requestedMembers.length > 0 && (
                <button
                  onClick={() => setActiveTab('REQUESTS')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${activeTab === 'REQUESTS'
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    }`}
                >
                  <Sparkles className="w-3 h-3 fill-amber-400" />
                  <span>Join Requests</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-black text-amber-400">
                    {requestedMembers.length}
                  </span>
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-foreground/50 shrink-0 ml-auto">
              <button
                onClick={() => setSortBy(sortBy === 'ACTIVITY' ? 'NAME' : 'ACTIVITY')}
                className="px-2.5 py-1.5 rounded-xl border flex items-center gap-1 hover:bg-surface transition-colors cursor-pointer text-foreground/70"
                style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-card)' }}
                title="Toggle Sort"
              >
                <SlidersHorizontal className="w-3 h-3 text-primary" />
                <span>Sort: {sortBy === 'ACTIVITY' ? 'Most Active' : 'Name'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── PENDING REQUESTS URGENT CARD (WHEN TAB IS REQUESTS OR REQUESTS EXIST) ── */}
        {requestedMembers.length > 0 && (activeTab === 'REQUESTS' || activeTab === 'ALL') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pending Membership Requests ({requestedMembers.length})</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {requestedMembers.map((req) => {
                const name = req.fullName || req.userName || 'New Athlete';
                return (
                  <div
                    key={req.communityMemberUuid || req.userUuid}
                    className="p-4 rounded-[26px] border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-foreground truncate">{name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Requested
                          </span>
                        </div>
                        {req.requestMessage ? (
                          <p className="text-xs text-foreground/75 italic line-clamp-1">
                            &quot;{req.requestMessage}&quot;
                          </p>
                        ) : (
                          <p className="text-[11px] text-foreground/50 font-medium">
                            Requested to join via session or community link
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleResolveJoin(req.userUuid, 'ACTIVE')}
                        disabled={isProcessingAction}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleResolveJoin(req.userUuid, 'REJECTED')}
                        disabled={isProcessingAction}
                        className="px-3.5 py-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/25 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MEMBERS GRID / ROSTER LIST ── */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-foreground/50">Loading player roster...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div
            className="py-16 text-center rounded-[28px] border space-y-3.5 p-6"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-surface border flex items-center justify-center text-foreground/40 mx-auto shadow-sm">
              <Users className="w-7 h-7" />
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
                className="mt-2 px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs hover:bg-primary/90 active:scale-95 transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Community Invite</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                  className={`rounded-[28px] border p-4.5 sm:p-5 flex flex-col justify-between gap-3.5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 ${isOwner
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
                  )}

                  {/* Top: Avatar, Names & Badges */}
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar with Halo Ring */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-13 h-13 rounded-2xl text-base font-black flex items-center justify-center text-primary shadow-sm overflow-hidden transition-transform group-hover:scale-105 ${roleConfig.avatarRing}`}
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
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card absolute -bottom-0.5 -right-0.5 shadow-md flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          </span>
                        )}
                      </div>

                      {/* Name & Role Badge */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                            {name}
                          </h3>

                          {/* Role Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${roleConfig.badgeClass}`}
                          >
                            <RoleIcon className="w-3 h-3 stroke-[2.5]" />
                            <span>{roleConfig.label}</span>
                          </span>
                        </div>

                        {/* Subtitle Details: Joined Date & Skill */}
                        <div className="flex items-center gap-2 text-[11px] text-foreground/55 font-semibold flex-wrap">
                          {member.joinedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-foreground/40" />
                              <span>Joined {formatJoinedDate(member.joinedAt)}</span>
                            </span>
                          )}

                          {member.skillLevel && member.skillLevel !== 'ALL' && (
                            <>
                              <span className="text-foreground/30">•</span>
                              <span className="text-primary font-extrabold px-2 py-0.2 rounded-md bg-primary/10 border border-primary/20 text-[10px]">
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
                          className="px-2.5 py-1.5 rounded-xl border text-[10.5px] font-extrabold hover:bg-surface transition-all cursor-pointer text-foreground/75 active:scale-95 shadow-sm"
                          style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                          title="Change Role"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="w-8 h-8 rounded-xl border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                          style={{ backgroundColor: 'var(--athlon-surface)' }}
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bento Performance Mini-Bar inside Card */}
                  <div
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Games Counter */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono font-black text-foreground text-xs leading-none">
                            {gamesPlayed} {gamesPlayed === 1 ? 'game' : 'games'}
                          </div>
                          <div className="text-[9.5px] font-bold text-foreground/45 uppercase tracking-wider">
                            Sessions
                          </div>
                        </div>
                      </div>

                      {/* Matches Counter if present */}
                      {member.matchesPlayed !== undefined && member.matchesPlayed > 0 && (
                        <div className="flex items-center gap-1.5 border-l pl-3 border-border/50">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                            <Trophy className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-mono font-black text-foreground text-xs leading-none">
                              {member.matchesPlayed} matches
                            </div>
                            <div className="text-[9.5px] font-bold text-foreground/45 uppercase tracking-wider">
                              Record
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Member Status Pill */}
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
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
      </main>

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

      {/* ── INVITE & ADD MEMBER MODAL ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-[32px] border p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Add Community Player</h3>
                  <p className="text-[11px] text-foreground/50 font-semibold">Invite athletes to your weekly sports circle</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setFoundUser(null);
                  setPhoneInput('');
                }}
                className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                  <span>Share 1-Tap Invite Link</span>
                </span>
                <button
                  onClick={handleCopyInviteLink}
                  className="text-primary font-black hover:underline flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[11px] text-foreground/55 leading-relaxed">
                Send this link to your WhatsApp or Telegram sports groups. Players can tap once to request joining your community.
              </p>
            </div>

            {/* Athlete Phone Lookup Form */}
            <form onSubmit={handleLookupUser} className="space-y-3 pt-1">
              <label className="text-xs font-bold text-foreground/80 block">
                Lookup Registered Athlete by Phone
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-foreground/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-2xl border text-xs font-semibold outline-none focus:border-primary"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchingUser || !phoneInput.trim()}
                  className="px-4 py-3 rounded-2xl bg-primary text-black font-black text-xs hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {searchingUser ? 'Searching...' : 'Lookup'}
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Found Athlete Card */}
            {foundUser && (
              <div
                className="p-4 rounded-2xl border space-y-3 animate-in fade-in"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-base shadow-sm">
                    {foundUser.firstName ? foundUser.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-foreground">
                      {[foundUser.firstName, foundUser.lastName].filter(Boolean).join(' ') || 'Athlete'}
                    </h4>
                    <p className="text-xs text-foreground/50">{foundUser.phone || foundUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleAddFoundUser}
                  disabled={isAddingMember}
                  className="w-full py-3 rounded-2xl bg-primary text-black font-black text-xs hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  {isAddingMember ? 'Adding to Circle...' : 'Add to Circle'}
                </button>
              </div>
            )}
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
        />
      )}
    </div>
  );
}
