import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Category, Product } from '../types'
import ProductCard from '../components/ProductCard'
import PawSpinner from '../components/PawSpinner'
import { useLanguage } from '../context/LanguageContext'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    let active = true
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ])
      if (active) {
        setProducts((productsData as Product[]) ?? [])
        setCategories((categoriesData as Category[]) ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !activeCategory || p.category_id === activeCategory
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, search])

  return (
    <div className="container-page py-12">
      <div className="text-center">
        <span className="eyebrow">{t('nav.shop')}</span>
        <h1 className="mt-3 font-display text-4xl font-medium text-cocoa">{t('shop.heading')}</h1>
        <p className="mt-2 text-cocoa-light">{t('shop.subtitle')}</p>
      </div>

      {!isSupabaseConfigured ? (
        <div className="card mx-auto mt-10 max-w-xl p-8 text-center text-sm text-cocoa-light">
          {t('common.connectSupabase')}
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeCategory === null ? 'bg-brand-500 text-white' : 'bg-white text-cocoa ring-1 ring-cocoa/10'
                }`}
              >
                {t('shop.all')}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    activeCategory === c.id ? 'bg-brand-500 text-white' : 'bg-white text-cocoa ring-1 ring-cocoa/10'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-light" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('shop.searchPlaceholder')}
                className="input pl-9"
              />
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <PawSpinner label={t('shop.loading')} />
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-cocoa-light">{t('shop.noMatch')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
