import { useEffect, useRef, useState } from 'react'

/**
 * A single roaming cat companion that explores the actual page layout
 * — walking the borders of cards, the header, and the footer, jumping
 * across the gaps between them, sometimes sitting on a corner, and
 * occasionally wandering the outer window edge too — rather than
 * following one fixed rectangular path around the screen.
 *
 * Loosely inspired by desktop "cat companion" pets
 * (https://sea-salt-crackers.itch.io/cat-companion) — this is an
 * original re-implementation for the web, not a copy of that game's
 * assets or code.
 *
 * The cat is drawn as an inline SVG colored entirely with the site's
 * theme CSS variables (see src/themes.ts / ThemeContext), so it
 * recolors live whenever the visitor switches color themes.
 *
 * Only one instance is meant to be mounted (in Layout.tsx), so it
 * shows up once per page rather than per product.
 *
 * --- How the movement works ---
 * At any moment the cat has a "target" — either a real DOM element
 * (a `.card`, the `<header>`, the `<footer>`) or the viewport itself
 * — and a position `t` in [0, 400) measured around that target's own
 * perimeter (100 units per edge: top, right, bottom, left, clockwise).
 * Walking smoothly slides it along the current edge. Reaching a
 * corner of the SAME target rotates it onto the next edge (a small
 * hop). After walking a few edges of one target, instead of
 * continuing around it, the cat picks a different target (biased
 * toward ones nearby) and leaps to the closest corner of it — a
 * bigger hop, standing in for "jumping across the gap" between two
 * widgets. Rects are read live via getBoundingClientRect(), so the
 * cat stays glued to its target as the page scrolls or resizes.
 */

type Edge = 'top' | 'right' | 'bottom' | 'left'
type CatState = 'walk' | 'sit' | 'sleep'
type Rect = { top: number; left: number; width: number; height: number }
type Target = { key: string; el: HTMLElement | null }
type JumpSize = 'small' | 'big'

const STATE_TIMING: Record<CatState, { minMs: number; maxMs: number }> = {
  walk: { minMs: 2600, maxMs: 5500 },
  sit: { minMs: 2500, maxMs: 5500 },
  sleep: { minMs: 5000, maxMs: 11000 },
}

const EDGE_ROTATION: Record<Edge, number> = { top: 180, right: -90, bottom: 0, left: 90 }
// Widgets the cat is willing to explore — cards, the header, the
// footer — plus the viewport itself is always added as a fallback
// target (see collectTargets).
const WIDGET_SELECTOR = '.card, header, footer'
const MIN_WIDGET_WIDTH = 70
const MIN_WIDGET_HEIGHT = 50

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

function wrap(n: number): number {
  return ((n % 400) + 400) % 400
}

function viewportRect(): Rect {
  return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
}

function getRect(target: Target): Rect {
  if (!target.el || !document.body.contains(target.el)) return viewportRect()
  const r = target.el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function perimeterToPoint(rect: Rect, t: number): { x: number; y: number; edge: Edge } {
  const p = wrap(t)
  const { top, left, width, height } = rect
  if (p < 100) return { x: left + (p / 100) * width, y: top, edge: 'top' }
  if (p < 200) return { x: left + width, y: top + ((p - 100) / 100) * height, edge: 'right' }
  if (p < 300) return { x: left + width - ((p - 200) / 100) * width, y: top + height, edge: 'bottom' }
  return { x: left, y: top + height - ((p - 300) / 100) * height, edge: 'left' }
}

function nearestCornerT(rect: Rect, point: { x: number; y: number }): number {
  const corners: { t: number; x: number; y: number }[] = [
    { t: 0, x: rect.left, y: rect.top },
    { t: 100, x: rect.left + rect.width, y: rect.top },
    { t: 200, x: rect.left + rect.width, y: rect.top + rect.height },
    { t: 300, x: rect.left, y: rect.top + rect.height },
  ]
  let best = corners[0]
  let bestDist = Infinity
  for (const c of corners) {
    const d = (c.x - point.x) ** 2 + (c.y - point.y) ** 2
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  return best.t
}

function collectTargets(): Target[] {
  const targets: Target[] = [{ key: 'viewport', el: null }]
  document.querySelectorAll<HTMLElement>(WIDGET_SELECTOR).forEach((el, i) => {
    const r = el.getBoundingClientRect()
    if (r.width < MIN_WIDGET_WIDTH || r.height < MIN_WIDGET_HEIGHT) return
    if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return
    targets.push({ key: `w${i}-${Math.round(r.left)}-${Math.round(r.top)}`, el })
  })
  return targets
}

function rectCenter(rect: Rect): { x: number; y: number } {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function pickNextTarget(current: Target, pool: Target[]): Target {
  const candidates = pool.filter((c) => c.key !== current.key)
  if (candidates.length === 0) return current
  if (Math.random() < 0.75) {
    const currentCenter = rectCenter(getRect(current))
    const sorted = [...candidates].sort((a, b) => {
      const ca = rectCenter(getRect(a))
      const cb = rectCenter(getRect(b))
      const da = (ca.x - currentCenter.x) ** 2 + (ca.y - currentCenter.y) ** 2
      const db = (cb.x - currentCenter.x) ** 2 + (cb.y - currentCenter.y) ** 2
      return da - db
    })
    const poolSize = Math.max(1, Math.ceil(sorted.length * 0.4))
    return sorted[Math.floor(Math.random() * poolSize)]
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
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
  const [, forceTick] = useState(0)
  const [t, setT] = useState<number>(0)
  const [clockwise, setClockwise] = useState(true)
  const [state, setState] = useState<CatState>('walk')
  const [isJumping, setIsJumping] = useState<JumpSize | null>(null)
  const [hearts, setHearts] = useState<number[]>([])

  const targetRef = useRef<Target>({ key: 'viewport', el: null })
  const tRef = useRef(t)
  const clockwiseRef = useRef(clockwise)
  const edgesWalkedRef = useRef(0)
  const edgeBudgetRef = useRef(1 + Math.floor(Math.random() * 3))
  const jumpTimerRef = useRef<number | undefined>(undefined)
  const prevEdgeRef = useRef<Edge | null>(null)
  const prevTargetKeyRef = useRef<string>('viewport')

  useEffect(() => {
    tRef.current = t
  }, [t])
  useEffect(() => {
    clockwiseRef.current = clockwise
  }, [clockwise])

  // Pick an initial target once the page's real content has rendered.
  useEffect(() => {
    const pool = collectTargets()
    const initial = pool.length > 1 ? pool[1 + Math.floor(Math.random() * (pool.length - 1))] : pool[0]
    targetRef.current = initial
    prevTargetKeyRef.current = initial.key
    setT(Math.floor(Math.random() * 400))
  }, [])

  // Keep the cat glued to its current widget as the page scrolls or
  // the window resizes (their rects are viewport-relative, so they
  // shift immediately).
  useEffect(() => {
    let raf: number | undefined
    function onViewportChange() {
      if (raf !== undefined) return
      raf = requestAnimationFrame(() => {
        raf = undefined
        forceTick((n) => n + 1)
      })
    }
    window.addEventListener('scroll', onViewportChange, { passive: true, capture: true })
    window.addEventListener('resize', onViewportChange)
    return () => {
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
      if (raf !== undefined) cancelAnimationFrame(raf)
    }
  }, [])

  function triggerJump(size: JumpSize) {
    setIsJumping(null)
    window.clearTimeout(jumpTimerRef.current)
    requestAnimationFrame(() => {
      setIsJumping(size)
      jumpTimerRef.current = window.setTimeout(() => setIsJumping(null), size === 'big' ? 620 : 460)
    })
  }

  const rect = getRect(targetRef.current)
  const position = perimeterToPoint(rect, t)

  // Jump whenever the cat crosses onto a new edge of the same widget,
  // or lands on a different widget entirely.
  useEffect(() => {
    const edgeChanged = prevEdgeRef.current !== null && prevEdgeRef.current !== position.edge
    const targetChanged = prevTargetKeyRef.current !== targetRef.current.key
    if (edgeChanged || targetChanged) triggerJump(targetChanged ? 'big' : 'small')
    prevEdgeRef.current = position.edge
    prevTargetKeyRef.current = targetRef.current.key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  // Main behavior clock: advances the walk (within a widget, around
  // its corners, or leaping to another one), or waits out a sit/sleep.
  useEffect(() => {
    const { minMs, maxMs } = STATE_TIMING[state]
    const duration = minMs + Math.random() * (maxMs - minMs)

    const timer = window.setTimeout(() => {
      if (state === 'walk') {
        // Make sure the target we're on still exists; fall back to
        // the viewport if the page navigated away underneath the cat.
        if (targetRef.current.el && !document.body.contains(targetRef.current.el)) {
          targetRef.current = { key: 'viewport', el: null }
        }

        const currentRect = getRect(targetRef.current)
        const current = tRef.current
        const wrappedCurrent = wrap(current)
        const atBoundary = wrappedCurrent % 100 === 0
        const delta = 14 + Math.random() * 28
        const dir = clockwiseRef.current ? 1 : -1
        const proposed = current + dir * delta
        const currentEdgeIdx = Math.floor(wrappedCurrent / 100)
        const proposedEdgeIdx = Math.floor(wrap(proposed) / 100)
        const wouldCross = currentEdgeIdx !== proposedEdgeIdx

        if (wouldCross && !atBoundary) {
          // Walk right up to the corner this tick; crossing it happens
          // on the next tick, once we're sitting exactly on it.
          const boundary = dir > 0 ? (currentEdgeIdx + 1) * 100 : currentEdgeIdx * 100
          setT(wrap(boundary))
        } else if (atBoundary && edgesWalkedRef.current >= edgeBudgetRef.current) {
          // Leap to a different widget instead of continuing around
          // this one.
          const point = perimeterToPoint(currentRect, current)
          const pool = collectTargets()
          const next = pickNextTarget(targetRef.current, pool)
          const nextRect = getRect(next)
          targetRef.current = next
          edgesWalkedRef.current = 0
          edgeBudgetRef.current = 1 + Math.floor(Math.random() * 3)
          setT(nearestCornerT(nextRect, point))
        } else {
          if (atBoundary) edgesWalkedRef.current += 1
          setT(wrap(proposed))
        }

        // A cat occasionally changes its mind about direction...
        if (Math.random() < 0.22) setClockwise((c) => !c)
        // ...or just play-pounces in place.
        if (Math.random() < 0.12) triggerJump('small')
      }

      const next = pickNextState(state)
      if (state !== 'walk' && next === 'walk') triggerJump('small')
      setState(next)
    }, duration)

    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => () => window.clearTimeout(jumpTimerRef.current), [])

  function handlePet() {
    const id = Date.now() + Math.random()
    setHearts((h) => [...h, id])
    window.setTimeout(() => {
      setHearts((h) => h.filter((existing) => existing !== id))
    }, 900)
  }

  return (
    <div className="cat-companion-stage">
      <div className="cat-companion-anchor" style={{ top: `${position.y}px`, left: `${position.x}px` }}>
        <div
          className="cat-companion"
          data-state={state}
          style={{ transform: `rotate(${EDGE_ROTATION[position.edge]}deg)` }}
        >
          <div
            className={
              'cat-companion-hopper' +
              (isJumping === 'small' ? ' cat-companion-jump' : '') +
              (isJumping === 'big' ? ' cat-companion-jump-big' : '')
            }
          >
            <button
              type="button"
              className="cat-companion-hit"
              onClick={handlePet}
              aria-label="Pet the cat"
              style={{ transform: clockwise ? 'scaleX(1)' : 'scaleX(-1)' }}
            >
              <CatIcon />
              {state === 'sleep' && <span className="cat-companion-zzz">z z z</span>}
            </button>
            {hearts.map((id) => (
              <HeartIcon key={id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
