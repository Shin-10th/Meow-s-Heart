import type { ColorTheme } from '../themes'

/**
 * Builds a small, soft paw-print cursor (a rounded heel pad plus four
 * round toe pads) using the active color theme's own brand shades, so
 * the cursor always matches whichever palette the visitor picked in
 * the theme switcher. Colors are pulled from two steps lighter than
 * the theme's main brand color (100/300/500 rather than 200/500/700)
 * so it reads as soft/pastel rather than a bright, saturated pop.
 *
 * Returns the two full `cursor` property values (default + pointer),
 * meant to be stored as CSS custom properties (see applyCursorTheme)
 * and consumed via `cursor: var(...)` in src/index.css.
 *
 * NOTE: this same shape/gradient logic is duplicated in plain JS in
 * index.html's no-flash inline script, so the cursor doesn't flash
 * the wrong color before React mounts. Keep the two in sync if you
 * change the paw's geometry or rendered size.
 */

// Natural pixel size the cursor renders at (small, so it doesn't
// dominate the pointer). The SVG's own viewBox stays 32x32 for easy
// coordinates; this just scales the final bitmap down.
const CURSOR_SIZE = 22
const VIEWBOX_SIZE = 32
const HOTSPOT_X = Math.round((16 / VIEWBOX_SIZE) * CURSOR_SIZE)
const HOTSPOT_Y = Math.round((21 / VIEWBOX_SIZE) * CURSOR_SIZE)

function buildPawSvg(light: string, mid: string, dark: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CURSOR_SIZE}" height="${CURSOR_SIZE}" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}">` +
    '<defs><radialGradient id="mh-paw" cx="35%" cy="30%" r="75%">' +
    `<stop offset="0%" stop-color="${light}"/>` +
    `<stop offset="65%" stop-color="${mid}"/>` +
    `<stop offset="100%" stop-color="${dark}"/>` +
    '</radialGradient></defs>' +
    '<g fill="url(#mh-paw)" stroke="#ffffff" stroke-width="1.1">' +
    '<ellipse cx="16" cy="21" rx="7" ry="6"/>' +
    '<circle cx="8" cy="13" r="3.4"/>' +
    '<circle cx="13.3" cy="9.2" r="3.7"/>' +
    '<circle cx="18.7" cy="9.2" r="3.7"/>' +
    '<circle cx="24" cy="13" r="3.4"/>' +
    '</g></svg>'
  )
}

export function applyCursorTheme(theme: ColorTheme, root: HTMLElement = document.documentElement) {
  const light = theme.vars['--color-brand-100'] ?? '#ffe0ee'
  const mid = theme.vars['--color-brand-300'] ?? '#ff96c4'
  const dark = theme.vars['--color-brand-500'] ?? '#f9418a'

  const svg = buildPawSvg(light, mid, dark)
  const dataUri = 'data:image/svg+xml,' + encodeURIComponent(svg)

  root.style.setProperty('--cursor-default', `url("${dataUri}") ${HOTSPOT_X} ${HOTSPOT_Y}, auto`)
  root.style.setProperty('--cursor-pointer', `url("${dataUri}") ${HOTSPOT_X} ${HOTSPOT_Y}, pointer`)
}
