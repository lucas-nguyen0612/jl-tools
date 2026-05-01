'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { LayoutDashboard, Timer, Flame, BookOpen, User, Settings } from 'lucide-react'

type BottomNavLabelKey =
  | 'dashboard'
  | 'pomodoro'
  | 'habits'
  | 'flashcards'
  | 'character'
  | 'settings'

export const NAV_ITEMS: {
  href: string
  icon: typeof LayoutDashboard
  labelKey: BottomNavLabelKey
}[] = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/pomodoro', icon: Timer, labelKey: 'pomodoro' },
  { href: '/habits', icon: Flame, labelKey: 'habits' },
  { href: '/flashcards', icon: BookOpen, labelKey: 'flashcards' },
  { href: '/character', icon: User, labelKey: 'character' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('nav.bottomNav')

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 grid"
      style={{
        gridTemplateColumns: 'repeat(6, 1fr)',
        borderTop: '1px solid var(--jl-line-soft)',
        background: 'var(--jl-bg-raised)',
        padding: '8px 8px 18px',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
        const isActive = pathname.startsWith(href)
        const label = t(labelKey)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1"
            style={{
              padding: 6,
              borderRadius: 10,
              color: isActive ? 'var(--jl-accent-strong)' : 'var(--jl-text-faint)',
              textDecoration: 'none',
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {label}
            </span>
            {isActive && (
              <span
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: 'var(--jl-accent-strong)',
                  marginTop: -2,
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
