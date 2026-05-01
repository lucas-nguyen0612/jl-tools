'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { User, KeyRound, Palette, Bell, Info } from 'lucide-react'

type SettingsNavLabelKey =
  | 'profile'
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'about'

type NavItem = {
  href: string
  icon: typeof User
  labelKey: SettingsNavLabelKey
}

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { href: '/settings/profile', icon: User, labelKey: 'profile' },
  { href: '/settings/account', icon: KeyRound, labelKey: 'account' },
  { href: '/settings/appearance', icon: Palette, labelKey: 'appearance' },
  { href: '/settings/notifications', icon: Bell, labelKey: 'notifications' },
  { href: '/settings/about', icon: Info, labelKey: 'about' },
]

export function SettingsNav() {
  const pathname = usePathname() ?? ''
  const t = useTranslations('nav.settings')
  const tSettings = useTranslations('settings')

  return (
    <aside
      aria-label={tSettings('title')}
      className="hidden md:flex flex-col"
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--jl-bg-raised)',
        borderRight: '1px solid var(--jl-line-soft)',
        padding: '18px 12px',
        gap: 4,
      }}
    >
      <div
        style={{
          padding: '4px 8px 14px',
          fontFamily: 'var(--jl-font-display)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--jl-text)',
          letterSpacing: '-0.01em',
        }}
      >
        {tSettings('title')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SETTINGS_NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const label = t(labelKey)
          const itemStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 10,
            background: isActive ? 'var(--jl-accent-soft)' : 'transparent',
            color: isActive ? 'var(--jl-accent-ink)' : 'var(--jl-text-soft)',
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            border: isActive
              ? '1px solid color-mix(in oklch, var(--jl-accent) 35%, transparent)'
              : '1px solid transparent',
            textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s',
          }
          return (
            <Link
              key={href}
              href={href}
              style={itemStyle}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--jl-accent-strong)',
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
