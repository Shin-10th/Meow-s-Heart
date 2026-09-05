// Color theme presets for the site's live color switcher.
// NOTE: these values are duplicated (for a flash-free first paint) in
// the inline script in index.html — if you change a value here, update
// it there too.

export interface ColorTheme {
  id: string
  name: string
  /** representative color shown as the swatch in the picker UI */
  swatch: string
  vars: Record<string, string>
}

export const themes: ColorTheme[] = [
  {
    id: 'classic',
    name: 'Classic Pink',
    swatch: '#f9418a',
    vars: {
      '--color-brand-50': '#fff0f6',
      '--color-brand-100': '#ffe0ee',
      '--color-brand-200': '#ffc2de',
      '--color-brand-300': '#ff96c4',
      '--color-brand-400': '#ff5fa3',
      '--color-brand-500': '#f9418a',
      '--color-brand-600': '#e02270',
      '--color-brand-700': '#b8175a',
      '--color-brand-800': '#93154a',
      '--color-brand-900': '#7a153f',
      '--color-cream': '#fff8fa',
      '--color-cream-dark': '#ffeaf2',
      '--color-cocoa': '#5b3a29',
      '--color-cocoa-light': '#8a6a55',
      '--color-gold': '#f9418a',
      '--color-gold-light': '#ffc2de',
    },
  },
  {
    id: 'pixelmeow',
    name: 'Premium Rose',
    swatch: '#c76d68',
    vars: {
      '--color-brand-50': '#fdf4f3',
      '--color-brand-100': '#fbe7e5',
      '--color-brand-200': '#f4cdc9',
      '--color-brand-300': '#e9aaa5',
      '--color-brand-400': '#db8781',
      '--color-brand-500': '#c76d68',
      '--color-brand-600': '#ad5450',
      '--color-brand-700': '#8c4441',
      '--color-brand-800': '#703937',
      '--color-brand-900': '#5c302f',
      '--color-cream': '#fdf9f6',
      '--color-cream-dark': '#f6ece5',
      '--color-cocoa': '#453a36',
      '--color-cocoa-light': '#8c7c74',
      '--color-gold': '#c6a15b',
      '--color-gold-light': '#e8dcc0',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Bloom',
    swatch: '#8f5fc2',
    vars: {
      '--color-brand-50': '#f6f2fb',
      '--color-brand-100': '#ede4f7',
      '--color-brand-200': '#d9c5ef',
      '--color-brand-300': '#c1a1e3',
      '--color-brand-400': '#a97ed4',
      '--color-brand-500': '#8f5fc2',
      '--color-brand-600': '#7548a3',
      '--color-brand-700': '#5e3a84',
      '--color-brand-800': '#4a2f68',
      '--color-brand-900': '#3c2653',
      '--color-cream': '#faf8fd',
      '--color-cream-dark': '#f1ecf9',
      '--color-cocoa': '#40353f',
      '--color-cocoa-light': '#8a7a87',
      '--color-gold': '#b9925e',
      '--color-gold-light': '#e6d6bd',
    },
  },
  {
    id: 'sage',
    name: 'Sage Garden',
    swatch: '#628c53',
    vars: {
      '--color-brand-50': '#f3f7f1',
      '--color-brand-100': '#e3ece0',
      '--color-brand-200': '#c6d9bf',
      '--color-brand-300': '#a3c197',
      '--color-brand-400': '#7fa76e',
      '--color-brand-500': '#628c53',
      '--color-brand-600': '#4e7142',
      '--color-brand-700': '#405b37',
      '--color-brand-800': '#34492d',
      '--color-brand-900': '#2b3c25',
      '--color-cream': '#f9faf6',
      '--color-cream-dark': '#eef2e8',
      '--color-cocoa': '#3c3a33',
      '--color-cocoa-light': '#857f6f',
      '--color-gold': '#c2a15c',
      '--color-gold-light': '#ecdfbf',
    },
  },
]

export const DEFAULT_THEME_ID = 'classic'
