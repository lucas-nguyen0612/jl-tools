'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'
import type { BadgeWithStatus } from '@/features/gamification/queries'
import type { Tier } from '@/types/rpg'

const RARITY_COLOR: Record<Tier, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  legendary: '#f59e0b',
  mythic: '#a855f7',
}

const BADGE_ICONS: Record<string, string> = {
  timer: '⏱',
  flame: '🔥',
  brain: '🧠',
  star: '⭐',
  trophy: '🏆',
  target: '🎯',
  book: '📚',
  cards: '🃏',
  sparkle: '✨',
  check: '✅',
  shield: '🛡',
  sword: '⚔',
}

function getIcon(iconSlug: string): string {
  return BADGE_ICONS[iconSlug.toLowerCase()] ?? '🏅'
}

interface RecentBadgesProps {
  earned: BadgeWithStatus[]
  locked: BadgeWithStatus[]
  maxSlots?: number
}

export const RecentBadges: FC<RecentBadgesProps> = ({
  earned,
  locked,
  maxSlots = 8,
}) => {
  const t = useTranslations('dashboard.recentBadges')
  if (earned.length === 0 && locked.length === 0) {
    return (
      <div
        className="rounded-2xl"
        style={{
          background: 'var(--jl-bg-raised)',
          border: '1px solid var(--jl-line)',
          padding: 16,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--jl-text)',
          }}
        >
          {t('title')}
        </h3>
        <div
          style={{
            textAlign: 'center',
            padding: '16px 0',
            color: 'var(--jl-text-faint)',
            fontSize: 12,
          }}
        >
          {t('empty')}
        </div>
      </div>
    )
  }

  // Build slots: earned first, then locked fillers, up to maxSlots
  const slots: BadgeWithStatus[] = [
    ...earned.slice(0, maxSlots),
    ...locked.slice(0, Math.max(0, maxSlots - earned.length)),
  ].slice(0, maxSlots)

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <h3
          style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--jl-text)' }}
        >
          {t('title')}
        </h3>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--jl-text-faint)',
          }}
        >
          {t('earnedCount', { count: earned.length })}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        {slots.map(badge => {
          const rarity = badge.rarity as Tier
          const color = RARITY_COLOR[rarity] ?? RARITY_COLOR.common

          if (!badge.earned) {
            return (
              <div
                key={badge.id}
                title={`${badge.name} — ${badge.description}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--jl-bg-sunken)',
                  color: 'var(--jl-text-faint)',
                  border: '1px solid var(--jl-line)',
                  opacity: 0.6,
                }}
              >
                <Lock size={16} />
              </div>
            )
          }

          return (
            <div
              key={badge.id}
              title={`${badge.name} — ${badge.description}`}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: `color-mix(in oklch, ${color} 15%, var(--jl-bg-raised))`,
                color,
                border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{getIcon(badge.icon)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
