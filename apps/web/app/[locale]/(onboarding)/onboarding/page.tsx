'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Sparkles, Timer, CheckSquare, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/components/providers/auth-provider'
import { updateProfile } from '@/lib/actions/profile'

const AVATARS = ['🎯', '🚀', '💪', '🧠', '⚡', '🔥', '🌟', '🎮']

export default function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('onboarding')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { profile, loading, refreshProfile } = useAuth()
  const [locale, setLocale] = useState('en')
  const [step, setStep] = useState(0)
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    params.then(({ locale: l }) => setLocale(l))
  }, [params])

  // Redirect users who already completed onboarding
  useEffect(() => {
    if (profile && profile.onboarding_completed) {
      router.replace(`/${locale}/dashboard`)
    }
  }, [profile, locale, router])

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !profile) {
      router.replace(`/${locale}/login`)
    }
  }, [profile, loading, locale, router])

  const totalSteps = 3

  async function handleFinish() {
    setSaving(true)
    if (selectedAvatar || displayName) {
      const formData = new FormData()
      formData.set('displayName', displayName || profile?.display_name || 'Player')
      formData.set('locale', locale)
      formData.set('theme', 'system')
      formData.set('avatarUrl', selectedAvatar)
      formData.set('onboardingCompleted', 'true')
      await updateProfile({ success: false, error: null }, formData)
      await refreshProfile()
    }
    router.push(`/${locale}/dashboard`)
  }

  const steps = [
    // Step 0: Avatar + name
    <div key="step-0" className="space-y-6 text-center">
      <div className="space-y-2">
        <Sparkles className="text-primary mx-auto h-10 w-10" />
        <h2 className="text-2xl font-bold">{t('welcome')}</h2>
        <p className="text-muted-foreground">{t('pickAvatar')}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {AVATARS.map((avatar) => (
          <button
            key={avatar}
            onClick={() => setSelectedAvatar(avatar)}
            className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition-all ${
              selectedAvatar === avatar
                ? 'bg-primary text-primary-foreground ring-primary scale-105 ring-2'
                : 'bg-muted hover:bg-accent scale-100'
            }`}
            aria-label={`Select avatar ${avatar}`}
            aria-pressed={selectedAvatar === avatar}
          >
            {avatar}
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Pomodoro intro
    <div key="step-1" className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950">
        <Timer className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t('pomodoroIntro').split('.')[0]}</h2>
        <p className="text-muted-foreground leading-relaxed">{t('pomodoroIntro')}</p>
      </div>
    </div>,

    // Step 2: Habits intro
    <div key="step-2" className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
        <CheckSquare className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t('habitsIntro').split('.')[0]}</h2>
        <p className="text-muted-foreground leading-relaxed">{t('habitsIntro')}</p>
      </div>
    </div>,
  ]

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardContent className="pt-8 pb-8">
          {/* Progress dots */}
          <div
            className="mb-8 flex justify-center gap-2"
            role="tablist"
            aria-label="Onboarding progress"
          >
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                role="tab"
                aria-selected={i === step}
                aria-label={`Step ${i + 1} of ${totalSteps}`}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'bg-primary w-8' : 'bg-muted w-2'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div role="tabpanel">{steps[step]}</div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                {tCommon('back')}
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1 gap-2">
                {tCommon('next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="flex-1 gap-2" disabled={saving}>
                {saving ? tCommon('saving') : t('startJourney')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {step < totalSteps - 1 && (
        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="text-muted-foreground hover:text-foreground mt-6 text-sm transition-colors"
        >
          {t('skip')}
        </button>
      )}
    </div>
  )
}
