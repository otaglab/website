import type { PayloadRequest, Where } from 'payload'
import { getCms } from '@/lib/cms'
import { currencySymbol, deskTypes, districts, labelOf, workspaceTypes } from '@/lib/space-options'
import { BAKU_CENTER, distanceBetween, formatDistance, type SpaceFilters, type SpaceListing } from '@/lib/spaces'
import type { Amenity, Media, Space } from '@/payload-types'

export type { SpaceListing } from '@/lib/spaces'

type SpaceOption = NonNullable<Space['options']>[number]

const asMedia = (value: number | Media | null | undefined) => (typeof value === 'object' && value ? value : null)

export function coverPhoto(space: Pick<Space, 'photos'>) {
  const photos = space.photos ?? []
  return asMedia((photos.find((photo) => photo.isCover) ?? photos[0])?.image)
}

// Cheapest daily desk price, falling back to any daily, hourly or monthly price
export function priceFrom(options: SpaceOption[] | null | undefined) {
  const all = (options ?? []).filter((option) => option.available !== false)
  const cheapest = (list: SpaceOption[], key: 'priceDay' | 'priceHour' | 'priceMonth') => list.filter((option) => typeof option[key] === 'number').sort((a, b) => a[key]! - b[key]!)[0]
  const desks = all.filter((option) => deskTypes.includes(option.type))
  const pick =
    [[cheapest(desks, 'priceDay'), 'priceDay', 'day'], [cheapest(all, 'priceDay'), 'priceDay', 'day'], [cheapest(all, 'priceHour'), 'priceHour', 'hour'], [cheapest(all, 'priceMonth'), 'priceMonth', 'month']] as const
  for (const [option, key, unit] of pick) {
    if (option) return { price: `${currencySymbol[option.currency ?? 'AZN'] ?? option.currency}${option[key]}`, unit }
  }
  return { price: '', unit: '' }
}

// Short opening-hours label for cards, from the space-wide rows
export function hoursLabel(hours: Space['hours']) {
  const general = (hours ?? []).filter((row) => !row.appliesTo)
  if (general.some((row) => row.open24h)) return 'Open 24/7'
  const everyDay = general.find((row) => row.day === 'every-day' && row.opens && row.closes)
  if (everyDay) return `Open ${everyDay.opens}–${everyDay.closes}`
  const weekdays = general.find((row) => row.day === 'weekdays' && row.opens && row.closes)
  return weekdays ? `Mon–Fri ${weekdays.opens}–${weekdays.closes}` : ''
}

export function toListing(space: Space, origin = BAKU_CENTER): SpaceListing {
  const [lng, lat] = space.location ?? [null, null]
  const { price, unit } = priceFrom(space.options)
  const cover = coverPhoto(space)
  const types = [...new Set((space.options ?? []).map((option) => labelOf(workspaceTypes, option.type)))]
  const amenities = (space.amenities ?? []).map((item) => (typeof item.amenity === 'object' ? (item.amenity as Amenity).name : '')).filter(Boolean)
  return {
    slug: space.slug,
    name: space.name,
    district: labelOf(districts, space.district) || space.city,
    distance: lat !== null && lng !== null ? formatDistance(distanceBetween(origin, { lat, lng })) : '',
    price,
    priceUnit: unit,
    types: types.slice(0, 3).join(' · '),
    amenities: amenities.slice(0, 3).join(' · '),
    status: hoursLabel(space.hours),
    image: cover?.sizes?.card?.url ?? cover?.url ?? '/placeholder.svg',
    verified: Boolean(space.verified),
    lat,
    lng,
  }
}

// Accepts either the stored value or the label shown in the search filters
const valueOf = (list: readonly { value: string; label: string }[], input: string) => list.find((item) => item.value === input || item.label === input)?.value

// Published spaces for listings and the map. Empty when the CMS database isn't configured.
export async function getCoworkingSpaces(filters: SpaceFilters = {}): Promise<SpaceListing[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const conditions: Where[] = []
    const district = filters.district && valueOf(districts, filters.district)
    if (district) conditions.push({ district: { equals: district } })
    const type = filters.type && valueOf(workspaceTypes, filters.type)
    if (type) conditions.push({ 'options.type': { equals: type } })
    if (filters.query) conditions.push({ or: [{ name: { like: filters.query } }, { address: { like: filters.query } }] })
    if (filters.bounds) {
      const { west, south, east, north } = filters.bounds
      // PostGIS ST_Within on the location column
      conditions.push({ location: { within: { type: 'Polygon', coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]] } } })
    }
    const payload = await getCms()
    const { docs } = await payload.find({ collection: 'spaces', where: conditions.length ? { and: conditions } : {}, sort: 'name', limit: 200, depth: 2, overrideAccess: false })
    const origin = filters.near ?? BAKU_CENTER
    const listings = docs.map((space) => toListing(space, origin))
    if (!filters.near) return listings
    const meters = (listing: SpaceListing) => (listing.lat === null || listing.lng === null ? Infinity : distanceBetween(origin, { lat: listing.lat, lng: listing.lng }))
    return listings.sort((a, b) => meters(a) - meters(b))
  } catch (error) {
    console.error('Failed to load coworking spaces', error)
    return []
  }
}

// One space with everything the detail page needs. Drafts only for a logged-in CMS user previewing.
export async function getSpace(slug: string, preview?: { user: PayloadRequest['user'] }): Promise<Space | null> {
  if (!process.env.DATABASE_URL) return null
  try {
    const payload = await getCms()
    const { docs } = await payload.find({ collection: 'spaces', where: { slug: { equals: slug } }, limit: 1, depth: 2, overrideAccess: false, ...(preview ? { draft: true, user: preview.user } : {}) })
    return docs[0] ?? null
  } catch (error) {
    console.error('Failed to load space', error)
    return null
  }
}
