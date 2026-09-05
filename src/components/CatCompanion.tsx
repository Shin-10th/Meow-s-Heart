import { useEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * A single roaming cat companion, fixed to the viewport, that prowls
 * all the way around the screen's edges — not just the bottom — and
 * "jumps" around each corner as it turns from one edge to the next.
 * Loosely inspired by desktop "cat companion" pets
 * (https://sea-salt-crackers.itch.io/cat-companion) — this is an
 * original re-implementation for the web, not a copy of that game's
 * assets or code, adapted to what a browser can actually do: it
 * walks, jumps at corners, sits, and naps on its own, and can be
 * clicked/"pet".
 *
 * The cat is drawn as an inline SVG colored entirely with the site's
 * theme CSS variables (see src/themes.ts / ThemeContext), so it
 * recolors live whenever the visitor switches color themes.
 *
 * Only one instance is meant to be mounted (in Layout.tsx), so it
 * shows up once per page rather than per product.
 *
 * --- How the movement works ---
 * Position is tracked as a single number `t` in [0, 400) representing
 * distance traveled around the screen's perimeter (100 units per
 * edge: top, right, bottom, left, in that clockwise order). Walking
 * within an edge smoothly animates that edge's position percentage;
 * reaching a corner (t crossing a multiple of 100) switches which
 * edge the cat is anchored to and rotates it to lie flush against the
 * new edge, which we mark as a quick "jump" (a little hop animation)
 * rather than a smooth slide, since the position math is genuinely
 * discontinuous there (different CSS properties altogether).
 */

type Edge = 'top' | 'right' | 'bottom' | 'left'
type CatState = 'walk' | 'sit' | 'sleep'

const STATE_TIMING: Record<CatState, { minMs: number; maxMs: number }> = {
  walk: { minMs: 3500, maxMs: 7500 },
  sit: { minMs: 3000, maxMs: 6500 },
  sleep: { minMs: 6000, maxMs: 13000 },
}

const EDGE_ROTATION: Record<Edge, number> = { top: 180, right: -90, bottom: 0, left: 90 }
const EDGE_INSET_PX = 22

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

function wrap(n: number): number {
  return ((n % 400) + 400) % 400
}

function perimeterToPosition(t: number): { xPercent: number; yPercent: number; edge: Edge } {
  const p = wrap(t)
  if (p < 100) return { xPercent: p, yPercent: 0, edge: 'top' }
  if (p < 200) return { xPercent: 100, yPercent: p - 100, edge: 'right' }
  if (p < 300) return { xPercent: 100 - (p - 200), yPercent: 100, edge: 'bottom' }
  return { xPercent: 0, yPercent: 100 - (p - 300), edge: 'left' }
}

function anchorStyle(edge: Edge, xPercent: number, yPercent: number): CSSProperties {
  const inset = `${EDGE_INSET_PX}px`
  switch (edge) {
    case 'top':
      return { top: inset, left: `${xPercent}%` }
    case 'bottom':
      return { bottom: inset, left: `${xPercent}%` }
    case 'left':
      return { left: inset, top: `${yPercent}%` }
    case 'right':
    default:
      return { right: inset, top: `${yPercent}%` }
  }
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
  const [t, setT] = useState<number>(() => Math.random() * 400)
  const [clockwise, setClockwise] = useState(true)
  const [state, setState] = useState<CatState>('walk')
  const [isJumping, setIsJumping] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])

  const tRef = useRef(t)
  const clockwiseRef = useRef(clockwise)
  const jumpTimerRef = useRef<number | undefined>(undefined)

  const position = perimeterToPosition(t)
  const prevEdgeRef = useRef<Edge>(position.edge)

  useEffect(() => {
    tRef.current = t
  }, [t])
  useEffect(() => {
    clockwiseRef.current = clockwise
  }, [clockwise])

  function triggerJump() {
    setIsJumping(false)
    window.clearTimeout(jumpTimerRef.current)
    // Re-trigger the animation even if it's already mid-jump.
    requestAnimationFrame(() => {
      setIsJumping(true)
      jumpTimerRef.current = window.setTimeout(() => setIsJumping(false), 460)
    })
  }

  // Jump whenever the cat crosses onto a new edge.
  useEffect(() => {
    if (prevEdgeRef.current !== position.edge) {
      prevEdgeRef.current = position.edge
      triggerJump()
    }
  }, [position.edge])

  // Main behavior clock: advances the walk, or waits out a sit/sleep.
  useEffect(() => {
    const { minMs, maxMs } = STATE_TIMING[state]
    const duration = minMs + Math.random() * (maxMs - minMs)

    const timer = window.setTimeout(() => {
      if (state === 'walk') {
        const delta = 10 + Math.random() * 24
        const dir = clockwiseRef.current ? 1 : -1
        const current = tRef.current
        const proposed = current + dir * delta
        const currentEdgeIdx = Math.floor(wrap(current) / 100)
        const proposedEdgeIdx = Math.floor(wrap(proposed) / 100)

        if (currentEdgeIdx !== proposedEdgeIdx && wrap(current) % 100 !== 0) {
          // Walk right up to the corner this tick; the next tick will
          // cross into the new edge (and read as a jump).
          const boundary = dir > 0 ? (currentEdgeIdx + 1) * 100 : currentEdgeIdx * 100
          setT(wrap(boundary))
        } else {
          setT(wrap(proposed))
        }

        // A cat occasionally changes its mind about direction...
        if (Math.random() < 0.22) setClockwise((c) => !c)
        // ...or just play-pounces in place.
        if (Math.random() < 0.15) triggerJump()
      }

      const next = pickNextState(state)
      if (state !== 'walk' && next === 'walk') triggerJump()
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
      <div className="cat-companion-anchor" style={anchorStyle(position.edge, position.xPercent, position.yPercent)}>
        <div
          className="cat-companion"
          data-state={state}
          style={{ transform: `rotate(${EDGE_ROTATION[position.edge]}deg)` }}
        >
          <div className={`cat-companion-hopper${isJumping ? ' cat-companion-jump' : ''}`}>
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
