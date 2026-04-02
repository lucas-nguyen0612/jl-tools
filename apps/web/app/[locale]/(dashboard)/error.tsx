'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl">😕</div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-sm">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-2 text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
