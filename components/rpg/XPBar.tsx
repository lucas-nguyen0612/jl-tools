import React, { type FC } from 'react'

interface XPBarProps {
  currentXP: number
  maxXP: number
  level: number
  compact?: boolean
  showLevel?: boolean
}

export const XPBar: FC<XPBarProps> = React.memo(function XPBar({ currentXP, maxXP, level, compact = false, showLevel = true }) {
  const pct = maxXP > 0 ? Math.min(100, (currentXP / maxXP) * 100) : 0
  const segments = 5
  const segmentWidth = 100 / segments

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{ height: 6, background: 'var(--jl-bg-sunken)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--jl-accent), var(--jl-accent-strong))',
            }}
          />
        </div>
        {showLevel && (
          <span
            className="text-xs font-mono tabular-nums"
            style={{ color: 'var(--jl-text-faint)', minWidth: 40 }}
          >
            Lv {level}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: 'var(--jl-text-faint)' }}>
        <span>
          {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div
        className="flex gap-px rounded-full overflow-hidden"
        style={{ height: 8, background: 'var(--jl-bg-sunken)' }}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const segStart = i * segmentWidth
          const fill = Math.max(0, Math.min(100, ((pct - segStart) / segmentWidth) * 100))
          return (
            <div key={i} className="flex-1 relative overflow-hidden">
              <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                  width: `${fill}%`,
                  background: 'linear-gradient(90deg, var(--jl-accent), var(--jl-accent-strong))',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})
