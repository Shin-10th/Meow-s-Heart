import { useState, type FormEvent } from 'react'
import { Sparkles, Camera, MessageCircle, Palette, CheckCircle2, Send } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { formatMMK } from '../lib/format'
import type { TranslationKey } from '../i18n/en'

const aiTools = [
  { icon: Sparkles, key: 'skintone', price: 15000 },
  { icon: Camera, key: 'tryon', price: 10000 },
  { icon: MessageCircle, key: 'assistant', price: 0 },
  { icon: Palette, key: 'color', price: 12000 },
] as const

const consultationTypes = [
  { key: 'skincare', nameKey: 'consult.type.skincare', duration: 60, price: 25000 },
  { key: 'makeup', nameKey: 'consult.type.makeup', duration: 60, price: 30000 },
  { key: 'colorMatch', nameKey: 'consult.type.colorMatch', duration: 45, price: 20000 },
  { key: 'aiSkin', nameKey: 'consult.type.aiSkin', duration: 30, price: 15000 },
] as const

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

export default function Consultations() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [selectedType, setSelectedType] = useState<(typeof consultationTypes)[number]>(consultationTypes[0])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  async function handleBooking(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setStatus('idle')
    try {
      if (!isSupabaseConfigured) throw new Error('not configured')
      const { error } = await supabase.from('consultation_bookings').insert({
        user_id: user?.id ?? null,
        consultation_type: t(selectedType.nameKey as TranslationKey),
        full_name: fullName,
        phone,
        preferred_date: date || null,
        preferred_time: time || null,
        notes: notes || null,
      })
      if (error) throw error
      setStatus('sent')
      setFullName('')
      setPhone('')
      setDate('')
      setTime('')
      setNotes('')
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t('nav.consultations')}</span>
          <h1 className="mt-3 font-display text-4xl font-medium text-cocoa">{t('consult.heading')}</h1>
          <p className="mt-3 text-cocoa-light">{t('consult.subtitle')}</p>
        </div>

        <div className="mt-14 text-center">
          <h2 className="font-display text-2xl font-medium text-cocoa">{t('consult.techHeading')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-cocoa-light">{t('consult.techDesc')}</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {aiTools.map((tool) => (
            <div key={tool.key} className="card flex flex-col p-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-medium text-cocoa">{t(`consult.tool.${tool.key}.name` as TranslationKey)}</h3>
              <p className="mt-1 text-sm font-bold text-brand-500">
                {tool.price === 0 ? t('consult.free') : formatMMK(tool.price)}
              </p>
              <p className="mt-2 flex-1 text-sm text-cocoa-light">{t(`consult.tool.${tool.key}.desc` as TranslationKey)}</p>
              <ul className="mt-3 space-y-1.5">
                {(['f1', 'f2', 'f3'] as const).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-cocoa-light">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> {t(`consult.tool.${tool.key}.${f}` as TranslationKey)}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary flex-1 px-3 py-2 text-xs">{t('consult.tryDemo')}</button>
                <a href="#booking" className="btn-primary flex-1 px-3 py-2 text-xs">{t('consult.bookSession')}</a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-center font-display text-2xl font-medium text-cocoa">{t('consult.assistantHeading')}</h2>
          <div className="card mx-auto mt-6 max-w-xl p-6">
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl rounded-tl-sm bg-brand-50 p-3 text-cocoa">
                <span className="font-bold text-brand-600">AI: </span>
                {t('consult.assistant.hello')}
              </div>
              <div className="rounded-2xl rounded-tr-sm bg-cocoa/5 p-3 text-cocoa">
                <span className="font-bold">You: </span>
                {t('consult.assistant.question')}
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-brand-50 p-3 text-cocoa">
                <span className="font-bold text-brand-600">AI: </span>
                {t('consult.assistant.answer')}
              </div>
            </div>
            <button className="btn-primary mt-5 w-full">
              <MessageCircle className="h-4 w-4" /> {t('consult.startChat')}
            </button>
          </div>
        </div>

        <div id="booking" className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-medium text-cocoa">{t('consult.bookingHeading')}</h2>
            <p className="mt-2 text-cocoa-light">{t('consult.bookingDesc')}</p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {consultationTypes.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedType(c)}
                className={`card p-5 text-left transition ${
                  selectedType.key === c.key ? 'ring-2 ring-brand-400' : ''
                }`}
              >
                <p className="font-display font-medium text-cocoa">{t(c.nameKey as TranslationKey)}</p>
                <p className="mt-1 text-sm text-cocoa-light">{t('consult.duration')}: {t('consult.minutes', { n: c.duration })}</p>
                <p className="mt-1 font-bold text-brand-500">{formatMMK(c.price)}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleBooking} className="card mx-auto mt-8 max-w-2xl space-y-4 p-6">
            <h3 className="font-display font-medium text-cocoa">
              {t('consult.bookingFormHeading', { type: t(selectedType.nameKey as TranslationKey) })}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('consult.fullName')}</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">{t('consult.phone')}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">{t('consult.preferredDate')}</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t('consult.preferredTime')}</label>
                <select value={time} onChange={(e) => setTime(e.target.value)} className="input">
                  <option value="">{t('consult.selectTime')}</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">{t('consult.concerns')}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-24" />
            </div>

            {status === 'sent' && <p className="text-sm font-semibold text-green-600">{t('consult.success')}</p>}
            {status === 'error' && (
              <p className="text-sm font-semibold text-red-500">
                {isSupabaseConfigured ? t('consult.error') : t('consult.needsSupabase')}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Send className="h-4 w-4" /> {submitting ? t('consult.booking') : t('consult.bookButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
