'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Avatar } from '@/components/rpg/Avatar'
import { LevelBadge } from '@/components/rpg/LevelBadge'
import { RarityChip } from '@/components/rpg/RarityChip'
import { XPBar } from '@/components/rpg/XPBar'
import { StatPill } from '@/components/rpg/StatPill'
import type { CharacterStats } from '@/types/rpg'
import type { Tier } from '@/types/rpg'

function getLevelTier(level: number): Tier {
  if (level >= 40) return 'mythic'
  if (level >= 30) return 'legendary'
  if (level >= 20) return 'rare'
  if (level >= 10) return 'uncommon'
  return 'common'
}

function getTierKey(level: number): 'tierMaster' | 'tierExpert' | 'tierAdept' | 'tierApprentice' | 'tierNovice' {
  if (level >= 40) return 'tierMaster'
  if (level >= 30) return 'tierExpert'
  if (level >= 20) return 'tierAdept'
  if (level >= 10) return 'tierApprentice'
  return 'tierNovice'
}

function getXpForLevel(level: number): number {
  return level * level * 100
}

interface CharacterSheetProps {
  stats: CharacterStats
  characterName?: string
  characterClass?: string
  title?: string
  avatarUrl?: string | null
  avatarHref?: string
}

export const CharacterSheet: FC<CharacterSheetProps> = ({
  stats,
  characterName = 'Adventurer',
  characterClass = 'Scholar',
  title,
  avatarUrl,
  avatarHref,
}) => {
  const t = useTranslations('character.sheet')

  const tier = getLevelTier(stats.level)
  const tierKey = getTierKey(stats.level)
  const xpForNext = getXpForLevel(stats.level + 1) - getXpForLevel(stats.level)

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
        {avatarHref ? (
          <Link href={avatarHref} aria-label={t('editAria')} style={{ display: 'block', borderRadius: '50%' }}>
            <Avatar level={stats.level} size={120} avatarUrl={avatarUrl} />
          </Link>
        ) : (
          <Avatar level={stats.level} size={120} avatarUrl={avatarUrl} />
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--jl-accent-ink)',
          fontWeight: 600,
        }}
      >
        {characterClass}
      </div>

      <div
        style={{
          fontFamily: 'var(--jl-font-display)',
          fontSize: 24,
          marginTop: 6,
          letterSpacing: '-0.02em',
          color: 'var(--jl-text)',
          fontWeight: 500,
        }}
      >
        {characterName}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
        }}
      >
        <LevelBadge level={stats.level} size={30} />
        <RarityChip rarity={tier} />
        <span
          style={{
            fontSize: 11,
            color: 'var(--jl-text-soft)',
            fontWeight: 600,
          }}
        >
          {t(tierKey)}
        </span>
      </div>

      <div style={{ marginTop: 18 }}>
        <XPBar
          currentXP={stats.xp_in_current_level}
          maxXP={xpForNext}
          level={stats.level}
        />
        <div
          style={{
            fontSize: 11,
            color: 'var(--jl-text-faint)',
            marginTop: 4,
          }}
        >
          {t('xpProgress', {
            current: stats.xp_in_current_level.toLocaleString(),
            total: xpForNext.toLocaleString(),
            level: stats.level + 1,
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          marginTop: 16,
          flexWrap: 'wrap',
        }}
      >
        <StatPill icon="🔥" label={t('stats.streak')} value={`${stats.current_streak}d`} />
        <StatPill icon="⏱" label={t('stats.focus')} value={`${Math.round(stats.total_focus_minutes / 60)}h`} />
      </div>

      {title && (
        <div
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 12,
            background: 'var(--jl-bg-sunken)',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--jl-text-faint)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            {t('titleLabel')}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--jl-text)' }}>
            &ldquo;{title}&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}
