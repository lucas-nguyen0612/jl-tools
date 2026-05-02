'use client'
import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '@/store/pomodoroStore'

function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

const PHASE_LABEL: Record<'work' | 'short' | 'long', string> = {
  work: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
}

export function useDocumentTitle() {
  const isRunning = usePomodoroStore(s => s.isRunning)
  const timeLeft = usePomodoroStore(s => s.timeLeft)
  const phase = usePomodoroStore(s => s.phase)
  const originalTitleRef = useRef('')

  useEffect(() => {
    originalTitleRef.current = document.title
    return () => {
      document.title = originalTitleRef.current
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} · ${PHASE_LABEL[phase]}`
    } else {
      document.title = originalTitleRef.current
    }
  }, [isRunning, timeLeft, phase])
}
