// lucide-react doesn't ship brand/social icons (Instagram, Facebook),
// so these two are small custom glyphs drawn in the same monoline
// stroke style as the rest of the site's icons (matches the lucide
// "Send" icon used elsewhere for Telegram) rather than an unrelated
// generic icon standing in for the platform. Shared by the About
// page and the footer so both stay in sync.
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="18.5" textAnchor="middle" fontSize="21" fontWeight="800" fill="currentColor">
        f
      </text>
    </svg>
  )
}
