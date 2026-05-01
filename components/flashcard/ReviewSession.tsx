'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useFlashcardStore } from '@/store/flashcardStore'
import { useSubmitReview, useDecks } from '@/hooks/useFlashcards'
import { useUserStore } from '@/store/userStore'
import { CardFlip } from './CardFlip'
import { RatingButtons } from './RatingButtons'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'
import type { Rating } from '@/lib/sm2/algorithm'

export function ReviewSession() {
  const t = useTranslations('flashcards.review')
  const tTally = useTranslations('flashcards.ratingsTally')
  const router = useRouter()
  const {
    phase,
    queue,
    currentIndex,
    isFlipped,
    results,
    summary,
    flipCard,
    rateCard,
    resetSession,
  } = useFlashcardStore()

  const submitReview = useSubmitReview()
  const { data: decks } = useDecks()
  const addXP = useUserStore(s => s.addXP)
  const applyServerResult = useFlashcardStore(s => s.applyServerResult)
  const undoLastRating = useFlashcardStore(s => s.undoLastRating)

  const currentCard = queue[currentIndex]
  const currentDeck = currentCard ? decks?.find(d => d.id === currentCard.deck_id) : undefined

  useEffect(() => {
    if (phase === 'complete' && results.length > 0) {
      submitReview.mutate(results, {
        onSuccess: (result) => {
          if (!result) return
          applyServerResult({
            xpAwarded: result.xpAwarded,
            sessionBonusAwarded: result.sessionBonusAwarded,
            failedCount: result.failed.length,
          })
          if (result.xpAwarded > 0) addXP(result.xpAwarded)
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handleRate = (rating: Rating) => {
    rateCard(rating)
  }

  const handleRestart = () => {
    resetSession()
    router.refresh()
  }

  const handleBack = () => {
    resetSession()
    router.back()
  }

  if (phase === 'complete' && summary) {
    return (
      <SessionSummary
        summary={summary}
        onRestart={handleRestart}
        onBack={handleBack}
        submitState={
          submitReview.isPending ? 'pending' : submitReview.isError ? 'error' : 'success'
        }
        submitError={submitReview.error?.message ?? null}
      />
    )
  }

  if (!currentCard) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--jl-text-faint)', padding: 40 }}>
        {t('noCards')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
      <SessionProgress current={currentIndex} total={queue.length} />

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--jl-text-soft)',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={undoLastRating}
          disabled={results.length === 0}
          title={results.length === 0 ? t('undoNothing') : t('undoHint')}
          style={{
            marginRight: 'auto',
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--jl-border)',
            background: 'transparent',
            color: results.length === 0 ? 'var(--jl-text-faint)' : 'var(--jl-text-soft)',
            cursor: results.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: 11,
            opacity: results.length === 0 ? 0.5 : 1,
          }}
        >
          ↶ {t('undo')}
        </button>
        {[
          { key: 'again' as const, color: 'var(--jl-danger)', count: results.filter(r => r.rating === 0).length },
          { key: 'hard' as const, color: 'var(--jl-warn)', count: results.filter(r => r.rating === 1).length },
          { key: 'good' as const, color: 'var(--jl-success)', count: results.filter(r => r.rating === 2).length },
          { key: 'easy' as const, color: 'var(--jl-info)', count: results.filter(r => r.rating === 3).length },
        ].map(item => (
          <span key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0,
              }}
            />
            {item.count} {tTally(item.key)}
          </span>
        ))}
      </div>

      <CardFlip
        front={currentCard.front}
        back={currentCard.back}
        isFlipped={isFlipped}
        onFlip={flipCard}
        deckName={currentDeck?.name}
        tags={currentCard.tags}
      />

      <RatingButtons
        onRate={handleRate}
        currentCard={currentCard}
        isFlipped={isFlipped}
      />
    </div>
  )
}
