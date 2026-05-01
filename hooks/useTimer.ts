'use client'
import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '@/store/pomodoroStore'

export function useTimer({ enabled = true }: { enabled?: boolean } = {}) {
  const isRunning = usePomodoroStore(s => s.isRunning)
  const tick = usePomodoroStore(s => s.tick)

  // RAF-based 1-second ticker — only runs on the leader tab
  const lastTickRef = useRef<number>(Date.now())
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isRunning || !enabled) {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      return
    }
    lastTickRef.current = Date.now()

    function loop() {
      const now = Date.now()
      if (now - lastTickRef.current >= 1000) {
        tick()
        lastTickRef.current = now
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [isRunning, tick, enabled])

  // Tab visibility: catch up ticks missed while hidden — only on leader tab
  const hiddenAtRef = useRef<number | null>(null)
  useEffect(() => {
    if (!enabled) return
    function onHide() {
      if (document.hidden && usePomodoroStore.getState().isRunning) {
        hiddenAtRef.current = Date.now()
      }
    }
    function onShow() {
      if (!document.hidden && hiddenAtRef.current !== null) {
        const missedSeconds = Math.floor((Date.now() - hiddenAtRef.current) / 1000)
        hiddenAtRef.current = null
        if (missedSeconds > 0 && usePomodoroStore.getState().isRunning) {
          const store = usePomodoroStore.getState()
          const newTimeLeft = Math.max(0, store.timeLeft - missedSeconds)
          if (newTimeLeft !== store.timeLeft) {
            usePomodoroStore.setState({ timeLeft: newTimeLeft })
            // If time ran out while hidden, complete the session
            if (newTimeLeft === 0) store.tick()
          }
        }
      }
    }
    document.addEventListener('visibilitychange', onHide)
    document.addEventListener('visibilitychange', onShow)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [enabled])
}
