'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import {
  Target,
  Timer,
  Flame,
  Layers,
  Swords,
  Users,
  Shield,
  Settings,
  LogOut,
  PanelLeft,
} from 'lucide-react'
import { Avatar } from '@/components/rpg/Avatar'
import { XPBar } from '@/components/rpg/XPBar'
import { LogoutButton } from '@/components/features/logout-button'

type SidebarLabelKey =
  | 'dashboard'
  | 'pomodoro'
  | 'habits'
  | 'flashcards'
  | 'quests'
  | 'guild'
  | 'character'
  | 'settings'

type NavItem = {
  href: string
  icon: typeof Target
  labelKey: SidebarLabelKey
  disabled?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Target, labelKey: 'dashboard' },
  { href: '/pomodoro', icon: Timer, labelKey: 'pomodoro' },
  { href: '/habits', icon: Flame, labelKey: 'habits' },
  { href: '/flashcards', icon: Layers, labelKey: 'flashcards' },
  { href: '/quests', icon: Swords, labelKey: 'quests', disabled: true },
  { href: '/guild', icon: Users, labelKey: 'guild', disabled: true },
  { href: '/character', icon: Shield, labelKey: 'character' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
]

interface SideNavProps {
  level: number
  currentXP: number
  maxXP: number
  characterName: string
  avatarUrl?: string | null
}

export function SideNav({ level, currentXP, maxXP, characterName, avatarUrl }: SideNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav.sidebar')
  const tCommon = useTranslations('common')
  const tApp = useTranslations('app')
  const [collapsed, setCollapsed] = useState(true)
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null)
  const [toggleTooltip, setToggleTooltip] = useState<{ top: number; left: number } | null>(null)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  const showTooltip = (e: React.MouseEvent<HTMLElement>, label: string) => {
    if (!collapsed) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, top: rect.top + rect.height / 2 })
  }

  const hideTooltip = () => setTooltip(null)

  const expandLabel = t('expand')
  const collapseLabel = t('collapse')
  const signOutLabel = tCommon('signOut')

  return (
    // Wrapper with position:relative so the toggle button can float on the right edge
    <div
      style={{ position: 'relative', height: '100%', display: 'flex' }}
      onMouseEnter={() => collapsed && setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      {/* Toggle button — floats on the sidebar's right border, Linear/Notion style */}
      {/* Toggle tooltip */}
      {toggleTooltip && (
        <div
          style={{
            position: 'fixed',
            left: toggleTooltip.left,
            top: toggleTooltip.top,
            transform: 'translateY(-50%)',
            background: 'var(--jl-bg-raised)',
            border: '1px solid var(--jl-line-soft)',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--jl-text-default)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {collapsed ? expandLabel : collapseLabel}
        </div>
      )}

      <button
        onClick={() => setCollapsed((c) => !c)}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setToggleTooltip({ top: rect.top + rect.height / 2, left: rect.right + 8 })
        }}
        onMouseLeave={() => setToggleTooltip(null)}
        aria-label={collapsed ? expandLabel : collapseLabel}
        style={{
          position: 'absolute',
          right: -11,
          top: 22,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `1px solid ${sidebarHovered || toggleTooltip ? 'var(--jl-line-soft)' : 'transparent'}`,
          background: toggleTooltip ? 'var(--jl-bg-sunken)' : sidebarHovered ? 'var(--jl-bg-raised)' : 'transparent',
          color: sidebarHovered || toggleTooltip ? 'var(--jl-text-soft)' : 'transparent',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        }}
      >
        <PanelLeft size={12} />
      </button>

      <aside
        className="flex flex-col h-full"
        style={{
          width: collapsed ? 64 : 200,
          flexShrink: 0,
          background: 'var(--jl-bg-raised)',
          borderRight: '1px solid var(--jl-line-soft)',
          padding: collapsed ? '18px 8px' : '18px 12px',
          gap: 4,
          transition: 'width 0.2s ease, padding 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Tooltip — position:fixed escapes aside's overflow:hidden */}
        {tooltip && collapsed && (
          <div
            style={{
              position: 'fixed',
              left: 72,
              top: tooltip.top,
              transform: 'translateY(-50%)',
              background: 'var(--jl-bg-raised)',
              border: '1px solid var(--jl-line-soft)',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--jl-text-default)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 9999,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {tooltip.label}
          </div>
        )}

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 4px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <Image
              src="/logo.png"
              alt="JL-Tools logo"
              fill
              sizes="30px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                JL-Tools
              </span>
              <span style={{ fontSize: 10.5, color: 'var(--jl-text-faint)', marginTop: 2, whiteSpace: 'nowrap' }}>
                {tApp('tagline')}
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ href, icon: Icon, labelKey, disabled }) => {
            const isActive = !disabled && pathname.startsWith(href)
            const label = t(labelKey)
            const itemStyle: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              padding: collapsed ? '9px 0' : '9px 10px',
              borderRadius: 10,
              background: isActive ? 'var(--jl-accent-soft)' : 'transparent',
              color: isActive
                ? 'var(--jl-accent-ink)'
                : disabled
                  ? 'var(--jl-text-faint)'
                  : 'var(--jl-text-soft)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              border: isActive
                ? '1px solid color-mix(in oklch, var(--jl-accent) 35%, transparent)'
                : '1px solid transparent',
              textDecoration: 'none',
              opacity: disabled ? 0.55 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }
            const inner = (
              <>
                <Icon size={18} />
                {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
                {!collapsed && isActive && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--jl-accent-strong)',
                    }}
                  />
                )}
              </>
            )
            return disabled ? (
              <div
                key={href}
                style={itemStyle}
                aria-disabled="true"
                onMouseEnter={(e) => showTooltip(e, label)}
                onMouseLeave={hideTooltip}
              >
                {inner}
              </div>
            ) : (
              <Link
                key={href}
                href={href}
                style={itemStyle}
                onMouseEnter={(e) => showTooltip(e, label)}
                onMouseLeave={hideTooltip}
              >
                {inner}
              </Link>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Character card */}
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
            <Avatar level={level} size={36} avatarUrl={avatarUrl} />
            <LogoutButton
              variant="ghost"
              size="icon"
              aria-label={signOutLabel}
              style={{ width: 28, height: 28, color: 'var(--jl-text-faint)' }}
            >
              <LogOut size={14} />
            </LogoutButton>
          </div>
        ) : (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: 'var(--jl-bg-sunken)',
              border: '1px solid var(--jl-line-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar level={level} size={40} avatarUrl={avatarUrl} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {characterName}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--jl-text-faint)', marginTop: 2 }}>
                  Lv {level} · {t('characterClass')}
                </div>
              </div>
              <LogoutButton
                variant="ghost"
                size="icon"
                aria-label={signOutLabel}
                style={{
                  width: 28,
                  height: 28,
                  color: 'var(--jl-text-faint)',
                  flexShrink: 0,
                }}
              >
                <LogOut size={14} />
              </LogoutButton>
            </div>
            <XPBar currentXP={currentXP} maxXP={maxXP} level={level} compact showLevel={false} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: 10,
                color: 'var(--jl-text-faint)',
              }}
            >
              <span className="jl-mono">XP</span>
              <span className="jl-mono jl-tnum">
                {currentXP}/{maxXP}
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
