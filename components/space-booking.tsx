'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'

const field = 'h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--navy)] outline-none focus:border-[var(--teal)]'

// Booking request: emailed to OtagLab and the space, who confirm availability
export function SpaceBooking({ slug, options }: { slug: string; options: string[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    setError('')
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const res = await fetch('/api/booking-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, slug }) })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || 'Could not send your request. Please try again.')
      setState('sent')
    } catch (err) {
      setError((err as Error).message)
      setState('idle')
    }
  }

  if (state === 'sent') return <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-[0_12px_35px_rgba(13,43,78,0.08)]"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[var(--light-teal)] text-[var(--dark-teal)]"><Check /></div><h3 className="text-lg font-bold text-[var(--navy)]">Request sent</h3><p className="mt-2 text-sm leading-6 text-[var(--muted-text)]">The space and the OtagLab team will get back to you to confirm availability.</p></div>

  return <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_12px_35px_rgba(13,43,78,0.08)]">
    <div><h3 className="text-lg font-bold text-[var(--navy)]">Request a booking</h3><p className="mt-1 text-xs text-[var(--muted-text)]">Free and without obligation. The space confirms availability.</p></div>
    {options.length > 0 && <label className="text-xs font-semibold text-[var(--muted-text)]">Workspace<select name="option" className={`${field} mt-1`}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>}
    <div className="grid grid-cols-2 gap-2">
      <label className="text-xs font-semibold text-[var(--muted-text)]">Date<input type="date" name="date" required min={new Date().toISOString().slice(0, 10)} className={`${field} mt-1`} /></label>
      <label className="text-xs font-semibold text-[var(--muted-text)]">People<input type="number" name="people" min={1} max={200} defaultValue={1} className={`${field} mt-1`} /></label>
    </div>
    <input name="name" required maxLength={100} placeholder="Your name" autoComplete="name" className={field} />
    <input name="email" type="email" required maxLength={200} placeholder="Email" autoComplete="email" className={field} />
    <input name="phone" type="tel" maxLength={30} placeholder="Phone (optional)" autoComplete="tel" className={field} />
    <textarea name="message" maxLength={2000} rows={3} placeholder="Anything else? (optional)" className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--navy)] outline-none focus:border-[var(--teal)]" />
    {/* Hidden from people; bots that fill it in are ignored */}
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    {error && <p role="alert" className="text-sm text-[var(--error)]">{error}</p>}
    <button disabled={state === 'sending'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><Send className="size-4" />{state === 'sending' ? 'Sending…' : 'Send request'}</button>
  </form>
}
