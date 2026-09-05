import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types'
import PawSpinner from '../../components/PawSpinner'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [origin, setOrigin] = useState('')
  const [stock, setStock] = useState('0')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      setCategories((cats as Category[]) ?? [])

      if (isEditing) {
        const { data: product } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
        if (product) {
          setName(product.name)
          setDescription(product.description ?? '')
          setPrice(String(product.price_mmk))
          setComparePrice(product.compare_at_price_mmk ? String(product.compare_at_price_mmk) : '')
          setImageUrl(product.image_url ?? '')
          setCategoryId(product.category_id ?? '')
          setOrigin(product.origin_country ?? '')
          setStock(String(product.stock))
          setIsFeatured(product.is_featured)
          setIsActive(product.is_active)
        }
        setLoading(false)
      }
    }
    load()
  }, [id, isEditing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name,
      slug: slugify(name),
      description: description || null,
      price_mmk: Number(price) || 0,
      compare_at_price_mmk: comparePrice ? Number(comparePrice) : null,
      image_url: imageUrl || null,
      category_id: categoryId || null,
      origin_country: origin || null,
      stock: Number(stock) || 0,
      is_featured: isFeatured,
      is_active: isActive,
    }

    const { error } = isEditing
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/admin/products')
  }

  if (loading) return <PawSpinner />

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-cocoa">
        {isEditing ? 'Edit Product' : 'New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="card mt-6 max-w-2xl space-y-4 p-6">
        <div>
          <label className="label">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Price (MMK) *</label>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Compare-at Price (MMK)</label>
            <input type="number" min={0} value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Image URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" placeholder="https://..." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Origin Country</label>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="input" placeholder="Korea, Thailand, China..." />
          </div>
        </div>
        <div>
          <label className="label">Stock</label>
          <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="input" />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded accent-[--color-brand-500]" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded accent-[--color-brand-500]" />
            Active (visible in shop)
          </label>
        </div>

        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
