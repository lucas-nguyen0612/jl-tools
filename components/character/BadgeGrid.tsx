'use client'

import { type FC, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { BadgeWithStatus } from '@/features/gamification/queries'
import type { Tier } from '@/types/rpg'

type FilterTab = 'all' | 'earned' | 'locked'

const RARITY_BORDER: Record<Tier, string> = {
  common: 'var(--jl-common, #9ca3af)',
  uncommon: 'var(--jl-uncommon, #22c55e)',
  rare: 'var(--jl-rare, #3b82f6)',
  legendary: 'var(--jl-legendary, #f59e0b)',
  mythic: 'var(--jl-mythic, #a855f7)',
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

interface BadgeGridProps {
  badges: BadgeWithStatus[]
}

export const BadgeGrid: FC<BadgeGridProps> = ({ badges }) => {
  const t = useTranslations('character.badges')
  const [filter, setFilter] = useState<FilterTab>('all')

  const filtered = badges.filter(b => {
    if (filter === 'earned') return b.earned
    if (filter === 'locked') return !b.earned
    return true
  })

  const earnedCount = badges.filter(b => b.earned).length

  const filterLabels: Record<FilterTab, string> = {
    all: t('filterAll'),
    earned: t('filterEarned'),
    locked: t('filterLocked'),
  }

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
          {t('title')}
        </h2>
        <span
          style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--jl-text-faint)' }}
        >
          {t('earnedCount', { earned: earnedCount, total: badges.length })}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          background: 'var(--jl-bg-sunken)',
          padding: 3,
          borderRadius: 10,
          width: 'fit-content',
        }}
      >
        {(['all', 'earned', 'locked'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '4px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'capitalize',
              border: 'none',
              cursor: 'pointer',
              background: filter === tab ? 'var(--jl-bg-raised)' : 'transparent',
              color: filter === tab ? 'var(--jl-text)' : 'var(--jl-text-faint)',
              boxShadow: filter === tab ? 'var(--jl-shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {filterLabels[tab]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
          gap: 10,
        }}
      >
        {filtered.map(badge => {
          const rarity = badge.rarity as Tier
          const borderColor = RARITY_BORDER[rarity] ?? RARITY_BORDER.common

          return (
            <div
              key={badge.id}
              title={badge.earned
                ? t('earnedTooltip', { name: badge.name, description: badge.description })
                : t('lockedTooltip', { description: badge.description })}
              style={{
                aspectRatio: '1',
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                background: badge.earned
                  ? `color-mix(in oklch, ${borderColor} 15%, var(--jl-bg-raised))`
                  : 'var(--jl-bg-sunken)',
                color: badge.earned ? borderColor : 'var(--jl-text-faint)',
                border: `1px solid ${badge.earned
                  ? `color-mix(in oklch, ${borderColor} 40%, transparent)`
                  : 'var(--jl-line)'}`,
                opacity: badge.earned ? 1 : 0.55,
                cursor: 'default',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>
                {badge.earned ? getIcon(badge.icon) : '🔒'}
              </span>
              {badge.earned && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    fontSize: 8,
                    color: 'var(--jl-text-faint)',
                    fontWeight: 500,
                    width: '100%',
                    textAlign: 'center',
                    padding: '0 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {badge.name}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0',
            color: 'var(--jl-text-faint)',
            fontSize: 13,
          }}
        >
          {filter === 'earned' ? t('emptyEarned') : t('emptyAll')}
        </div>
      )}
    </div>
  )
}
