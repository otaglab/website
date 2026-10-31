import * as migration_20261025_084231_initial from './20261025_084231_initial';
import * as migration_20261031_120642_spaces from './20261031_120642_spaces';

export const migrations = [
  {
    up: migration_20261025_084231_initial.up,
    down: migration_20261025_084231_initial.down,
    name: '20261025_084231_initial',
  },
  {
    up: migration_20261031_120642_spaces.up,
    down: migration_20261031_120642_spaces.down,
    name: '20261031_120642_spaces'
  },
];
