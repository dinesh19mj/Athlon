import { create } from 'zustand';
import { Player } from './useMatchStore';
import { ScoringService } from '../api/scoring';
import { usePracticeMatchStore } from './usePracticeMatchStore';

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
  balls: number; // valid balls bowled
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

  // Innings tracking
  firstInningsTeam: Team;
  secondInningsTeam: Team;
  innings: 1 | 2;
  currentInnings: Team; // which team is currently batting
  currentOverHistory: Ball[];
  isMatchOver: boolean;
  isInningsBreak: boolean;
  isUmpireBreak: boolean;
  breakStartTime: number | null;
  winner: Team | 'TIE' | null;
  winReason: string;

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
  startSecondInnings: () => void;
  toggleUmpireBreak: (forceState?: boolean) => void;
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
  firstInningsTeam: 'A',
  secondInningsTeam: 'B',
  innings: 1,
  currentInnings: 'A',
  currentOverHistory: [],
  isMatchOver: false,
  isInningsBreak: false,
  isUmpireBreak: false,
  breakStartTime: null,
  winner: null,
  winReason: '',

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
  return JSON.parse(JSON.stringify(rest));
};

// Sync with local practice match storage
const syncPracticeStore = (state: CricketState, config: CricketConfig | null) => {
  if (!config?.id) return;
  const scoreA = `${state.runsA}/${state.wicketsA} (${Math.floor(state.validBallsA / 6)}.${state.validBallsA % 6} ov)`;
  const scoreB = `${state.runsB}/${state.wicketsB} (${Math.floor(state.validBallsB / 6)}.${state.validBallsB % 6} ov)`;
  
  const winnerLabel =
    state.winner === 'A'
      ? config.teamA
      : state.winner === 'B'
      ? config.teamB
      : state.winner === 'TIE'
      ? 'Tie'
      : undefined;

  usePracticeMatchStore.getState().updateRecord(config.id, {
    status: state.isMatchOver ? 'completed' : 'live',
    scoreA,
    scoreB,
    winner: state.winner === 'A' || state.winner === 'B' ? state.winner : undefined,
    winnerLabel,
    winReason: state.winReason,
  });
};

export const useCricketStore = create<CricketStore>((set, get) => ({
  ...getInitialState(),
  config: null,
  history: [],

  setupMatch: (config) => {
    const initialState = getInitialState();

    let firstInningsTeam: Team = 'A';
    if (config.tossWinner && config.tossDecision) {
      if (config.tossWinner === 'A') {
        firstInningsTeam = config.tossDecision === 'Batting' ? 'A' : 'B';
      } else {
        firstInningsTeam = config.tossDecision === 'Batting' ? 'B' : 'A';
      }
    }
    const secondInningsTeam: Team = firstInningsTeam === 'A' ? 'B' : 'A';

    const newState: CricketState = {
      ...initialState,
      firstInningsTeam,
      secondInningsTeam,
      innings: 1,
      currentInnings: firstInningsTeam,
      playersA: config.teamAPlayers || [],
      playersB: config.teamBPlayers || [],
    };

    set({
      config,
      ...newState,
      history: [],
    });

    syncPracticeStore(newState, config);
  },

  setMatchLineup: (strikerId, nonStrikerId, bowlerId) =>
    set((state) => ({
      history: [...state.history, snapshotState(state)],
      strikerId,
      nonStrikerId,
      currentBowlerId: bowlerId,
      batterStats: {
        ...state.batterStats,
        [strikerId]: state.batterStats[strikerId] || { runs: 0, balls: 0 },
        [nonStrikerId]: state.batterStats[nonStrikerId] || { runs: 0, balls: 0 },
      },
      bowlerStats: {
        ...state.bowlerStats,
        [bowlerId]: state.bowlerStats[bowlerId] || {
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
        },
      },
    })),

  setBowler: (bowlerId) =>
    set((state) => ({
      history: [...state.history, snapshotState(state)],
      currentBowlerId: bowlerId,
      bowlerStats: {
        ...state.bowlerStats,
        [bowlerId]: state.bowlerStats[bowlerId] || {
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
        },
      },
    })),

  swapStrike: () =>
    set((state) => ({
      history: [...state.history, snapshotState(state)],
      strikerId: state.nonStrikerId,
      nonStrikerId: state.strikerId,
    })),

  addRun: (runs) =>
    set((state) => {
      if (state.isMatchOver) return state;

      const battingTeam = state.currentInnings;
      const isA = battingTeam === 'A';
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

      // Update Batter Stats
      const bStats = { ...state.batterStats };
      if (state.strikerId) {
        const bs = bStats[state.strikerId] || { runs: 0, balls: 0 };
        bStats[state.strikerId] = { runs: bs.runs + runs, balls: bs.balls + 1 };
      }

      // Update Bowler Stats
      const bwStats = { ...state.bowlerStats };
      if (state.currentBowlerId) {
        const bs = bwStats[state.currentBowlerId] || {
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
        };
        bwStats[state.currentBowlerId] = { ...bs, balls: bs.balls + 1, runs: bs.runs + runs };
      }

      const pShip = {
        runs: state.partnership.runs + runs,
        balls: state.partnership.balls + 1,
      };

      let nextStriker = state.strikerId;
      let nextNonStriker = state.nonStrikerId;
      let nextBowler = state.currentBowlerId;
      let innings = state.innings;
      let currentInnings = state.currentInnings;
      let isInningsBreak = state.isInningsBreak;
      let matchOver = false;
      let winner: Team | 'TIE' | null = null;
      let winReason = '';

      // Rotate strike on odd runs
      if (runs % 2 !== 0) {
        const temp = nextStriker;
        nextStriker = nextNonStriker;
        nextNonStriker = temp;
      }

      const totalOversBalls = (state.config?.totalOvers || 5) * 6;
      const battingBalls = isA ? newBallsA : newBallsB;

      if (innings === 1) {
        // Check if 1st innings is finished by overs
        if (battingBalls >= totalOversBalls) {
          innings = 2;
          currentInnings = state.secondInningsTeam;
          newOverHistory = [];
          nextStriker = null;
          nextNonStriker = null;
          nextBowler = null;
          isInningsBreak = true;
        } else if (battingBalls > 0 && battingBalls % 6 === 0) {
          // Over ended
          newOverHistory = [];
          const temp = nextStriker;
          nextStriker = nextNonStriker;
          nextNonStriker = temp;
          nextBowler = null; // force selecting next bowler
        }
      } else {
        // INNINGS 2: Chasing Target
        const firstInningsRuns = state.firstInningsTeam === 'A' ? newRunsA : newRunsB;
        const targetRuns = firstInningsRuns + 1;
        const chasingRuns = state.secondInningsTeam === 'A' ? newRunsA : newRunsB;
        const chasingWickets = state.secondInningsTeam === 'A' ? state.wicketsA : state.wicketsB;
        const maxWickets = Math.max(1, (state.config?.playersPerTeam || 6) - 1);

        if (chasingRuns >= targetRuns) {
          // Target achieved!
          matchOver = true;
          winner = state.secondInningsTeam;
          const wicketsRemaining = Math.max(1, maxWickets - chasingWickets);
          const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
          winReason = `${winningTeamName} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
        } else if (battingBalls >= totalOversBalls) {
          // Overs finished in 2nd innings
          matchOver = true;
          if (chasingRuns > firstInningsRuns) {
            winner = state.secondInningsTeam;
            const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
            winReason = `${winningTeamName} won the match!`;
          } else if (chasingRuns < firstInningsRuns) {
            winner = state.firstInningsTeam;
            const runDiff = firstInningsRuns - chasingRuns;
            const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
            winReason = `${winningTeamName} won by ${runDiff} run${runDiff === 1 ? '' : 's'}`;
          } else {
            winner = 'TIE';
            winReason = 'Match Tied!';
          }
        } else if (battingBalls > 0 && battingBalls % 6 === 0) {
          // Over ended
          newOverHistory = [];
          const temp = nextStriker;
          nextStriker = nextNonStriker;
          nextNonStriker = temp;
          nextBowler = null;
        }
      }

      const nextState: CricketState = {
        ...state,
        runsA: newRunsA,
        runsB: newRunsB,
        validBallsA: newBallsA,
        validBallsB: newBallsB,
        currentOverHistory: newOverHistory,
        innings,
        currentInnings,
        isInningsBreak,
        isMatchOver: matchOver,
        winner,
        winReason,
        batterStats: bStats,
        bowlerStats: bwStats,
        partnership: pShip,
        strikerId: nextStriker,
        nonStrikerId: nextNonStriker,
        currentBowlerId: nextBowler,
      };

      syncPracticeStore(nextState, state.config);

      return {
        history: [...state.history, snapshotState(state)],
        ...nextState,
      };
    }),

  addExtra: (runs, extraType) =>
    set((state) => {
      if (state.isMatchOver) return state;

      const battingTeam = state.currentInnings;
      const isA = battingTeam === 'A';
      const isValidBall = extraType === 'B' || extraType === 'LB';
      const extraPenalty = extraType === 'WD' || extraType === 'NB' ? 1 : 0;
      const totalRuns = runs + extraPenalty;

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

      // Update Batter Stats
      const bStats = { ...state.batterStats };
      if (state.strikerId) {
        const bs = bStats[state.strikerId] || { runs: 0, balls: 0 };
        if (extraType !== 'WD') {
          bStats[state.strikerId] = { ...bs, balls: bs.balls + 1 };
        }
        if (extraType === 'NB' && runs > 0) {
          bStats[state.strikerId].runs += runs;
        }
      }

      // Update Bowler Stats
      const bwStats = { ...state.bowlerStats };
      if (state.currentBowlerId) {
        const bs = bwStats[state.currentBowlerId] || {
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
        };
        const newBw = { ...bs };
        if (isValidBall) newBw.balls += 1;

        if (extraType === 'WD') {
          newBw.wides += runs + 1;
          newBw.runs += runs + 1;
        } else if (extraType === 'NB') {
          newBw.noBalls += 1;
          newBw.runs += runs + 1;
        } else if (extraType === 'B') {
          newBw.byes += runs;
        } else if (extraType === 'LB') {
          newBw.legByes += runs;
        }

        bwStats[state.currentBowlerId] = newBw;
      }

      const pShip = {
        runs: state.partnership.runs + totalRuns,
        balls: state.partnership.balls + (extraType !== 'WD' ? 1 : 0),
      };

      let nextStriker = state.strikerId;
      let nextNonStriker = state.nonStrikerId;
      let nextBowler = state.currentBowlerId;
      let innings = state.innings;
      let currentInnings = state.currentInnings;
      let isInningsBreak = state.isInningsBreak;
      let matchOver = false;
      let winner: Team | 'TIE' | null = null;
      let winReason = '';

      // Strike rotates if runs scored is odd
      if (runs % 2 !== 0) {
        const temp = nextStriker;
        nextStriker = nextNonStriker;
        nextNonStriker = temp;
      }

      const totalOversBalls = (state.config?.totalOvers || 5) * 6;
      const battingBalls = isA ? newBallsA : newBallsB;

      if (innings === 1) {
        if (battingBalls >= totalOversBalls) {
          innings = 2;
          currentInnings = state.secondInningsTeam;
          newOverHistory = [];
          nextStriker = null;
          nextNonStriker = null;
          nextBowler = null;
          isInningsBreak = true;
        } else if (isValidBall && battingBalls > 0 && battingBalls % 6 === 0) {
          newOverHistory = [];
          const temp = nextStriker;
          nextStriker = nextNonStriker;
          nextNonStriker = temp;
          nextBowler = null;
        }
      } else {
        // INNINGS 2
        const firstInningsRuns = state.firstInningsTeam === 'A' ? newRunsA : newRunsB;
        const targetRuns = firstInningsRuns + 1;
        const chasingRuns = state.secondInningsTeam === 'A' ? newRunsA : newRunsB;
        const chasingWickets = state.secondInningsTeam === 'A' ? state.wicketsA : state.wicketsB;
        const maxWickets = Math.max(1, (state.config?.playersPerTeam || 6) - 1);

        if (chasingRuns >= targetRuns) {
          matchOver = true;
          winner = state.secondInningsTeam;
          const wicketsRemaining = Math.max(1, maxWickets - chasingWickets);
          const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
          winReason = `${winningTeamName} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
        } else if (battingBalls >= totalOversBalls) {
          matchOver = true;
          if (chasingRuns > firstInningsRuns) {
            winner = state.secondInningsTeam;
            const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
            winReason = `${winningTeamName} won the match!`;
          } else if (chasingRuns < firstInningsRuns) {
            winner = state.firstInningsTeam;
            const runDiff = firstInningsRuns - chasingRuns;
            const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
            winReason = `${winningTeamName} won by ${runDiff} run${runDiff === 1 ? '' : 's'}`;
          } else {
            winner = 'TIE';
            winReason = 'Match Tied!';
          }
        } else if (isValidBall && battingBalls > 0 && battingBalls % 6 === 0) {
          newOverHistory = [];
          const temp = nextStriker;
          nextStriker = nextNonStriker;
          nextNonStriker = temp;
          nextBowler = null;
        }
      }

      const nextState: CricketState = {
        ...state,
        runsA: newRunsA,
        runsB: newRunsB,
        validBallsA: newBallsA,
        validBallsB: newBallsB,
        currentOverHistory: newOverHistory,
        innings,
        currentInnings,
        isInningsBreak,
        isMatchOver: matchOver,
        winner,
        winReason,
        batterStats: bStats,
        bowlerStats: bwStats,
        partnership: pShip,
        strikerId: nextStriker,
        nonStrikerId: nextNonStriker,
        currentBowlerId: nextBowler,
      };

      syncPracticeStore(nextState, state.config);

      return {
        history: [...state.history, snapshotState(state)],
        ...nextState,
      };
    }),

  addWicket: (dismissalType, nextBatterId, fielderId) =>
    set((state) => {
      if (state.isMatchOver) return state;

      const battingTeam = state.currentInnings;
      const isA = battingTeam === 'A';
      const ball: Ball = { runs: 0, extra: null, isWicket: true, isValidBall: true };

      const newRunsA = state.runsA;
      const newRunsB = state.runsB;
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

      // Update Batter Stats
      const bStats = { ...state.batterStats };
      if (state.strikerId) {
        const bs = bStats[state.strikerId] || { runs: 0, balls: 0 };
        bStats[state.strikerId] = { ...bs, balls: bs.balls + 1 };
      }
      if (nextBatterId && nextBatterId !== 'none') {
        bStats[nextBatterId] = { runs: 0, balls: 0 };
      }

      // Update Bowler Stats
      const bwStats = { ...state.bowlerStats };
      if (state.currentBowlerId) {
        const bs = bwStats[state.currentBowlerId] || {
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
        };
        const isBowlerWicket = dismissalType !== 'run out';
        bwStats[state.currentBowlerId] = {
          ...bs,
          balls: bs.balls + 1,
          wickets: bs.wickets + (isBowlerWicket ? 1 : 0),
        };
      }

      const activeRuns = isA ? newRunsA : newRunsB;
      const activeWickets = isA ? newWicketsA : newWicketsB;
      const activeBalls = isA ? newBallsA : newBallsB;

      // Find batter name for Last Wicket display
      const teamPlayers = isA ? state.playersA : state.playersB;
      const strikerPlayer = teamPlayers.find((p) => p.id === state.strikerId);

      const lastWicket: WicketDetails = {
        batterId: strikerPlayer ? strikerPlayer.name : 'Batter',
        scoreAtWicket: `${activeRuns}/${activeWickets}`,
        overAtWicket: `${Math.floor((activeBalls - 1) / 6)}.${(activeBalls - 1) % 6}`,
      };

      let nextStriker = nextBatterId && nextBatterId !== 'none' ? nextBatterId : null;
      let nextNonStriker = state.nonStrikerId;
      let nextBowler = state.currentBowlerId;
      let innings = state.innings;
      let currentInnings = state.currentInnings;
      let isInningsBreak = state.isInningsBreak;
      let matchOver = false;
      let winner: Team | 'TIE' | null = null;
      let winReason = '';

      const totalOversBalls = (state.config?.totalOvers || 5) * 6;
      const maxWickets = Math.max(1, (state.config?.playersPerTeam || 6) - 1);
      const isAllOut = activeWickets >= maxWickets || nextBatterId === 'none';

      if (innings === 1) {
        if (activeBalls >= totalOversBalls || isAllOut) {
          // 1st innings complete!
          innings = 2;
          currentInnings = state.secondInningsTeam;
          newOverHistory = [];
          nextStriker = null;
          nextNonStriker = null;
          nextBowler = null;
          isInningsBreak = true;
        } else if (activeBalls > 0 && activeBalls % 6 === 0) {
          // Over ended
          newOverHistory = [];
          const temp = nextStriker;
          nextStriker = nextNonStriker;
          nextNonStriker = temp;
          nextBowler = null;
        }
      } else {
        // INNINGS 2: Chasing
        const firstInningsRuns = state.firstInningsTeam === 'A' ? newRunsA : newRunsB;
        const targetRuns = firstInningsRuns + 1;
        const chasingRuns = state.secondInningsTeam === 'A' ? newRunsA : newRunsB;

        if (chasingRuns >= targetRuns) {
          matchOver = true;
          winner = state.secondInningsTeam;
          const wicketsRemaining = Math.max(1, maxWickets - activeWickets);
          const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
          winReason = `${winningTeamName} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
        } else if (activeBalls >= totalOversBalls || isAllOut) {
          matchOver = true;
          if (chasingRuns > firstInningsRuns) {
            winner = state.secondInningsTeam;
            const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
            winReason = `${winningTeamName} won the match!`;
          } else if (chasingRuns < firstInningsRuns) {
            winner = state.firstInningsTeam;
            const runDiff = firstInningsRuns - chasingRuns;
            const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
            winReason = `${winningTeamName} won by ${runDiff} run${runDiff === 1 ? '' : 's'}`;
          } else {
            winner = 'TIE';
            winReason = 'Match Tied!';
          }
        } else if (activeBalls > 0 && activeBalls % 6 === 0) {
          newOverHistory = [];
          const temp = nextStriker;
          nextStriker = nextNonStriker;
          nextNonStriker = temp;
          nextBowler = null;
        }
      }

      const nextState: CricketState = {
        ...state,
        wicketsA: newWicketsA,
        wicketsB: newWicketsB,
        validBallsA: newBallsA,
        validBallsB: newBallsB,
        currentOverHistory: newOverHistory,
        innings,
        currentInnings,
        isInningsBreak,
        isMatchOver: matchOver,
        winner,
        winReason,
        batterStats: bStats,
        bowlerStats: bwStats,
        partnership: { runs: 0, balls: 0 },
        lastWicket,
        strikerId: nextStriker,
        nonStrikerId: nextNonStriker,
        currentBowlerId: nextBowler,
      };

      syncPracticeStore(nextState, state.config);

      return {
        history: [...state.history, snapshotState(state)],
        ...nextState,
      };
    }),

  undoLastBall: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const previousState = state.history[state.history.length - 1];
      syncPracticeStore(previousState, state.config);
      return {
        ...previousState,
        history: state.history.slice(0, -1),
      };
    }),

  endInnings: () =>
    set((state) => {
      if (state.isMatchOver) return state;

      if (state.innings === 1) {
        const nextState: CricketState = {
          ...state,
          innings: 2,
          currentInnings: state.secondInningsTeam,
          currentOverHistory: [],
          strikerId: null,
          nonStrikerId: null,
          currentBowlerId: null,
          partnership: { runs: 0, balls: 0 },
          isInningsBreak: true,
        };
        syncPracticeStore(nextState, state.config);
        return {
          history: [...state.history, snapshotState(state)],
          ...nextState,
        };
      } else {
        // Ending Innings 2 prematurely finishes match
        const firstInningsRuns = state.firstInningsTeam === 'A' ? state.runsA : state.runsB;
        const secondInningsRuns = state.secondInningsTeam === 'A' ? state.runsA : state.runsB;
        let winner: Team | 'TIE' | null = null;
        let winReason = '';

        if (secondInningsRuns > firstInningsRuns) {
          winner = state.secondInningsTeam;
          const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
          winReason = `${winningTeamName} won the match!`;
        } else if (secondInningsRuns < firstInningsRuns) {
          winner = state.firstInningsTeam;
          const runDiff = firstInningsRuns - secondInningsRuns;
          const winningTeamName = winner === 'A' ? state.config?.teamA : state.config?.teamB;
          winReason = `${winningTeamName} won by ${runDiff} run${runDiff === 1 ? '' : 's'}`;
        } else {
          winner = 'TIE';
          winReason = 'Match Tied!';
        }

        const nextState: CricketState = {
          ...state,
          isMatchOver: true,
          winner,
          winReason,
        };
        syncPracticeStore(nextState, state.config);
        return {
          history: [...state.history, snapshotState(state)],
          ...nextState,
        };
      }
    }),

  startSecondInnings: () =>
    set((state) => {
      const nextState: CricketState = {
        ...state,
        isInningsBreak: false,
      };
      syncPracticeStore(nextState, state.config);
      return {
        history: [...state.history, snapshotState(state)],
        ...nextState,
      };
    }),

  toggleUmpireBreak: (forceState?: boolean) =>
    set((state) => {
      const isBreak = typeof forceState === 'boolean' ? forceState : !state.isUmpireBreak;
      return {
        isUmpireBreak: isBreak,
        breakStartTime: isBreak ? Date.now() : null,
      };
    }),

  resetMatch: () =>
    set((state) => {
      const init = getInitialState();
      const firstInningsTeam: Team = state.config?.tossWinner === 'B' && state.config?.tossDecision === 'Batting' ? 'B' : 'A';
      const secondInningsTeam: Team = firstInningsTeam === 'A' ? 'B' : 'A';
      const newState: CricketState = {
        ...init,
        firstInningsTeam,
        secondInningsTeam,
        innings: 1,
        currentInnings: firstInningsTeam,
        playersA: state.config ? state.config.teamAPlayers : [],
        playersB: state.config ? state.config.teamBPlayers : [],
      };
      syncPracticeStore(newState, state.config);
      return {
        ...newState,
        config: state.config,
        history: [],
      };
    }),

  substitutePlayer: (team, playerOutId, playerInId) =>
    set((state) => {
      if (state.isMatchOver) return state;
      const playersKey = team === 'A' ? 'playersA' : 'playersB';
      const players = [...state[playersKey]];

      const outIndex = players.findIndex((p) => p.id === playerOutId);
      const inIndex = players.findIndex((p) => p.id === playerInId);

      if (outIndex > -1 && inIndex > -1) {
        players[outIndex] = { ...players[outIndex], onField: false };
        players[inIndex] = { ...players[inIndex], onField: true };
      }

      return {
        history: [...state.history, snapshotState(state)],
        [playersKey]: players,
      };
    }),
}));

if (typeof window !== 'undefined') {
  useCricketStore.subscribe((state) => {
    if (!state.config?.id || state.config.id.startsWith('practice-')) return;

    const payload = {
      ...state,
      teamAScore: `${state.runsA}/${state.wicketsA} (${Math.floor(state.validBallsA / 6)}.${state.validBallsA % 6} ov)`,
      teamBScore: `${state.runsB}/${state.wicketsB} (${Math.floor(state.validBallsB / 6)}.${state.validBallsB % 6} ov)`,
      isFinal: state.isMatchOver,
    };

    ScoringService.syncState(state.config.id, payload).catch(() => {
      // Silently ignore sync errors for offline mode
    });
  });
}
