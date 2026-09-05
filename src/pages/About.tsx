import { Camera, Users, Send } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

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
          <a href="#" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100">
            <Camera className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Telegram" className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100">
            <Send className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100">
            <Users className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
