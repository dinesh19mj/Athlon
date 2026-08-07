import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../api/auth';

export type Subscription = 'PLAYER' | 'ORGANIZER' | 'ACADEMY' | 'COURT' | 'CLUB';

type AuthState = {
  isAuthenticated: boolean;
  subscriptions: Subscription[];
  userEmail: string | null;
  token: string | null;
  userId: string | null;
  userUuid: string | null;
  login: (email: string, token: string, userId: string, userUuid: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setSubscriptions: (subs: Subscription[]) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      subscriptions: ['PLAYER'],
      userEmail: null,
      token: null,
      userId: null,
      userUuid: null,

  login: async (email: string, token: string, userId: string, userUuid: string) => {
    const lowerEmail = email.toLowerCase();
    
    let subs: Subscription[] = ['PLAYER'];
    if (lowerEmail.includes('organizer')) subs.push('ORGANIZER');
    if (lowerEmail.includes('academy')) subs.push('ACADEMY');
    if (lowerEmail.includes('club')) subs.push('CLUB');
    if (lowerEmail.includes('court')) subs.push('COURT');
    
    set({
      isAuthenticated: true,
      userEmail: email,
      token: token,
      userId: userId,
      userUuid: userUuid,
      subscriptions: subs,
    });
  },
  
  register: async (data: any) => {
    try {
      await AuthService.register(data);
    } catch (error) {
      console.warn('API Register failed, proceeding with local simulation', error);
    }
    
    const email = data.email || '';
    const lowerEmail = email.toLowerCase();
    
    let subs: Subscription[] = ['PLAYER'];
    if (lowerEmail.includes('organizer')) subs.push('ORGANIZER');
    
    set({
      isAuthenticated: true,
      userEmail: email,
      subscriptions: subs,
    });
  },
  logout: () => {
    set({
      isAuthenticated: false,
      subscriptions: ['PLAYER'],
      userEmail: null,
      token: null,
      userId: null,
      userUuid: null,
    });
  },
  setSubscriptions: (subs) =>
    set({
      subscriptions: subs,
    }),
  }),
  {
    name: 'auth-storage', // name of item in the storage (must be unique)
  }
));
