/**
 * A small decorative cat that paces back and forth along the bottom
 * edge of whatever container it's placed in (the container needs
 * `relative` + `overflow-hidden`, which ProductCard's image wrapper
 * already has). Purely visual — hidden from assistive tech and never
 * blocks clicks.
 *
 * `seed` deterministically randomizes the animation timing so that
 * many cats on screen at once (e.g. one per product card) don't all
 * walk in lockstep.
 */

function hashSeed(seed: string | number): number {
  const str = String(seed)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export default function WalkingCat({ seed }: { seed: string | number }) {
  const h = hashSeed(seed)

  // Slow left-right pacing: 6s - 9.6s per full lap.
  const paceDuration = 6 + (h % 37) / 10
  // Negative delay so different cards start mid-stride instead of all
  // beginning at the left edge at once.
  const paceDelay = -((h % 71) / 10)

  // Fast independent bob/wobble: 0.5s - 0.9s.
  const bobDuration = 0.5 + (h % 5) / 10
  const bobDelay = -((h % 13) / 10)

  return (
    <div className="walking-cat-track" aria-hidden="true">
      <div
        className="walking-cat-walker"
        style={{
          animationDuration: `${paceDuration}s`,
          animationDelay: `${paceDelay}s`,
        }}
      >
        <span
          className="walking-cat-bob"
          style={{
            animationDuration: `${bobDuration}s`,
            animationDelay: `${bobDelay}s`,
          }}
        >
          🐈
        </span>
      </div>
    </div>
  )
}
