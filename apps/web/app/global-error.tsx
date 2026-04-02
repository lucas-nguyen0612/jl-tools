'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="text-8xl">⚠️</div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold transition-colors"
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  )
}
