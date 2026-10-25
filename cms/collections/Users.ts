import { APIError, type CollectionConfig } from 'payload'
import { adminFieldOnly, isAdmin, isLoggedIn, roleOf } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'] },
  auth: {
    // Lock an account for 15 minutes after 5 wrong passwords; sessions last 8 hours
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    // No public sign-up: only admins add accounts
    create: isAdmin,
    read: isLoggedIn,
    update: ({ req }) => (roleOf(req.user) === 'admin' ? true : req.user ? { id: { equals: req.user.id } } : false),
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation !== 'create' || req.user) return data
        // Only Payload's first-user screen (empty database) or the create-admin script get here.
        // In production the screen is closed so nobody can claim a fresh database.
        if (!req.context.trustedScript && process.env.NODE_ENV === 'production' && process.env.CMS_ALLOW_FIRST_ADMIN !== 'true') {
          throw new APIError('Creating the first admin from the browser is disabled in production. Run pnpm cms:create-admin instead.', 403)
        }
        return { ...data, role: 'admin' }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
      ],
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: { description: 'Admins manage users. Editors publish posts. Authors write drafts.' },
    },
  ],
}
