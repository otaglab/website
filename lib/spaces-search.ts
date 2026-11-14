// Search and quick filters for /spaces, shared by the homepage hero and the spaces page:
// /spaces?q=Nasimi&type=meeting-room&open=24-7&near=1

export type SpacesFilters = { q?: string; type?: string; open?: string; near?: boolean }

// Workspace types offered in search and quick filters
export const searchTypes = [['hot-desk', 'Hot desk'], ['fixed-desk', 'Fixed desk'], ['cubicle-desk', 'Cubicle desk'], ['private-office', 'Private office'], ['meeting-room', 'Meeting room'], ['study-room', 'Study room'], ['capsule', 'Capsule']] as const

// Builds a /spaces link from filters, dropping empty ones
export function spacesHref(filters: SpacesFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.type) params.set('type', filters.type)
  if (filters.open) params.set('open', filters.open)
  if (filters.near) params.set('near', '1')
  const query = params.toString()
  return query ? `/spaces?${query}` : '/spaces'
}
