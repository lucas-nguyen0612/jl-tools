import { type ReactNode } from 'react'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'

interface TopBarProps {
  title: string
  subtitle?: string
  rightSlot?: ReactNode
}

export function TopBar({ title, subtitle, rightSlot }: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--jl-line)',
        background: 'var(--jl-bg)',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--jl-font-display)',
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--jl-text)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--jl-text-soft)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {rightSlot}
        <LocaleSwitcher />
      </div>
    </div>
  )
}
