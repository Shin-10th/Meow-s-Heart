import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShoppingBag, Sparkles, ShieldCheck, Heart, PawPrint, Gift, ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'
import PawSpinner from '../components/PawSpinner'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
            Hello..Meow's Pretties Warmly Welcome to Our Meow's Heart
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-tight text-cocoa sm:text-6xl">
            Discover Your <span className="text-brand-500">Purr-fect Beauty</span> Look
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cocoa-light">
            Trendy, authentic, and affordable beauty solutions from Korea, Thailand, and China.
            Let's make you shine with confidence! 🐾🎀
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-cocoa">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-500" /> Premium Quality</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-500" /> Authentic Products</span>
            <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-brand-500" /> Beauty Experts</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary">
              <ShoppingBag className="h-4 w-4" /> Shop Now
            </Link>
            <Link to="/register" className="btn-secondary bg-white/70">
              Register &amp; Get Meow's Paws
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
          <h2 className="text-3xl font-extrabold text-cocoa">Featured Products</h2>
          <p className="mt-2 text-cocoa-light">
            Discover our bestsellers and newest arrivals, carefully curated for your beauty journey
          </p>
        </div>

        <div className="mt-10">
          {!isSupabaseConfigured ? (
            <div className="card mx-auto max-w-xl p-8 text-center text-sm text-cocoa-light">
              Connect Supabase (see <code className="rounded bg-brand-50 px-1.5 py-0.5">supabase/SETUP.md</code>) to show live
              featured products here.
            </div>
          ) : loading ? (
            <PawSpinner label="Fetching featured products..." />
          ) : products.length === 0 ? (
            <p className="text-center text-cocoa-light">No featured products yet — check back soon!</p>
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
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Loyalty teaser */}
      <section className="bg-brand-500">
        <div className="container-page grid gap-10 py-16 text-white lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Meow's Paws</h2>
            <p className="mt-3 max-w-md text-brand-50">
              Join our loyalty program and earn rewards with every purr-chase!
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <PawPrint className="h-6 w-6" />
                <h3 className="mt-2 font-semibold">Earn Meow's Paws</h3>
                <p className="mt-1 text-sm text-brand-50">Get 1 paw for every 30,000 MMK spent</p>
              </div>
              <div>
                <Sparkles className="h-6 w-6" />
                <h3 className="mt-2 font-semibold">Exclusive Perks</h3>
                <p className="mt-1 text-sm text-brand-50">Early sale access &amp; birthday gifts</p>
              </div>
              <div>
                <Gift className="h-6 w-6" />
                <h3 className="mt-2 font-semibold">Redeem Rewards</h3>
                <p className="mt-1 text-sm text-brand-50">Use paws for discounts &amp; free products</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-8 text-center backdrop-blur">
            <h3 className="font-display text-2xl font-bold">Ready to Start Collecting Paws? 🐾</h3>
            <p className="mt-2 text-brand-50">
              Sign up now and get 3 bonus paws to start your beauty journey!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="rounded-full bg-white px-6 py-3 font-semibold text-brand-600 hover:bg-brand-50">
                Join Now
              </Link>
              <Link to="/loyalty" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/10">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
