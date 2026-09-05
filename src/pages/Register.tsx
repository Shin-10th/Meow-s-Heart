import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Register() {
  const { signUp } = useAuth()
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
          <h1 className="font-display text-2xl font-extrabold text-cocoa">Welcome to the family! 🎀</h1>
          <p className="mt-2 text-cocoa-light">
            Check your email to confirm your account, then sign in to claim your 3 bonus Meow's Paws.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-6">Go to Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-center font-display text-2xl font-extrabold text-cocoa">Register &amp; Get Meow's Paws</h1>
        <p className="mt-1 text-center text-sm text-cocoa-light">Sign up now and get 3 bonus paws to start your beauty journey!</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
            Accounts need Supabase connected — see <code>supabase/SETUP.md</code>.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cocoa-light">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
