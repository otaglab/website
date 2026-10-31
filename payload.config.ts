import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Amenities } from './cms/collections/Amenities'
import { Media } from './cms/collections/Media'
import { Posts } from './cms/collections/Posts'
import { SpacePhotos } from './cms/collections/SpacePhotos'
import { Spaces } from './cms/collections/Spaces'
import { Users } from './cms/collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const serverURL = process.env.NEXT_PUBLIC_SITE_URL

// Production deploys require PAYLOAD_SECRET (checked in scripts/vercel-build.mjs). Anywhere else a missing
// secret falls back so builds and preview deployments still work; CMS logins then reset on restart.
if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') console.warn('PAYLOAD_SECRET is not set; using a temporary secret')
const secret = process.env.PAYLOAD_SECRET || (process.env.NODE_ENV === 'production' ? randomBytes(32).toString('hex') : 'dev-only-secret-change-me')

export default buildConfig({
  secret,
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
  collections: [Spaces, SpacePhotos, Amenities, Posts, Media, Users],
  // Space texts are stored in all three languages; the site shows English until /az and /ru exist
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'az', label: 'Azərbaycanca' },
      { code: 'ru', label: 'Русский' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
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
    // Images go to Neon object storage when it's configured; otherwise they're stored on disk (local development)
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET && process.env.AWS_ENDPOINT_URL_S3),
      collections: {
        media: { prefix: 'media' },
        // The bucket is public: space photos load straight from it, one folder per space
        'space-photos': { disablePayloadAccessControl: true },
      },
      bucket: process.env.S3_BUCKET || '',
      // Same database columns whether or not storage is configured
      alwaysInsertFields: true,
      config: {
        region: process.env.AWS_REGION ?? 'auto',
        endpoint: process.env.AWS_ENDPOINT_URL_S3,
        forcePathStyle: true,
        credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '' },
      },
    }),
  ],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
