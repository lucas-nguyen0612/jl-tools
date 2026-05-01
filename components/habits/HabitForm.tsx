'use client'

import { type FC, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  type HabitFormValues,
  type HabitWithStatus,
} from '@/features/habits/types'

const HABIT_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]

interface HabitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: HabitFormValues) => Promise<void>
  initialValues?: Partial<HabitWithStatus>
  isLoading: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--jl-line)',
  background: 'var(--jl-bg-sunken)',
  color: 'var(--jl-text)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
}

export const HabitForm: FC<HabitFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  isLoading,
}) => {
  const t = useTranslations('habits.form')
  const tCat = useTranslations('habits.categories')
  const tTime = useTranslations('habits.timeOfDay')
  const tErrors = useTranslations('errors.validation')
  const tCommon = useTranslations('common')
  const isEditing = !!initialValues?.id

  const habitSchema = z.object({
    name: z.string().min(1, tErrors('nameRequired')).max(100, tErrors('nameTooLong')),
    category: z.enum(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'other']),
    time_of_day: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
    color: z.string(),
    target_days: z.array(z.number()).default([]),
    reminder_time: z.string().nullable().default(null),
  })

  const HABIT_CATEGORIES_I18N = [
    { value: 'health', label: tCat('health') },
    { value: 'fitness', label: tCat('fitness') },
    { value: 'learning', label: tCat('learning') },
    { value: 'productivity', label: tCat('productivity') },
    { value: 'mindfulness', label: tCat('mindfulness') },
    { value: 'other', label: tCat('other') },
  ] as const

  const TIME_OF_DAY_OPTIONS_I18N = [
    { value: 'morning', label: tTime('morning') },
    { value: 'afternoon', label: tTime('afternoon') },
    { value: 'evening', label: tTime('evening') },
    { value: 'anytime', label: tTime('anytime') },
  ] as const

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      category: 'health',
      time_of_day: 'anytime',
      color: '#3b82f6',
      target_days: [],
      reminder_time: null,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name ?? '',
        category: (initialValues?.category as HabitFormValues['category']) ?? 'health',
        time_of_day: (initialValues?.time_of_day as HabitFormValues['time_of_day']) ?? 'anytime',
        color: initialValues?.color ?? '#3b82f6',
        target_days: initialValues?.target_days ?? [],
        reminder_time: initialValues?.reminder_time ?? null,
      })
    }
  }, [open, initialValues, reset])

  const selectedColor = watch('color')
  const targetDays = watch('target_days')

  const toggleDay = (dayVal: number) => {
    const current = targetDays ?? []
    if (current.includes(dayVal)) {
      setValue('target_days', current.filter(d => d !== dayVal))
    } else {
      setValue('target_days', [...current, dayVal])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('titleEdit') : t('titleNew')}</DialogTitle>
        </DialogHeader>

        <form id="habit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-name">{t('nameLabel')}</Label>
            <input
              id="habit-name"
              type="text"
              placeholder={t('namePlaceholder')}
              {...register('name')}
              style={{
                ...inputStyle,
                borderColor: errors.name ? '#ef4444' : 'var(--jl-line)',
              }}
            />
            {errors.name && (
              <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.name.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-category">{t('categoryLabel')}</Label>
            <select id="habit-category" {...register('category')} style={inputStyle}>
              {HABIT_CATEGORIES_I18N.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-time">{t('timeOfDayLabel')}</Label>
            <select id="habit-time" {...register('time_of_day')} style={inputStyle}>
              {TIME_OF_DAY_OPTIONS_I18N.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('colorLabel')}</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {HABIT_COLOR_PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c,
                        border: selectedColor === c ? '3px solid var(--jl-text)' : '2px solid transparent',
                        cursor: 'pointer',
                        outline: 'none',
                        flexShrink: 0,
                      }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              {t('targetDaysLabel')}{' '}
              <span style={{ color: 'var(--jl-text-soft)', fontWeight: 400, fontSize: 12 }}>
                {t('targetDaysHint')}
              </span>
            </Label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((label, i) => {
                const dayVal = DAY_VALUES[i]
                const active = (targetDays ?? []).includes(dayVal)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(dayVal)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'background 0.15s, color 0.15s',
                      background: active ? selectedColor : 'var(--jl-bg-sunken)',
                      color: active ? '#fff' : 'var(--jl-text-soft)',
                      border: active ? 'none' : '1px solid var(--jl-line)',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-reminder">
              {t('reminderLabel')}
            </Label>
            <input
              id="habit-reminder"
              type="time"
              {...register('reminder_time')}
              style={{ ...inputStyle, colorScheme: 'light dark' }}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="habit-form"
            disabled={isLoading}
            style={{ background: 'var(--jl-accent-strong)', color: '#fff', border: 'none' }}
          >
            {isLoading ? tCommon('saving') : isEditing ? t('save') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
