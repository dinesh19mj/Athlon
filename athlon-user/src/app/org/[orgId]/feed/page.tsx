'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Heart,
  Vote,
  Bell,
  Sparkles,
  Share2,
  X,
  AlertCircle,
  Pin,
  Send,
  Flame,
  Trophy,
  Zap,
  ArrowLeft,
  RefreshCw,
  Check,
  CheckCheck,
  Calendar,
  Layers,
  ChevronDown,
  Smile,
  Shield,
  Crown,
  User,
  ExternalLink,
  SlidersHorizontal,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CommunityService,
  CommunityPost,
  CommunityAnnouncement,
  CommunityPoll,
  CommunityResponse,
  CommunityPostComment,
} from '@/lib/api/community';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';
import { CommunityPollCard } from '@/components/community/CommunityPollCard';

type FilterTab = 'ALL' | 'POSTS' | 'ANNOUNCEMENTS' | 'POLLS';

interface PostTopic {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

const POST_TOPICS: PostTopic[] = [
  { id: 'MATCH', label: 'Match Story', icon: '🏸', prompt: 'Share today\'s rally, set score, or match reflections...' },
  { id: 'VICTORY', label: 'Victory & Highlights', icon: '🏆', prompt: 'Celebrate a milestone, game win, or clutch point!' },
  { id: 'TALK', label: 'Locker Room Chat', icon: '💬', prompt: 'Discuss club updates, gear reviews, or tactical tips...' },
  { id: 'PARTNER', label: 'Partner Wanted', icon: '⚡', prompt: 'Looking for a sparring partner or doubles teammate?' },
];

const QUICK_EMOJIS = ['🔥', '🏸', '🏆', '⚡', '💪', '🎯', '🙌', '👏'];

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export default function CommunityFeedPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { personalProfile, getActiveOrganization } = useWorkspaceStore();
  const { userUuid } = useAuthStore();
  const activeOrg = getActiveOrganization();

  // Core Data
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Filter
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // New Post Form
  const [selectedTopic, setSelectedTopic] = useState<PostTopic>(POST_TOPICS[0]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Optimistic Likes Set
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [postLikesCount, setPostLikesCount] = useState<Record<number, number>>({});

  // Comments System State
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentsData, setCommentsData] = useState<Record<number, CommunityPostComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({});

  // Poll Creation Modal
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [pollExpiryDays, setPollExpiryDays] = useState<number>(3);
  const [isSubmittingPoll, setIsSubmittingPoll] = useState(false);

  // Announcement Creation Modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announcePriority, setAnnouncePriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [announcePinned, setAnnouncePinned] = useState(true);
  const [isSubmittingAnnounce, setIsSubmittingAnnounce] = useState(false);

  // Voting in-progress flag
  const [votingPollId, setVotingPollId] = useState<number | null>(null);

  const fetchFeedData = async (isManualRefresh = false) => {
    if (!orgId) return;
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [commRes, postRes, annRes, pollRes] = await Promise.allSettled([
        CommunityService.getCommunity(orgId).catch(() => null),
        CommunityService.getFeed(orgId).catch(() => []),
        CommunityService.getAnnouncements(orgId).catch(() => []),
        CommunityService.getPolls(orgId).catch(() => []),
      ]);

      if (commRes.status === 'fulfilled' && commRes.value) {
        const commData = (commRes.value as any)?.data || commRes.value;
        if (commData?.name) setCommunity(commData);
      }

      if (postRes.status === 'fulfilled') {
        const data = (postRes.value as any)?.data || postRes.value;
        const postsArray = Array.isArray(data) ? data : [];
        setPosts(postsArray);

        // sync initial like counts
        const initialLikes: Record<number, number> = {};
        postsArray.forEach((p) => {
          initialLikes[p.postId] = p.likesCount || 0;
        });
        setPostLikesCount(initialLikes);
      }

      if (annRes.status === 'fulfilled') {
        const data = (annRes.value as any)?.data || annRes.value;
        setAnnouncements(Array.isArray(data) ? data : []);
      }

      if (pollRes.status === 'fulfilled') {
        const data = (pollRes.value as any)?.data || pollRes.value;
        setPolls(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
      toast.error('Could not refresh feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, [orgId]);

  // Handle Post Creation
  const handleCreatePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setIsSubmittingPost(true);
      await CommunityService.createPost(orgId, {
        content: newPostContent.trim(),
        type: 'TEXT',
      });
      toast.success('Post published to locker room! 🚀');
      setNewPostContent('');
      await fetchFeedData();
    } catch (err) {
      console.error('Failed to post:', err);
      toast.error('Failed to publish post. Please try again.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle Like/React
  const handleReact = async (postId: number) => {
    const isCurrentlyLiked = !!likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setPostLikesCount((prev) => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] || 0) + (isCurrentlyLiked ? -1 : 1)),
    }));

    try {
      await CommunityService.reactToPost(postId, 'LIKE');
    } catch (err) {
      console.error('Failed to react:', err);
      // Revert if error
      setLikedPosts((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setPostLikesCount((prev) => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || 0) + (isCurrentlyLiked ? 1 : -1)),
      }));
    }
  };

  // Toggle and load comments
  const toggleComments = async (postId: number) => {
    const willOpen = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: willOpen }));

    if (willOpen && !commentsData[postId]) {
      try {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));
        const res = await CommunityService.getComments(postId);
        const data = (res as any)?.data || res;
        setCommentsData((prev) => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Submit comment
  const handleAddComment = async (postId: number) => {
    const commentText = newCommentText[postId]?.trim();
    if (!commentText) return;

    try {
      setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
      const res = await CommunityService.addComment(postId, { content: commentText });
      const newComment = (res as any)?.data || res;

      setCommentsData((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));

      // update post comment count
      setPosts((prev) =>
        prev.map((p) => (p.postId === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
      );

      setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Reply added!');
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error('Failed to add reply');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Poll Vote
  const handleVote = async (pollId: number, optionId: number) => {
    try {
      setVotingPollId(pollId);
      await CommunityService.votePoll(pollId, [optionId]);
      toast.success('Vote recorded! 🗳️');
      await fetchFeedData();
    } catch (err) {
      console.error('Failed to vote:', err);
      toast.error('Failed to register vote');
    } finally {
      setVotingPollId(null);
    }
  };

  // Handle Create Poll
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOptions.length < 2) {
      toast.error('Please enter a question and at least 2 options');
      return;
    }

    try {
      setIsSubmittingPoll(true);
      const expiresAt = new Date(Date.now() + pollExpiryDays * 24 * 60 * 60 * 1000).toISOString();
      await CommunityService.createPoll(orgId, {
        question: pollQuestion.trim(),
        options: cleanOptions,
        allowMultipleChoices: false,
        expiresAt,
      });
      toast.success('Community poll live! 📊');
      setShowPollModal(false);
      setPollQuestion('');
      setPollOptions(['Option 1', 'Option 2']);
      fetchFeedData();
    } catch (err) {
      console.error('Failed to create poll:', err);
      toast.error('Failed to create poll');
    } finally {
      setIsSubmittingPoll(false);
    }
  };

  // Handle Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setIsSubmittingAnnounce(true);
      await CommunityService.createAnnouncement(orgId, {
        title: announceTitle.trim(),
        content: announceContent.trim(),
        priority: announcePriority,
        isPinned: announcePinned,
      });
      toast.success('Announcement broadcasted! 📢');
      setShowAnnounceModal(false);
      setAnnounceTitle('');
      setAnnounceContent('');
      setAnnouncePriority('NORMAL');
      fetchFeedData();
    } catch (err) {
      console.error('Failed to create announcement:', err);
      toast.error('Failed to post announcement');
    } finally {
      setIsSubmittingAnnounce(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Locker room link copied to clipboard!');
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewPostContent((prev) => prev + emoji);
    if (composerTextareaRef.current) {
      composerTextareaRef.current.focus();
    }
  };

  const scrollToComposer = () => {
    composerTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    composerTextareaRef.current?.focus();
  };

  // Filter items
  const showAnnouncements = activeTab === 'ALL' || activeTab === 'ANNOUNCEMENTS';
  const showPolls = activeTab === 'ALL' || activeTab === 'POLLS';
  const showPosts = activeTab === 'ALL' || activeTab === 'POSTS';

  const totalItemsCount = posts.length + announcements.length + polls.length;

  return (
    <div className="min-h-screen pb-32 sm:pb-24" style={{ backgroundColor: 'var(--athlon-background)' }}>
      {/* ─── Top Ambient Gradient ─── */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--athlon-border)' }}>
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[260px] blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: 'var(--athlon-primary, #FF3B30)' }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-6 space-y-4 relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/org/${orgId}/dashboard`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Hub</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchFeedData(true)}
                disabled={refreshing}
                title="Refresh feed"
                className="p-2 rounded-xl border bg-surface/50 hover:bg-surface text-foreground/70 hover:text-foreground transition-all cursor-pointer"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>
              <button
                onClick={handleCopyLink}
                title="Share feed"
                className="p-2 rounded-xl border bg-surface/50 hover:bg-surface text-foreground/70 hover:text-foreground transition-all cursor-pointer"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>{community?.primarySport || 'COMMUNITY'} PULSE</span>
                </span>
                <span className="text-[11px] font-mono text-foreground/40">
                  {community?.name || activeOrg?.name || 'Athlon Locker Room'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Feed &amp; Locker Room</span>
                <Flame className="w-6 h-6 text-primary fill-primary/20 shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-xl">
                Share match highlights, broadcast club bulletins, and participate in live community votes.
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Bulletin</span>
              </button>
              <button
                onClick={() => setShowPollModal(true)}
                className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>New Poll</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div
              className="p-3 rounded-2xl border flex items-center gap-3 backdrop-blur-md"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-foreground font-mono leading-none">
                  {posts.length}
                </div>
                <div className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider truncate">
                  Discussions
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center gap-3 backdrop-blur-md"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-foreground font-mono leading-none">
                  {announcements.length}
                </div>
                <div className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider truncate">
                  Bulletins
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center gap-3 backdrop-blur-md"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Vote className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-foreground font-mono leading-none">
                  {polls.length}
                </div>
                <div className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider truncate">
                  Polls
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ─── Segmented Filter Tabs ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-surface text-foreground/60 hover:text-foreground border'
            }`}
            style={activeTab !== 'ALL' ? { borderColor: 'var(--athlon-border)' } : undefined}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Activity</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                activeTab === 'ALL' ? 'bg-black/20 text-black' : 'bg-card text-foreground/50'
              }`}
            >
              {totalItemsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('POSTS')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'POSTS'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-surface text-foreground/60 hover:text-foreground border'
            }`}
            style={activeTab !== 'POSTS' ? { borderColor: 'var(--athlon-border)' } : undefined}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussions</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                activeTab === 'POSTS' ? 'bg-black/20 text-black' : 'bg-card text-foreground/50'
              }`}
            >
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ANNOUNCEMENTS'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-surface text-foreground/60 hover:text-foreground border'
            }`}
            style={activeTab !== 'ANNOUNCEMENTS' ? { borderColor: 'var(--athlon-border)' } : undefined}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Bulletins</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                activeTab === 'ANNOUNCEMENTS' ? 'bg-black/20 text-black' : 'bg-card text-foreground/50'
              }`}
            >
              {announcements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('POLLS')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'POLLS'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-surface text-foreground/60 hover:text-foreground border'
            }`}
            style={activeTab !== 'POLLS' ? { borderColor: 'var(--athlon-border)' } : undefined}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Polls &amp; Votes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                activeTab === 'POLLS' ? 'bg-black/20 text-black' : 'bg-card text-foreground/50'
              }`}
            >
              {polls.length}
            </span>
          </button>
        </div>

        {/* ─── Stylish Post Composer ─── */}
        <div
          className="rounded-3xl border p-4 sm:p-5 shadow-xl transition-all duration-300 relative overflow-hidden group"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: 'var(--athlon-primary, #FF3B30)' }}
          />

          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {POST_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-surface text-foreground/60 hover:text-foreground hover:bg-surface/80 border border-transparent'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[2px] shrink-0">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center font-black text-xs text-foreground overflow-hidden"
                  style={{ backgroundColor: 'var(--athlon-surface)' }}
                >
                  {personalProfile?.avatar ? (
                    <img
                      src={personalProfile.avatar}
                      alt={personalProfile?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{personalProfile?.name?.charAt(0).toUpperCase() || 'A'}</span>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div className="flex-1 min-w-0">
                <textarea
                  ref={composerTextareaRef}
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={selectedTopic.prompt}
                  maxLength={1000}
                  className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Quick Emoji Bar & Submission Footer */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {/* Emojis */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-foreground/40 font-bold uppercase mr-1 hidden sm:inline">
                  Mood:
                </span>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-7 h-7 rounded-lg hover:bg-surface flex items-center justify-center text-sm transition-transform active:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] font-mono text-foreground/40">
                  {newPostContent.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingPost || !newPostContent.trim()}
                  className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmittingPost ? 'animate-pulse' : ''}`} />
                  <span>{isSubmittingPost ? 'Publishing...' : 'Post to Feed'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ─── Pinned Announcements Section ─── */}
        {showAnnouncements && announcements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 rotate-45" />
                <span>Locker Room Bulletins &amp; Announcements</span>
              </h2>
              <span className="text-[10px] font-mono text-foreground/40">
                {announcements.length} {announcements.length === 1 ? 'Notice' : 'Notices'}
              </span>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => {
                const isUrgent = ann.priority === 'URGENT';
                const isHigh = ann.priority === 'HIGH';

                return (
                  <div
                    key={ann.announcementId}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-lg ${
                      isUrgent
                        ? 'bg-rose-500/10 border-rose-500/40 shadow-rose-500/5'
                        : isHigh
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-amber-500/5'
                        : 'bg-surface/80 border-border/80'
                    }`}
                    style={
                      !isUrgent && !isHigh
                        ? {
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }
                        : undefined
                    }
                  >
                    {/* Header Strip */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            isUrgent
                              ? 'bg-rose-500 text-white animate-pulse'
                              : isHigh
                              ? 'bg-amber-500 text-black'
                              : 'bg-primary/20 text-primary'
                          }`}
                        >
                          <Bell className="w-2.5 h-2.5" />
                          <span>{ann.priority || 'OFFICIAL'}</span>
                        </span>

                        {ann.isPinned && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400">
                            <Pin className="w-2.5 h-2.5 fill-amber-400" />
                            <span>Pinned</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-foreground/40">
                          {formatRelativeTime(ann.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                        <span className="text-[11px] font-bold text-foreground">
                          {ann.authorName || 'Organizer'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        isUrgent ? 'text-rose-300' : isHigh ? 'text-amber-300' : 'text-foreground'
                      }`}
                    >
                      {ann.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/80 whitespace-pre-line mt-1.5 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Community Polls Section ─── */}
        {showPolls && polls.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Vote className="w-4 h-4" />
                <span>Active Member Polls &amp; Votes</span>
              </h2>
              <button
                onClick={() => setShowPollModal(true)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Launch Poll</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {polls.map((poll) => (
                <CommunityPollCard
                  key={poll.pollId}
                  poll={poll}
                  onVote={handleVote}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── Posts Stream ─── */}
        {showPosts && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span>Community Wall &amp; Discussions</span>
              </h2>
              <span className="text-[10px] font-mono text-foreground/40">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-3xl border space-y-3 animate-pulse"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-32 bg-surface rounded-md" />
                        <div className="h-2.5 w-20 bg-surface rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-surface rounded-md" />
                      <div className="h-3 w-4/5 bg-surface rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              /* Inspiring Empty State */
              <div
                className="p-8 sm:p-12 text-center rounded-3xl border border-dashed space-y-4 shadow-sm"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
                  <Flame className="w-7 h-7 animate-bounce" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base font-black text-foreground">The Locker Room is Quiet</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Be the first athlete to break the silence! Share a game rally, match report, or kick off a discussion.
                  </p>
                </div>
                <button
                  onClick={scrollToComposer}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs inline-flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start the Conversation</span>
                </button>
              </div>
            ) : (
              posts.map((post) => {
                const isLiked = !!likedPosts[post.postId];
                const likesCount = postLikesCount[post.postId] ?? (post.likesCount || 0);
                const isCommentsOpen = !!expandedComments[post.postId];
                const commentsList = commentsData[post.postId] || [];
                const isLoadingPostComments = !!loadingComments[post.postId];
                const isSubmittingThisComment = !!submittingComment[post.postId];

                return (
                  <div
                    key={post.postId}
                    className="p-5 sm:p-6 rounded-3xl border space-y-4 shadow-lg transition-all duration-300 hover:border-foreground/20"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* Post Top Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Author Avatar with Role Ring */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[2px] shrink-0 shadow-sm">
                          <div
                            className="w-full h-full rounded-full flex items-center justify-center font-black text-xs text-foreground overflow-hidden"
                            style={{ backgroundColor: 'var(--athlon-surface)' }}
                          >
                            {post.userAvatar ? (
                              <img
                                src={post.userAvatar}
                                alt={post.userName || 'Athlete'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{post.userName ? post.userName.charAt(0).toUpperCase() : 'A'}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-foreground tracking-tight">
                              {post.userName || 'Athlete'}
                            </h4>
                            {post.isPinned && (
                              <span className="p-0.5 rounded text-amber-400" title="Pinned Post">
                                <Pin className="w-3 h-3 fill-amber-400" />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-foreground/40 font-mono">
                            {formatRelativeTime(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Post Type Tag */}
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-surface text-foreground/60 border"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        {post.type || 'STORY'}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>

                    {/* Action Bar (Like, Comment, Share) */}
                    <div
                      className="flex items-center justify-between pt-3 border-t text-xs"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleReact(post.postId)}
                          className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer group ${
                            isLiked ? 'text-rose-500 scale-105' : 'text-foreground/60 hover:text-rose-500'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                              isLiked ? 'fill-rose-500' : ''
                            }`}
                          />
                          <span className="font-mono text-xs">{likesCount}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() => toggleComments(post.postId)}
                          className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                            isCommentsOpen ? 'text-primary' : 'text-foreground/60 hover:text-foreground'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-mono text-xs">{post.commentsCount || 0}</span>
                          <span className="text-[10px] hidden sm:inline">
                            {post.commentsCount === 1 ? 'Reply' : 'Replies'}
                          </span>
                        </button>
                      </div>

                      <button
                        onClick={handleCopyLink}
                        className="text-foreground/40 hover:text-foreground transition-colors p-1"
                        title="Share post"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ─── Expandable Comments Section ─── */}
                    {isCommentsOpen && (
                      <div
                        className="pt-3 border-t space-y-3 animate-fadeIn"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        {/* Comments List */}
                        {isLoadingPostComments ? (
                          <div className="text-center py-3 text-xs text-foreground/40">
                            Loading replies...
                          </div>
                        ) : commentsList.length === 0 ? (
                          <div className="text-center py-2 text-[11px] text-foreground/40 italic">
                            No replies yet. Start the thread!
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {commentsList.map((c) => (
                              <div
                                key={c.commentId}
                                className="p-3 rounded-2xl border text-xs space-y-1"
                                style={{
                                  backgroundColor: 'var(--athlon-surface)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-foreground">{c.userName}</span>
                                  <span className="text-foreground/40 font-mono">
                                    {formatRelativeTime(c.createdAt)}
                                  </span>
                                </div>
                                <p className="text-foreground/80 leading-relaxed">{c.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Reply Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newCommentText[post.postId] || ''}
                            onChange={(e) =>
                              setNewCommentText((prev) => ({ ...prev, [post.postId]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.postId);
                              }
                            }}
                            placeholder="Write a reply to this athlete..."
                            className="flex-1 px-3.5 py-2 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          />
                          <button
                            type="button"
                            disabled={isSubmittingThisComment || !newCommentText[post.postId]?.trim()}
                            onClick={() => handleAddComment(post.postId)}
                            className="px-3.5 py-2 rounded-xl bg-primary text-black font-black text-xs flex items-center gap-1 hover:bg-primary/90 transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden sm:inline">Reply</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ─── Athlon 3D Floating Action Button ─── */}
      <Athlon3DFAB
        onClick={scrollToComposer}
        label="Share Update"
        title="Share Update"
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40"
      />

      {/* ─── Create Poll Modal ─── */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Vote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground tracking-tight">Create Community Poll</h3>
                  <p className="text-[10px] text-foreground/50">Run votes for court times, formats, or match MVP</p>
                </div>
              </div>
              <button
                onClick={() => setShowPollModal(false)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/80">Question *</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Which match time works best this Saturday?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 mt-1 focus:outline-none focus:border-primary/50"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Dynamic Options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground/80">Options *</label>
                  <span className="text-[10px] text-foreground/40 font-mono">
                    {pollOptions.length}/5 options
                  </span>
                </div>

                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[idx] = e.target.value;
                        setPollOptions(next);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="p-2 text-foreground/40 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Option</span>
                  </button>
                )}
              </div>

              {/* Expiry Selector */}
              <div>
                <label className="text-xs font-bold text-foreground/80">Poll Duration</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[1, 3, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setPollExpiryDays(days)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        pollExpiryDays === days
                          ? 'bg-primary/20 text-primary border-primary'
                          : 'bg-surface text-foreground/60 border-transparent hover:border-foreground/20'
                      }`}
                      style={pollExpiryDays !== days ? { borderColor: 'var(--athlon-border)' } : undefined}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 text-xs font-bold text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPoll}
                  className="px-5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary/90 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-primary/20"
                >
                  {isSubmittingPoll ? 'Creating Poll...' : 'Launch Poll 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Announcement Modal ─── */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground tracking-tight">Post Announcement</h3>
                  <p className="text-[10px] text-foreground/50">Broadcast critical club updates to all members</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              {/* Priority Selector */}
              <div>
                <label className="text-xs font-bold text-foreground/80">Priority Level</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['NORMAL', 'HIGH', 'URGENT'] as const).map((p) => {
                    const isSelected = announcePriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAnnouncePriority(p)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? p === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                              : p === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                              : 'bg-primary/20 text-primary border-primary'
                            : 'bg-surface text-foreground/60 border-transparent hover:border-foreground/20'
                        }`}
                        style={!isSelected ? { borderColor: 'var(--athlon-border)' } : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80">Title *</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. Venue booked for Saturday 6 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 mt-1 focus:outline-none focus:border-primary/50"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Enter details, instructions, or tournament rules for all members..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 mt-1 focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Pin Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-foreground">Pin to top of feed</span>
                </div>
                <input
                  type="checkbox"
                  checked={announcePinned}
                  onChange={(e) => setAnnouncePinned(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 text-xs font-bold text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAnnounce}
                  className="px-5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary/90 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-primary/20"
                >
                  {isSubmittingAnnounce ? 'Broadcasting...' : 'Broadcast Bulletin 📢'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
