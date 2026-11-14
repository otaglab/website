'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Heart, X } from 'lucide-react'
import { removeSaved, useSavedSpaces } from '@/lib/saved-spaces'

// Header heart: count of saved spaces and a dropdown to open or remove them
export function SavedMenu() {
  const saved = useSavedSpaces()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return <div ref={root} className="relative">
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Saved workspaces (${saved.length})`} className="relative grid size-10 place-items-center rounded-full text-[var(--navy)] transition hover:bg-[var(--surface)]">
      <Heart className={`size-5 ${saved.length ? 'fill-[var(--teal)] text-[var(--teal)]' : ''}`} />
      {saved.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--teal)] px-1 text-[11px] font-bold text-white">{saved.length}</span>}
    </button>
    {open && <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] bg-white p-3 shadow-[0_18px_40px_rgba(13,43,78,0.16)]">
      <p className="px-1 pb-2 text-xs font-bold uppercase tracking-widest text-[var(--teal)]">Saved workspaces</p>
      {saved.length === 0 ? <p className="px-1 py-3 text-sm leading-6 text-[var(--muted-text)]">Nothing saved yet. Tap the heart on a workspace to keep it here.</p> : <>
        <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">{saved.map((space) => <li key={space.slug} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-[var(--surface)]">
          <Link href={`/spaces/${space.slug}`} onClick={() => setOpen(false)} className="flex min-w-0 flex-1 items-center gap-3">
            <img src={space.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
            <span className="min-w-0"><span className="block truncate text-sm font-bold text-[var(--navy)]">{space.name}</span><span className="block truncate text-xs text-[var(--muted-text)]">{[space.district, space.price && `from ${space.price} / ${space.priceUnit}`].filter(Boolean).join(' · ')}</span></span>
          </Link>
          <button type="button" onClick={() => removeSaved(space.slug)} aria-label={`Remove ${space.name} from saved`} className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--muted-text)] hover:bg-white hover:text-[var(--navy)]"><X className="size-4" /></button>
        </li>)}</ul>
        <Link href="/saved" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--light-teal)] px-3 py-2.5 text-sm font-bold text-[var(--dark-teal)]">View all saved <ArrowRight className="size-4" /></Link>
      </>}
    </div>}
  </div>
}
