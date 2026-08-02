import { create } from 'zustand';
import { ScoringService } from '../api/scoring';

export type GameCategory = 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Team';
export type PointBreak = 15 | 21 | 30 | 'Custom';
export type Team = 'A' | 'B';

export interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: string;
  onField: boolean;
}

export interface MatchConfig {
  id: string;
  category: GameCategory;
  bestOfSets: 1 | 2 | 3;
  pointBreak: number; // resolved to a number, e.g. 21
  teamA: string[]; // 1 or 2 players
  teamB: string[]; // 1 or 2 players
}

export interface CourtPositions {
  left: number | null; // index of the player in config.team array
  right: number | null;
}

export interface GameState {
  scoreA: number;
  scoreB: number;
  currentServer: Team;
  posA: CourtPositions;
  posB: CourtPositions;
  isGameOver: boolean;
  winner: Team | null;
}

export interface MatchState {
  config: MatchConfig | null;
  currentGameIndex: number;
  games: GameState[]; // history of games
  history: GameState[]; // stack for undo (within the current game)
  matchWinner: Team | null;
  teamsFlipped: boolean;

  // Actions
  setupMatch: (config: MatchConfig) => void;
  addPoint: (team: Team) => void;
  undoPoint: () => void;
  nextGame: () => void;
  swapPlayers: (team: Team) => void;
  flipCourts: () => void;
  resetMatch: () => void;
  setInitialServer: (team: Team) => void;
}

const getInitialGameState = (isDoubles: boolean, server: Team = 'A'): GameState => ({
  scoreA: 0,
  scoreB: 0,
  currentServer: server,
  posA: isDoubles ? { left: 1, right: 0 } : { left: null, right: 0 },
  posB: isDoubles ? { left: 1, right: 0 } : { left: null, right: 0 },
  isGameOver: false,
  winner: null,
});

export const useMatchStore = create<MatchState>((set, get) => ({
  config: null,
  currentGameIndex: 0,
  games: [],
  history: [],
  matchWinner: null,
  teamsFlipped: false,

  setupMatch: (config) => {
    const isDoubles = config.category === 'Doubles' || config.category === 'Mixed Doubles';
    set({
      config,
      currentGameIndex: 0,
      games: [getInitialGameState(isDoubles)],
      history: [],
      matchWinner: null,
      teamsFlipped: false,
    });
  },

  addPoint: (scoringTeam: Team) => {
    const state = get();
    if (!state.config || state.matchWinner) return;

    const isDoubles = state.config.category === 'Doubles' || state.config.category === 'Mixed Doubles';
    const gameIndex = state.currentGameIndex;
    const currentGame = state.games[gameIndex];
    if (currentGame.isGameOver) return;

    // Save state to history for undo
    const newHistory = [...state.history, { ...currentGame }];

    // Optimistic API Call
    if (state.config.id) {
      ScoringService.recordEvent(state.config.id, state.config.category, {
        team: scoringTeam,
        action: 'POINT_SCORED',
        timestamp: new Date().toISOString()
      }).catch(err => console.error('Failed to record score event', err));
    }

    const newScoreA = scoringTeam === 'A' ? currentGame.scoreA + 1 : currentGame.scoreA;
    const newScoreB = scoringTeam === 'B' ? currentGame.scoreB + 1 : currentGame.scoreB;

    let newServer = scoringTeam;
    
    // Position Logic
    let newPosA = { ...currentGame.posA };
    let newPosB = { ...currentGame.posB };
    
    const isServeWin = currentGame.currentServer === scoringTeam;

    if (!isDoubles) {
      // Singles: Both players move based on the SERVER's score (diagonally opposite)
      const serverScore = newServer === 'A' ? newScoreA : newScoreB;
      const isEven = serverScore % 2 === 0;
      newPosA = { left: isEven ? null : 0, right: isEven ? 0 : null };
      newPosB = { left: isEven ? null : 0, right: isEven ? 0 : null };
    } else {
      // Doubles: Swap only if you won a point while serving
      if (isServeWin) {
        if (scoringTeam === 'A') {
          newPosA = { left: currentGame.posA.right, right: currentGame.posA.left };
        } else {
          newPosB = { left: currentGame.posB.right, right: currentGame.posB.left };
        }
      }
    }

    let isGameOver = false;
    let winner: Team | null = null;
    let matchWinner: Team | null = null;

    const ptBreak = state.config.pointBreak;
    
    const lead = Math.abs(newScoreA - newScoreB);
    const maxScore = Math.max(newScoreA, newScoreB);
    const cap = ptBreak === 21 ? 30 : ptBreak === 15 ? 21 : 30;

    if ((maxScore >= ptBreak && lead >= 2) || maxScore >= cap) {
      isGameOver = true;
      winner = newScoreA > newScoreB ? 'A' : 'B';
    }

    const newGames = [...state.games];
    newGames[gameIndex] = {
      scoreA: newScoreA,
      scoreB: newScoreB,
      currentServer: newServer,
      posA: newPosA,
      posB: newPosB,
      isGameOver,
      winner,
    };

    if (isGameOver) {
      const winsA = newGames.filter(g => g.winner === 'A').length;
      const winsB = newGames.filter(g => g.winner === 'B').length;
      const requiredWins = Math.ceil(state.config.bestOfSets / 2);

      if (winsA >= requiredWins) matchWinner = 'A';
      else if (winsB >= requiredWins) matchWinner = 'B';
    }

    set({
      games: newGames,
      history: newHistory,
      matchWinner,
    });
  },

  undoPoint: () => {
    const state = get();
    if (state.history.length === 0 || state.matchWinner) return;

    const gameIndex = state.currentGameIndex;
    const newHistory = [...state.history];
    const previousGameState = newHistory.pop()!;

    const newGames = [...state.games];
    newGames[gameIndex] = previousGameState;

    // Optimistic API Call
    if (state.config && state.config.id) {
      ScoringService.recordEvent(state.config.id, state.config.category, {
        team: previousGameState.winner || 'A', // placeholder logic for undo team
        action: 'POINT_REVERTED',
        timestamp: new Date().toISOString()
      }).catch(err => console.error('Failed to revert score event', err));
    }

    set({
      games: newGames,
      history: newHistory,
      matchWinner: null,
    });
  },

  nextGame: () => {
    const state = get();
    if (!state.config || state.matchWinner) return;

    const currentGame = state.games[state.currentGameIndex];
    if (!currentGame.isGameOver) return;

    const nextServer = currentGame.winner || 'A';
    const isDoubles = state.config.category === 'Doubles' || state.config.category === 'Mixed Doubles';

    set({
      currentGameIndex: state.currentGameIndex + 1,
      games: [...state.games, getInitialGameState(isDoubles, nextServer)],
      history: [],
    });
  },

  swapPlayers: (team: Team) => {
    const state = get();
    if (!state.config || state.matchWinner) return;

    const gameIndex = state.currentGameIndex;
    const currentGame = state.games[gameIndex];
    
    // Only allow swapping at the start of a game (score 0-0)
    if (currentGame.scoreA > 0 || currentGame.scoreB > 0) return;

    const newGames = [...state.games];
    const newPos = team === 'A' ? { ...currentGame.posA } : { ...currentGame.posB };
    
    // Swap left and right indices
    const temp = newPos.left;
    newPos.left = newPos.right;
    newPos.right = temp;

    newGames[gameIndex] = {
      ...currentGame,
      ...(team === 'A' ? { posA: newPos } : { posB: newPos })
    };

    set({ games: newGames });
  },

  flipCourts: () => {
    const state = get();
    if (!state.config || state.matchWinner) return;
    set({ teamsFlipped: !state.teamsFlipped });
  },

  resetMatch: () => {
    set({
      config: null,
      currentGameIndex: 0,
      games: [],
      history: [],
      matchWinner: null,
      teamsFlipped: false,
    });
  },

  setInitialServer: (team: Team) => set((state) => {
    if (!state.config || state.matchWinner) return state;
    
    const games = [...state.games];
    const currentGame = { ...games[state.currentGameIndex] };
    
    if (currentGame.scoreA === 0 && currentGame.scoreB === 0) {
      currentGame.currentServer = team;
      games[state.currentGameIndex] = currentGame;
      return { games };
    }
    return state;
  })
}));

if (typeof window !== 'undefined') {
  useMatchStore.subscribe((state) => {
    if (!state.config?.id) return;
    
    // Fire and forget POST to sync state to overlay
    ScoringService.syncState(state.config.id, state).catch(err => 
      console.error('Failed to sync badminton/tennis overlay state', err)
    );
  });
}
