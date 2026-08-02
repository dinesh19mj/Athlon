import { create } from 'zustand';
import { Player } from './useMatchStore';
import { ScoringService } from '../api/scoring';

export type Team = 'A' | 'B';
export type ExtraType = 'WD' | 'NB' | 'B' | 'LB' | null;

export interface Ball {
  runs: number;
  extra: ExtraType;
  isWicket: boolean;
  isValidBall: boolean;
}

export interface BatterStats {
  runs: number;
  balls: number;
}

export interface BowlerStats {
  balls: number; // convert to overs in UI (balls / 6)
  maidens: number;
  runs: number;
  wickets: number;
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export interface WicketDetails {
  batterId: string;
  scoreAtWicket: string;
  overAtWicket: string;
}

export interface CricketState {
  runsA: number;
  wicketsA: number;
  validBallsA: number;
  
  runsB: number;
  wicketsB: number;
  validBallsB: number;
  
  playersA: Player[];
  playersB: Player[];
  
  currentInnings: Team;
  currentOverHistory: Ball[];
  isMatchOver: boolean;
  winner: Team | null;

  // Advanced Stats
  strikerId: string | null;
  nonStrikerId: string | null;
  currentBowlerId: string | null;
  batterStats: Record<string, BatterStats>;
  bowlerStats: Record<string, BowlerStats>;
  partnership: { runs: number; balls: number };
  lastWicket: WicketDetails | null;
}

export interface CricketConfig {
  id: string;
  sport: 'Cricket';
  totalOvers: number;
  playersPerTeam: number;
  teamA: string;
  teamB: string;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  tossWinner?: Team;
  tossDecision?: 'Batting' | 'Bowling';
}

export interface CricketStore extends CricketState {
  config: CricketConfig | null;
  history: CricketState[];
  
  // Actions
  setupMatch: (config: CricketConfig) => void;
  setMatchLineup: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
  setBowler: (bowlerId: string) => void;
  swapStrike: () => void;
  addRun: (runs: number) => void;
  addExtra: (runs: number, extraType: ExtraType) => void;
  addWicket: (dismissalType: string, nextBatterId?: string, fielderId?: string) => void;
  undoLastBall: () => void;
  endInnings: () => void;
  resetMatch: () => void;
  substitutePlayer: (team: Team, playerOutId: string, playerInId: string) => void;
}

const getInitialState = (): CricketState => ({
  runsA: 0,
  wicketsA: 0,
  validBallsA: 0,
  runsB: 0,
  wicketsB: 0,
  validBallsB: 0,
  playersA: [],
  playersB: [],
  currentInnings: 'A',
  currentOverHistory: [],
  isMatchOver: false,
  winner: null,

  strikerId: null,
  nonStrikerId: null,
  currentBowlerId: null,
  batterStats: {},
  bowlerStats: {},
  partnership: { runs: 0, balls: 0 },
  lastWicket: null,
});

// Helper to snapshot current state for history
const snapshotState = (state: CricketStore): CricketState => {
  const { config, history, ...rest } = state;
  return JSON.parse(JSON.stringify(rest)); // Deep clone safe enough for this plain data
};

export const useCricketStore = create<CricketStore>((set, get) => ({
  ...getInitialState(),
  config: null,
  history: [],

  setupMatch: (config) => {
    const initialState = getInitialState();
    
    let initialInnings: Team = 'A';
    if (config.tossWinner && config.tossDecision) {
      if (config.tossWinner === 'A') {
        initialInnings = config.tossDecision === 'Batting' ? 'A' : 'B';
      } else {
        initialInnings = config.tossDecision === 'Batting' ? 'B' : 'A';
      }
    }

    set({
      config,
      ...initialState,
      playersA: config.teamAPlayers,
      playersB: config.teamBPlayers,
      currentInnings: initialInnings,
      history: []
    });
  },

  setMatchLineup: (strikerId, nonStrikerId, bowlerId) => set((state) => ({
    history: [...state.history, snapshotState(state)],
    strikerId,
    nonStrikerId,
    currentBowlerId: bowlerId,
    batterStats: {
      ...state.batterStats,
      [strikerId]: { runs: 0, balls: 0 },
      [nonStrikerId]: { runs: 0, balls: 0 },
    },
    bowlerStats: {
      ...state.bowlerStats,
      [bowlerId]: state.bowlerStats[bowlerId] || { balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 }
    }
  })),

  setBowler: (bowlerId) => set((state) => ({
    history: [...state.history, snapshotState(state)],
    currentBowlerId: bowlerId,
    bowlerStats: {
      ...state.bowlerStats,
      [bowlerId]: state.bowlerStats[bowlerId] || { balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 }
    }
  })),

  swapStrike: () => set((state) => {
    return {
      history: [...state.history, snapshotState(state)],
      strikerId: state.nonStrikerId,
      nonStrikerId: state.strikerId
    };
  }),

  addRun: (runs) => set((state) => {
    if (state.isMatchOver) return state;
    const isA = state.currentInnings === 'A';
    const ball: Ball = { runs, extra: null, isWicket: false, isValidBall: true };
    
    let newRunsA = state.runsA;
    let newRunsB = state.runsB;
    let newBallsA = state.validBallsA;
    let newBallsB = state.validBallsB;
    let newOverHistory = [...state.currentOverHistory, ball];
    
    if (isA) {
      newRunsA += runs;
      newBallsA += 1;
    } else {
      newRunsB += runs;
      newBallsB += 1;
    }

    // Stats Updates
    const bStats = { ...state.batterStats };
    if (state.strikerId) {
      const bs = bStats[state.strikerId] || { runs: 0, balls: 0 };
      bStats[state.strikerId] = { runs: bs.runs + runs, balls: bs.balls + 1 };
    }

    const bwStats = { ...state.bowlerStats };
    if (state.currentBowlerId) {
      const bs = bwStats[state.currentBowlerId] || { balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 };
      bwStats[state.currentBowlerId] = { ...bs, balls: bs.balls + 1, runs: bs.runs + runs };
    }

    const pShip = { runs: state.partnership.runs + runs, balls: state.partnership.balls + 1 };

    let matchOver: boolean = state.isMatchOver;
    let newInnings = state.currentInnings;
    let nextStriker = state.strikerId;
    let nextNonStriker = state.nonStrikerId;
    let nextBowler = state.currentBowlerId;
    
    if (state.config) {
      if (isA && newBallsA >= state.config.totalOvers * 6) {
        newInnings = 'B';
        newOverHistory = [];
        nextStriker = null; nextNonStriker = null; nextBowler = null; // reset for innings 2
      } else if (!isA && newBallsB >= state.config.totalOvers * 6) {
        matchOver = true;
      }
      if (!isA && newRunsB > newRunsA) {
        matchOver = true;
      }
    }
    
    // Rotate strike on odd runs
    if (runs % 2 !== 0) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
    }

    // End of over logic
    const activeBalls = isA ? newBallsA : newBallsB;
    if (activeBalls > 0 && activeBalls % 6 === 0) {
      newOverHistory = [];
      // Rotate strike at end of over
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
      nextBowler = null; // force bowler selection
    }

    return {
      history: [...state.history, snapshotState(state)],
      runsA: newRunsA,
      runsB: newRunsB,
      validBallsA: newBallsA,
      validBallsB: newBallsB,
      currentOverHistory: newOverHistory,
      currentInnings: newInnings,
      isMatchOver: matchOver,
      batterStats: bStats,
      bowlerStats: bwStats,
      partnership: pShip,
      strikerId: nextStriker,
      nonStrikerId: nextNonStriker,
      currentBowlerId: nextBowler
    };
  }),

  addExtra: (runs, extraType) => set((state) => {
    if (state.isMatchOver) return state;
    const isA = state.currentInnings === 'A';
    
    const isValidBall = extraType === 'B' || extraType === 'LB';
    const totalRuns = (extraType === 'WD' || extraType === 'NB') ? runs + 1 : runs;
    
    const ball: Ball = { runs: totalRuns, extra: extraType, isWicket: false, isValidBall };
    
    let newRunsA = state.runsA;
    let newRunsB = state.runsB;
    let newBallsA = state.validBallsA;
    let newBallsB = state.validBallsB;
    let newOverHistory = [...state.currentOverHistory, ball];
    
    if (isA) {
      newRunsA += totalRuns;
      if (isValidBall) newBallsA += 1;
    } else {
      newRunsB += totalRuns;
      if (isValidBall) newBallsB += 1;
    }

    // Stats
    const bStats = { ...state.batterStats };
    if (state.strikerId) {
      const bs = bStats[state.strikerId] || { runs: 0, balls: 0 };
      // NB counts as ball faced for batter, WD does not. Byes/LegByes count as ball faced.
      if (extraType !== 'WD') {
        bStats[state.strikerId] = { ...bs, balls: bs.balls + 1 };
      }
      // If it's a NB and batter scored runs off bat, add to batter runs
      if (extraType === 'NB' && runs > 0) {
          bStats[state.strikerId].runs += runs;
      }
    }

    const bwStats = { ...state.bowlerStats };
    if (state.currentBowlerId) {
      const bs = bwStats[state.currentBowlerId] || { balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 };
      const newBw = { ...bs };
      if (isValidBall) newBw.balls += 1;
      
      // Extras breakdown
      if (extraType === 'WD') { newBw.wides += (runs + 1); newBw.runs += (runs + 1); }
      if (extraType === 'NB') { newBw.noBalls += 1; newBw.runs += (runs + 1); } // NB itself is 1 run against bowler + runs off bat
      if (extraType === 'B') newBw.byes += runs; // Byes do not count against bowler's run analysis
      if (extraType === 'LB') newBw.legByes += runs; // Leg Byes do not count against bowler's run analysis
      
      bwStats[state.currentBowlerId] = newBw;
    }

    const pShip = { runs: state.partnership.runs + totalRuns, balls: state.partnership.balls + (extraType !== 'WD' ? 1 : 0) };

    let matchOver: boolean = state.isMatchOver;
    let newInnings = state.currentInnings;
    let nextStriker = state.strikerId;
    let nextNonStriker = state.nonStrikerId;
    let nextBowler = state.currentBowlerId;
    
    if (state.config) {
      if (isA && newBallsA >= state.config.totalOvers * 6) {
        newInnings = 'B';
        newOverHistory = [];
        nextStriker = null; nextNonStriker = null; nextBowler = null;
      } else if (!isA && newBallsB >= state.config.totalOvers * 6) {
        matchOver = true;
      }
      if (!isA && newRunsB > newRunsA) {
        matchOver = true;
      }
    }
    
    // Rotate strike on odd runs (runs off bat on NB, or byes/leg byes)
    if (runs % 2 !== 0) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
    }

    // End of over logic
    const activeBalls = isA ? newBallsA : newBallsB;
    if (isValidBall && activeBalls > 0 && activeBalls % 6 === 0) {
      newOverHistory = [];
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
      nextBowler = null; // force new bowler
    }

    return {
      history: [...state.history, snapshotState(state)],
      runsA: newRunsA,
      runsB: newRunsB,
      validBallsA: newBallsA,
      validBallsB: newBallsB,
      currentOverHistory: newOverHistory,
      currentInnings: newInnings,
      isMatchOver: matchOver,
      batterStats: bStats,
      bowlerStats: bwStats,
      partnership: pShip,
      strikerId: nextStriker,
      nonStrikerId: nextNonStriker,
      currentBowlerId: nextBowler
    };
  }),

  addWicket: (dismissalType, nextBatterId, fielderId) => set((state) => {
    if (state.isMatchOver) return state;
    const isA = state.currentInnings === 'A';
    const ball: Ball = { runs: 0, extra: null, isWicket: true, isValidBall: true };
    
    let newWicketsA = state.wicketsA;
    let newWicketsB = state.wicketsB;
    let newBallsA = state.validBallsA;
    let newBallsB = state.validBallsB;
    let newOverHistory = [...state.currentOverHistory, ball];
    
    if (isA) {
      newWicketsA += 1;
      newBallsA += 1;
    } else {
      newWicketsB += 1;
      newBallsB += 1;
    }

    // Stats
    const bStats = { ...state.batterStats };
    if (state.strikerId) {
      const bs = bStats[state.strikerId] || { runs: 0, balls: 0 };
      bStats[state.strikerId] = { ...bs, balls: bs.balls + 1 };
    }
    if (nextBatterId) {
        bStats[nextBatterId] = { runs: 0, balls: 0 };
    }

    const bwStats = { ...state.bowlerStats };
    if (state.currentBowlerId) {
      const bs = bwStats[state.currentBowlerId] || { balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 };
      const isBowlerWicket = dismissalType !== 'run out';
      bwStats[state.currentBowlerId] = { ...bs, balls: bs.balls + 1, wickets: bs.wickets + (isBowlerWicket ? 1 : 0) };
    }

    const activeRuns = isA ? state.runsA : state.runsB;
    const activeWickets = isA ? newWicketsA : newWicketsB;
    const activeBalls = isA ? newBallsA : newBallsB;
    
    // Find batter name for Last Wicket display
    const teamPlayers = isA ? state.playersA : state.playersB;
    const strikerPlayer = teamPlayers.find(p => p.id === state.strikerId);
    
    const lastWicket: WicketDetails = {
      batterId: strikerPlayer ? strikerPlayer.name : 'Unknown',
      scoreAtWicket: `${activeRuns}/${activeWickets}`,
      overAtWicket: `${Math.floor((activeBalls - 1) / 6)}.${(activeBalls - 1) % 6}`
    };

    let matchOver: boolean = state.isMatchOver;
    let newInnings = state.currentInnings;
    let nextStriker = nextBatterId || null;
    let nextNonStriker = state.nonStrikerId;
    let nextBowler = state.currentBowlerId;
    
    if (state.config) {
      const allOut = isA ? newWicketsA >= state.config.playersPerTeam - 1 : newWicketsB >= state.config.playersPerTeam - 1;
      
      if (isA && (newBallsA >= state.config.totalOvers * 6 || allOut)) {
        newInnings = 'B';
        newOverHistory = [];
        nextStriker = null; nextNonStriker = null; nextBowler = null;
      } else if (!isA && (newBallsB >= state.config.totalOvers * 6 || allOut)) {
        matchOver = true;
      }
    }
    
    // End of over logic
    if (activeBalls > 0 && activeBalls % 6 === 0) {
      newOverHistory = [];
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
      nextBowler = null;
    }

    return {
      history: [...state.history, snapshotState(state)],
      wicketsA: newWicketsA,
      wicketsB: newWicketsB,
      validBallsA: newBallsA,
      validBallsB: newBallsB,
      currentOverHistory: newOverHistory,
      currentInnings: newInnings,
      isMatchOver: matchOver,
      batterStats: bStats,
      bowlerStats: bwStats,
      partnership: { runs: 0, balls: 0 },
      lastWicket,
      strikerId: nextStriker,
      nonStrikerId: nextNonStriker,
      currentBowlerId: nextBowler
    };
  }),

  undoLastBall: () => set((state) => {
    if (state.history.length === 0) return state;
    const previousState = state.history[state.history.length - 1];
    return {
      ...previousState,
      history: state.history.slice(0, -1)
    };
  }),
  
  endInnings: () => set((state) => {
    if (state.currentInnings === 'A') {
      return {
        history: [...state.history, snapshotState(state)],
        currentInnings: 'B',
        currentOverHistory: [],
        strikerId: null,
        nonStrikerId: null,
        currentBowlerId: null
      }
    } else {
      return { isMatchOver: true };
    }
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
      history: [...state.history, snapshotState(state)],
      [playersKey]: players
    };
  })

}));

if (typeof window !== 'undefined') {
  useCricketStore.subscribe((state) => {
    if (!state.config?.id) return;
    
    ScoringService.syncState(state.config.id, state).catch(err => 
      console.error('Failed to sync cricket state with backend', err)
    );
  });
}
