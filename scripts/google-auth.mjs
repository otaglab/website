// One-time Google sign-in for the photo import. Usage: pnpm google:auth
// Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (an OAuth "Desktop app" client) in .env.local.
// Opens Google's consent page, then saves GOOGLE_REFRESH_TOKEN to .env.local. Access is read-only.
import { exec } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local first (Google Cloud → Credentials → OAuth client ID → Desktop app).')
  process.exit(1)
}

const verifier = randomBytes(32).toString('base64url')
const challenge = createHash('sha256').update(verifier).digest('base64url')
const state = randomBytes(16).toString('hex')

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  if (url.pathname !== '/') return res.writeHead(404).end()
  const code = url.searchParams.get('code')
  if (url.searchParams.get('state') !== state || !code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Sign-in failed: ${url.searchParams.get('error') ?? 'invalid response'}. You can close this tab.`)
    return finish(1)
  }
  const token = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code', code_verifier: verifier }),
  }).then((r) => r.json())
  if (!token.refresh_token) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Google did not return a refresh token. Run pnpm google:auth again. You can close this tab.')
    console.error('No refresh token received:', token.error_description ?? token.error ?? 'unknown error')
    return finish(1)
  }
  const env = await readFile('.env.local', 'utf8').catch(() => '')
  const line = `GOOGLE_REFRESH_TOKEN=${token.refresh_token}`
  await writeFile('.env.local', /^GOOGLE_REFRESH_TOKEN=.*$/m.test(env) ? env.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, line) : `${env.replace(/\n?$/, '\n')}${line}\n`)
  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Signed in. OtagLab can now read photos from Google Drive. You can close this tab.')
  console.log('Saved GOOGLE_REFRESH_TOKEN to .env.local. You can now run pnpm spaces:import.')
  finish(0)
})

function finish(code) {
  server.close()
  setTimeout(() => process.exit(code), 100)
}

let redirectUri = ''
server.listen(0, '127.0.0.1', () => {
  redirectUri = `http://127.0.0.1:${server.address().port}`
  const consent = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })}`
  console.log(`Opening Google sign-in. If the browser doesn't open, visit:\n${consent}\n`)
  const opener = process.platform === 'win32' ? `start "" "${consent}"` : process.platform === 'darwin' ? `open "${consent}"` : `xdg-open "${consent}"`
  exec(opener)
})
