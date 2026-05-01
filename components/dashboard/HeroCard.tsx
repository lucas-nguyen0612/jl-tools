import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Avatar } from '@/components/rpg/Avatar'
import { LevelBadge } from '@/components/rpg/LevelBadge'
import { RarityChip } from '@/components/rpg/RarityChip'
import { XPBar } from '@/components/rpg/XPBar'
import { StatPill } from '@/components/rpg/StatPill'
import type { CharacterStats } from '@/types/rpg'
import type { Tier } from '@/types/rpg'
import type { NextUnlock } from '@/features/gamification/dashboard-queries'

function getLevelTier(level: number): Tier {
  if (level >= 40) return 'mythic'
  if (level >= 30) return 'legendary'
  if (level >= 20) return 'rare'
  if (level >= 10) return 'uncommon'
  return 'common'
}

function formatFocusTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

interface HeroCardProps {
  stats: CharacterStats
  xpForNextLevel: number
  characterName?: string
  characterClass?: string
  avatarUrl?: string | null
  nextUnlock?: NextUnlock | null
  todayFocusMinutes: number
  habitsToday: number
  totalHabitsToday: number
  cardsReviewedToday: number
  flashcardsDue: number
}

export const HeroCard: FC<HeroCardProps> = ({
  stats,
  xpForNextLevel,
  characterName = 'Adventurer',
  characterClass = 'Scholar',
  avatarUrl,
  nextUnlock,
  todayFocusMinutes,
  habitsToday,
  totalHabitsToday,
  cardsReviewedToday,
  flashcardsDue,
}) => {
  const t = useTranslations('dashboard.hero')
  const tier = getLevelTier(stats.level)

  const totalReviewsDenominator = cardsReviewedToday + flashcardsDue
  const reviewsLabel =
    totalReviewsDenominator === 0
      ? '0/0'
      : `${cardsReviewedToday}/${totalReviewsDenominator}`

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 20,
        alignItems: 'center',
      }}
    >
      <Avatar level={stats.level} size={88} avatarUrl={avatarUrl} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <LevelBadge level={stats.level} size={28} />
          <span
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 20,
              color: 'var(--jl-text)',
              fontWeight: 500,
            }}
          >
            {characterName} · {characterClass}
          </span>
          <RarityChip rarity={tier} />
        </div>

        <div style={{ marginTop: 14 }}>
          <XPBar
            currentXP={stats.xp_in_current_level}
            maxXP={xpForNextLevel}
            level={stats.level}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 12,
            flexWrap: 'wrap',
          }}
        >
          <StatPill icon="🔥" label={t('stats.streak')} value={`${stats.current_streak}d`} />
          <StatPill
            icon="⏱"
            label={t('stats.focusToday')}
            value={formatFocusTime(todayFocusMinutes)}
          />
          <StatPill
            icon="✅"
            label={t('stats.habitsToday')}
            value={`${habitsToday}/${totalHabitsToday}`}
          />
          <StatPill icon="🃏" label={t('stats.cardsToday')} value={reviewsLabel} />
        </div>
      </div>

      {nextUnlock && (
        <div
          style={{
            alignSelf: 'start',
            padding: 14,
            borderRadius: 12,
            background: 'var(--jl-accent-soft)',
            color: 'var(--jl-accent-ink)',
            minWidth: 150,
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {t('nextUnlock.label')}
          </div>
          <div
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 15,
              margin: '6px 0',
              fontWeight: 500,
            }}
          >
            {nextUnlock.name}
          </div>
          <div style={{ fontSize: 11 }}>
            {t('nextUnlock.atLevel', { level: nextUnlock.level })}
          </div>
        </div>
      )}
    </div>
  )
}
