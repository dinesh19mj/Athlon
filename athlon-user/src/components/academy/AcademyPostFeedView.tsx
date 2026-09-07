'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Heart,
  MessageCircle,
  Eye,
  Pin,
  Share2,
  Trash2,
  Edit3,
  X,
  Play,
  Check,
  Loader2,
  Building2,
  Layers,
  Calendar,
  User,
  Filter,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Flame,
  Award,
  BookOpen,
  Camera,
  Radio,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  ImagePlus,
} from 'lucide-react';
import {
  AcademyPost,
  AcademyPostComment,
  AcademyPostService,
  CreateAcademyPostPayload,
  UpdateAcademyPostPayload,
} from '@/lib/api/academyPost';
import { AcademyService, AcademyCentre, AcademyBatchItem } from '@/lib/api/academy';
import { useOrgRole } from '@/hooks/use-org-role';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface AcademyPostFeedViewProps {
  orgUuid: string;
  orgName: string;
}

const POST_TYPES = [
  { id: 'ALL', label: 'All Content', icon: Sparkles },
  { id: 'BLOG', label: 'Articles & Blogs', icon: FileText },
  { id: 'VIDEO', label: 'YouTube Drills', icon: Video },
  { id: 'GALLERY', label: 'Photo Gallery', icon: ImageIcon },
  { id: 'ANNOUNCEMENT', label: 'Notices', icon: Radio },
];

const CATEGORIES = [
  'General',
  'Drills & Tactics',
  'Footwork & Fitness',
  'Match Analysis',
  'Nutrition & Recovery',
  'Tournament Highlights',
  'Academy Events',
];

export default function AcademyPostFeedView({ orgUuid, orgName }: AcademyPostFeedViewProps) {
  const { userUuid, userEmail } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();
  const { role, isAdmin, isCoach } = useOrgRole(orgUuid);
  const { canManageModule } = usePermissions(orgUuid);
  const canManage = canManageModule('posts');

  const isOwnerOrAdmin = isAdmin || role === 'ADMIN' || role === 'OWNER' || role === 'MANAGER';
  const isCoachOrStaff = isCoach || role === 'COACH' || role === 'STAFF';
  const isStudent = !isOwnerOrAdmin && !isCoachOrStaff;
  const canCreate = isOwnerOrAdmin || isCoachOrStaff || isStudent || canManage;

  const [posts, setPosts] = useState<AcademyPost[]>([]);
  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [batches, setBatches] = useState<AcademyBatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedScope, setSelectedScope] = useState<string>('ALL');
  const [selectedBatchUuid, setSelectedBatchUuid] = useState<string>('ALL');
  const [selectedCentreUuid, setSelectedCentreUuid] = useState<string>('ALL');
  const [selectedApprovalFilter, setSelectedApprovalFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeLightboxImages, setActiveLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Active Post for Full Detail View Page / Modal
  const [selectedPostDetail, setSelectedPostDetail] = useState<AcademyPost | null>(null);
  const [detailComments, setDetailComments] = useState<AcademyPostComment[]>([]);
  const [detailCommentText, setDetailCommentText] = useState('');
  const [submittingDetailComment, setSubmittingDetailComment] = useState(false);

  // Active Post for Comments
  const [activeCommentPost, setActiveCommentPost] = useState<AcademyPost | null>(null);
  const [comments, setComments] = useState<AcademyPostComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Create Form State
  const [formType, setFormType] = useState<'BLOG' | 'VIDEO' | 'GALLERY' | 'ANNOUNCEMENT'>('BLOG');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formCoverImageUrl, setFormCoverImageUrl] = useState('');
  const [formMediaUrls, setFormMediaUrls] = useState('');
  const [formTargetScope, setFormTargetScope] = useState<'ALL' | 'CENTRE' | 'BATCH'>('ALL');
  const [formCentreUuid, setFormCentreUuid] = useState('');
  const [formBatchUuid, setFormBatchUuid] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formTags, setFormTags] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // When opening create modal, if user is a student, ensure formType is locked to BLOG
  const handleOpenCreateModal = () => {
    if (isStudent) {
      setFormType('BLOG');
    }
    setIsCreateModalOpen(true);
  };

  const handleApprovePost = async (postUuid: string) => {
    try {
      const approverName = personalProfile?.name || userEmail?.split('@')[0] || 'Academy Admin';
      await AcademyPostService.approvePost(postUuid, approverName);
      setPosts((prev) =>
        prev.map((p) =>
          p.postUuid === postUuid
            ? { ...p, approvalStatus: 'APPROVED', approvedByName: approverName }
            : p
        )
      );
      if (selectedPostDetail && selectedPostDetail.postUuid === postUuid) {
        setSelectedPostDetail((prev) => (prev ? { ...prev, approvalStatus: 'APPROVED', approvedByName: approverName } : null));
      }
      showToast('Post approved and published to Academy Feed! 🎉');
    } catch (err: any) {
      showToast(err?.message || 'Failed to approve post');
    }
  };

  const handleRejectPost = async (postUuid: string) => {
    const reason = window.prompt('Please enter reason for rejection (optional):') || 'Post does not meet guidelines';
    try {
      const approverName = personalProfile?.name || userEmail?.split('@')[0] || 'Academy Admin';
      await AcademyPostService.rejectPost(postUuid, reason, approverName);
      setPosts((prev) =>
        prev.map((p) =>
          p.postUuid === postUuid
            ? { ...p, approvalStatus: 'REJECTED', rejectionReason: reason, approvedByName: approverName }
            : p
        )
      );
      if (selectedPostDetail && selectedPostDetail.postUuid === postUuid) {
        setSelectedPostDetail((prev) => (prev ? { ...prev, approvalStatus: 'REJECTED', rejectionReason: reason } : null));
      }
      showToast('Post marked as rejected');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reject post');
    }
  };

  // File Upload State (Multipart Images from Device)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const mobileCoverFileInputRef = useRef<HTMLInputElement>(null);
  const mobileGalleryFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleRemoveCover = () => {
    if (coverPreview && coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(null);
    setCoverPreview(null);
    setFormCoverImageUrl('');
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    if (mobileCoverFileInputRef.current) mobileCoverFileInputRef.current.value = '';
  };

  const handleGalleryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newUrls = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  const handleRemoveGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => {
      const url = prev[index];
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Load Posts & Metadata
  const loadPosts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await AcademyPostService.getPosts(
        orgUuid,
        selectedType,
        selectedScope,
        selectedBatchUuid,
        selectedCentreUuid,
        searchTerm,
        selectedApprovalFilter !== 'ALL' ? selectedApprovalFilter : undefined
      );
      setPosts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orgUuid) {
      loadPosts();
    }
  }, [orgUuid, selectedType, selectedScope, selectedBatchUuid, selectedCentreUuid, selectedApprovalFilter]);

  // Load Academy Centres & Batches for scoping selector
  useEffect(() => {
    if (!orgUuid) return;
    const fetchMetadata = async () => {
      try {
        const [centresRes, batchesRes] = await Promise.allSettled([
          AcademyService.getCentres(orgUuid),
          AcademyService.getBatches(orgUuid),
        ]);
        if (centresRes.status === 'fulfilled' && centresRes.value) {
          setCentres(centresRes.value);
        }
        if (batchesRes.status === 'fulfilled' && batchesRes.value) {
          setBatches(batchesRes.value);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    fetchMetadata();
  }, [orgUuid]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Please enter both title and content');
      return;
    }

    setSubmittingPost(true);
    try {
      const selectedCentre = centres.find((c) => c.centreUuid === formCentreUuid);
      const selectedBatch = batches.find((b) => b.batchUuid === formBatchUuid);

      const userRole = isOwnerOrAdmin ? 'ADMIN' : isCoach ? 'COACH' : role === 'STAFF' ? 'STAFF' : 'STUDENT';
      const authorName =
        personalProfile?.name ||
        userEmail?.split('@')[0] ||
        (isOwnerOrAdmin ? 'Academy Admin' : isCoach ? 'Coach' : 'Athlete');

      // Students are strictly restricted to BLOG only
      const actualPostType = isStudent ? 'BLOG' : formType;

      const payload: CreateAcademyPostPayload = {
        organizationUuid: orgUuid,
        title: formTitle.trim(),
        content: formContent.trim(),
        postType: actualPostType,
        youtubeVideoUrl: (!isStudent && actualPostType === 'VIDEO') ? formYoutubeUrl.trim() : undefined,
        coverImageUrl: formCoverImageUrl.trim() || undefined,
        mediaUrls: (!isStudent && actualPostType === 'GALLERY') ? formMediaUrls.trim() : undefined,
        targetScope: formTargetScope,
        centreUuid: formTargetScope === 'CENTRE' ? formCentreUuid : undefined,
        centreName: formTargetScope === 'CENTRE' ? selectedCentre?.name : undefined,
        batchUuid: formTargetScope === 'BATCH' ? formBatchUuid : undefined,
        batchName: formTargetScope === 'BATCH' ? selectedBatch?.batchName : undefined,
        category: formCategory,
        tags: formTags.trim() || undefined,
        authorName,
        authorRole: userRole,
      };

      if (!isStudent && (coverFile || galleryFiles.length > 0)) {
        await AcademyPostService.createPostMultipart(payload, coverFile, galleryFiles);
      } else if (isStudent && coverFile) {
        await AcademyPostService.createPostMultipart(payload, coverFile, []);
      } else {
        await AcademyPostService.createPost(payload);
      }

      if (isOwnerOrAdmin) {
        showToast('Content published to Academy Feed! 🚀');
      } else {
        showToast('Post submitted! Awaiting Admin approval before appearing on feed. ⏳');
      }
      setIsCreateModalOpen(false);

      // Reset Form
      setFormTitle('');
      setFormContent('');
      setFormYoutubeUrl('');
      setFormCoverImageUrl('');
      setFormMediaUrls('');
      setFormTargetScope('ALL');
      setFormBatchUuid('');
      setFormCentreUuid('');
      setFormCategory('General');
      setFormTags('');
      handleRemoveCover();
      setGalleryFiles([]);
      galleryPreviews.forEach((u) => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
      setGalleryPreviews([]);

      loadPosts(true);
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish content');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleLike = async (post: AcademyPost) => {
    try {
      const liked = await AcademyPostService.toggleLike(post.postUuid);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.postUuid === post.postUuid) {
            return {
              ...p,
              isLikedByCurrentUser: liked,
              likesCount: Math.max(0, p.likesCount + (liked ? 1 : -1)),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleOpenComments = async (post: AcademyPost) => {
    setActiveCommentPost(post);
    setIsCommentsDrawerOpen(true);
    try {
      const list = await AcademyPostService.getComments(post.postUuid);
      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentPost || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const authorRole = isAdmin ? 'ADMIN' : isCoach ? 'COACH' : 'STUDENT';
      const authorName = personalProfile?.name || userEmail?.split('@')[0] || 'Member';

      const comment = await AcademyPostService.addComment({
        postUuid: activeCommentPost.postUuid,
        commentText: newCommentText.trim(),
        authorName,
        authorRole,
      });

      setComments((prev) => [...prev, comment]);
      setNewCommentText('');

      // Increment comments count on post
      setPosts((prev) =>
        prev.map((p) =>
          p.postUuid === activeCommentPost.postUuid ? { ...p, commentsCount: p.commentsCount + 1 } : p
        )
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async (postUuid: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await AcademyPostService.deletePost(postUuid);
      showToast('Post removed');
      setPosts((prev) => prev.filter((p) => p.postUuid !== postUuid));
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete post');
    }
  };

  const handleOpenDetail = async (post: AcademyPost) => {
    setSelectedPostDetail(post);
    setDetailCommentText('');
    try {
      const [freshPost, commentsList] = await Promise.allSettled([
        AcademyPostService.getPostByUuid(post.postUuid),
        AcademyPostService.getComments(post.postUuid),
      ]);
      if (freshPost.status === 'fulfilled' && freshPost.value) {
        const fp = freshPost.value;
        setSelectedPostDetail(fp);
        setPosts((prev) =>
          prev.map((p) => (p.postUuid === post.postUuid ? { ...p, viewsCount: fp.viewsCount } : p))
        );
      }
      if (commentsList.status === 'fulfilled' && commentsList.value) {
        setDetailComments(Array.isArray(commentsList.value) ? commentsList.value : []);
      }
    } catch (err) {
      console.error('Failed to load post details:', err);
    }
  };

  const handleAddDetailComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostDetail || !detailCommentText.trim()) return;

    setSubmittingDetailComment(true);
    try {
      const userRole = isAdmin ? 'ADMIN' : isCoach ? 'COACH' : 'STUDENT';
      const authorName =
        personalProfile?.name ||
        userEmail?.split('@')[0] ||
        (isAdmin ? 'Academy Admin' : isCoach ? 'Coach' : 'Athlete');

      const comment = await AcademyPostService.addComment({
        postUuid: selectedPostDetail.postUuid,
        commentText: detailCommentText.trim(),
        authorName,
        authorRole: userRole,
      });

      setDetailComments((prev) => [...prev, comment]);
      setDetailCommentText('');

      // Increment comments count
      setSelectedPostDetail((prev) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null));
      setPosts((prev) =>
        prev.map((p) =>
          p.postUuid === selectedPostDetail.postUuid ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
      showToast('Comment posted!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to post comment');
    } finally {
      setSubmittingDetailComment(false);
    }
  };

  const handleSharePost = (post: AcademyPost) => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.content ? post.content.slice(0, 100) : '',
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      }
    }
  };

  const handleTogglePin = async (postUuid: string) => {
    try {
      const updated = await AcademyPostService.togglePin(postUuid);
      setPosts((prev) => prev.map((p) => (p.postUuid === postUuid ? { ...p, isPinned: updated.isPinned } : p)));
      showToast(updated.isPinned ? 'Post pinned to top' : 'Post unpinned');
    } catch (err: any) {
      showToast(err?.message || 'Failed to pin post');
    }
  };

  const filteredPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.authorName && p.authorName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.tags && p.tags.toLowerCase().includes(q))
    );
  }, [posts, searchTerm]);

  // Statistics for mobile HUD
  const stats = useMemo(() => {
    const total = posts.length;
    const videos = posts.filter((p) => p.postType === 'VIDEO').length;
    const blogs = posts.filter((p) => p.postType === 'BLOG').length;
    const galleries = posts.filter((p) => p.postType === 'GALLERY').length;
    return { total, videos, blogs, galleries };
  }, [posts]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-card border border-primary/40 shadow-2xl text-foreground font-semibold text-xs tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW: SLEEK, MODERN FEED & GALLERY HERO HUD                     */}
      {/* ========================================================================= */}
      <div className="block md:hidden p-3.5 space-y-4 animate-in fade-in duration-300">
        {/* Mobile Top App Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-lg shadow-inner shrink-0">
              📰
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-foreground tracking-tight truncate">
                  Media &amp; Drills
                </h1>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              </div>
              <p className="text-[11px] font-semibold text-foreground/50 truncate">
                {orgName} • {posts.length} posts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => loadPosts(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface border border-foreground/10 text-foreground/70 active:scale-95 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tactical Hero HUD Card */}
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-surface via-surface to-primary/5 border border-foreground/10 p-4 shadow-sm space-y-3.5">
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          {/* Top Info Strip */}
          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="w-3 h-3" />
              Academy Hub
            </span>
            <span className="text-[11px] font-black text-foreground/60 font-mono">
              Coaches &amp; Athletes
            </span>
          </div>

          {/* Big Number Counter */}
          <div className="relative flex items-baseline justify-between gap-2">
            <div>
              <div className="text-3xl font-black text-primary tracking-tight font-mono">
                {stats.total}
              </div>
              <div className="text-xs font-bold text-foreground/60 mt-0.5">
                Published Drills, Blogs &amp; Galleries
              </div>
            </div>
          </div>

          {/* 3-Pill Stat Toggles */}
          <div className="relative grid grid-cols-3 gap-2 pt-1 border-t border-foreground/10">
            <button
              onClick={() => setSelectedType(selectedType === 'VIDEO' ? 'ALL' : 'VIDEO')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedType === 'VIDEO'
                  ? 'bg-red-500/20 border-red-500/40 ring-2 ring-red-500/30'
                  : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-1">
                <Video className="w-3 h-3" /> Drills
              </div>
              <div className="text-base font-black text-red-500 dark:text-red-400 mt-0.5">
                {stats.videos}
              </div>
            </button>

            <button
              onClick={() => setSelectedType(selectedType === 'BLOG' ? 'ALL' : 'BLOG')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedType === 'BLOG'
                  ? 'bg-emerald-500/20 border-emerald-500/40 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Articles
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.blogs}
              </div>
            </button>

            <button
              onClick={() => setSelectedType(selectedType === 'GALLERY' ? 'ALL' : 'GALLERY')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedType === 'GALLERY'
                  ? 'bg-blue-500/20 border-blue-500/40 ring-2 ring-blue-500/30'
                  : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Photos
              </div>
              <div className="text-base font-black text-blue-500 dark:text-blue-400 mt-0.5">
                {stats.galleries}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search & Scope Filter Row */}
        <div className="space-y-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search drills, articles, coaches, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-foreground/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Scrolling Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {isOwnerOrAdmin && (
              <button
                onClick={() => setSelectedApprovalFilter(selectedApprovalFilter === 'PENDING_APPROVAL' ? 'ALL' : 'PENDING_APPROVAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedApprovalFilter === 'PENDING_APPROVAL'
                    ? 'bg-amber-500 text-black border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:bg-amber-500/20'
                }`}
              >
                <span>⏳ Approvals</span>
                {posts.filter((p) => p.approvalStatus === 'PENDING_APPROVAL').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-mono">
                    {posts.filter((p) => p.approvalStatus === 'PENDING_APPROVAL').length}
                  </span>
                )}
              </button>
            )}

            {POST_TYPES.map((t) => {
              const isSelected = selectedType === t.id && selectedApprovalFilter === 'ALL';
              const IconComp = t.icon;
              return (
                <button
                  key={`mob-tab-${t.id}`}
                  onClick={() => {
                    setSelectedType(t.id);
                    setSelectedApprovalFilter('ALL');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary text-black border-primary/30 shadow-sm'
                      : 'bg-surface border-foreground/5 text-foreground/60'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Centre & Batch Scope Pills */}
          {(batches.length > 0 || centres.length > 0) && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {batches.length > 0 && (
                <select
                  value={selectedBatchUuid}
                  onChange={(e) => setSelectedBatchUuid(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-foreground/10 text-xs font-bold text-foreground/80 focus:outline-none focus:border-primary shrink-0"
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.batchUuid} value={b.batchUuid}>
                      Batch: {b.batchName}
                    </option>
                  ))}
                </select>
              )}

              {centres.length > 0 && (
                <select
                  value={selectedCentreUuid}
                  onChange={(e) => setSelectedCentreUuid(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-foreground/10 text-xs font-bold text-foreground/80 focus:outline-none focus:border-primary shrink-0"
                >
                  <option value="ALL">All Campuses</option>
                  {centres.map((c) => (
                    <option key={c.centreUuid} value={c.centreUuid}>
                      Campus: {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Mobile Feed Cards Stream */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-3xl bg-surface border border-foreground/5 animate-pulse space-y-3">
                  <div className="h-44 bg-foreground/10 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-foreground/10 rounded-md w-3/4" />
                    <div className="h-3 bg-foreground/5 rounded-md w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-3.5 bg-surface border border-foreground/5 rounded-[26px]">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-2xl">
                🏸
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">No Media Posts Found</h3>
                <p className="text-xs text-foreground/50 max-w-xs mx-auto mt-1">
                  Share sports articles, training YouTube drills, or photo galleries with your academy.
                </p>
              </div>
              {canCreate && (
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> {isStudent ? 'Write First Article' : 'Publish First Post'}
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isVideo = post.postType === 'VIDEO';
              const isGallery = post.postType === 'GALLERY';
              const galleryImages = post.mediaUrls
                ? post.mediaUrls
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
              const isPending = post.approvalStatus === 'PENDING_APPROVAL';
              const isRejected = post.approvalStatus === 'REJECTED';

              return (
                <div
                  key={`mob-card-${post.postUuid}`}
                  className={`rounded-[26px] bg-surface border border-foreground/10 shadow-sm overflow-hidden space-y-3 relative ${
                    isPending ? 'border-amber-500/40 bg-amber-500/[0.02]' : isRejected ? 'border-rose-500/40 opacity-75' : post.isPinned ? 'ring-1 ring-primary/40' : ''
                  }`}
                >
                  {/* Pin & Status Tags */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {isPending && (
                      <div className="px-2.5 py-1 rounded-full bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                        ⏳ Pending Approval
                      </div>
                    )}
                    {isRejected && (
                      <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                        ❌ Rejected
                      </div>
                    )}
                    {post.isPinned && (
                      <div className="px-2.5 py-1 rounded-full bg-primary text-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Pin className="w-3 h-3" /> Pinned
                      </div>
                    )}
                  </div>

                  {/* Media Banner */}
                  {isVideo && (
                    <div
                      onClick={() => post.youtubeVideoId && setActiveVideoUrl(post.youtubeVideoId)}
                      className="relative h-52 bg-black cursor-pointer overflow-hidden flex items-center justify-center group"
                    >
                      {post.youtubeVideoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${post.youtubeVideoId}/hqdefault.jpg`}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center text-foreground/40">
                          <Video className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                          <Play className="w-7 h-7 ml-1" fill="white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-black text-red-400 flex items-center gap-1">
                        <Video className="w-3 h-3" /> YouTube Drill
                      </span>
                    </div>
                  )}

                  {isGallery && galleryImages.length > 0 && (
                    <div
                      onClick={() => {
                        setActiveLightboxImages(galleryImages);
                        setLightboxIndex(0);
                      }}
                      className="relative h-52 bg-slate-900 cursor-pointer overflow-hidden grid grid-cols-2 gap-0.5"
                    >
                      <img
                        src={galleryImages[0]}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {galleryImages.length > 1 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={galleryImages[1]}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                          {galleryImages.length > 2 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm">
                              +{galleryImages.length - 2} More
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-surface flex items-center justify-center text-foreground/40">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  )}

                  {!isVideo && !isGallery && post.coverImageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Body Content (Clickable to open full detail view) */}
                  <div className="p-4 space-y-2.5">
                    {/* Tags / Scope Strip with View Icon Above */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                          {post.postType}
                        </span>
                        {post.category && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-foreground/60 bg-background border border-foreground/10">
                            {post.category}
                          </span>
                        )}
                        {post.batchName && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" /> {post.batchName}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(post);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-[10px] font-black flex items-center gap-1 active:scale-90 transition-all shrink-0 shadow-xs"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>

                    <div onClick={() => handleOpenDetail(post)} className="cursor-pointer space-y-1.5 group">
                      <h3 className="text-sm font-black text-foreground leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Admin Moderation Strip for Pending Posts on Mobile */}
                    {isOwnerOrAdmin && isPending && (
                      <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                        <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                          <span>Review Submission</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprovePost(post.postUuid)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                          >
                            <Check className="w-3 h-3 stroke-[3]" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPost(post.postUuid)}
                            className="px-2.5 py-1 rounded-xl bg-rose-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Author & Footer Actions */}
                    <div className="pt-2 border-t border-foreground/10 flex items-center justify-between">
                      <div
                        onClick={() => handleOpenDetail(post)}
                        className="flex items-center gap-2 min-w-0 cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary font-black text-[11px] flex items-center justify-center shrink-0">
                          {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-black text-foreground truncate flex items-center gap-1">
                            <span>{post.authorName}</span>
                            <span className="text-[8px] font-bold uppercase text-foreground/40 px-1 rounded bg-foreground/5">
                              {post.authorRole}
                            </span>
                          </div>
                          <div className="text-[9px] text-foreground/40">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleLike(post)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all active:scale-90 ${
                            post.isLikedByCurrentUser
                              ? 'bg-red-500/15 text-red-500 border-red-500/30'
                              : 'bg-background border-foreground/10 text-foreground/60'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                          <span>{post.likesCount || 0}</span>
                        </button>

                        <button
                          onClick={() => handleOpenComments(post)}
                          className="px-2.5 py-1.5 rounded-xl bg-background border border-foreground/10 text-foreground/60 text-xs font-bold flex items-center gap-1 active:scale-90"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.commentsCount || 0}</span>
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleTogglePin(post.postUuid)}
                              className={`p-1.5 rounded-xl border ${
                                post.isPinned
                                  ? 'bg-primary/20 text-primary border-primary/30'
                                  : 'bg-background border-foreground/10 text-foreground/40'
                              }`}
                              title="Pin"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.postUuid)}
                              className="p-1.5 rounded-xl bg-background border border-foreground/10 text-foreground/40 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Action Button (FAB) on Mobile */}
        {canCreate && (
          <div className="fixed bottom-24 right-4 z-40">
            <button
              onClick={handleOpenCreateModal}
              className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl shadow-primary/50 hover:scale-105 active:scale-90 transition-all border border-black/10 group"
              title={isStudent ? 'Write an Article / Blog' : 'Create Post'}
            >
              <Plus className="w-7 h-7 stroke-[3] transition-transform group-hover:rotate-90 duration-200" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP VIEW (100% UNTOUCHED ORIGINAL LAYOUT FOR DESKTOP SCREENS)      */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        {/* Header Banner */}
        <div className="relative overflow-hidden border-b bg-card/60 backdrop-blur-xl" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                      Academy Feed &amp; Gallery
                    </h1>
                    <p className="text-xs text-foreground/50 font-medium">
                      Sports articles, YouTube training drill videos &amp; photo gallery for {orgName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => loadPosts(true)}
                  disabled={refreshing}
                  className="p-2.5 rounded-xl border flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Refresh Feed"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                </button>

                {canCreate && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isStudent ? 'Write Article / Blog' : 'Create Post / Video'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Post Type Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 hide-scrollbar">
              {isOwnerOrAdmin && (
                <button
                  onClick={() => setSelectedApprovalFilter(selectedApprovalFilter === 'PENDING_APPROVAL' ? 'ALL' : 'PENDING_APPROVAL')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 border ${
                    selectedApprovalFilter === 'PENDING_APPROVAL'
                      ? 'bg-amber-500 text-black border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:bg-amber-500/20'
                  }`}
                >
                  <span>⏳ Approvals Queue</span>
                  {posts.filter((p) => p.approvalStatus === 'PENDING_APPROVAL').length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold">
                      {posts.filter((p) => p.approvalStatus === 'PENDING_APPROVAL').length}
                    </span>
                  )}
                </button>
              )}

              {POST_TYPES.map((t) => {
                const isSelected = selectedType === t.id && selectedApprovalFilter === 'ALL';
                const IconComp = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedType(t.id);
                      setSelectedApprovalFilter('ALL');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-card text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                    style={{ borderColor: isSelected ? 'transparent' : 'var(--athlon-border)' }}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Search & Scope Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles, YouTube videos, drills, author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card/50 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
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

            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {batches.length > 0 && (
                <select
                  value={selectedBatchUuid}
                  onChange={(e) => setSelectedBatchUuid(e.target.value)}
                  className="px-3 py-2 rounded-xl border bg-card text-xs font-bold text-foreground/80 focus:outline-none focus:border-primary shrink-0"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.batchUuid} value={b.batchUuid}>
                      Batch: {b.batchName}
                    </option>
                  ))}
                </select>
              )}

              {centres.length > 0 && (
                <select
                  value={selectedCentreUuid}
                  onChange={(e) => setSelectedCentreUuid(e.target.value)}
                  className="px-3 py-2 rounded-xl border bg-card text-xs font-bold text-foreground/80 focus:outline-none focus:border-primary shrink-0"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="ALL">All Campuses</option>
                  {centres.map((c) => (
                    <option key={c.centreUuid} value={c.centreUuid}>
                      Campus: {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Desktop Post Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-foreground/50 font-semibold">Loading academy media &amp; blogs...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div
              className="py-16 px-4 rounded-3xl border bg-card/30 text-center flex flex-col items-center justify-center gap-3.5"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">No Academy Posts Yet</h3>
                <p className="text-xs text-foreground/50 max-w-sm mx-auto mt-1">
                  Share the first sports tutorial, training drill video, or tournament photo gallery for your academy athletes.
                </p>
              </div>
              {canCreate && (
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isStudent ? 'Write First Article' : 'Publish First Post'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => {
                const isVideo = post.postType === 'VIDEO';
                const isGallery = post.postType === 'GALLERY';
                const galleryImages = post.mediaUrls
                  ? post.mediaUrls
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];
                const isPending = post.approvalStatus === 'PENDING_APPROVAL';
                const isRejected = post.approvalStatus === 'REJECTED';

                return (
                  <div
                    key={post.postUuid}
                    className={`rounded-[28px] border bg-card/70 flex flex-col justify-between overflow-hidden shadow-lg transition-all group relative hover:border-primary/40 ${
                      isPending ? 'border-amber-500/40 bg-amber-500/[0.02]' : isRejected ? 'border-rose-500/40 opacity-75' : post.isPinned ? 'ring-1 ring-primary/40' : ''
                    }`}
                    style={{ borderColor: isPending ? undefined : isRejected ? undefined : 'var(--athlon-border)' }}
                  >
                    {/* Status & Pin Badges */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      {isPending && (
                        <div className="px-2.5 py-1 rounded-full bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                          ⏳ Pending Approval
                        </div>
                      )}
                      {isRejected && (
                        <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                          ❌ Rejected
                        </div>
                      )}
                      {post.isPinned && (
                        <div className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Pin className="w-3 h-3" /> Pinned
                        </div>
                      )}
                    </div>

                    <div>
                      {isVideo && (
                        <div
                          onClick={() => post.youtubeVideoId && setActiveVideoUrl(post.youtubeVideoId)}
                          className="relative h-48 bg-slate-900 cursor-pointer overflow-hidden group/thumb flex items-center justify-center"
                        >
                          {post.youtubeVideoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${post.youtubeVideoId}/hqdefault.jpg`}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-950 flex items-center justify-center text-foreground/40">
                              <Video className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/25 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover/thumb:scale-110 transition-transform">
                              <Play className="w-6 h-6 ml-0.5" fill="white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {isGallery && galleryImages.length > 0 && (
                        <div
                          onClick={() => {
                            setActiveLightboxImages(galleryImages);
                            setLightboxIndex(0);
                          }}
                          className="relative h-48 bg-slate-900 cursor-pointer overflow-hidden grid grid-cols-2 gap-0.5 group/gallery"
                        >
                          <img
                            src={galleryImages[0]}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover/gallery:scale-105 transition-transform"
                          />
                          {galleryImages.length > 1 ? (
                            <div className="relative w-full h-full">
                              <img
                                src={galleryImages[1]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                              {galleryImages.length > 2 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm">
                                  +{galleryImages.length - 2} More
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-surface flex items-center justify-center text-foreground/40">
                              <Camera className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      )}

                      {!isVideo && !isGallery && post.coverImageUrl && (
                        <div className="h-44 overflow-hidden">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div
                        onClick={() => handleOpenDetail(post)}
                        className="p-5 space-y-3 cursor-pointer group/content"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {post.postType}
                            </span>
                            {post.category && (
                              <span
                                className="px-2 py-0.5 rounded-md text-[9px] font-bold text-foreground/60 bg-surface border"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                {post.category}
                              </span>
                            )}
                            {post.batchName && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                                <Layers className="w-2.5 h-2.5" /> {post.batchName}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(post);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all shrink-0"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>

                        <h3 className="font-extrabold text-base text-foreground line-clamp-2 leading-snug group-hover/content:text-primary transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-xs text-foreground/60 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    {/* Admin Moderation Bar for Pending Approvals */}
                    {isOwnerOrAdmin && isPending && (
                      <div className="p-3 mx-4 mb-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                        <div className="text-[11px] font-bold text-amber-500">
                          Pending Admin Verification
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprovePost(post.postUuid)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve &amp; Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPost(post.postUuid)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-md active:scale-95 transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                    <div
                      className="p-5 pt-3 border-t flex items-center justify-between"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div
                        onClick={() => handleOpenDetail(post)}
                        className="flex items-center gap-2 min-w-0 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                            <span>{post.authorName || 'Coach'}</span>
                            <span className="text-[8px] font-bold uppercase text-foreground/40 px-1 rounded bg-foreground/5">
                              {post.authorRole}
                            </span>
                          </div>
                          <div className="text-[10px] text-foreground/40">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLike(post)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                            post.isLikedByCurrentUser
                              ? 'bg-red-500/15 text-red-500 border-red-500/30'
                              : 'bg-card text-foreground/60 hover:text-foreground'
                          }`}
                          style={{
                            borderColor: post.isLikedByCurrentUser ? undefined : 'var(--athlon-border)',
                          }}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                          <span>{post.likesCount || 0}</span>
                        </button>

                        <button
                          onClick={() => handleOpenComments(post)}
                          className="px-3 py-1.5 rounded-xl border bg-card text-foreground/60 hover:text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.commentsCount || 0}</span>
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleTogglePin(post.postUuid)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                post.isPinned
                                  ? 'bg-primary/20 text-primary border-primary/30'
                                  : 'text-foreground/40 hover:text-foreground'
                              }`}
                              style={{
                                borderColor: post.isPinned ? undefined : 'var(--athlon-border)',
                              }}
                              title={post.isPinned ? 'Unpin' : 'Pin to top'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.postUuid)}
                              className="p-1.5 rounded-lg text-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW: REDESIGNED FULL-SCREEN / BOTTOM-SHEET PUBLISH FORM        */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="block md:hidden fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
          <div className="min-h-full flex flex-col justify-between p-4 pb-12 space-y-4">
            {/* Top Bar with Drag Handle & Close */}
            <div className="space-y-3 pt-2">
              <div className="w-12 h-1.5 rounded-full bg-foreground/20 mx-auto" />
              
              <div className="flex items-center justify-between pb-3 border-b border-foreground/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/15 to-transparent border border-primary/30 flex items-center justify-center text-sm shadow-inner text-primary">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground tracking-tight">
                      Publish to Academy Feed
                    </h3>
                    <p className="text-[11px] font-semibold text-foreground/50">
                      Share drills, blogs, tips or tournament photos
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Form Fields */}
            <form onSubmit={handleCreatePost} className="space-y-4 flex-1">
              {/* 1. Visual Post Format Selector */}
              {isStudent ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
                    📝
                  </div>
                  <div>
                    <div className="text-xs font-black text-foreground">Student Blog Submission</div>
                    <div className="text-[10px] text-foreground/60 leading-tight">
                      Share your tournament experiences, fitness notes and badminton tips. Submissions will be verified by academy admins before publication.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                    <span>1. Choose Content Type</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('BLOG')}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        formType === 'BLOG'
                          ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-surface border-foreground/10 text-foreground/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
                          📝
                        </div>
                        {formType === 'BLOG' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-black text-foreground">Article / Blog</div>
                        <div className="text-[10px] text-foreground/50">Tactics, fitness &amp; tips</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('VIDEO')}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        formType === 'VIDEO'
                          ? 'bg-red-500/15 border-red-500 ring-2 ring-red-500/30'
                          : 'bg-surface border-foreground/10 text-foreground/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-base">
                          🎥
                        </div>
                        {formType === 'VIDEO' && (
                          <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-black text-foreground">YouTube Drill</div>
                        <div className="text-[10px] text-foreground/50">Drill videos &amp; shorts</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('GALLERY')}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        formType === 'GALLERY'
                          ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30'
                          : 'bg-surface border-foreground/10 text-foreground/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base">
                          📸
                        </div>
                        {formType === 'GALLERY' && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-black text-foreground">Photo Gallery</div>
                        <div className="text-[10px] text-foreground/50">Events &amp; tournament pics</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('ANNOUNCEMENT')}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        formType === 'ANNOUNCEMENT'
                          ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                          : 'bg-surface border-foreground/10 text-foreground/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                          📢
                        </div>
                        {formType === 'ANNOUNCEMENT' && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-black text-foreground">Notice &amp; Alert</div>
                        <div className="text-[10px] text-foreground/50">Academy announcements</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Post Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70 block">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master the Jump Smash: 3 Footwork Drills"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-foreground/15 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                />
              </div>

              {/* 3. Conditional YouTube / Media URL inputs (Hidden for Students) */}
              {!isStudent && formType === 'VIDEO' && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-400">
                    <Video className="w-4 h-4" />
                    <span>YouTube Video / Shorts Link *</span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-red-500/30 text-xs font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-foreground/50 font-medium">
                    Paste any YouTube URL or Shorts link — students can play it directly inside the app!
                  </p>
                </div>
              )}

              {/* 4. Photo Gallery Selector (Hidden for Students) */}
              {!isStudent && formType === 'GALLERY' && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-400">
                      <Camera className="w-4 h-4" />
                      <span>Upload Photos to Gallery</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      ref={mobileGalleryFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFilesSelect}
                      className="hidden"
                    />

                    {/* Chosen Previews Grid */}
                    {galleryPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {galleryPreviews.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border border-blue-500/30 group shadow-sm bg-black"
                          >
                            <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryFile(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow-md hover:scale-110 active:scale-95"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => mobileGalleryFileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 flex flex-col items-center justify-center gap-1 text-blue-400 hover:bg-blue-500/10 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-black">Add More</span>
                        </button>
                      </div>
                    )}

                    {galleryPreviews.length === 0 && (
                      <button
                        type="button"
                        onClick={() => mobileGalleryFileInputRef.current?.click()}
                        className="w-full py-5 rounded-2xl border-2 border-dashed border-blue-500/40 bg-background/50 hover:bg-blue-500/5 flex flex-col items-center justify-center gap-1.5 text-blue-400 active:scale-98 transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                          <ImagePlus className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xs font-black">Tap to Choose Photos from Device</span>
                        <span className="text-[10px] text-foreground/50 font-semibold">
                          Supports multi-selection (JPG, PNG, WebP)
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 5. Cover Image for Blog (Upload from Device) */}
              {formType === 'BLOG' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-surface border border-foreground/10">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70 block">
                    Cover Banner Image
                  </label>

                  <div>
                    <input
                      ref={mobileCoverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileSelect}
                      className="hidden"
                    />

                    {coverPreview ? (
                      <div className="relative h-32 rounded-2xl overflow-hidden border border-primary/30 shadow-sm bg-black group">
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-600/90 text-white font-black text-[10px] flex items-center gap-1 shadow-md hover:bg-red-700"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => mobileCoverFileInputRef.current?.click()}
                        className="w-full py-4 rounded-xl border-2 border-dashed border-foreground/15 bg-background/50 hover:bg-white/5 flex flex-col items-center justify-center gap-1 text-foreground/70 active:scale-98 transition-all"
                      >
                        <Upload className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-foreground">Choose Cover Photo</span>
                        <span className="text-[10px] text-foreground/40 font-medium">
                          JPG, PNG or WebP image
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 6. Content / Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70 block">
                  Content &amp; Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write sports coaching tips, drill descriptions, training schedule notes or tournament summary..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-foreground/15 text-xs text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed shadow-inner"
                />
              </div>

              {/* 7. Target Audience Scoping */}
              <div className="p-3.5 rounded-2xl bg-surface border border-foreground/10 space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                  <span>Target Audience Visibility</span>
                </label>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormTargetScope('ALL')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-black transition-all border ${
                      formTargetScope === 'ALL'
                        ? 'bg-primary text-black border-primary shadow-sm'
                        : 'bg-background text-foreground/60 border-foreground/10'
                    }`}
                  >
                    🌐 All Academy
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetScope('BATCH')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-black transition-all border ${
                      formTargetScope === 'BATCH'
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                        : 'bg-background text-foreground/60 border-foreground/10'
                    }`}
                  >
                    👥 Squad Batch
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetScope('CENTRE')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-black transition-all border ${
                      formTargetScope === 'CENTRE'
                        ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                        : 'bg-background text-foreground/60 border-foreground/10'
                    }`}
                  >
                    🏢 Campus
                  </button>
                </div>

                {formTargetScope === 'BATCH' && (
                  <div className="pt-1">
                    <select
                      value={formBatchUuid}
                      onChange={(e) => setFormBatchUuid(e.target.value)}
                      required={formTargetScope === 'BATCH'}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-indigo-500/40 text-xs font-bold text-foreground focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Choose Coaching Batch Squad...</option>
                      {batches.map((b) => (
                        <option key={b.batchUuid} value={b.batchUuid}>
                          {b.batchName} ({b.level})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formTargetScope === 'CENTRE' && (
                  <div className="pt-1">
                    <select
                      value={formCentreUuid}
                      onChange={(e) => setFormCentreUuid(e.target.value)}
                      required={formTargetScope === 'CENTRE'}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-violet-500/40 text-xs font-bold text-foreground focus:outline-none focus:border-violet-500"
                    >
                      <option value="">Choose Academy Campus...</option>
                      {centres.map((c) => (
                        <option key={c.centreUuid} value={c.centreUuid}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 8. Category Selection Pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70 block">
                  Category Tag
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={`cat-pill-${cat}`}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all ${
                        formCategory === cat
                          ? 'bg-foreground text-background border-foreground font-black'
                          : 'bg-surface border-foreground/10 text-foreground/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticky Submit Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/3 py-3 rounded-2xl bg-surface border border-foreground/10 text-xs font-black text-foreground/70 hover:text-foreground active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="w-2/3 py-3 rounded-2xl bg-primary text-black font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingPost ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>Publish Content</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP VIEW: CREATE POST / VIDEO / GALLERY MODAL                      */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 hide-scrollbar"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <h3 className="text-base font-black text-foreground">Publish to Academy Feed</h3>
                <p className="text-xs text-foreground/50">Create an article, share a YouTube training video, or choose photos</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Type Switcher / Student Banner */}
              {isStudent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                    📝
                  </div>
                  <div>
                    <div className="text-xs font-black text-foreground">Student Blog Submission</div>
                    <div className="text-[11px] text-foreground/60 leading-relaxed">
                      Athletes and students can author badminton articles and training blogs. Once submitted, academy administrators will review and approve your post for the public feed.
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-2">
                    Post Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('BLOG')}
                      className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        formType === 'BLOG'
                          ? 'bg-primary/20 border-primary text-primary shadow-sm'
                          : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Article / Blog</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('VIDEO')}
                      className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        formType === 'VIDEO'
                          ? 'bg-red-500/20 border-red-500 text-red-400 shadow-sm'
                          : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>YouTube Drill</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('GALLERY')}
                      className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        formType === 'GALLERY'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-sm'
                          : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Photo Gallery</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master the Badminton Jump Smash: 3 Crucial Footwork Drills"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* YouTube Video Link Input (Hidden for Students) */}
              {!isStudent && formType === 'VIDEO' && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-1.5 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> YouTube Video URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-red-500"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              )}

              {/* Gallery Image Chooser / Upload (Hidden for Students) */}
              {!isStudent && formType === 'GALLERY' && (
                <div className="space-y-2 p-4 rounded-2xl border bg-blue-500/5 border-blue-500/25">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Photos from Computer (Multipart Upload)
                    </label>
                  </div>

                  <div>
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFilesSelect}
                      className="hidden"
                    />

                    {galleryPreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {galleryPreviews.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-blue-500/30 bg-black">
                            <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryFile(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-blue-500/30 bg-surface flex flex-col items-center justify-center gap-1 text-blue-400 hover:bg-blue-500/10 text-xs font-bold"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    )}

                    {galleryPreviews.length === 0 && (
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="w-full py-5 rounded-xl border-2 border-dashed border-blue-500/30 bg-surface flex flex-col items-center justify-center gap-1.5 text-blue-400 hover:bg-blue-500/10 transition-colors"
                      >
                        <ImagePlus className="w-6 h-6" />
                        <span className="text-xs font-black">Choose Photos from Your Computer</span>
                        <span className="text-[10px] text-foreground/40">Select multiple JPG, PNG, or WebP images</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Cover Image for Blog */}
              {formType === 'BLOG' && (
                <div className="space-y-2 p-3.5 rounded-2xl border bg-surface/40" style={{ borderColor: 'var(--athlon-border)' }}>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block">
                    Cover Banner Image
                  </label>

                  <div>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileSelect}
                      className="hidden"
                    />

                    {coverPreview ? (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-primary/30 bg-black">
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="w-full py-3.5 rounded-xl border-2 border-dashed border-foreground/15 bg-surface hover:bg-white/5 flex flex-col items-center justify-center gap-1 text-foreground/70"
                      >
                        <Upload className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">Select Cover Photo from Computer</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Content / Article Body */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Content &amp; Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write sports coaching tips, drill descriptions, training schedule notes or tournament summary..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary resize-none leading-relaxed"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Target Scoping: Entire Academy vs Specific Batch vs Specific Campus */}
              <div className="p-4 rounded-2xl border bg-surface/50 space-y-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <label className="text-[11px] font-black uppercase tracking-wider text-primary block">
                  Target Audience Visibility
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTargetScope('ALL')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      formTargetScope === 'ALL'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground/60 border-transparent hover:text-foreground'
                    }`}
                  >
                    Entire Academy
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetScope('BATCH')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      formTargetScope === 'BATCH'
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-card text-foreground/60 border-transparent hover:text-foreground'
                    }`}
                  >
                    Specific Batch
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetScope('CENTRE')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      formTargetScope === 'CENTRE'
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-card text-foreground/60 border-transparent hover:text-foreground'
                    }`}
                  >
                    Specific Campus
                  </button>
                </div>

                {formTargetScope === 'BATCH' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">
                      Select Coaching Batch
                    </label>
                    <select
                      value={formBatchUuid}
                      onChange={(e) => setFormBatchUuid(e.target.value)}
                      required={formTargetScope === 'BATCH'}
                      className="w-full px-3 py-2 rounded-xl border bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="">Choose batch squad...</option>
                      {batches.map((b) => (
                        <option key={b.batchUuid} value={b.batchUuid}>
                          {b.batchName} ({b.level})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formTargetScope === 'CENTRE' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">
                      Select Academy Campus
                    </label>
                    <select
                      value={formCentreUuid}
                      onChange={(e) => setFormCentreUuid(e.target.value)}
                      required={formTargetScope === 'CENTRE'}
                      className="w-full px-3 py-2 rounded-xl border bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="">Choose campus location...</option>
                      {centres.map((c) => (
                        <option key={c.centreUuid} value={c.centreUuid}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-surface text-xs text-foreground focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="smash, footwork, beginner"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Publish Content</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          YOUTUBE VIDEO PLAYER MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-3xl overflow-hidden bg-black shadow-2xl relative">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoUrl}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          📖 FULL POST DETAIL VIEW MODAL (MOBILE & DESKTOP)
         ══════════════════════════════════════════════════════════════════════ */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] bg-card md:rounded-[32px] border flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Header / Nav Bar */}
            <div
              className="p-4 sm:p-5 border-b flex items-center justify-between gap-3 bg-surface/80 backdrop-blur-sm shrink-0"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setSelectedPostDetail(null)}
                  className="p-2 rounded-xl border bg-background text-foreground/70 hover:text-foreground hover:bg-white/5 flex items-center gap-1.5 text-xs font-black transition-all active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <X className="w-4 h-4 md:hidden" />
                  <ChevronRight className="w-4 h-4 rotate-180 hidden md:block" />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                    {selectedPostDetail.postType}
                  </span>
                  {selectedPostDetail.approvalStatus === 'PENDING_APPROVAL' && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      ⏳ Pending Approval
                    </span>
                  )}
                  {selectedPostDetail.approvalStatus === 'REJECTED' && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ❌ Rejected
                    </span>
                  )}
                  {selectedPostDetail.category && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-foreground/70 bg-background border border-foreground/10">
                      {selectedPostDetail.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSharePost(selectedPostDetail)}
                  className="p-2 rounded-xl border bg-background text-foreground/70 hover:text-foreground active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {canManage && (
                  <>
                    <button
                      onClick={() => handleTogglePin(selectedPostDetail.postUuid)}
                      className={`p-2 rounded-xl border transition-colors ${
                        selectedPostDetail.isPinned
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-background text-foreground/50 hover:text-foreground'
                      }`}
                      style={{ borderColor: selectedPostDetail.isPinned ? undefined : 'var(--athlon-border)' }}
                      title={selectedPostDetail.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        handleDeletePost(selectedPostDetail.postUuid);
                        setSelectedPostDetail(null);
                      }}
                      className="p-2 rounded-xl bg-background border border-foreground/10 text-foreground/40 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 hide-scrollbar">
              {/* Admin Moderation Strip in Detail View */}
              {isOwnerOrAdmin && selectedPostDetail.approvalStatus === 'PENDING_APPROVAL' && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⏳</span>
                    <div>
                      <div className="text-xs font-black text-amber-400">Review Required</div>
                      <div className="text-[11px] text-foreground/60">This post is awaiting admin approval before going live to athletes.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleApprovePost(selectedPostDetail.postUuid)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Approve &amp; Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectPost(selectedPostDetail.postUuid)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Note */}
              {selectedPostDetail.approvalStatus === 'REJECTED' && selectedPostDetail.rejectionReason && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 space-y-1">
                  <div className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Post Rejected
                  </div>
                  <div className="text-xs text-foreground/80">
                    Reason: {selectedPostDetail.rejectionReason}
                  </div>
                </div>
              )}

              {/* Media Section */}
              {selectedPostDetail.postType === 'VIDEO' && selectedPostDetail.youtubeVideoId && (
                <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden bg-black shadow-lg border border-red-500/20">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedPostDetail.youtubeVideoId}?autoplay=1&rel=0`}
                    title={selectedPostDetail.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
              )}

              {selectedPostDetail.postType === 'GALLERY' && selectedPostDetail.mediaUrls && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedPostDetail.mediaUrls
                      .split(',')
                      .map((u) => u.trim())
                      .filter(Boolean)
                      .map((imgUrl, idx, arr) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveLightboxImages(arr);
                            setLightboxIndex(idx);
                          }}
                          className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-blue-500/20 cursor-pointer group shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                  </div>
                  <p className="text-[11px] text-foreground/40 font-medium text-center">
                    Tap any photo to view in full screen
                  </p>
                </div>
              )}

              {selectedPostDetail.postType !== 'VIDEO' &&
                selectedPostDetail.postType !== 'GALLERY' &&
                selectedPostDetail.coverImageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-foreground/10 bg-black max-h-80 shadow-md">
                    <img
                      src={selectedPostDetail.coverImageUrl}
                      alt={selectedPostDetail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

              {/* Title & Scope Badges */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedPostDetail.batchName && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Batch: {selectedPostDetail.batchName}
                    </span>
                  )}
                  {selectedPostDetail.centreName && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Campus: {selectedPostDetail.centreName}
                    </span>
                  )}
                  {selectedPostDetail.targetScope === 'ALL' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                      🌐 All Academy
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                  {selectedPostDetail.title}
                </h1>
              </div>

              {/* Author & Meta Strip */}
              <div
                className="p-3.5 sm:p-4 rounded-2xl border bg-surface/60 flex items-center justify-between gap-3"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary font-black text-sm flex items-center justify-center shrink-0 shadow-inner">
                    {selectedPostDetail.authorName ? selectedPostDetail.authorName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-foreground truncate">
                        {selectedPostDetail.authorName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                        {selectedPostDetail.authorRole || 'Coach'}
                      </span>
                    </div>
                    <div className="text-[10px] text-foreground/50 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selectedPostDetail.createdAt
                          ? new Date(selectedPostDetail.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-primary" />
                        {selectedPostDetail.viewsCount || 1} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(selectedPostDetail)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                    selectedPostDetail.isLikedByCurrentUser
                      ? 'bg-red-500/15 text-red-500 border-red-500/30'
                      : 'bg-background border-foreground/10 text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      selectedPostDetail.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  <span>{selectedPostDetail.likesCount || 0}</span>
                </button>
              </div>

              {/* Tags */}
              {selectedPostDetail.tags && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedPostDetail.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold text-primary/80 bg-primary/5 border border-primary/15"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}

              {/* Full Description & Body Content */}
              <div
                className="p-4 sm:p-5 rounded-2xl border bg-surface/40 space-y-2"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">
                  Article &amp; Details
                </div>
                <div className="text-sm sm:text-base text-foreground/90 whitespace-pre-line leading-relaxed font-normal">
                  {selectedPostDetail.content}
                </div>
              </div>

              {/* Comments / Discussion Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span>Discussion ({detailComments.length})</span>
                  </h3>
                </div>

                {/* Comment Input Form */}
                <form onSubmit={handleAddDetailComment} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Write a comment, feedback or question..."
                      value={detailCommentText}
                      onChange={(e) => setDetailCommentText(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary shadow-inner"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                    <button
                      type="submit"
                      disabled={submittingDetailComment}
                      className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submittingDetailComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-2.5">
                  {detailComments.length === 0 ? (
                    <div className="p-6 text-center text-xs text-foreground/40 font-medium rounded-2xl border border-dashed border-foreground/10 bg-surface/20">
                      No comments yet. Be the first to share feedback or tips!
                    </div>
                  ) : (
                    detailComments.map((c) => (
                      <div
                        key={c.commentUuid || c.commentId}
                        className="p-3.5 rounded-2xl border bg-surface/60 space-y-1"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-foreground">{c.authorName}</span>
                            <span className="text-[9px] font-black uppercase text-primary px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                              {c.authorRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground/40 font-mono">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                          {c.commentText}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LIGHTBOX MODAL FOR GALLERY
         ══════════════════════════════════════════════════════════════════════ */}
      {activeLightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setActiveLightboxImages([])}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
            <img
              src={activeLightboxImages[lightboxIndex]}
              alt="Gallery Preview"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            {activeLightboxImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {activeLightboxImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      lightboxIndex === idx ? 'border-primary scale-110' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          COMMENTS DRAWER
         ══════════════════════════════════════════════════════════════════════ */}
      {isCommentsDrawerOpen && activeCommentPost && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full bg-card border-l p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                <div>
                  <span className="text-[10px] font-black uppercase text-primary tracking-wider">Discussion</span>
                  <h3 className="text-sm font-black text-foreground line-clamp-1">{activeCommentPost.title}</h3>
                </div>
                <button
                  onClick={() => setIsCommentsDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comment Thread List */}
              <div className="overflow-y-auto max-h-[calc(100vh-240px)] space-y-3 pr-1 hide-scrollbar">
                {comments.length === 0 ? (
                  <div className="text-center py-16 text-foreground/40 text-xs font-semibold">
                    No comments yet. Start the sports discussion!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.commentUuid || c.commentId}
                      className="p-3.5 rounded-2xl border bg-surface/60 space-y-1.5"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-foreground">{c.authorName}</span>
                          <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            {c.authorRole}
                          </span>
                        </div>
                        <span className="text-[9px] text-foreground/40 font-mono">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed">{c.commentText}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Add coach feedback or athlete question..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
