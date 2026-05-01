'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'

interface StatChartProps {
  stats: {
    focus: number
    discipline: number
    knowledge: number
    endurance: number
  }
}

type StatKey = 'focus' | 'discipline' | 'knowledge' | 'endurance'

const STAT_COLORS: Record<StatKey, string> = {
  focus: 'var(--jl-accent)',
  discipline: '#f59e0b',
  knowledge: '#8b5cf6',
  endurance: '#10b981',
}

export const StatChart: FC<StatChartProps> = ({ stats }) => {
  const t = useTranslations('character.stats')

  const STAT_KEYS: StatKey[] = ['focus', 'discipline', 'knowledge', 'endurance']

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
        {t('title')}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {STAT_KEYS.map(key => (
          <div
            key={key}
            style={{
              padding: 14,
              borderRadius: 12,
              background: 'var(--jl-bg-sunken)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--jl-text-soft)',
                fontSize: 11,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  color: STAT_COLORS[key],
                }}
              >
                {t(key)}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--jl-font-display)',
                fontSize: 28,
                lineHeight: 1,
                color: 'var(--jl-text)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stats[key]}
            </div>
            <div
              style={{
                height: 5,
                background: 'var(--jl-bg-raised)',
                borderRadius: 3,
                marginTop: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, stats[key])}%`,
                  height: '100%',
                  background: STAT_COLORS[key],
                  borderRadius: 3,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div
              style={{ fontSize: 10, color: 'var(--jl-text-faint)', marginTop: 5 }}
            >
              {t(`${key}Desc` as `${StatKey}Desc`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
