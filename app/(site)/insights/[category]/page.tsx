import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InsightsList } from '@/components/insights'
import { listPublishedPosts } from '@/lib/cms'
import { categoryFromSegment } from '@/lib/insights'

// Publishing refreshes these pages right away; this is only a fallback
export const revalidate = 300

type Args = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const category = categoryFromSegment((await params).category)
  return { title: category ? `${category.segment === 'events' ? 'Events' : category.label} · OtagLab Insights` : 'OtagLab Insights' }
}

export default async function Page({ params }: Args) {
  const category = categoryFromSegment((await params).category)
  if (!category) notFound()
  return <InsightsList category={category.value} posts={await listPublishedPosts(category.value)} />
}
