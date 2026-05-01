'use client'
import { useEffect, useRef, useState } from 'react'
import { X, Volume2, VolumeX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { PomodoroTimer } from './PomodoroTimer'
import { TimerControls } from './TimerControls'
import { FocusTaskList } from './FocusTaskList'

interface FocusModeOverlayProps {
  onClose: () => void
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  isLeader?: boolean
}

const DESKTOP_BREAKPOINT = 1024

// Fixed vertical chrome on the pomodoro side (in px): top+bottom paddings (96),
// active-task block (~70), timer controls (~50), inter-element gaps (~40).
// Used to derive a timer size that always fits the viewport height.
const POMODORO_CHROME = 256

function clamp(value: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, value))
}

export function FocusModeOverlay({ onClose, onStart, onPause, onReset, onSkip, isLeader = true }: FocusModeOverlayProps) {
  const t = useTranslations('pomodoro')
  const phase = usePomodoroStore(s => s.phase)
  const timeLeft = usePomodoroStore(s => s.timeLeft)
  const isRunning = usePomodoroStore(s => s.isRunning)
  const settings = usePomodoroStore(s => s.settings)
  const activeTaskId = usePomodoroStore(s => s.activeTaskId)
  const tasks = usePomodoroStore(s => s.tasks)
  const updateSettings = usePomodoroStore(s => s.updateSettings)

  const activeTask = tasks.find(t => t.id === activeTaskId)

  const isMuted = settings.volume === 0
  const lastVolumeRef = useRef(settings.volume > 0 ? settings.volume : 0.5)
  useEffect(() => {
    if (settings.volume > 0) lastVolumeRef.current = settings.volume
  }, [settings.volume])

  function toggleMute() {
    updateSettings({ volume: isMuted ? lastVolumeRef.current || 0.5 : 0 })
  }

  // Track viewport so the timer can scale to always fit.
  const [vp, setVp] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  useEffect(() => {
    function update() {
      setVp({ w: window.innerWidth, h: window.innerHeight })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const isDesktop = vp.w >= DESKTOP_BREAKPOINT

  // Timer size is bounded by viewport height (after subtracting chrome) and, on desktop,
  // by half the viewport width (it must fit beside the tasks column).
  const heightBudget = vp.h ? vp.h - POMODORO_CHROME : 280
  const widthBudget = isDesktop ? vp.w / 2 - 120 : vp.w - 64
  const timerSize = clamp(Math.min(heightBudget, widthBudget), 180, 480)

  const totalDuration =
    phase === 'work'
      ? settings.workDuration
      : phase === 'short'
        ? settings.shortDuration
        : settings.longDuration

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const pomodoroSide = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        minHeight: 0,
        height: '100%',
      }}
    >
      <PomodoroTimer phase={phase} timeLeft={timeLeft} totalDuration={totalDuration} size={timerSize} />

      {activeTask ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--jl-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {t('timer.workingOn')}
          </div>
          <div style={{ fontSize: 22, fontFamily: 'var(--jl-font-display)', letterSpacing: '-0.02em' }}>
            {activeTask.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--jl-text-soft)', marginTop: 2 }}>
            {t('timer.pomodorosCount', { done: activeTask.pomodorosDone, total: activeTask.pomodorosEstimated })}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--jl-text-faint)', textAlign: 'center' }}>
          {isDesktop ? t('timer.noTaskDesktop') : t('timer.noTaskMobile')}
        </div>
      )}

      <TimerControls
        isRunning={isRunning}
        isLeader={isLeader}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onSkip={onSkip}
      />
    </div>
  )

  const tasksSide = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 0,
        width: '100%',
      }}
    >
      <FocusTaskList />
    </div>
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--jl-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 8,
          zIndex: 1,
        }}
      >
        <button
          onClick={toggleMute}
          aria-label={isMuted ? t('controls.unmuteSoundscape') : t('controls.muteSoundscape')}
          title={isMuted ? t('controls.unmute') : t('controls.mute')}
          style={{
            width: 32,
            height: 32,
            background: 'var(--jl-bg-raised)',
            border: `1px solid ${isMuted ? 'var(--jl-accent)' : 'var(--jl-line)'}`,
            borderRadius: 'var(--jl-r)',
            cursor: 'pointer',
            color: isMuted ? 'var(--jl-accent-ink)' : 'var(--jl-text-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button
          onClick={onClose}
          aria-label={t('controls.exitFocus')}
          style={{
            background: 'var(--jl-bg-raised)',
            border: '1px solid var(--jl-line)',
            borderRadius: 'var(--jl-r)',
            padding: '6px 14px',
            cursor: 'pointer',
            color: 'var(--jl-text-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            height: 32,
          }}
        >
          <X size={14} /> {t('controls.exitFocus')}
        </button>
      </div>

      {isDesktop ? (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 460px)',
            gap: 64,
            alignItems: 'stretch',
            padding: '64px 48px 32px',
            minHeight: 0,
          }}
        >
          {pomodoroSide}
          {tasksSide}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '64px 16px 16px',
            minHeight: 0,
          }}
        >
          {pomodoroSide}
          {tasksSide}
        </div>
      )}
    </div>
  )
}
