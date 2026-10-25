import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? ''
  ;(await draftMode()).disable()
  redirect(/^\/insights\/[a-z]+\/[a-z0-9-]+$/.test(path) ? path : '/')
}
