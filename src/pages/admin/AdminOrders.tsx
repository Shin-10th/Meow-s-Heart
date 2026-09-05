import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Order, OrderStatus } from '../../types'
import { formatMMK } from '../../lib/format'
import PawSpinner from '../../components/PawSpinner'

const statuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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

  async function updateStatus(order: Order, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', order.id)
    load()
  }

  if (loading) return <PawSpinner />

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-cocoa">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-cocoa-light">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-cocoa">
                    #{order.id.slice(0, 8)} · {order.shipping_name} · {order.shipping_phone}
                  </p>
                  <p className="text-xs text-cocoa-light">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                    className="rounded-lg border border-cocoa/15 px-2 py-1 text-xs font-semibold"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-sm text-cocoa-light">{order.shipping_address}</p>
              <ul className="mt-3 space-y-1 text-sm text-cocoa-light">
                {order.order_items?.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatMMK(item.unit_price_mmk * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-cocoa/10 pt-3 text-sm font-bold text-cocoa">
                <span>Total</span>
                <span>{formatMMK(order.total_mmk)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
