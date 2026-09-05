import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
        <Heart className="h-5 w-5" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="font-display text-lg font-bold text-cocoa">
        Meow's <span className="text-brand-500">Heart</span>
      </span>
    </Link>
  )
}
