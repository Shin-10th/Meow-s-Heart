import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { formatMMK } from '../lib/format'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user, profile } = useAuth()
  const { t } = useLanguage()

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
        <p className="text-cocoa-light">{t('checkout.emptyCart')}</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">{t('cart.browseShop')}</Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-cocoa-light">{t('checkout.pleaseSignIn')}</p>
        <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn-primary mt-6 inline-flex">
          {t('checkout.signIn')}
        </Link>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="container-page py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-500" />
        <h1 className="mt-4 font-display text-2xl font-medium text-cocoa">{t('checkout.thankYou')}</h1>
        <p className="mt-2 text-cocoa-light">{t('checkout.thankYouDesc', { phone })}</p>
        <Link to="/account" className="btn-primary mt-6 inline-flex">{t('checkout.viewOrders')}</Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name || !phone || !address) {
      setError(t('checkout.fillRequired'))
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
      setError(err instanceof Error ? err.message : t('checkout.genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-medium text-cocoa">{t('checkout.heading')}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 lg:col-span-2">
          <div>
            <label className="label">{t('checkout.fullName')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">{t('checkout.phone')}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">{t('checkout.address')}</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-24" required />
          </div>
          <div>
            <label className="label">{t('checkout.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" />
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
          </button>
        </form>

        <div className="card h-fit p-6">
          <h2 className="font-display text-lg font-medium text-cocoa">{t('checkout.orderSummary')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-cocoa-light">
                <span>{product.name} × {quantity}</span>
                <span className="font-semibold text-cocoa">{formatMMK(product.price_mmk * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-cocoa/10 pt-4 font-bold text-cocoa">
            <span>{t('checkout.total')}</span>
            <span>{formatMMK(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
