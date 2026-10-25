-- Coworking listings with PostGIS locations.
-- Safe to run on a fresh database or on one created with the earlier latitude/longitude columns.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS coworking_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  district text NOT NULL,
  address text NOT NULL,
  location geometry(Point, 4326),
  price_from numeric NOT NULL,
  currency text NOT NULL,
  workspace_types text[] NOT NULL,
  amenities text[] NOT NULL,
  status text NOT NULL,
  opening_hours jsonb NOT NULL,
  verified boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coworking_spaces ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Move any existing latitude/longitude values into the PostGIS column, then drop the old columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coworking_spaces' AND column_name = 'latitude') THEN
    UPDATE coworking_spaces
      SET location = ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)
      WHERE location IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;
    ALTER TABLE coworking_spaces DROP COLUMN latitude, DROP COLUMN longitude;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS coworking_spaces_location_idx ON coworking_spaces USING gist (location);

CREATE TABLE IF NOT EXISTS coworking_space_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES coworking_spaces(id) ON DELETE CASCADE,
  object_key text NOT NULL UNIQUE,
  public_url text,
  alt_text text NOT NULL,
  sort_order integer NOT NULL,
  is_primary boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coworking_space_images_space_id_idx ON coworking_space_images (space_id);
