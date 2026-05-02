'use client'

import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TimerControlsProps {
  isRunning: boolean
  isLeader?: boolean
  sessionJustCompleted?: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onStartBreak?: () => void
}

const iconButtonStyle: React.CSSProperties = {
  height: 46,
  width: 46,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--jl-bg-sunken)',
  border: '1px solid var(--jl-line)',
  borderRadius: 'var(--jl-r)',
  cursor: 'pointer',
  color: 'var(--jl-text-soft)',
  flexShrink: 0,
}

const disabledIconButtonStyle: React.CSSProperties = {
  ...iconButtonStyle,
  opacity: 0.4,
  cursor: 'not-allowed',
}

export function TimerControls({
  isRunning,
  isLeader = true,
  sessionJustCompleted = false,
  onStart,
  onPause,
  onReset,
  onSkip,
  onStartBreak,
}: TimerControlsProps) {
  const t = useTranslations('pomodoro.controls')
  const followerTip = t('followerTabDisabled')

  function handlePrimaryClick() {
    if (sessionJustCompleted) {
      onStartBreak?.()
    } else if (isRunning) {
      onPause()
    } else {
      onStart()
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Primary Start / Pause / Start Break button */}
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span captures hover even when button is disabled */}
            <span style={{ display: 'inline-flex' }}>
              <button
                onClick={isLeader ? handlePrimaryClick : undefined}
                disabled={!isLeader}
                style={{
                  height: 46,
                  padding: '0 22px',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isLeader
                    ? sessionJustCompleted
                      ? 'var(--jl-success, #22c55e)'
                      : 'var(--jl-accent-strong)'
                    : 'var(--jl-bg-sunken)',
                  color: isLeader ? 'white' : 'var(--jl-text-faint)',
                  border: isLeader ? 'none' : '1px solid var(--jl-line)',
                  borderRadius: 'var(--jl-r)',
                  cursor: isLeader ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  opacity: isLeader ? 1 : 0.5,
                  transition: 'background 0.2s, opacity 0.15s',
                }}
              >
                {isRunning ? (
                  <>
                    <Pause size={15} />
                    {t('pause')}
                  </>
                ) : sessionJustCompleted ? (
                  <>
                    <Play size={15} />
                    {t('startBreak')}
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    {t('start')}
                  </>
                )}
              </button>
            </span>
          </TooltipTrigger>
          {!isLeader && (
            <TooltipContent side="top">{followerTip}</TooltipContent>
          )}
        </Tooltip>

        {/* Reset button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span style={{ display: 'inline-flex' }}>
              <button
                onClick={isLeader ? onReset : undefined}
                disabled={!isLeader}
                aria-label={t('reset')}
                style={isLeader ? iconButtonStyle : disabledIconButtonStyle}
              >
                <RotateCcw size={14} />
              </button>
            </span>
          </TooltipTrigger>
          {!isLeader && (
            <TooltipContent side="top">{followerTip}</TooltipContent>
          )}
        </Tooltip>

        {/* Skip button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span style={{ display: 'inline-flex' }}>
              <button
                onClick={isLeader ? onSkip : undefined}
                disabled={!isLeader}
                aria-label={t('skip')}
                style={isLeader ? iconButtonStyle : disabledIconButtonStyle}
              >
                <SkipForward size={14} />
              </button>
            </span>
          </TooltipTrigger>
          {!isLeader && (
            <TooltipContent side="top">{followerTip}</TooltipContent>
          )}
        </Tooltip>

      </div>
    </TooltipProvider>
  )
}
