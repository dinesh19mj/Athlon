import { create } from 'zustand';
import { Player } from './useMatchStore';
import { ScoringService } from '../api/scoring';

export type Team = 'A' | 'B';
export type FootballHalf = 1 | 2 | 3 | 4; // 1, 2, 3 (ET1), 4 (ET2)

export interface MatchEvent {
  id: string;
  timeStr: string;
  team: Team | null;
  type: 'Goal' | 'Yellow' | 'Red' | 'Sub' | 'Foul' | 'Corner' | 'Offside' | 'Penalty' | 'Half' | 'VAR' | 'Match End';
  details: string;
}

export interface PausePeriod {
  start: number;
  end?: number;
}

export interface FootballState {
  goalsA: number;
  yellowCardsA: number;
  redCardsA: number;
  possessionA: number;
  shotsA: number;
  shotsOnTargetA: number;
  cornersA: number;
  foulsA: number;
  subsUsedA: number;
  
  goalsB: number;
  yellowCardsB: number;
  redCardsB: number;
  possessionB: number;
  shotsB: number;
  shotsOnTargetB: number;
  cornersB: number;
  foulsB: number;
  subsUsedB: number;
  
  playersA: Player[];
  playersB: Player[];
  
  currentHalf: FootballHalf;
  isMatchOver: boolean;
  winner: Team | 'Draw' | null;

  matchEvents: MatchEvent[];
  
  // Timer State
  matchStartTime: number | null; 
  isTimerRunning: boolean;
  pausePeriods: PausePeriod[]; 
  elapsedSecondsAtStart: number; 
}

export interface FootballConfig {
  id: string;
  sport: 'Football';
  halfLengthMinutes: number; 
  playersPerTeam: number;
  teamA: string;
  teamB: string;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  subsPerTeam?: number;
  tossWinner?: 'A' | 'B';
  tossDecision?: 'Kickoff' | 'Side';
}

export interface FootballStore extends FootballState {
  config: FootballConfig | null;
  history: FootballState[];
  
  // Actions
  setupMatch: (config: FootballConfig) => void;
  
  // Timer
  startHalf: () => void;
  togglePause: () => void;
  endHalf: () => void;
  
  // Events
  addGoalDetailed: (team: Team, scorerId?: string, assistId?: string, type?: 'Open Play' | 'Penalty' | 'Own Goal', timeStr?: string) => void;
  addCardDetailed: (team: Team, playerId: string, cardType: 'Yellow' | '2nd Yellow' | 'Red', reason?: string, timeStr?: string) => void;
  addSubstitutionDetailed: (team: Team, playerOutId: string, playerInId: string, timeStr?: string) => void;
  addMatchEvent: (event: Omit<MatchEvent, 'id'>) => void;
  
  // Advanced Stats
  setPossession: (teamAVal: number) => void;
  incrementStat: (team: Team, stat: 'shots' | 'shotsOnTarget' | 'corners' | 'fouls') => void;
  
  // Basic Actions
  addGoal: (team: Team) => void;
  addYellowCard: (team: Team) => void;
  addRedCard: (team: Team) => void;
  removeGoal: (team: Team) => void;
  endMatch: () => void;
  undoLastAction: () => void;
  resetMatch: () => void;
  substitutePlayer: (team: Team, playerOutId: string, playerInId: string) => void;
}

const getInitialState = (): FootballState => ({
  goalsA: 0,
  yellowCardsA: 0,
  redCardsA: 0,
  possessionA: 50,
  shotsA: 0,
  shotsOnTargetA: 0,
  cornersA: 0,
  foulsA: 0,
  subsUsedA: 0,
  
  goalsB: 0,
  yellowCardsB: 0,
  redCardsB: 0,
  possessionB: 50,
  shotsB: 0,
  shotsOnTargetB: 0,
  cornersB: 0,
  foulsB: 0,
  subsUsedB: 0,
  
  playersA: [],
  playersB: [],
  
  currentHalf: 1,
  isMatchOver: false,
  winner: null,
  
  matchEvents: [],
  
  matchStartTime: null,
  isTimerRunning: false,
  pausePeriods: [],
  elapsedSecondsAtStart: 0,
});

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useFootballStore = create<FootballStore>((set, get) => ({
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

  // TIMER LOGIC
  startHalf: () => set((state) => {
    if (state.isMatchOver || state.isTimerRunning) return state;
    return {
      history: [...state.history, state],
      isTimerRunning: true,
      matchStartTime: Date.now(),
      pausePeriods: [],
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr: state.currentHalf === 1 ? '00:00' : state.currentHalf === 2 ? '45:00' : '90:00',
        team: null,
        type: 'Half',
        details: `Half ${state.currentHalf} started`
      }]
    };
  }),

  togglePause: () => set((state) => {
    if (!state.matchStartTime || state.isMatchOver) return state;
    
    const now = Date.now();
    const isCurrentlyPaused = !state.isTimerRunning;
    const newPausePeriods = [...state.pausePeriods];
    
    if (isCurrentlyPaused) {
      // Resume: close the last pause period
      if (newPausePeriods.length > 0) {
        newPausePeriods[newPausePeriods.length - 1].end = now;
      }
    } else {
      // Pause: start a new pause period
      newPausePeriods.push({ start: now });
    }
    
    return {
      history: [...state.history, state],
      isTimerRunning: !isCurrentlyPaused,
      pausePeriods: newPausePeriods
    };
  }),

  endHalf: () => set((state) => {
    if (state.isMatchOver) return state;
    
    // Auto-pause if running
    const newPausePeriods = [...state.pausePeriods];
    if (state.isTimerRunning) {
      newPausePeriods.push({ start: Date.now(), end: Date.now() });
    }
    
    const nextHalf = (state.currentHalf + 1) as FootballHalf;
    
    // Save elapsed time for next half
    const halfLenSecs = (state.config?.halfLengthMinutes || 45) * 60;
    const newElapsed = state.currentHalf * halfLenSecs;
    
    return {
      history: [...state.history, state],
      isTimerRunning: false,
      matchStartTime: null,
      pausePeriods: [],
      elapsedSecondsAtStart: newElapsed,
      currentHalf: nextHalf > 4 ? 4 : nextHalf,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr: 'HT',
        team: null,
        type: 'Half',
        details: `Half ${state.currentHalf} ended`
      }]
    };
  }),

  // DETAILED EVENTS
  addGoalDetailed: (team, scorerId, assistId, type = 'Open Play', timeStr = "00:00") => set((state) => {
    if (state.isMatchOver) return state;
    
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const scorer = state[playersKey].find(p => p.id === scorerId);
    const assist = assistId ? state[playersKey].find(p => p.id === assistId) : null;
    
    let details = scorer ? scorer.name : 'Unknown Player';
    if (type === 'Own Goal') details += ' (OG)';
    else if (type === 'Penalty') details += ' (PEN)';
    
    if (assist) details += ` (Ast: ${assist.name})`;
    
    return {
      history: [...state.history, state],
      goalsA: team === 'A' ? state.goalsA + 1 : state.goalsA,
      goalsB: team === 'B' ? state.goalsB + 1 : state.goalsB,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr,
        team,
        type: 'Goal',
        details
      }]
    };
  }),

  addCardDetailed: (team, playerId, cardType, reason = '', timeStr = '00:00') => set((state) => {
    if (state.isMatchOver) return state;
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const players = [...state[playersKey]];
    const pIdx = players.findIndex(p => p.id === playerId);
    
    if (pIdx === -1) return state;
    const player = players[pIdx];
    
    let details = player.name;
    if (reason) details += ` (${reason})`;
    
    let isRed = false;
    let eventLabel = 'Yellow';
    
    if (cardType === 'Red') {
      isRed = true;
      eventLabel = 'Red';
    } else if (cardType === '2nd Yellow') {
      isRed = true;
      eventLabel = '2nd yellow → red';
    }
    
    if (isRed) {
      players[pIdx] = { ...players[pIdx], onField: false }; // Send off
    }
    
    return {
      history: [...state.history, state],
      [playersKey]: players,
      yellowCardsA: team === 'A' && !isRed ? state.yellowCardsA + 1 : state.yellowCardsA,
      yellowCardsB: team === 'B' && !isRed ? state.yellowCardsB + 1 : state.yellowCardsB,
      redCardsA: team === 'A' && isRed ? state.redCardsA + 1 : state.redCardsA,
      redCardsB: team === 'B' && isRed ? state.redCardsB + 1 : state.redCardsB,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr,
        team,
        type: cardType === 'Red' || cardType === '2nd Yellow' ? 'Red' : 'Yellow',
        details: `${eventLabel} — ${details}`
      }]
    };
  }),

  addSubstitutionDetailed: (team, playerOutId, playerInId, timeStr = '00:00') => set((state) => {
    if (state.isMatchOver) return state;
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const players = [...state[playersKey]];
    
    const outIndex = players.findIndex(p => p.id === playerOutId);
    const inIndex = players.findIndex(p => p.id === playerInId);
    
    let pOutName = 'Unknown';
    let pInName = 'Unknown';
    
    if (outIndex > -1 && inIndex > -1) {
      players[outIndex] = { ...players[outIndex], onField: false };
      players[inIndex] = { ...players[inIndex], onField: true };
      pOutName = players[outIndex].name;
      pInName = players[inIndex].name;
    }
    
    return {
      history: [...state.history, state],
      [playersKey]: players,
      subsUsedA: team === 'A' ? state.subsUsedA + 1 : state.subsUsedA,
      subsUsedB: team === 'B' ? state.subsUsedB + 1 : state.subsUsedB,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr,
        team,
        type: 'Sub',
        details: `${pInName} in, ${pOutName} out`
      }]
    };
  }),

  addMatchEvent: (event) => set((state) => ({
    history: [...state.history, state],
    matchEvents: [...state.matchEvents, { ...event, id: generateId() }]
  })),

  // ADVANCED STATS
  setPossession: (teamAVal) => set((state) => {
    if (state.isMatchOver) return state;
    const a = Math.max(0, Math.min(100, teamAVal));
    return {
      history: [...state.history, state],
      possessionA: a,
      possessionB: 100 - a
    };
  }),

  incrementStat: (team, stat) => set((state) => {
    if (state.isMatchOver) return state;
    const key = `${stat}${team}` as keyof FootballState;
    return {
      history: [...state.history, state],
      [key]: (state[key] as number) + 1
    };
  }),

  // BASIC ACTIONS (mostly legacy/simple)
  addGoal: (team) => set((state) => {
    if (state.isMatchOver) return state;
    return {
      history: [...state.history, state],
      goalsA: team === 'A' ? state.goalsA + 1 : state.goalsA,
      goalsB: team === 'B' ? state.goalsB + 1 : state.goalsB,
    };
  }),

  removeGoal: (team) => set((state) => {
    if (state.isMatchOver) return state;
    if (team === 'A' && state.goalsA === 0) return state;
    if (team === 'B' && state.goalsB === 0) return state;
    return {
      history: [...state.history, state],
      goalsA: team === 'A' ? state.goalsA - 1 : state.goalsA,
      goalsB: team === 'B' ? state.goalsB - 1 : state.goalsB,
    };
  }),

  addYellowCard: (team) => set((state) => {
    if (state.isMatchOver) return state;
    return {
      history: [...state.history, state],
      yellowCardsA: team === 'A' ? state.yellowCardsA + 1 : state.yellowCardsA,
      yellowCardsB: team === 'B' ? state.yellowCardsB + 1 : state.yellowCardsB,
    };
  }),

  addRedCard: (team) => set((state) => {
    if (state.isMatchOver) return state;
    return {
      history: [...state.history, state],
      redCardsA: team === 'A' ? state.redCardsA + 1 : state.redCardsA,
      redCardsB: team === 'B' ? state.redCardsB + 1 : state.redCardsB,
    };
  }),

  endMatch: () => set((state) => {
    let winner: Team | 'Draw' | null = null;
    if (state.goalsA > state.goalsB) winner = 'A';
    else if (state.goalsB > state.goalsA) winner = 'B';
    else winner = 'Draw';

    return {
      history: [...state.history, state],
      isMatchOver: true,
      winner
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

  substitutePlayer: (team, playerOutId, playerInId) => set((state) => {
    if (state.isMatchOver) return state;
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const players = [...state[playersKey]];
    
    const outIndex = players.findIndex(p => p.id === playerOutId);
    const inIndex = players.findIndex(p => p.id === playerInId);
    
    if (outIndex > -1 && inIndex > -1) {
      players[outIndex] = { ...players[outIndex], onField: false };
      players[inIndex] = { ...players[inIndex], onField: true };
    }
    
    return {
      history: [...state.history, state],
      [playersKey]: players
    };
  })

}));

if (typeof window !== 'undefined') {
  useFootballStore.subscribe((state) => {
    if (!state.config?.id) return;
    
    // Fire and forget POST to sync state to backend
    ScoringService.syncState(state.config.id, state).catch(err => 
      console.error('Failed to sync football state with backend', err)
    );
  });
}
