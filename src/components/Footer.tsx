import { Link } from 'react-router-dom'
import { Heart, Camera, Users, Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-cocoa/10 bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white">
              <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            </span>
            <span className="font-display text-base font-bold text-cocoa">Meow's Heart</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cocoa-light">
            Trendy, authentic, and affordable beauty solutions from Korea, Thailand, and China. 🐾🎀
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100">
              <Users className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100">
              <Camera className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Telegram" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100">
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-cocoa-light">
            <li><Link to="/shop" className="hover:text-brand-600">All Products</Link></li>
            <li><Link to="/loyalty" className="hover:text-brand-600">Meow's Paws</Link></li>
            <li><Link to="/consultations" className="hover:text-brand-600">Consultations</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-cocoa-light">
            <li><Link to="/about" className="hover:text-brand-600">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-brand-600">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm text-cocoa-light">
            <li>+95 9 759053900</li>
            <li>meow.heart085@gmail.com</li>
            <li>Yangon, Myanmar</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cocoa/10 py-4 text-center text-xs text-cocoa-light">
        © {new Date().getFullYear()} Meow's Heart. Made with 💗 for beautiful hearts everywhere.
      </div>
    </footer>
  )
}
