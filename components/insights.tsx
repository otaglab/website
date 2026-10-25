import Link from 'next/link'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react'
import { GenericPage, Notice, PageShell } from '@/components/otaglab'
import { postLanguages, postPath, type PostCategory } from '@/lib/insights'
import type { PostCard } from '@/lib/cms'
import type { Media, Post, User } from '@/payload-types'

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Baku' })
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Baku' })

const media = (value: number | Media | null | undefined) => (typeof value === 'object' && value ? value : null)

// Only allow links that can't run code: web, email, phone and on-site paths
function safeHref(url: string | undefined) {
  if (!url) return '#'
  if (/^(https?:|mailto:|tel:)/i.test(url) || (url.startsWith('/') && !url.startsWith('//')) || url.startsWith('#')) return url
  return '#'
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const internal = node.fields.linkType === 'internal' && typeof node.fields.doc?.value === 'object'
    const href = internal ? postPath(node.fields.doc!.value as unknown as Post) : safeHref(node.fields.url)
    return <a href={href} rel={node.fields.newTab ? 'noopener noreferrer' : undefined} target={node.fields.newTab ? '_blank' : undefined}>{nodesToJSX({ nodes: node.children })}</a>
  },
  autolink: ({ node, nodesToJSX }) => <a href={safeHref(node.fields.url)} rel="noopener noreferrer" target="_blank">{nodesToJSX({ nodes: node.children })}</a>,
})

export function LanguageBadge({ language }: { language: Post['language'] }) {
  const info = postLanguages.find((item) => item.value === language)
  return <span title={info?.name} className="rounded-md bg-[var(--light-blue)] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[var(--navy)]">{info?.label ?? language.toUpperCase()}</span>
}

function EventMeta({ event }: { event: Post['event'] }) {
  if (!event?.startsAt && !event?.location) return null
  return <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[var(--dark-teal)]">
    {event.startsAt && <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{dateTimeFormat.format(new Date(event.startsAt))}</span>}
    {event.location && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{event.location}</span>}
  </div>
}

export function PostCardView({ post }: { post: PostCard }) {
  const cover = media(post.coverImage)
  return <Link href={postPath(post)} className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(13,43,78,0.1)]">
    {cover && <div className="aspect-[16/9] bg-[var(--light-blue)]"><img src={cover.sizes?.card?.url ?? cover.url ?? ''} alt={cover.alt} className="size-full object-cover" /></div>}
    <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]"><LanguageBadge language={post.language} />{post.publishedAt && <span>{dateFormat.format(new Date(post.publishedAt))}</span>}</div>
      <h2 lang={post.language} className="text-lg font-bold leading-snug text-[var(--navy)] group-hover:text-[var(--dark-teal)]">{post.title}</h2>
      {post.category === 'event' && <EventMeta event={post.event} />}
      <p lang={post.language} className="line-clamp-3 text-sm leading-6 text-[var(--muted-text)]">{post.excerpt}</p>
    </div>
  </Link>
}

const listCopy: Record<PostCategory, { title: string; copy: string; empty: string }> = {
  news: { title: 'News', copy: 'Updates from OtagLab and the flexible work scene in Baku.', empty: 'No news yet. Stay tuned for more.' },
  event: { title: 'Events', copy: 'Meetups, workshops and community events across our partner spaces.', empty: 'No events announced yet. Stay tuned for more.' },
  blog: { title: 'Blog', copy: 'Ideas, guides and stories about working closer to where you live.', empty: 'No blog posts yet. Stay tuned for more.' },
}

export function InsightsList({ category, posts }: { category: PostCategory; posts: PostCard[] }) {
  const copy = listCopy[category]
  return <GenericPage eyebrow="Insights" title={copy.title} copy={copy.copy}>
    <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-8">
      {posts.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCardView key={post.id} post={post} />)}</div> : <Notice>{copy.empty}</Notice>}
      {category === 'blog' && <div className="mt-10"><Notice>Have an idea to share? Send your contribution to <a className="font-bold text-[var(--teal)]" href="mailto:contact@otaglab.com">contact@otaglab.com</a> and it could be featured on the OtagLab blog.</Notice></div>}
    </section>
  </GenericPage>
}

export function PostView({ post, preview }: { post: Post; preview: boolean }) {
  const cover = media(post.coverImage)
  const author = typeof post.author === 'object' ? (post.author as Pick<User, 'name'>) : null
  const category = listCopy[post.category]
  return <PageShell><main className="bg-white">
    {preview && <div className="bg-[var(--warning)] px-5 py-2 text-center text-sm font-semibold text-white">Preview: this is the latest draft and may not be published yet. <a className="underline" href={`/api/preview/exit?path=${encodeURIComponent(postPath(post))}`}>Exit preview</a></div>}
    <article lang={post.language} className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <nav lang="en" className="flex items-center gap-2 text-xs text-[var(--muted-text)]"><span>Insights</span><ChevronRight className="size-3" /><Link href={postPath({ category: post.category, slug: '' }).replace(/\/$/, '')} className="hover:text-[var(--navy)]">{category.title}</Link></nav>
      <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight text-[var(--navy)] md:text-5xl">{post.title}</h1>
      <div lang="en" className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted-text)]"><LanguageBadge language={post.language} />{post.publishedAt && <span>{dateFormat.format(new Date(post.publishedAt))}</span>}{author?.name && <span>· {author.name}</span>}</div>
      {post.category === 'event' && (post.event?.startsAt || post.event?.location) && <div lang="en" className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><EventMeta event={post.event} />{post.event?.registrationUrl?.startsWith('https://') && <a href={post.event.registrationUrl} target="_blank" rel="noopener noreferrer" className="w-fit rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-bold text-white">Register</a>}</div>}
      {cover && <img src={cover.sizes?.hero?.url ?? cover.url ?? ''} alt={cover.alt} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />}
      <div className="post-content mt-10"><RichText data={post.content} converters={converters} disableContainer /></div>
    </article>
  </main></PageShell>
}
