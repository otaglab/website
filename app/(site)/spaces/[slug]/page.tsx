import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { SpaceDetail } from '@/components/space-detail'
import { getCms } from '@/lib/cms'
import { coverPhoto, getCoworkingSpaces, getSpace } from '@/lib/coworking'

// Publishing refreshes this page right away; this is only a fallback
export const revalidate = 300

type Args = { params: Promise<{ slug: string }> }

// Drafts are shown only when preview mode is on and a CMS user is logged in
async function loadSpace({ params }: Args) {
  const { slug } = await params
  if ((await draftMode()).isEnabled) {
    const { user } = await (await getCms()).auth({ headers: await headers() })
    if (user) return { space: await getSpace(slug, { user }), preview: true }
  }
  return { space: await getSpace(slug), preview: false }
}

export async function generateMetadata(args: Args): Promise<Metadata> {
  const { space } = await loadSpace(args)
  if (!space) return { title: 'Workspace · OtagLab' }
  const description = space.tagline || (space.about ?? "").slice(0, 160)
  const cover = coverPhoto(space)
  return { title: `${space.name} · OtagLab`, description, openGraph: { title: space.name, description, images: cover?.url ? [cover.url] : undefined } }
}

export default async function Page(args: Args) {
  const { space, preview } = await loadSpace(args)
  if (!space) notFound()
  const [lng, lat] = space.location ?? []
  const similar = (await getCoworkingSpaces(lat !== undefined && lng !== undefined ? { near: { lat, lng } } : {})).filter((item) => item.slug !== space.slug)
  return <SpaceDetail space={space} similar={similar} preview={preview} />
}
