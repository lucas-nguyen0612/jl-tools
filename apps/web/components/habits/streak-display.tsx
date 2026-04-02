'use client'

import { useTranslations } from 'next-intl'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  size?: 'sm' | 'md'
}

export function StreakDisplay({ currentStreak, longestStreak, size = 'md' }: StreakDisplayProps) {
  const t = useTranslations('habits')

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1">
        <span className="text-lg">🔥</span>
        <span className="text-sm font-semibold tabular-nums">{currentStreak}</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-xl font-bold tabular-nums">{currentStreak}</p>
          <p className="text-muted-foreground text-xs">{t('currentStreak')}</p>
        </div>
      </div>
      {longestStreak > 0 && (
        <p className="text-muted-foreground text-xs">
          {t('longestStreak')}: {longestStreak}
        </p>
      )}
    </div>
  )
}
