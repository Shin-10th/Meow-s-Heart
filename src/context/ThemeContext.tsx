import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { themes, DEFAULT_THEME_ID, type ColorTheme } from '../themes'

const STORAGE_KEY = 'meows-heart-theme'

interface ThemeContextValue {
  themeId: string
  theme: ColorTheme
  themes: ColorTheme[]
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyTheme(theme: ColorTheme) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved && themes.some((t) => t.id === saved) ? saved : DEFAULT_THEME_ID
    } catch {
      return DEFAULT_THEME_ID
    }
  })

  const theme = useMemo(() => themes.find((t) => t.id === themeId) ?? themes[0], [themeId])

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [theme, themeId])

  function setThemeId(id: string) {
    setThemeIdState(id)
  }

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, theme, themes, setThemeId }),
    [themeId, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
