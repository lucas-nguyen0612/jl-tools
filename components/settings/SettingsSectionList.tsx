'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { User, KeyRound, Palette, Bell, Info } from 'lucide-react'

export const SETTINGS_SECTIONS = [
  {
    href: '/settings/profile',
    icon: User,
    title: 'Profile',
    description: 'Display name and avatar',
  },
  {
    href: '/settings/account',
    icon: KeyRound,
    title: 'Account',
    description: 'Email, password, and account deletion',
  },
  {
    href: '/settings/appearance',
    icon: Palette,
    title: 'Appearance',
    description: 'Theme and accent color',
  },
  {
    href: '/settings/notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Sounds, reminders, and permissions',
  },
  {
    href: '/settings/about',
    icon: Info,
    title: 'About',
    description: 'App version and feedback',
  },
] as const

export function SettingsSectionList() {
  const t = useTranslations('settings.sectionsList')

  const sections = [
    {
      href: '/settings/profile',
      icon: User,
      title: t('profileTitle'),
      description: t('profileDescription'),
    },
    {
      href: '/settings/account',
      icon: KeyRound,
      title: t('accountTitle'),
      description: t('accountDescription'),
    },
    {
      href: '/settings/appearance',
      icon: Palette,
      title: t('appearanceTitle'),
      description: t('appearanceDescription'),
    },
    {
      href: '/settings/notifications',
      icon: Bell,
      title: t('notificationsTitle'),
      description: t('notificationsDescription'),
    },
    {
      href: '/settings/about',
      icon: Info,
      title: t('aboutTitle'),
      description: t('aboutDescription'),
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '22px 28px 40px',
        maxWidth: 720,
      }}
    >
      {sections.map(({ href, icon: Icon, title, description }) => (
        <Link
          key={href}
          href={href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--jl-bg-raised)',
            border: '1px solid var(--jl-line-soft)',
            color: 'var(--jl-text)',
            textDecoration: 'none',
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--jl-accent-soft)',
              color: 'var(--jl-accent-ink)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
              {title}
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--jl-text-faint)',
                marginTop: 2,
              }}
            >
              {description}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
