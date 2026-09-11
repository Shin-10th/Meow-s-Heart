import { Send } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

// lucide-react doesn't ship brand/social icons (Instagram, Facebook),
// so these two are small custom glyphs drawn in the same monoline
// stroke style as the rest of the site's icons (matches the "Send"
// icon used for Telegram right next to them) rather than an
// unrelated generic icon standing in for the platform.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" />
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" stroke="none">
        f
      </text>
    </svg>
  )
}

export default function About() {
  const { t } = useLanguage()
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">{t('footer.aboutUs')}</span>
        <h1 className="mt-3 font-display text-4xl font-medium text-cocoa">{t('about.heading')}</h1>

        <div className="mt-8 space-y-5 text-left leading-relaxed text-cocoa-light">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
          <p>{t('about.p4')}</p>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="https://www.instagram.com/meow.heart085"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <a
            href="https://t.me/meowheart085"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"
          >
            <Send className="h-5 w-5" />
          </a>
          <a
            href="https://facebook.com/share/1D8vbkqVe3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"
          >
            <FacebookIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
