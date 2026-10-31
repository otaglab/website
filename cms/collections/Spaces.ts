import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, FieldAccess } from 'payload'
import { slugify } from '@/lib/insights'
import { currencies, days, districts, infoTopics, workspaceTypes } from '@/lib/space-options'
import { isAdmin, isEditorOrAdmin } from '../access'

// Internal fields are hidden from visitors and the public API
const staffOnly: FieldAccess = ({ req }) => Boolean(req.user)

const optional = (check: (value: string) => boolean, message: string) => (value: string | null | undefined) => !value || check(value) || message
const isUrl = optional((value) => /^https?:\/\/\S+$/i.test(value), 'Use a full link starting with https://')
const isPhone = optional((value) => /^\+[0-9][0-9 ()-]{6,20}$/.test(value), 'Use international format, e.g. +994 50 123 45 67')
const isEmail = optional((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter a valid email')
const isTime = optional((value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value), 'Use 24h time, e.g. 09:00')
// Translated texts are required in English only; Azerbaijani and Russian fall back to English
const requiredInEnglish = (value: unknown, { req }: { req: { locale?: string | null } }) => req.locale !== 'en' || Boolean(value) || 'Required in English'

function revalidateSpace(slug?: string | null) {
  try {
    revalidatePath('/')
    revalidatePath('/spaces')
    if (slug) revalidatePath(`/spaces/${slug}`)
  } catch {
    // Outside a Next.js request (scripts, migrations) there is nothing to revalidate
  }
}

const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateSpace(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidateSpace(previousDoc.slug)
  return doc
}

const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSpace(doc.slug)
  return doc
}

const price = (name: string, label: string) => ({ name, label, type: 'number' as const, min: 0, admin: { width: '20%' } })

export const Spaces: CollectionConfig = {
  slug: 'spaces',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'district', '_status', 'updatedAt'],
    listSearchableFields: ['name', 'code', 'address'],
    group: 'Spaces',
    preview: (doc) => (doc.slug ? `/api/preview?path=${encodeURIComponent(`/spaces/${doc.slug}`)}` : null),
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: isEditorOrAdmin,
    update: isEditorOrAdmin,
    delete: isAdmin,
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'code', label: 'Space ID', type: 'text', required: true, unique: true, index: true, admin: { description: 'e.g. BAK-001. Never change it once used.' } },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'About',
          fields: [
            { name: 'tagline', type: 'text', localized: true, maxLength: 140 },
            { name: 'about', type: 'textarea', localized: true, validate: requiredInEnglish, admin: { description: 'Required in English.' } },
            { type: 'row', fields: [{ name: 'capacity', label: 'Total capacity (seats)', type: 'number', min: 0 }, { name: 'verified', type: 'checkbox', defaultValue: false, admin: { description: 'Shows a Verified badge.' } }] },
          ],
        },
        {
          label: 'Location',
          fields: [
            { type: 'row', fields: [{ name: 'city', type: 'text', required: true, defaultValue: 'Baku' }, { name: 'district', type: 'select', options: districts }] },
            { type: 'row', fields: [{ name: 'address', label: 'Street address', type: 'text', required: true }, { name: 'floor', label: 'Floor / office', type: 'text' }] },
            { type: 'row', fields: [{ name: 'metro', label: 'Nearest metro', type: 'text' }, { name: 'landmark', label: 'Landmark / how to find', type: 'text', localized: true }] },
            { name: 'location', type: 'point', admin: { description: 'Longitude and latitude. Find them by right-clicking the place in Google Maps.' } },
            { name: 'googleMapsUrl', label: 'Google Maps link', type: 'text', validate: isUrl },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { type: 'row', fields: [{ name: 'phone', type: 'text', validate: isPhone }, { name: 'whatsapp', label: 'WhatsApp', type: 'text', validate: isPhone }, { name: 'email', type: 'email', validate: isEmail }] },
            { type: 'row', fields: [{ name: 'website', type: 'text', validate: isUrl }, { name: 'instagram', type: 'text', validate: isUrl }] },
            { type: 'row', fields: [{ name: 'facebook', type: 'text', validate: isUrl }, { name: 'linkedin', label: 'LinkedIn', type: 'text', validate: isUrl }] },
          ],
        },
        {
          label: 'Workspace options',
          fields: [
            {
              name: 'options',
              type: 'array',
              labels: { singular: 'Option', plural: 'Options' },
              admin: { initCollapsed: true },
              fields: [
                { type: 'row', fields: [{ name: 'type', type: 'select', required: true, options: workspaceTypes }, { name: 'name', label: 'Option name', type: 'text' }] },
                { name: 'description', type: 'text', localized: true },
                { type: 'row', fields: [{ name: 'seats', label: 'Seats per unit', type: 'number', min: 0 }, { name: 'units', label: 'Number of units', type: 'number', min: 0 }, { name: 'currency', type: 'select', defaultValue: 'AZN', options: currencies }] },
                { type: 'row', fields: [price('priceHour', 'Price / hour'), price('priceEvening', 'Price / hour (evening)'), price('priceDay', 'Price / day'), price('priceWeek', 'Price / week'), price('priceMonth', 'Price / month')] },
                { type: 'row', fields: [{ name: 'vatIncluded', label: 'VAT included', type: 'checkbox', defaultValue: true }, { name: 'available', label: 'Available now', type: 'checkbox', defaultValue: true }, { name: 'minimumBooking', label: 'Minimum booking', type: 'text' }] },
                { name: 'publicNote', type: 'text', localized: true, admin: { description: 'Shown on the website, e.g. "Evening rate after 18:00".' } },
                { name: 'internalNote', type: 'textarea', access: { read: staffOnly }, admin: { description: 'Staff only. Never shown on the website.' } },
              ],
            },
          ],
        },
        {
          label: 'Amenities',
          fields: [
            {
              name: 'amenities',
              type: 'array',
              fields: [
                { type: 'row', fields: [{ name: 'amenity', type: 'relationship', relationTo: 'amenities', required: true }, { name: 'cost', type: 'select', defaultValue: 'included', options: [{ value: 'included', label: 'Included' }, { value: 'paid', label: 'Paid extra' }] }] },
                { name: 'details', type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: 'Opening hours',
          fields: [
            {
              name: 'hours',
              type: 'array',
              fields: [
                { type: 'row', fields: [{ name: 'day', type: 'select', required: true, options: days }, { name: 'appliesTo', label: 'Applies to', type: 'select', options: workspaceTypes, admin: { description: 'Leave empty for the whole space.' } }] },
                { type: 'row', fields: [{ name: 'opens', type: 'text', validate: isTime }, { name: 'closes', type: 'text', validate: isTime }, { name: 'open24h', label: 'Open 24h', type: 'checkbox' }, { name: 'closed', type: 'checkbox' }] },
                { name: 'note', type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: 'Additional info',
          fields: [
            {
              name: 'info',
              type: 'array',
              fields: [
                { type: 'row', fields: [{ name: 'topic', type: 'select', required: true, options: infoTopics }, { name: 'showOnWebsite', type: 'checkbox', defaultValue: true }] },
                { name: 'details', type: 'textarea', localized: true, validate: requiredInEnglish },
              ],
            },
          ],
        },
        {
          label: 'Photos',
          fields: [
            {
              name: 'storageFolder',
              type: 'text',
              unique: true,
              validate: (value: string | null | undefined) => !value || /^[a-z0-9][a-z0-9-]*$/.test(value) || 'Use lowercase letters, numbers and dashes',
              admin: { description: 'Folder in the photo bucket, e.g. lotfi-zadeh. Defaults to the page URL name. Changing it later does not move existing photos.' },
              hooks: { beforeValidate: [({ value, data }) => value || slugify(data?.slug || data?.name || '')] },
            },
            {
              name: 'gallery',
              type: 'join',
              collection: 'space-photos',
              on: 'space',
              defaultSort: 'sortOrder',
              defaultLimit: 100,
              admin: { description: 'Add photos from Spaces → Space photos. The cover photo comes first, then by order.', defaultColumns: ['filename', 'category', 'isCover', 'sortOrder'] },
            },
          ],
        },
        {
          label: 'Internal',
          fields: [
            { name: 'contactPerson', type: 'text', access: { read: staffOnly } },
            { name: 'internalNotes', type: 'textarea', access: { read: staffOnly } },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Generated from the name. Used in the URL.' },
      hooks: { beforeValidate: [({ value, data }) => slugify(value || data?.name || '')] },
    },
  ],
}
