import { Participant, Match, MatchStatus } from '../core/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

export const FixtureEngine = {
  /**
   * Generates a round-robin schedule for a given set of participants.
   * Ensures everyone plays everyone exactly once.
   */
  generateRoundRobin(participants: Participant[]): Match[] {
    const matches: Match[] = [];
    if (participants.length < 2) return matches;

    const ps = [...participants];
    // Add a dummy participant for odd numbers to act as a Bye
    if (ps.length % 2 !== 0) {
      ps.push({ id: 'dummy-bye', name: 'BYE', isBye: true });
    }

    const totalRounds = ps.length - 1;
    const matchesPerRound = ps.length / 2;

    for (let round = 0; round < totalRounds; round++) {
      for (let match = 0; match < matchesPerRound; match++) {
        const p1 = ps[match];
        const p2 = ps[ps.length - 1 - match];

        // Skip matches against the dummy "BYE"
        if (!p1.isBye && !p2.isBye) {
          matches.push({
            id: generateId(),
            participant1: p1,
            participant2: p2,
            status: MatchStatus.PENDING,
            round: round + 1
          });
        }
      }
      
      // Rotate array (Circle Method)
      // Keep index 0 fixed, rotate the rest clockwise
      const last = ps.pop()!;
      ps.splice(1, 0, last);
    }

    return matches;
  }
};
