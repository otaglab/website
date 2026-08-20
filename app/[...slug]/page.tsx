import { AuthPage, ContactPage, AboutPage, FAQPage, GenericPage, HowPage, MarketingPage, PricingPage, SpacesPage, DetailPage } from '@/components/gowork'

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  if (path === 'spaces') return <SpacesPage />
  if (path.startsWith('spaces/')) return <DetailPage slug={slug[1]} />
  if (path === 'pricing') return <PricingPage />
  if (path === 'for-companies') return <MarketingPage kind="companies" />
  if (path === 'for-partners') return <MarketingPage kind="partners" />
  if (path === 'how-it-works') return <HowPage />
  if (path === 'about') return <AboutPage />
  if (path === 'contact') return <ContactPage />
  if (path === 'faq') return <FAQPage />
  if (path === 'login') return <AuthPage />
  if (path === 'signup') return <AuthPage signup />
  return <GenericPage title="Page not found" copy="The page you are looking for is not available in this prototype." />
}
