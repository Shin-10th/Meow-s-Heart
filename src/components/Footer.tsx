import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import Logo from './Logo'
import { InstagramIcon, FacebookIcon } from './SocialIcons'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="mt-20 border-t border-cocoa/10 bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-cocoa-light">{t('footer.tagline')}</p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://facebook.com/share/1D8vbkqVe3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/meow.heart085"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://t.me/meowheart085"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100"
            >
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa">{t('footer.shop')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-cocoa-light">
            <li><Link to="/shop" className="hover:text-brand-600">{t('footer.allProducts')}</Link></li>
            <li><Link to="/loyalty" className="hover:text-brand-600">{t('nav.loyalty')}</Link></li>
            <li><Link to="/consultations" className="hover:text-brand-600">{t('nav.consultations')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa">{t('footer.company')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-cocoa-light">
            <li><Link to="/about" className="hover:text-brand-600">{t('footer.aboutUs')}</Link></li>
            <li><Link to="/contact" className="hover:text-brand-600">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cocoa">{t('footer.getInTouch')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-cocoa-light">
            <li>+95 9 759053900</li>
            <li>meow.heart085@gmail.com</li>
            <li>Yangon, Myanmar</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cocoa/10 py-4 text-center text-xs text-cocoa-light">
        © {new Date().getFullYear()} Meow's Heart. {t('footer.copyright')}
      </div>
    </footer>
  )
}
