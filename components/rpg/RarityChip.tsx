import { type FC } from 'react'

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
  mythic: 'Mythic',
}

interface RarityChipProps {
  rarity: Rarity
}

export const RarityChip: FC<RarityChipProps> = ({ rarity }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 'var(--jl-r-sm)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: `var(--jl-${rarity})`,
      background: `color-mix(in oklch, var(--jl-${rarity}) 15%, transparent)`,
      border: `1px solid color-mix(in oklch, var(--jl-${rarity}) 30%, transparent)`,
    }}
  >
    {RARITY_LABELS[rarity]}
  </span>
)
