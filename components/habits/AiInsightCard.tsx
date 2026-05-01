'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { HabitWithStatus } from '@/features/habits/types'

interface AiInsightCardProps {
  habits: HabitWithStatus[]
}

export const AiInsightCard = ({ habits }: AiInsightCardProps) => {
  const t = useTranslations('habits.aiInsight')

  const total = habits.length
  const doneToday = habits.filter(h => h.checked_today).length

  let insight: string

  const streak7 = habits.find(h => h.current_streak >= 7)
  if (streak7) {
    insight = t('longStreak', { name: streak7.name, days: streak7.current_streak })
  } else {
    const streak3 = habits.find(h => h.current_streak >= 3)
    if (streak3) {
      insight = t('buildingStreak', { name: streak3.name, days: streak3.current_streak })
    } else {
      const morningHabits = habits.filter(h => h.time_of_day === 'morning')
      const eveningHabits = habits.filter(h => h.time_of_day === 'evening')
      if (morningHabits.length > 0 && eveningHabits.length > 0) {
        const morningRate = morningHabits.filter(h => h.checked_today).length / morningHabits.length
        const eveningRate = eveningHabits.filter(h => h.checked_today).length / eveningHabits.length
        if (morningRate > 0 && eveningRate > 0 && morningRate > eveningRate) {
          const ratio = (morningRate / eveningRate).toFixed(1)
          insight = t('morningBetter', { ratio })
        } else if (doneToday === total && total > 0) {
          insight = t('allDone', { count: total })
        } else {
          insight = t('default')
        }
      } else if (doneToday === total && total > 0) {
        insight = t('allDone', { count: total })
      } else {
        insight = t('default')
      }
    }
  }

  return (
    <div
      className="jl-card"
      style={{
        padding: 16,
        background: 'color-mix(in oklch, var(--jl-accent-soft) 50%, var(--jl-bg-raised))',
        borderColor: 'color-mix(in oklch, var(--jl-accent) 30%, transparent)',
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
        <Sparkles size={14} color="var(--jl-accent-strong)" />
        <span
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
            color: 'var(--jl-accent-ink)',
          }}
        >
          {t('label')}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--jl-text)' }}>
        {insight}
      </p>
    </div>
  )
}
