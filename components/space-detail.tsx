import { Accessibility, Car, Check, Clock3, Coffee, ExternalLink, Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sofa, Sparkles, TrainFront, Users, Wifi } from 'lucide-react'
import { Breadcrumbs, PageShell, SectionTitle, SimilarSpaces } from '@/components/otaglab'
import { SpaceBooking } from '@/components/space-booking'
import { SpaceMap } from '@/components/space-map'
import { coverPhoto, toListing } from '@/lib/coworking'
import { amenityCategories, currencySymbol, days, infoTopics, labelOf, roomTypes, workspaceTypes } from '@/lib/space-options'
import type { SpaceListing } from '@/lib/spaces'
import type { Amenity, Media, Space } from '@/payload-types'

type SpaceOption = NonNullable<Space['options']>[number]

const categoryIcons: Record<string, typeof Wifi> = { connectivity: Wifi, 'food-drink': Coffee, comfort: Sofa, services: Sparkles, 'access-security': ShieldCheck, 'transport-parking': Car, accessibility: Accessibility, other: Check }

// Only render links that point to the web
const webUrl = (url: string | null | undefined) => (url && /^https?:\/\//i.test(url) ? url : null)
const digits = (phone: string) => phone.replace(/[^\d+]/g, '')

function money(option: SpaceOption, value: number | null | undefined) {
  return typeof value === 'number' ? `${currencySymbol[option.currency ?? 'AZN'] ?? option.currency}${value}` : null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-5 text-2xl font-bold text-[var(--navy)]">{title}</h2>{children}</section>
}

function Gallery({ space }: { space: Space }) {
  const cover = coverPhoto(space)
  const rest = (space.photos ?? []).map((photo) => photo.image).filter((image): image is Media => typeof image === 'object' && image !== null && image.id !== cover?.id).slice(0, 4)
  if (!cover) return <div className="grid h-[260px] place-items-center rounded-2xl bg-[var(--light-blue)] text-sm text-[var(--muted-text)]">Photos coming soon</div>
  return <div className={`grid h-[300px] gap-2 overflow-hidden rounded-2xl sm:h-[420px] ${rest.length ? 'sm:grid-cols-[1.4fr_1fr]' : ''}`}>
    <img src={cover.sizes?.hero?.url ?? cover.url ?? ''} alt={cover.alt} className="size-full object-cover" />
    {rest.length > 0 && <div className="hidden grid-cols-2 gap-2 sm:grid">{rest.map((image) => <img key={image.id} src={image.sizes?.card?.url ?? image.url ?? ''} alt={image.alt} className={`size-full object-cover ${rest.length < 3 ? 'col-span-2' : ''}`} />)}</div>}
  </div>
}

function PriceChips({ option }: { option: SpaceOption }) {
  const prices = [[option.priceHour, 'hour'], [option.priceEvening, 'hour, evening'], [option.priceDay, 'day'], [option.priceWeek, 'week'], [option.priceMonth, 'month']] as const
  const shown = prices.filter(([value]) => typeof value === 'number')
  if (!shown.length) return <span className="text-sm font-semibold text-[var(--muted-text)]">Price on request</span>
  return <div className="flex flex-wrap gap-2">{shown.map(([value, unit]) => <span key={unit} className="rounded-lg bg-[var(--light-teal)] px-2.5 py-1 text-sm text-[var(--dark-teal)]"><strong>{money(option, value)}</strong> / {unit}</span>)}</div>
}

function Options({ options }: { options: SpaceOption[] }) {
  const desks = options.filter((option) => !roomTypes.includes(option.type))
  const rooms = options.filter((option) => roomTypes.includes(option.type))
  const vatNote = options.some((option) => option.vatIncluded === false && [option.priceHour, option.priceDay, option.priceWeek, option.priceMonth].some((value) => typeof value === 'number'))
  return <div className="flex flex-col gap-6">
    {desks.length > 0 && <div className="grid gap-3">{desks.map((option) => <div key={option.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--teal)]">{labelOf(workspaceTypes, option.type)}</p><h3 className="mt-1 font-bold text-[var(--navy)]">{option.name || labelOf(workspaceTypes, option.type)}</h3>{option.description && <p className="mt-1 text-sm text-[var(--muted-text)]">{option.description}</p>}
        <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-[var(--muted-text)]">{option.units ? <span>{option.units} {option.units === 1 ? 'place' : 'places'}</span> : null}{option.minimumBooking && <span>Minimum {option.minimumBooking}</span>}{option.available === false && <span className="font-semibold text-[var(--warning)]">Currently unavailable</span>}</p>
        {option.publicNote && <p className="mt-2 text-xs text-[var(--muted-text)]">{option.publicNote}</p>}</div>
      <div className="sm:max-w-[55%] sm:text-right"><PriceChips option={option} /></div>
    </div>)}</div>}
    {rooms.length > 0 && <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      <table className="w-full text-left text-sm"><thead className="bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted-text)]"><tr><th className="px-4 py-3 font-semibold">Room</th><th className="px-4 py-3 font-semibold">Seats</th><th className="px-4 py-3 font-semibold">Price</th></tr></thead>
        <tbody>{rooms.map((room) => <tr key={room.id} className="border-t border-[var(--border)] align-top"><td className="px-4 py-3"><p className="font-semibold text-[var(--navy)]">{room.name || labelOf(workspaceTypes, room.type)}</p><p className="text-xs text-[var(--muted-text)]">{labelOf(workspaceTypes, room.type)}{room.publicNote && ` · ${room.publicNote}`}</p></td><td className="px-4 py-3 text-[var(--muted-text)]">{room.seats ? <span className="flex items-center gap-1"><Users className="size-3.5" />{room.seats}</span> : '—'}</td><td className="px-4 py-3"><PriceChips option={room} /></td></tr>)}</tbody>
      </table>
    </div>}
    {vatNote && <p className="text-xs text-[var(--muted-text)]">Some prices exclude VAT.</p>}
  </div>
}

function Amenities({ items }: { items: NonNullable<Space['amenities']> }) {
  const groups = amenityCategories.map((category) => ({ category, items: items.filter((item) => typeof item.amenity === 'object' && (item.amenity as Amenity).category === category.value) })).filter((group) => group.items.length)
  return <div className="grid gap-6 sm:grid-cols-2">{groups.map(({ category, items: groupItems }) => {
    const Icon = categoryIcons[category.value] ?? Check
    return <div key={category.value}><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--navy)]"><Icon className="size-4 text-[var(--teal)]" />{category.label}</h3>
      <ul className="flex flex-col gap-2">{groupItems.map((item) => <li key={item.id} className="text-sm text-[var(--text)]">{(item.amenity as Amenity).name}{item.cost === 'paid' && <span className="ml-2 rounded bg-[var(--surface)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--muted-text)]">Paid extra</span>}{item.details && <span className="block text-xs text-[var(--muted-text)]">{item.details}</span>}</li>)}</ul></div>
  })}</div>
}

function Hours({ hours }: { hours: NonNullable<Space['hours']> }) {
  const groups = [...new Set(hours.map((row) => row.appliesTo ?? ''))]
  return <div className="grid gap-6 sm:grid-cols-2">{groups.map((group) => <div key={group || 'space'}>
    <h3 className="mb-3 text-sm font-bold text-[var(--navy)]">{group ? labelOf(workspaceTypes, group) : 'Workspace'}</h3>
    <dl className="flex flex-col gap-2 text-sm">{hours.filter((row) => (row.appliesTo ?? '') === group).map((row) => <div key={row.id}><div className="flex justify-between gap-4"><dt className="text-[var(--muted-text)]">{labelOf(days, row.day)}</dt><dd className="text-right font-semibold text-[var(--navy)]">{row.closed ? 'Closed' : row.open24h ? 'Open 24h' : row.opens && row.closes ? `${row.opens} – ${row.closes}` : '—'}</dd></div>{row.note && <p className="text-xs text-[var(--muted-text)]">{row.note}</p>}</div>)}</dl>
  </div>)}</div>
}

function ContactCard({ space }: { space: Space }) {
  const links = [
    space.phone && { href: `tel:${digits(space.phone)}`, label: space.phone, icon: Phone },
    space.whatsapp && { href: `https://wa.me/${digits(space.whatsapp).replace('+', '')}`, label: 'WhatsApp', icon: MessageCircle },
    space.email && { href: `mailto:${space.email}`, label: space.email, icon: Mail },
    webUrl(space.website) && { href: webUrl(space.website)!, label: 'Website', icon: Globe },
    webUrl(space.instagram) && { href: webUrl(space.instagram)!, label: 'Instagram', icon: ExternalLink },
    webUrl(space.facebook) && { href: webUrl(space.facebook)!, label: 'Facebook', icon: ExternalLink },
    webUrl(space.linkedin) && { href: webUrl(space.linkedin)!, label: 'LinkedIn', icon: ExternalLink },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Phone }[]
  if (!links.length) return null
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-5"><h3 className="font-bold text-[var(--navy)]">Contact the space</h3>
    <ul className="mt-3 flex flex-col gap-1">{links.map(({ href, label, icon: Icon }) => <li key={href}><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"><Icon className="size-4 text-[var(--teal)]" />{label}</a></li>)}</ul>
  </div>
}

export function SpaceDetail({ space, similar, preview }: { space: Space; similar: SpaceListing[]; preview: boolean }) {
  const listing = toListing(space)
  const options = space.options ?? []
  const info = (space.info ?? []).filter((item) => item.showOnWebsite !== false)
  const mapsUrl = webUrl(space.googleMapsUrl)
  return <PageShell><main className="bg-[var(--surface)]">
    {preview && <div className="bg-[var(--warning)] px-5 py-2 text-center text-sm font-semibold text-white">Preview: this is the latest draft and may not be published yet. <a className="underline" href={`/api/preview/exit?path=${encodeURIComponent(`/spaces/${space.slug}`)}`}>Exit preview</a></div>}
    <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
      <Breadcrumbs space={space.name} />
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight text-[var(--navy)] md:text-4xl">{space.name}</h1>{space.tagline && <p className="mt-2 max-w-2xl text-base text-[var(--muted-text)]">{space.tagline}</p>}
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted-text)]"><span className="flex items-center gap-1.5"><MapPin className="size-4 text-[var(--teal)]" />{[listing.district, space.address].filter(Boolean).join(' · ')}</span>{space.metro && <span className="flex items-center gap-1.5"><TrainFront className="size-4 text-[var(--teal)]" />{space.metro} metro</span>}{listing.status && <span className="flex items-center gap-1.5"><Clock3 className="size-4 text-[var(--teal)]" />{listing.status}</span>}</p></div>
        {space.verified && <span className="flex w-fit items-center gap-1.5 rounded-full bg-[var(--light-teal)] px-3 py-1.5 text-xs font-bold text-[var(--dark-teal)]"><ShieldCheck className="size-4" />Verified by OtagLab</span>}
      </div>
      <div className="mt-6"><Gallery space={space} /></div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_.8fr]">
        <div className="flex flex-col gap-12">
          <Section title="About this workspace"><p className="max-w-3xl whitespace-pre-line text-base leading-7 text-[var(--text)]">{space.about}</p>{space.capacity ? <p className="mt-3 text-sm text-[var(--muted-text)]">{space.capacity} seats in total</p> : null}</Section>
          {options.length > 0 && <Section title="Workspace options"><Options options={options} /></Section>}
          {(space.amenities ?? []).length > 0 && <Section title="Amenities"><Amenities items={space.amenities!} /></Section>}
          {(space.hours ?? []).length > 0 && <Section title="Opening hours"><Hours hours={space.hours!} /></Section>}
          {info.length > 0 && <Section title="Good to know"><div className="flex flex-col gap-4">{info.map((item) => <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-white p-5"><h3 className="text-sm font-bold text-[var(--navy)]">{labelOf(infoTopics, item.topic)}</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text)]">{item.details}</p></div>)}</div></Section>}
          <Section title="Location">
            {listing.lat !== null && <SpaceMap items={[listing]} selected={listing.slug} cooperative className="h-[360px]" />}
            <div className="mt-4 flex flex-col gap-1 text-sm text-[var(--muted-text)]">
              <p className="flex items-center gap-2 text-[var(--navy)]"><MapPin className="size-4 text-[var(--teal)]" />{[space.address, space.floor, space.city].filter(Boolean).join(', ')}</p>
              {space.landmark && <p className="pl-6">{space.landmark}</p>}
              {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex w-fit items-center gap-2 pl-6 font-bold text-[var(--teal)]">Open in Google Maps <ExternalLink className="size-3.5" /></a>}
            </div>
          </Section>
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <SpaceBooking slug={space.slug} options={options.filter((option) => option.available !== false).map((option) => option.name || labelOf(workspaceTypes, option.type))} />
          <ContactCard space={space} />
        </aside>
      </div>
      {similar.length > 0 && <section className="mt-20 border-t border-[var(--border)] pt-14"><SectionTitle title="Similar workspaces nearby" copy="Keep exploring places that fit your day." /><SimilarSpaces current={space.slug} items={similar} /></section>}
    </div>
  </main></PageShell>
}
