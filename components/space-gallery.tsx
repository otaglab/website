'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'

export type GalleryPhoto = { id: number; src: string; thumb: string; card: string; hero: string; alt: string; caption: string; category: string; categoryLabel: string }

// Grid on the page, full-screen viewer with category tabs on click
export function SpaceGallery({ photos, name }: { photos: GalleryPhoto[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null)

  if (!photos.length) return <div className="grid h-[260px] place-items-center rounded-2xl bg-[var(--light-blue)] text-sm text-[var(--muted-text)]">Photos coming soon</div>

  const [cover, ...rest] = photos
  const side = rest.slice(0, 4)
  return <>
    <div className={`relative grid h-[300px] gap-2 overflow-hidden rounded-2xl sm:h-[440px] ${side.length ? 'sm:grid-cols-[1.4fr_1fr]' : ''}`}>
      <button type="button" onClick={() => setOpen(0)} className="group relative overflow-hidden" aria-label={`Open photo 1 of ${photos.length}`}>
        <img src={cover.hero} alt={cover.alt} className="size-full object-cover transition duration-300 group-hover:scale-[1.02]" />
      </button>
      {side.length > 0 && <div className={`hidden gap-2 sm:grid ${side.length > 1 ? 'grid-cols-2' : ''} ${side.length > 2 ? 'grid-rows-2' : ''}`}>
        {side.map((photo, index) => <button type="button" key={photo.id} onClick={() => setOpen(index + 1)} className={`group relative overflow-hidden ${side.length === 3 && index === 0 ? 'row-span-2' : ''}`} aria-label={`Open photo ${index + 2} of ${photos.length}`}>
          <img src={photo.card} alt={photo.alt} className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        </button>)}
      </div>}
      {photos.length > 1 && <button type="button" onClick={() => setOpen(0)} className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--navy)] shadow-md"><Images className="size-4" />Show all {photos.length} photos</button>}
    </div>
    {open !== null && <Viewer photos={photos} start={open} name={name} onClose={() => setOpen(null)} />}
  </>
}

function Viewer({ photos, start, name, onClose }: { photos: GalleryPhoto[]; start: number; name: string; onClose: () => void }) {
  const [category, setCategory] = useState('all')
  const [index, setIndex] = useState(start)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)

  const categories = useMemo(() => {
    const seen = new Map<string, { label: string; count: number }>()
    for (const photo of photos) if (photo.category) seen.set(photo.category, { label: photo.categoryLabel, count: (seen.get(photo.category)?.count ?? 0) + 1 })
    return [...seen.entries()]
  }, [photos])
  const shown = category === 'all' ? photos : photos.filter((photo) => photo.category === category)
  const current = shown[Math.min(index, shown.length - 1)]
  const step = useCallback((delta: number) => setIndex((value) => (value + delta + shown.length) % shown.length), [shown.length])

  useEffect(() => {
    // Lock page scroll and return focus to the page when closed
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [onClose, step])

  const tab = (value: string, label: string, count: number) => <button type="button" key={value} onClick={() => { setCategory(value); setIndex(0) }} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${category === value ? 'bg-white text-[var(--navy)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>{label} <span className="opacity-60">{count}</span></button>

  return <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-[60] flex flex-col bg-[#0b1724]/95 text-white">
    <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
      <p className="hidden min-w-0 flex-1 truncate text-sm font-semibold sm:block">{name}</p>
      <div className="flex flex-1 gap-2 overflow-x-auto sm:flex-none">{categories.length > 1 && [tab('all', 'All', photos.length), ...categories.map(([value, { label, count }]) => tab(value, label, count))]}</div>
      <span className="shrink-0 text-xs text-white/70">{Math.min(index, shown.length - 1) + 1} / {shown.length}</span>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close gallery" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="size-5" /></button>
    </div>
    <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
      onTouchStart={(event) => { touchX.current = event.touches[0].clientX }}
      onTouchEnd={(event) => { if (touchX.current === null) return; const dx = event.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); touchX.current = null }}>
      {current && <img key={current.id} src={current.src} alt={current.alt} className="max-h-full max-w-full rounded-lg object-contain" />}
      {shown.length > 1 && <>
        <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:left-4"><ChevronLeft className="size-6" /></button>
        <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:right-4"><ChevronRight className="size-6" /></button>
      </>}
    </div>
    <div className="px-4 pb-4 pt-3 sm:px-6">
      <p className="min-h-5 text-center text-sm text-white/80">{current?.caption || current?.alt}</p>
      {shown.length > 1 && <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">{shown.map((photo, i) => <button type="button" key={photo.id} onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index} className={`size-14 shrink-0 overflow-hidden rounded-md border-2 transition ${i === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={photo.thumb} alt="" className="size-full object-cover" /></button>)}</div>}
    </div>
  </div>
}
