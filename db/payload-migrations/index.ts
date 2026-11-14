import * as migration_20261025_084231_initial from './20261025_084231_initial';
import * as migration_20261031_120642_spaces from './20261031_120642_spaces';
import * as migration_20261031_124853_space_photos from './20261031_124853_space_photos';
import * as migration_20261114_130321_operator_option_status from './20261114_130321_operator_option_status';

export const migrations = [
  {
    up: migration_20261025_084231_initial.up,
    down: migration_20261025_084231_initial.down,
    name: '20261025_084231_initial',
  },
  {
    up: migration_20261031_120642_spaces.up,
    down: migration_20261031_120642_spaces.down,
    name: '20261031_120642_spaces',
  },
  {
    up: migration_20261031_124853_space_photos.up,
    down: migration_20261031_124853_space_photos.down,
    name: '20261031_124853_space_photos',
  },
  {
    up: migration_20261114_130321_operator_option_status.up,
    down: migration_20261114_130321_operator_option_status.down,
    name: '20261114_130321_operator_option_status'
  },
];
