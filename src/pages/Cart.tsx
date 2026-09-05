import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatMMK } from '../lib/format'

export default function Cart() {
  const { items, setQuantity, removeItem, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-brand-200" />
        <h1 className="mt-4 font-display text-2xl font-bold text-cocoa">Your cart is empty</h1>
        <p className="mt-2 text-cocoa-light">Looks like you haven't added any purr-fect picks yet.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse the Shop</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-extrabold text-cocoa">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card flex items-center gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/shop/${product.slug}`} className="font-semibold text-cocoa hover:text-brand-600">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-cocoa-light">{formatMMK(product.price_mmk)}</p>
              </div>
              <div className="flex items-center rounded-full border border-cocoa/15">
                <button onClick={() => setQuantity(product.id, quantity - 1)} className="px-3 py-1.5 text-cocoa">−</button>
                <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(product.id, quantity + 1)} className="px-3 py-1.5 text-cocoa">+</button>
              </div>
              <p className="w-28 shrink-0 text-right font-semibold text-cocoa">
                {formatMMK(product.price_mmk * quantity)}
              </p>
              <button
                onClick={() => removeItem(product.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cocoa-light hover:bg-red-50 hover:text-red-500"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="font-display text-lg font-bold text-cocoa">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-cocoa-light">
            <span>Subtotal</span>
            <span className="font-semibold text-cocoa">{formatMMK(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-cocoa-light">Shipping calculated at checkout.</p>
          <Link to="/checkout" className="btn-primary mt-6 w-full">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  )
}
