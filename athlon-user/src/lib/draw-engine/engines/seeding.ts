import { Participant } from '../core/types';
import { BracketGenerationError } from '../core/errors';

export const SeedingEngine = {
  /**
   * Returns a map of Seed Number -> Position (1-indexed) in the draw
   * E.g. getSeedPositions(8) for seeds 1-8.
   */
  getSeedPositions(drawSize: number): Map<number, number> {
    if ((drawSize & (drawSize - 1)) !== 0) {
      throw new BracketGenerationError("Draw size must be a power of 2 for seeding");
    }

    const positions = new Map<number, number>();
    
    if (drawSize === 0) return positions;
    if (drawSize === 1) {
        positions.set(1, 1);
        return positions;
    }

    // Start with a draw of size 2 (seeds 1 and 2)
    let currentDraw = [1, 2];

    // Iteratively expand the draw size up to drawSize
    while (currentDraw.length < drawSize) {
      const nextDraw = [];
      const sum = currentDraw.length * 2 + 1; 
      
      for (const seed of currentDraw) {
        nextDraw.push(seed);         
        nextDraw.push(sum - seed);   
      }
      currentDraw = nextDraw;
    }

    // Now currentDraw holds the seeds in the order they should appear top-to-bottom.
    // e.g. for 8: [1, 8, 5, 4, 3, 6, 7, 2]
    for (let i = 0; i < currentDraw.length; i++) {
        // Map seed number -> 1-based position
        positions.set(currentDraw[i], i + 1);
    }
    
    return positions;
  },

  /**
   * Places seeded participants into an array representing the draw slots (1-indexed).
   * Unseeded participants are not placed by this function.
   */
  placeSeeds(participants: Participant[], drawSize: number): (Participant | null)[] {
    const slots = new Array(drawSize).fill(null);
    const seededPlayers = participants.filter(p => p.seed !== undefined).sort((a, b) => a.seed! - b.seed!);
    
    if (seededPlayers.length === 0) {
        return slots;
    }

    const seedPositions = this.getSeedPositions(drawSize);
    
    for (const player of seededPlayers) {
        const position = seedPositions.get(player.seed!);
        if (position !== undefined) {
            slots[position - 1] = player;
        } else {
            throw new BracketGenerationError(`Invalid seed ${player.seed} for draw size ${drawSize}`);
        }
    }
    
    return slots;
  }
};
