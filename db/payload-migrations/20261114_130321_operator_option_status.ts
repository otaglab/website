import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_spaces_options_status" AS ENUM('published', 'draft');
  CREATE TYPE "payload"."enum__spaces_v_version_options_status" AS ENUM('published', 'draft');
  ALTER TABLE "payload"."spaces_options" ADD COLUMN "status" "payload"."enum_spaces_options_status" DEFAULT 'published';
  ALTER TABLE "payload"."spaces" ADD COLUMN "operator" varchar;
  ALTER TABLE "payload"."_spaces_v_version_options" ADD COLUMN "status" "payload"."enum__spaces_v_version_options_status" DEFAULT 'published';
  ALTER TABLE "payload"."_spaces_v" ADD COLUMN "version_operator" varchar;
  CREATE INDEX "spaces_operator_idx" ON "payload"."spaces" USING btree ("operator");
  CREATE INDEX "_spaces_v_version_version_operator_idx" ON "payload"."_spaces_v" USING btree ("version_operator");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "payload"."spaces_operator_idx";
  DROP INDEX "payload"."_spaces_v_version_version_operator_idx";
  ALTER TABLE "payload"."spaces_options" DROP COLUMN "status";
  ALTER TABLE "payload"."spaces" DROP COLUMN "operator";
  ALTER TABLE "payload"."_spaces_v_version_options" DROP COLUMN "status";
  ALTER TABLE "payload"."_spaces_v" DROP COLUMN "version_operator";
  DROP TYPE "payload"."enum_spaces_options_status";
  DROP TYPE "payload"."enum__spaces_v_version_options_status";`)
}
