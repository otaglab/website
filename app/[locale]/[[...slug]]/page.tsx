import { redirect } from 'next/navigation'
import { AuthPage, ContactPage, AboutPage, FAQPage, GenericPage, HowPage, MarketingPage, PartnerPage, PricingPage, SpacesPage, DetailPage, WorkflowPage, InsightsPage } from '@/components/otaglab'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'

export default async function LocalizedPage({ params }: { params: Promise<{ locale: string; slug?: string[] }> }) {
  const { locale: rawLocale, slug = [] } = await params
  if (!isLocale(rawLocale)) redirect(`/${defaultLocale}/${slug.join('/')}`)
  const locale: Locale = rawLocale
  const path = slug.join('/')
  if (!path) return <LocalizedHome locale={locale} />
  if (path === 'spaces') return <SpacesPage />
  if (path.startsWith('spaces/')) return <DetailPage slug={slug[1]} />
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

async function LocalizedHome({ locale }: { locale: Locale }) {
  const { HomePage } = await import('@/components/otaglab')
  return <HomePage locale={locale} />
}

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }]
}
