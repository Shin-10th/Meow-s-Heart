import { useEffect, useRef, useState } from 'react'

/**
 * A custom paw+heart cursor that follows the real mouse position.
 *
 * This is a JS-tracked DOM element rather than a native
 * `cursor: url(...)` image, on purpose: a native cursor image is
 * static and can't be told "you've been idle for a second, start
 * playing a looping z-z-z animation, then stop the instant the mouse
 * moves" — that needs real DOM/CSS animation, driven by JS idle
 * detection. The native cursor is hidden everywhere except real
 * text-entry fields (see src/index.css), where this component also
 * hides itself so the native text (I-beam) cursor shows through
 * cleanly instead of overlapping with the paw.
 *
 * Colors are theme CSS variables, so it recolors live with the color
 * theme switcher — no JS regeneration needed, unlike a native cursor
 * image would require.
 */

const IDLE_DELAY_MS = 900

function isTextEntryElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  if (tag === 'TEXTAREA') return true
  if (el instanceof HTMLElement && el.isContentEditable) return true
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type
    const nonTextTypes = ['button', 'submit', 'checkbox', 'radio', 'range', 'color', 'file', 'image', 'reset']
    return !nonTextTypes.includes(type)
  }
  return false
}

export default function CustomCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [idle, setIdle] = useState(false)
  const [hiddenForText, setHiddenForText] = useState(false)
  const idleTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const el = wrapperRef.current
      if (el) {
        el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      setVisible(true)
      setIdle(false)
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(() => setIdle(true), IDLE_DELAY_MS)

      const target = document.elementFromPoint(e.clientX, e.clientY)
      setHiddenForText(isTextEntryElement(target))
    }

    function handleOut(e: MouseEvent) {
      // Only treat this as "left the window" when there's no new
      // element to move onto (relatedTarget is null at the viewport
      // boundary).
      if (!e.relatedTarget) setVisible(false)
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseout', handleOut)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseout', handleOut)
      window.clearTimeout(idleTimerRef.current)
    }
  }, [])

  const show = visible && !hiddenForText

  return (
    <div ref={wrapperRef} className={`custom-cursor${show ? ' is-visible' : ''}${idle ? ' is-idle' : ''}`} aria-hidden="true">
      <svg className="custom-cursor-paw" viewBox="0 0 36 33" xmlns="http://www.w3.org/2000/svg">
        {/* Heart accent, upper-left — the outline is the theme's dark
            "cocoa" shade (not white), so it actually reads against a
            light page background instead of disappearing into it. */}
        <path
          fill="var(--color-brand-300)"
          stroke="var(--color-cocoa)"
          strokeWidth="1.3"
          strokeLinejoin="round"
          d="M6.8 2.4c-1.3-1.5-3.8-1-3.8 1 0 2 2.2 3.6 3.8 5 1.6-1.4 3.8-3 3.8-5 0-2-2.5-2.5-3.8-1z"
        />
        <circle cx="5.3" cy="4.3" r="0.55" fill="#ffffff" opacity="0.85" />

        {/* Paw: heel pad + four toe pads, each outlined so it reads as
            distinct pads (like a real paw print) rather than a fused
            blob. */}
        <g fill="var(--color-brand-300)" stroke="var(--color-cocoa)" strokeWidth="1.5" strokeLinejoin="round">
          <ellipse cx="19" cy="23" rx="8.4" ry="7.8" />
          <circle cx="8.5" cy="18" r="3.5" />
          <circle cx="14.6" cy="11.6" r="4.2" />
          <circle cx="23.4" cy="11.6" r="4.2" />
          <circle cx="29.5" cy="18" r="3.5" />
        </g>
        {/* Small glossy highlight on the heel pad. */}
        <ellipse cx="16" cy="20" rx="2.3" ry="1.6" fill="#ffffff" opacity="0.45" />
      </svg>
      <span className="custom-cursor-zzz custom-cursor-zzz--1">z</span>
      <span className="custom-cursor-zzz custom-cursor-zzz--2">Z</span>
    </div>
  )
}
