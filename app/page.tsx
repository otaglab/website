import { HomePage } from '@/components/otaglab'
import { getCoworkingSpaces } from '@/lib/coworking'

// Re-read listings from the database at most once a minute
export const revalidate = 60

export default async function Page() {
  return <HomePage spaceData={await getCoworkingSpaces()} />
}
