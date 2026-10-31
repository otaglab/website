import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCms } from '@/lib/cms'
import { previewPath } from '@/lib/preview'

// Turns on draft preview for a logged-in CMS user, then opens the post or space
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? ''
  // Only redirect to a post or space page, so this can't be used as an open redirect
  if (!previewPath.test(path)) return new Response('Invalid preview path', { status: 400 })
  const { user } = await (await getCms()).auth({ headers: request.headers })
  if (!user) return new Response('Log in to the CMS to preview drafts', { status: 401 })
  ;(await draftMode()).enable()
  redirect(path)
}
