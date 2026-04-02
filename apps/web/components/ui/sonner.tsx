'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

let toastListeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function emitChange() {
  toastListeners.forEach((listener) => listener([...toasts]))
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { ...props, id }]
  emitChange()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emitChange()
  }, props.duration ?? 4000)
}

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const variantStyles = {
    default: 'bg-surface-1 border-border',
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
  }

  return (
    <div
      className={`animate-in slide-in-from-right pointer-events-auto flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${variantStyles[t.variant ?? 'default']}`}
      role="alert"
    >
      <div className="flex-1">
        {t.title && <p className="text-foreground text-sm font-medium">{t.title}</p>}
        {t.description && <p className="text-muted-foreground mt-1 text-xs">{t.description}</p>}
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    toastListeners.push(setCurrentToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts)
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed right-4 bottom-4 z-[100] flex flex-col gap-2" aria-live="polite">
      {currentToasts.map((t) => (
        <ToastItem
          key={t.id}
          toast={t}
          onRemove={() => {
            toasts = toasts.filter((x) => x.id !== t.id)
            emitChange()
          }}
        />
      ))}
    </div>,
    document.body,
  )
}
