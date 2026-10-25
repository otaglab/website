import type { Access, FieldAccess, PayloadRequest } from 'payload'

// Admin: manages users and everything else. Editor: reviews and publishes. Author: writes drafts.
export const roles = ['admin', 'editor', 'author'] as const
export type Role = (typeof roles)[number]

export function roleOf(user: PayloadRequest['user']): Role | null {
  const role = (user as { role?: unknown } | null)?.role
  return roles.includes(role as Role) ? (role as Role) : null
}

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => roleOf(req.user) === 'admin'
export const isEditorOrAdmin: Access = ({ req }) => ['admin', 'editor'].includes(roleOf(req.user) ?? '')

export const adminFieldOnly: FieldAccess = ({ req }) => roleOf(req.user) === 'admin'
export const editorFieldOnly: FieldAccess = ({ req }) => ['admin', 'editor'].includes(roleOf(req.user) ?? '')
