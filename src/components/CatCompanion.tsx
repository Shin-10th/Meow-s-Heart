import { useEffect, useRef, useState } from 'react'

/**
 * A single roaming cat companion that explores the actual page layout
 * — pacing along the top of cards, buttons, and the footer (like a
 * cat perched on top of a box or a low wall), hopping between them
 * across the gaps, sitting down for a rest, or wandering the real
 * floor at the bottom of the screen — rather than following one
 * fixed rectangular path around the screen.
 *
 * Loosely inspired by desktop "cat companion" pets
 * (https://sea-salt-crackers.itch.io/cat-companion) — this is an
 * original re-implementation for the web, not a copy of that game's
 * assets or code (that game has no published license and is a
 * Windows .exe, which couldn't run on a web page anyway).
 *
 * The cat is drawn as an inline SVG colored entirely with the site's
 * theme CSS variables (see src/themes.ts / ThemeContext), so it
 * recolors live whenever the visitor switches color themes.
 *
 * Only one instance is meant to be mounted (in Layout.tsx), so it
 * shows up once per page rather than per product.
 *
 * --- "AI": sense, then decide, then act ---
 * Rather than a single timer picking a random next move, behavior is
 * split into three passes each tick, closer to how a simple game-AI
 * loop works:
 *
 *  1. SENSE — read the environment fresh each tick: where real
 *     widgets currently are (`collectTargets`, the "widget detector"),
 *     how far away the nearest usable widget actually is in open
 *     space (`pickNextTarget`'s distance check — the "gap detector",
 *     so it won't try to leap across a gap wider than a cat
 *     reasonably could), and where the visitor's mouse cursor is
 *     right now.
 *  2. DECIDE — `decideNextState` turns those readings into the next
 *     behavior, and a separate always-on check reacts to the cursor
 *     coming close by (see the "notice" effect below) regardless of
 *     the slower walk/rest cycle.
 *  3. ACT — apply the decision: pace along the current ledge, bounce
 *     back the other way at its end, leap to a different widget, or
 *     settle in to rest.
 *
 * --- How the movement itself works (the "ledge" model) ---
 * A real cat doesn't cling upside-down to the underside of a shelf or
 * flatten itself sideways against a wall — it stands feet-down on a
 * surface. So instead of walking all four sides of a widget's
 * bounding box (which read as "stuck to the wall" once the cat ended
 * up on a vertical or upside-down edge), each target now has exactly
 * one walkable "ledge": a horizontal line the cat always stands
 * upright on, feet planted on it.
 *
 * For most widgets (cards, buttons, the footer) that ledge is the
 * TOP of the widget — like a cat perched on top of a box, with open
 * page space above it. For anything flush against the very top of
 * the screen (a sticky header) — or the screen itself — there's no
 * room above to perch, so the ledge is the widget's BOTTOM edge
 * instead, standing on the open space below it (`ledgeFor` below;
 * this same rule happens to fall out for the viewport target too,
 * landing exactly on the real floor at the bottom of the window).
 *
 * The cat paces back and forth along its current ledge, turning
 * around (a little hop) when it reaches either end. After a couple
 * of such turns it leaps to a different widget instead of pacing the
 * same one forever — biased toward whichever nearby ledge is
 * actually reachable (see the gap detector above) and landing on
 * whichever end of it is closest to where it jumped from, so the hop
 * reads as continuous rather than teleporting. Rects are read live
 * via getBoundingClientRect(), so the cat stays glued to its target
 * as the page scrolls or resizes.
 */

type CatState = 'walk' | 'sit' | 'sleep'
type Rect = { top: number; left: number; width: number; height: number }
type Target = { key: string; el: HTMLElement | null }
type JumpSize = 'small' | 'big'
type Point = { x: number; y: number }
/** The one horizontal line a cat can stand on for a given target —
 * see the "ledge model" note above. */
type Ledge = { y: number; xStart: number; xEnd: number }

const STATE_TIMING: Record<CatState, { minMs: number; maxMs: number }> = {
  walk: { minMs: 2600, maxMs: 5500 },
  sit: { minMs: 2500, maxMs: 5500 },
  sleep: { minMs: 5000, maxMs: 11000 },
}

// The "widget detector": real interface elements the cat is willing
// to explore. The viewport itself is always added as a fallback
// target too (see collectTargets).
const WIDGET_SELECTOR = '.card, header, footer, .btn-primary, .btn-secondary'
const MIN_WIDGET_WIDTH = 70
const MIN_WIDGET_HEIGHT = 44
// The "gap detector" cutoff — widgets farther than this (in open
// pixels, not just center-to-center) are treated as too far to leap
// to right now.
const MAX_JUMP_PX = 420
// A widget pinned within this many pixels of the top of the screen
// (a sticky header, say) has no open space above it to perch on, so
// its ledge flips to the bottom edge instead — see ledgeFor().
const NEAR_VIEWPORT_TOP_PX = 40
// The "cursor detector" — how close the mouse has to get before the
// cat notices it, and how often it's allowed to react.
const NOTICE_RADIUS_PX = 90
const NOTICE_COOLDOWN_MS = 4000

/** Every ledge a target can offer is a real standing surface by
 * construction now (see the "ledge model" note above), so resting is
 * always allowed wherever the cat currently is. */
function decideNextState(current: CatState): CatState {
  const options: { state: CatState; weight: number }[] = [
    { state: 'walk' as const, weight: 5 },
    { state: 'sit' as const, weight: 3 },
    { state: 'sleep' as const, weight: 2 },
  ].filter((o) => o.state !== current)

  const total = options.reduce((sum, o) => sum + o.weight, 0)
  let r = Math.random() * total
  for (const o of options) {
    if (r < o.weight) return o.state
    r -= o.weight
  }
  return options[0].state
}

function viewportRect(): Rect {
  return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
}

function getRect(target: Target): Rect {
  if (!target.el || !document.body.contains(target.el)) return viewportRect()
  const r = target.el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/** The single walkable ledge for a target — see the "ledge model"
 * note at the top of the file. This same rule naturally lands the
 * viewport target on the real floor (its rect.top is always 0, which
 * is "near the top", so it resolves to rect.top + rect.height = the
 * bottom of the screen) without needing a separate case for it. */
function ledgeFor(target: Target): Ledge {
  const rect = getRect(target)
  const nearViewportTop = rect.top < NEAR_VIEWPORT_TOP_PX
  const y = nearViewportTop ? rect.top + rect.height : rect.top
  return { y, xStart: rect.left, xEnd: rect.left + rect.width }
}

/** Whichever end of a ledge is closer to a given x, so a leap between
 * widgets lands feet-first at the nearest point rather than jumping
 * to a random spot on the new one. */
function nearestLedgeX(ledge: Ledge, fromX: number): number {
  return Math.abs(fromX - ledge.xStart) <= Math.abs(fromX - ledge.xEnd) ? ledge.xStart : ledge.xEnd
}

/** Shortest distance from a point to the outside of a rect (0 if the
 * point is inside/on it) — the actual open-space gap, not just
 * center-to-center distance. */
function distanceToRect(point: Point, rect: Rect): number {
  const dx = Math.max(rect.left - point.x, 0, point.x - (rect.left + rect.width))
  const dy = Math.max(rect.top - point.y, 0, point.y - (rect.top + rect.height))
  return Math.sqrt(dx * dx + dy * dy)
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

/** The "gap detector": picks the next widget to leap to, biased
 * toward whichever nearby one is actually within jumping distance of
 * where the cat is standing right now — falling back to the open
 * window edge rather than teleporting across a gap that's too wide. */
function pickNextTarget(current: Target, pool: Target[], fromPoint: Point): Target {
  const candidates = pool.filter((c) => c.key !== current.key)
  if (candidates.length === 0) return current

  const reachable = candidates
    .filter((c) => c.key !== 'viewport')
    .map((c) => ({ target: c, distance: distanceToRect(fromPoint, getRect(c)) }))
    .filter((c) => c.distance <= MAX_JUMP_PX)

  if (reachable.length > 0) {
    reachable.sort((a, b) => a.distance - b.distance)
    const poolSize = Math.max(1, Math.ceil(reachable.length * 0.5))
    return reachable[Math.floor(Math.random() * poolSize)].target
  }

  const viewportTarget = candidates.find((c) => c.key === 'viewport')
  return viewportTarget ?? candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Pixel-art sitting cat, drawn from a small ASCII grid instead of
 * hand-placed shapes — matches the blocky, low-res "screen pet"
 * look the user asked for (chunky pixels, hard edges, dark outline)
 * instead of the previous smooth chibi-vector style. Each character
 * is one square "pixel"; editing the look later just means editing
 * these rows, no coordinate math required.
 *
 * Colors stay on the site's theme CSS variables (not literal gray)
 * so the cat keeps recoloring with the color-theme switcher, same
 * as before.
 */
const CAT_PIXEL_ROWS = [
  '....O...O....',
  '...OFO.OFO...',
  '..OFOOOFO....',
  '..OFFFFFFFO..',
  '..OFFEFEFFO.O',
  '..OFFFNFFFO.O',
  '..OFFFFFFFO.O',
  '...OFFFFFO..O',
  '..OOFFFFFOO.O',
  '.OFFFFFFFFFO.',
  'OFFWWWWWWWFO.',
  '..OO.....OO..',
  '.OFO.....OFO.',
]
const CAT_PIXEL_COLORS: Record<string, string> = {
  O: 'var(--color-cocoa)',
  F: 'var(--color-brand-400)',
  E: 'var(--color-cocoa)',
  N: 'var(--color-gold)',
  W: 'var(--color-cream)',
}
const CAT_PIXEL_SIZE = 4

function CatIcon() {
  const width = CAT_PIXEL_ROWS[0].length * CAT_PIXEL_SIZE
  const height = CAT_PIXEL_ROWS.length * CAT_PIXEL_SIZE
  return (
    <svg
      className="cat-companion-body"
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      {CAT_PIXEL_ROWS.map((row, y) =>
        row.split('').map((ch, x) => {
          if (ch === '.') return null
          return (
            <rect
              key={`${x}-${y}`}
              x={x * CAT_PIXEL_SIZE}
              y={y * CAT_PIXEL_SIZE}
              width={CAT_PIXEL_SIZE}
              height={CAT_PIXEL_SIZE}
              fill={CAT_PIXEL_COLORS[ch]}
            />
          )
        })
      )}
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
  const [x, setX] = useState<number>(0)
  const [movingRight, setMovingRight] = useState(true)
  const [state, setState] = useState<CatState>('walk')
  const [isJumping, setIsJumping] = useState<JumpSize | null>(null)
  const [isAlert, setIsAlert] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])

  const targetRef = useRef<Target>({ key: 'viewport', el: null })
  const xRef = useRef(x)
  const movingRightRef = useRef(movingRight)
  const traversalsRef = useRef(0)
  const traversalBudgetRef = useRef(1 + Math.floor(Math.random() * 3))
  const jumpTimerRef = useRef<number | undefined>(undefined)
  const alertTimerRef = useRef<number | undefined>(undefined)
  const groomingRef = useRef(false)
  const mouseRef = useRef<Point | null>(null)
  const lastNoticeAtRef = useRef(0)

  useEffect(() => {
    xRef.current = x
  }, [x])
  useEffect(() => {
    movingRightRef.current = movingRight
  }, [movingRight])

  // Pick an initial target once the page's real content has rendered.
  useEffect(() => {
    const pool = collectTargets()
    const initial = pool.length > 1 ? pool[1 + Math.floor(Math.random() * (pool.length - 1))] : pool[0]
    targetRef.current = initial
    const ledge = ledgeFor(initial)
    setX(ledge.xStart + Math.random() * Math.max(0, ledge.xEnd - ledge.xStart))
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

  // The "cursor detector": track the mouse continuously (cheap — just
  // storing coordinates), independent of the slower behavior clock.
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function triggerJump(size: JumpSize) {
    setIsJumping(null)
    window.clearTimeout(jumpTimerRef.current)
    requestAnimationFrame(() => {
      setIsJumping(size)
      jumpTimerRef.current = window.setTimeout(() => setIsJumping(null), size === 'big' ? 620 : 460)
    })
  }

  function triggerAlert() {
    setIsAlert(false)
    window.clearTimeout(alertTimerRef.current)
    requestAnimationFrame(() => {
      setIsAlert(true)
      alertTimerRef.current = window.setTimeout(() => setIsAlert(false), 420)
    })
  }

  const currentLedge = ledgeFor(targetRef.current)
  const position = {
    x: Math.min(currentLedge.xEnd, Math.max(currentLedge.xStart, x)),
    y: currentLedge.y,
  }

  // The "notice" reaction: checked on its own fast interval (not the
  // slower walk/rest clock below) so the cat responds to the cursor
  // in something like real time, the way a real animal would react
  // to nearby movement rather than only "thinking" every few seconds.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const mouse = mouseRef.current
      if (!mouse) return
      const now = Date.now()
      if (now - lastNoticeAtRef.current < NOTICE_COOLDOWN_MS) return

      const ledge = ledgeFor(targetRef.current)
      const currentX = Math.min(ledge.xEnd, Math.max(ledge.xStart, xRef.current))
      const dist = Math.hypot(currentX - mouse.x, ledge.y - mouse.y)
      if (dist > NOTICE_RADIUS_PX) return

      lastNoticeAtRef.current = now
      triggerAlert()
      // A resting cat startles awake and gets moving when something
      // gets this close; a walking cat isn't interrupted.
      if (state !== 'walk') setState('walk')
    }, 350)

    return () => window.clearInterval(interval)
  }, [state])

  // Main behavior clock: senses the situation, decides the next move,
  // and acts on it — pacing along the current ledge, turning around
  // at its ends, leaping to another widget, or waiting out a
  // sit/sleep.
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

        const ledge = ledgeFor(targetRef.current)
        const current = xRef.current
        const delta = 14 + Math.random() * 28
        const dir = movingRightRef.current ? 1 : -1
        const proposed = current + dir * delta
        const hittingEnd = dir > 0 ? proposed >= ledge.xEnd : proposed <= ledge.xStart

        let finalX = proposed

        if (hittingEnd) {
          const boundaryX = dir > 0 ? ledge.xEnd : ledge.xStart

          if (traversalsRef.current >= traversalBudgetRef.current) {
            // Leap to a different widget instead of pacing this one
            // again (the "gap detector" picks a reachable one),
            // landing feet-first on whichever end of its ledge is
            // nearest to where we jumped from.
            const point = { x: boundaryX, y: ledge.y }
            const pool = collectTargets()
            const next = pickNextTarget(targetRef.current, pool, point)
            const nextLedge = ledgeFor(next)
            targetRef.current = next
            traversalsRef.current = 0
            traversalBudgetRef.current = 1 + Math.floor(Math.random() * 3)
            finalX = nearestLedgeX(nextLedge, point.x)
            triggerJump('big')
          } else {
            // Reached the end of this ledge but not ready to leap
            // yet — turn around and pace back the other way, like a
            // cat walking a windowsill.
            finalX = boundaryX
            traversalsRef.current += 1
            setMovingRight((r) => !r)
            triggerJump('small')
          }
        }

        setX(finalX)

        // A cat occasionally changes its mind about direction...
        if (Math.random() < 0.22) setMovingRight((r) => !r)
        // ...or just play-pounces in place.
        if (Math.random() < 0.12) triggerJump('small')
      }

      const next = decideNextState(state)
      if (next === 'sit') groomingRef.current = Math.random() < 0.35
      if (state !== 'walk' && next === 'walk') triggerJump('small')
      setState(next)
    }, duration)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  useEffect(
    () => () => {
      window.clearTimeout(jumpTimerRef.current)
      window.clearTimeout(alertTimerRef.current)
    },
    []
  )

  function handlePet() {
    const id = Date.now() + Math.random()
    setHearts((h) => [...h, id])
    window.setTimeout(() => {
      setHearts((h) => h.filter((existing) => existing !== id))
    }, 900)
  }

  const grooming = state === 'sit' && groomingRef.current

  return (
    <div className="cat-companion-stage">
      <div className="cat-companion-anchor" style={{ top: `${position.y}px`, left: `${position.x}px` }}>
        <div className="cat-companion" data-state={state} data-grooming={grooming ? 'true' : undefined}>
          <div
            className={
              'cat-companion-hopper' +
              (isJumping === 'small' ? ' cat-companion-jump' : '') +
              (isJumping === 'big' ? ' cat-companion-jump-big' : '') +
              (isAlert ? ' cat-companion-alert' : '')
            }
          >
            <button
              type="button"
              className="cat-companion-hit"
              onClick={handlePet}
              aria-label="Pet the cat"
              style={{ transform: movingRight ? 'scaleX(1)' : 'scaleX(-1)' }}
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
