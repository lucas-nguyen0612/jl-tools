'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { updateAppearance } from '@/features/settings/preferences'
import type { Theme } from '@/lib/settings/theme-cookie'

const DEBOUNCE_MS = 300

interface Props {
  initialHue: number
  initialTheme: Theme
}

function applyHue(hue: number): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--jl-hue', String(hue))
}

export function HueSlider({ initialHue, initialTheme }: Props) {
  const t = useTranslations('settings.appearance')
  const [hue, setHue] = useState<number>(initialHue)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<number>(initialHue)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function onChange(next: number) {
    setHue(next)
    applyHue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const previous = lastSavedRef.current
      startTransition(async () => {
        const result = await updateAppearance({ theme: initialTheme, accent_hue: next })
        if (!isMountedRef.current) return
        if (result.error) {
          setError(result.error.message)
          setHue(previous)
          applyHue(previous)
        } else {
          lastSavedRef.current = next
          setError(null)
        }
      })
    }, DEBOUNCE_MS)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--jl-accent-strong)',
            border: '1px solid var(--jl-line-soft)',
            flexShrink: 0,
          }}
        />
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={hue}
          aria-label={t('hueTitle')}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={hue}
          onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            accentColor: 'var(--jl-accent-strong)',
          }}
        />
        <span
          className="jl-tnum"
          style={{
            minWidth: 44,
            textAlign: 'right',
            fontSize: 13,
            color: 'var(--jl-text-soft)',
          }}
        >
          {hue}°
        </span>
      </div>
      {error && (
        <p role="alert" style={{ fontSize: 12, color: 'var(--jl-danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
