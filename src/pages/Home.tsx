import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShoppingBag, Sparkles, ShieldCheck, Heart, PawPrint, Gift, ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'
import PawSpinner from '../components/PawSpinner'
import { useLanguage } from '../context/LanguageContext'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    let active = true
    async function loadFeatured() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(4)
      if (active) {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      }
    }
    loadFeatured()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-100 via-brand-50 to-cream">
        <div className="container-page relative z-10 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-brand-600 shadow-sm">
            <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            {t('home.badge')}
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-tight text-cocoa sm:text-6xl">
            {t('home.title1')} <span className="text-brand-500">{t('home.title2')}</span> {t('home.title3')}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cocoa-light">{t('home.subtitle')}</p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-cocoa">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-500" /> {t('home.feature.quality')}</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-500" /> {t('home.feature.authentic')}</span>
            <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-brand-500" /> {t('home.feature.experts')}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary">
              <ShoppingBag className="h-4 w-4" /> {t('common.shopNow')}
            </Link>
            <Link to="/register" className="btn-secondary bg-white/70">
              {t('home.registerCta')}
            </Link>
          </div>
        </div>

        {/* decorative paw prints */}
        <PawPrint className="pointer-events-none absolute -right-6 top-10 h-40 w-40 rotate-12 text-brand-200/60" />
        <PawPrint className="pointer-events-none absolute right-40 bottom-0 h-24 w-24 -rotate-12 text-brand-200/50" />
        <PawPrint className="pointer-events-none absolute left-[-2rem] bottom-10 h-28 w-28 rotate-6 text-brand-200/40" />
      </section>

      {/* Featured products */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-cocoa">{t('home.featured.heading')}</h2>
          <p className="mt-2 text-cocoa-light">{t('home.featured.subtitle')}</p>
        </div>

        <div className="mt-10">
          {!isSupabaseConfigured ? (
            <div className="card mx-auto max-w-xl p-8 text-center text-sm text-cocoa-light">
              {t('common.connectSupabase')}
            </div>
          ) : loading ? (
            <PawSpinner label={t('home.featured.loading')} />
          ) : products.length === 0 ? (
            <p className="text-center text-cocoa-light">{t('home.featured.empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/shop" className="btn-secondary">
            {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Loyalty teaser */}
      <section className="bg-brand-500">
        <div className="container-page grid gap-10 py-16 text-white lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold">{t('home.loyalty.heading')}</h2>
            <p className="mt-3 max-w-md text-brand-50">{t('home.loyalty.subtitle')}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <PawPrint className="h-6 w-6" />
                <h3 className="mt-2 font-semibold">{t('home.loyalty.earn.title')}</h3>
                <p className="mt-1 text-sm text-brand-50">{t('home.loyalty.earn.desc')}</p>
              </div>
              <div>
                <Sparkles className="h-6 w-6" />
                <h3 className="mt-2 font-semibold">{t('home.loyalty.perks.title')}</h3>
                <p className="mt-1 text-sm text-brand-50">{t('home.loyalty.perks.desc')}</p>
              </div>
              <div>
                <Gift className="h-6 w-6" />
                <h3 className="mt-2 font-semibold">{t('home.loyalty.redeem.title')}</h3>
                <p className="mt-1 text-sm text-brand-50">{t('home.loyalty.redeem.desc')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-8 text-center backdrop-blur">
            <h3 className="font-display text-2xl font-bold">{t('home.loyalty.cta.heading')}</h3>
            <p className="mt-2 text-brand-50">{t('home.loyalty.cta.desc')}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="rounded-full bg-white px-6 py-3 font-semibold text-brand-600 hover:bg-brand-50">
                {t('common.joinNow')}
              </Link>
              <Link to="/loyalty" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/10">
                {t('common.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
