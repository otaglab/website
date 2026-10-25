import { pgTable, uuid, text, numeric, boolean, integer, jsonb, timestamp, geometry, index } from 'drizzle-orm/pg-core'

export const coworkingSpaces = pgTable('coworking_spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  district: text('district').notNull(),
  address: text('address').notNull(),
  // PostGIS point in WGS 84 (SRID 4326); x = longitude, y = latitude
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }),
  priceFrom: numeric('price_from').notNull(),
  currency: text('currency').notNull(),
  workspaceTypes: text('workspace_types').array().notNull(),
  amenities: text('amenities').array().notNull(),
  status: text('status').notNull(),
  openingHours: jsonb('opening_hours').notNull(),
  verified: boolean('verified').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('coworking_spaces_location_idx').using('gist', table.location)])

export const coworkingSpaceImages = pgTable('coworking_space_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id').notNull().references(() => coworkingSpaces.id, { onDelete: 'cascade' }),
  objectKey: text('object_key').notNull().unique(),
  publicUrl: text('public_url'),
  altText: text('alt_text').notNull(),
  sortOrder: integer('sort_order').notNull(),
  isPrimary: boolean('is_primary').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type CoworkingSpace = typeof coworkingSpaces.$inferSelect
export type CoworkingSpaceImage = typeof coworkingSpaceImages.$inferSelect
