'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Sun, Moon, Monitor } from 'lucide-react'
import { updateAppearance } from '@/features/settings/preferences'
import type { Theme } from '@/lib/settings/theme-cookie'

const DARK_CLASSES = ['jl-dark', 'dark'] as const

function applyThemeClass(theme: Theme): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add(...DARK_CLASSES)
    return
  }
  if (theme === 'light') {
    html.classList.remove(...DARK_CLASSES)
    return
  }
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark) html.classList.add(...DARK_CLASSES)
  else html.classList.remove(...DARK_CLASSES)
}

interface Props {
  initialTheme: Theme
  initialHue: number
}

export function ThemeRadio({ initialTheme, initialHue }: Props) {
  const t = useTranslations('settings.appearance')
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('themeLight'), icon: Sun },
    { value: 'dark', label: t('themeDark'), icon: Moon },
    { value: 'system', label: t('themeSystem'), icon: Monitor },
  ]

  function onPick(next: Theme) {
    if (next === theme) return
    const previous = theme
    setError(null)
    setTheme(next)
    applyThemeClass(next)
    startTransition(async () => {
      const result = await updateAppearance({ theme: next, accent_hue: initialHue })
      if (result.error) {
        setTheme(previous)
        applyThemeClass(previous)
        setError(result.error.message)
      }
    })
  }

  return (
    <div role="radiogroup" aria-label={t('themeTitle')} style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
      {options.map(({ value, label, icon: Icon }) => {
        const active = value === theme
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={isPending && active}
            onClick={() => onPick(value)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              padding: '14px 14px 16px',
              borderRadius: 12,
              background: active ? 'var(--jl-accent-soft)' : 'var(--jl-bg-raised)',
              border: active
                ? '1px solid color-mix(in oklch, var(--jl-accent) 45%, transparent)'
                : '1px solid var(--jl-line-soft)',
              color: active ? 'var(--jl-accent-ink)' : 'var(--jl-text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <Icon size={18} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
          </button>
        )
      })}
      {error && (
        <p role="alert" style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--jl-danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
