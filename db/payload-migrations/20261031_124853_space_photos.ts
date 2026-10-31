import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_space_photos_category" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'event-space', 'phone-booth', 'capsule', 'common-area', 'kitchen-cafe', 'reception', 'building-exterior', 'other');
  CREATE TABLE "payload"."space_photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"space_id" integer NOT NULL,
  	"category" "payload"."enum_space_photos_category",
  	"item" varchar,
  	"is_cover" boolean,
  	"sort_order" numeric DEFAULT 100,
  	"alt" varchar NOT NULL,
  	"source_url" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "payload"."space_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload"."spaces_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."spaces_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_spaces_v_version_photos_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."spaces_photos" CASCADE;
  DROP TABLE "payload"."spaces_photos_locales" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_photos" CASCADE;
  DROP TABLE "payload"."_spaces_v_version_photos_locales" CASCADE;
  ALTER TABLE "payload"."spaces" ADD COLUMN "storage_folder" varchar;
  ALTER TABLE "payload"."_spaces_v" ADD COLUMN "version_storage_folder" varchar;
  ALTER TABLE "payload"."media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "payload"."media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "space_photos_id" integer;
  ALTER TABLE "payload"."space_photos" ADD CONSTRAINT "space_photos_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "payload"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."space_photos_locales" ADD CONSTRAINT "space_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."space_photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "space_photos_space_idx" ON "payload"."space_photos" USING btree ("space_id");
  CREATE INDEX "space_photos_source_url_idx" ON "payload"."space_photos" USING btree ("source_url");
  CREATE INDEX "space_photos_updated_at_idx" ON "payload"."space_photos" USING btree ("updated_at");
  CREATE INDEX "space_photos_created_at_idx" ON "payload"."space_photos" USING btree ("created_at");
  CREATE UNIQUE INDEX "space_photos_filename_idx" ON "payload"."space_photos" USING btree ("filename");
  CREATE INDEX "space_photos_sizes_thumb_sizes_thumb_filename_idx" ON "payload"."space_photos" USING btree ("sizes_thumb_filename");
  CREATE INDEX "space_photos_sizes_card_sizes_card_filename_idx" ON "payload"."space_photos" USING btree ("sizes_card_filename");
  CREATE INDEX "space_photos_sizes_hero_sizes_hero_filename_idx" ON "payload"."space_photos" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "space_photos_locales_locale_parent_id_unique" ON "payload"."space_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "space_photos_locales_parent_id_idx" ON "payload"."space_photos_locales" USING btree ("_parent_id");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_space_photos_fk" FOREIGN KEY ("space_photos_id") REFERENCES "payload"."space_photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "spaces_storage_folder_idx" ON "payload"."spaces" USING btree ("storage_folder");
  CREATE INDEX "_spaces_v_version_version_storage_folder_idx" ON "payload"."_spaces_v" USING btree ("version_storage_folder");
  CREATE INDEX "payload_locked_documents_rels_space_photos_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("space_photos_id");
  DROP TYPE "payload"."enum_spaces_photos_category";
  DROP TYPE "payload"."enum__spaces_v_version_photos_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_spaces_photos_category" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'event-space', 'phone-booth', 'capsule', 'common-area', 'kitchen-cafe', 'reception', 'building-exterior', 'other');
  CREATE TYPE "payload"."enum__spaces_v_version_photos_category" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'event-space', 'phone-booth', 'capsule', 'common-area', 'kitchen-cafe', 'reception', 'building-exterior', 'other');
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
  
  ALTER TABLE "payload"."space_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."space_photos_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."space_photos" CASCADE;
  DROP TABLE "payload"."space_photos_locales" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_space_photos_fk";
  
  DROP INDEX "payload"."spaces_storage_folder_idx";
  DROP INDEX "payload"."_spaces_v_version_version_storage_folder_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_space_photos_id_idx";
  ALTER TABLE "payload"."spaces_photos" ADD CONSTRAINT "spaces_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."spaces_photos" ADD CONSTRAINT "spaces_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."spaces_photos_locales" ADD CONSTRAINT "spaces_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."spaces_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_photos" ADD CONSTRAINT "_spaces_v_version_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_photos" ADD CONSTRAINT "_spaces_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_spaces_v_version_photos_locales" ADD CONSTRAINT "_spaces_v_version_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_spaces_v_version_photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "spaces_photos_order_idx" ON "payload"."spaces_photos" USING btree ("_order");
  CREATE INDEX "spaces_photos_parent_id_idx" ON "payload"."spaces_photos" USING btree ("_parent_id");
  CREATE INDEX "spaces_photos_image_idx" ON "payload"."spaces_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "spaces_photos_locales_locale_parent_id_unique" ON "payload"."spaces_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spaces_photos_locales_parent_id_idx" ON "payload"."spaces_photos_locales" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_photos_order_idx" ON "payload"."_spaces_v_version_photos" USING btree ("_order");
  CREATE INDEX "_spaces_v_version_photos_parent_id_idx" ON "payload"."_spaces_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_spaces_v_version_photos_image_idx" ON "payload"."_spaces_v_version_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "_spaces_v_version_photos_locales_locale_parent_id_unique" ON "payload"."_spaces_v_version_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_spaces_v_version_photos_locales_parent_id_idx" ON "payload"."_spaces_v_version_photos_locales" USING btree ("_parent_id");
  ALTER TABLE "payload"."spaces" DROP COLUMN "storage_folder";
  ALTER TABLE "payload"."_spaces_v" DROP COLUMN "version_storage_folder";
  ALTER TABLE "payload"."media" DROP COLUMN "prefix";
  ALTER TABLE "payload"."media" DROP COLUMN "_objectkey";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "space_photos_id";
  DROP TYPE "payload"."enum_space_photos_category";`)
}
