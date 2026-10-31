// Records the first CMS migration as applied when its tables already exist but the migration
// history is empty (the CMS schema was created before migrations were tracked).
// Safe to run any number of times: it only acts in exactly that situation.
// Usage: pnpm cms:baseline
import { sql } from '@payloadcms/db-postgres'
import config from '@payload-config'
import { getPayload } from 'payload'

const initial = '20261025_084231_initial'
// Tables created by the initial migration
const initialTables = ['posts', '_posts_v', 'media', 'users', 'users_sessions', 'payload_kv', 'payload_locked_documents', 'payload_preferences', 'payload_migrations']

const payload = await getPayload({ config })
const db = payload.db.drizzle

const { rows: tables } = await db.execute(sql`select table_name from information_schema.tables where table_schema = 'payload'`)
const existing = new Set(tables.map((row) => (row as { table_name: string }).table_name))
const missing = initialTables.filter((table) => !existing.has(table))

if (missing.length === initialTables.length) {
  console.log('CMS baseline: fresh database, nothing to do (migrations will create everything).')
} else if (missing.length) {
  console.error(`CMS baseline: the CMS schema is only partly there (missing ${missing.join(', ')}). Fix it by hand before migrating.`)
  process.exit(1)
} else {
  const { rows } = await db.execute(sql`select name from payload.payload_migrations`)
  if (rows.length) {
    console.log(`CMS baseline: migration history already recorded (${rows.length} entries), nothing to do.`)
  } else if (existing.has('spaces')) {
    console.error('CMS baseline: migration history is empty but later tables exist. Check the database by hand before migrating.')
    process.exit(1)
  } else {
    await db.execute(sql`insert into payload.payload_migrations (name, batch) values (${initial}, 1)`)
    console.log(`CMS baseline: recorded ${initial} as applied.`)
  }
}

await payload.destroy()
process.exit(0)
