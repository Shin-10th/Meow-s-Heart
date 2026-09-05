import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ConsultationBooking } from '../../types'
import PawSpinner from '../../components/PawSpinner'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<ConsultationBooking[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('consultation_bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings((data as ConsultationBooking[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(booking: ConsultationBooking, status: ConsultationBooking['status']) {
    await supabase.from('consultation_bookings').update({ status }).eq('id', booking.id)
    load()
  }

  if (loading) return <PawSpinner />

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-cocoa">Consultation Bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-cocoa-light">No bookings yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-cocoa">{b.full_name} · {b.phone}</p>
                  <p className="text-xs text-cocoa-light">{b.consultation_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b, e.target.value as ConsultationBooking['status'])}
                    className="rounded-lg border border-cocoa/15 px-2 py-1 text-xs font-semibold"
                  >
                    {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(b.preferred_date || b.preferred_time) && (
                <p className="mt-2 text-sm text-cocoa-light">
                  Preferred: {b.preferred_date ?? '—'} {b.preferred_time ?? ''}
                </p>
              )}
              {b.notes && <p className="mt-2 text-sm text-cocoa-light">{b.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
