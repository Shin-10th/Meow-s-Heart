import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Category, Product } from '../types'
import ProductCard from '../components/ProductCard'
import PawSpinner from '../components/PawSpinner'
import { useLanguage } from '../context/LanguageContext'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc'

const DEFAULT_SORT: SortOption = 'newest'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  // Filters
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

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

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (sortBy !== DEFAULT_SORT) n += 1
    if (minPrice.trim() !== '') n += 1
    if (maxPrice.trim() !== '') n += 1
    if (inStockOnly) n += 1
    return n
  }, [sortBy, minPrice, maxPrice, inStockOnly])

  function clearFilters() {
    setSortBy(DEFAULT_SORT)
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  const filtered = useMemo(() => {
    const min = minPrice.trim() === '' ? null : Number(minPrice)
    const max = maxPrice.trim() === '' ? null : Number(maxPrice)

    const result = products.filter((p) => {
      const matchesCategory = !activeCategory || p.category_id === activeCategory
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesMin = min === null || Number.isNaN(min) || p.price_mmk >= min
      const matchesMax = max === null || Number.isNaN(max) || p.price_mmk <= max
      const matchesStock = !inStockOnly || p.stock > 0
      return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesStock
    })

    const sorted = [...result]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price_mmk - b.price_mmk)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price_mmk - a.price_mmk)
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // "newest" — products already arrive sorted by created_at desc from Supabase.
        break
    }
    return sorted
  }, [products, activeCategory, search, sortBy, minPrice, maxPrice, inStockOnly])

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'newest', label: t('shop.sort.newest') },
    { id: 'price-asc', label: t('shop.sort.priceAsc') },
    { id: 'price-desc', label: t('shop.sort.priceDesc') },
    { id: 'name-asc', label: t('shop.sort.name') },
  ]

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
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-light" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('shop.searchPlaceholder')}
                  className="input pl-9"
                />
              </div>

              <div className="relative shrink-0" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen((o) => !o)}
                  aria-expanded={filterOpen}
                  className={`relative grid h-11 w-11 place-items-center rounded-2xl border transition ${
                    filterOpen || activeFilterCount > 0
                      ? 'border-brand-400 bg-brand-50 text-brand-600'
                      : 'border-cocoa/15 bg-white text-cocoa hover:border-brand-300 hover:text-brand-600'
                  }`}
                  title={t('shop.filters')}
                  aria-label={t('shop.filters')}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-72 rounded-2xl border border-cocoa/10 bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-cocoa">{t('shop.filters')}</p>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="grid h-7 w-7 place-items-center rounded-full text-cocoa-light hover:bg-cream-dark hover:text-cocoa"
                        aria-label={t('common.cancel')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-light">
                        {t('shop.sortBy')}
                      </p>
                      <div className="mt-2 flex flex-col gap-1">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setSortBy(opt.id)}
                            className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                              sortBy === opt.id ? 'bg-brand-50 text-brand-600' : 'text-cocoa hover:bg-cream-dark/70'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-light">
                        {t('shop.priceRange')}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder={t('shop.minPrice')}
                          className="input px-3 py-2 text-sm"
                        />
                        <span className="text-cocoa-light">–</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder={t('shop.maxPrice')}
                          className="input px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm font-medium text-cocoa">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="h-4 w-4 rounded border-cocoa/30 text-brand-500 focus:ring-brand-300"
                      />
                      {t('shop.inStockOnly')}
                    </label>

                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 w-full rounded-xl border border-cocoa/10 py-2 text-sm font-semibold text-cocoa-light transition hover:border-brand-200 hover:text-brand-600"
                      >
                        {t('shop.clearFilters')}
                      </button>
                    )}
                  </div>
                )}
              </div>
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
