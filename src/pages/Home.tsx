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
      <section className="relative overflow-hidden bg-cream">
        {/* soft ambient blobs instead of scattered paw prints */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-gold-light/40 blur-3xl" />

        <div className="container-page relative z-10 py-20 text-center sm:py-28">
          <div className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-600">
            <PawPrint className="h-3.5 w-3.5" />
            {t('home.badge')}
          </div>

          <h1
            className="animate-fade-up mx-auto mt-8 max-w-3xl font-display text-5xl font-medium leading-[1.1] text-cocoa sm:text-7xl"
            style={{ animationDelay: '80ms' }}
          >
            {t('home.title1')}
            <br />
            <span className="italic text-brand-500">{t('home.title2')}</span> {t('home.title3')}
          </h1>

          <p
            className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-cocoa-light"
            style={{ animationDelay: '160ms' }}
          >
            {t('home.subtitle')}
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-cocoa-light"
            style={{ animationDelay: '220ms' }}
          >
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" /> {t('home.feature.quality')}</span>
            <span className="hidden h-1 w-1 rounded-full bg-cocoa/20 sm:block" />
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> {t('home.feature.authentic')}</span>
            <span className="hidden h-1 w-1 rounded-full bg-cocoa/20 sm:block" />
            <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-gold" /> {t('home.feature.experts')}</span>
          </div>

          <div
            className="animate-fade-up mt-10 flex flex-wrap justify-center gap-4"
            style={{ animationDelay: '280ms' }}
          >
            <Link to="/shop" className="btn-primary">
              <ShoppingBag className="h-4 w-4" /> {t('common.shopNow')}
            </Link>
            <Link to="/register" className="btn-secondary">
              {t('home.registerCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t('nav.shop')}</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-cocoa sm:text-4xl">{t('home.featured.heading')}</h2>
          <p className="mt-3 text-cocoa-light">{t('home.featured.subtitle')}</p>
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
      <section className="bg-cocoa">
        <div className="container-page grid gap-10 py-20 text-white lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t('nav.loyalty')}</span>
            <h2 className="mt-3 font-display text-3xl font-medium sm:text-4xl">{t('home.loyalty.heading')}</h2>
            <p className="mt-3 max-w-md text-white/70">{t('home.loyalty.subtitle')}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <PawPrint className="h-6 w-6 text-gold" />
                <h3 className="mt-2 font-semibold">{t('home.loyalty.earn.title')}</h3>
                <p className="mt-1 text-sm text-white/70">{t('home.loyalty.earn.desc')}</p>
              </div>
              <div>
                <Sparkles className="h-6 w-6 text-gold" />
                <h3 className="mt-2 font-semibold">{t('home.loyalty.perks.title')}</h3>
                <p className="mt-1 text-sm text-white/70">{t('home.loyalty.perks.desc')}</p>
              </div>
              <div>
                <Gift className="h-6 w-6 text-gold" />
                <h3 className="mt-2 font-semibold">{t('home.loyalty.redeem.title')}</h3>
                <p className="mt-1 text-sm text-white/70">{t('home.loyalty.redeem.desc')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <h3 className="font-display text-2xl font-medium">{t('home.loyalty.cta.heading')}</h3>
            <p className="mt-2 text-white/70">{t('home.loyalty.cta.desc')}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="rounded-full bg-gold px-6 py-3 font-semibold text-cocoa hover:bg-gold-light">
                {t('common.joinNow')}
              </Link>
              <Link to="/loyalty" className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10">
                {t('common.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
