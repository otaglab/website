// Vercel runs this instead of `build` (it prefers a "vercel-build" script).
// Production deployments migrate the database first; preview deployments only build.
import { execSync } from 'node:child_process'

const run = (command, env = process.env) => execSync(command, { stdio: 'inherit', env })

if (process.env.VERCEL_ENV === 'production') {
  for (const name of ['DATABASE_URL', 'PAYLOAD_SECRET']) {
    if (!process.env[name]) throw new Error(`${name} is not set for Production`)
  }
  // Migrations use Neon's direct connection when available; the pooler is meant for app traffic
  const migrateEnv = { ...process.env, DATABASE_URL: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL }
  console.log('Production deploy: applying CMS migrations')
  run('pnpm payload run scripts/cms-baseline.ts', migrateEnv)
  run('pnpm payload migrate', migrateEnv)
} else {
  console.log(`Skipping migrations (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'not set'})`)
}

run('pnpm build')
