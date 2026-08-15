import { Participant, Match, Bracket, MatchStatus } from '../core/types';
import { BracketGenerationError } from '../core/errors';
import { SeedingEngine } from './seeding';
import { ValidationEngine } from './validation';

const generateId = () => Math.random().toString(36).substring(2, 11);

export const KnockoutEngine = {
  /**
   * Generates a completely empty bracket of a given size for manual placement.
   */
  generateManualBracket(drawSize: number): Bracket {
    ValidationEngine.validateDrawSize(drawSize);

    const matches: Match[] = [];
    const numRounds = Math.log2(drawSize);

    // Generate matches for each round
    let matchesInRound = drawSize / 2;
    let roundMatchesMap: Map<number, Match[]> = new Map();

    for (let round = 1; round <= numRounds; round++) {
      const roundMatches: Match[] = [];
      for (let pos = 1; pos <= matchesInRound; pos++) {
        roundMatches.push({
          id: generateId(),
          participant1: null,
          participant2: null,
          status: MatchStatus.PENDING,
          round: round,
          position: pos
        });
      }
      roundMatchesMap.set(round, roundMatches);
      matches.push(...roundMatches);
      matchesInRound /= 2;
    }

    // Link matches (nextMatchId)
    for (let round = 1; round < numRounds; round++) {
      const currentRoundMatches = roundMatchesMap.get(round)!;
      const nextRoundMatches = roundMatchesMap.get(round + 1)!;
      
      for (let i = 0; i < currentRoundMatches.length; i++) {
        const nextMatchIndex = Math.floor(i / 2);
        currentRoundMatches[i].nextMatchId = nextRoundMatches[nextMatchIndex].id;
      }
    }

    return { matches, size: drawSize };
  },

  /**
   * Generates a bracket automatically, placing seeds and randomizing the rest.
   * Handles byes if participants.length < drawSize.
   */
  generateAutomaticBracket(participants: Participant[], drawSize: number): Bracket {
    ValidationEngine.validateDrawSize(drawSize);
    ValidationEngine.validateMinimumParticipants(participants, drawSize);
    ValidationEngine.validateNoDuplicates(participants);

    // 1. Place seeds
    let slots = SeedingEngine.placeSeeds(participants, drawSize);
    
    // 2. Separate remaining unseeded participants
    const unseeded = participants.filter(p => p.seed === undefined);
    
    // Shuffle unseeded participants (Fisher-Yates)
    for (let i = unseeded.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unseeded[i], unseeded[j]] = [unseeded[j], unseeded[i]];
    }

    // 3. Fill empty slots with unseeded participants
    let unseededIndex = 0;
    for (let i = 0; i < slots.length; i++) {
        if (slots[i] === null) {
            if (unseededIndex < unseeded.length) {
                slots[i] = unseeded[unseededIndex++];
            } else {
                // If we run out of participants, the remaining slots are Byes
                slots[i] = { id: `bye-${i}`, name: 'BYE', isBye: true };
            }
        }
    }

    // 4. Create the bracket structure and assign slots to Round 1 matches
    const bracket = this.generateManualBracket(drawSize);
    const round1Matches = bracket.matches.filter(m => m.round === 1).sort((a, b) => a.position! - b.position!);

    for (let i = 0; i < round1Matches.length; i++) {
        const match = round1Matches[i];
        match.participant1 = slots[i * 2];
        match.participant2 = slots[i * 2 + 1];
        
        // Auto-advance byes if needed (this can also be done during match resolution phase)
        if (match.participant1?.isBye && match.participant2?.isBye) {
             throw new BracketGenerationError("Invalid state: Two byes matched against each other.");
        }
    }

    return bracket;
  }
};
