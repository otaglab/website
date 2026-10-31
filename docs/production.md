# Production

How the OtagLab site's database and storage are set up, and how to ship changes safely.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Production value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon **main** branch, pooled | Usually set by the Neon integration |
| `DATABASE_URL_UNPOOLED` | Neon **main** branch, direct | Set by the Neon integration; used for migrations |
| `PAYLOAD_SECRET` | Long random string (`openssl rand -hex 32`) | Different from local. Changing it logs everyone out |
| `NEXT_PUBLIC_SITE_URL` | `https://otaglab.com` | Used for CMS security checks (CSRF/CORS) |
| `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Neon object storage keys | Same keys as development |
| `S3_BUCKET` | `workspace-gallery` | Public bucket, one folder per space |
| `RESEND_API_KEY`, `RESEND_EMAIL_DOMAIN` | Resend | Contact form, booking requests, CMS password resets |

The Google Drive variables are only needed on the computer that runs `pnpm spaces:import`, not on Vercel.

## How deploys migrate the database

Vercel runs `pnpm vercel-build` (`scripts/vercel-build.mjs`):

- **Production** deployments run `cms:baseline`, then `payload migrate`, then build. A failed migration fails the deploy, so the old version stays live.
- **Preview** deployments only build and never change the database schema.

`cms:baseline` is a one-time fix for databases whose CMS tables were created before migrations were tracked. It records the first migration as applied when (and only when) the CMS tables exist and the migration history is empty. Every later run does nothing.

## First production rollout

1. **Back up**: in the Neon console, create a branch from `main` named e.g. `main-backup-2026-11-01`.
2. **Set the environment variables** above for Production in Vercel.
3. **Merge** this work into `main`. The production deploy migrates the database (spaces, space photos, storage folders) and goes live.
4. **Import the spaces** into the main database, from a computer with the project set up. Temporarily point `DATABASE_URL` in `.env.local` at the **main** branch, then run:

   ```
   pnpm spaces:import "OtagLab - Operators - Coworking Spaces.xlsx" --folders BAK-001=lotfi-zadeh,BAK-002=city-global,BAK-003=unipoint
   ```

   Photos go to the same bucket folders as on the dev branch; files with the same name are simply rewritten. Point `.env.local` back at the dev branch afterwards.
5. **Check** `/spaces`, a space page with its gallery, and `/admin`.

If something goes wrong, restore by resetting `main` from the backup branch in the Neon console and redeploying the previous version in Vercel.

## Changing the database schema later

1. Change the CMS collections (`cms/collections/*`).
2. With `.env.local` pointing at the **dev** branch, run `pnpm cms:migrate:create <short-name>`, then `pnpm cms:migrate`, and test locally.
3. Run `pnpm cms:types` and commit the code together with the new file in `db/payload-migrations/`.
4. Merge to `main`; the production deploy applies the migration.

Never run `payload migrate:fresh` or edit an already-deployed migration file.
