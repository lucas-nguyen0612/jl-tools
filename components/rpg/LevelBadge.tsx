import { type FC } from 'react'

interface LevelBadgeProps {
  level: number
  size?: number
}

export const LevelBadge: FC<LevelBadgeProps> = ({ level, size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--jl-accent-strong)',
      color: 'white',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--jl-font-display)',
      fontWeight: 600,
      fontSize: size * 0.42,
      letterSpacing: '-0.02em',
      border: '2px solid var(--jl-bg-raised)',
      flexShrink: 0,
    }}
  >
    {level}
  </div>
)
