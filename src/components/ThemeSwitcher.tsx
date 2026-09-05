import { useEffect, useRef, useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

export default function ThemeSwitcher() {
  const { themeId, themes, setThemeId } = useTheme()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full border border-cocoa/10 text-cocoa/70 transition hover:border-brand-300 hover:text-brand-600"
        title="Choose a color theme"
        aria-label="Choose a color theme"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-cocoa/10 bg-white p-2 shadow-lg">
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-cocoa-light">
            {t('theme.label')}
          </p>
          {themes.map((th) => (
            <button
              key={th.id}
              onClick={() => {
                setThemeId(th.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm font-medium text-cocoa transition hover:bg-cream"
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: th.swatch }}
              />
              <span className="flex-1">{th.name}</span>
              {th.id === themeId && <Check className="h-4 w-4 text-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
