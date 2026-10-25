import * as migration_20261025_084231_initial from './20261025_084231_initial';

export const migrations = [
  {
    up: migration_20261025_084231_initial.up,
    down: migration_20261025_084231_initial.down,
    name: '20261025_084231_initial'
  },
];
