import { AuthPage, ContactPage, AboutPage, FAQPage, GenericPage, HowPage, MarketingPage, PartnerPage, PricingPage, SpacesPage, WorkflowPage } from '@/components/otaglab'
import { getCoworkingSpaces } from '@/lib/coworking'

// Re-read listings from the database at most once a minute
export const revalidate = 60

type SearchParams = Record<string, string | string[] | undefined>
const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) || undefined

// /spaces?q=Nasimi&type=meeting-room&open=24-7&near=1 — search and quick filters from the homepage
async function SpacesRoute({ searchParams }: { searchParams: SearchParams }) {
  const filters = { q: param(searchParams.q), type: param(searchParams.type), open: param(searchParams.open), near: param(searchParams.near) === '1' }
  const spaces = await getCoworkingSpaces({ query: filters.q, type: filters.type })
  const spaceData = filters.open === '24-7' ? spaces.filter((space) => space.status === 'Open 24/7') : spaces
  return <SpacesPage spaceData={spaceData} filters={filters} />
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string[] }>; searchParams: Promise<SearchParams> }) {
  const { slug } = await params
  const path = slug.join('/')
  if (path === 'spaces') return <SpacesRoute searchParams={await searchParams} />
  if (path === 'pricing') return <PricingPage />
  if (path === 'for-companies') return <MarketingPage kind="companies" />
  if (path === 'for-partners') return <MarketingPage kind="partners" />
  if (path === 'for-partners/apply') return <PartnerPage />
  if (path === 'how-it-works') return <HowPage />
  if (path === 'how-it-works/individuals') return <WorkflowPage kind="individuals" />
  if (path === 'about') return <AboutPage />
  if (path === 'contact') return <ContactPage />
  if (path === 'faq') return <FAQPage />
  if (path === 'login') return <AuthPage />
  if (path === 'signup') return <AuthPage signup />
  return <GenericPage title="Page not found" copy="The page you are looking for is not available in this prototype." />
}
