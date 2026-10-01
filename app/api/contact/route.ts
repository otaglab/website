import { Resend } from 'resend'

const recipient = 'contact@otaglab.com'
const senderDomain = process.env.RESEND_EMAIL_DOMAIN || 'otaglab.com'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character)
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await request.json() as { name?: string; email?: string; phone?: string; message?: string; type?: string }
  const name = body.name?.trim()
  const email = body.email?.trim()
  const message = body.message?.trim()

  if (!name || !email || !message || !email.includes('@')) {
    return Response.json({ error: 'Please provide your name, a valid email, and a message.' }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({
    from: `OtagLab website <website@${senderDomain}>`,
    to: [recipient],
    replyTo: email,
    subject: `${body.type === 'partner' ? 'Partner application' : 'New website enquiry'} from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${body.phone?.trim() || 'Not provided'}\n\n${message}`,
    html: `<h2>${body.type === 'partner' ? 'Partner application' : 'New website enquiry'}</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(body.phone?.trim() || 'Not provided')}</p><p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
  }, { idempotencyKey: `website-contact/${crypto.randomUUID()}` })

  if (error) {
    return Response.json({ error: 'Unable to send your message right now.' }, { status: 502 })
  }

  return Response.json({ id: data?.id })
}
