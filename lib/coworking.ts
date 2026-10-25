import { and, asc, eq, getTableColumns, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { coworkingSpaceImages, coworkingSpaces } from '@/lib/db/schema'

// The shape the listing components render
export type SpaceListing = { slug: string; name: string; district: string; distance: string; price: string; types: string; amenities: string; status: string; image: string; verified: boolean; x: string; y: string }

type Point = { lat: number; lng: number }

// Distances are measured from Fountain Square unless a reference point is given
const BAKU_CENTER: Point = { lat: 40.3703, lng: 49.8372 }
// Area of central Baku shown on the prototype map
const MAP_BOUNDS = { west: 49.79, east: 49.9, south: 40.355, north: 40.405 }

function mapPosition(location: { x: number; y: number } | null) {
  if (!location) return { x: '50%', y: '50%' }
  const clamp = (value: number) => Math.min(92, Math.max(8, value))
  const x = ((location.x - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100
  const y = ((MAP_BOUNDS.north - location.y) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100
  return { x: `${clamp(x).toFixed(1)}%`, y: `${clamp(y).toFixed(1)}%` }
}

function formatDistance(meters: number | null) {
  if (meters === null) return ''
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

export async function getCoworkingSpaces(filters?: { district?: string; query?: string; type?: string; near?: Point; radiusMeters?: number }): Promise<SpaceListing[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const near = filters?.near ?? BAKU_CENTER
    const origin = sql`ST_SetSRID(ST_MakePoint(${near.lng}, ${near.lat}), 4326)::geography`
    const conditions = [eq(coworkingSpaces.status, 'active')]
    if (filters?.district && filters.district !== 'All districts') conditions.push(eq(coworkingSpaces.district, filters.district))
    if (filters?.type && filters.type !== 'Any workspace') conditions.push(sql`exists (select 1 from unnest(${coworkingSpaces.workspaceTypes}) as t(name) where t.name ilike ${`%${filters.type}%`})`)
    if (filters?.query) conditions.push(or(ilike(coworkingSpaces.name, `%${filters.query}%`), ilike(coworkingSpaces.district, `%${filters.query}%`))!)
    if (filters?.radiusMeters) conditions.push(sql`ST_DWithin(${coworkingSpaces.location}::geography, ${origin}, ${filters.radiusMeters})`)
    const distanceMeters = sql<number | null>`ST_Distance(${coworkingSpaces.location}::geography, ${origin})::float8`
    const rows = await db.select({ ...getTableColumns(coworkingSpaces), distanceMeters }).from(coworkingSpaces).where(and(...conditions)).orderBy(filters?.near ? sql`${distanceMeters} asc nulls last` : asc(coworkingSpaces.name))
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
        ...mapPosition(space.location),
      }
    })
  } catch (error) {
    // Pages fall back to the demo listings rather than failing when the database is unreachable
    console.error('Failed to load coworking spaces', error)
    return []
  }
}

export async function getCoworkingSpace(slug: string) {
  const rows = await getCoworkingSpaces()
  return rows.find((space) => space.slug === slug) ?? null
}
