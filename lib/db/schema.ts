import { pgTable, uuid, text, numeric, boolean, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const coworkingSpaces = pgTable('coworking_spaces', {
  id: uuid('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  district: text('district').notNull(),
  address: text('address').notNull(),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  priceFrom: numeric('price_from').notNull(),
  currency: text('currency').notNull(),
  workspaceTypes: text('workspace_types').array().notNull(),
  amenities: text('amenities').array().notNull(),
  status: text('status').notNull(),
  openingHours: jsonb('opening_hours').notNull(),
  verified: boolean('verified').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const coworkingSpaceImages = pgTable('coworking_space_images', {
  id: uuid('id').primaryKey(),
  spaceId: uuid('space_id').notNull(),
  objectKey: text('object_key').notNull().unique(),
  publicUrl: text('public_url'),
  altText: text('alt_text').notNull(),
  sortOrder: integer('sort_order').notNull(),
  isPrimary: boolean('is_primary').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})

export type CoworkingSpace = typeof coworkingSpaces.$inferSelect
export type CoworkingSpaceImage = typeof coworkingSpaceImages.$inferSelect
