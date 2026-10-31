import { Resend } from 'resend'
import { getSpace } from '@/lib/coworking'

const otaglab = 'contact@otaglab.com'
const senderDomain = process.env.RESEND_EMAIL_DOMAIN || 'otaglab.com'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character)
}

// Basic per-instance throttle: at most 5 requests per IP per 10 minutes
const recent = new Map<string, number[]>()
function throttled(ip: string) {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter((time) => now - time < 10 * 60 * 1000)
  hits.push(now)
  recent.set(ip, hits)
  return hits.length > 5
}

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function POST(request: Request) {
  // Online booking isn't offered yet; set BOOKING_REQUESTS_ENABLED=true (and show SpaceBooking) to switch it on
  if (process.env.BOOKING_REQUESTS_ENABLED !== 'true') return Response.json({ error: 'Booking requests are not available yet. Please contact the space directly.' }, { status: 404 })
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ error: 'Invalid request.' }, { status: 400 })
  // Spam trap: real visitors never fill the hidden field
  if (text(body.website, 200)) return Response.json({ ok: true })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })

  const slug = text(body.slug, 120)
  const name = text(body.name, 100)
  const email = text(body.email, 200)
  const phone = text(body.phone, 30)
  const option = text(body.option, 120)
  const message = text(body.message, 2000)
  const date = text(body.date, 10)
  const people = Math.min(200, Math.max(1, Number.parseInt(text(body.people, 4) || '1', 10) || 1))
  if (!slug || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Please provide your name, a valid email and a date.' }, { status: 400 })
  }

  const space = await getSpace(slug)
  if (!space) return Response.json({ error: 'This workspace is not available.' }, { status: 404 })
  if (!process.env.RESEND_API_KEY) return Response.json({ error: 'Booking requests are not available right now. Please contact the space directly.' }, { status: 503 })

  const rows = [['Workspace', space.name], ['Option', option || 'Not specified'], ['Date', date], ['People', String(people)], ['Name', name], ['Email', email], ['Phone', phone || 'Not provided']]
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: `OtagLab bookings <bookings@${senderDomain}>`,
    to: [otaglab],
    // The operator gets a copy so they can confirm directly
    cc: space.email ? [space.email] : undefined,
    replyTo: email,
    subject: `Booking request: ${space.name} on ${date}`,
    text: `${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\n${message}`,
    html: `<h2>New booking request via OtagLab</h2>${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}${message ? `<p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>` : ''}<p style="color:#5D6D7E">Reply to this email to answer ${escapeHtml(name)} directly.</p>`,
  }, { idempotencyKey: `booking-request/${crypto.randomUUID()}` })

  if (error) {
    console.error('Booking request email failed', error)
    return Response.json({ error: 'Could not send your request. Please try again.' }, { status: 502 })
  }
  return Response.json({ ok: true })
}
