'use client'

import { type FC } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { getStreakTier } from '@/features/habits/types'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md'
}

const TIER_COLORS: Record<string, string> = {
  cold: '#6b7280',
  warm: '#f97316',
  hot: '#ef4444',
  blazing: '#8b5cf6',
}

export const StreakBadge: FC<StreakBadgeProps> = ({ streak, size = 'md' }) => {
  const t = useTranslations('habits.card')
  const tier = getStreakTier(streak)
  const color = TIER_COLORS[tier]
  const isSm = size === 'sm'

  return (
    <motion.div
      animate={streak > 0 ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-0.5"
      title={t('streakDays', { days: streak })}
      style={{
        fontSize: isSm ? 12 : 13,
        fontWeight: 600,
        color,
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: isSm ? 13 : 15 }}>🔥</span>
      <span>{streak}</span>
    </motion.div>
  )
}
