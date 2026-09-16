import { api, fetchClient } from './client';

export interface ClubPost {
  postId?: number;
  postUuid: string;
  organizationId?: number;
  organizationUuid: string;
  title: string;
  content: string;
  postType: 'BLOG' | 'VIDEO' | 'GALLERY' | 'ANNOUNCEMENT';
  mediaUrls?: string;
  coverImageUrl?: string;
  youtubeVideoUrl?: string;
  youtubeVideoId?: string;
  targetScope: 'ALL' | 'MEMBERS';
  category?: string;
  tags?: string;
  authorUserId?: number;
  authorUserUuid?: string;
  authorName: string;
  authorRole: 'ADMIN' | 'COACH' | 'MEMBER';
  authorAvatar?: string;
  isPinned?: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLikedByCurrentUser?: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  approvalStatus?: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClubPostComment {
  commentId?: number;
  commentUuid: string;
  postId?: number;
  postUuid: string;
  organizationUuid: string;
  authorUserId?: number;
  authorUserUuid: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  commentText: string;
  createdAt: string;
}

export interface CreateClubPostPayload {
  organizationUuid: string;
  title: string;
  content: string;
  postType: 'BLOG' | 'VIDEO' | 'GALLERY' | 'ANNOUNCEMENT';
  mediaUrls?: string;
  coverImageUrl?: string;
  youtubeVideoUrl?: string;
  targetScope?: 'ALL' | 'MEMBERS';
  category?: string;
  tags?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
}

export interface UpdateClubPostPayload {
  postUuid: string;
  title?: string;
  content?: string;
  postType?: string;
  mediaUrls?: string;
  coverImageUrl?: string;
  youtubeVideoUrl?: string;
  targetScope?: string;
  category?: string;
  tags?: string;
  isPinned?: boolean;
  status?: string;
}

export interface AddClubPostCommentPayload {
  postUuid: string;
  commentText: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
}

export const ClubPostService = {
  getPosts: async (
    orgUuid: string,
    type?: string,
    scope?: string,
    search?: string,
    approvalStatus?: string
  ): Promise<ClubPost[]> => {
    let url = `/api/identity/club/posts/org/${orgUuid}?`;
    if (type && type !== 'ALL') url += `type=${type}&`;
    if (scope && scope !== 'ALL') url += `scope=${scope}&`;
    if (approvalStatus && approvalStatus !== 'ALL') url += `approvalStatus=${approvalStatus}&`;
    if (search && search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

    const res = await api.get<any>(url);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  getPostByUuid: async (postUuid: string): Promise<ClubPost | null> => {
    const res = await api.get<any>(`/api/identity/club/posts/${postUuid}`);
    return res?.data || res || null;
  },

  approvePost: async (postUuid: string, approverName?: string): Promise<ClubPost> => {
    let url = `/api/identity/club/posts/${postUuid}/approve`;
    if (approverName && approverName.trim()) {
      url += `?approverName=${encodeURIComponent(approverName.trim())}`;
    }
    const res = await api.post<any>(url, {});
    return res?.data || res;
  },

  rejectPost: async (postUuid: string, reason?: string, approverName?: string): Promise<ClubPost> => {
    let url = `/api/identity/club/posts/${postUuid}/reject?`;
    if (reason && reason.trim()) url += `reason=${encodeURIComponent(reason.trim())}&`;
    if (approverName && approverName.trim()) url += `approverName=${encodeURIComponent(approverName.trim())}&`;
    const res = await api.post<any>(url, {});
    return res?.data || res;
  },

  createPost: async (payload: CreateClubPostPayload): Promise<ClubPost> => {
    const res = await api.post<any>('/api/identity/club/posts/create', payload);
    return res?.data || res;
  },

  createPostMultipart: async (
    payload: CreateClubPostPayload,
    coverFile?: File | null,
    galleryFiles?: File[]
  ): Promise<ClubPost> => {
    const formData = new FormData();
    if (payload.organizationUuid) formData.append('organizationUuid', payload.organizationUuid);
    if (payload.title) formData.append('title', payload.title);
    if (payload.content) formData.append('content', payload.content);
    if (payload.postType) formData.append('postType', payload.postType);

    if (payload.targetScope) formData.append('targetScope', payload.targetScope);
    if (payload.category && payload.category.trim()) formData.append('category', payload.category.trim());
    if (payload.tags && payload.tags.trim()) formData.append('tags', payload.tags.trim());
    if (payload.youtubeVideoUrl && payload.youtubeVideoUrl.trim()) formData.append('youtubeVideoUrl', payload.youtubeVideoUrl.trim());
    if (payload.coverImageUrl && payload.coverImageUrl.trim()) formData.append('coverImageUrl', payload.coverImageUrl.trim());
    if (payload.mediaUrls && payload.mediaUrls.trim()) formData.append('mediaUrls', payload.mediaUrls.trim());
    if (payload.authorName && payload.authorName.trim()) formData.append('authorName', payload.authorName.trim());
    if (payload.authorRole && payload.authorRole.trim()) formData.append('authorRole', payload.authorRole.trim());

    if (coverFile) {
      formData.append('coverFile', coverFile);
    }

    if (galleryFiles && galleryFiles.length > 0) {
      galleryFiles.forEach((gf) => {
        formData.append('mediaFiles', gf);
      });
    }

    const res = await fetchClient<any>('/api/identity/club/posts/createMultipart', {
      method: 'POST',
      body: formData,
    });
    return res?.data || res;
  },

  uploadMediaFiles: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await fetchClient<any>('/api/identity/club/posts/uploadMedia', {
      method: 'POST',
      body: formData,
    });
    return res?.data || res || [];
  },

  updatePost: async (payload: UpdateClubPostPayload): Promise<ClubPost> => {
    const res = await api.post<any>('/api/identity/club/posts/update', payload);
    return res?.data || res;
  },

  deletePost: async (postUuid: string): Promise<void> => {
    await api.post<void>(`/api/identity/club/posts/delete/${postUuid}`, {});
  },

  toggleLike: async (postUuid: string): Promise<boolean> => {
    const res = await api.post<any>(`/api/identity/club/posts/${postUuid}/like`, {});
    return Boolean(res?.data ?? res);
  },

  addComment: async (payload: AddClubPostCommentPayload): Promise<ClubPostComment> => {
    const res = await api.post<any>(`/api/identity/club/posts/${payload.postUuid}/comment`, payload);
    return res?.data || res;
  },

  getComments: async (postUuid: string): Promise<ClubPostComment[]> => {
    const res = await api.get<any>(`/api/identity/club/posts/${postUuid}/comments`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  togglePin: async (postUuid: string): Promise<ClubPost> => {
    const res = await api.post<any>(`/api/identity/club/posts/${postUuid}/pin`, {});
    return res?.data || res;
  },
};
