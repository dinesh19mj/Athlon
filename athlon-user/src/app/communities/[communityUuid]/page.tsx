'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  MapPin,
  CalendarDays,
  Activity,
  Trophy,
  ShieldCheck,
  Lock,
  Globe,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Share2,
  Heart,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Vote,
} from 'lucide-react';
import {
  CommunityService,
  CommunityResponse,
  CommunityMemberDto,
  SessionResponse,
  CommunityPost,
  CommunityPoll,
  CommunityTeam,
  CommunityMatch,
} from '@/lib/api/community';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function CommunityPublicProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const communityUuid = (params?.communityUuid as string) || '';

  const { isAuthenticated } = useAuthStore();
  const { addOrganization, setActiveWorkspace } = useWorkspaceStore();

  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [members, setMembers] = useState<CommunityMemberDto[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [teams, setTeams] = useState<CommunityTeam[]>([]);
  const [matches, setMatches] = useState<CommunityMatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SESSIONS' | 'FEED' | 'TEAMS' | 'MEMBERS'>('SESSIONS');

  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const fetchCommunityData = async () => {
    if (!communityUuid) return;
    try {
      setLoading(true);
      const [commRes, memRes, sessRes, postRes, pollRes, teamRes, matchRes] = await Promise.allSettled([
        CommunityService.getCommunity(communityUuid),
        CommunityService.getMembers(communityUuid).catch(() => []),
        CommunityService.getSessions(communityUuid).catch(() => []),
        CommunityService.getFeed(communityUuid).catch(() => []),
        CommunityService.getPolls(communityUuid).catch(() => []),
        CommunityService.getTeams(communityUuid).catch(() => []),
        CommunityService.getMatches(communityUuid).catch(() => []),
      ]);

      if (commRes.status === 'fulfilled') {
        const data = (commRes.value as any)?.data || commRes.value;
        setCommunity(data);
      }
      if (memRes.status === 'fulfilled') {
        const data = (memRes.value as any)?.data || memRes.value;
        setMembers(Array.isArray(data) ? data : []);
      }
      if (sessRes.status === 'fulfilled') {
        const data = (sessRes.value as any)?.data || sessRes.value;
        setSessions(Array.isArray(data) ? data : []);
      }
      if (postRes.status === 'fulfilled') {
        const data = (postRes.value as any)?.data || postRes.value;
        setPosts(Array.isArray(data) ? data : []);
      }
      if (pollRes.status === 'fulfilled') {
        const data = (pollRes.value as any)?.data || pollRes.value;
        setPolls(Array.isArray(data) ? data : []);
      }
      if (teamRes.status === 'fulfilled') {
        const data = (teamRes.value as any)?.data || teamRes.value;
        setTeams(Array.isArray(data) ? data : []);
      }
      if (matchRes.status === 'fulfilled') {
        const data = (matchRes.value as any)?.data || matchRes.value;
        setMatches(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load community details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [communityUuid]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/communities/${communityUuid}`);
      return;
    }
    try {
      setIsJoining(true);
      setJoinMessage(null);
      const res = await CommunityService.joinCommunity(communityUuid);
      const member = (res as any)?.data || res;

      if (community) {
        const targetOrgUuid = community.organizationUuid || community.orgUuid || community.communityUuid || communityUuid;
        if (member?.status === 'ACTIVE') {
          addOrganization({
            id: targetOrgUuid,
            name: community.name,
            type: 'COMMUNITY',
            role: 'MEMBER',
          });
          setCommunity({ ...community, currentUserStatus: 'ACTIVE', currentUserRole: 'MEMBER' });
          setJoinMessage('Welcome! You have joined this sports community.');
        } else {
          setCommunity({ ...community, currentUserStatus: 'REQUESTED' });
          setJoinMessage('Your request to join has been submitted for approval.');
        }
      }
    } catch (err: any) {
      console.error('Failed to join community:', err);
      setJoinMessage(err?.response?.data?.message || err?.message || 'Failed to join community. Active joined community limit (3) may be reached.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRsvp = async (sessionUuid: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/communities/${communityUuid}`);
      return;
    }
    try {
      await CommunityService.rsvpSession(sessionUuid, { status, guestsCount: 0 });
      fetchCommunityData();
    } catch (err) {
      console.error('Failed to RSVP session:', err);
    }
  };

  const handleVotePoll = async (pollId: number, optionId: number) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/communities/${communityUuid}`);
      return;
    }
    try {
      await CommunityService.votePoll(pollId, [optionId]);
      fetchCommunityData();
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-5xl mx-auto space-y-6">
        <div className="h-64 rounded-3xl bg-surface animate-pulse" />
        <div className="h-96 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-lg mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Community not found</h2>
        <p className="text-xs text-foreground/60">This community may have been removed or is private.</p>
        <Link href="/communities" className="inline-flex px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs">
          Return to Communities Directory
        </Link>
      </div>
    );
  }

  const isMember = community.currentUserStatus === 'ACTIVE';
  const isPending = community.currentUserStatus === 'REQUESTED';

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--athlon-bg)' }}>
      {/* ─── Hero Cover & Identity Card ─── */}
      <div className="border-b" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-6">
          <Link
            href="/communities"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Communities</span>
          </Link>

          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 flex items-center justify-center text-3xl font-black text-primary shrink-0 shadow-lg">
                  {community.logoUrl ? (
                    <img src={community.logoUrl} alt={community.name} className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    community.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                      {community.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                      {community.primarySport}
                    </span>
                    {community.visibility === 'PUBLIC' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" /> Public Group
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Approval Required
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/70 max-w-2xl leading-relaxed">
                    {community.description || `Active ${community.primarySport} playing group organizing regular sessions and competitive fixtures.`}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-foreground/60 flex-wrap pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{community.city || community.area || 'All Areas'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono font-bold text-foreground">{members.length || community.memberCount || 1}</span> members
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span>{community.totalSessionsHosted} sessions hosted</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {isMember ? (
                  <button
                    onClick={() => {
                      const targetOrgUuid = community.organizationUuid || community.orgUuid || community.communityUuid || communityUuid;
                      setActiveWorkspace(targetOrgUuid);
                      router.push(`/org/${targetOrgUuid}/dashboard`);
                    }}
                    className="px-6 py-3 rounded-2xl bg-primary text-black font-black text-sm flex items-center gap-2 transition-all shadow-[0_4px_16px_var(--athlon-primary-glow)] active:scale-95 cursor-pointer"
                  >
                    <span>Open Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : isPending ? (
                  <div className="px-5 py-3 rounded-2xl bg-amber-500/15 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Join Request Pending</span>
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black text-sm flex items-center gap-2 transition-all shadow-[0_4px_16px_var(--athlon-primary-glow)] active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    <span>{isJoining ? 'Joining...' : 'Join Community'}</span>
                  </button>
                )}
              </div>
            </div>

            {joinMessage && (
              <div className="mt-4 p-3.5 rounded-2xl bg-primary/10 border border-primary/25 text-primary text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{joinMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto hide-scrollbar" style={{ borderColor: 'var(--athlon-border)' }}>
          {[
            { key: 'SESSIONS', label: "Let's Play Sessions", icon: CalendarDays, count: sessions.length },
            { key: 'FEED', label: 'Community Feed & Polls', icon: MessageSquare, count: posts.length + polls.length },
            { key: 'TEAMS', label: 'Internal Teams & Matches', icon: Activity, count: teams.length },
            { key: 'MEMBERS', label: 'Member Roster', icon: Users, count: members.length },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-black shadow-md'
                    : 'text-foreground/70 hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                      isSelected ? 'bg-black/20 text-black' : 'bg-surface text-foreground/60'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: Let's Play Sessions ─── */}
        {activeTab === 'SESSIONS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">Upcoming Games &amp; Sessions</h3>
              {isMember && (
                <Link
                  href={`/org/${community.orgUuid}/sessions`}
                  className="px-3.5 py-1.5 rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-black text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Host New Game</span>
                </Link>
              )}
            </div>

            {sessions.length === 0 ? (
              <div
                className="p-12 text-center rounded-3xl border border-dashed space-y-3"
                style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-card)' }}
              >
                <CalendarDays className="w-10 h-10 text-primary mx-auto opacity-70" />
                <p className="text-xs font-bold text-foreground/70">No upcoming sessions scheduled yet</p>
                {isMember ? (
                  <Link
                    href={`/org/${community.orgUuid}/sessions`}
                    className="inline-flex px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-xs"
                  >
                    Schedule &quot;Let&apos;s Play&quot; Session
                  </Link>
                ) : (
                  <p className="text-[11px] text-foreground/50">Join community to be notified when games are posted!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((sess) => (
                  <div
                    key={sess.sessionUuid}
                    className="p-5 rounded-2xl border space-y-4"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {sess.sport}
                        </span>
                        <h4 className="font-black text-base text-foreground mt-1">{sess.title}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {sess.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border space-y-1.5 text-xs text-foreground/80" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50">Date &amp; Time:</span>
                        <span className="font-mono font-bold text-foreground">
                          {sess.sessionDate} • {sess.startTime} - {sess.endTime}
                        </span>
                      </div>
                      {sess.venueName && (
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50">Venue:</span>
                          <span className="font-semibold text-primary truncate max-w-[200px]">{sess.venueName}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/50">RSVP Going:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {sess.goingCount} {sess.maxParticipants ? `/ ${sess.maxParticipants}` : ''} players
                        </span>
                      </div>
                      {sess.costPerPerson ? (
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/50">Cost / Person:</span>
                          <span className="font-mono font-bold text-foreground">₹{sess.costPerPerson}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Quick RSVP Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRsvp(sess.sessionUuid, 'GOING')}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          sess.currentUserRsvp === 'GOING'
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-surface hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        ✓ Going ({sess.goingCount})
                      </button>
                      <button
                        onClick={() => handleRsvp(sess.sessionUuid, 'MAYBE')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          sess.currentUserRsvp === 'MAYBE'
                            ? 'bg-amber-500 text-black'
                            : 'bg-surface hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Maybe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: Community Feed & Polls ─── */}
        {activeTab === 'FEED' && (
          <div className="space-y-6 max-w-2xl">
            {/* Polls Section */}
            {polls.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Vote className="w-4 h-4" />
                  <span>Active Community Polls</span>
                </h3>
                {polls.map((poll) => (
                  <div
                    key={poll.pollId}
                    className="p-5 rounded-2xl border space-y-3 shadow-md"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <h4 className="font-black text-sm text-foreground">{poll.question}</h4>
                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const hasVoted = poll.userVotedOptionIds?.includes(opt.optionId);
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0;

                        return (
                          <button
                            key={opt.optionId}
                            onClick={() => handleVotePoll(poll.pollId, opt.optionId)}
                            className="w-full relative p-3 rounded-xl border text-left overflow-hidden group transition-all cursor-pointer"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div
                              className="absolute top-0 left-0 bottom-0 bg-primary/20 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-foreground">
                              <span className="flex items-center gap-2">
                                {hasVoted && <span className="text-primary font-black">✓</span>}
                                <span>{opt.optionText}</span>
                              </span>
                              <span className="font-mono text-foreground/60">{pct}% ({opt.votesCount})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts Stream */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground/70">Community Highlights</h3>
              {posts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed text-xs text-foreground/50" style={{ borderColor: 'var(--athlon-border)' }}>
                  No posts yet in this community feed.
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.postId}
                    className="p-5 rounded-2xl border space-y-3"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                          {post.userName ? post.userName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-black text-xs text-foreground">{post.userName}</p>
                          <p className="text-[10px] text-foreground/50">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-surface text-foreground/60 border" style={{ borderColor: 'var(--athlon-border)' }}>
                        {post.type}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-4 pt-2 border-t text-xs text-foreground/60" style={{ borderColor: 'var(--athlon-border)' }}>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                        <Heart className="w-3.5 h-3.5" />
                        <span className="font-mono">{post.likesCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-mono">{post.commentsCount || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: Internal Teams & Matches ─── */}
        {activeTab === 'TEAMS' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-foreground">Community Squads &amp; Internal Teams</h3>
              {teams.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed text-xs text-foreground/50" style={{ borderColor: 'var(--athlon-border)' }}>
                  No internal teams formed yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <div
                      key={team.teamId}
                      className="p-4 rounded-2xl border space-y-2"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-foreground">{team.name}</h4>
                          <p className="text-[10px] text-foreground/50">{team.sport}</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-surface border text-[11px] font-mono flex items-center justify-between text-foreground/70" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span>Record:</span>
                        <span className="font-bold text-primary">{team.matchesWon}W - {team.matchesLost}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {matches.length > 0 && (
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <h3 className="text-sm font-black text-foreground">Recent Friendly Match Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matches.map((match) => (
                    <div
                      key={match.matchId}
                      className="p-4 rounded-2xl border space-y-2"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between text-[10px] text-foreground/50">
                        <span>{match.matchDate}</span>
                        <span className="text-primary font-bold">{match.sport}</span>
                      </div>
                      <div className="flex items-center justify-between font-black text-xs text-foreground">
                        <span>{match.teamAName}</span>
                        <span className="font-mono text-primary">{match.scoreA || '-'} : {match.scoreB || '-'}</span>
                        <span>{match.teamBName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: Member Roster ─── */}
        {activeTab === 'MEMBERS' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-foreground">Community Roster ({members.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((m) => (
                <div
                  key={m.memberId}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface border flex items-center justify-center font-bold text-xs text-primary shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        m.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-xs text-foreground truncate">{m.fullName}</p>
                      <p className="text-[10px] text-foreground/50">{m.sessionsAttended} sessions attended</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 shrink-0">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
