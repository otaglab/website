import { HomePage } from '@/components/otaglab'
import { getCoworkingSpaces, getHomePhotos } from '@/lib/coworking'

// Re-read listings from the database at most once a minute
export const revalidate = 60

export default async function Page() {
  const [spaceData, photos] = await Promise.all([getCoworkingSpaces(), getHomePhotos()])
  return <HomePage spaceData={spaceData} photos={photos} />
}
