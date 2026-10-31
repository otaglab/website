import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { previewPath } from '@/lib/preview'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? ''
  ;(await draftMode()).disable()
  redirect(previewPath.test(path) ? path : '/')
}
