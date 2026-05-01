'use client'

import { type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface CheckInButtonProps {
  checked: boolean
  loading: boolean
  color: string
  onToggle: () => void
}

export const CheckInButton: FC<CheckInButtonProps> = ({
  checked,
  loading,
  color,
  onToggle,
}) => {
  const t = useTranslations('habits.checkIn')

  return (
    <motion.button
      onClick={onToggle}
      disabled={loading}
      whileTap={{ scale: 0.88 }}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: checked ? 'none' : `2px solid ${color}`,
        background: checked ? color : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
        flexShrink: 0,
        transition: 'background 0.2s, border 0.2s',
        outline: 'none',
      }}
      aria-label={checked ? t('uncheckAria') : t('checkAria')}
    >
      <AnimatePresence mode="wait">
        {checked && (
          <motion.svg
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
          >
            <polyline
              points="3,8 6.5,12 13,4"
              stroke="white"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
        {loading && !checked && (
          <motion.span
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: 14,
              height: 14,
              border: `2px solid ${color}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.button>
  )
}
