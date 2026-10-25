import { and, asc, eq, getTableColumns, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { coworkingSpaceImages, coworkingSpaces } from '@/lib/db/schema'
import { BAKU_CENTER, filterDemoSpaces, formatDistance, type SpaceFilters, type SpaceListing } from '@/lib/spaces'

export type { SpaceListing } from '@/lib/spaces'

export async function getCoworkingSpaces(filters: SpaceFilters = {}): Promise<SpaceListing[]> {
  // Without a database the demo listings stand in, filtered the same way
  if (!process.env.DATABASE_URL) return filterDemoSpaces(filters)
  try {
    const near = filters.near ?? BAKU_CENTER
    const origin = sql`ST_SetSRID(ST_MakePoint(${near.lng}, ${near.lat}), 4326)::geography`
    const conditions = [eq(coworkingSpaces.status, 'active')]
    if (filters.district && filters.district !== 'All districts') conditions.push(eq(coworkingSpaces.district, filters.district))
    if (filters.type && filters.type !== 'Any workspace') conditions.push(sql`exists (select 1 from unnest(${coworkingSpaces.workspaceTypes}) as t(name) where t.name ilike ${`%${filters.type}%`})`)
    if (filters.query) conditions.push(or(ilike(coworkingSpaces.name, `%${filters.query}%`), ilike(coworkingSpaces.district, `%${filters.query}%`))!)
    // && uses the GiST index to keep only spaces inside the visible map area
    if (filters.bounds) conditions.push(sql`${coworkingSpaces.location} && ST_MakeEnvelope(${filters.bounds.west}, ${filters.bounds.south}, ${filters.bounds.east}, ${filters.bounds.north}, 4326)`)
    const distanceMeters = sql<number | null>`ST_Distance(${coworkingSpaces.location}::geography, ${origin})::float8`
    const rows = await db.select({ ...getTableColumns(coworkingSpaces), distanceMeters }).from(coworkingSpaces).where(and(...conditions)).orderBy(filters.near ? sql`${distanceMeters} asc nulls last` : asc(coworkingSpaces.name))
    if (!rows.length) return []
    const images = await db.select().from(coworkingSpaceImages).where(inArray(coworkingSpaceImages.spaceId, rows.map((row) => row.id))).orderBy(asc(coworkingSpaceImages.sortOrder))
    return rows.map((space) => {
      const image = images.find((item) => item.spaceId === space.id && item.isPrimary) ?? images.find((item) => item.spaceId === space.id)
      const hours = space.openingHours as { label?: unknown } | null
      return {
        slug: space.slug,
        name: space.name,
        district: space.district,
        distance: formatDistance(space.distanceMeters),
        price: `${space.currency === 'AZN' ? '₼' : `${space.currency} `}${Number(space.priceFrom)}`,
        types: space.workspaceTypes.join(' · '),
        amenities: space.amenities.join(' · '),
        status: typeof hours?.label === 'string' ? hours.label : 'Open today',
        image: image?.publicUrl ?? '/placeholder.svg',
        verified: space.verified,
        lat: space.location?.y ?? null,
        lng: space.location?.x ?? null,
      }
    })
  } catch (error) {
    // Pages fall back to the demo listings rather than failing when the database is unreachable
    console.error('Failed to load coworking spaces', error)
    return filterDemoSpaces(filters)
  }
}

export async function getCoworkingSpace(slug: string) {
  const rows = await getCoworkingSpaces()
  return rows.find((space) => space.slug === slug) ?? null
}
