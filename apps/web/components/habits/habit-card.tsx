'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { checkInHabit, undoCheckIn } from '@/lib/actions/checkin'
import { archiveHabit } from '@/lib/actions/habits'
import { toast } from '@/components/ui/sonner'
import { Check } from 'lucide-react'
import type { HabitWithStats } from '@/types/habit'
import { StreakDisplay } from './streak-display'

interface HabitCardProps {
  habit: HabitWithStats
  onArchive?: () => void
  onEdit?: () => void
}

export function HabitCard({ habit, onArchive, onEdit }: HabitCardProps) {
  const t = useTranslations('habits')
  const [isPending, startTransition] = useTransition()
  const [completed, setCompleted] = useState(habit.completedToday)

  function handleCheckIn() {
    if (completed) {
      // Undo
      startTransition(async () => {
        const result = await undoCheckIn(habit.id)
        if (result.success) {
          setCompleted(false)
          toast({ title: t('checkInUndone') ?? 'Check-in undone' })
        }
      })
    } else {
      // Check in
      startTransition(async () => {
        const result = await checkInHabit(habit.id)
        if (result.success) {
          setCompleted(true)
          toast({
            title: t('checkedIn') ?? 'Checked in!',
            description: `+${result.xpEarned} XP`,
            variant: 'success',
          })
          if (result.leveledUp) {
            toast({ title: t('leveledUp') ?? 'Level up!', variant: 'success' })
          }
        } else if (result.error) {
          toast({ title: result.error, variant: 'error' })
        }
      })
    }
  }

  return (
    <div className="border-border bg-card flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md">
      {/* Check-in button */}
      <button
        onClick={handleCheckIn}
        disabled={isPending}
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl transition-all active:scale-95 ${
          completed ? 'scale-100' : 'hover:scale-110'
        }`}
        style={{ backgroundColor: completed ? habit.color : `${habit.color}20` }}
        aria-label={completed ? (t('undoCheckIn') ?? 'Undo check-in') : t('checkIn')}
      >
        {completed ? <Check className="h-6 w-6 text-white" /> : <span>{habit.icon}</span>}
      </button>

      {/* Habit info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className="truncate font-semibold"
            style={{ color: completed ? habit.color : undefined }}
          >
            {habit.name}
          </p>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
          <StreakDisplay
            currentStreak={habit.currentStreak}
            longestStreak={habit.longestStreak}
            size="sm"
          />
          {habit.totalCheckIns > 0 && (
            <span className="tabular-nums">{habit.totalCheckIns} total</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 gap-1">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            {t('edit')}
          </button>
        )}
        {onArchive && (
          <button
            onClick={() => {
              startTransition(async () => {
                await archiveHabit(habit.id)
                onArchive?.()
              })
            }}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            {t('archive')}
          </button>
        )}
      </div>
    </div>
  )
}
