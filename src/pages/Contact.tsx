import { useState, type FormEvent } from 'react'
import { Phone, Mail, MapPin, Clock, Camera, Users, Send } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useLanguage } from '../context/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
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
        <h1 className="font-display text-4xl font-extrabold text-cocoa">{t('contact.heading')}</h1>
        <p className="mt-3 text-cocoa-light">{t('contact.subtitle')}</p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="card space-y-6 p-6">
            <h2 className="font-display text-lg font-bold text-cocoa">{t('contact.infoHeading')}</h2>
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">+95 9 759053900</p>
                <p className="text-sm text-cocoa-light">{t('contact.phoneNote')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">meow.heart085@gmail.com</p>
                <p className="text-sm text-cocoa-light">{t('contact.emailNote')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">Yangon, Myanmar</p>
                <p className="text-sm text-cocoa-light">{t('contact.locationNote')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <p className="font-semibold text-cocoa">{t('contact.hoursValue')}</p>
                <p className="text-sm text-cocoa-light">{t('contact.hoursNote')}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-cocoa">{t('contact.followUs')}</p>
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
            <h2 className="font-display text-lg font-bold text-cocoa">{t('contact.formHeading')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('contact.name')}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">{t('contact.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
              </div>
            </div>
            <div>
              <label className="label">{t('contact.subject')}</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">{t('contact.message')}</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input min-h-32" required />
            </div>

            {status === 'sent' && <p className="text-sm font-semibold text-green-600">{t('contact.sent')}</p>}
            {status === 'error' && (
              <p className="text-sm font-semibold text-red-500">
                {isSupabaseConfigured ? t('contact.error') : t('contact.needsSupabase')}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
