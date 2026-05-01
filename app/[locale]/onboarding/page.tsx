'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-map'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [characterName, setCharacterName] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goals = [
    { id: 'learning', label: t('onboarding.step2.goalLearning'), emoji: '📚' },
    { id: 'work', label: t('onboarding.step2.goalWork'), emoji: '💼' },
    { id: 'habits', label: t('onboarding.step2.goalHabits'), emoji: '✅' },
    { id: 'memory', label: t('onboarding.step2.goalMemory'), emoji: '🧠' },
  ]

  const tools = [
    {
      id: 'pomodoro',
      label: t('onboarding.step3.pomodoroTitle'),
      desc: t('onboarding.step3.pomodoroDesc'),
      emoji: '🍅',
      href: '/pomodoro' as const,
    },
    {
      id: 'habits',
      label: t('onboarding.step3.habitsTitle'),
      desc: t('onboarding.step3.habitsDesc'),
      emoji: '🔥',
      href: '/habits' as const,
    },
    {
      id: 'flashcards',
      label: t('onboarding.step3.flashcardsTitle'),
      desc: t('onboarding.step3.flashcardsDesc'),
      emoji: '📇',
      href: '/flashcards' as const,
    },
  ]

  function toggleGoal(id: string) {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  async function selectTool(toolId: string, href: '/pomodoro' | '/habits' | '/flashcards') {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        character_name: characterName.trim() || t('onboarding.step1.namePlaceholder'),
        goals: selectedGoals,
        first_tool: toolId,
        onboarding_completed: true,
      })
      .eq('user_id', user.id)

    if (error) {
      setError(t(mapAuthError(error)))
      setLoading(false)
    } else {
      router.push(href)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-xl space-y-6"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      >
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{ background: s <= step ? 'var(--neon-green)' : 'var(--bg-elevated)' }}
            />
          ))}
        </div>

        {/* Step 1: Character name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('onboarding.step1.title')}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('onboarding.step1.subtitle')}
              </p>
            </div>
            <input
              type="text"
              placeholder={t('onboarding.step1.namePlaceholder')}
              value={characterName}
              onChange={e => setCharacterName(e.target.value)}
              maxLength={32}
              className="w-full px-3.5 py-2.5 rounded-lg text-base outline-none"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
              }}
            />
            <Button
              onClick={() => setStep(2)}
              className="w-full"
              style={{ background: 'var(--neon-green)', color: '#0a0a0f', fontWeight: 600 }}
            >
              {t('onboarding.step1.continue')}
            </Button>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('onboarding.step2.title')}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('onboarding.step2.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {goals.map(goal => {
                const selected = selectedGoals.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className="p-4 rounded-lg text-left transition-colors"
                    style={{
                      border: `2px solid ${selected ? 'var(--neon-green)' : 'rgba(255,255,255,0.12)'}`,
                      background: selected ? 'rgba(0,255,136,0.1)' : 'var(--bg-tertiary)',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="text-2xl">{goal.emoji}</div>
                    <div className="font-medium text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                      {goal.label}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                {t('onboarding.step2.back')}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedGoals.length === 0}
                className="flex-1"
                style={{ background: 'var(--neon-green)', color: '#0a0a0f', fontWeight: 600 }}
              >
                {t('onboarding.step2.continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: First tool */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('onboarding.step3.title')}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('onboarding.step3.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool.id, tool.href)}
                  disabled={loading}
                  className="w-full p-4 rounded-lg text-left flex items-center gap-3.5 transition-colors hover:opacity-90"
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'var(--bg-tertiary)',
                    cursor: 'pointer',
                  }}
                >
                  <span className="text-3xl">{tool.emoji}</span>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{tool.label}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tool.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            {error && (
              <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            )}
            <Button variant="outline" onClick={() => setStep(2)} className="w-full">
              {t('onboarding.step3.back')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
