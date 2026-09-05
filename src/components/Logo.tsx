import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="font-display text-xl italic text-brand-500">M</span>
      <span className="font-display text-lg font-medium tracking-wide text-cocoa">
        Meow's Heart
      </span>
    </Link>
  )
}
