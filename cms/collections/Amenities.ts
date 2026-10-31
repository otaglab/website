import type { CollectionConfig } from 'payload'
import { amenityCategories } from '@/lib/space-options'
import { isAdmin, isEditorOrAdmin } from '../access'

// One shared list of amenities so spaces use the same names and filters stay consistent
export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category'], group: 'Spaces' },
  access: {
    read: () => true,
    create: isEditorOrAdmin,
    update: isEditorOrAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, localized: true },
    { name: 'category', type: 'select', required: true, options: amenityCategories },
  ],
}
