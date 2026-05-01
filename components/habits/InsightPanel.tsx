'use client'

import { useTranslations } from 'next-intl'
import type { HabitWithStatus } from '@/features/habits/types'

interface InsightPanelProps {
  habits: HabitWithStatus[]
}

export const InsightPanel = ({ habits }: InsightPanelProps) => {
  const t = useTranslations('habits.insightPanel')
  const total = habits.length
  const doneToday = habits.filter(h => h.checked_today).length
  const completionRate = total > 0 ? Math.round((doneToday / total) * 100) : 0

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('sv-SE')
  })

  const sparkData = days7.map(date =>
    total > 0 ? (habits.filter(h => h.week_completions.includes(date)).length / total) * 100 : 0
  )

  const todayRate = sparkData[6] ?? 0
  const prev6Avg = sparkData.slice(0, 6).reduce((s, v) => s + v, 0) / 6
  const trendDiff = Math.round(todayRate - prev6Avg)

  const catStats = Object.entries(
    habits.reduce((acc, h) => {
      if (!acc[h.category]) acc[h.category] = { done: 0, total: 0, color: h.color }
      acc[h.category].total++
      if (h.checked_today) acc[h.category].done++
      return acc
    }, {} as Record<string, { done: number; total: number; color: string }>)
  ).map(([cat, s]) => ({ cat, pct: s.total > 0 ? s.done / s.total : 0, count: s.total, color: s.color }))

  const sparkW = 200
  const sparkH = 44
  const max = Math.max(...sparkData, 1)
  const pts = sparkData.map((v, i) => {
    const x = (i / 6) * sparkW
    const y = sparkH - (v / max) * (sparkH - 4) - 2
    return `${x},${y}`
  })
  const polylinePoints = pts.join(' ')
  const polygonPoints = `0,${sparkH} ${pts.join(' ')} ${sparkW},${sparkH}`

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="jl-card" style={{ padding: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px 0', color: 'var(--jl-text)' }}>
          {t('completionRate')}
        </p>
        <span
          className="jl-display jl-tnum"
          style={{ fontSize: 38, lineHeight: 1, display: 'block', color: 'var(--jl-text)' }}
        >
          {completionRate}%
        </span>
        <p
          style={{
            fontSize: 12,
            margin: '6px 0 12px 0',
            color:
              trendDiff > 0
                ? 'var(--jl-success)'
                : trendDiff < 0
                ? 'var(--jl-danger)'
                : 'var(--jl-text-faint)',
          }}
        >
          {trendDiff > 0
            ? t('trendUp', { pct: trendDiff })
            : trendDiff < 0
            ? t('trendDown', { pct: Math.abs(trendDiff) })
            : t('trendSame')}
        </p>
        <svg
          viewBox={`0 0 ${sparkW} ${sparkH}`}
          width="100%"
          height={sparkH}
          preserveAspectRatio="none"
        >
          <polygon
            points={polygonPoints}
            fill="color-mix(in oklch, var(--jl-accent-strong) 15%, transparent)"
          />
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--jl-accent-strong)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="jl-card" style={{ padding: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px 0', color: 'var(--jl-text)' }}>
          {t('byCategory')}
        </p>
        {catStats.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--jl-text-faint)', margin: 0 }}>{t('noHabits')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {catStats.map(({ cat, pct, count, color }) => (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span style={{ fontSize: 12, color: 'var(--jl-text)', textTransform: 'capitalize' }}>
                    {cat}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>
                    {Math.round(pct * 100)}% · {t('habitsCount', { count })}
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 4,
                    background: 'var(--jl-bg-sunken)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(pct * 100)}%`,
                      borderRadius: 4,
                      background: color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
