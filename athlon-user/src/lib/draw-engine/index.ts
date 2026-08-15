export * from './core/types';
export * from './core/errors';

export { KnockoutEngine } from './engines/knockout';
export { LeagueEngine } from './engines/league';
export { TeamLeagueEngine } from './engines/team-league';
export { ValidationEngine } from './engines/validation';
export { SeedingEngine } from './engines/seeding';
export { PoolEngine } from './engines/pool';
export { FixtureEngine } from './engines/fixture';
export { QualificationEngine } from './engines/qualification';
export { LineupEngine } from './engines/lineup';
export { TossEngine } from './engines/toss';
export { PublishEngine } from './engines/publish';

// DrawEngine facade to access all engines from one import
import { KnockoutEngine } from './engines/knockout';
import { LeagueEngine } from './engines/league';
import { TeamLeagueEngine } from './engines/team-league';
import { ValidationEngine } from './engines/validation';
import { SeedingEngine } from './engines/seeding';
import { PoolEngine } from './engines/pool';
import { FixtureEngine } from './engines/fixture';
import { QualificationEngine } from './engines/qualification';
import { LineupEngine } from './engines/lineup';
import { TossEngine } from './engines/toss';
import { PublishEngine } from './engines/publish';

export const DrawEngine = {
  Knockout: KnockoutEngine,
  League: LeagueEngine,
  TeamLeague: TeamLeagueEngine,
  Validation: ValidationEngine,
  Seeding: SeedingEngine,
  Pool: PoolEngine,
  Fixture: FixtureEngine,
  Qualification: QualificationEngine,
  Lineup: LineupEngine,
  Toss: TossEngine,
  Publish: PublishEngine
};
