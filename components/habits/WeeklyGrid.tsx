'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import type { HabitWithStatus } from '@/features/habits/types'

interface WeeklyGridProps {
  habits: HabitWithStatus[]
}

function getLast7Days(): Array<{ date: string; label: string; dayNum: string; isToday: boolean }> {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString('sv-SE'),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: String(d.getDate()),
      isToday: i === 6,
    }
  })
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#22c55e',
  fitness: '#f97316',
  learning: '#3b82f6',
  productivity: '#eab308',
  mindfulness: '#14b8a6',
  other: '#8b5cf6',
}

export const WeeklyGrid: FC<WeeklyGridProps> = ({ habits }) => {
  const t = useTranslations('habits.weeklyGrid')
  const days = getLast7Days()

  if (habits.length === 0) {
    return (
      <div
        className="rounded-xl p-4 flex flex-col items-center gap-2"
        style={{ background: 'var(--jl-bg-elevated)', border: '1px solid var(--jl-border)' }}
      >
        <span style={{ fontSize: 32 }}>📅</span>
        <p style={{ fontSize: 13, color: 'var(--jl-text-faint)', margin: 0 }}>
          {t('empty')}
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--jl-bg-elevated)', border: '1px solid var(--jl-border)' }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(7, 36px)',
          gap: 4,
          padding: '10px 14px',
          borderBottom: '1px solid var(--jl-border)',
          background: 'var(--jl-bg-sunken)',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--jl-text-faint)', fontWeight: 600 }}>
          {t('habitColumn')}
        </span>
        {days.map(d => (
          <div key={d.date} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 10,
                color: d.isToday ? 'var(--jl-accent)' : 'var(--jl-text-faint)',
                fontWeight: d.isToday ? 700 : 400,
                textTransform: 'uppercase',
              }}
            >
              {d.label}
            </div>
            <div
              style={{
                fontSize: 11,
                color: d.isToday ? 'var(--jl-accent)' : 'var(--jl-text-soft)',
                fontWeight: d.isToday ? 700 : 400,
              }}
            >
              {d.dayNum}
            </div>
          </div>
        ))}
      </div>

      {/* Habit rows */}
      {habits.map((habit, idx) => {
        const color = habit.color || CATEGORY_COLORS[habit.category] || '#8b5cf6'
        return (
          <div
            key={habit.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr repeat(7, 36px)',
              gap: 4,
              padding: '8px 14px',
              alignItems: 'center',
              borderBottom: idx < habits.length - 1 ? '1px solid var(--jl-border)' : 'none',
            }}
          >
            {/* Habit name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span
                className="truncate"
                style={{ fontSize: 13, color: 'var(--jl-text)', fontWeight: 500 }}
              >
                {habit.name}
              </span>
            </div>

            {/* Day cells */}
            {days.map(d => {
              const done = habit.week_completions.includes(d.date)
              return (
                <div key={d.date} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    title={done ? t('doneTooltip', { day: `${d.label} ${d.dayNum}` }) : t('notDoneTooltip', { day: `${d.label} ${d.dayNum}` })}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: done ? color : 'transparent',
                      border: `2px solid ${done ? color : 'var(--jl-border)'}`,
                      opacity: done ? 1 : 0.4,
                      transition: 'background 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <polyline
                          points="1.5,5 4,7.5 8.5,2.5"
                          stroke="white"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
