'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer'
import { useAuth } from '@/components/providers/auth-provider'
import { grantXP } from '@/lib/actions/xp'
import { createClient } from '@/lib/supabase/client'
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer'
import { PomodoroControls } from '@/components/pomodoro/pomodoro-controls'
import { LevelUpModal } from '@/components/gamification/level-up-modal'
import { toast } from '@/components/ui/sonner'
import { XP_SOURCES } from '@/lib/constants/levels'

const XP_PER_SESSION = XP_SOURCES.POMODORO_COMPLETE

interface PomodoroAppProps {
  locale: string
}

export function PomodoroApp({ locale }: PomodoroAppProps) {
  const t = useTranslations('pomodoro')
  const { profile, refreshProfile } = useAuth()
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [newLevel, setNewLevel] = useState(1)

  const { state, start, pause, resume, skip, cancel } = usePomodoroTimer()

  // Track the previous status to detect transitions
  const prevStatusRef = useRef(state.status)
  const prevPhaseRef = useRef(state.phase)
  const phaseJustCompletedRef = useRef(false)

  const totalSeconds =
    state.phase === 'focus'
      ? state.settings.focusDuration * 60
      : state.phase === 'shortBreak'
        ? state.settings.shortBreakDuration * 60
        : state.settings.longBreakDuration * 60

  // Detect completion: when status becomes "completed" from "running"
  useEffect(() => {
    if (
      prevStatusRef.current === 'running' &&
      state.status === 'completed' &&
      prevPhaseRef.current === 'focus'
    ) {
      phaseJustCompletedRef.current = true
    }
    prevStatusRef.current = state.status
    prevPhaseRef.current = state.phase
  }, [state.status, state.phase])

  // Handle focus session completion → grant XP
  const handleSessionComplete = useCallback(
    async (durationSeconds: number) => {
      if (!profile?.id) return

      const result = await grantXP({
        userId: profile.id,
        amount: XP_PER_SESSION,
        source: 'pomodoro',
        wasSession: true,
        sessionDurationSeconds: durationSeconds,
      })

      if (result.success) {
        await refreshProfile()
        toast({
          title: t('sessionComplete'),
          description: `+${result.xpGranted} XP`,
          variant: 'success',
        })
        if (result.leveledUp) {
          setNewLevel(result.newLevel)
          setLevelUpOpen(true)
        }
      } else if (result.error) {
        // Only show error toast if it's not a cooldown/abuse prevention msg
        if (!result.error.includes('cooldown') && !result.error.includes('cap')) {
          toast({ title: result.error, variant: 'error' })
        }
      }
    },
    [profile?.id, refreshProfile, t],
  )

  // Save completed session to DB
  const saveSession = useCallback(
    async (durationSeconds: number, xpEarned: number) => {
      if (!profile?.id) return
      const supabase = createClient()
      await supabase.from('pomodoro_sessions').insert({
        user_id: profile.id,
        duration_minutes: Math.floor(durationSeconds / 60),
        status: 'completed',
        started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
      })
    },
    [profile?.id],
  )

  // Watch for completion → grant XP + save to DB
  useEffect(() => {
    if (!phaseJustCompletedRef.current) return
    phaseJustCompletedRef.current = false

    // Only grant XP for completed focus sessions
    const duration = state.phase === 'focus' ? state.settings.focusDuration * 60 : 0

    handleSessionComplete(duration)
    saveSession(duration, XP_PER_SESSION)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.phase])

  function handleStart() {
    start()
  }

  function handlePause() {
    pause()
  }

  function handleResume() {
    resume()
  }

  function handleSkip() {
    skip()
  }

  function handleCancel() {
    cancel()
  }

  // Phase buttons
  function handlePhaseChange(phase: 'focus' | 'shortBreak' | 'longBreak') {
    if (state.status !== 'idle') return
    skip()
  }

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <PomodoroTimer
          secondsRemaining={state.secondsRemaining}
          totalSeconds={totalSeconds}
          phase={state.phase}
          status={state.status}
          onPhaseChange={handlePhaseChange}
        />

        <div className="mt-8">
          <PomodoroControls
            status={state.status}
            sessionsCompleted={state.sessionsCompleted}
            totalSessionsToday={state.totalSessionsToday}
            xpPreview={XP_PER_SESSION}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onSkip={handleSkip}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* XP preview */}
      {state.status === 'idle' && state.phase === 'focus' && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm dark:bg-amber-950/20">
          <span className="text-amber-500">⚡</span>
          <span className="text-amber-700 dark:text-amber-400">
            +{XP_PER_SESSION} XP {t('xpPreview', { xp: XP_PER_SESSION })}
          </span>
        </div>
      )}

      {/* Level up modal */}
      <LevelUpModal
        open={levelUpOpen}
        newLevel={newLevel}
        locale={locale}
        onClose={() => setLevelUpOpen(false)}
      />
    </div>
  )
}
