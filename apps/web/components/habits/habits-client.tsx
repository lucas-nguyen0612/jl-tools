'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { HabitCard } from '@/components/habits/habit-card'
import { HabitForm } from '@/components/habits/habit-form'
import { WeeklyProgress } from '@/components/habits/weekly-progress'
import { Plus, Flame, Archive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { HabitWithStats } from '@/types/habit'
import {
  calculateStreak,
  getCheckInsThisWeek,
  isCompletedToday,
} from '@/lib/habits/streak-calculator'

interface HabitsClientProps {
  userId: string
  locale: string
}

export function HabitsClient({ userId, locale }: HabitsClientProps) {
  const t = useTranslations('habits')
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [archivedHabits, setArchivedHabits] = useState<HabitWithStats[]>([])

  async function loadHabits(archived = false) {
    const supabase = createClient()
    const query = supabase.from('habits').select('*').eq('user_id', userId)

    if (archived) {
      query.not('archived_at', 'is', null)
    } else {
      query.is('archived_at', null)
    }

    const { data: habitsData, error } = await query.order('created_at', { ascending: false })

    if (error || !habitsData) {
      setLoading(false)
      return
    }

    // For each habit, get check-ins
    const habitsWithStats: HabitWithStats[] = await Promise.all(
      habitsData.map(async (habit) => {
        const { data: checkIns } = await supabase
          .from('habit_check_ins')
          .select('checked_at')
          .eq('habit_id', habit.id)
          .order('checked_at', { ascending: false })

        const checkInDates = (checkIns ?? []).map((c) => new Date(c.checked_at))
        const streak = calculateStreak(checkInDates)
        const completedThisWeek = getCheckInsThisWeek(checkInDates)
        const completedToday = isCompletedToday(checkInDates)

        return {
          ...habit,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          completedToday,
          completedThisWeek,
          totalCheckIns: checkInDates.length,
        }
      }),
    )

    if (archived) {
      setArchivedHabits(habitsWithStats)
    } else {
      setHabits(habitsWithStats)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadHabits(false)
    loadHabits(true)
  }, [userId])

  function handleArchive() {
    loadHabits(false)
    loadHabits(true)
  }

  function handleFormSuccess() {
    setShowForm(false)
    setEditingHabit(null)
    loadHabits(false)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-20 animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  const activeHabits = habits
  const todayHabits = activeHabits.filter((h) => {
    if (h.frequency_type === 'daily') return true
    const todayDow = new Date().getDay()
    return h.frequency_days.includes(todayDow)
  })

  const completedCount = todayHabits.filter((h) => h.completedToday).length

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      {activeHabits.length > 0 && (
        <div className="bg-card border-border flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">
              {completedCount}/{todayHabits.length} {t('completed')}
            </span>
          </div>
          <WeeklyProgress habits={activeHabits} />
        </div>
      )}

      {/* Habit list */}
      {todayHabits.length === 0 && !showForm ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
              <Flame className="text-muted-foreground h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold">{t('noHabitsYet')}</p>
              <p className="text-muted-foreground mt-1 text-sm">{t('createFirst')}</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              {t('addHabit')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => {
                setEditingHabit(habit)
                setShowForm(true)
              }}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Add habit button */}
      {!showForm && todayHabits.length > 0 && (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          {t('addHabit')}
        </Button>
      )}

      {/* Habit form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editingHabit ? t('editHabit') : t('addHabit')}
            </h2>
            <HabitForm
              habit={editingHabit ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingHabit(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Archived habits link */}
      {archivedHabits.length > 0 && (
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <Archive className="h-4 w-4" />
          {archivedHabits.length} {t('archived')}
        </button>
      )}

      {/* Archived list */}
      {showArchived && archivedHabits.length > 0 && (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">{t('archived')}</p>
          {archivedHabits.map((habit) => (
            <Card key={habit.id} className="opacity-60">
              <CardContent className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <span className="font-medium">{habit.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
