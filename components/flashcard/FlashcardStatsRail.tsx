'use client'

import type { ReactElement } from 'react'
import { Sparkline } from '@/components/rpg/Sparkline'
import { DeckStats } from '@/components/flashcard/DeckStats'
import { ForecastChart } from '@/components/flashcard/ForecastChart'
import {
  useDecks,
  useDeckCards,
  useRetentionStats,
} from '@/hooks/useFlashcards'

interface FlashcardStatsRailProps {
  deckId: string | null
}

export function FlashcardStatsRail({ deckId }: FlashcardStatsRailProps): ReactElement {
  const { data: retention, isLoading: retentionLoading } = useRetentionStats(deckId)
  const { data: cards } = useDeckCards(deckId ?? '')
  const { data: decks } = useDecks()

  if (deckId === null) {
    return (
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          className="jl-card"
          style={{
            padding: 16,
            textAlign: 'center',
            color: 'var(--jl-text-faint)',
            fontSize: 13,
          }}
        >
          Select a deck to see stats
        </div>
      </aside>
    )
  }

  const selectedDeck = decks?.find((d) => d.id === deckId) ?? null
  const hasRetention = !retentionLoading && retention !== undefined
  const youngPct = hasRetention ? retention.youngRetentionPct : null
  const maturePct = hasRetention ? retention.matureRetentionPct : null
  const sparklineData = hasRetention ? retention.sparklineData : []
  const reviewDaysCovered = hasRetention ? retention.reviewDaysCovered : 0

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* A. Retention */}
      <div className="jl-card" style={{ padding: 16 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          Retention
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div
              className="jl-display jl-tnum"
              style={{
                fontSize: 30,
                lineHeight: 1,
                color: youngPct === null ? 'var(--jl-text-faint)' : undefined,
              }}
            >
              {youngPct !== null ? `${youngPct}%` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--jl-text-soft)' }}>
              young · &lt;21 days
            </div>
          </div>
          <div>
            <div
              className="jl-display jl-tnum"
              style={{
                fontSize: 30,
                lineHeight: 1,
                color: maturePct === null ? 'var(--jl-text-faint)' : undefined,
              }}
            >
              {maturePct !== null ? `${maturePct}%` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--jl-text-soft)' }}>
              mature · 21+ days
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, minHeight: 38, display: 'flex', alignItems: 'center' }}>
          {reviewDaysCovered >= 2 ? (
            <Sparkline
              data={sparklineData}
              width={260}
              height={38}
              color="var(--jl-accent)"
            />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>
              {reviewDaysCovered === 0
                ? 'Review your first card to see retention'
                : 'One more day of review to draw your trend'}
            </span>
          )}
        </div>
      </div>

      {/* B. Card pool */}
      {selectedDeck && cards ? <DeckStats deck={selectedDeck} cards={cards} /> : null}

      {/* C. Forecast */}
      {cards ? <ForecastChart cards={cards} /> : null}
    </aside>
  )
}
