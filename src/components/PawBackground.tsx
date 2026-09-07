/**
 * A quiet decorative layer of soft pink/whitish paw prints drifting
 * behind the page content — pure ambience, no interaction. Fixed to
 * the viewport (like CatCompanion's stage) but sunk to a negative
 * z-index so every real widget (cards, the header, buttons — all of
 * which paint their own opaque background) simply covers it; the
 * paws only ever show through the empty cream margins around them.
 *
 * Colors use the site's theme CSS variables (brand-100/200 for the
 * pink paws, cream-dark for the whitish ones), so the pattern
 * recolors live with the color-theme switcher along with everything
 * else, rather than a hardcoded pink that would clash with e.g. the
 * Sage or Lavender presets.
 */

import type { CSSProperties } from 'react'

type PawSpec = {
  top: string
  left: string
  size: number
  color: 'pink' | 'white'
  opacity: number
  duration: string
  delay: string
  rotate: number
}

const PAWS: PawSpec[] = [
  { top: '8%', left: '6%', size: 34, color: 'pink', opacity: 0.5, duration: '13s', delay: '-2s', rotate: -18 },
  { top: '16%', left: '88%', size: 26, color: 'white', opacity: 0.55, duration: '11s', delay: '-6s', rotate: 22 },
  { top: '30%', left: '48%', size: 20, color: 'pink', opacity: 0.35, duration: '15s', delay: '-4s', rotate: 8 },
  { top: '42%', left: '14%', size: 30, color: 'white', opacity: 0.4, duration: '14s', delay: '-9s', rotate: -10 },
  { top: '38%', left: '78%', size: 24, color: 'pink', opacity: 0.45, duration: '12s', delay: '-1s', rotate: 30 },
  { top: '62%', left: '92%', size: 32, color: 'pink', opacity: 0.4, duration: '16s', delay: '-7s', rotate: -24 },
  { top: '68%', left: '5%', size: 22, color: 'white', opacity: 0.5, duration: '13s', delay: '-11s', rotate: 14 },
  { top: '80%', left: '58%', size: 28, color: 'pink', opacity: 0.4, duration: '17s', delay: '-3s', rotate: -6 },
  { top: '90%', left: '30%', size: 20, color: 'white', opacity: 0.5, duration: '10s', delay: '-8s', rotate: 20 },
  { top: '5%', left: '35%', size: 18, color: 'pink', opacity: 0.35, duration: '12s', delay: '-13s', rotate: -14 },
]

function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="44" rx="15" ry="12" />
      <ellipse cx="12" cy="26" rx="6.5" ry="8.5" transform="rotate(-25 12 26)" />
      <ellipse cx="24" cy="14" rx="7" ry="9" transform="rotate(-8 24 14)" />
      <ellipse cx="40" cy="14" rx="7" ry="9" transform="rotate(8 40 14)" />
      <ellipse cx="52" cy="26" rx="6.5" ry="8.5" transform="rotate(25 52 26)" />
    </svg>
  )
}

export default function PawBackground() {
  return (
    <div className="paw-bg-stage" aria-hidden="true">
      {PAWS.map((paw, i) => (
        <div
          key={i}
          className={`paw-bg-item ${paw.color === 'pink' ? 'text-brand-200' : 'text-cream-dark'}`}
          style={
            {
              top: paw.top,
              left: paw.left,
              width: `${paw.size}px`,
              animationDuration: paw.duration,
              animationDelay: paw.delay,
              '--paw-opacity': paw.opacity,
              '--paw-rotate': `${paw.rotate}deg`,
            } as CSSProperties
          }
        >
          <PawIcon />
        </div>
      ))}
    </div>
  )
}
