import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingBag, ChevronLeft, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import { formatMMK } from '../lib/format'
import { useCart } from '../context/CartContext'
import PawSpinner from '../components/PawSpinner'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    let active = true
    async function load() {
      const { data } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (active) {
        setProduct((data as Product) ?? null)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [slug])

  if (loading) return <PawSpinner label="Loading product..." />

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-cocoa-light">We couldn't find that product.</p>
        <Link to="/shop" className="btn-secondary mt-6 inline-flex">Back to Shop</Link>
      </div>
    )
  }

  const hasDiscount = product.compare_at_price_mmk && product.compare_at_price_mmk > product.price_mmk

  return (
    <div className="container-page py-12">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-light hover:text-brand-600">
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="card flex aspect-square items-center justify-center overflow-hidden bg-brand-50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Sparkles className="h-16 w-16 text-brand-200" />
          )}
        </div>

        <div>
          {product.origin_country && (
            <span className="text-xs font-bold uppercase tracking-wide text-brand-500">{product.origin_country}</span>
          )}
          <h1 className="mt-2 font-display text-3xl font-extrabold text-cocoa">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-cocoa">{formatMMK(product.price_mmk)}</span>
            {hasDiscount && (
              <span className="text-lg text-cocoa-light/70 line-through">
                {formatMMK(product.compare_at_price_mmk as number)}
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-cocoa-light">{product.description}</p>

          <p className="mt-4 text-sm font-semibold text-cocoa-light">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-cocoa/15">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-lg font-semibold text-cocoa"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-lg font-semibold text-cocoa"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addItem(product, quantity)}
              disabled={product.stock <= 0}
              className="btn-primary flex-1"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
