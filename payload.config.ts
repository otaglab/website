import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Media } from './cms/collections/Media'
import { Posts } from './cms/collections/Posts'
import { Users } from './cms/collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const serverURL = process.env.NEXT_PUBLIC_SITE_URL

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') throw new Error('PAYLOAD_SECRET is not set')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me',
  serverURL,
  // Only accept admin requests from our own site
  csrf: serverURL ? [serverURL] : [],
  cors: serverURL ? [serverURL] : [],
  routes: { api: '/cms-api', admin: '/admin' },
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · OtagLab CMS' },
    importMap: { baseDir: dirname },
  },
  collections: [Posts, Media, Users],
  editor: lexicalEditor({ features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()] }),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    // Keep CMS tables apart from the coworking tables
    schemaName: 'payload',
    // Schema changes go through migrations, never auto-push
    push: false,
    migrationDir: path.resolve(dirname, 'db/payload-migrations'),
  }),
  graphQL: { disable: true },
  upload: { limits: { fileSize: 5 * 1024 * 1024 } },
  sharp,
  email: process.env.RESEND_API_KEY
    ? resendAdapter({ apiKey: process.env.RESEND_API_KEY, defaultFromAddress: `cms@${process.env.RESEND_EMAIL_DOMAIN || 'otaglab.com'}`, defaultFromName: 'OtagLab CMS' })
    : undefined,
  plugins: [
    // Images go to S3 when it's configured; otherwise they're stored on disk (local development)
    s3Storage({
      enabled: Boolean(process.env.NEON_S3_BUCKET),
      collections: { media: { prefix: 'media' } },
      bucket: process.env.NEON_S3_BUCKET || '',
      config: {
        region: process.env.NEON_S3_REGION ?? 'auto',
        endpoint: process.env.NEON_S3_ENDPOINT,
        forcePathStyle: true,
        credentials: { accessKeyId: process.env.NEON_S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.NEON_S3_SECRET_ACCESS_KEY || '' },
      },
    }),
  ],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
