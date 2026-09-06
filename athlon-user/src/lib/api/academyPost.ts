import { api, fetchClient } from './client';

export interface AcademyPost {
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
  targetScope: 'ALL' | 'CENTRE' | 'BATCH';
  centreUuid?: string;
  centreName?: string;
  batchUuid?: string;
  batchName?: string;
  category?: string;
  tags?: string;
  authorUserId?: number;
  authorUserUuid?: string;
  authorName: string;
  authorRole: 'ADMIN' | 'COACH' | 'STUDENT';
  authorAvatar?: string;
  isPinned?: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLikedByCurrentUser?: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
}

export interface AcademyPostComment {
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

export interface CreateAcademyPostPayload {
  organizationUuid: string;
  title: string;
  content: string;
  postType: 'BLOG' | 'VIDEO' | 'GALLERY' | 'ANNOUNCEMENT';
  mediaUrls?: string;
  coverImageUrl?: string;
  youtubeVideoUrl?: string;
  targetScope?: 'ALL' | 'CENTRE' | 'BATCH';
  centreUuid?: string;
  centreName?: string;
  batchUuid?: string;
  batchName?: string;
  category?: string;
  tags?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
}

export interface UpdateAcademyPostPayload {
  postUuid: string;
  title?: string;
  content?: string;
  postType?: string;
  mediaUrls?: string;
  coverImageUrl?: string;
  youtubeVideoUrl?: string;
  targetScope?: string;
  centreUuid?: string;
  centreName?: string;
  batchUuid?: string;
  batchName?: string;
  category?: string;
  tags?: string;
  isPinned?: boolean;
  status?: string;
}

export interface AddPostCommentPayload {
  postUuid: string;
  commentText: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
}

export const AcademyPostService = {
  getPosts: async (
    orgUuid: string,
    type?: string,
    scope?: string,
    batchUuid?: string,
    centreUuid?: string,
    search?: string
  ): Promise<AcademyPost[]> => {
    let url = `/api/identity/academy/posts/org/${orgUuid}?`;
    if (type && type !== 'ALL') url += `type=${type}&`;
    if (scope && scope !== 'ALL') url += `scope=${scope}&`;
    if (batchUuid && batchUuid !== 'ALL') url += `batchUuid=${batchUuid}&`;
    if (centreUuid && centreUuid !== 'ALL') url += `centreUuid=${centreUuid}&`;
    if (search && search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

    const res = await api.get<any>(url);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  getPostByUuid: async (postUuid: string): Promise<AcademyPost | null> => {
    const res = await api.get<any>(`/api/identity/academy/posts/${postUuid}`);
    return res?.data || res || null;
  },

  createPost: async (payload: CreateAcademyPostPayload): Promise<AcademyPost> => {
    const res = await api.post<any>('/api/identity/academy/posts/create', payload);
    return res?.data || res;
  },

  createPostMultipart: async (
    payload: CreateAcademyPostPayload,
    coverFile?: File | null,
    galleryFiles?: File[]
  ): Promise<AcademyPost> => {
    const formData = new FormData();
    if (payload.organizationUuid) formData.append('organizationUuid', payload.organizationUuid);
    if (payload.title) formData.append('title', payload.title);
    if (payload.content) formData.append('content', payload.content);
    if (payload.postType) formData.append('postType', payload.postType);

    if (payload.targetScope) formData.append('targetScope', payload.targetScope);
    if (payload.centreUuid && payload.centreUuid.trim()) formData.append('centreUuid', payload.centreUuid.trim());
    if (payload.centreName && payload.centreName.trim()) formData.append('centreName', payload.centreName.trim());
    if (payload.batchUuid && payload.batchUuid.trim()) formData.append('batchUuid', payload.batchUuid.trim());
    if (payload.batchName && payload.batchName.trim()) formData.append('batchName', payload.batchName.trim());
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
        formData.append('galleryFiles', gf);
      });
    }

    const res = await fetchClient<any>('/api/identity/academy/posts/createMultipart', {
      method: 'POST',
      body: formData,
    });
    return res?.data || res;
  },

  uploadMediaFiles: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await fetchClient<any>('/api/identity/academy/posts/uploadMedia', {
      method: 'POST',
      body: formData,
    });
    return res?.data || res || [];
  },

  updatePost: async (payload: UpdateAcademyPostPayload): Promise<AcademyPost> => {
    const res = await api.post<any>('/api/identity/academy/posts/update', payload);
    return res?.data || res;
  },

  deletePost: async (postUuid: string): Promise<void> => {
    await api.post<void>(`/api/identity/academy/posts/delete/${postUuid}`, {});
  },

  toggleLike: async (postUuid: string): Promise<boolean> => {
    const res = await api.post<any>(`/api/identity/academy/posts/${postUuid}/like`, {});
    return Boolean(res?.data ?? res);
  },

  addComment: async (payload: AddPostCommentPayload): Promise<AcademyPostComment> => {
    const res = await api.post<any>(`/api/identity/academy/posts/${payload.postUuid}/comment`, payload);
    return res?.data || res;
  },

  getComments: async (postUuid: string): Promise<AcademyPostComment[]> => {
    const res = await api.get<any>(`/api/identity/academy/posts/${postUuid}/comments`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  togglePin: async (postUuid: string): Promise<AcademyPost> => {
    const res = await api.post<any>(`/api/identity/academy/posts/${postUuid}/pin`, {});
    return res?.data || res;
  },
};
