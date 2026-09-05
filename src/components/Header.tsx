import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, PawPrint } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/loyalty', label: "Meow's Paws" },
  { to: '/consultations', label: 'Consultations' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-cocoa/80'
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
                `text-sm font-semibold transition hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-cocoa/80'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/loyalty"
            className="hidden items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 sm:flex"
            title="Meow's Paws loyalty points"
          >
            <PawPrint className="h-3.5 w-3.5" />
            {user ? 'My Paws' : 'Join'}
          </Link>
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-cocoa transition hover:bg-brand-50 hover:text-brand-600"
            aria-label="Cart"
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
            aria-label="Account"
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
                Admin
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
