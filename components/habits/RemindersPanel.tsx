'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import type { HabitWithStatus } from '@/features/habits/types'

interface RemindersPanelProps {
  habits: HabitWithStatus[]
}

const TIME_GROUPS = [
  { key: 'morning',   emoji: '🌅' },
  { key: 'afternoon', emoji: '☀️' },
  { key: 'evening',   emoji: '🌙' },
  { key: 'anytime',   emoji: '🕐' },
] as const


export const RemindersPanel: FC<RemindersPanelProps> = ({ habits }) => {
  const t = useTranslations('habits.remindersPanel')
  const tTime = useTranslations('habits.timeOfDay')
  const tCheckIn = useTranslations('habits.checkIn')

  const grouped = TIME_GROUPS.map(g => ({
    ...g,
    label: tTime(g.key),
    hint: tTime(`${g.key}Hint` as 'morningHint' | 'afternoonHint' | 'eveningHint' | 'anytimeHint'),
    habits: habits.filter(h => h.time_of_day === g.key),
  })).filter(g => g.habits.length > 0)

  if (habits.length === 0) {
    return (
      <div
        className="rounded-xl p-4 flex flex-col items-center gap-2"
        style={{ background: 'var(--jl-bg-elevated)', border: '1px solid var(--jl-border)' }}
      >
        <span style={{ fontSize: 32 }}>⏰</span>
        <p style={{ fontSize: 13, color: 'var(--jl-text-faint)', margin: 0 }}>
          {t('empty')}
        </p>
      </div>
    )
  }

  const doneCount = habits.filter(h => h.checked_today).length
  const total = habits.length

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--jl-bg-elevated)', border: '1px solid var(--jl-border)' }}
    >
      {/* Summary bar */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--jl-border)',
          background: 'var(--jl-bg-sunken)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--jl-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t('scheduleTitle')}
        </span>
        <span style={{ fontSize: 12, color: doneCount === total ? 'var(--jl-success)' : 'var(--jl-text-soft)', fontWeight: 600 }}>
          {t('doneCount', { done: doneCount, total })}
        </span>
      </div>

      {grouped.map((group, gi) => (
        <div key={group.key}>
          {/* Time group header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px 4px',
              background: gi % 2 === 0 ? 'transparent' : 'var(--jl-bg-sunken)',
            }}
          >
            <span style={{ fontSize: 14 }}>{group.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--jl-text-soft)' }}>
              {group.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>
              · {group.hint}
            </span>
          </div>

          {/* Habit rows */}
          {group.habits.map(habit => (
            <div
              key={habit.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                background: gi % 2 === 0 ? 'transparent' : 'var(--jl-bg-sunken)',
                borderTop: '1px solid var(--jl-border)',
              }}
            >
              {/* Status dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: habit.checked_today ? 'var(--jl-success)' : 'var(--jl-border)',
                  border: habit.checked_today ? 'none' : '1.5px solid var(--jl-text-faint)',
                  flexShrink: 0,
                }}
              />

              {/* Name */}
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: habit.checked_today ? 'var(--jl-text-faint)' : 'var(--jl-text)',
                  fontWeight: 500,
                  textDecoration: habit.checked_today ? 'line-through' : 'none',
                }}
              >
                {habit.name}
              </span>

              {/* Reminder time */}
              {habit.reminder_time && (
                <span style={{ fontSize: 11, color: 'var(--jl-text-faint)', fontVariantNumeric: 'tabular-nums' }}>
                  {habit.reminder_time}
                </span>
              )}

              {/* Badge */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 99,
                  background: habit.checked_today ? 'var(--jl-success)' : 'var(--jl-bg-raised)',
                  color: habit.checked_today ? '#fff' : 'var(--jl-text-soft)',
                  border: habit.checked_today ? 'none' : '1px solid var(--jl-border)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {habit.checked_today ? tCheckIn('done') : tCheckIn('due')}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
