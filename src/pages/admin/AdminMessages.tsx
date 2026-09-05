import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ContactMessage } from '../../types'
import PawSpinner from '../../components/PawSpinner'

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMessages((data as ContactMessage[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function markRead(message: ContactMessage) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', message.id)
    load()
  }

  if (loading) return <PawSpinner />

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-cocoa">Contact Messages</h1>

      {messages.length === 0 ? (
        <p className="mt-6 text-cocoa-light">No messages yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`card p-5 ${m.is_read ? '' : 'ring-2 ring-brand-300'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-cocoa">{m.subject}</p>
                {!m.is_read && (
                  <button onClick={() => markRead(m)} className="text-xs font-bold text-brand-600 hover:underline">
                    Mark as read
                  </button>
                )}
              </div>
              <p className="text-xs text-cocoa-light">{m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}</p>
              <p className="mt-2 text-sm text-cocoa-light">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
