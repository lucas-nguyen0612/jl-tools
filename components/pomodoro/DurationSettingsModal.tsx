'use client'

import { type FC, type ReactNode, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { usePomodoroStore } from '@/store/pomodoroStore'

// All values in MINUTES at the form layer; the store works in SECONDS, so we
// convert at the boundary.
//
// `valueAsNumber` on each input gives us a number directly from RHF, so the
// schema only needs to validate (no coercion). Keeping input/output types
// identical avoids the `Resolver<unknown, ..., number>` mismatch you get with
// `z.coerce.number()`.
const settingsSchema = z.object({
  workMinutes: z.number().int().min(1).max(120),
  shortMinutes: z.number().int().min(1).max(60),
  longMinutes: z.number().int().min(1).max(60),
  sessionsUntilLong: z.number().int().min(2).max(12),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

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

const triggerButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--jl-bg-sunken)',
  border: '1px solid var(--jl-line)',
  borderRadius: 'var(--jl-r)',
  cursor: 'pointer',
  color: 'var(--jl-text-soft)',
}

interface DurationSettingsModalProps {
  /** Optional custom trigger node. Defaults to a gear icon button. */
  trigger?: ReactNode
}

export const DurationSettingsModal: FC<DurationSettingsModalProps> = ({ trigger }) => {
  const t = useTranslations('pomodoro.settings')
  const tCommon = useTranslations('common')
  const settings = usePomodoroStore(s => s.settings)
  const updateSettings = usePomodoroStore(s => s.updateSettings)
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: 'onChange',
    defaultValues: {
      workMinutes: Math.round(settings.workDuration / 60),
      shortMinutes: Math.round(settings.shortDuration / 60),
      longMinutes: Math.round(settings.longDuration / 60),
      sessionsUntilLong: settings.sessionsUntilLong,
    },
  })

  // Re-seed the form whenever the modal opens so it reflects the latest store
  // values (e.g. updates from another tab).
  useEffect(() => {
    if (open) {
      reset({
        workMinutes: Math.round(settings.workDuration / 60),
        shortMinutes: Math.round(settings.shortDuration / 60),
        longMinutes: Math.round(settings.longDuration / 60),
        sessionsUntilLong: settings.sessionsUntilLong,
      })
    }
  }, [open, settings, reset])

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings({
      workDuration: values.workMinutes * 60,
      shortDuration: values.shortMinutes * 60,
      longDuration: values.longMinutes * 60,
      sessionsUntilLong: values.sessionsUntilLong,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button type="button" title={t('trigger')} style={triggerButtonStyle}>
            <Settings size={14} />
          </button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="duration-settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          <Field
            id="duration-work"
            label={t('durationFocus')}
            error={errors.workMinutes?.message}
          >
            <input
              id="duration-work"
              type="number"
              min={1}
              max={120}
              {...register('workMinutes', { valueAsNumber: true })}
              style={{
                ...inputStyle,
                borderColor: errors.workMinutes ? '#ef4444' : 'var(--jl-line)',
              }}
            />
          </Field>

          <Field
            id="duration-short"
            label={t('durationShortBreak')}
            error={errors.shortMinutes?.message}
          >
            <input
              id="duration-short"
              type="number"
              min={1}
              max={60}
              {...register('shortMinutes', { valueAsNumber: true })}
              style={{
                ...inputStyle,
                borderColor: errors.shortMinutes ? '#ef4444' : 'var(--jl-line)',
              }}
            />
          </Field>

          <Field
            id="duration-long"
            label={t('durationLongBreak')}
            error={errors.longMinutes?.message}
          >
            <input
              id="duration-long"
              type="number"
              min={1}
              max={60}
              {...register('longMinutes', { valueAsNumber: true })}
              style={{
                ...inputStyle,
                borderColor: errors.longMinutes ? '#ef4444' : 'var(--jl-line)',
              }}
            />
          </Field>

          <Field
            id="duration-cycles"
            label={t('sessionsBeforeLongBreak')}
            error={errors.sessionsUntilLong?.message}
          >
            <input
              id="duration-cycles"
              type="number"
              min={2}
              max={12}
              {...register('sessionsUntilLong', { valueAsNumber: true })}
              style={{
                ...inputStyle,
                borderColor: errors.sessionsUntilLong ? '#ef4444' : 'var(--jl-line)',
              }}
            />
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="duration-settings-form"
            disabled={!isValid}
            style={{ background: 'var(--jl-accent-strong)', color: '#fff', border: 'none' }}
          >
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

const Field: FC<FieldProps> = ({ id, label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <span style={{ color: '#ef4444', fontSize: 12 }}>{error}</span>}
  </div>
)
