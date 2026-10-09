import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../api/auth';

export type Subscription = 'PLAYER' | 'ORGANIZER' | 'ACADEMY' | 'COURT' | 'CLUB' | 'COACH';

type AuthState = {
  isAuthenticated: boolean;
  subscriptions: Subscription[];
  userEmail: string | null;
  token: string | null;
  userId: string | null;
  userUuid: string | null;
  role: string | null;
  platformRoles: string[];
  login: (email: string, token: string, userId: string, userUuid: string, role?: string, platformRoles?: string[]) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setSubscriptions: (subs: Subscription[]) => void;
  isSuperAdmin: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      subscriptions: ['PLAYER'],
      userEmail: null,
      token: null,
      userId: null,
      userUuid: null,
      role: null,
      platformRoles: [],

  login: async (email: string, token: string, userId: string, userUuid: string, role?: string, platformRoles?: string[]) => {
    try {
      if (typeof window !== 'undefined') {
        const { useWorkspaceStore } = require('./useWorkspaceStore');
        useWorkspaceStore.getState().clearWorkspace();
      }
    } catch {}

    const lowerEmail = email.toLowerCase();
    
    let subs: Subscription[] = ['PLAYER'];
    if (lowerEmail.includes('organizer')) subs.push('ORGANIZER');
    if (lowerEmail.includes('academy')) subs.push('ACADEMY');
    if (lowerEmail.includes('club')) subs.push('CLUB');
    if (lowerEmail.includes('coach') || lowerEmail.includes('trainer')) subs.push('COACH');
    if (lowerEmail.includes('court') || lowerEmail.includes('venue')) subs.push('COURT');
    
    // Determine effective role
    const isSuperAdminEmail = lowerEmail === 'athlon1@athlon.com' || lowerEmail === 'dinesh19sep@gmail.com';
    const effectiveRole = role || (isSuperAdminEmail ? 'PLATFORM_SUPER_ADMIN' : 'USER');
    const effectivePlatformRoles = platformRoles && platformRoles.length > 0 
      ? platformRoles 
      : (effectiveRole === 'PLATFORM_SUPER_ADMIN' ? ['PLATFORM_SUPER_ADMIN'] : []);

    set({
      isAuthenticated: true,
      userEmail: email,
      token: token,
      userId: userId,
      userUuid: userUuid,
      role: effectiveRole,
      platformRoles: effectivePlatformRoles,
      subscriptions: subs,
    });
  },
  
  register: async (data: any) => {
    try {
      if (typeof window !== 'undefined') {
        const { useWorkspaceStore } = require('./useWorkspaceStore');
        useWorkspaceStore.getState().clearWorkspace();
      }
    } catch {}

    try {
      await AuthService.register(data);
    } catch (error) {
      console.warn('API Register failed, proceeding with local simulation', error);
    }
    
    const email = data.email || '';
    const lowerEmail = email.toLowerCase();
    
    let subs: Subscription[] = ['PLAYER'];
    if (lowerEmail.includes('organizer')) subs.push('ORGANIZER');
    if (lowerEmail.includes('academy')) subs.push('ACADEMY');
    if (lowerEmail.includes('club')) subs.push('CLUB');
    if (lowerEmail.includes('coach') || lowerEmail.includes('trainer')) subs.push('COACH');
    if (lowerEmail.includes('court') || lowerEmail.includes('venue')) subs.push('COURT');
    
    set({
      isAuthenticated: true,
      userEmail: email,
      subscriptions: subs,
    });
  },
  logout: () => {
    try {
      if (typeof window !== 'undefined') {
        const { useWorkspaceStore } = require('./useWorkspaceStore');
        useWorkspaceStore.getState().clearWorkspace();
      }
    } catch {
      // Ignore if circular dependency during initial hydration
    }
    set({
      isAuthenticated: false,
      subscriptions: ['PLAYER'],
      userEmail: null,
      token: null,
      userId: null,
      userUuid: null,
      role: null,
      platformRoles: [],
    });
  },
  setSubscriptions: (subs) =>
    set({
      subscriptions: subs,
    }),
  isSuperAdmin: () => {
    const state = get();
    const email = (state.userEmail || '').toLowerCase();
    if (email === 'athlon1@athlon.com' || email === 'dinesh19sep@gmail.com') {
      return true;
    }
    if (state.role === 'PLATFORM_SUPER_ADMIN') {
      return true;
    }
    if (Array.isArray(state.platformRoles) && state.platformRoles.includes('PLATFORM_SUPER_ADMIN')) {
      return true;
    }
    if (state.token) {
      try {
        const payloadBase64 = state.token.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.role === 'PLATFORM_SUPER_ADMIN') return true;
          if (Array.isArray(payload.platformRoles) && payload.platformRoles.includes('PLATFORM_SUPER_ADMIN')) return true;
          const sub = (payload.sub || '').toLowerCase();
          if (sub === 'athlon1@athlon.com' || sub === 'dinesh19sep@gmail.com') return true;
        }
      } catch {}
    }
    return false;
  },
  }),
  {
    name: 'auth-storage', // name of item in the storage (must be unique)
  }
));
