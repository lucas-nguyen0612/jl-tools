'use client'
import { useEffect, useState } from 'react'
import { Zap, Coffee } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { onAppEvent } from '@/lib/events'
import { usePomodoroStore } from '@/store/pomodoroStore'

interface XPEntry {
  id: number
  amount: number
  ts: number
}

export function XPTickerPanel() {
  const t = useTranslations('pomodoro.xpTicker')
  const [entries, setEntries] = useState<XPEntry[]>([])
  const [totalSession, setTotalSession] = useState(0)
  const phase = usePomodoroStore(s => s.phase)
  const isBreak = phase !== 'work'

  useEffect(() => {
    let counter = 0
    return onAppEvent('jl:xp-gain', ({ amount }) => {
      setTotalSession(prev => prev + amount)
      setEntries(prev => [
        { id: counter++, amount, ts: Date.now() },
        ...prev.slice(0, 4),
      ])
    })
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Zap size={14} color="var(--jl-text-faint)" />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--jl-text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {t('title')}
        </span>
        {totalSession > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--jl-accent)',
            }}
          >
            {t('totalToday', { xp: totalSession })}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {entries.map(entry => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid var(--jl-line-soft)',
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--jl-text-soft)' }}>{t('focusComplete')}</span>
            <span style={{ fontWeight: 700, color: 'var(--jl-accent)' }}>+{entry.amount} XP</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '14px 0 10px',
            fontSize: 12,
            color: 'var(--jl-text-faint)',
            textAlign: 'center',
          }}
        >
          {isBreak ? (
            <>
              <Coffee size={18} color="var(--jl-text-faint)" />
              <div style={{ fontWeight: 600, color: 'var(--jl-text-soft)' }}>
                {t('breakNoXp')}
              </div>
              <div>{t('switchToFocus')}</div>
            </>
          ) : (
            <div>{t('earnHint')}</div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--jl-line-soft)',
          fontSize: 11,
          color: 'var(--jl-text-faint)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {t('footnote')}
      </div>
    </div>
  )
}
