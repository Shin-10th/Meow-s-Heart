import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, CheckCircle2, Truck, Wallet, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { formatMMK } from '../lib/format'
import type { PaymentMethod } from '../types'

const RECEIPTS_BUCKET = 'payment-receipts'

// Cities where we currently offer Cash on Delivery. Everywhere else
// must prepay via KPay since we can't reliably collect cash there yet.
const COD_ELIGIBLE_CITIES = ['Yangon', 'Mandalay', 'Naypyitaw']
const CITIES = [...COD_ELIGIBLE_CITIES, 'Bago', 'Mawlamyine', 'Taunggyi', 'Pathein', 'Monywa', 'Other']

// The name shown when a customer scans the KBZPay QR code below
// (public/kpay-qr.png) — it's the registered account holder's name,
// not the store name, since that's what actually appears in the
// KBZPay app on scan and is what customers should expect to see.
const KPAY_NAME = 'Shin Mon Thant'

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type Step = 1 | 2 | 3

function Stepper({ step, labels }: { step: Step; labels: [string, string, string] }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {labels.map((label, i) => {
        const n = (i + 1) as Step
        const done = n < step
        const active = n === step
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-white text-cocoa-light ring-1 ring-cocoa/15'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className={`hidden text-sm font-semibold sm:inline ${active || done ? 'text-cocoa' : 'text-cocoa-light'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <span className={`h-0.5 flex-1 rounded-full ${done ? 'bg-brand-400' : 'bg-cocoa/10'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user, profile } = useAuth()
  const { t } = useLanguage()

  const [step, setStep] = useState<Step>(1)

  // Step 1 — details
  const [name, setName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  // Step 2 — payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [receiptPath, setReceiptPath] = useState<string | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const codEligible = COD_ELIGIBLE_CITIES.includes(city)

  useEffect(() => {
    if (!codEligible && paymentMethod === 'cod') setPaymentMethod(null)
  }, [codEligible, paymentMethod])

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
        <p className="mt-2 text-cocoa-light">
          {paymentMethod === 'kpay' ? t('checkout.thankYouKpay') : t('checkout.thankYouCod')}
        </p>
        <Link to="/account" className="btn-primary mt-6 inline-flex">{t('checkout.viewOrders')}</Link>
      </div>
    )
  }

  function goNext() {
    setError(null)
    if (step === 1) {
      if (!name || !phone || !city || !address) {
        setError(t('checkout.fillRequired'))
        return
      }
    }
    if (step === 2) {
      if (!paymentMethod) {
        setError(t('checkout.selectPaymentMethod'))
        return
      }
      if (paymentMethod === 'kpay' && !receiptPath) {
        setError(t('checkout.uploadReceiptFirst'))
        return
      }
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s))
  }

  function goBack() {
    setError(null)
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s))
  }

  async function handleReceiptChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      setUploadError(t('checkout.receiptMustBeImage'))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('checkout.receiptTooLarge'))
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
      const path = `${user.id}/${randomId()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from(RECEIPTS_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadErr) throw uploadErr

      setReceiptPath(path)
      setReceiptPreview(URL.createObjectURL(file))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('checkout.receiptUploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  function removeReceipt() {
    setReceiptPath(null)
    setReceiptPreview(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!paymentMethod) return
    setError(null)
    setSubmitting(true)
    try {
      const status = paymentMethod === 'kpay' ? 'processing' : 'awaiting_confirmation'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          status,
          subtotal_mmk: subtotal,
          total_mmk: subtotal,
          shipping_name: name,
          shipping_phone: phone,
          shipping_address: address,
          delivery_city: city,
          payment_method: paymentMethod,
          kpay_receipt_url: paymentMethod === 'kpay' ? receiptPath : null,
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

      <div className="mt-8">
        <Stepper step={step} labels={[t('checkout.step1Label'), t('checkout.step2Label'), t('checkout.step3Label')]} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="card space-y-5 p-6 lg:col-span-2">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">{t('checkout.fullName')}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">{t('checkout.phone')}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">{t('checkout.city')}</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="input" required>
                  <option value="" disabled>{t('checkout.selectCity')}</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('checkout.address')}</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-24" required />
              </div>
              <div>
                <label className="label">{t('checkout.notes')}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="label !mb-0">{t('checkout.paymentMethod')}</p>

              {!codEligible && (
                <p className="rounded-xl bg-brand-50 p-3 text-xs text-brand-700">{t('checkout.codUnavailableNote')}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {codEligible && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      paymentMethod === 'cod' ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-300/60' : 'border-cocoa/10 hover:border-brand-200'
                    }`}
                  >
                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    <span>
                      <span className="block text-sm font-bold text-cocoa">{t('checkout.cod')}</span>
                      <span className="mt-0.5 block text-xs text-cocoa-light">{t('checkout.codDesc')}</span>
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('kpay')}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === 'kpay' ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-300/60' : 'border-cocoa/10 hover:border-brand-200'
                  }`}
                >
                  <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <span>
                    <span className="block text-sm font-bold text-cocoa">{t('checkout.kpay')}</span>
                    <span className="mt-0.5 block text-xs text-cocoa-light">{t('checkout.kpayDesc')}</span>
                  </span>
                </button>
              </div>

              {paymentMethod === 'kpay' && (
                <div className="rounded-2xl border border-cocoa/10 bg-cream-dark/40 p-4">
                  <p className="text-sm font-semibold text-cocoa">{t('checkout.kpayInstructionsHeading')}</p>
                  <p className="mt-1 text-sm text-cocoa-light">{t('checkout.kpayScanQr')}</p>

                  <div className="mt-3 flex justify-center">
                    <img
                      src="/kpay-qr.png"
                      alt="KBZPay scan-to-pay QR code"
                      className="w-full max-w-[220px] rounded-2xl ring-1 ring-cocoa/10"
                    />
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold text-cocoa-light">
                    {t('checkout.kpayAccountName', { name: KPAY_NAME })}
                  </p>

                  <p className="mt-3 text-sm text-cocoa-light">{t('checkout.kpayReferenceGuide', { name: name || '—', phone: phone || '—' })}</p>

                  <div className="mt-4">
                    <p className="label">{t('checkout.uploadReceipt')}</p>
                    {receiptPreview ? (
                      <div className="flex items-center gap-3">
                        <img src={receiptPreview} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-cocoa/10" />
                        <div className="flex-1 text-sm text-cocoa-light">{t('checkout.receiptUploaded')}</div>
                        <button
                          type="button"
                          onClick={removeReceipt}
                          className="grid h-8 w-8 place-items-center rounded-full text-cocoa-light hover:bg-white hover:text-cocoa"
                          aria-label={t('common.cancel')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="btn-secondary inline-flex cursor-pointer py-2 text-sm">
                        {uploading ? t('checkout.uploading') : t('checkout.chooseReceiptFile')}
                        <input type="file" accept="image/*" className="hidden" onChange={handleReceiptChange} disabled={uploading} />
                      </label>
                    )}
                    {uploadError && <p className="mt-1 text-xs font-semibold text-red-500">{uploadError}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="label !mb-0">{t('checkout.reviewHeading')}</p>
              <div className="space-y-1 rounded-2xl border border-cocoa/10 p-4 text-sm">
                <p className="font-semibold text-cocoa">{name} · {phone}</p>
                <p className="text-cocoa-light">{address}, {city}</p>
                {notes && <p className="text-cocoa-light">{t('checkout.notes')}: {notes}</p>}
                <p className="mt-2 font-semibold text-cocoa">
                  {paymentMethod === 'cod' ? t('checkout.cod') : t('checkout.kpay')}
                </p>
              </div>

              <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
                {paymentMethod === 'kpay' ? t('checkout.autoProcessNote') : t('checkout.awaitingConfirmNote')}
              </p>

              {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
              </button>
            </form>
          )}

          {step < 3 && error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          {step < 3 && (
            <div className="flex items-center justify-between pt-2">
              {step > 1 ? (
                <button type="button" onClick={goBack} className="btn-secondary">{t('checkout.back')}</button>
              ) : <span />}
              <button type="button" onClick={goNext} className="btn-primary">{t('checkout.next')}</button>
            </div>
          )}
        </div>

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
