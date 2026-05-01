'use client'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface QueryErrorBoundaryProps {
  children: ReactNode
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <InnerErrorBoundary reset={reset}>
          {children}
        </InnerErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

import React from 'react'

interface InnerProps {
  children: ReactNode
  reset: () => void
}

interface InnerState {
  hasError: boolean
  error?: Error
}

class InnerErrorBoundary extends React.Component<InnerProps, InnerState> {
  constructor(props: InnerProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): InnerState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[QueryErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
          <AlertTriangle size={32} style={{ color: 'var(--jl-danger)' }} />
          <p className="text-sm" style={{ color: 'var(--jl-text-soft)' }}>
            Failed to load data
          </p>
          <button
            onClick={() => {
              this.props.reset()
              this.setState({ hasError: false, error: undefined })
            }}
            className="py-2 px-4 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
            style={{
              background: 'var(--jl-accent-strong)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
