'use client'

import { useTranslations } from 'next-intl'
import type { HabitWithStats } from '@/types/habit'
import { Progress } from '@/components/ui/progress'

interface WeeklyProgressProps {
  habits: HabitWithStats[]
}

export function WeeklyProgress({ habits }: WeeklyProgressProps) {
  const t = useTranslations('habits')

  if (habits.length === 0) return null

  // Calculate total possible check-ins this week and completed
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const daysPassed = Math.min(
    7,
    Math.max(1, Math.ceil((today.getTime() - monday.getTime()) / 86400000)),
  )

  const dailyHabits = habits.filter((h) => h.frequency_type === 'daily')
  const weeklyHabits = habits.filter((h) => h.frequency_type !== 'daily')

  // For daily habits: expected = dailyCount * daysPassed
  const dailyExpected = dailyHabits.length * daysPassed
  // For weekly/custom: expected = sum of frequency_days that have passed this week
  const weeklyExpected = weeklyHabits.reduce((sum, h) => {
    const daysForHabit = h.frequency_days.filter((d) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + ((d === 0 ? 7 : d) - 1))
      return dayDate <= today
    }).length
    return sum + daysForHabit
  }, 0)

  const totalExpected = dailyExpected + weeklyExpected
  const totalCompleted = habits.reduce((sum, h) => sum + h.completedThisWeek, 0)
  const percentage =
    totalExpected > 0 ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100)) : 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="text-muted-foreground mb-1 flex justify-between text-xs">
          <span>{t('thisWeek')}</span>
          <span className="font-medium tabular-nums">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  )
}
