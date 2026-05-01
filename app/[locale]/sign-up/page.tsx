'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignupPage() {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const schema = z
    .object({
      email: z.string().email(t('errors.validation.invalidEmail')),
      password: z.string().min(8, t('errors.validation.passwordMin8')),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('errors.validation.passwordMismatch'),
      path: ['confirmPassword'],
    })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setError(t(mapAuthError(error)))
      setLoading(false)
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto relative h-28 w-28 overflow-hidden rounded-2xl">
              <Image
                src="/logo.png"
                alt={t('app.name')}
                fill
                sizes="112px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <CardTitle className="text-2xl">{t('auth.signUp.title')}</CardTitle>
            <CardDescription>{t('auth.signUp.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('auth.signUp.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.signUp.emailPlaceholder')}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{t('auth.signUp.passwordLabel')}</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('auth.signUp.confirmPasswordLabel')}</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t('auth.signUp.submitting') : t('auth.signUp.submit')}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('auth.signUp.haveAccountText')}{' '}
              <Link
                href="/sign-in"
                className="font-medium underline underline-offset-4 hover:text-foreground"
              >
                {t('auth.signUp.signInLink')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
