import { useEffect, useState } from 'react'
import { PawPrint, LogOut, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'
import { formatMMK } from '../lib/format'
import PawSpinner from '../components/PawSpinner'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
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
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-cocoa-light">
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
