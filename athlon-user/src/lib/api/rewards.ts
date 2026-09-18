import { fetchClient } from './client';
import { useAuthStore } from '../store/useAuthStore';

export interface UserWallet {
  walletUuid: string;
  userId: number;
  userUuid: string;
  referralCode: string;
  referralLink: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalReferralsCount: number;
  updatedAt: string;
}

export interface CreditTransaction {
  transactionUuid: string;
  transactionType: 'CREDIT' | 'DEBIT';
  sourceType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface UserReferral {
  referralUuid: string;
  refereeUserId: number;
  refereeUserUuid: string;
  refereeName: string;
  refereePhone: string;
  referralCode: string;
  status: string;
  creditsAwarded: number;
  completedAt: string;
}

export interface CreditRule {
  ruleUuid: string;
  ruleKey: string;
  ruleName: string;
  category: string;
  creditAmount: number;
  minThreshold: number;
  description: string;
  isActive: number;
  updatedAt: string;
}

export interface CreditRedemption {
  redemptionUuid: string;
  userId: number;
  userUuid: string;
  redemptionType: string;
  creditsSpent: number;
  targetId: string;
  status: string;
  remainingBalance: number;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

const getAuthParam = (customUuid?: string) => {
  if (customUuid) return `userUuid=${customUuid}`;
  const { userUuid, userId } = useAuthStore.getState();
  const uuid = userUuid || (userId && /^[0-9a-fA-F-]{36}$/.test(String(userId)) ? String(userId) : '');
  if (uuid) return `userUuid=${uuid}`;
  if (userId && /^\d+$/.test(String(userId))) return `userId=${userId}`;
  return '';
};

export const RewardsService = {
  getWallet: async (customUuid?: string): Promise<ApiResponse<UserWallet>> => {
    const p = getAuthParam(customUuid);
    const query = p ? `?${p}` : '';
    return fetchClient<ApiResponse<UserWallet>>(`/api/identity/rewards/wallet${query}`);
  },

  getTransactions: async (page = 0, size = 20, customUuid?: string): Promise<ApiResponse<PageResponse<CreditTransaction>>> => {
    const p = getAuthParam(customUuid);
    const query = p ? `?${p}&page=${page}&size=${size}` : `?page=${page}&size=${size}`;
    return fetchClient<ApiResponse<PageResponse<CreditTransaction>>>(`/api/identity/rewards/transactions${query}`);
  },

  getReferrals: async (page = 0, size = 20, customUuid?: string): Promise<ApiResponse<PageResponse<UserReferral>>> => {
    const p = getAuthParam(customUuid);
    const query = p ? `?${p}&page=${page}&size=${size}` : `?page=${page}&size=${size}`;
    return fetchClient<ApiResponse<PageResponse<UserReferral>>>(`/api/identity/rewards/referrals${query}`);
  },

  applyReferral: async (referralCode: string, customUuid?: string): Promise<ApiResponse<UserWallet>> => {
    const p = getAuthParam(customUuid);
    const query = p ? `?${p}` : '';
    return fetchClient<ApiResponse<UserWallet>>(`/api/identity/rewards/referrals/apply${query}`, {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    });
  },

  getActiveRules: async (): Promise<ApiResponse<CreditRule[]>> => {
    return fetchClient<ApiResponse<CreditRule[]>>('/api/identity/rewards/rules');
  },

  redeemOrganizerSubscription: async (organizationId: number, packageId?: number, notes?: string, customUuid?: string): Promise<ApiResponse<CreditRedemption>> => {
    const p = getAuthParam(customUuid);
    const query = p ? `?${p}` : '';
    return fetchClient<ApiResponse<CreditRedemption>>(`/api/identity/rewards/redeem/organizer-subscription${query}`, {
      method: 'POST',
      body: JSON.stringify({ organizationId, packageId, notes }),
    });
  },

  redeemFreeTournamentHost: async (targetId: string, targetName?: string, customUuid?: string): Promise<ApiResponse<CreditRedemption>> => {
    const p = getAuthParam(customUuid);
    const query = p ? `?${p}` : '';
    return fetchClient<ApiResponse<CreditRedemption>>(`/api/identity/rewards/redeem/free-tournament-host${query}`, {
      method: 'POST',
      body: JSON.stringify({ targetId, targetName }),
    });
  },
};
