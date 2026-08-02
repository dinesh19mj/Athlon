import { create } from 'zustand';
import { Player } from './useMatchStore';
import { ScoringService } from '../api/scoring';

export type Team = 'A' | 'B';

export interface SetScore {
  pointsA: number;
  pointsB: number;
}

export interface MatchEvent {
  id: string;
  timeStr: string;
  team: Team;
  type: 'Kill' | 'Ace' | 'Block' | 'Opponent Error' | 'Other';
  details: string;
  scoreStr: string;
}

export interface VolleyballState {
  pointsA: number;
  setsA: number;
  
  pointsB: number;
  setsB: number;
  
  playersA: Player[];
  playersB: Player[];
  
  currentSet: number;
  isMatchOver: boolean;
  winner: Team | null;

  // Advanced Stats
  servingTeam: Team | null;
  rotationPosA: number; // 1-6
  rotationPosB: number; // 1-6
  timeoutsA: number;
  timeoutsB: number;
  subsUsedA: number;
  subsUsedB: number;
  
  setScores: SetScore[];
  recentPoints: MatchEvent[];
}

export interface VolleyballConfig {
  id: string;
  sport: 'Volleyball';
  bestOfSets: 3 | 5;
  pointsPerSet: number; // e.g. 25
  teamA: string;
  teamB: string;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}

export interface VolleyballStore extends VolleyballState {
  config: VolleyballConfig | null;
  history: VolleyballState[];
  
  // Actions
  setupMatch: (config: VolleyballConfig) => void;
  addPointDetailed: (team: Team, type: MatchEvent['type'], scorerId?: string) => void;
  addSubstitutionDetailed: (team: Team, playerOffId: string, playerOnId: string, isLibero: boolean) => void;
  addTimeout: (team: Team) => void;
  undoLastAction: () => void;
  resetMatch: () => void;

  // Legacy mappings for backwards compatibility if needed
  addPoint: (team: Team) => void;
  undoLastPoint: () => void;
  substitutePlayer: (team: Team, playerOutId: string, playerInId: string) => void;
}

const getInitialState = (): VolleyballState => ({
  pointsA: 0,
  setsA: 0,
  pointsB: 0,
  setsB: 0,
  playersA: [],
  playersB: [],
  currentSet: 1,
  isMatchOver: false,
  winner: null,
  
  servingTeam: 'A', // Default to A serving first
  rotationPosA: 1,
  rotationPosB: 1,
  timeoutsA: 0,
  timeoutsB: 0,
  subsUsedA: 0,
  subsUsedB: 0,
  setScores: [],
  recentPoints: [],
});

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useVolleyballStore = create<VolleyballStore>((set, get) => ({
  ...getInitialState(),
  config: null,
  history: [],

  setupMatch: (config) => set({
    config,
    ...getInitialState(),
    playersA: config.teamAPlayers,
    playersB: config.teamBPlayers,
    history: []
  }),

  addPointDetailed: (team, type, scorerId) => set((state) => {
    if (state.isMatchOver || !state.config) return state;

    let newPointsA = state.pointsA;
    let newPointsB = state.pointsB;
    let newSetsA = state.setsA;
    let newSetsB = state.setsB;
    let newCurrentSet = state.currentSet;
    let newMatchOver: boolean = state.isMatchOver;
    let newWinner = state.winner;
    
    let newServingTeam = state.servingTeam;
    let newRotationA = state.rotationPosA;
    let newRotationB = state.rotationPosB;

    let newSetScores = [...state.setScores];
    let newTimeoutsA = state.timeoutsA;
    let newTimeoutsB = state.timeoutsB;
    let newSubsUsedA = state.subsUsedA;
    let newSubsUsedB = state.subsUsedB;

    // 1. Assign point
    if (team === 'A') newPointsA++;
    else newPointsB++;

    // 2. Handle Serve & Rotation (Side-out)
    if (state.servingTeam !== team) {
      newServingTeam = team;
      if (team === 'A') {
        newRotationA = newRotationA === 6 ? 1 : newRotationA + 1;
      } else {
        newRotationB = newRotationB === 6 ? 1 : newRotationB + 1;
      }
    }

    // 3. Check for Set Win
    const isDecidingSet = state.currentSet === state.config.bestOfSets;
    const targetPoints = isDecidingSet ? 15 : state.config.pointsPerSet;
    const hardCap = isDecidingSet ? 20 : 30;

    let setWonBy: Team | null = null;

    if (
      (newPointsA >= targetPoints && newPointsA - newPointsB >= 2) || 
      (newPointsA === hardCap)
    ) {
      setWonBy = 'A';
    } else if (
      (newPointsB >= targetPoints && newPointsB - newPointsA >= 2) || 
      (newPointsB === hardCap)
    ) {
      setWonBy = 'B';
    }

    if (setWonBy) {
      newSetScores.push({ pointsA: newPointsA, pointsB: newPointsB });
      
      if (setWonBy === 'A') newSetsA++;
      else newSetsB++;
      
      newPointsA = 0;
      newPointsB = 0;
      
      // Check Match Win
      const setsNeeded = Math.ceil(state.config.bestOfSets / 2);
      if (newSetsA >= setsNeeded) {
        newMatchOver = true;
        newWinner = 'A';
      } else if (newSetsB >= setsNeeded) {
        newMatchOver = true;
        newWinner = 'B';
      } else {
        // Not match over, move to next set
        newCurrentSet++;
        newTimeoutsA = 0;
        newTimeoutsB = 0;
        newSubsUsedA = 0;
        newSubsUsedB = 0;
        // The team that didn't serve first in the previous set serves first in the next.
        // Simplified: Alternate serves on new set, or keep logic simple by just giving to A for now.
        // Actually, let's keep servingTeam as whoever won the last point of the previous set for now.
      }
    }

    // 4. Log Event
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const scorer = scorerId ? state[playersKey].find(p => p.id === scorerId) : null;
    let details = scorer ? scorer.name : (type === 'Opponent Error' ? 'Opponent Error' : 'Unknown');
    if (type !== 'Opponent Error') {
        details = `${type.toLowerCase()} (${details})`;
    } else {
        details = `opponent error`;
    }

    const teamStr = team === 'A' ? (state.config.teamA || 'Team A') : (state.config.teamB || 'Team B');

    const newEvent: MatchEvent = {
      id: generateId(),
      timeStr: '', // Not strictly tracked in VB, but could use Date
      team,
      type,
      details: `${teamStr} · ${details}`,
      scoreStr: `${newPointsA}–${newPointsB}`
    };

    const newRecentPoints = [newEvent, ...state.recentPoints].slice(0, 10); // Keep last 10

    return {
      history: [...state.history, state],
      pointsA: newPointsA,
      pointsB: newPointsB,
      setsA: newSetsA,
      setsB: newSetsB,
      currentSet: newCurrentSet > state.config.bestOfSets ? state.config.bestOfSets : newCurrentSet,
      isMatchOver: newMatchOver,
      winner: newWinner,
      servingTeam: newServingTeam,
      rotationPosA: newRotationA,
      rotationPosB: newRotationB,
      setScores: newSetScores,
      recentPoints: newRecentPoints,
      timeoutsA: newTimeoutsA,
      timeoutsB: newTimeoutsB,
      subsUsedA: newSubsUsedA,
      subsUsedB: newSubsUsedB,
    };
  }),

  addSubstitutionDetailed: (team, playerOffId, playerOnId, isLibero) => set((state) => {
    if (state.isMatchOver) return state;
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const players = [...state[playersKey]];
    
    const outIndex = players.findIndex(p => p.id === playerOffId);
    const inIndex = players.findIndex(p => p.id === playerOnId);
    
    if (outIndex > -1 && inIndex > -1) {
      players[outIndex] = { ...players[outIndex], onField: false };
      players[inIndex] = { ...players[inIndex], onField: true };
    }
    
    return {
      history: [...state.history, state],
      [playersKey]: players,
      subsUsedA: team === 'A' && !isLibero ? state.subsUsedA + 1 : state.subsUsedA,
      subsUsedB: team === 'B' && !isLibero ? state.subsUsedB + 1 : state.subsUsedB,
    };
  }),

  addTimeout: (team) => set((state) => {
    if (state.isMatchOver) return state;
    return {
      history: [...state.history, state],
      timeoutsA: team === 'A' ? state.timeoutsA + 1 : state.timeoutsA,
      timeoutsB: team === 'B' ? state.timeoutsB + 1 : state.timeoutsB,
    };
  }),

  undoLastAction: () => set((state) => {
    if (state.history.length === 0) return state;
    const previousState = state.history[state.history.length - 1];
    return {
      ...previousState,
      history: state.history.slice(0, -1)
    };
  }),

  resetMatch: () => set((state) => ({
    ...getInitialState(),
    config: state.config,
    playersA: state.config ? state.config.teamAPlayers : [],
    playersB: state.config ? state.config.teamBPlayers : [],
    history: []
  })),

  // Legacy / Basic wrappers
  addPoint: (team) => get().addPointDetailed(team, 'Other'),
  undoLastPoint: () => get().undoLastAction(),
  substitutePlayer: (team, pOut, pIn) => get().addSubstitutionDetailed(team, pOut, pIn, false),

}));

if (typeof window !== 'undefined') {
  useVolleyballStore.subscribe((state) => {
    if (!state.config?.id) return;
    
    ScoringService.syncState(state.config.id, state).catch(err => 
      console.error('Failed to sync volleyball state with backend', err)
    );
  });
}
