'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Flame } from 'lucide-react'
import { Heatmap } from '@/components/rpg/Heatmap'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
  activity: { date: string; count: number }[]
  weeks?: number
}

export const StreakCard: FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
  activity,
  weeks = 18,
}) => {
  const t = useTranslations('dashboard.streakCard')
  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      {/* Header row: flame tile + big number + sublabel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background:
              'color-mix(in oklch, var(--jl-danger) 18%, var(--jl-bg-raised))',
            color: 'var(--jl-danger)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Flame size={20} />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 30,
              lineHeight: 1,
              color: 'var(--jl-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {currentStreak}
          </div>
          <div style={{ fontSize: 11, color: 'var(--jl-text-soft)' }}>
            {t('dayStreak', { days: currentStreak, longest: longestStreak })}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ marginTop: 14, overflow: 'hidden' }}>
        <Heatmap data={activity} weeks={weeks} />
      </div>

      {/* Legend row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'var(--jl-text-faint)',
          marginTop: 8,
        }}
      >
        <span>{t('less')}</span>
        <span>
          {[0, 1, 2, 3, 4].map(v => (
            <span
              key={v}
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                marginLeft: 3,
                borderRadius: 2,
                background:
                  v === 0
                    ? 'var(--jl-bg-sunken)'
                    : v === 4
                      ? 'var(--jl-accent-strong)'
                      : `color-mix(in oklch, var(--jl-accent) ${v * 25}%, var(--jl-bg-sunken))`,
              }}
            />
          ))}
        </span>
        <span>{t('more')}</span>
      </div>
    </div>
  )
}
