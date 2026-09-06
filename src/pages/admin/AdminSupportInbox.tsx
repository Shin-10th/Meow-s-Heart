import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { SupportConversation, SupportMessage } from '../../types'
import PawSpinner from '../../components/PawSpinner'

const priorityMeta: Record<number, { label: string; color: string }> = {
  0: { label: 'Handled', color: 'bg-green-100 text-green-700' },
  1: { label: 'Waiting', color: 'bg-amber-100 text-amber-700' },
  2: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

function sortConversations(list: SupportConversation[]) {
  return [...list].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return new Date(a.last_message_at).getTime() - new Date(b.last_message_at).getTime()
  })
}

export default function AdminSupportInbox() {
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  async function loadConversations() {
    setLoading(true)
    const { data } = await supabase
      .from('support_conversations')
      .select('*, profile:profiles(full_name, phone)')
    const list = sortConversations((data as SupportConversation[]) ?? [])
    setConversations(list)
    setLoading(false)
    if (!selectedId && list.length > 0) setSelectedId(list[0].id)
  }

  useEffect(() => {
    loadConversations()
    const channel = supabase
      .channel('admin-support-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_conversations' }, () => {
        loadConversations()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }
    let active = true
    async function loadMessages() {
      setMessagesLoading(true)
      const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true })
      if (active) {
        setMessages((data as SupportMessage[]) ?? [])
        setMessagesLoading(false)
      }
    }
    loadMessages()

    const channel = supabase
      .channel(`admin-support-messages-${selectedId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          const row = payload.new as SupportMessage
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]))
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleReply(e: FormEvent) {
    e.preventDefault()
    const body = reply.trim()
    if (!body || !selectedId || sending) return
    setSending(true)
    setReply('')
    const { data: inserted } = await supabase
      .from('support_messages')
      .insert({ conversation_id: selectedId, sender: 'admin', body })
      .select()
      .single()
    if (inserted) setMessages((prev) => [...prev, inserted as SupportMessage])
    setSending(false)
  }

  if (loading) return <PawSpinner />

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-cocoa">Support Chat</h1>
      <p className="mt-1 text-sm text-cocoa-light">
        Conversations are ranked by priority — urgent and waiting-on-you threads float to the top.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[19rem_1fr]">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <p className="card p-5 text-sm text-cocoa-light">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const meta = priorityMeta[c.priority] ?? priorityMeta[0]
              const active = c.id === selectedId
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`card block w-full p-4 text-left transition ${
                    active ? 'ring-2 ring-brand-400' : 'hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-cocoa">
                      {c.profile?.full_name || 'Customer'}
                    </p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-cocoa-light">{c.profile?.phone || '—'}</p>
                  <p className="mt-1 text-xs text-cocoa-light">
                    {new Date(c.last_message_at).toLocaleString()}
                    {c.human_engaged ? ' · you replied' : ''}
                  </p>
                </button>
              )
            })
          )}
        </div>

        <div className="card flex h-[32rem] flex-col overflow-hidden">
          {!selected ? (
            <div className="grid flex-1 place-items-center text-sm text-cocoa-light">
              Select a conversation to view it.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-cocoa/10 px-5 py-3">
                <div>
                  <p className="font-semibold text-cocoa">{selected.profile?.full_name || 'Customer'}</p>
                  <p className="text-xs text-cocoa-light">{selected.profile?.phone || '—'}</p>
                </div>
                {selected.human_engaged && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                    <ShieldCheck className="h-3.5 w-3.5" /> You're handling this
                  </span>
                )}
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                {messagesLoading ? (
                  <p className="text-center text-xs text-cocoa-light">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-cocoa-light">No messages yet.</p>
                ) : (
                  messages.map((m) => {
                    const fromAdmin = m.sender === 'admin'
                    return (
                      <div key={m.id} className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                            fromAdmin
                              ? 'bg-brand-500 text-white'
                              : m.sender === 'ai'
                                ? 'bg-cream-dark text-cocoa'
                                : 'bg-cocoa/5 text-cocoa'
                          }`}
                        >
                          {!fromAdmin && (
                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide opacity-60">
                              {m.sender === 'ai' ? "Meow's Assistant" : 'Customer'}
                            </p>
                          )}
                          {m.body}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleReply} className="flex items-center gap-2 border-t border-cocoa/10 p-3">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply as Meow's Heart..."
                  className="input !py-2 flex-1 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  aria-label="Send reply"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
