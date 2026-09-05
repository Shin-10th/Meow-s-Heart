import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import en, { type TranslationKey } from '../i18n/en'
import my from '../i18n/my'

export type Language = 'en' | 'my'

const STORAGE_KEY = 'meows-heart-lang'
const dictionaries: Record<Language, Record<string, string>> = { en, my }

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'my' || saved === 'en' ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = language
  }, [language])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
  }

  function toggleLanguage() {
    setLanguageState((prev) => (prev === 'en' ? 'my' : 'en'))
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>) {
    const dict = dictionaries[language]
    let text = dict[key] ?? dictionaries.en[key] ?? key
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, String(value))
      }
    }
    return text
  }

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
