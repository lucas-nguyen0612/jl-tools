import { type FC } from 'react'
import Image from 'next/image'
import { getAvatarSrc, isExternalAvatar } from '@/lib/avatar'

type Tier = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'

function getTier(level: number): Tier {
  if (level >= 50) return 'mythic'
  if (level >= 30) return 'legendary'
  if (level >= 15) return 'rare'
  if (level >= 5) return 'uncommon'
  return 'common'
}

interface AvatarProps {
  level?: number
  size?: number
  avatarUrl?: string | null
}

export const Avatar: FC<AvatarProps> = ({ level = 1, size = 72, avatarUrl }) => {
  const tier = getTier(level)
  const tierColor = `var(--jl-${tier})`
  const glow = tier === 'mythic' || tier === 'legendary'
  const imageSrc = getAvatarSrc(avatarUrl)

  return (
    <div
      style={{
        width: size,
        height: size,
        boxSizing: 'border-box',
        position: 'relative',
        borderRadius: '50%',
        border: `2px solid ${tierColor}`,
        boxShadow: glow
          ? `0 0 0 4px color-mix(in oklch, ${tierColor} 20%, transparent), 0 0 28px color-mix(in oklch, ${tierColor} 30%, transparent)`
          : 'var(--jl-shadow-sm)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Image
        src={imageSrc}
        alt="avatar"
        width={size * 2}
        height={size * 2}
        quality={90}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          // Hint browsers to use high-quality interpolation when downscaling
          // large source images (chiefly noticeable for legacy avatars uploaded
          // before client-side resize was introduced).
          imageRendering: 'auto',
        }}
        unoptimized={isExternalAvatar(imageSrc)}
      />
      {(tier === 'legendary' || tier === 'mythic') && (
        <svg
          style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
          width={size * 0.36}
          height={size * 0.22}
          viewBox="0 0 36 22"
        >
          <path
            d="M2 20 L6 6 L12 14 L18 2 L24 14 L30 6 L34 20 Z"
            fill={tierColor}
            stroke="var(--jl-bg)"
            strokeWidth="1.2"
          />
        </svg>
      )}
    </div>
  )
}
