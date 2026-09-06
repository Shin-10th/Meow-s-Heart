import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, ImageOff, Package, Truck, X, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Order, OrderStatus } from '../../types'
import { formatMMK } from '../../lib/format'
import PawSpinner from '../../components/PawSpinner'

const RECEIPTS_BUCKET = 'payment-receipts'

const statusMeta: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  awaiting_confirmation: { label: 'Awaiting Confirmation', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const filterTabs: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

// The guided "next step" for each status — what an admin normally does next,
// shown as the primary action button instead of a free-form dropdown.
const nextStep: Partial<Record<OrderStatus, OrderStatus>> = {
  awaiting_confirmation: 'processing',
  processing: 'shipped',
  shipped: 'completed',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    let active = true
    async function loadReceipt() {
      if (!selected?.kpay_receipt_url) {
        setReceiptUrl(null)
        return
      }
      setReceiptLoading(true)
      const { data } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .createSignedUrl(selected.kpay_receipt_url, 60 * 10)
      if (active) {
        setReceiptUrl(data?.signedUrl ?? null)
        setReceiptLoading(false)
      }
    }
    loadReceipt()
    return () => {
      active = false
    }
  }, [selected])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length }
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1
    return c
  }, [orders])

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  )

  async function updateStatus(order: Order, status: OrderStatus) {
    setUpdating(true)
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
      setSelected((prev) => (prev && prev.id === order.id ? { ...prev, status } : prev))
    }
    setUpdating(false)
  }

  if (loading) return <PawSpinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-medium text-cocoa">Orders</h1>
        <p className="text-sm text-cocoa-light">{orders.length} total</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === tab.id ? 'bg-brand-500 text-white' : 'bg-white text-cocoa ring-1 ring-cocoa/10 hover:ring-brand-300'
            }`}
          >
            {tab.label}
            {counts[tab.id] ? (
              <span
                className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${
                  filter === tab.id ? 'bg-white/25 text-white' : 'bg-cream-dark text-cocoa-light'
                }`}
              >
                {counts[tab.id]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-cocoa-light">No orders in this view.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((order) => {
            const meta = statusMeta[order.status]
            const StatusIcon = meta?.icon ?? Clock
            return (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="card flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cocoa">
                    #{order.id.slice(0, 8)} · {order.shipping_name} · {order.shipping_phone}
                  </p>
                  <p className="mt-0.5 text-xs text-cocoa-light">
                    {new Date(order.created_at).toLocaleString()}
                    {order.delivery_city ? ` · ${order.delivery_city}` : ''}
                    {order.payment_method ? ` · ${order.payment_method === 'kpay' ? 'KBZPay' : 'Cash on Delivery'}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold text-cocoa">{formatMMK(order.total_mmk)}</span>
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${meta?.color ?? ''}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {meta?.label ?? order.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-light">
                  Order #{selected.id.slice(0, 8)}
                </p>
                <h2 className="mt-1 font-display text-xl font-medium text-cocoa">{selected.shipping_name}</h2>
                <p className="text-sm text-cocoa-light">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cocoa-light hover:bg-cream-dark hover:text-cocoa"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className={`mt-4 flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                statusMeta[selected.status]?.color ?? ''
              }`}
            >
              {(() => {
                const Icon = statusMeta[selected.status]?.icon ?? Clock
                return <Icon className="h-3.5 w-3.5" />
              })()}
              {statusMeta[selected.status]?.label ?? selected.status}
            </div>

            <div className="mt-5 space-y-1 rounded-2xl border border-cocoa/10 p-4 text-sm">
              <p className="text-cocoa">
                <span className="font-semibold">Phone:</span> {selected.shipping_phone}
              </p>
              <p className="text-cocoa">
                <span className="font-semibold">Address:</span> {selected.shipping_address}
                {selected.delivery_city ? `, ${selected.delivery_city}` : ''}
              </p>
              {selected.notes && (
                <p className="text-cocoa">
                  <span className="font-semibold">Notes:</span> {selected.notes}
                </p>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-cocoa/10 p-4 text-sm">
              <p className="font-semibold text-cocoa">
                Payment: {selected.payment_method === 'kpay' ? 'KBZPay (prepaid)' : 'Cash on Delivery'}
              </p>
              {selected.payment_method === 'kpay' && (
                <div className="mt-3">
                  {receiptLoading ? (
                    <p className="text-xs text-cocoa-light">Loading receipt...</p>
                  ) : receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={receiptUrl}
                        alt="KBZPay receipt"
                        className="max-h-64 w-full rounded-xl border border-cocoa/10 object-contain"
                      />
                      <span className="mt-1 block text-xs font-semibold text-brand-600 hover:underline">
                        View full receipt
                      </span>
                    </a>
                  ) : (
                    <p className="flex items-center gap-2 text-xs text-cocoa-light">
                      <ImageOff className="h-4 w-4" /> No receipt uploaded yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <ul className="mt-4 space-y-1 rounded-2xl border border-cocoa/10 p-4 text-sm text-cocoa-light">
              {selected.order_items?.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{formatMMK(item.unit_price_mmk * item.quantity)}</span>
                </li>
              ))}
              <li className="mt-2 flex justify-between border-t border-cocoa/10 pt-2 font-bold text-cocoa">
                <span>Total</span>
                <span>{formatMMK(selected.total_mmk)}</span>
              </li>
            </ul>

            {selected.status !== 'completed' && selected.status !== 'cancelled' && (
              <div className="mt-5 flex flex-wrap gap-2">
                {nextStep[selected.status] && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(selected, nextStep[selected.status]!)}
                    className="btn-primary !px-5 !py-2.5 text-sm disabled:opacity-60"
                  >
                    Mark as {statusMeta[nextStep[selected.status]!].label}
                  </button>
                )}
                <button
                  disabled={updating}
                  onClick={() => updateStatus(selected, 'cancelled')}
                  className="btn-secondary !px-5 !py-2.5 text-sm disabled:opacity-60"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
