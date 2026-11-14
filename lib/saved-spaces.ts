'use client'

import { useSyncExternalStore } from 'react'
import type { SpaceListing } from '@/lib/spaces'

// Spaces a visitor saved with the heart button. Kept in this browser (localStorage) until removed or the
// site data is cleared; nothing is sent to the server. A small snapshot is stored so the header list can
// show saved spaces without loading them; the /saved page refreshes them from the live listings.
export type SavedSpace = Pick<SpaceListing, 'slug' | 'name' | 'district' | 'price' | 'priceUnit' | 'image'>

const key = 'otaglab:saved-spaces'
const listeners = new Set<() => void>()
const empty: SavedSpace[] = []
let cache: SavedSpace[] | null = null

function read(): SavedSpace[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    cache = Array.isArray(parsed) ? parsed.filter((item): item is SavedSpace => typeof item?.slug === 'string') : []
  } catch {
    // Storage blocked (private mode) or corrupted: start empty
    cache = []
  }
  return cache
}

function write(next: SavedSpace[]) {
  cache = next
  try {
    localStorage.setItem(key, JSON.stringify(next))
  } catch {
    // Storage full or blocked: keep the list for this page view only
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep tabs in sync: another tab changed the list
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return
    cache = null
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useSavedSpaces() {
  return useSyncExternalStore(subscribe, read, () => empty)
}

export function toggleSaved(space: SavedSpace) {
  const list = read()
  write(list.some((item) => item.slug === space.slug) ? list.filter((item) => item.slug !== space.slug) : [{ slug: space.slug, name: space.name, district: space.district, price: space.price, priceUnit: space.priceUnit, image: space.image }, ...list])
}

export function removeSaved(slug: string) {
  write(read().filter((item) => item.slug !== slug))
}
