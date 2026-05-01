'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { type Locale } from '@/i18n/routing'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LOCALES = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
] as const

type Variant = 'topbar' | 'nav'

interface LocaleSwitcherProps {
  variant?: Variant
}

export function LocaleSwitcher({ variant = 'topbar' }: LocaleSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'nav' ? (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: 3,
              background: 'var(--jl-bg-sunken)',
              border: '1px solid var(--jl-line-soft)',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {LOCALES.map((l) => (
              <span
                key={l.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: l.code === locale ? 'var(--jl-bg-raised)' : 'transparent',
                  color: l.code === locale ? 'var(--jl-text)' : 'var(--jl-text-faint)',
                  boxShadow: l.code === locale ? 'var(--jl-shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>{l.flag}</span>
                {l.code.toUpperCase()}
              </span>
            ))}
          </button>
        ) : (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 8px',
              borderRadius: 6,
              border: '1px solid var(--jl-line)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--jl-text-soft)',
              outline: 'none',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--jl-bg-raised)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{current.flag}</span>
            <span>{current.code.toUpperCase()}</span>
            <ChevronDown size={11} />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ minWidth: 140 }}>
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLocale(l.code as Locale)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: l.code === locale ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 16 }}>{l.flag}</span>
            <span>{l.label}</span>
            {l.code === locale && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--jl-accent)' }}>✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
