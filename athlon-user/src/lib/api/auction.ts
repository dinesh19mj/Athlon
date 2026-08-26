import { fetchClient } from './client';

export interface AuctionConfig {
  auctionId: number;
  auctionUuid: string;
  championshipId: number;
  championshipUuid: string;
  auctionMode: 'FULL_AUCTION' | 'PARTIAL_AUCTION' | 'NO_AUCTION';
  currencyType: 'POINTS' | 'REAL_MONEY';
  currencySymbolOrLabel: string;
  basePriceStrategy: 'CATEGORY_BASED' | 'FIXED_GLOBAL' | 'CUSTOM';
  defaultBasePrice: number;
  bidIncrement: number;
  teamBudget: number;
  reservedPlayersPerTeam: number;
  timerSeconds: number;
  antiSnipingSeconds: number;
  status: 'DRAFT' | 'READY' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  activePlayerId?: number;
  currentBid?: number;
  winningTeamId?: number;
  timerEndTime?: string;
}

export interface AuctionPlayer {
  auctionPlayerId: number;
  auctionPlayerUuid: string;
  auctionId: number;
  playerId: number;
  playerUuid: string;
  playerName: string;
  categoryId?: number;
  categoryName?: string;
  eligibleFormats?: string;
  basePrice: number;
  state: 'WAITING' | 'CALLED' | 'BIDDING' | 'SOLD' | 'UNSOLD' | 'ASSIGNED';
  finalBid: number;
  winningTeamId?: number;
  winningTeamName?: string;
  callOrder: number;
  avatarUrl?: string;
}

export interface AuctionTeam {
  auctionTeamId: number;
  auctionId: number;
  teamId: number;
  teamUuid: string;
  teamName: string;
  logoUrl?: string;
  initialBudget: number;
  spentBudget: number;
  remainingBudget: number;
  playersAcquiredCount: number;
  reservedSlotsCount: number;
  squadCapacity: number;
  isEligible: boolean;
}

export interface AuctionBid {
  bidId: number;
  auctionId: number;
  auctionPlayerId: number;
  teamId: number;
  teamName: string;
  bidAmount: number;
  userId?: number;
  isWinningBid: boolean;
  createdAt: string;
}

export interface AuctionReservedPlayer {
  reservedId: number;
  reservedUuid: string;
  auctionId: number;
  championshipId: number;
  teamId: number;
  playerId: number;
  playerName: string;
  categoryId?: number;
  categoryName?: string;
  isLocked: boolean;
}

export interface AuctionBudgetTransaction {
  transactionId: number;
  auctionId: number;
  teamId: number;
  type: 'INITIAL' | 'PURCHASE' | 'ADJUSTMENT' | 'REFUND';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: number;
  note?: string;
  createdAt: string;
}

export interface AuctionState {
  config: AuctionConfig;
  activePlayer?: AuctionPlayer;
  currentBid: number;
  winningTeamId?: number;
  winningTeamName?: string;
  remainingTimerSeconds: number;
  recentBids: AuctionBid[];
  teams: AuctionTeam[];
  totalPlayersInPool: number;
  soldPlayersCount: number;
  unsoldPlayersCount: number;
}

export interface AuctionTeamSummary {
  team: AuctionTeam;
  acquiredPlayers: AuctionPlayer[];
  reservedPlayers: AuctionReservedPlayer[];
}

const unwrap = <T>(res: any): T => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined) {
    return res.data as T;
  }
  return res as T;
};

export const AuctionService = {
  createOrUpdateConfig: async (data: any): Promise<AuctionConfig> => {
    const res = await fetchClient<any>('/api/tournament/auction/config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<AuctionConfig>(res);
  },

  getState: async (auctionId: number): Promise<AuctionState> => {
    const res = await fetchClient<any>(`/api/tournament/auction/${auctionId}/state`);
    return unwrap<AuctionState>(res);
  },

  getPlayers: async (auctionId: number): Promise<AuctionPlayer[]> => {
    const res = await fetchClient<any>(`/api/tournament/auction/${auctionId}/players`);
    return unwrap<AuctionPlayer[]>(res);
  },

  getTeams: async (auctionId: number): Promise<AuctionTeamSummary[]> => {
    const res = await fetchClient<any>(`/api/tournament/auction/${auctionId}/teams`);
    return unwrap<AuctionTeamSummary[]>(res);
  },

  callPlayer: async (auctionId: number, auctionPlayerId: number, organizerUserId?: number): Promise<AuctionState> => {
    const res = await fetchClient<any>('/api/tournament/auction/call-player', {
      method: 'POST',
      body: JSON.stringify({ auctionId, auctionPlayerId, organizerUserId }),
    });
    return unwrap<AuctionState>(res);
  },

  placeBid: async (auctionId: number, auctionPlayerId: number, teamId: number, bidAmount: number, userId?: number): Promise<AuctionBid> => {
    const res = await fetchClient<any>('/api/tournament/auction/bid', {
      method: 'POST',
      body: JSON.stringify({ auctionId, auctionPlayerId, teamId, bidAmount, userId }),
    });
    return unwrap<AuctionBid>(res);
  },

  markUnsold: async (auctionId: number, auctionPlayerId: number): Promise<AuctionState> => {
    const res = await fetchClient<any>(`/api/tournament/auction/unsold?auctionId=${auctionId}&auctionPlayerId=${auctionPlayerId}`, {
      method: 'POST',
    });
    return unwrap<AuctionState>(res);
  },

  assignPlayer: async (auctionId: number, auctionPlayerId: number, winningTeamId: number, finalBidAmount?: number, organizerUserId?: number): Promise<AuctionState> => {
    const res = await fetchClient<any>('/api/tournament/auction/assign', {
      method: 'POST',
      body: JSON.stringify({ auctionId, auctionPlayerId, winningTeamId, finalBidAmount, organizerUserId }),
    });
    return unwrap<AuctionState>(res);
  },

  selectReservedPlayer: async (data: any): Promise<AuctionReservedPlayer> => {
    const res = await fetchClient<any>('/api/tournament/auction/reserved-player', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<AuctionReservedPlayer>(res);
  },

  getTransactions: async (auctionId: number): Promise<AuctionBudgetTransaction[]> => {
    const res = await fetchClient<any>(`/api/tournament/auction/${auctionId}/transactions`);
    return unwrap<AuctionBudgetTransaction[]>(res);
  },

  getTeamTransactions: async (auctionId: number, teamId: number): Promise<AuctionBudgetTransaction[]> => {
    const res = await fetchClient<any>(`/api/tournament/auction/${auctionId}/transactions/team/${teamId}`);
    return unwrap<AuctionBudgetTransaction[]>(res);
  },
};
