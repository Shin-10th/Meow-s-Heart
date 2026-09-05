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
      <svg className="custom-cursor-paw" viewBox="0 0 34 32" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="var(--color-brand-300)"
          stroke="#ffffff"
          strokeWidth="0.8"
          d="M6.5 2.3c-1.1-1.3-3.3-.9-3.3.9 0 1.7 1.9 3.1 3.3 4.3 1.4-1.2 3.3-2.6 3.3-4.3 0-1.8-2.2-2.2-3.3-.9z"
        />
        <g fill="var(--color-brand-400)" stroke="#ffffff" strokeWidth="1.1">
          <ellipse cx="23.5" cy="24" rx="7.4" ry="6.4" />
          <circle cx="12" cy="13" r="3.1" />
          <circle cx="17.3" cy="10.6" r="3.5" />
          <circle cx="22.7" cy="11.4" r="3.5" />
          <circle cx="27.5" cy="15" r="3.1" />
        </g>
      </svg>
      <span className="custom-cursor-zzz custom-cursor-zzz--1">z</span>
      <span className="custom-cursor-zzz custom-cursor-zzz--2">Z</span>
    </div>
  )
}
