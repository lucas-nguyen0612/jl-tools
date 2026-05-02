'use client'

import { useEffect, useRef } from 'react'

export type CalendarShortcutHandlers = {
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  onView: (view: 'day' | 'week' | 'month') => void
  onNew: () => void
}

export function useCalendarShortcuts(
  handlers: CalendarShortcutHandlers,
  enabled: boolean,
): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const active = document.activeElement
      if (active) {
        const tag = active.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        if (active.getAttribute('contenteditable') === 'true') return
      }

      const h = handlersRef.current

      if (e.key === 'ArrowLeft') {
        h.onPrev()
        return
      }
      if (e.key === 'ArrowRight') {
        h.onNext()
        return
      }

      const key = e.key.toLowerCase()
      switch (key) {
        case 't':
          h.onToday()
          break
        case '1':
          h.onView('day')
          break
        case '2':
          h.onView('week')
          break
        case '3':
          h.onView('month')
          break
        case 'n':
          h.onNew()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
