'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ReviewSession } from '@/components/flashcard/ReviewSession'
import { useFlashcardStore } from '@/store/flashcardStore'
import { useDueCards, useDecks } from '@/hooks/useFlashcards'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudyPage() {
  const t = useTranslations('flashcards')
  const tEmpty = useTranslations('flashcards.empty')
  const tSidebar = useTranslations('flashcards.sidebar')
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const deckId = params.deckId as string

  const { data: dueCards, isLoading } = useDueCards(deckId)
  const { data: decks } = useDecks()
  const { startSession, phase, currentDeckId } = useFlashcardStore()

  const deck = decks?.find(d => d.id === deckId)

  useEffect(() => {
    if (!dueCards || dueCards.length === 0) return
    if (phase === 'idle' || currentDeckId !== deckId) {
      startSession(deckId, dueCards)
    }
  }, [dueCards, deckId, phase, currentDeckId, startSession])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Study" subtitle={tCommon('loading')} />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <Skeleton className="h-8 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const hasDue = dueCards && dueCards.length > 0

  if (!hasDue && phase === 'idle') {
    return (
      <div className="flex flex-col h-full">
        <TopBar
          title={deck?.name ?? 'Study'}
          subtitle={tSidebar('allCaughtUp')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-4 max-w-sm w-full"
            style={{
              background: 'var(--jl-bg-elevated)',
              border: '1px solid var(--jl-border)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48 }}>🎉</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--jl-text)', margin: 0 }}>
              {tEmpty('studyEmpty')}
            </p>
            <p style={{ fontSize: 13, color: 'var(--jl-text-faint)', margin: 0 }}>
              {tEmpty('nextReview', { count: deck?.due_count ?? 0 })}
            </p>
            <button
              onClick={() => router.back()}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'var(--jl-accent-strong)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              {t('review.backToDecks')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={deck?.name ?? 'Study'}
        subtitle={t('deck.dueCount', { count: dueCards?.length ?? 0 })}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <ReviewSession />
      </div>
    </div>
  )
}
