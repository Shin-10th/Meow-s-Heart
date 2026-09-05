import { useEffect, useRef, useState } from 'react'

/**
 * A single roaming cat companion, fixed to the bottom of the viewport.
 * Loosely inspired by desktop "cat companion" pets
 * (https://sea-salt-crackers.itch.io/cat-companion) — this is an
 * original re-implementation for the web, not a copy of that game's
 * assets or code, adapted to what a browser can actually do: it
 * prowls, sits, and naps on its own, and can be clicked/"pet".
 *
 * The cat is drawn as an inline SVG colored entirely with the site's
 * theme CSS variables (see src/themes.ts / ThemeContext), so it
 * recolors live whenever the visitor switches color themes — no JS
 * needed for that part.
 *
 * Only one instance is meant to be mounted (in Layout.tsx), so it
 * shows up once per page rather than per product.
 */

type CatState = 'walk' | 'sit' | 'sleep'

const STATE_TIMING: Record<CatState, { minMs: number; maxMs: number }> = {
  walk: { minMs: 4000, maxMs: 9000 },
  sit: { minMs: 3000, maxMs: 6500 },
  sleep: { minMs: 6000, maxMs: 13000 },
}

// Weighted so the cat walks most often, sits sometimes, and naps
// occasionally — never picks the state it's already in.
function pickNextState(current: CatState): CatState {
  const options: { state: CatState; weight: number }[] = [
    { state: 'walk', weight: 5 },
    { state: 'sit', weight: 3 },
    { state: 'sleep', weight: 2 },
  ]
  const weighted = options.filter((o) => o.state !== current)
  const total = weighted.reduce((sum, o) => sum + o.weight, 0)
  let r = Math.random() * total
  for (const o of weighted) {
    if (r < o.weight) return o.state
    r -= o.weight
  }
  return weighted[0].state
}

function clampPercent(value: number): number {
  return Math.min(90, Math.max(4, value))
}

/** Chibi side-profile cat, entirely theme-colored via CSS variables. */
function CatIcon() {
  return (
    <svg className="cat-companion-body" viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 26 C62 22 62 8 52 6"
        stroke="var(--color-brand-600)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="44" cy="40" rx="5" ry="3" fill="var(--color-brand-600)" />
      <ellipse cx="33" cy="41" rx="5" ry="3" fill="var(--color-brand-600)" />
      <ellipse cx="22" cy="41" rx="5" ry="3" fill="var(--color-brand-500)" />
      <ellipse cx="13" cy="40" rx="5" ry="3" fill="var(--color-brand-500)" />
      <ellipse cx="36" cy="30" rx="18" ry="12" fill="var(--color-brand-500)" />
      <ellipse cx="36" cy="35" rx="10" ry="7" fill="var(--color-cream)" />
      <circle cx="16" cy="18" r="11" fill="var(--color-brand-500)" />
      <path d="M7 12 L5 2 L15 10 Z" fill="var(--color-brand-500)" />
      <path d="M17 10 L27 2 L25 12 Z" fill="var(--color-brand-500)" />
      <path d="M8.5 10.5 L7.5 4.5 L13 9.5 Z" fill="var(--color-brand-300)" />
      <path d="M19 9.5 L24.5 4.5 L23.5 10.5 Z" fill="var(--color-brand-300)" />
      <path
        d="M10 19 Q12.5 21.5 15 19"
        stroke="var(--color-cocoa)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M17 19 Q19.5 21.5 22 19"
        stroke="var(--color-cocoa)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="23" r="1.5" fill="var(--color-gold)" />
    </svg>
  )
}

/** Small heart used for the "pet" reaction, colored to match the theme. */
function HeartIcon() {
  return (
    <svg className="cat-companion-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="var(--color-brand-500)"
        d="M12 21s-6.7-4.35-9.3-8.1C.86 10.2 1.4 6.9 4 5.2c2.2-1.45 5-.9 6.4 1.1L12 8.1l1.6-1.8c1.4-2 4.2-2.55 6.4-1.1 2.6 1.7 3.14 5 1.3 7.7C18.7 16.65 12 21 12 21z"
      />
    </svg>
  )
}

export default function CatCompanion() {
  const [state, setState] = useState<CatState>('walk')
  const [leftPercent, setLeftPercent] = useState(10)
  const [facingLeft, setFacingLeft] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])
  const timeoutRef = useRef<number | undefined>(undefined)
  const positionRef = useRef(leftPercent)

  useEffect(() => {
    positionRef.current = leftPercent
  }, [leftPercent])

  useEffect(() => {
    const { minMs, maxMs } = STATE_TIMING[state]
    const duration = minMs + Math.random() * (maxMs - minMs)

    timeoutRef.current = window.setTimeout(() => {
      if (state === 'walk') {
        const goingLeft = Math.random() < 0.5
        const delta = 12 + Math.random() * 26
        const next = clampPercent(positionRef.current + (goingLeft ? -delta : delta))
        setFacingLeft(next < positionRef.current)
        setLeftPercent(next)
      }
      setState((current) => pickNextState(current))
    }, duration)

    return () => window.clearTimeout(timeoutRef.current)
  }, [state])

  function handlePet() {
    const id = Date.now() + Math.random()
    setHearts((h) => [...h, id])
    window.setTimeout(() => {
      setHearts((h) => h.filter((existing) => existing !== id))
    }, 900)
  }

  return (
    <div className="cat-companion-stage">
      <div className="cat-companion" data-state={state} style={{ left: `${leftPercent}%` }}>
        <button
          type="button"
          className="cat-companion-hit"
          onClick={handlePet}
          aria-label="Pet the cat"
          style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
        >
          <CatIcon />
          {state === 'sleep' && <span className="cat-companion-zzz">z z z</span>}
        </button>
        {hearts.map((id) => (
          <HeartIcon key={id} />
        ))}
      </div>
    </div>
  )
}
