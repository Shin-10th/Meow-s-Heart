import { Link } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <PawPrint className="h-12 w-12 text-brand-300" />
      <h1 className="mt-4 font-display text-3xl font-medium text-cocoa">{t('notFound.heading')}</h1>
      <p className="mt-2 text-cocoa-light">{t('notFound.desc')}</p>
      <Link to="/" className="btn-primary mt-6">{t('notFound.backHome')}</Link>
    </div>
  )
}
