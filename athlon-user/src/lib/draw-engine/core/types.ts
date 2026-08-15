export enum TournamentFormat {
  KNOCKOUT = 'KNOCKOUT',
  LEAGUE = 'LEAGUE',
  TEAM_LEAGUE = 'TEAM_LEAGUE',
}

export interface Participant {
  id: string;
  name: string;
  seed?: number;
  isBye?: boolean;
}

export interface Team extends Participant {
  captainId: string;
  players: string[]; // array of player IDs
  reserves: string[];
}

export interface MatchCategory {
  id: string;
  name: string; // e.g. "Men Singles"
  code: string; // e.g. "MS"
}

export enum MatchStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Match {
  id: string;
  participant1: Participant | null; // null if slot is empty
  participant2: Participant | null;
  winnerId?: string;
  score?: string;
  status: MatchStatus;
  
  // For Team League specific line-up matches
  categoryId?: string;
  
  // For knockout brackets
  nextMatchId?: string; // pointer to the match the winner advances to
  round?: number; // 1 = first round, 2 = second round...
  position?: number; // Top-down position within the round
}

export interface Bracket {
  matches: Match[]; 
  size: number; // e.g. 8, 16, 32
}

export interface Pool {
  id: string;
  name: string;
  participants: Participant[];
  fixtures: Match[];
}

export interface TournamentConfig {
  format: TournamentFormat;
  isAutomatic?: boolean;
  
  // Knockout config
  drawSize?: number; // e.g., 8, 16, 32, 64
  seedCount?: number;
  
  // League config
  totalTeams?: number;
  poolCount?: number;
  topTeamsQualified?: number; // per pool moving to knockout
  
  // Team League config
  categories?: MatchCategory[];
  requireEveryPlayerToPlay?: boolean;
}

export enum DrawStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED'
}
