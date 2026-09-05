import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatMMK } from '../lib/format'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user, profile } = useAuth()

  const [name, setName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-cocoa-light">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse the Shop</Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-cocoa-light">Please sign in to place an order.</p>
        <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn-primary mt-6 inline-flex">
          Sign In
        </Link>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="container-page py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-500" />
        <h1 className="mt-4 font-display text-2xl font-bold text-cocoa">Thank you for your order! 🎀</h1>
        <p className="mt-2 text-cocoa-light">
          We'll reach out at {phone} to confirm delivery details. Meow's Paws are on their way once your order is
          confirmed.
        </p>
        <Link to="/account" className="btn-primary mt-6 inline-flex">View My Orders</Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name || !phone || !address) {
      setError('Please fill in your name, phone, and delivery address.')
      return
    }

    setSubmitting(true)
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          status: 'pending',
          subtotal_mmk: subtotal,
          total_mmk: subtotal,
          shipping_name: name,
          shipping_phone: phone,
          shipping_address: address,
          notes: notes || null,
        })
        .select()
        .single()

      if (orderError || !order) throw orderError ?? new Error('Could not create order')

      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        unit_price_mmk: i.product.price_mmk,
        quantity: i.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clear()
      setOrderPlaced(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong placing your order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-extrabold text-cocoa">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 lg:col-span-2">
          <div>
            <label className="label">Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Delivery Address *</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-24" required />
          </div>
          <div>
            <label className="label">Order Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" />
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="card h-fit p-6">
          <h2 className="font-display text-lg font-bold text-cocoa">Order Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-cocoa-light">
                <span>{product.name} × {quantity}</span>
                <span className="font-semibold text-cocoa">{formatMMK(product.price_mmk * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-cocoa/10 pt-4 font-bold text-cocoa">
            <span>Total</span>
            <span>{formatMMK(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
