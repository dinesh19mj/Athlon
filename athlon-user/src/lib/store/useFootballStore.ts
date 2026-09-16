import { create } from 'zustand';
import { Player } from './useMatchStore';
import { ScoringService } from '../api/scoring';
import { usePracticeMatchStore } from './usePracticeMatchStore';

export type Team = 'A' | 'B';
export type FootballHalf = 1 | 2 | 3 | 4; // 1, 2, 3 (ET1), 4 (ET2)

export interface MatchEvent {
  id: string;
  timeStr: string;
  team: Team | null;
  type: 'Goal' | 'Yellow' | 'Red' | 'Sub' | 'Foul' | 'Corner' | 'Offside' | 'Penalty' | 'Half' | 'VAR' | 'Match End';
  details: string;
  scorerName?: string;
  assistName?: string;
  goalType?: 'Open Play' | 'Penalty' | 'Own Goal';
  penaltyOutcome?: 'Scored' | 'Missed' | 'Saved' | 'Awarded';
  foulingPlayerName?: string;
  penaltyReason?: string;
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
  isHalftimeBreak: boolean;
  addedStoppageMinutes: number;

  matchEvents: MatchEvent[];
  
  // Timer State
  matchStartTime: number | null; 
  isTimerRunning: boolean;
  accumulatedActiveSeconds: number;
  lastResumedTimestamp: number | null;
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
  
  // Timer & Halves
  startHalf: () => void;
  togglePause: () => void;
  endHalf: () => void;
  setHalftimeBreak: (isBreak: boolean) => void;
  setAddedStoppageMinutes: (mins: number) => void;
  resumePreviousHalf: () => void;
  
  // Events
  addGoalDetailed: (
    team: Team, 
    scorerId?: string, 
    assistId?: string, 
    type?: 'Open Play' | 'Penalty' | 'Own Goal', 
    timeStr?: string,
    foulingPlayerId?: string,
    penaltyReason?: string
  ) => void;
  recordPenaltyAttempt: (
    team: Team, 
    takerId: string, 
    outcome: 'Scored' | 'Missed' | 'Saved', 
    timeStr: string, 
    foulingPlayerId?: string,
    penaltyReason?: string
  ) => void;
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
  isHalftimeBreak: false,
  addedStoppageMinutes: 0,
  
  matchEvents: [],
  
  matchStartTime: null,
  isTimerRunning: false,
  accumulatedActiveSeconds: 0,
  lastResumedTimestamp: null,
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
    const halfLenSecs = (state.config?.halfLengthMinutes || 45) * 60;
    const startSecs = (state.currentHalf - 1) * halfLenSecs;
    const m = Math.floor(startSecs / 60);
    const s = startSecs % 60;
    const initialTimeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return {
      history: [...state.history, state],
      isTimerRunning: true,
      isHalftimeBreak: false,
      addedStoppageMinutes: 0,
      accumulatedActiveSeconds: startSecs,
      lastResumedTimestamp: Date.now(),
      matchStartTime: Date.now(),
      pausePeriods: [],
      elapsedSecondsAtStart: startSecs,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr: initialTimeStr,
        team: null,
        type: 'Half',
        details: `Half ${state.currentHalf} started`
      }]
    };
  }),

  togglePause: () => set((state) => {
    if (state.isMatchOver) return state;
    
    const now = Date.now();
    const isCurrentlyRunning = state.isTimerRunning;

    if (isCurrentlyRunning) {
      // Pause: snapshot accumulated active seconds
      const runningSessionSeconds = state.lastResumedTimestamp
        ? Math.floor((now - state.lastResumedTimestamp) / 1000)
        : 0;
      const updatedAccumulated = (state.accumulatedActiveSeconds ?? state.elapsedSecondsAtStart ?? 0) + runningSessionSeconds;

      return {
        history: [...state.history, state],
        isTimerRunning: false,
        accumulatedActiveSeconds: updatedAccumulated,
        lastResumedTimestamp: null
      };
    } else {
      // Resume: start running
      return {
        history: [...state.history, state],
        isTimerRunning: true,
        matchStartTime: state.matchStartTime || now,
        lastResumedTimestamp: now
      };
    }
  }),

  endHalf: () => set((state) => {
    if (state.isMatchOver) return state;
    
    const completedHalf = state.currentHalf;
    const nextHalf = (state.currentHalf + 1) as FootballHalf;
    const halfLenSecs = (state.config?.halfLengthMinutes || 45) * 60;
    const newHalfStartSecs = completedHalf * halfLenSecs;
    
    return {
      history: [...state.history, state],
      isTimerRunning: false,
      isHalftimeBreak: true,
      addedStoppageMinutes: 0,
      accumulatedActiveSeconds: newHalfStartSecs,
      lastResumedTimestamp: null,
      matchStartTime: null,
      pausePeriods: [],
      elapsedSecondsAtStart: newHalfStartSecs,
      currentHalf: nextHalf > 4 ? 4 : nextHalf,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr: 'HT',
        team: null,
        type: 'Half',
        details: `Half ${completedHalf} ended`
      }]
    };
  }),

  setHalftimeBreak: (isBreak: boolean) => set({ isHalftimeBreak: isBreak }),

  setAddedStoppageMinutes: (mins: number) => set((state) => ({
    history: [...state.history, state],
    addedStoppageMinutes: mins
  })),

  resumePreviousHalf: () => set((state) => {
    if (state.currentHalf <= 1) return state;
    const prevHalf = (state.currentHalf - 1) as FootballHalf;
    const halfLenSecs = (state.config?.halfLengthMinutes || 45) * 60;
    const prevHalfTargetSecs = prevHalf * halfLenSecs;

    return {
      history: [...state.history, state],
      currentHalf: prevHalf,
      isHalftimeBreak: false,
      isTimerRunning: false,
      accumulatedActiveSeconds: prevHalfTargetSecs,
      lastResumedTimestamp: null,
      matchStartTime: Date.now(),
      pausePeriods: [],
      elapsedSecondsAtStart: (prevHalf - 1) * halfLenSecs
    };
  }),

  // DETAILED EVENTS
  addGoalDetailed: (team, scorerId, assistId, type = 'Open Play', timeStr = "00:00", foulingPlayerId, penaltyReason) => set((state) => {
    if (state.isMatchOver) return state;
    
    // For Own Goal, points go to 'team', but scorer is from opposing team
    const playersKey = type === 'Own Goal'
      ? (team === 'A' ? 'playersB' : 'playersA')
      : (team === 'A' ? 'playersA' : 'playersB');

    const scorer = state[playersKey].find(p => p.id === scorerId);
    const assistTeamKey = team === 'A' ? 'playersA' : 'playersB';
    const assist = assistId ? state[assistTeamKey].find(p => p.id === assistId) : null;
    
    const oppPlayersKey = team === 'A' ? 'playersB' : 'playersA';
    const foulingPlayer = foulingPlayerId ? state[oppPlayersKey].find(p => p.id === foulingPlayerId) : null;
    const foulingPlayerName = foulingPlayer ? foulingPlayer.name : undefined;

    const scorerName = scorer ? scorer.name : 'Unknown Player';
    const assistName = assist ? assist.name : undefined;

    let details = scorerName;
    if (type === 'Own Goal') details += ' (OG)';
    else if (type === 'Penalty') {
      details += ' (PEN)';
      if (foulingPlayerName) details += ` (Fouled by: ${foulingPlayerName})`;
      if (penaltyReason) details += ` [${penaltyReason}]`;
    }
    if (assistName) details += ` (Ast: ${assistName})`;
    
    return {
      history: [...state.history, state],
      goalsA: team === 'A' ? state.goalsA + 1 : state.goalsA,
      goalsB: team === 'B' ? state.goalsB + 1 : state.goalsB,
      matchEvents: [...state.matchEvents, {
        id: generateId(),
        timeStr,
        team,
        type: 'Goal',
        details,
        scorerName,
        assistName,
        goalType: type,
        penaltyOutcome: type === 'Penalty' ? 'Scored' : undefined,
        foulingPlayerName,
        penaltyReason
      }]
    };
  }),

  recordPenaltyAttempt: (team: Team, takerId: string, outcome: 'Scored' | 'Missed' | 'Saved', timeStr: string, foulingPlayerId, penaltyReason) => set((state) => {
    if (state.isMatchOver) return state;
    const playersKey = team === 'A' ? 'playersA' : 'playersB';
    const taker = state[playersKey].find(p => p.id === takerId);
    const takerName = taker ? taker.name : 'Unknown Player';

    const oppPlayersKey = team === 'A' ? 'playersB' : 'playersA';
    const foulingPlayer = foulingPlayerId ? state[oppPlayersKey].find(p => p.id === foulingPlayerId) : null;
    const foulingPlayerName = foulingPlayer ? foulingPlayer.name : undefined;

    let detailStr = '';
    if (outcome === 'Scored') {
      detailStr = `${takerName} (PEN)`;
      if (foulingPlayerName) detailStr += ` (Fouled by ${foulingPlayerName})`;
      if (penaltyReason) detailStr += ` [${penaltyReason}]`;

      return {
        history: [...state.history, state],
        goalsA: team === 'A' ? state.goalsA + 1 : state.goalsA,
        goalsB: team === 'B' ? state.goalsB + 1 : state.goalsB,
        shotsA: team === 'A' ? state.shotsA + 1 : state.shotsA,
        shotsB: team === 'B' ? state.shotsB + 1 : state.shotsB,
        shotsOnTargetA: team === 'A' ? state.shotsOnTargetA + 1 : state.shotsOnTargetA,
        shotsOnTargetB: team === 'B' ? state.shotsOnTargetB + 1 : state.shotsOnTargetB,
        matchEvents: [...state.matchEvents, {
          id: generateId(),
          timeStr,
          team,
          type: 'Goal',
          details: detailStr,
          scorerName: takerName,
          goalType: 'Penalty',
          penaltyOutcome: 'Scored',
          foulingPlayerName,
          penaltyReason
        }]
      };
    } else if (outcome === 'Saved') {
      detailStr = `Penalty saved (${takerName})`;
      if (foulingPlayerName) detailStr += ` (Fouled by ${foulingPlayerName})`;
      if (penaltyReason) detailStr += ` [${penaltyReason}]`;

      return {
        history: [...state.history, state],
        shotsA: team === 'A' ? state.shotsA + 1 : state.shotsA,
        shotsB: team === 'B' ? state.shotsB + 1 : state.shotsB,
        shotsOnTargetA: team === 'A' ? state.shotsOnTargetA + 1 : state.shotsOnTargetA,
        shotsOnTargetB: team === 'B' ? state.shotsOnTargetB + 1 : state.shotsOnTargetB,
        matchEvents: [...state.matchEvents, {
          id: generateId(),
          timeStr,
          team,
          type: 'Penalty',
          details: detailStr,
          scorerName: takerName,
          goalType: 'Penalty',
          penaltyOutcome: 'Saved',
          foulingPlayerName,
          penaltyReason
        }]
      };
    } else {
      // Missed
      detailStr = `Penalty missed (${takerName})`;
      if (foulingPlayerName) detailStr += ` (Fouled by ${foulingPlayerName})`;
      if (penaltyReason) detailStr += ` [${penaltyReason}]`;

      return {
        history: [...state.history, state],
        shotsA: team === 'A' ? state.shotsA + 1 : state.shotsA,
        shotsB: team === 'B' ? state.shotsB + 1 : state.shotsB,
        matchEvents: [...state.matchEvents, {
          id: generateId(),
          timeStr,
          team,
          type: 'Penalty',
          details: detailStr,
          scorerName: takerName,
          goalType: 'Penalty',
          penaltyOutcome: 'Missed',
          foulingPlayerName,
          penaltyReason
        }]
      };
    }
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
    // Sync practice store for offline / device vault
    if (state.config?.id) {
      const winnerLabel =
        state.winner === 'A'
          ? state.config.teamA
          : state.winner === 'B'
          ? state.config.teamB
          : state.winner === 'Draw'
          ? 'Draw'
          : undefined;

      let winReason = '';
      if (state.isMatchOver) {
        if (state.goalsA > state.goalsB) {
          winReason = `${state.config.teamA} won ${state.goalsA} - ${state.goalsB}`;
        } else if (state.goalsB > state.goalsA) {
          winReason = `${state.config.teamB} won ${state.goalsB} - ${state.goalsA}`;
        } else {
          winReason = `Match Drawn ${state.goalsA} - ${state.goalsB}`;
        }
      }

      usePracticeMatchStore.getState().updateRecord(state.config.id, {
        status: state.isMatchOver ? 'completed' : 'live',
        scoreA: `${state.goalsA}`,
        scoreB: `${state.goalsB}`,
        winner: state.winner === 'A' || state.winner === 'B' ? state.winner : undefined,
        winnerLabel,
        winReason,
      });
    }

    if (!state.config?.id || state.config.id.startsWith('practice-')) return;

    const payload = {
      ...state,
      teamAScore: String(state.goalsA),
      teamBScore: String(state.goalsB),
      isFinal: state.isMatchOver
    };

    ScoringService.syncState(state.config.id, payload).catch(() => {
      // Silently ignore sync errors for offline mode
    });
  });
}
