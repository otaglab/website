// Listing shape and geo helpers shared by the server, the API route and the client

export type SpaceListing = { slug: string; name: string; district: string; distance: string; price: string; priceUnit: string; types: string; amenities: string; status: string; image: string; verified: boolean; lat: number | null; lng: number | null }

export type LatLng = { lat: number; lng: number }
export type MapBounds = { west: number; south: number; east: number; north: number }
export type SpaceFilters = { district?: string; query?: string; type?: string; near?: LatLng; bounds?: MapBounds }

// Distances are measured from Fountain Square unless a reference point is given
export const BAKU_CENTER: LatLng = { lat: 40.3703, lng: 49.8372 }

// Great-circle distance in meters
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
