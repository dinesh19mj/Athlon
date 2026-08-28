import { api, fetchClient } from './client';

export interface SportsProfileResponse {
  uuid: string;
  sportName: string;
  currentRanking: number;
  verificationStatus: string;
  careerHighlights: string;
  isActive: boolean;
}

export interface UserResponse {
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  photo?: string;
  city?: string;
  district?: string;
  state?: string;
  isActive: number;
  sportsProfiles: SportsProfileResponse[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}

export interface CreateSportsProfileRequest {
  userUuid: string;
  sportName: string;
  category: string;
  currentRanking?: number;
  careerHighlights?: string;
}

export interface UpdateUserRequest {
  uuid: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  photo?: string;
  city?: string;
  district?: string;
  state?: string;
}

export const UserService = {
  getUserByUuid: (uuid: string) => 
    api.get<ApiResponse<UserResponse>>(`/api/identity/users/getUserByUuid/${uuid}`),
    
  getUserByPhone: (phone: string) =>
    api.get<ApiResponse<UserResponse>>(`/api/identity/users/getUserByPhone/${encodeURIComponent(phone)}`),
    
  addSportsProfile: (data: CreateSportsProfileRequest) =>
    api.post<ApiResponse<SportsProfileResponse>>(`/api/identity/users/addSportsProfile`, data),
    
  updateUser: (data: UpdateUserRequest) =>
    api.post<ApiResponse<UserResponse>>(`/api/identity/users/updateUser`, data),

  updatePhoto: async (userUuid: string, file: File): Promise<ApiResponse<UserResponse>> => {
    const formData = new FormData();
    formData.append('photo', file);
    return fetchClient<ApiResponse<UserResponse>>(`/api/identity/users/updatePhoto/${userUuid}`, {
      method: 'POST',
      body: formData,
    });
  },

  updateProfileWithPhoto: async (formData: FormData): Promise<ApiResponse<UserResponse>> => {
    return fetchClient<ApiResponse<UserResponse>>(`/api/identity/users/updateProfileWithPhoto`, {
      method: 'POST',
      body: formData,
    });
  },

  getPhotoUrl: (photoFileName?: string): string => {
    if (!photoFileName) return '';
    if (photoFileName.startsWith('http')) return photoFileName;
    return `/api/identity/users/photo/${photoFileName}`;
  },
};
