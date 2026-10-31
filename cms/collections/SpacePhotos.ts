import { revalidatePath } from 'next/cache'
import { APIError, type CollectionAfterChangeHook, type CollectionAfterDeleteHook, type CollectionBeforeValidateHook, type CollectionConfig, type PayloadRequest } from 'payload'
import { labelOf, photoCategories } from '@/lib/space-options'
import { isEditorOrAdmin } from '../access'

async function spaceById(req: PayloadRequest, id: unknown) {
  const spaceId = typeof id === 'object' && id !== null ? (id as { id: number }).id : (id as number | undefined)
  if (!spaceId) return null
  return req.payload.findByID({ collection: 'spaces', id: spaceId, depth: 0, draft: true, req })
}

// Store the file in the space's folder and give it a sensible alt text
const setFolderAndAlt: CollectionBeforeValidateHook = async ({ data, originalDoc, req, operation }) => {
  if (!data) return data
  const space = await spaceById(req, data.space ?? originalDoc?.space)
  if (!space) throw new APIError('Choose the space this photo belongs to.', 400)
  if (operation === 'create') {
    if (!space.storageFolder) throw new APIError(`Set a storage folder on "${space.name}" (Photos tab) before uploading photos.`, 400)
    data.prefix = space.storageFolder
  }
  if (!data.alt) data.alt = [space.name, data.item || labelOf(photoCategories, data.category)].filter(Boolean).join(' — ')
  return data
}

async function revalidateSpaceOf(req: PayloadRequest, space: unknown) {
  try {
    const doc = await spaceById(req, space)
    revalidatePath('/')
    revalidatePath('/spaces')
    if (doc?.slug) revalidatePath(`/spaces/${doc.slug}`)
  } catch {
    // Outside a Next.js request (scripts) there is nothing to revalidate
  }
}

const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateSpaceOf(req, doc.space)
  return doc
}

const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateSpaceOf(req, doc.space)
  return doc
}

// One row per gallery photo. Files live in the public bucket under <space storage folder>/<file>.
export const SpacePhotos: CollectionConfig = {
  slug: 'space-photos',
  labels: { singular: 'Space photo', plural: 'Space photos' },
  admin: { useAsTitle: 'alt', defaultColumns: ['filename', 'space', 'category', 'isCover', 'sortOrder'], group: 'Spaces', listSearchableFields: ['alt', 'item', 'filename'] },
  access: {
    read: () => true,
    create: isEditorOrAdmin,
    update: isEditorOrAdmin,
    delete: isEditorOrAdmin,
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    staticDir: 'media/spaces',
    focalPoint: true,
    adminThumbnail: 'thumb',
    // Keep originals at a sensible size for the full-screen viewer
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 400 },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
    ],
  },
  defaultSort: 'sortOrder',
  hooks: { beforeValidate: [setFolderAndAlt], afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    // Fixed after upload: the file already sits in this space's folder
    { name: 'space', type: 'relationship', relationTo: 'spaces', required: true, index: true, access: { update: () => false } },
    { type: 'row', fields: [{ name: 'category', type: 'select', options: photoCategories }, { name: 'item', label: 'Specific item', type: 'text', admin: { description: 'e.g. a meeting room name' } }] },
    { name: 'caption', type: 'text', localized: true },
    { type: 'row', fields: [{ name: 'isCover', label: 'Cover photo', type: 'checkbox', admin: { description: 'Shown first and on cards.' } }, { name: 'sortOrder', label: 'Order', type: 'number', defaultValue: 100, admin: { description: 'Lower numbers come first.' } }] },
    { name: 'alt', type: 'text', required: true, admin: { description: 'Filled in automatically if left empty.' } },
    // Where an imported photo came from, so re-running the import doesn't upload it twice
    { name: 'sourceUrl', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
