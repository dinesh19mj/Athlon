import { Participant, Pool } from '../core/types';
import { PoolEngine } from './pool';
import { FixtureEngine } from './fixture';
import { ValidationEngine } from './validation';

export const LeagueEngine = {
  /**
   * Generates pools and their round-robin fixtures automatically.
   */
  generateLeague(participants: Participant[], poolCount: number): Pool[] {
    ValidationEngine.validateNoDuplicates(participants);
    
    const pools = PoolEngine.assignPools(participants, poolCount);
    
    for (const pool of pools) {
      pool.fixtures = FixtureEngine.generateRoundRobin(pool.participants);
    }
    
    return pools;
  }
};
