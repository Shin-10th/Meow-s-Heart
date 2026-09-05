import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Register() {
  const { signUp } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signUp(email, password, fullName)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16 text-center">
        <div className="card max-w-md p-8">
          <h1 className="font-display text-2xl font-extrabold text-cocoa">{t('register.doneHeading')}</h1>
          <p className="mt-2 text-cocoa-light">{t('register.doneDesc')}</p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-6">{t('register.goToSignIn')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-center font-display text-2xl font-extrabold text-cocoa">{t('register.heading')}</h1>
        <p className="mt-1 text-center text-sm text-cocoa-light">{t('register.subtitle')}</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">{t('register.needsSupabase')}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">{t('register.fullName')}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">{t('register.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">{t('register.password')}</label>
            <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t('register.creating') : t('register.create')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cocoa-light">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">{t('register.signInLink')}</Link>
        </p>
      </div>
    </div>
  )
}
