'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/features/settings/account'

type SuccessState = {
  passwordUpdated: boolean
  signedOutOtherDevices: boolean
}

type PasswordUpdateInput = {
  current_password: string
  new_password: string
  confirm_password: string
}

export function PasswordChangeForm() {
  const t = useTranslations('settings.account')
  const tErr = useTranslations('errors.validation')
  const [success, setSuccess] = useState<SuccessState | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const passwordUpdateSchema = z
    .object({
      current_password: z.string().min(8, tErr('passwordMin8')),
      new_password: z.string().min(8, tErr('passwordMin8')),
      confirm_password: z.string().min(8, tErr('passwordMin8')),
    })
    .refine((data) => data.new_password !== data.current_password, {
      message: tErr('passwordMismatch'),
      path: ['new_password'],
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: tErr('passwordMismatch'),
      path: ['confirm_password'],
    })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordUpdateInput>({
    resolver: zodResolver(passwordUpdateSchema),
  })

  const onSubmit = async (values: PasswordUpdateInput) => {
    setServerError(null)
    setSuccess(null)

    const result = await updatePassword(values)
    if (result.error) {
      if (result.error.code === 'INVALID_CREDENTIALS') {
        setError('current_password', {
          type: 'server',
          message: t('currentPasswordIncorrect'),
        })
      } else {
        setServerError(result.error.message)
      }
    } else {
      setSuccess({ passwordUpdated: true, signedOutOtherDevices: true })
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="current_password">{t('currentPasswordLabel')}</Label>
        <Input
          id="current_password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.current_password}
          {...register('current_password')}
        />
        {errors.current_password && (
          <p role="alert" style={{ fontSize: 12, color: 'var(--jl-danger, #ef4444)', margin: 0 }}>
            {errors.current_password.message}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="new_password">{t('newPasswordLabel')}</Label>
        <Input
          id="new_password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.new_password}
          {...register('new_password')}
        />
        {errors.new_password && (
          <p role="alert" style={{ fontSize: 12, color: 'var(--jl-danger, #ef4444)', margin: 0 }}>
            {errors.new_password.message}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="confirm_password">{t('confirmPasswordLabel')}</Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirm_password}
          {...register('confirm_password')}
        />
        {errors.confirm_password && (
          <p role="alert" style={{ fontSize: 12, color: 'var(--jl-danger, #ef4444)', margin: 0 }}>
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" style={{ fontSize: 13, color: 'var(--jl-danger, #ef4444)', margin: 0 }}>
          {serverError}
        </p>
      )}

      {success && (
        <div
          role="status"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '10px 14px',
            background: 'var(--jl-surface-alt, #f3f4f6)',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <span>{t('passwordUpdated')}</span>
          <span style={{ color: 'var(--jl-text-soft)' }}>
            {t('signedOutOtherDevices')}
          </span>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
        {isSubmitting ? t('updatingPassword') : t('updatePassword')}
      </Button>
    </form>
  )
}
