import { and, asc, eq, ilike, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { coworkingSpaceImages, coworkingSpaces } from '@/lib/db/schema'

export async function getCoworkingSpaces(filters?: { district?: string; query?: string; type?: string }) {
  const conditions = [eq(coworkingSpaces.status, 'active')]
  if (filters?.district && filters.district !== 'All districts') conditions.push(eq(coworkingSpaces.district, filters.district))
  if (filters?.type && filters.type !== 'Any workspace') conditions.push(ilike(coworkingSpaces.workspaceTypes, `%${filters.type}%`))
  if (filters?.query) conditions.push(or(ilike(coworkingSpaces.name, `%${filters.query}%`), ilike(coworkingSpaces.district, `%${filters.query}%`))!)
  const rows = await db.select().from(coworkingSpaces).where(and(...conditions)).orderBy(asc(coworkingSpaces.name))
  const images = await db.select().from(coworkingSpaceImages).orderBy(asc(coworkingSpaceImages.sortOrder))
  return rows.map((space) => {
    const image = images.find((item) => item.spaceId === space.id && item.isPrimary) ?? images.find((item) => item.spaceId === space.id)
    return { ...space, image: image?.publicUrl ?? '/workspace-placeholder.svg', distance: '', price: `${space.currency === 'AZN' ? '₼' : space.currency}${space.priceFrom}`, types: space.workspaceTypes.join(' · '), amenities: space.amenities.join(' · '), status: space.openingHours && typeof space.openingHours === 'object' && 'label' in space.openingHours ? String(space.openingHours.label) : 'Open today', x: '50%', y: '50%' }
  })
}

export async function getCoworkingSpace(slug: string) {
  const rows = await getCoworkingSpaces()
  return rows.find((space) => space.slug === slug) ?? null
}
