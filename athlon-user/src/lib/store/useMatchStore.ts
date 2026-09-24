import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ScoringService } from '../api/scoring';
import { usePracticeMatchStore } from './usePracticeMatchStore';

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
  deuce?: boolean; // Deuce rule enabled: 2-point difference required from selecting point. Default: false
  maxPointCap?: number; // Maximum point cap when deuce is active. Default: 30
  teamA: string[]; // 1 or 2 players
  teamB: string[]; // 1 or 2 players
  teamAName?: string;
  teamBName?: string;
  tournamentName?: string;
  courtName?: string;
  sportType?: string;
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
  
  // Advanced Tracking
  continuousServicePointsA: number;
  continuousServicePointsB: number;
  maxContinuousPointsA: number;
  maxContinuousPointsB: number;
  lastRallyTimeMs: number;
  totalRallyTimeMs: number;
  
  // BWF Interval Rule
  isIntervalBreak: boolean;
  hasTakenInterval: boolean;

  // Mid-game Court Change Tracking
  midGameCourtSwapped?: boolean;
  teamsFlipped?: boolean;
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
  addPoint: (team: Team, rallyTimeMs?: number) => void;
  undoPoint: () => void;
  nextGame: () => void;
  swapPlayers: (team: Team) => void;
  flipCourts: () => void;
  continueFromInterval: () => void;
  resetMatch: () => void;
  setInitialServer: (team: Team) => void;
}

/**
 * Authoritative midpoint mapping for badminton mid-game interval & court change:
 * 15 -> 8
 * 21 -> 11
 * 30 -> 15
 */
export const getMidGameCourtChangePoint = (pointsPerSet: number): number | null => {
  if (pointsPerSet === 15) return 8;
  if (pointsPerSet === 21) return 11;
  if (pointsPerSet === 30) return 15;
  if (pointsPerSet > 0) return Math.ceil(pointsPerSet / 2);
  return null;
};

const getInitialGameState = (isDoubles: boolean, server: Team = 'A', teamsFlipped: boolean = false): GameState => ({
  scoreA: 0,
  scoreB: 0,
  currentServer: server,
  posA: isDoubles ? { left: 1, right: 0 } : { left: null, right: 0 },
  posB: isDoubles ? { left: 1, right: 0 } : { left: null, right: 0 },
  isGameOver: false,
  winner: null,
  continuousServicePointsA: 0,
  continuousServicePointsB: 0,
  maxContinuousPointsA: 0,
  maxContinuousPointsB: 0,
  lastRallyTimeMs: 0,
  totalRallyTimeMs: 0,
  isIntervalBreak: false,
  hasTakenInterval: false,
  midGameCourtSwapped: false,
  teamsFlipped,
});

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      config: null,
      currentGameIndex: 0,
      games: [],
      history: [],
      matchWinner: null,
      teamsFlipped: false,

      setupMatch: (config) => {
        const isDoubles = config.category?.includes('Doubles');
        set({
          config,
          currentGameIndex: 0,
          games: [getInitialGameState(isDoubles, 'A', false)],
          history: [],
          matchWinner: null,
          teamsFlipped: false,
        });
      },

      addPoint: (scoringTeam: Team, rallyTimeMs?: number) => {
        const state = get();
        if (!state.config || state.matchWinner) return;

        const isDoubles = state.config.category?.includes('Doubles');
        const gameIndex = state.currentGameIndex;
        const currentGame = state.games[gameIndex];
        if (currentGame.isGameOver) return;

        // Save complete state to history for undo (including court orientation)
        const newHistory = [
          ...state.history,
          {
            ...currentGame,
            teamsFlipped: state.teamsFlipped,
          },
        ];

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

        let continuousServicePointsA = isServeWin && scoringTeam === 'A' ? currentGame.continuousServicePointsA + 1 : (scoringTeam === 'A' ? 1 : 0);
        let continuousServicePointsB = isServeWin && scoringTeam === 'B' ? currentGame.continuousServicePointsB + 1 : (scoringTeam === 'B' ? 1 : 0);

        let maxContinuousPointsA = Math.max(currentGame.maxContinuousPointsA, continuousServicePointsA);
        let maxContinuousPointsB = Math.max(currentGame.maxContinuousPointsB, continuousServicePointsB);

        let isGameOver = false;
        let winner: Team | null = null;
        let matchWinner: Team | null = null;

        const ptBreak = state.config.pointBreak;
        const isDeuceEnabled = Boolean(state.config.deuce);
        
        const lead = Math.abs(newScoreA - newScoreB);
        const maxScore = Math.max(newScoreA, newScoreB);
        const cap = state.config.maxPointCap ?? (ptBreak === 21 ? 30 : ptBreak === 15 ? 21 : ptBreak === 11 ? 15 : 30);

        if (isDeuceEnabled) {
          // Deuce Mode:
          // When score reaches (ptBreak - 1) all (e.g. 20-20), a side must lead by 2 clear points to win.
          // Extended play continues until 2-point advantage or the maximum point cap is reached (default 30, e.g. 30-29).
          if ((maxScore >= ptBreak && lead >= 2) || maxScore >= cap) {
            isGameOver = true;
            winner = newScoreA > newScoreB ? 'A' : 'B';
          }
        } else {
          // Deuce Off Mode (Default):
          // Direct race to the selected points (e.g. at 21, first to reach 21 wins outright)
          if (maxScore >= ptBreak) {
            isGameOver = true;
            winner = newScoreA > newScoreB ? 'A' : 'B';
          }
        }
        
        // Interval & Mid-game Court Change Logic
        let isIntervalBreak = currentGame.isIntervalBreak;
        let hasTakenInterval = currentGame.hasTakenInterval;
        let midGameCourtSwapped = Boolean(currentGame.midGameCourtSwapped);
        let newTeamsFlipped = state.teamsFlipped;

        const isBadminton = !state.config.sportType || state.config.sportType.toLowerCase() === 'badminton';
        const midpoint = getMidGameCourtChangePoint(ptBreak);

        // Applicable set for mid-game court change:
        // Case A: 1-set match, Set 1 (gameIndex === 0)
        // Case B: 3-set match, Set 3 (gameIndex === 2)
        const isApplicableSetForMidGameChange =
          isBadminton &&
          ((state.config.bestOfSets === 1 && gameIndex === 0) ||
           (state.config.bestOfSets === 3 && gameIndex === 2));

        // Normal Interval (triggered once when either side first reaches midpoint)
        if (!isGameOver && !hasTakenInterval && midpoint !== null && (newScoreA === midpoint || newScoreB === midpoint)) {
          isIntervalBreak = true;
          hasTakenInterval = true;
        }

        // Mid-game Court Change:
        // When either side FIRST reaches the configured midpoint, change court sides exactly once
        if (!isGameOver && isApplicableSetForMidGameChange && midpoint !== null && !midGameCourtSwapped && (newScoreA >= midpoint || newScoreB >= midpoint)) {
          midGameCourtSwapped = true;
          newTeamsFlipped = !state.teamsFlipped;
          isIntervalBreak = true;
          hasTakenInterval = true;
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
          continuousServicePointsA,
          continuousServicePointsB,
          maxContinuousPointsA,
          maxContinuousPointsB,
          lastRallyTimeMs: rallyTimeMs || 0,
          totalRallyTimeMs: currentGame.totalRallyTimeMs + (rallyTimeMs || 0),
          isIntervalBreak,
          hasTakenInterval,
          midGameCourtSwapped,
          teamsFlipped: newTeamsFlipped,
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
          teamsFlipped: newTeamsFlipped,
        });

        // Update practice match store when match completes
        if (matchWinner && state.config?.id) {
          const finalGames = newGames;
          const scoreA = finalGames.map(g => g.scoreA).join(',');
          const scoreB = finalGames.map(g => g.scoreB).join(',');
          usePracticeMatchStore.getState().updateRecord(state.config.id, {
            status: 'completed',
            winner: matchWinner,
            scoreA,
            scoreB,
          });
        }
        
        // API Call with Meta (skip for local storage practice matches)
        if (state.config.id && !state.config.id.startsWith('practice-')) {
          const sportType = state.config.sportType || 'BADMINTON';
          ScoringService.recordEvent(state.config.id, sportType, {
            eventValue: scoringTeam,
            eventType: 'POINT_SCORED',
            eventTime: new Date().toISOString()
          }).catch(() => {
            // Silently ignore sync errors for now
          });
        }
      },

      undoPoint: () => {
        const state = get();
        if (state.history.length === 0 || state.matchWinner) return;

        const gameIndex = state.currentGameIndex;
        const newHistory = [...state.history];
        const previousGameState = newHistory.pop()!;

        const newGames = [...state.games];
        newGames[gameIndex] = previousGameState;

        set({
          games: newGames,
          history: newHistory,
          matchWinner: null,
          teamsFlipped: previousGameState.teamsFlipped !== undefined 
            ? previousGameState.teamsFlipped 
            : state.teamsFlipped,
        });

        // Optimistic API Call (skip for local storage practice matches)
        if (state.config && state.config.id && !state.config.id.startsWith('practice-')) {
          const sportType = state.config.sportType || 'BADMINTON';
          ScoringService.recordEvent(state.config.id, sportType, {
            eventValue: previousGameState.winner || 'A',
            eventType: 'POINT_REVERTED',
            eventTime: new Date().toISOString()
          }).catch(err => console.error('Failed to revert score event', err));
        }
      },

      nextGame: () => {
        const state = get();
        if (!state.config || state.matchWinner) return;

        const currentGame = state.games[state.currentGameIndex];
        if (!currentGame.isGameOver) return;

        const nextServer = currentGame.winner || 'A';
        const isDoubles = state.config.category?.includes('Doubles');
        const newTeamsFlipped = !state.teamsFlipped; // Swap courts automatically for next set

        set({
          currentGameIndex: state.currentGameIndex + 1,
          games: [...state.games, getInitialGameState(isDoubles, nextServer, newTeamsFlipped)],
          history: [],
          teamsFlipped: newTeamsFlipped, // Swap courts automatically for next set
        });
      },

      continueFromInterval: () => {
        const state = get();
        if (!state.config || state.matchWinner) return;

        const gameIndex = state.currentGameIndex;
        const currentGame = state.games[gameIndex];
        if (currentGame.isGameOver || !currentGame.isIntervalBreak) return;

        const newGames = [...state.games];
        newGames[gameIndex] = {
          ...currentGame,
          isIntervalBreak: false,
        };

        set({
          games: newGames,
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
        const newTeamsFlipped = !state.teamsFlipped;
        const gameIndex = state.currentGameIndex;
        const newGames = [...state.games];
        if (newGames[gameIndex]) {
          newGames[gameIndex] = {
            ...newGames[gameIndex],
            teamsFlipped: newTeamsFlipped,
          };
        }
        set({ teamsFlipped: newTeamsFlipped, games: newGames });
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
    }),
    {
      name: 'athlon-badminton-match-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        currentGameIndex: state.currentGameIndex,
        games: state.games,
        history: state.history,
        matchWinner: state.matchWinner,
        teamsFlipped: state.teamsFlipped,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useMatchStore.subscribe((state) => {
    if (!state.config?.id || state.config.id.startsWith('practice-')) return;
    
    const currentGame = state.games[state.currentGameIndex];
    const payload = {
      ...state,
      teamAScore: currentGame ? String(currentGame.scoreA) : '0',
      teamBScore: currentGame ? String(currentGame.scoreB) : '0',
      isFinal: !!state.matchWinner
    };

    // Fire and forget POST to sync state to overlay & backend
    ScoringService.syncState(state.config.id, payload).catch(() => {
      // Silently ignore sync errors (e.g. for Team Event categories that don't have direct Match entities)
    });
  });
}
