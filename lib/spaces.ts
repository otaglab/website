// Listing shape, demo data and filters shared by the server, the API route and the client

export type SpaceListing = { slug: string; name: string; district: string; distance: string; price: string; types: string; amenities: string; status: string; image: string; verified: boolean; lat: number | null; lng: number | null }

export type LatLng = { lat: number; lng: number }
export type MapBounds = { west: number; south: number; east: number; north: number }
export type SpaceFilters = { district?: string; query?: string; type?: string; near?: LatLng; bounds?: MapBounds }

// Distances are measured from Fountain Square unless a reference point is given
export const BAKU_CENTER: LatLng = { lat: 40.3703, lng: 49.8372 }

// Great-circle distance, used only for the demo listings (the database uses PostGIS)
export function distanceBetween(a: LatLng, b: LatLng) {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h))
}

export function formatDistance(meters: number | null) {
  if (meters === null) return ''
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

const demo = [
  { slug: 'coworking-space-01', name: 'Coworking Space 01', district: 'Yasamal', price: '₼15', types: 'Hot Desk · Meeting Room', amenities: 'Wi-Fi · Coffee · Quiet Area', status: 'Open until 20:00', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85', verified: true, lat: 40.385, lng: 49.815 },
  { slug: 'coworking-space-02', name: 'Coworking Space 02', district: '28 May', price: '₼18', types: 'Hot Desk · Dedicated Desk', amenities: 'Wi-Fi · Phone Booths · Kitchen', status: 'Open until 22:00', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85', verified: true, lat: 40.3794, lng: 49.8486 },
  { slug: 'lotfi-zadeh-center', name: 'Coworking Space 03', district: 'White City', price: '₼22', types: 'Private Office · Meeting Room', amenities: 'Reception · Parking · 24/7 Access', status: 'Open 24 hours', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85', verified: true, lat: 40.375, lng: 49.877 },
  { slug: 'port-work-club', name: 'Coworking Space 04', district: 'Port Baku', price: '₼20', types: 'Hot Desk · Meeting Room', amenities: 'Coffee · City Views · Wi-Fi', status: 'Open until 21:00', image: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=85', verified: false, lat: 40.3747, lng: 49.8614 },
]

export const demoSpaces: SpaceListing[] = demo.map((space) => ({ ...space, distance: formatDistance(distanceBetween(BAKU_CENTER, space)) }))

// Applies the same filters as the database query to the demo listings
export function filterDemoSpaces(filters: SpaceFilters = {}): SpaceListing[] {
  const origin = filters.near ?? BAKU_CENTER
  const query = filters.query?.toLowerCase()
  const type = filters.type?.toLowerCase()
  const { bounds } = filters
  return demo
    .filter((space) => !filters.district || filters.district === 'All districts' || space.district === filters.district)
    .filter((space) => !type || filters.type === 'Any workspace' || space.types.toLowerCase().includes(type))
    .filter((space) => !query || space.name.toLowerCase().includes(query) || space.district.toLowerCase().includes(query))
    .filter((space) => !bounds || (space.lng >= bounds.west && space.lng <= bounds.east && space.lat >= bounds.south && space.lat <= bounds.north))
    .map((space) => ({ space, meters: distanceBetween(origin, space) }))
    .sort((a, b) => (filters.near ? a.meters - b.meters : a.space.name.localeCompare(b.space.name)))
    .map(({ space, meters }) => ({ ...space, distance: formatDistance(meters) }))
}
