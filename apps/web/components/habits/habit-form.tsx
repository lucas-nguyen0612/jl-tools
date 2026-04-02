'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createHabit, updateHabit } from '@/lib/actions/habits'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HabitIconPicker } from './habit-icon-picker'
import { HabitColorPicker } from './habit-color-picker'
import type { FrequencyType } from '@/types/habit'

interface HabitFormProps {
  habit?: {
    id: string
    name: string
    icon: string
    color: string
    frequency_type: FrequencyType
    frequency_days: number[]
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function HabitForm({ habit, onSuccess, onCancel }: HabitFormProps) {
  const t = useTranslations('habits')
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(habit?.name ?? '')
  const [icon, setIcon] = useState(habit?.icon ?? '📌')
  const [color, setColor] = useState(habit?.color ?? '#6366f1')
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    habit?.frequency_type ?? 'daily',
  )
  const [frequencyDays, setFrequencyDays] = useState<number[]>(habit?.frequency_days ?? [])

  function handleDayToggle(day: number) {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const isEditing = !!habit

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: t('nameRequired') ?? 'Habit name is required', variant: 'error' })
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('icon', icon)
    formData.set('color', color)
    formData.set('frequencyType', frequencyType)
    formData.set('frequencyDays', JSON.stringify(frequencyDays))

    startTransition(async () => {
      const result = isEditing
        ? await updateHabit({ success: false, error: null }, formData)
        : await createHabit({ success: false, error: null }, formData)

      if (result.success) {
        toast({
          title: isEditing
            ? (t('habitUpdated') ?? 'Habit updated')
            : (t('habitCreated') ?? 'Habit created!'),
          variant: 'success',
        })
        onSuccess?.()
      } else {
        toast({ title: result.error ?? 'Error', variant: 'error' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          {t('habitName')}
        </label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('habitNamePlaceholder') ?? 'e.g. Morning run'}
          maxLength={50}
          required
        />
        {habit && <input type="hidden" name="habitId" value={habit.id} />}
      </div>

      {/* Icon */}
      <HabitIconPicker value={icon} onChange={setIcon} />

      {/* Color */}
      <HabitColorPicker value={color} onChange={setColor} />

      {/* Frequency */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('frequency')}</label>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'custom'] as FrequencyType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFrequencyType(type)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                frequencyType === type
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-accent'
              }`}
            >
              {t(type)}
            </button>
          ))}
        </div>

        {/* Day picker for weekly/custom */}
        {frequencyType !== 'daily' && (
          <div className="flex gap-1">
            {[
              { label: 'M', value: 1 },
              { label: 'T', value: 2 },
              { label: 'W', value: 3 },
              { label: 'T', value: 4 },
              { label: 'F', value: 5 },
              { label: 'S', value: 6 },
              { label: 'S', value: 0 },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDayToggle(value)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  frequencyDays.includes(value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending
            ? (t('saving') ?? 'Saving...')
            : isEditing
              ? (t('save') ?? 'Save')
              : t('addHabit')}
        </Button>
      </div>
    </form>
  )
}
