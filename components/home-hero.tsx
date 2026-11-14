import Link from 'next/link'
import { ArrowRight, Building2, Clock3, DoorOpen, Handshake, Images, MapPin, Navigation, Search, Wallet } from 'lucide-react'
import { searchTypes, spacesHref } from '@/lib/spaces-search'
import type { SpaceListing } from '@/lib/spaces'

const quickFilters = [
  { label: 'Hot desk', href: spacesHref({ type: 'hot-desk' }), icon: Building2 },
  { label: 'Meeting room', href: spacesHref({ type: 'meeting-room' }), icon: DoorOpen },
  { label: 'Study room', href: spacesHref({ type: 'study-room' }), icon: Building2 },
  { label: 'Open 24/7', href: spacesHref({ open: '24-7' }), icon: Clock3 },
  { label: 'Near me', href: spacesHref({ near: true }), icon: Navigation },
]

const facts = [
  { icon: Handshake, title: 'Partner-run spaces', copy: 'Listed with each operator' },
  { icon: Wallet, title: 'Pay per day', copy: 'Day passes and hourly rooms' },
  { icon: Images, title: 'Real photos', copy: 'From the spaces themselves' },
  { icon: Clock3, title: '24/7 options', copy: 'Work early or late' },
]

// Lowest daily price across listings, e.g. "₼20"
function lowestDayPrice(items: SpaceListing[]) {
  const prices = items.filter((space) => space.priceUnit === 'day' && space.price).map((space) => ({ label: space.price, value: Number(space.price.replace(/[^\d.]/g, '')) })).filter((price) => price.value > 0)
  return prices.sort((a, b) => a.value - b.value)[0]?.label
}

function HeroCard({ space }: { space: SpaceListing }) {
  return <Link href={`/spaces/${space.slug}`} className="group w-[78%] shrink-0 snap-start sm:w-auto">
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--light-blue)]">
      <img src={space.image} alt={space.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
      {space.status === 'Open 24/7' && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[var(--dark-teal)] shadow-sm"><Clock3 className="size-3" />Open 24/7</span>}
      {space.price && <span className="absolute bottom-3 left-3 rounded-full bg-[var(--navy)]/90 px-3 py-1 text-xs font-semibold text-white">from <strong>{space.price}</strong> / {space.priceUnit}</span>}
    </div>
    <p className="mt-3 truncate font-bold text-[var(--navy)] group-hover:text-[var(--dark-teal)]">{space.name}</p>
    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-[var(--muted-text)]"><MapPin className="size-3.5 shrink-0 text-[var(--teal)]" />{[space.district, space.types].filter(Boolean).join(' · ')}</p>
  </Link>
}

// Search-first homepage hero: real search, quick filters and live listings
export function HomeHero({ items }: { items: SpaceListing[] }) {
  const from = lowestDayPrice(items)
  const featured = items.slice(0, 3)
  return <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black,transparent)]" />
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-14rem] h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[var(--light-teal)] opacity-80 blur-3xl" />
    <div className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-12 lg:px-8 lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        {items.length > 0 && <Link href="/spaces" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[var(--navy)] shadow-sm backdrop-blur transition hover:border-[var(--teal)]">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--teal)] opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-[var(--teal)]" /></span>
          {items.length} {items.length === 1 ? 'workspace' : 'workspaces'} in Baku{from && <> · from {from}/day</>}
          <ArrowRight className="size-3.5 text-[var(--teal)]" />
        </Link>}
        <h1 className="mt-6 text-balance text-[2.6rem] font-bold leading-[1.05] tracking-tight text-[var(--navy)] sm:text-6xl lg:text-[4.25rem]">Find a desk near you,<br className="hidden sm:block" /> <span className="text-[var(--teal)]">by the day.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--muted-text)] sm:text-lg">Coworking desks, meeting rooms and study rooms across Baku. No lease, no membership: pay only for the days you work.</p>
      </div>

      <form action="/spaces" method="get" role="search" className="mx-auto mt-9 flex max-w-3xl flex-col gap-1 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-[0_20px_50px_rgba(13,43,78,0.12)] sm:flex-row sm:items-center sm:rounded-full">
        <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-2.5">
          <MapPin className="size-5 shrink-0 text-[var(--teal)]" />
          <span className="sr-only">Where do you want to work?</span>
          <input name="q" placeholder="District, metro or space name" className="w-full bg-transparent text-[15px] font-medium text-[var(--navy)] outline-none placeholder:text-[var(--muted-text)]" />
        </label>
        <span aria-hidden="true" className="mx-1 hidden h-8 w-px bg-[var(--border)] sm:block" />
        <label className="flex items-center gap-3 rounded-full px-4 py-2.5 sm:w-56">
          <Building2 className="size-5 shrink-0 text-[var(--teal)]" />
          <span className="sr-only">Workspace type</span>
          <select name="type" defaultValue="" className="w-full cursor-pointer bg-transparent text-[15px] font-medium text-[var(--navy)] outline-none"><option value="">Any workspace</option>{searchTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label>
        <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--teal)] px-6 text-sm font-bold text-white transition hover:bg-[var(--dark-teal)] sm:rounded-full"><Search className="size-4" />Search</button>
      </form>

      <div className="mt-5 flex flex-wrap justify-center gap-2">{quickFilters.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--navy)] transition hover:border-[var(--teal)] hover:text-[var(--dark-teal)]"><Icon className="size-3.5 text-[var(--teal)]" />{label}</Link>)}</div>

      {featured.length > 0 && <div className="mx-auto mt-14 max-w-5xl">
        <div className="mb-4 flex items-end justify-between gap-4"><p className="text-sm font-bold text-[var(--navy)]">Available in Baku</p><Link href="/spaces" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--teal)]">See all {items.length} <ArrowRight className="size-4" /></Link></div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">{featured.map((space) => <HeroCard key={space.slug} space={space} />)}</div>
      </div>}

      <ul className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--border)] pt-8 lg:grid-cols-4">{facts.map(({ icon: Icon, title, copy }) => <li key={title} className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--light-teal)] text-[var(--dark-teal)]"><Icon className="size-4" /></span><span><span className="block text-sm font-bold text-[var(--navy)]">{title}</span><span className="block text-xs leading-5 text-[var(--muted-text)]">{copy}</span></span></li>)}</ul>
    </div>
  </section>
}
