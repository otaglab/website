import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "payload"."enum_spaces_options_type" ADD VALUE 'study-room' BEFORE 'event-space';
  ALTER TYPE "payload"."enum_spaces_hours_applies_to" ADD VALUE 'study-room' BEFORE 'event-space';
  ALTER TYPE "payload"."enum__spaces_v_version_options_type" ADD VALUE 'study-room' BEFORE 'event-space';
  ALTER TYPE "payload"."enum__spaces_v_version_hours_applies_to" ADD VALUE 'study-room' BEFORE 'event-space';
  ALTER TYPE "payload"."enum_space_photos_category" ADD VALUE 'study-room' BEFORE 'conference-room';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."spaces_options" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "payload"."enum_spaces_options_type";
  CREATE TYPE "payload"."enum_spaces_options_type" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  ALTER TABLE "payload"."spaces_options" ALTER COLUMN "type" SET DATA TYPE "payload"."enum_spaces_options_type" USING "type"::"payload"."enum_spaces_options_type";
  ALTER TABLE "payload"."spaces_hours" ALTER COLUMN "applies_to" SET DATA TYPE text;
  DROP TYPE "payload"."enum_spaces_hours_applies_to";
  CREATE TYPE "payload"."enum_spaces_hours_applies_to" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  ALTER TABLE "payload"."spaces_hours" ALTER COLUMN "applies_to" SET DATA TYPE "payload"."enum_spaces_hours_applies_to" USING "applies_to"::"payload"."enum_spaces_hours_applies_to";
  ALTER TABLE "payload"."_spaces_v_version_options" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "payload"."enum__spaces_v_version_options_type";
  CREATE TYPE "payload"."enum__spaces_v_version_options_type" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  ALTER TABLE "payload"."_spaces_v_version_options" ALTER COLUMN "type" SET DATA TYPE "payload"."enum__spaces_v_version_options_type" USING "type"::"payload"."enum__spaces_v_version_options_type";
  ALTER TABLE "payload"."_spaces_v_version_hours" ALTER COLUMN "applies_to" SET DATA TYPE text;
  DROP TYPE "payload"."enum__spaces_v_version_hours_applies_to";
  CREATE TYPE "payload"."enum__spaces_v_version_hours_applies_to" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'seminar-room', 'event-space', 'phone-booth', 'capsule', 'package', 'virtual-office', 'other');
  ALTER TABLE "payload"."_spaces_v_version_hours" ALTER COLUMN "applies_to" SET DATA TYPE "payload"."enum__spaces_v_version_hours_applies_to" USING "applies_to"::"payload"."enum__spaces_v_version_hours_applies_to";
  ALTER TABLE "payload"."space_photos" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "payload"."enum_space_photos_category";
  CREATE TYPE "payload"."enum_space_photos_category" AS ENUM('hot-desk', 'fixed-desk', 'cubicle-desk', 'private-office', 'meeting-room', 'conference-room', 'event-space', 'phone-booth', 'capsule', 'common-area', 'kitchen-cafe', 'reception', 'building-exterior', 'other');
  ALTER TABLE "payload"."space_photos" ALTER COLUMN "category" SET DATA TYPE "payload"."enum_space_photos_category" USING "category"::"payload"."enum_space_photos_category";`)
}
