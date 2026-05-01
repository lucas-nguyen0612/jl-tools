'use client'

import { useTranslations } from 'next-intl'
import type { FlashCard } from '@/features/flashcards/types'

interface ForecastChartProps {
  cards: FlashCard[]
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ForecastChart({ cards }: ForecastChartProps) {
  const t = useTranslations('flashcards.stats.forecast')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: Array<{
    label: string
    date: string
    newCount: number
    scheduledCount: number
    isToday: boolean
  }> = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      label: DAY_LABELS[d.getDay()],
      date: dateStr,
      newCount: 0,
      scheduledCount: 0,
      isToday: i === 0,
    })
  }

  for (const card of cards) {
    const dueDate = card.due_date?.split('T')[0]
    const slot = days.find(d => d.date === dueDate)
    if (!slot) continue
    if (card.state === 'new') slot.newCount++
    else slot.scheduledCount++
  }

  const maxCount = Math.max(...days.map(d => d.newCount + d.scheduledCount), 1)

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--jl-bg-elevated)',
        border: '1px solid var(--jl-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--jl-text)',
          }}
        >
          {t('title')}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--jl-text-faint)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: 'var(--jl-accent-strong)',
              }}
            />
            {t('scheduled')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: 'color-mix(in oklch, var(--jl-info) 50%, var(--jl-bg-sunken))',
              }}
            />
            {t('newLegend')}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          height: 80,
        }}
      >
        {days.map(day => {
          const total = day.newCount + day.scheduledCount
          const totalPct = maxCount > 0 ? (total / maxCount) * 100 : 0
          const scheduledPct = total > 0 ? (day.scheduledCount / total) * 100 : 0
          return (
            <div
              key={day.date}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div
                title={t('tooltip', { scheduled: day.scheduledCount, newCount: day.newCount })}
                style={{
                  width: '100%',
                  height: `${Math.max(totalPct, 4)}%`,
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'height 0.3s ease',
                  background: 'var(--jl-bg-sunken)',
                }}
              >
                <div
                  style={{
                    height: `${scheduledPct}%`,
                    background: day.isToday
                      ? 'var(--jl-accent-strong)'
                      : 'color-mix(in oklch, var(--jl-accent) 30%, var(--jl-bg-sunken))',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    background: 'color-mix(in oklch, var(--jl-info) 50%, var(--jl-bg-sunken))',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: day.isToday ? 'var(--jl-accent-strong)' : 'var(--jl-text-faint)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: day.isToday ? 700 : 400,
                }}
              >
                {day.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
