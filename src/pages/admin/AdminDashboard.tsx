import { useEffect, useState } from 'react'
import { Package, ShoppingCart, Users, PawPrint } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatMMK } from '../../lib/format'
import PawSpinner from '../../components/PawSpinner'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 })

  useEffect(() => {
    async function load() {
      const [{ count: products }, { count: customers }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_mmk, status'),
      ])
      const revenue = (orders ?? [])
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_mmk ?? 0), 0)
      setStats({ products: products ?? 0, orders: orders?.length ?? 0, customers: customers ?? 0, revenue })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PawSpinner label="Loading dashboard..." />

  const cards = [
    { label: 'Products', value: stats.products, icon: Package },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart },
    { label: 'Customers', value: stats.customers, icon: Users },
    { label: 'Revenue', value: formatMMK(stats.revenue), icon: PawPrint },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-cocoa">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-cocoa-light">{c.label}</p>
              <p className="font-display text-xl font-extrabold text-cocoa">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
