import { getCoworkingSpaces } from '@/lib/coworking'
import type { SpaceFilters } from '@/lib/spaces'

// GET /api/spaces?bbox=west,south,east,north&lat=..&lng=..&district=..&type=..&q=..
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const filters: SpaceFilters = { district: params.get('district') ?? undefined, type: params.get('type') ?? undefined, query: params.get('q') ?? undefined }

  const bbox = params.get('bbox')
  if (bbox) {
    const [west, south, east, north] = bbox.split(',').map(Number)
    const valid = [west, east].every((v) => Number.isFinite(v) && v >= -180 && v <= 180) && [south, north].every((v) => Number.isFinite(v) && v >= -90 && v <= 90) && west < east && south < north
    if (!valid) return Response.json({ error: 'bbox must be west,south,east,north in degrees' }, { status: 400 })
    filters.bounds = { west, south, east, north }
  }

  if (params.has('lat') || params.has('lng')) {
    const lat = Number(params.get('lat'))
    const lng = Number(params.get('lng'))
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return Response.json({ error: 'lat and lng must be valid coordinates' }, { status: 400 })
    filters.near = { lat, lng }
  }

  return Response.json({ spaces: await getCoworkingSpaces(filters) })
}
