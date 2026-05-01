'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateEmail } from '@/features/settings/account'

interface EmailChangeFormProps {
  currentEmail: string
}

type EmailUpdateInput = { new_email: string }

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const t = useTranslations('settings.account')
  const tErr = useTranslations('errors.validation')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const emailUpdateSchema = z.object({
    new_email: z.string().email(tErr('invalidEmail')),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailUpdateInput>({
    resolver: zodResolver(emailUpdateSchema),
  })

  const onSubmit = async (values: EmailUpdateInput) => {
    setServerError(null)
    setSentTo(null)

    if (values.new_email === currentEmail) {
      setServerError(t('newEmailDiffer'))
      return
    }

    const result = await updateEmail(values)
    if (result.error) {
      setServerError(result.error.message)
    } else {
      setSentTo(values.new_email)
      reset()
    }
  }

  if (sentTo) {
    return (
      <div
        role="status"
        style={{
          padding: '12px 16px',
          background: 'var(--jl-surface-alt, #f3f4f6)',
          borderRadius: 8,
          fontSize: 14,
          color: 'var(--jl-text)',
        }}
      >
        <strong>{t('emailSent', { email: sentTo })}</strong>{' '}
        {t('emailSentInstruction')}{' '}
        <button
          type="button"
          onClick={() => setSentTo(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--jl-accent)',
            cursor: 'pointer',
            padding: 0,
            fontSize: 14,
          }}
        >
          {t('changeAgain')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="new_email">{t('newEmailLabel')}</Label>
        <Input
          id="new_email"
          type="email"
          autoComplete="email"
          placeholder={t('newEmailPlaceholder')}
          aria-invalid={!!errors.new_email}
          {...register('new_email')}
        />
        {errors.new_email && (
          <p role="alert" style={{ fontSize: 12, color: 'var(--jl-danger, #ef4444)', margin: 0 }}>
            {errors.new_email.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" style={{ fontSize: 13, color: 'var(--jl-danger, #ef4444)', margin: 0 }}>
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
        {isSubmitting ? t('updatingEmail') : t('updateEmail')}
      </Button>
    </form>
  )
}
