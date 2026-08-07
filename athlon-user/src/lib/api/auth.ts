import { api } from './client';

export const AuthService = {
  login: (identifier: string, password?: string) => api.post<{ data: { accessToken: string, refreshToken: string } }>('/api/auth/login', { identifier, password }),
  register: (data: any) => api.post<any>('/api/auth/register', data),
  getUserProfile: (uuid: string, token: string) => api.get<{ message: string, data: any }>(`/api/identity/users/getUserByUuid/${uuid}`, { headers: { Authorization: `Bearer ${token}` } }),
};
