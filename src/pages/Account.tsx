import { useEffect, useState } from 'react'
import { PawPrint, LogOut, Package, Check, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import type { Order, OrderStatus } from '../types'
import { formatMMK } from '../lib/format'
import PawSpinner from '../components/PawSpinner'

const trackerSteps: { id: OrderStatus; label: string }[] = [
  { id: 'awaiting_confirmation', label: 'Confirming' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'completed', label: 'Completed' },
]

function OrderProgressTracker({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
        <XCircle className="h-4 w-4" /> This order was cancelled.
      </div>
    )
  }

  const currentIndex = trackerSteps.findIndex((s) => s.id === status)

  return (
    <div className="mt-4 flex items-center">
      {trackerSteps.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                      ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-400'
                      : 'bg-cream-dark text-cocoa-light'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`whitespace-nowrap text-[10px] font-semibold ${
                  done || active ? 'text-cocoa' : 'text-cocoa-light'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < trackerSteps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded-full ${done ? 'bg-brand-500' : 'bg-cream-dark'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Account() {
  const { user, profile, signOut } = useAuth()
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (active) {
        setOrders((data as Order[]) ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-cocoa">
            {t('account.hi')}{profile?.full_name ? `, ${profile.full_name}` : ''} 👋
          </h1>
          <p className="mt-1 text-cocoa-light">{user?.email}</p>
        </div>
        <button onClick={() => signOut()} className="btn-secondary">
          <LogOut className="h-4 w-4" /> {t('account.signOut')}
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card flex items-center gap-4 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <PawPrint className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-cocoa-light">{t('account.paws')}</p>
            <p className="font-display text-2xl font-medium text-cocoa">{profile?.loyalty_points ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-cocoa-light">{t('account.ordersPlaced')}</p>
            <p className="font-display text-2xl font-medium text-cocoa">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-medium text-cocoa">{t('account.orderHistory')}</h2>
        {loading ? (
          <PawSpinner label={t('account.loadingOrders')} />
        ) : orders.length === 0 ? (
          <p className="mt-4 text-cocoa-light">{t('account.noOrders')}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-cocoa">
                    {t('account.order')} #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  {order.payment_method && (
                    <span className="text-xs text-cocoa-light">
                      {order.payment_method === 'kpay' ? 'KBZPay' : 'Cash on Delivery'}
                      {order.delivery_city ? ` · ${order.delivery_city}` : ''}
                    </span>
                  )}
                </div>

                <OrderProgressTracker status={order.status} />

                <ul className="mt-4 space-y-1 border-t border-cocoa/10 pt-3 text-sm text-cocoa-light">
                  {order.order_items?.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>{formatMMK(item.unit_price_mmk * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-cocoa/10 pt-3 text-sm font-bold text-cocoa">
                  <span>{t('account.total')}</span>
                  <span>{formatMMK(order.total_mmk)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
