'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { GenericPage, Notice, WorkspaceCard } from '@/components/otaglab'
import { removeSaved, useSavedSpaces } from '@/lib/saved-spaces'
import type { SpaceListing } from '@/lib/spaces'

// Saved spaces as cards, refreshed from the live listings (prices and photos may have changed)
export function SavedSpacesPage() {
  const saved = useSavedSpaces()
  const [live, setLive] = useState<SpaceListing[] | null>(null)

  useEffect(() => {
    fetch('/api/spaces').then((res) => (res.ok ? res.json() : Promise.reject(res))).then(({ spaces }: { spaces: SpaceListing[] }) => setLive(spaces)).catch(() => setLive(null))
  }, [])

  // Spaces that are no longer published are dropped from the list
  useEffect(() => {
    if (!live) return
    for (const item of saved) if (!live.some((space) => space.slug === item.slug)) removeSaved(item.slug)
  }, [live, saved])

  const cards: SpaceListing[] = saved.map((item) => live?.find((space) => space.slug === item.slug) ?? { ...item, distance: '', types: '', amenities: '', status: '', verified: false, lat: null, lng: null })

  return <GenericPage eyebrow="Your list" title="Saved workspaces" copy="Spaces you saved with the heart. They're kept in this browser on this device.">
    <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-8">
      {cards.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{cards.map((space) => <WorkspaceCard key={space.slug} space={space} />)}</div>
        : <Notice>Nothing saved yet. Tap the heart on any workspace to keep it here. <Link href="/spaces" className="inline-flex items-center gap-1 font-bold text-[var(--teal)]">Browse workspaces <ArrowRight className="size-4" /></Link></Notice>}
    </section>
  </GenericPage>
}
