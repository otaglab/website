import config from '@payload-config'
import { getPayload, type PayloadRequest } from 'payload'
import type { PostCategory } from '@/lib/insights'
import type { Post } from '@/payload-types'

export const getCms = () => getPayload({ config })

export type PostCard = Pick<Post, 'id' | 'title' | 'slug' | 'category' | 'language' | 'excerpt' | 'coverImage' | 'publishedAt' | 'event'>

// Published posts for a category, newest first. Empty when the CMS database isn't configured.
export async function listPublishedPosts(category: PostCategory, limit = 24): Promise<PostCard[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const payload = await getCms()
    const { docs } = await payload.find({
      collection: 'posts',
      where: { and: [{ category: { equals: category } }, { _status: { equals: 'published' } }] },
      sort: category === 'event' ? '-event.startsAt' : '-publishedAt',
      limit,
      depth: 1,
      select: { title: true, slug: true, category: true, language: true, excerpt: true, coverImage: true, publishedAt: true, event: true },
    })
    return docs as PostCard[]
  } catch (error) {
    console.error('Failed to load posts', error)
    return []
  }
}

// One post by URL. Drafts are only returned to a logged-in CMS user previewing them.
export async function getPost(category: PostCategory, slug: string, preview?: { user: PayloadRequest['user'] }): Promise<Post | null> {
  if (!process.env.DATABASE_URL) return null
  try {
    const payload = await getCms()
    const { docs } = await payload.find({
      collection: 'posts',
      where: { and: [{ category: { equals: category } }, { slug: { equals: slug } }, ...(preview ? [] : [{ _status: { equals: 'published' as const } }])] },
      limit: 1,
      depth: 1,
      // Only the author's name is public, never their email
      populate: { users: { name: true } },
      ...(preview ? { draft: true, overrideAccess: false, user: preview.user } : {}),
    })
    return docs[0] ?? null
  } catch (error) {
    console.error('Failed to load post', error)
    return null
  }
}
