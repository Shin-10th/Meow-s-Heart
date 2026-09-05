import { useState, type FormEvent } from 'react'
import { Sparkles, Camera, MessageCircle, Palette, CheckCircle2, Send } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatMMK } from '../lib/format'

const aiTools = [
  {
    icon: Sparkles,
    name: 'AI Skintone Analysis',
    price: 15000,
    description: 'Discover your unique skin tone and undertones with our advanced AI technology',
    features: ['Warm/Cool/Neutral analysis', 'Personalized recommendations', 'Instant results'],
  },
  {
    icon: Camera,
    name: 'Virtual Makeup Try-on',
    price: 10000,
    description: 'Try on lipsticks, eyeshadows, and blush virtually before you buy',
    features: ['Real-time AR technology', 'Save your looks', 'Share with friends'],
  },
  {
    icon: MessageCircle,
    name: '24/7 Beauty Assistant',
    price: 0,
    description: 'Get instant answers to your beauty questions from our AI chatbot',
    features: ['Instant responses', 'Personalized tips', 'Product recommendations'],
  },
  {
    icon: Palette,
    name: 'Color Matching Tool',
    price: 12000,
    description: 'Find your perfect foundation and concealer shade match',
    features: ['Foundation matching', 'Concealer recommendations', 'Color analysis'],
  },
]

const consultationTypes = [
  { name: 'Skincare Consultation', duration: '60 min', price: 25000 },
  { name: 'Makeup Consultation', duration: '60 min', price: 30000 },
  { name: 'Color Matching Session', duration: '45 min', price: 20000 },
  { name: 'AI Skin Analysis', duration: '30 min', price: 15000 },
]

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

export default function Consultations() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState(consultationTypes[0].name)
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
        consultation_type: selectedType,
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
          <h1 className="font-display text-4xl font-extrabold text-cocoa">Beauty Consultations &amp; AI Tools</h1>
          <p className="mt-3 text-cocoa-light">
            Discover your perfect beauty routine with our professional consultations and cutting-edge AI
            technology. From personalized skincare advice to virtual makeup try-ons, we're here to enhance your
            natural beauty.
          </p>
        </div>

        <div className="mt-14 text-center">
          <h2 className="font-display text-2xl font-bold text-cocoa">Meow's Pretties Meet Technology</h2>
          <p className="mx-auto mt-2 max-w-xl text-cocoa-light">
            Experience the future of beauty with our AI-powered tools. Get personalized recommendations, virtual
            try-ons, and expert guidance powered by cutting-edge technology.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {aiTools.map((tool) => (
            <div key={tool.name} className="card flex flex-col p-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-bold text-cocoa">{tool.name}</h3>
              <p className="mt-1 text-sm font-bold text-brand-500">
                {tool.price === 0 ? 'Free' : formatMMK(tool.price)}
              </p>
              <p className="mt-2 flex-1 text-sm text-cocoa-light">{tool.description}</p>
              <ul className="mt-3 space-y-1.5">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-cocoa-light">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary flex-1 px-3 py-2 text-xs">Try Demo</button>
                <a href="#booking" className="btn-primary flex-1 px-3 py-2 text-xs">Book Session</a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-cocoa">Try Our Beauty Assistant</h2>
          <div className="card mx-auto mt-6 max-w-xl p-6">
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl rounded-tl-sm bg-brand-50 p-3 text-cocoa">
                <span className="font-bold text-brand-600">AI: </span>
                Hello! I'm your beauty assistant. Ask me anything about skincare, makeup, or beauty routines!
              </div>
              <div className="rounded-2xl rounded-tr-sm bg-cocoa/5 p-3 text-cocoa">
                <span className="font-bold">You: </span>
                What's the best skincare routine for oily skin?
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-brand-50 p-3 text-cocoa">
                <span className="font-bold text-brand-600">AI: </span>
                For oily skin, I recommend: 1) Gentle cleanser twice daily, 2) BHA exfoliant 2-3x/week, 3)
                Lightweight moisturizer, 4) SPF 30+ daily. Try our Korean Glow Essence for oil control!
              </div>
            </div>
            <button className="btn-primary mt-5 w-full">
              <MessageCircle className="h-4 w-4" /> Start Chat with AI Assistant
            </button>
          </div>
        </div>

        <div id="booking" className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-cocoa">Book Your Beauty Consultation</h2>
            <p className="mt-2 text-cocoa-light">
              Get personalized beauty advice from our expert consultants. Choose from various consultation types
              to find the perfect match for your beauty needs.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {consultationTypes.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedType(c.name)}
                className={`card p-5 text-left transition ${
                  selectedType === c.name ? 'ring-2 ring-brand-400' : ''
                }`}
              >
                <p className="font-display font-bold text-cocoa">{c.name}</p>
                <p className="mt-1 text-sm text-cocoa-light">Duration: {c.duration}</p>
                <p className="mt-1 font-bold text-brand-500">{formatMMK(c.price)}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleBooking} className="card mx-auto mt-8 max-w-2xl space-y-4 p-6">
            <h3 className="font-display font-bold text-cocoa">Book Your Session — {selectedType}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name *</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Preferred Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Preferred Time</label>
                <select value={time} onChange={(e) => setTime(e.target.value)} className="input">
                  <option value="">Select time</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Beauty Concerns &amp; Goals</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-24" />
            </div>

            {status === 'sent' && <p className="text-sm font-semibold text-green-600">Booking received — we'll confirm your session soon!</p>}
            {status === 'error' && (
              <p className="text-sm font-semibold text-red-500">
                {isSupabaseConfigured ? 'Something went wrong. Please try again.' : 'Bookings need Supabase connected — see supabase/SETUP.md.'}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Send className="h-4 w-4" /> {submitting ? 'Booking...' : 'Book Consultation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
