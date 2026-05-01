'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { onAppEvent } from '@/lib/events'

interface XPGain {
  id: string
  amount: number
}

export function XPGainOverlay() {
  const [gains, setGains] = useState<XPGain[]>([])

  useEffect(() => {
    return onAppEvent('jl:xp-gain', ({ amount }) => {
      const gain: XPGain = { id: crypto.randomUUID(), amount }
      setGains(prev => [...prev, gain])
      setTimeout(() => {
        setGains(prev => prev.filter(g => g.id !== gain.id))
      }, 1800)
    })
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
      }}
    >
      <AnimatePresence>
        {gains.map(gain => (
          <motion.div
            key={gain.id}
            initial={{ opacity: 0, y: 0, x: 20 }}
            animate={{ opacity: 1, y: -8, x: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--jl-r)',
              background: 'var(--jl-accent-strong)',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'var(--jl-font-display)',
              boxShadow: 'var(--jl-shadow)',
            }}
          >
            +{gain.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
