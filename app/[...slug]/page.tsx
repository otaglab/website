import { AuthPage, ContactPage, AboutPage, FAQPage, GenericPage, HowPage, MarketingPage, PartnerPage, PricingPage, SpacesPage, DetailPage, WorkflowPage, InsightsPage } from '@/components/otaglab'
import { getCoworkingSpaces } from '@/lib/coworking'

async function SpacesRoute() {
  const spaceData = await getCoworkingSpaces()
  return <SpacesPage spaceData={spaceData as never} />
}

async function DetailRoute({ slug }: { slug: string }) {
  const spaceData = await getCoworkingSpaces()
  return <DetailPage slug={slug} spaceData={spaceData as never} />
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  if (path === 'spaces') return <SpacesRoute />
  if (path.startsWith('spaces/')) return <DetailRoute slug={slug[1]} />
  if (path === 'pricing') return <PricingPage />
  if (path === 'for-companies') return <MarketingPage kind="companies" />
  if (path === 'for-partners') return <MarketingPage kind="partners" />
  if (path === 'for-partners/apply') return <PartnerPage />
  if (path === 'how-it-works') return <HowPage />
  if (path === 'how-it-works/individuals') return <WorkflowPage kind="individuals" />
  if (path === 'insights/news') return <InsightsPage type="news" />
  if (path === 'insights/events') return <InsightsPage type="events" />
  if (path === 'insights/blog') return <InsightsPage type="blog" />
  if (path === 'about') return <AboutPage />
  if (path === 'contact') return <ContactPage />
  if (path === 'faq') return <FAQPage />
  if (path === 'login') return <AuthPage />
  if (path === 'signup') return <AuthPage signup />
  return <GenericPage title="Page not found" copy="The page you are looking for is not available in this prototype." />
}
