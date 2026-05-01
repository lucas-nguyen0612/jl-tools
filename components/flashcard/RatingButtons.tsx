'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { getIntervalLabelForCard } from '@/lib/sm2/algorithm'
import type { Rating } from '@/lib/sm2/algorithm'
import type { FlashCard } from '@/features/flashcards/types'

interface RatingButtonsProps {
  onRate: (rating: Rating) => void
  currentCard: FlashCard
  isFlipped: boolean
}

const RATING_CONFIGS: {
  ratingKey: 'again' | 'hard' | 'good' | 'easy'
  rating: Rating
  key: string
  color: string
  bg: string
  border: string
  xp: number
}[] = [
  {
    ratingKey: 'again',
    rating: 0,
    key: '1',
    color: 'var(--jl-danger)',
    bg: 'color-mix(in oklch, var(--jl-danger) 12%, var(--jl-bg-elevated))',
    border: 'color-mix(in oklch, var(--jl-danger) 40%, transparent)',
    xp: 0,
  },
  {
    ratingKey: 'hard',
    rating: 1,
    key: '2',
    color: 'var(--jl-warn)',
    bg: 'color-mix(in oklch, var(--jl-warn) 12%, var(--jl-bg-elevated))',
    border: 'color-mix(in oklch, var(--jl-warn) 40%, transparent)',
    xp: 1,
  },
  {
    ratingKey: 'good',
    rating: 2,
    key: '3',
    color: 'var(--jl-success)',
    bg: 'color-mix(in oklch, var(--jl-success) 12%, var(--jl-bg-elevated))',
    border: 'color-mix(in oklch, var(--jl-success) 40%, transparent)',
    xp: 2,
  },
  {
    ratingKey: 'easy',
    rating: 3,
    key: '4',
    color: 'var(--jl-info)',
    bg: 'color-mix(in oklch, var(--jl-info) 12%, var(--jl-bg-elevated))',
    border: 'color-mix(in oklch, var(--jl-info) 40%, transparent)',
    xp: 3,
  },
]

export function RatingButtons({ onRate, currentCard, isFlipped }: RatingButtonsProps) {
  const t = useTranslations('flashcards.review')

  useEffect(() => {
    if (!isFlipped) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === '1') onRate(0)
      else if (e.key === '2') onRate(1)
      else if (e.key === '3') onRate(2)
      else if (e.key === '4') onRate(3)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFlipped, onRate])

  const sm2Card = {
    ease_factor: currentCard.ease_factor,
    interval: currentCard.interval,
    repetitions: currentCard.repetitions,
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}
    >
      {RATING_CONFIGS.map(r => {
        const nextLabel = getIntervalLabelForCard(r.rating, sm2Card)
        return (
          <button
            key={r.ratingKey}
            onClick={() => onRate(r.rating)}
            disabled={!isFlipped}
            style={{
              padding: '14px 10px',
              borderRadius: 12,
              border: `1px solid ${isFlipped ? r.border : 'var(--jl-border)'}`,
              background: isFlipped ? r.bg : 'var(--jl-bg-sunken)',
              color: isFlipped ? r.color : 'var(--jl-text-faint)',
              cursor: isFlipped ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s',
              opacity: isFlipped ? 1 : 0.5,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600 }}>{t(`rating.${r.ratingKey}`)}</div>
            <div style={{ fontSize: 10, color: 'var(--jl-text-faint)' }}>{t('nextLabel', { label: nextLabel })}</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 4,
                fontSize: 10,
              }}
            >
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: 4,
                  border: '1px solid var(--jl-border)',
                  background: 'var(--jl-bg-elevated)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--jl-text-soft)',
                }}
              >
                {r.key}
              </span>
              <span>{t('xpReward', { xp: r.xp })}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
