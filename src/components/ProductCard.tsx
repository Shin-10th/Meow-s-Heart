import { Link } from 'react-router-dom'
import { ShoppingBag, Sparkles } from 'lucide-react'
import type { Product } from '../types'
import { formatMMK } from '../lib/format'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { t } = useLanguage()
  const hasDiscount = product.compare_at_price_mmk && product.compare_at_price_mmk > product.price_mmk

  return (
    <div className="card group flex flex-col overflow-hidden transition duration-300 hover:shadow-[0_12px_32px_-8px_rgba(69,58,54,0.16)]">
      <Link to={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brand-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-200">
            <Sparkles className="h-12 w-12" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
            {t('common.bestseller')}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-cocoa px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
            {t('common.sale')}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.origin_country && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-400">
            {product.origin_country}
          </span>
        )}
        <Link to={`/shop/${product.slug}`} className="mt-1 line-clamp-2 font-display text-[1.05rem] font-medium text-cocoa hover:text-brand-600">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-cocoa">{formatMMK(product.price_mmk)}</span>
          {hasDiscount && (
            <span className="text-sm text-cocoa-light/70 line-through">
              {formatMMK(product.compare_at_price_mmk as number)}
            </span>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          disabled={product.stock <= 0}
          className="btn-primary mt-3 w-full py-2 text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          {product.stock <= 0 ? t('common.outOfStock') : t('common.addToCart')}
        </button>
      </div>
    </div>
  )
}
