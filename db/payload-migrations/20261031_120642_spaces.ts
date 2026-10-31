import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE TYPE "payload"."_locales" AS ENUM('en', 'az', 'ru');
  CREATE TYPE "payload"."enum_spaces_options_type" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  CREATE TYPE "payload"."enum_spaces_options_currency" AS ENUM('AZN', 'USD', 'EUR');
  CREATE TYPE "payload"."enum_spaces_amenities_cost" AS ENUM('included', 'paid');
  CREATE TYPE "payload"."enum_spaces_hours_day" AS ENUM('every-day', 'weekdays', 'weekends', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'public-holidays');
  CREATE TYPE "payload"."enum_spaces_hours_applies_to" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  CREATE TYPE "payload"."enum_spaces_info_topic" AS ENUM('house-rules', 'parking', 'payment-methods', 'cancellation-policy', 'discounts-packages', 'accessibility', 'access-security', 'locations', 'pricing-notes', 'events-community', 'pets', 'food-drink-policy', 'other');
  CREATE TYPE "payload"."enum_spaces_photos_category" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'event-space', 'phone-booth', 'capsule', 'common-area', 'kitchen-cafe', 'reception', 'building-exterior', 'other');
  CREATE TYPE "payload"."enum_spaces_district" AS ENUM('binagadi', 'garadagh', 'khatai', 'khazar', 'narimanov', 'nasimi', 'nizami', 'pirallahi', 'sabail', 'sabunchu', 'surakhani', 'yasamal');
  CREATE TYPE "payload"."enum_spaces_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__spaces_v_version_options_type" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  CREATE TYPE "payload"."enum__spaces_v_version_options_currency" AS ENUM('AZN', 'USD', 'EUR');
  CREATE TYPE "payload"."enum__spaces_v_version_amenities_cost" AS ENUM('included', 'paid');
  CREATE TYPE "payload"."enum__spaces_v_version_hours_day" AS ENUM('every-day', 'weekdays', 'weekends', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'public-holidays');
  CREATE TYPE "payload"."enum__spaces_v_version_hours_applies_to" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  CREATE TYPE "payload"."enum__spaces_v_version_info_topic" AS ENUM('house-rules', 'parking', 'payment-methods', 'cancellation-policy', 'discounts-packages', 'accessibility', 'access-security', 'locations', 'pricing-notes', 'events-community', 'pets', 'food-drink-policy', 'other');
  CREATE TYPE "payload"."enum__spaces_v_version_photos_category" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'event-space', 'phone-booth', 'capsule', 'common-area', 'kitchen-cafe', 'reception', 'building-exterior', 'other');
  CREATE TYPE "payload"."enum__spaces_v_version_district" AS ENUM('binagadi', 'garadagh', 'khatai', 'khazar', 'narimanov', 'nasimi', 'nizami', 'pirallahi', 'sabail', 'sabunchu', 'surakhani', 'yasamal');
  CREATE TYPE "payload"."enum__spaces_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__spaces_v_published_locale" AS ENUM('en', 'az', 'ru');
  CREATE TYPE "payload"."enum_amenities_category" AS ENUM('connectivity', 'food-drink', 'comfort', 'services', 'access-security', 'transport-parking', 'accessibility', 'other');
  CREATE TYPE "payload"."enum__posts_v_published_locale" AS ENUM('en', 'az', 'ru');
  CREATE TABLE "payload"."spaces_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "payload"."enum_spaces_options_type",
  	"name" varchar,
  	"seats" numeric,
  	"units" numeric,
  	"currency" "payload"."enum_spaces_options_currency" DEFAULT 'AZN',
  	"price_hour" numeric,
  	"price_evening" numeric,
  	"price_day" numeric,
  	"price_week" numeric,
  	"price_month" numeric,
  	"vat_included" boolean DEFAULT true,
  	"available" boolean DEFAULT true,
  	"minimum_booking" varchar,
  	"internal_note" varchar
  );
  
  CREATE TABLE "payload"."spaces_options_locales" (
  	"description" varchar,
  	"public_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."spaces_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amenity_id" integer,
  	"cost" "payload"."enum_spaces_amenities_cost" DEFAULT 'included'
  );
  
  CREATE TABLE "payload"."spaces_amenities_locales" (
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."spaces_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "payload"."enum_spaces_hours_day",
  	"applies_to" "payload"."enum_spaces_hours_applies_to",
  	"opens" varchar,
  	"closes" varchar,
  	"open24h" boolean,
  	"closed" boolean
  );
  
  CREATE TABLE "payload"."spaces_hours_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."spaces_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" "payload"."enum_spaces_info_topic",
  	"show_on_website" boolean DEFAULT true
  );
  
  CREATE TABLE "payload"."spaces_info_locales" (
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."spaces_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"category" "payload"."enum_spaces_photos_category",
  	"item" varchar,
  	"is_cover" boolean
  );
  
  CREATE TABLE "payload"."spaces_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."spaces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"code" varchar,
  	"capacity" numeric,
  	"verified" boolean DEFAULT false,
  	"city" varchar DEFAULT 'Baku',
  	"district" "payload"."enum_spaces_district",
  	"address" varchar,
  	"floor" varchar,
  	"metro" varchar,
  	"location" geometry(Point),
  	"google_maps_url" varchar,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"website" varchar,
  	"instagram" varchar,
  	"facebook" varchar,
  	"linkedin" varchar,
  	"contact_person" varchar,
  	"internal_notes" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_spaces_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."spaces_locales" (
  	"tagline" varchar,
  	"about" varchar,
  	"landmark" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_spaces_v_version_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "payload"."enum__spaces_v_version_options_type",
  	"name" varchar,
  	"seats" numeric,
  	"units" numeric,
  	"currency" "payload"."enum__spaces_v_version_options_currency" DEFAULT 'AZN',
  	"price_hour" numeric,
  	"price_evening" numeric,
  	"price_day" numeric,
  	"price_week" numeric,
  	"price_month" numeric,
  	"vat_included" boolean DEFAULT true,
  	"available" boolean DEFAULT true,
  	"minimum_booking" varchar,
  	"internal_note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_spaces_v_version_options_locales" (
  	"description" varchar,
  	"public_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_spaces_v_version_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"amenity_id" integer,
  	"cost" "payload"."enum__spaces_v_version_amenities_cost" DEFAULT 'included',
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_spaces_v_version_amenities_locales" (
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_spaces_v_version_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "payload"."enum__spaces_v_version_hours_day",
  	"applies_to" "payload"."enum__spaces_v_version_hours_applies_to",
  	"opens" varchar,
  	"closes" varchar,
  	"open24h" boolean,
  	"closed" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_spaces_v_version_hours_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_spaces_v_version_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" "payload"."enum__spaces_v_version_info_topic",
  	"show_on_website" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_spaces_v_version_info_locales" (
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_spaces_v_version_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"category" "payload"."enum__spaces_v_version_photos_category",
  	"item" varchar,
  	"is_cover" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_spaces_v_version_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_spaces_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_code" varchar,
  	"version_capacity" numeric,
  	"version_verified" boolean DEFAULT false,
  	"version_city" varchar DEFAULT 'Baku',
  	"version_district" "payload"."enum__spaces_v_version_district",
  	"version_address" varchar,
  	"version_floor" varchar,
  	"version_metro" varchar,
  	"version_location" geometry(Point),
  	"version_google_maps_url" varchar,
  	"version_phone" varchar,
  	"version_whatsapp" varchar,
  	"version_email" varchar,
  	"version_website" varchar,
  	"version_instagram" varchar,
  	"version_facebook" varchar,
  	"version_linkedin" varchar,
  	"version_contact_person" varchar,
  	"version_internal_notes" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__spaces_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__spaces_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_spaces_v_locales" (
  	"version_tagline" varchar,
  	"version_about" varchar,
  	"version_landmark" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."amenities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "payload"."enum_amenities_category" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."amenities_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload"."_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "payload"."_posts_v" ADD COLUMN "published_locale" "payload"."enum__posts_v_published_locale";
  ALTER TABLE "payload"."media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "spaces_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "amenities_id" integer;
  ALTER TABLE "payload"."spaces_options" ADD CONSTRAINT "spaces_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_options_locales" ADD CONSTRAINT "spaces_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_amenities" ADD CONSTRAINT "spaces_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "payload"."amenities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."spaces_amenities" ADD CONSTRAINT "spaces_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_amenities_locales" ADD CONSTRAINT "spaces_amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces_amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_hours" ADD CONSTRAINT "spaces_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_hours_locales" ADD CONSTRAINT "spaces_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_info" ADD CONSTRAINT "spaces_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_info_locales" ADD CONSTRAINT "spaces_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_photos" ADD CONSTRAINT "spaces_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."spaces_photos" ADD CONSTRAINT "spaces_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_photos_locales" ADD CONSTRAINT "spaces_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_locales" ADD CONSTRAINT "spaces_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_options" ADD CONSTRAINT "_spaces_v_version_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_options_locales" ADD CONSTRAINT "_spaces_v_version_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v_version_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_amenities" ADD CONSTRAINT "_spaces_v_version_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "payload"."amenities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_amenities" ADD CONSTRAINT "_spaces_v_version_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_amenities_locales" ADD CONSTRAINT "_spaces_v_version_amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v_version_amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_hours" ADD CONSTRAINT "_spaces_v_version_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_hours_locales" ADD CONSTRAINT "_spaces_v_version_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v_version_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_info" ADD CONSTRAINT "_spaces_v_version_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_info_locales" ADD CONSTRAINT "_spaces_v_version_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v_version_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_photos" ADD CONSTRAINT "_spaces_v_version_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_photos" ADD CONSTRAINT "_spaces_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_photos_locales" ADD CONSTRAINT "_spaces_v_version_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v_version_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v" ADD CONSTRAINT "_spaces_v_parent_id_spaces_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_locales" ADD CONSTRAINT "_spaces_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."amenities_locales" ADD CONSTRAINT "amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "spaces_options_order_idx" ON "payload"."spaces_options" USING btree ("_order");
  CREATE INDEX "spaces_options_parent_id_idx" ON "payload"."spaces_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "spaces_options_locales_locale_parent_id_unique" ON "payload"."spaces_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_options_locales_parent_id_idx" ON "payload"."spaces_options_locales" USING btree ("_parent_id");
  CREATE INDEX "spaces_amenities_order_idx" ON "payload"."spaces_amenities" USING btree ("_order");
  CREATE INDEX "spaces_amenities_parent_id_idx" ON "payload"."spaces_amenities" USING btree ("_parent_id");
  CREATE INDEX "spaces_amenities_amenity_idx" ON "payload"."spaces_amenities" USING btree ("amenity_id");
  CREATE UNIQUE INDEX "spaces_amenities_locales_locale_parent_id_unique" ON "payload"."spaces_amenities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_amenities_locales_parent_id_idx" ON "payload"."spaces_amenities_locales" USING btree ("_parent_id");
  CREATE INDEX "spaces_hours_order_idx" ON "payload"."spaces_hours" USING btree ("_order");
  CREATE INDEX "spaces_hours_parent_id_idx" ON "payload"."spaces_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "spaces_hours_locales_locale_parent_id_unique" ON "payload"."spaces_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_hours_locales_parent_id_idx" ON "payload"."spaces_hours_locales" USING btree ("_parent_id");
  CREATE INDEX "spaces_info_order_idx" ON "payload"."spaces_info" USING btree ("_order");
  CREATE INDEX "spaces_info_parent_id_idx" ON "payload"."spaces_info" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "spaces_info_locales_locale_parent_id_unique" ON "payload"."spaces_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_info_locales_parent_id_idx" ON "payload"."spaces_info_locales" USING btree ("_parent_id");
  CREATE INDEX "spaces_photos_order_idx" ON "payload"."spaces_photos" USING btree ("_order");
  CREATE INDEX "spaces_photos_parent_id_idx" ON "payload"."spaces_photos" USING btree ("_parent_id");
  CREATE INDEX "spaces_photos_image_idx" ON "payload"."spaces_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "spaces_photos_locales_locale_parent_id_unique" ON "payload"."spaces_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_photos_locales_parent_id_idx" ON "payload"."spaces_photos_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "spaces_code_idx" ON "payload"."spaces" USING btree ("code");
  CREATE UNIQUE INDEX "spaces_slug_idx" ON "payload"."spaces" USING btree ("slug");
  CREATE INDEX "spaces_updated_at_idx" ON "payload"."spaces" USING btree ("updated_at");
  CREATE INDEX "spaces_created_at_idx" ON "payload"."spaces" USING btree ("created_at");
  CREATE INDEX "spaces__status_idx" ON "payload"."spaces" USING btree ("_status");
  CREATE UNIQUE INDEX "spaces_locales_locale_parent_id_unique" ON "payload"."spaces_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_locales_parent_id_idx" ON "payload"."spaces_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_options_order_idx" ON "payload"."_spaces_v_version_options" USING btree ("_order");
  CREATE INDEX "_spaces_v_version_options_parent_id_idx" ON "payload"."_spaces_v_version_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_spaces_v_version_options_locales_locale_parent_id_unique" ON "payload"."_spaces_v_version_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_version_options_locales_parent_id_idx" ON "payload"."_spaces_v_version_options_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_amenities_order_idx" ON "payload"."_spaces_v_version_amenities" USING btree ("_order");
  CREATE INDEX "_spaces_v_version_amenities_parent_id_idx" ON "payload"."_spaces_v_version_amenities" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_amenities_amenity_idx" ON "payload"."_spaces_v_version_amenities" USING btree ("amenity_id");
  CREATE UNIQUE INDEX "_spaces_v_version_amenities_locales_locale_parent_id_unique" ON "payload"."_spaces_v_version_amenities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_version_amenities_locales_parent_id_idx" ON "payload"."_spaces_v_version_amenities_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_hours_order_idx" ON "payload"."_spaces_v_version_hours" USING btree ("_order");
  CREATE INDEX "_spaces_v_version_hours_parent_id_idx" ON "payload"."_spaces_v_version_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_spaces_v_version_hours_locales_locale_parent_id_unique" ON "payload"."_spaces_v_version_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_version_hours_locales_parent_id_idx" ON "payload"."_spaces_v_version_hours_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_info_order_idx" ON "payload"."_spaces_v_version_info" USING btree ("_order");
  CREATE INDEX "_spaces_v_version_info_parent_id_idx" ON "payload"."_spaces_v_version_info" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_spaces_v_version_info_locales_locale_parent_id_unique" ON "payload"."_spaces_v_version_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_version_info_locales_parent_id_idx" ON "payload"."_spaces_v_version_info_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_photos_order_idx" ON "payload"."_spaces_v_version_photos" USING btree ("_order");
  CREATE INDEX "_spaces_v_version_photos_parent_id_idx" ON "payload"."_spaces_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_photos_image_idx" ON "payload"."_spaces_v_version_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "_spaces_v_version_photos_locales_locale_parent_id_unique" ON "payload"."_spaces_v_version_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_version_photos_locales_parent_id_idx" ON "payload"."_spaces_v_version_photos_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_parent_idx" ON "payload"."_spaces_v" USING btree ("parent_id");
  CREATE INDEX "_spaces_v_version_version_code_idx" ON "payload"."_spaces_v" USING btree ("version_code");
  CREATE INDEX "_spaces_v_version_version_slug_idx" ON "payload"."_spaces_v" USING btree ("version_slug");
  CREATE INDEX "_spaces_v_version_version_updated_at_idx" ON "payload"."_spaces_v" USING btree ("version_updated_at");
  CREATE INDEX "_spaces_v_version_version_created_at_idx" ON "payload"."_spaces_v" USING btree ("version_created_at");
  CREATE INDEX "_spaces_v_version_version__status_idx" ON "payload"."_spaces_v" USING btree ("version__status");
  CREATE INDEX "_spaces_v_created_at_idx" ON "payload"."_spaces_v" USING btree ("created_at");
  CREATE INDEX "_spaces_v_updated_at_idx" ON "payload"."_spaces_v" USING btree ("updated_at");
  CREATE INDEX "_spaces_v_snapshot_idx" ON "payload"."_spaces_v" USING btree ("snapshot");
  CREATE INDEX "_spaces_v_published_locale_idx" ON "payload"."_spaces_v" USING btree ("published_locale");
  CREATE INDEX "_spaces_v_latest_idx" ON "payload"."_spaces_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_spaces_v_locales_locale_parent_id_unique" ON "payload"."_spaces_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_locales_parent_id_idx" ON "payload"."_spaces_v_locales" USING btree ("_parent_id");
  CREATE INDEX "amenities_updated_at_idx" ON "payload"."amenities" USING btree ("updated_at");
  CREATE INDEX "amenities_created_at_idx" ON "payload"."amenities" USING btree ("created_at");
  CREATE UNIQUE INDEX "amenities_name_idx" ON "payload"."amenities_locales" USING btree ("name","_locale");
  CREATE UNIQUE INDEX "amenities_locales_locale_parent_id_unique" ON "payload"."amenities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities_locales_parent_id_idx" ON "payload"."amenities_locales" USING btree ("_parent_id");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spaces_fk" FOREIGN KEY ("spaces_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "payload"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_posts_v_snapshot_idx" ON "payload"."_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "payload"."_posts_v" USING btree ("published_locale");
  CREATE INDEX "media_source_url_idx" ON "payload"."media" USING btree ("source_url");
  CREATE INDEX "payload_locked_documents_rels_spaces_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("spaces_id");
  CREATE INDEX "payload_locked_documents_rels_amenities_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("amenities_id");
  -- Spatial index for "Search this area" map queries
  CREATE INDEX "spaces_location_gist_idx" ON "payload"."spaces" USING gist ("location");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."spaces_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_amenities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_hours_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_amenities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_hours_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."amenities_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."spaces_options" CASCADE;
  DROP TABLE "payload"."spaces_options_locales" CASCADE;
  DROP TABLE "payload"."spaces_amenities" CASCADE;
  DROP TABLE "payload"."spaces_amenities_locales" CASCADE;
  DROP TABLE "payload"."spaces_hours" CASCADE;
  DROP TABLE "payload"."spaces_hours_locales" CASCADE;
  DROP TABLE "payload"."spaces_info" CASCADE;
  DROP TABLE "payload"."spaces_info_locales" CASCADE;
  DROP TABLE "payload"."spaces_photos" CASCADE;
  DROP TABLE "payload"."spaces_photos_locales" CASCADE;
  DROP TABLE "payload"."spaces" CASCADE;
  DROP TABLE "payload"."spaces_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_options" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_options_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_amenities" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_amenities_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_hours" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_hours_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_info" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_info_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_photos" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_photos_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v" CASCADE;
  DROP TABLE "payload"."_spaces_v_locales" CASCADE;
  DROP TABLE "payload"."amenities" CASCADE;
  DROP TABLE "payload"."amenities_locales" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_spaces_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_amenities_fk";
  
  DROP INDEX "payload"."_posts_v_snapshot_idx";
  DROP INDEX "payload"."_posts_v_published_locale_idx";
  DROP INDEX "payload"."media_source_url_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_spaces_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_amenities_id_idx";
  ALTER TABLE "payload"."_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "payload"."_posts_v" DROP COLUMN "published_locale";
  ALTER TABLE "payload"."media" DROP COLUMN "source_url";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "spaces_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "amenities_id";
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_spaces_options_type";
  DROP TYPE "payload"."enum_spaces_options_currency";
  DROP TYPE "payload"."enum_spaces_amenities_cost";
  DROP TYPE "payload"."enum_spaces_hours_day";
  DROP TYPE "payload"."enum_spaces_hours_applies_to";
  DROP TYPE "payload"."enum_spaces_info_topic";
  DROP TYPE "payload"."enum_spaces_photos_category";
  DROP TYPE "payload"."enum_spaces_district";
  DROP TYPE "payload"."enum_spaces_status";
  DROP TYPE "payload"."enum__spaces_v_version_options_type";
  DROP TYPE "payload"."enum__spaces_v_version_options_currency";
  DROP TYPE "payload"."enum__spaces_v_version_amenities_cost";
  DROP TYPE "payload"."enum__spaces_v_version_hours_day";
  DROP TYPE "payload"."enum__spaces_v_version_hours_applies_to";
  DROP TYPE "payload"."enum__spaces_v_version_info_topic";
  DROP TYPE "payload"."enum__spaces_v_version_photos_category";
  DROP TYPE "payload"."enum__spaces_v_version_district";
  DROP TYPE "payload"."enum__spaces_v_version_status";
  DROP TYPE "payload"."enum__spaces_v_published_locale";
  DROP TYPE "payload"."enum_amenities_category";
  DROP TYPE "payload"."enum__posts_v_published_locale";`)
}
