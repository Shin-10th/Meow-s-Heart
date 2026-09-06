import { Link } from 'react-router-dom'
import { Check, Globe, Palette, Shield, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage, type Language } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { themeId, themes, setThemeId } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { isAdmin } = useAuth()

  const languageOptions: { id: Language; label: string }[] = [
    { id: 'en', label: t('lang.english') },
    { id: 'my', label: t('lang.burmese') },
  ]

  return (
    <div className="container-page py-12">
      <div>
        <span className="eyebrow">{t('settings.eyebrow')}</span>
        <h1 className="mt-3 font-display text-4xl font-medium text-cocoa">{t('settings.heading')}</h1>
        <p className="mt-2 max-w-xl text-cocoa-light">{t('settings.subtitle')}</p>
      </div>

      <div className="mt-10 space-y-8">
        {/* Appearance / color theme */}
        <section className="card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-medium text-cocoa">{t('settings.appearance')}</h2>
              <p className="text-sm text-cocoa-light">{t('settings.appearanceDesc')}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themes.map((th) => {
              const active = th.id === themeId
              return (
                <button
                  key={th.id}
                  onClick={() => setThemeId(th.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition ${
                    active
                      ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-300/60'
                      : 'border-cocoa/10 hover:border-brand-200 hover:bg-cream-dark/60'
                  }`}
                >
                  <span
                    className="relative grid h-10 w-10 place-items-center rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: th.swatch }}
                  >
                    {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </span>
                  <span className="text-xs font-semibold leading-tight text-cocoa">{th.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Language */}
        <section className="card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-medium text-cocoa">{t('settings.language')}</h2>
              <p className="text-sm text-cocoa-light">{t('settings.languageDesc')}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {languageOptions.map((opt) => {
              const active = opt.id === language
              return (
                <button
                  key={opt.id}
                  onClick={() => setLanguage(opt.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'border-brand-400 bg-brand-500 text-white shadow-sm'
                      : 'border-cocoa/10 text-cocoa hover:border-brand-200 hover:bg-cream-dark/60'
                  }`}
                >
                  {active && <Check className="h-4 w-4" />}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Admin — only shown to admins */}
        {isAdmin && (
          <section className="card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-medium text-cocoa">{t('settings.admin')}</h2>
                <p className="text-sm text-cocoa-light">{t('settings.adminDesc')}</p>
              </div>
            </div>
            <Link to="/admin" className="btn-secondary shrink-0">
              {t('settings.openAdmin')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
