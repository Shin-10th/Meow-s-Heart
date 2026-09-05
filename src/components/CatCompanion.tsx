import { useEffect, useRef, useState } from 'react'

/**
 * A single roaming cat companion, fixed to the bottom of the viewport
 * (inspired by desktop "cat companion" pets — https://sea-salt-crackers.itch.io/cat-companion,
 * adapted to a website: it can't jump onto windows, but it prowls,
 * sits, and naps on its own, and can be clicked/"pet").
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

export default function CatCompanion() {
  const [state, setState] = useState<CatState>('walk')
  const [leftPercent, setLeftPercent] = useState(10)
  const [facingLeft, setFacingLeft] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])
  const timeoutRef = useRef<number | undefined>(undefined)
  const positionRef = useRef(leftPercent)
  const facingRef = useRef(facingLeft)

  useEffect(() => {
    positionRef.current = leftPercent
  }, [leftPercent])
  useEffect(() => {
    facingRef.current = facingLeft
  }, [facingLeft])

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
          <span className="cat-companion-body">🐈</span>
          {state === 'sleep' && <span className="cat-companion-zzz">z z z</span>}
        </button>
        {hearts.map((id) => (
          <span key={id} className="cat-companion-heart">
            💗
          </span>
        ))}
      </div>
    </div>
  )
}
