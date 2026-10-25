// Usage: node --env-file-if-exists=.env.local scripts/db.mjs migrate|seed
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

const command = process.argv[2]
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
if (command !== 'migrate' && command !== 'seed') throw new Error('Expected "migrate" or "seed"')

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  if (command === 'seed') {
    await client.query(await readFile(join('db', 'seed.sql'), 'utf8'))
    console.log('Seeded coworking spaces')
  } else {
    await client.query('CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
    const { rows } = await client.query('SELECT name FROM _migrations')
    const applied = new Set(rows.map((row) => row.name))
    const files = (await readdir(join('db', 'migrations'))).filter((file) => file.endsWith('.sql')).sort()
    for (const file of files) {
      if (applied.has(file)) continue
      await client.query('BEGIN')
      try {
        await client.query(await readFile(join('db', 'migrations', file), 'utf8'))
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`Applied ${file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }
    console.log('Migrations up to date')
  }
} finally {
  await client.end()
}
