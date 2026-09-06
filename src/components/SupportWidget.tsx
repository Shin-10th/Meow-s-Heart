import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageCircle, Send, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getBotReply } from '../lib/supportBot'
import type { SupportConversation, SupportMessage } from '../types'

export default function SupportWidget() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const hidden = !user || !isSupabaseConfigured || location.pathname.startsWith('/admin')

  useEffect(() => {
    if (hidden || !open || conversation || loading) return
    ensureConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, open])

  useEffect(() => {
    if (!conversation) return
    const channel = supabase
      .channel(`support-widget-${conversation.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${conversation.id}` },
        (payload) => {
          const row = payload.new as SupportMessage
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_conversations', filter: `id=eq.${conversation.id}` },
        (payload) => {
          setConversation(payload.new as SupportConversation)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation?.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function ensureConversation() {
    if (!user) return
    setLoading(true)
    const { data: existing } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    let conv = existing as SupportConversation | null
    if (!conv) {
      const { data: created } = await supabase
        .from('support_conversations')
        .insert({ user_id: user.id })
        .select()
        .single()
      conv = created as SupportConversation
    }
    setConversation(conv)

    if (conv) {
      const { data: msgs } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })
      setMessages((msgs as SupportMessage[]) ?? [])
    }
    setLoading(false)
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const body = input.trim()
    if (!body || !conversation || sending) return
    setSending(true)
    setInput('')

    const { data: inserted } = await supabase
      .from('support_messages')
      .insert({ conversation_id: conversation.id, sender: 'customer', body })
      .select()
      .single()
    if (inserted) setMessages((prev) => [...prev, inserted as SupportMessage])

    // Re-check human_engaged fresh from the DB (not just local state) so
    // the bot never talks over an admin who just took over the thread.
    const { data: fresh } = await supabase
      .from('support_conversations')
      .select('human_engaged')
      .eq('id', conversation.id)
      .single()

    if (!fresh?.human_engaged) {
      const reply = getBotReply(body)
      const { data: botMsg } = await supabase
        .from('support_messages')
        .insert({ conversation_id: conversation.id, sender: 'ai', body: reply })
        .select()
        .single()
      if (botMsg) setMessages((prev) => [...prev, botMsg as SupportMessage])
    }

    setSending(false)
  }

  if (hidden) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-cocoa/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-brand-500 px-4 py-3 text-white">
            <p className="font-display text-sm font-semibold">{t('support.heading')}</p>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('common.cancel')}
              className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {loading ? (
              <p className="mt-4 text-center text-xs text-cocoa-light">{t('support.loading')}</p>
            ) : messages.length === 0 ? (
              <p className="mt-4 text-center text-xs text-cocoa-light">{t('support.emptyState')}</p>
            ) : (
              messages.map((m) => {
                const isCustomer = m.sender === 'customer'
                return (
                  <div key={m.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                        isCustomer
                          ? 'bg-brand-500 text-white'
                          : m.sender === 'admin'
                            ? 'bg-cocoa text-cream'
                            : 'bg-cream-dark text-cocoa'
                      }`}
                    >
                      {!isCustomer && (
                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide opacity-70">
                          {m.sender === 'admin' ? t('support.adminLabel') : t('support.assistantLabel')}
                        </p>
                      )}
                      {m.body}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-cocoa/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('support.placeholder')}
              className="input !py-2 flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label={t('support.send')}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-600"
        aria-label={t('support.heading')}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
