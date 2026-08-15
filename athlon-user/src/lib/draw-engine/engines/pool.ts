import { Participant, Pool } from '../core/types';

export const PoolEngine = {
  /**
   * Distributes participants into a given number of pools.
   * Assigns seeded participants using a snake draft algorithm to balance pools.
   */
  assignPools(participants: Participant[], poolCount: number): Pool[] {
    const pools: Pool[] = Array.from({ length: poolCount }, (_, i) => ({
      id: `pool-${String.fromCharCode(65 + i)}`,
      name: `Pool ${String.fromCharCode(65 + i)}`,
      participants: [],
      fixtures: []
    }));

    if (participants.length === 0 || poolCount <= 0) return pools;

    const seeded = participants.filter(p => p.seed !== undefined).sort((a, b) => a.seed! - b.seed!);
    const unseeded = participants.filter(p => p.seed === undefined);
    
    for (let i = unseeded.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unseeded[i], unseeded[j]] = [unseeded[j], unseeded[i]];
    }

    let direction = 1;
    let poolIndex = 0;
    
    // Assign seeded
    for (const p of seeded) {
        pools[poolIndex].participants.push(p);
        poolIndex += direction;
        
        if (poolIndex >= poolCount) {
            poolIndex = poolCount - 1;
            direction = -1;
        } else if (poolIndex < 0) {
            poolIndex = 0;
            direction = 1;
        }
    }

    // Assign unseeded
    for (const p of unseeded) {
        pools[poolIndex].participants.push(p);
        poolIndex += direction;
        
        if (poolIndex >= poolCount) {
            poolIndex = poolCount - 1;
            direction = -1;
        } else if (poolIndex < 0) {
            poolIndex = 0;
            direction = 1;
        }
    }

    return pools;
  }
};
