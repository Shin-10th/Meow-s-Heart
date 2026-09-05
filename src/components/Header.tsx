import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, PawPrint, Languages } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, isAdmin } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/about', label: t('nav.about') },
    { to: '/loyalty', label: t('nav.loyalty') },
    { to: '/consultations', label: t('nav.consultations') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/[0.06] bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-xs font-medium uppercase tracking-[0.12em] transition hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-cocoa/70'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-xs font-medium uppercase tracking-[0.12em] transition hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-cocoa/70'
                }`
              }
            >
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="hidden items-center gap-1 rounded-full border border-cocoa/10 bg-transparent px-3 py-1.5 text-xs font-medium text-cocoa/70 transition hover:border-brand-300 hover:text-brand-600 sm:flex"
            title="Switch language"
          >
            <Languages className="h-3.5 w-3.5" />
            {language === 'en' ? t('lang.burmese') : t('lang.english')}
          </button>
          <Link
            to="/loyalty"
            className="hidden items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 sm:flex"
            title="Meow's Paws loyalty points"
          >
            <PawPrint className="h-3.5 w-3.5" />
            {user ? t('header.myPaws') : t('header.join')}
          </Link>
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-cocoa transition hover:bg-brand-50 hover:text-brand-600"
            aria-label={t('header.cart')}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            to={user ? '/account' : '/login'}
            className="grid h-10 w-10 place-items-center rounded-full text-cocoa transition hover:bg-brand-50 hover:text-brand-600"
            aria-label={t('header.account')}
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-cocoa lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-cocoa/10 bg-cream lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-cocoa/80'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-cocoa/80'
                  }`
                }
              >
                {t('nav.admin')}
              </NavLink>
            )}
            <button
              onClick={toggleLanguage}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-cocoa/80"
            >
              <Languages className="h-4 w-4" />
              {language === 'en' ? t('lang.burmese') : t('lang.english')}
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
