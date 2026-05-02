'use client'
import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TopBar } from '@/components/layout/TopBar'
import { hydratePomodoroFromDb, usePomodoroStore } from '@/store/pomodoroStore'
import { useTimer } from '@/hooks/useTimer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePomodoroSync } from '@/hooks/usePomodoroSync'
import { useSoundscapePlayer } from '@/hooks/useSoundscapePlayer'
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer'
import { ModeSelector } from '@/components/pomodoro/ModeSelector'
import { TimerControls } from '@/components/pomodoro/TimerControls'
import { SessionDots } from '@/components/pomodoro/SessionDots'
import { FocusModeOverlay } from '@/components/pomodoro/FocusModeOverlay'
import { TaskList } from '@/components/pomodoro/TaskList'
import { SoundscapeSelector } from '@/components/pomodoro/SoundscapeSelector'
import { DurationSettingsModal } from '@/components/pomodoro/DurationSettingsModal'
import { XPTickerPanel } from '@/components/pomodoro/XPTickerPanel'
import { SessionHistoryChart } from '@/components/pomodoro/SessionHistoryChart'
import { ToolErrorBoundary } from '@/components/errors/ToolErrorBoundary'
import { onAppEvent } from '@/lib/events'
import { PomodoroCalendarToast } from '@/components/calendar/PomodoroCalendarToast'

const cardStyle: React.CSSProperties = {
  background: 'var(--jl-bg-raised)',
  border: '1px solid var(--jl-line-soft)',
  borderRadius: 'var(--jl-r-lg)',
  padding: 'var(--jl-p)',
}

export default function PomodoroPage() {
  const t = useTranslations('pomodoro')

  // Leader election: only the leader tab runs the RAF timer loop.
  const { isLeader, claimLeadership } = usePomodoroSync()
  useTimer({ enabled: isLeader })
  useSoundscapePlayer()
  useDocumentTitle()

  // Hydrate tasks + settings from DB once on mount
  useEffect(() => {
    hydratePomodoroFromDb().catch(err =>
      console.error('[pomodoro] hydration failed:', err)
    )
  }, [])

  const phase = usePomodoroStore(s => s.phase)
  const timeLeft = usePomodoroStore(s => s.timeLeft)
  const isRunning = usePomodoroStore(s => s.isRunning)
  const sessionCount = usePomodoroStore(s => s.sessionCount)
  const tasks = usePomodoroStore(s => s.tasks)
  const activeTaskId = usePomodoroStore(s => s.activeTaskId)
  const settings = usePomodoroStore(s => s.settings)
  const startTimer = usePomodoroStore(s => s.startTimer)
  const pauseTimer = usePomodoroStore(s => s.pauseTimer)
  const resetTimer = usePomodoroStore(s => s.resetTimer)
  const skipPhase = usePomodoroStore(s => s.skipPhase)

  const activeTask = tasks.find(t => t.id === activeTaskId) ?? null

  const totalDuration =
    phase === 'work'
      ? settings.workDuration
      : phase === 'short'
        ? settings.shortDuration
        : settings.longDuration

  const [focusMode, setFocusMode] = useState(false)

  // Any explicit timer interaction claims leadership so this tab becomes the sole runner.
  // Focus mode is opened only on the tab where the user clicks — never via sync.
  function handleStart() {
    claimLeadership()
    startTimer()
    if (phase === 'work') setFocusMode(true)
  }

  function handlePause() {
    claimLeadership()
    pauseTimer()
  }

  function handleReset() {
    claimLeadership()
    resetTimer()
  }

  function handleSkip() {
    claimLeadership()
    skipPhase()
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ') {
        e.preventDefault()
        claimLeadership()
        if (isRunning) {
          pauseTimer()
        } else {
          startTimer()
          if (phase === 'work') setFocusMode(true)
        }
      }
      if (e.key === 'r' || e.key === 'R') { claimLeadership(); resetTimer() }
      if (e.key === 'f' || e.key === 'F') setFocusMode(m => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRunning, phase, claimLeadership, startTimer, pauseTimer, resetTimer])

  // Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Desktop notification when session completes
  useEffect(() => {
    return onAppEvent('jl:xp-gain', () => {
      if (Notification.permission === 'granted') {
        new Notification(t('session.completeNotificationTitle'), {
          body: t('session.completeNotificationBody'),
          icon: '/favicon.ico',
        })
      }
    })
  }, [t])

  // Phase selector handler
  function handlePhaseSelect(p: 'work' | 'short' | 'long') {
    pauseTimer()
    usePomodoroStore.setState({
      phase: p,
      timeLeft:
        p === 'work'
          ? settings.workDuration
          : p === 'short'
            ? settings.shortDuration
            : settings.longDuration,
      isRunning: false,
    })
  }

  return (
    <ToolErrorBoundary toolName="Pomodoro">
      <PomodoroCalendarToast />

      {focusMode && (
        <FocusModeOverlay
          onClose={() => setFocusMode(false)}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSkip={handleSkip}
          isLeader={isLeader}
        />
      )}

      <div className="flex flex-col h-full">
        <TopBar
          title={t('title')}
          subtitle={t('subtitle')}
          rightSlot={
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setFocusMode(m => !m)}
                title={t('controls.focusModeHint')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 32,
                  padding: '0 12px',
                  background: focusMode ? 'var(--jl-accent-soft)' : 'var(--jl-bg-sunken)',
                  border: `1px solid ${focusMode ? 'var(--jl-accent)' : 'var(--jl-line)'}`,
                  borderRadius: 'var(--jl-r)',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: focusMode ? 'var(--jl-accent-ink)' : 'var(--jl-text-soft)',
                  fontWeight: 500,
                }}
              >
                <Target size={13} />
                {t('controls.focusModeToggle')}
              </button>

              <DurationSettingsModal />
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-jl pb-10">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-[22px]">

            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Timer card */}
              <div style={cardStyle}>
                <div className="flex flex-col items-center xl:grid xl:grid-cols-[auto_1fr]" style={{ gap: 36, alignItems: 'center' }}>
                  {/* Circular timer */}
                  <PomodoroTimer phase={phase} timeLeft={timeLeft} totalDuration={totalDuration} />

                  {/* Right side of timer card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <ModeSelector
                      phase={phase}
                      onSelect={handlePhaseSelect}
                      disabled={isRunning}
                      durations={{
                        work: settings.workDuration,
                        short: settings.shortDuration,
                        long: settings.longDuration,
                      }}
                    />

                    {/* Active task display */}
                    {activeTask ? (
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--jl-text-faint)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 6,
                          }}
                        >
                          {t('timer.workingOn')}
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontFamily: 'var(--jl-font-display)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {activeTask.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--jl-text-soft)', marginTop: 4 }}>
                          {t('timer.pomodorosCount', { done: activeTask.pomodorosDone, total: activeTask.pomodorosEstimated })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: 'var(--jl-text-faint)' }}>
                        {t('timer.noTaskSelected')}
                      </div>
                    )}

                    <TimerControls
                      isRunning={isRunning}
                      isLeader={isLeader}
                      onStart={handleStart}
                      onPause={handlePause}
                      onReset={handleReset}
                      onSkip={handleSkip}
                    />

                    <SessionDots
                      sessionCount={sessionCount % settings.sessionsUntilLong}
                      total={settings.sessionsUntilLong}
                      xpEarned={sessionCount * 10}
                    />

                    {/* Keyboard hint */}
                    <div style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>
                      <kbd style={{ padding: '1px 5px', background: 'var(--jl-bg-sunken)', borderRadius: 3, border: '1px solid var(--jl-line)', fontSize: 10 }}>Space</kbd>{' '}
                      <kbd style={{ padding: '1px 5px', background: 'var(--jl-bg-sunken)', borderRadius: 3, border: '1px solid var(--jl-line)', fontSize: 10 }}>R</kbd>{' '}
                      <kbd style={{ padding: '1px 5px', background: 'var(--jl-bg-sunken)', borderRadius: 3, border: '1px solid var(--jl-line)', fontSize: 10 }}>F</kbd>{' '}
                      {t('timer.shortcutsHint')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task list card */}
              <div style={cardStyle}>
                <TaskList />
              </div>
            </div>

            {/* ── Right column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Soundscape */}
              <div style={cardStyle}>
                <SoundscapeSelector />
              </div>

              {/* XP Ticker */}
              <div style={cardStyle}>
                <XPTickerPanel />
              </div>

              {/* Session History */}
              <div style={cardStyle}>
                <SessionHistoryChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolErrorBoundary>
  )
}
