import { Link } from 'react-router-dom'
import { PawPrint, Sparkles, Gift, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Loyalty() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()

  const tiers = [
    { key: 'kitten', paws: 0 },
    { key: 'cat', paws: 10 },
    { key: 'lioness', paws: 30 },
  ] as const

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <PawPrint className="mx-auto h-10 w-10 text-brand-500" />
        <h1 className="mt-3 font-display text-4xl font-extrabold text-cocoa">{t('loyalty.heading')}</h1>
        <p className="mt-3 text-cocoa-light">{t('loyalty.subtitle')}</p>
      </div>

      {user && profile ? (
        <div className="card mx-auto mt-10 max-w-md p-8 text-center">
          <p className="text-sm font-semibold text-cocoa-light">{t('loyalty.yourBalance')}</p>
          <p className="mt-1 font-display text-5xl font-extrabold text-brand-500">{profile.loyalty_points}</p>
          <p className="text-sm text-cocoa-light">{t('loyalty.paws')}</p>
        </div>
      ) : (
        <div className="mt-10 text-center">
          <Link to="/register" className="btn-primary inline-flex">{t('loyalty.joinCta')}</Link>
        </div>
      )}

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <PawPrint className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 font-display font-bold text-cocoa">{t('home.loyalty.earn.title')}</h3>
          <p className="mt-1 text-sm text-cocoa-light">{t('home.loyalty.earn.desc')}</p>
        </div>
        <div className="card p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 font-display font-bold text-cocoa">{t('home.loyalty.perks.title')}</h3>
          <p className="mt-1 text-sm text-cocoa-light">{t('home.loyalty.perks.desc')}</p>
        </div>
        <div className="card p-6 text-center">
          <Gift className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 font-display font-bold text-cocoa">{t('home.loyalty.redeem.title')}</h3>
          <p className="mt-1 text-sm text-cocoa-light">{t('home.loyalty.redeem.desc')}</p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-display text-2xl font-bold text-cocoa">{t('loyalty.tiersHeading')}</h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-4">
          {tiers.map((tier) => (
            <div key={tier.key} className="card flex items-center gap-4 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display font-bold text-cocoa">
                  {t(`loyalty.tier.${tier.key}` as any)} · {tier.paws}+ paws
                </p>
                <p className="text-sm text-cocoa-light">{t(`loyalty.tier.${tier.key}.perk` as any)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
