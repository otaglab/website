import type { CollectionConfig } from 'payload'
import { isEditorOrAdmin, isLoggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isEditorOrAdmin,
  },
  upload: {
    // Raster images only: SVG can carry scripts
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    staticDir: 'media',
    focalPoint: true,
    adminThumbnail: 'card',
    imageSizes: [
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Describe the image for screen readers and search engines.' } },
    // Where an imported photo came from, so re-running the import doesn't upload it twice
    { name: 'sourceUrl', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
