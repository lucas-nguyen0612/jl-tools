'use client'

import { useTranslations } from 'next-intl'
import type { Deck, FlashCard } from '@/features/flashcards/types'

interface DeckStatsProps {
  deck: Deck
  cards: FlashCard[]
}

export function DeckStats({ deck, cards }: DeckStatsProps) {
  const t = useTranslations('flashcards.stats.cardPool')

  const newCount = cards.filter(c => c.state === 'new').length
  const learningCount = cards.filter(c => c.state === 'learning').length
  const youngCount = cards.filter(c => c.state === 'young').length
  const matureCount = cards.filter(c => c.state === 'mature').length

  const stats = [
    { label: t('new'), count: newCount, color: 'var(--jl-info)' },
    { label: t('learning'), count: learningCount, color: 'var(--jl-warn)' },
    { label: t('young'), count: youngCount, color: 'var(--jl-accent-strong)' },
    { label: t('mature'), count: matureCount, color: 'var(--jl-success)' },
  ]

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--jl-bg-elevated)',
        border: '1px solid var(--jl-border)',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--jl-text)',
          marginBottom: 12,
        }}
      >
        {t('title', { deck: deck.name })}
      </div>

      <div className="flex flex-col gap-1">
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 0',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, flex: 1, color: 'var(--jl-text)' }}>{s.label}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--jl-text)',
              }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--jl-border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--jl-text-faint)',
        }}
      >
        <span>{t('totalCards')}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cards.length}</span>
      </div>
    </div>
  )
}
