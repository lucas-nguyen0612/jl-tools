'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { useUpdateProfileMutation } from '@/hooks/useSettings'

interface DisplayNameFormProps {
  userId: string
  initialValue: string
}

type ProfileUpdateInput = { character_name: string }

export function DisplayNameForm({ userId, initialValue }: DisplayNameFormProps) {
  const t = useTranslations('settings.profile')
  const tErr = useTranslations('errors.validation')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const router = useRouter()
  const updateMutation = useUpdateProfileMutation(userId)

  const profileUpdateSchema = z.object({
    character_name: z
      .string()
      .transform((v) => v.trim())
      .transform((v) => v.replace(/[ -]/g, ''))
      .pipe(
        z
          .string()
          .min(2, tErr('fieldRequired'))
          .max(32, tErr('displayNameMaxLength')),
      ),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { character_name: initialValue },
  })

  async function onSubmit(data: ProfileUpdateInput) {
    setSuccessMessage(null)
    setServerError(null)

    const result = await updateMutation.mutateAsync(data)

    if (result.error) {
      setServerError(result.error.message)
    } else {
      setSuccessMessage(t('saved'))
      setTimeout(() => setSuccessMessage(null), 3000)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label
          htmlFor="character_name"
          style={{
            fontSize: 13,
            color: 'var(--jl-text-soft)',
            fontWeight: 500,
          }}
        >
          {t('displayNameLabel')}
        </label>

        <input
          id="character_name"
          type="text"
          autoComplete="nickname"
          placeholder={t('displayNamePlaceholder')}
          {...register('character_name')}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--jl-bg-sunken)',
            border: errors.character_name
              ? '1px solid var(--jl-destructive, #ef4444)'
              : '1px solid var(--jl-line-soft)',
            fontSize: 14,
            color: 'var(--jl-text)',
            outline: 'none',
            width: '100%',
          }}
        />

        {errors.character_name && (
          <p
            role="alert"
            style={{ fontSize: 12, color: 'var(--jl-destructive, #ef4444)', margin: 0 }}
          >
            {errors.character_name.message}
          </p>
        )}

        {serverError && (
          <p
            role="alert"
            style={{ fontSize: 12, color: 'var(--jl-destructive, #ef4444)', margin: 0 }}
          >
            {serverError}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            style={{ fontSize: 12, color: 'var(--jl-accent-ink)', margin: 0 }}
          >
            {successMessage}
          </p>
        )}

        <div>
          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </form>
  )
}
