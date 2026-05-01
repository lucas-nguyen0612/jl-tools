'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import type { XPTransaction } from '@/types/rpg'

function getRelativeTimeKey(dateStr: string): { key: 'justNow' | 'minutesAgo' | 'hoursAgo' | 'yesterday' | 'daysAgo'; params?: Record<string, number> } {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return { key: 'justNow' }
  if (diff < 3600) return { key: 'minutesAgo', params: { minutes: Math.floor(diff / 60) } }
  if (diff < 86400) return { key: 'hoursAgo', params: { hours: Math.floor(diff / 3600) } }
  if (diff < 172800) return { key: 'yesterday' }
  return { key: 'daysAgo', params: { days: Math.floor(diff / 86400) } }
}

const SOURCE_ICON: Record<string, string> = {
  pomodoro: '⏱',
  habit: '🔥',
  flashcard: '🧠',
  quest: '⚔',
  streak: '🏆',
  bonus: '✨',
}

const SOURCE_COLOR: Record<string, string> = {
  pomodoro: 'var(--jl-accent-strong)',
  habit: 'var(--jl-danger, #ef4444)',
  flashcard: 'var(--jl-success, #22c55e)',
  quest: 'var(--jl-accent)',
  streak: 'var(--jl-legendary, #f59e0b)',
  bonus: 'var(--jl-epic, #a855f7)',
}

interface ActivityTimelineProps {
  transactions: XPTransaction[]
}

export const ActivityTimeline: FC<ActivityTimelineProps> = ({ transactions }) => {
  const t = useTranslations('character.activity')

  if (transactions.length === 0) {
    return (
      <div
        className="rounded-2xl"
        style={{
          background: 'var(--jl-bg-raised)',
          border: '1px solid var(--jl-line)',
          padding: 16,
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
          {t('title')}
        </h2>
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0',
            color: 'var(--jl-text-faint)',
            fontSize: 13,
          }}
        >
          {t('empty')}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
        {t('title')}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {transactions.slice(0, 20).map((tx, i) => {
          const icon = SOURCE_ICON[tx.source] ?? '⭐'
          const color = SOURCE_COLOR[tx.source] ?? 'var(--jl-accent-strong)'
          const isLast = i === Math.min(transactions.length, 20) - 1
          const { key, params } = getRelativeTimeKey(tx.created_at)

          return (
            <div
              key={tx.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: isLast ? 'none' : '1px dashed var(--jl-line-soft, var(--jl-line))',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `color-mix(in oklch, ${color} 18%, var(--jl-bg-raised))`,
                  color,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
              <span style={{ fontSize: 13, color: 'var(--jl-text)' }}>{tx.description}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 6,
                    background: 'color-mix(in oklch, var(--jl-legendary, #f59e0b) 18%, var(--jl-bg-raised))',
                    color: 'var(--jl-legendary, #f59e0b)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('xpAmount', { xp: tx.amount })}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--jl-text-faint)',
                    fontFamily: 'var(--jl-font-mono)',
                  }}
                >
                  {params ? t(key, params) : t(key)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
