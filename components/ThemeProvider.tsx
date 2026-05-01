'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  accentHue: number
  setAccentHue: (hue: number) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultAccentHue?: number
}

export function ThemeProvider({ children, defaultTheme = 'system', defaultAccentHue = 38 }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [accentHue, setAccentHueState] = useState(defaultAccentHue)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--jl-hue', String(accentHue))
  }, [accentHue])

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme)
    document.cookie = `jl-theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`
  }

  function setAccentHue(hue: number) {
    setAccentHueState(hue)
    document.cookie = `jl-accent-hue=${hue}; path=/; max-age=31536000; SameSite=Lax`
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentHue, setAccentHue }}>
      {children}
    </ThemeContext.Provider>
  )
}
