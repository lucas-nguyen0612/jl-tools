'use client'
import { useEffect } from 'react'
import { usePomodoroStore } from '@/store/pomodoroStore'

export function useTimer({ enabled = true }: { enabled?: boolean } = {}) {
  const isRunning = usePomodoroStore(s => s.isRunning)
  const tick = usePomodoroStore(s => s.tick)

  // setInterval continues firing in background tabs (unlike requestAnimationFrame)
  useEffect(() => {
    if (!isRunning || !enabled) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isRunning, tick, enabled])
}
