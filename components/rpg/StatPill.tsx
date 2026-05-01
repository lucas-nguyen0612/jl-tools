import { type FC, type ReactNode } from 'react'

interface StatPillProps {
  icon: ReactNode
  label: string
  value: string | number
}

export const StatPill: FC<StatPillProps> = ({ icon, label, value }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 'var(--jl-r)',
      background: 'var(--jl-bg-sunken)',
      border: '1px solid var(--jl-line-soft)',
      fontSize: 13,
    }}
  >
    <span style={{ color: 'var(--jl-accent)' }}>{icon}</span>
    <span style={{ color: 'var(--jl-text-soft)' }}>{label}</span>
    <span style={{ color: 'var(--jl-text)', fontWeight: 600, fontFamily: 'var(--jl-font-mono)' }}>
      {value}
    </span>
  </div>
)
