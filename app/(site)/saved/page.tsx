import type { Metadata } from 'next'
import { SavedSpacesPage } from '@/components/saved-page'

// Personal list kept in the visitor's browser: nothing to index
export const metadata: Metadata = { title: 'Saved workspaces · OtagLab', robots: { index: false } }

export default function Page() {
  return <SavedSpacesPage />
}
