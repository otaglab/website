import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { PostView } from '@/components/insights'
import { getCms, getPost } from '@/lib/cms'
import { categoryFromSegment } from '@/lib/insights'
import type { Media } from '@/payload-types'

export const revalidate = 300

type Args = { params: Promise<{ category: string; slug: string }> }

// Drafts are shown only when preview mode is on and a CMS user is logged in
async function loadPost({ params }: Args) {
  const { category: segment, slug } = await params
  const category = categoryFromSegment(segment)
  if (!category) return { post: null, preview: false }
  if ((await draftMode()).isEnabled) {
    const { user } = await (await getCms()).auth({ headers: await headers() })
    if (user) return { post: await getPost(category.value, slug, { user }), preview: true }
  }
  return { post: await getPost(category.value, slug), preview: false }
}

export async function generateMetadata(args: Args): Promise<Metadata> {
  const { post } = await loadPost(args)
  if (!post) return { title: 'OtagLab Insights' }
  const image = [post.meta?.image, post.coverImage].find((value): value is Media => typeof value === 'object' && value !== null)
  const title = post.meta?.title || post.title
  const description = post.meta?.description || post.excerpt
  return { title: `${title} · OtagLab`, description, openGraph: { title, description, type: 'article', locale: post.language, images: image?.url ? [image.url] : undefined } }
}

export default async function Page(args: Args) {
  const { post, preview } = await loadPost(args)
  if (!post) notFound()
  return <PostView post={post} preview={preview} />
}
