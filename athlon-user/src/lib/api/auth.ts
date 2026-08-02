import { api } from './client';

export const AuthService = {
  login: (input: string, password?: string) => api.post<{ token: string }>('/api/auth/login', { input, password }),
  register: (data: any) => api.post<any>('/api/auth/register', data),
  getUserProfile: () => api.get<{ message: string, data: any }>('/users/me'),
};
