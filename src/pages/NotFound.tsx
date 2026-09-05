import { Link } from 'react-router-dom'
import { PawPrint } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <PawPrint className="h-12 w-12 text-brand-300" />
      <h1 className="mt-4 font-display text-3xl font-extrabold text-cocoa">404 — Page not found</h1>
      <p className="mt-2 text-cocoa-light">This page must have wandered off chasing a laser pointer.</p>
      <Link to="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  )
}
