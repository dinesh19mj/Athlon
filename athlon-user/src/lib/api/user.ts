import { api } from './client';

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
}

export const UserService = {
  getUserByUuid: (uuid: string) => 
    api.get<ApiResponse<UserResponse>>(`/api/identity/users/getUserByUuid/${uuid}`),
  addSportsProfile: (data: CreateSportsProfileRequest) =>
    api.post<ApiResponse<SportsProfileResponse>>(`/api/identity/users/addSportsProfile`, data),
  updateUser: (data: UpdateUserRequest) =>
    api.post<ApiResponse<UserResponse>>(`/api/identity/users/updateUser`, data),
};
