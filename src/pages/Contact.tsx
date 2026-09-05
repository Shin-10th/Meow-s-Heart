import { useState, type FormEvent } from 'react'
import { Phone, Mail, MapPin, Clock, Camera, Users, Send } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setStatus('idle')
    try {
      if (!isSupabaseConfigured) throw new Error('not configured')
      const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message })
      if (error) throw error
      setStatus('sent')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-extrabold text-cocoa">Get in Touch with Meow's Heart</h1>
        <p className="mt-3 text-cocoa-light">
          We'd love to hear from you! Whether you have questions about our products, need beauty advice, or want
          to share feedback, we're here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="card space-y-6 p-6">
            <h2 className="font-display text-lg font-bold text-cocoa">Contact Information</h2>
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">+95 9 759053900</p>
                <p className="text-sm text-cocoa-light">Available 9 AM – 8 PM daily</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">meow.heart085@gmail.com</p>
                <p className="text-sm text-cocoa-light">We'll respond within 24 hours</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">Yangon, Myanmar</p>
                <p className="text-sm text-cocoa-light">Serving nationwide</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">Monday – Sunday</p>
                <p className="text-sm text-cocoa-light">9:00 AM – 8:00 PM</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-cocoa">Follow Us</p>
              <div className="flex gap-3">
                <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"><Users className="h-4 w-4" /></a>
                <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"><Camera className="h-4 w-4" /></a>
                <a href="#" aria-label="Telegram" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"><Send className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-cocoa">Send us a Message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
              </div>
            </div>
            <div>
              <label className="label">Subject *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input min-h-32" required />
            </div>

            {status === 'sent' && <p className="text-sm font-semibold text-green-600">Message sent — thank you! We'll be in touch soon.</p>}
            {status === 'error' && (
              <p className="text-sm font-semibold text-red-500">
                {isSupabaseConfigured
                  ? "Something went wrong sending your message. Please try again."
                  : 'Contact form needs Supabase connected — see supabase/SETUP.md.'}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
