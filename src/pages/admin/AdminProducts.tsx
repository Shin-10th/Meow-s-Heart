import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, EyeOff, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types'
import { formatMMK } from '../../lib/format'
import PawSpinner from '../../components/PawSpinner'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    load()
  }

  async function remove(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await supabase.from('products').delete().eq('id', product.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-cocoa">Products</h1>
        <Link to="/admin/products/new" className="btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      {loading ? (
        <PawSpinner />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-cocoa/10 text-xs uppercase text-cocoa-light">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-cocoa/5 last:border-0">
                  <td className="px-4 py-3 font-semibold text-cocoa">{p.name}</td>
                  <td className="px-4 py-3 text-cocoa-light">{formatMMK(p.price_mmk)}</td>
                  <td className="px-4 py-3 text-cocoa-light">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-cocoa/10 text-cocoa-light'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => toggleActive(p)} className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-light hover:bg-brand-50 hover:text-brand-600" title={p.is_active ? 'Hide' : 'Show'}>
                        {p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link to={`/admin/products/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-light hover:bg-brand-50 hover:text-brand-600" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-light hover:bg-red-50 hover:text-red-500" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-cocoa-light">No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
