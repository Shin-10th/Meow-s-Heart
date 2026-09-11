import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <img src="/logo-mark.png" alt="" className="h-9 w-auto object-contain" />
      <span className="font-display text-lg font-medium tracking-wide text-cocoa">
        Meow's Heart
      </span>
    </Link>
  )
}
