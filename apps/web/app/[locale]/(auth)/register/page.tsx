'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const params = useParams()
  const locale = (params.locale as string) ?? 'en'
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string

    startTransition(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        await supabase.from('profiles').update({ display_name: displayName }).eq('id', data.user.id)
        window.location.href = `/${locale}/onboarding`
      }
    })
  }

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">JL-Tools</h1>
          <p className="text-muted-foreground text-sm">{t('signUp')}</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <GoogleSignInButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="displayName">{t('displayName')}</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Nguyen Van A"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" loading={isPending}>
                {t('signUp')}
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                {t('bySigningUp')} {t('termsOfService')} {t('and')} {t('privacyPolicy')}
              </p>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
