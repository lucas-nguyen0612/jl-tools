'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { savePomodoroSettings } from '@/lib/actions/pomodoro'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/sonner'
import type { PomodoroSettings } from '@/types/pomodoro'

interface PomodoroSettingsFormProps {
  initialSettings: PomodoroSettings
}

export function PomodoroSettingsForm({ initialSettings }: PomodoroSettingsFormProps) {
  const t = useTranslations('pomodoro')
  const [isPending, startTransition] = useTransition()

  const [focusDuration, setFocusDuration] = useState(initialSettings.focusDuration)
  const [shortBreakDuration, setShortBreakDuration] = useState(initialSettings.shortBreakDuration)
  const [longBreakDuration, setLongBreakDuration] = useState(initialSettings.longBreakDuration)
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    initialSettings.sessionsBeforeLongBreak,
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await savePomodoroSettings({ success: false, error: null }, formData)
      if (result.success) {
        toast({ title: t('settingsSaved') ?? 'Settings saved', variant: 'success' })
      } else {
        toast({ title: result.error ?? 'Error', variant: 'error' })
      }
    })
  }

  // Slider with label
  function SliderField({
    name,
    label,
    value,
    min,
    max,
    step = 1,
    unit = 'min',
    onChange,
  }: {
    name: string
    label: string
    value: number
    min: number
    max: number
    step?: number
    unit?: string
    onChange: (v: number) => void
  }) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="text-sm font-medium">
            {label}
          </label>
          <span className="text-primary text-sm font-semibold tabular-nums">
            {value} {unit}
          </span>
        </div>
        <input
          type="range"
          id={name}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="accent-primary w-full cursor-pointer"
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>
            {min} {unit}
          </span>
          <span>
            {max} {unit}
          </span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SliderField
            name="focusDuration"
            label={t('focusDuration')}
            value={focusDuration}
            min={5}
            max={90}
            step={5}
            onChange={setFocusDuration}
          />
          <SliderField
            name="shortBreakDuration"
            label={t('shortBreakDuration')}
            value={shortBreakDuration}
            min={1}
            max={15}
            step={1}
            onChange={setShortBreakDuration}
          />
          <SliderField
            name="longBreakDuration"
            label={t('longBreakDuration')}
            value={longBreakDuration}
            min={5}
            max={30}
            step={5}
            onChange={setLongBreakDuration}
          />
          <SliderField
            name="sessionsBeforeLongBreak"
            label={t('sessionsBeforeLongBreak')}
            value={sessionsBeforeLongBreak}
            min={2}
            max={8}
            step={1}
            unit=""
            onChange={setSessionsBeforeLongBreak}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (t('saving') ?? 'Saving...') : (t('save') ?? 'Save')}
      </Button>
    </form>
  )
}
