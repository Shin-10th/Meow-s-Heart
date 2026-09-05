import type { ColorTheme } from '../themes'

/**
 * Builds a glossy paw-print cursor (heel pad + four angled toe pads,
 * radial-gradient shaded) using the active color theme's own brand
 * shades, so the cursor always matches whichever palette the visitor
 * picked in the theme switcher. Returns the two full `cursor` property
 * values (default + pointer), meant to be stored as CSS custom
 * properties (see applyCursorTheme) and consumed via `cursor: var(...)`
 * in src/index.css.
 *
 * NOTE: this same shape/gradient logic is duplicated in plain JS in
 * index.html's no-flash inline script, so the cursor doesn't flash the
 * wrong color before React mounts. Keep the two in sync if you change
 * the paw's geometry.
 */
function buildPawSvg(light: string, mid: string, dark: string): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
    '<defs><radialGradient id="mh-paw" cx="35%" cy="30%" r="75%">' +
    `<stop offset="0%" stop-color="${light}"/>` +
    `<stop offset="60%" stop-color="${mid}"/>` +
    `<stop offset="100%" stop-color="${dark}"/>` +
    '</radialGradient></defs>' +
    '<g fill="url(#mh-paw)" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round">' +
    '<ellipse cx="16" cy="22.5" rx="7.6" ry="6.3"/>' +
    '<ellipse cx="6.5" cy="17" rx="2.7" ry="3.7" transform="rotate(-28 6.5 17)"/>' +
    '<ellipse cx="12.3" cy="8.6" rx="3.1" ry="4.3" transform="rotate(-10 12.3 8.6)"/>' +
    '<ellipse cx="19.7" cy="8.6" rx="3.1" ry="4.3" transform="rotate(10 19.7 8.6)"/>' +
    '<ellipse cx="25.5" cy="17" rx="2.7" ry="3.7" transform="rotate(28 25.5 17)"/>' +
    '</g></svg>'
  )
}

export function applyCursorTheme(theme: ColorTheme, root: HTMLElement = document.documentElement) {
  const light = theme.vars['--color-brand-200'] ?? '#ffd6e8'
  const mid = theme.vars['--color-brand-500'] ?? '#f9418a'
  const dark = theme.vars['--color-brand-700'] ?? '#b8175a'

  const svg = buildPawSvg(light, mid, dark)
  const dataUri = 'data:image/svg+xml,' + encodeURIComponent(svg)

  root.style.setProperty('--cursor-default', `url("${dataUri}") 16 20, auto`)
  root.style.setProperty('--cursor-pointer', `url("${dataUri}") 16 20, pointer`)
}
