'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  toolName: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ToolErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ToolErrorBoundary] Error in ${this.props.toolName}:`, error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development'
      return (
        <div className="flex flex-col h-full items-center justify-center p-4">
          <div
            className="rounded-xl p-4 max-w-md w-full text-center space-y-4"
            style={{
              background: 'var(--jl-bg-raised)',
              border: '1px solid var(--jl-line)',
            }}
          >
            <div className="flex justify-center">
              <AlertTriangle
                size={40}
                style={{ color: 'var(--jl-danger)' }}
              />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--jl-text)' }}
            >
              Something went wrong with {this.props.toolName}
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--jl-text-soft)' }}
            >
              {isDev && this.state.error?.message
                ? this.state.error.message
                : 'Please refresh the page'}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2 px-4 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
              style={{
                background: 'var(--jl-accent-strong)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
