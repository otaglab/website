// Read-only Google Drive access for the photo import, using the token saved by `pnpm google:auth`

type DriveFile = { id: string; name: string; mimeType: string }

export const driveConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)

let cached: { token: string; expires: number } | null = null

async function accessToken() {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: process.env.GOOGLE_REFRESH_TOKEN!, grant_type: 'refresh_token' }),
  })
  const body = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string }
  if (!res.ok || !body.access_token) throw new Error(`Google sign-in failed (${body.error_description ?? body.error ?? res.status}). Run pnpm google:auth again.`)
  cached = { token: body.access_token, expires: Date.now() + (body.expires_in ?? 3600) * 1000 }
  return cached.token
}

async function drive(path: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, { headers: { Authorization: `Bearer ${await accessToken()}` } })
  if (!res.ok) throw new Error(`Google Drive ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res
}

// File or folder ID from any Drive share link
export function parseDriveLink(link: string): { id: string; kind: 'file' | 'folder' } | null {
  const folder = link.match(/\/folders\/([\w-]+)/)?.[1]
  if (folder) return { id: folder, kind: 'folder' }
  const file = link.match(/\/file\/d\/([\w-]+)/)?.[1] ?? link.match(/[?&]id=([\w-]+)/)?.[1]
  return file ? { id: file, kind: 'file' } : null
}

export async function driveFileInfo(id: string): Promise<DriveFile> {
  return (await drive(`files/${id}?fields=id,name,mimeType&supportsAllDrives=true`)).json()
}

// Images directly inside a folder, in name order
export async function driveFolderImages(folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = []
  let pageToken = ''
  do {
    const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`)
    const page = (await (await drive(`files?q=${query}&fields=nextPageToken,files(id,name,mimeType)&orderBy=name&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true${pageToken ? `&pageToken=${pageToken}` : ''}`)).json()) as { files: DriveFile[]; nextPageToken?: string }
    files.push(...page.files)
    pageToken = page.nextPageToken ?? ''
  } while (pageToken)
  return files
}

export async function driveDownload(id: string): Promise<Buffer> {
  return Buffer.from(await (await drive(`files/${id}?alt=media&supportsAllDrives=true`)).arrayBuffer())
}
