import { revalidatePath } from 'next/cache'
import { APIError, type CollectionAfterChangeHook, type CollectionAfterDeleteHook, type CollectionConfig } from 'payload'
import { postCategories, postLanguages, postPath, slugify, type PostCategory } from '@/lib/insights'
import { editorFieldOnly, isEditorOrAdmin, isLoggedIn, roleOf } from '../access'

type PostRef = { category?: PostCategory | null; slug?: string | null } | undefined

// Refresh the public pages that show this post
function revalidatePost(post: PostRef) {
  if (!post?.category || !post.slug) return
  try {
    revalidatePath(postPath({ category: post.category, slug: post.slug }))
    revalidatePath(postPath({ category: post.category, slug: '' }).replace(/\/$/, ''))
  } catch {
    // Outside a Next.js request (scripts, migrations) there is nothing to revalidate
  }
}

const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidatePost(doc)
  if (previousDoc?.slug !== doc.slug || previousDoc?.category !== doc.category) revalidatePost(previousDoc)
  return doc
}

const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidatePost(doc)
  return doc
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'language', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'slug'],
    preview: (doc) => (doc.slug && doc.category ? `/api/preview?path=${encodeURIComponent(postPath(doc as { category: PostCategory; slug: string }))}` : null),
  },
  // Drafts and full version history; only editors and admins can publish
  versions: { drafts: true, maxPerDoc: 50 },
  access: {
    // Visitors only ever see published posts
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: isLoggedIn,
    // Authors can only edit their own posts
    update: ({ req }) => (roleOf(req.user) === 'author' ? { author: { equals: req.user!.id } } : isLoggedIn({ req })),
    delete: isEditorOrAdmin,
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (data._status === 'published' && roleOf(req.user) === 'author') {
          throw new APIError('Authors can save drafts. An editor or admin publishes them.', 403)
        }
        if (data._status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
        return data
      },
    ],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 160 },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'select', required: true, defaultValue: 'news', options: postCategories.map(({ value, label }) => ({ value, label })) },
        { name: 'language', type: 'select', required: true, defaultValue: 'en', options: postLanguages.map(({ value, name }) => ({ value, label: name })), admin: { description: 'The language this post is written in.' } },
      ],
    },
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 300, admin: { description: 'One or two sentences shown on cards and in search results.' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'event',
      type: 'group',
      admin: { condition: (data) => data?.category === 'event' },
      fields: [
        { type: 'row', fields: [{ name: 'startsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }, { name: 'endsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }] },
        { name: 'location', type: 'text' },
        { name: 'registrationUrl', type: 'text', validate: (value: string | null | undefined) => !value || /^https:\/\//.test(value) || 'Use a full https:// link' },
      ],
    },
    {
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', maxLength: 70, admin: { description: 'Defaults to the post title.' } },
        { name: 'description', type: 'textarea', maxLength: 160, admin: { description: 'Defaults to the excerpt.' } },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Image for social sharing. Defaults to the cover image.' } },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Generated from the title. Used in the URL.' },
      hooks: { beforeValidate: [({ value, data }) => slugify(value || data?.title || '')] },
    },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true, defaultValue: ({ user }) => user?.id, access: { update: editorFieldOnly }, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', description: 'Set automatically when first published.' } },
    {
      name: 'translationOf',
      type: 'relationship',
      relationTo: 'posts',
      admin: { position: 'sidebar', description: 'If this post is a translation, link the original. Used later for language switching.' },
    },
  ],
}
