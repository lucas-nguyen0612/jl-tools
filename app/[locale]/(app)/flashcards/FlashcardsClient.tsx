'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Plus, Play } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { FlashcardSidebar } from '@/components/flashcard/FlashcardSidebar'
import { FlashcardStatsRail } from '@/components/flashcard/FlashcardStatsRail'
import { ReviewSession } from '@/components/flashcard/ReviewSession'
import { DeckEditor } from '@/components/flashcard/DeckEditor'
import { CardEditor } from '@/components/flashcard/CardEditor'
import { useDecks, useDueCards, useAllDueCount } from '@/hooks/useFlashcards'
import { useFlashcardStore } from '@/store/flashcardStore'
import { fetchAllDueCards } from '@/features/flashcards/actions'

const ALL_DECKS_SENTINEL = '__all_decks__'

export function FlashcardsClient() {
  const t = useTranslations('flashcards')
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null)
  const [cardEditorOpen, setCardEditorOpen] = useState(false)
  const [studyAllLoading, setStudyAllLoading] = useState(false)

  const { data: decks } = useDecks()
  const { data: dueCards } = useDueCards(selectedDeckId ?? '')
  const { data: dueCount } = useAllDueCount()
  const { startSession, resetSession, phase, currentDeckId } = useFlashcardStore()

  // Auto-select the first deck with due cards (or the first deck) so the stats
  // rail has something to render. Session start stays explicit — see the
  // "Start review" button in the center pane below.
  useEffect(() => {
    if (selectedDeckId !== null) return
    if (!decks || decks.length === 0) return

    const withDue = decks.filter(d => d.due_count > 0)
    if (withDue.length > 0) {
      const best = withDue.reduce((a, b) => (b.due_count > a.due_count ? b : a))
      setSelectedDeckId(best.id)
    } else {
      setSelectedDeckId(decks[0].id)
    }
  }, [decks, selectedDeckId])

  const handleSelectDeck = (deckId: string) => {
    if (deckId === selectedDeckId && currentDeckId !== ALL_DECKS_SENTINEL) return
    resetSession()
    setSelectedDeckId(deckId)
  }

  const handleStartReview = () => {
    if (!selectedDeckId || !dueCards || dueCards.length === 0) return
    resetSession()
    startSession(selectedDeckId, dueCards)
  }

  const handleEditDeck = (deckId: string) => {
    setEditingDeckId(deckId)
    setEditorOpen(true)
  }

  const handleStudyAll = async () => {
    if (studyAllLoading) return
    setStudyAllLoading(true)
    try {
      const result = await fetchAllDueCards()
      if (result.error || !result.data || result.data.length === 0) return
      resetSession()
      startSession(ALL_DECKS_SENTINEL, result.data)
    } finally {
      setStudyAllLoading(false)
    }
  }

  const totalDue = dueCount?.totalDue ?? 0
  const canStudyAll = totalDue > 0 && !studyAllLoading

  const subtitleText = dueCount
    ? t('subtitle', { cards: dueCount.totalDue, decks: dueCount.deckCount })
    : t('subtitleEmpty')

  const hasDecks = !!decks && decks.length > 0
  const sessionActive = phase !== 'idle'
  const selectedDeck = decks?.find(d => d.id === selectedDeckId) ?? null
  const editingDeck = editingDeckId ? decks?.find(d => d.id === editingDeckId) ?? undefined : undefined

  const canAddCard = !!selectedDeckId
  const rightSlot = (
    <div style={{ display: 'flex', gap: 8 }}>
<button
        className="jl-btn"
        type="button"
        onClick={() => setCardEditorOpen(true)}
        disabled={!canAddCard}
        title={canAddCard ? t('topBar.newCardHint') : t('topBar.browseDisabled')}
        style={!canAddCard ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        <Plus size={14} /> {t('topBar.newCard')}
      </button>
      <button
        className="jl-btn jl-btn-accent"
        type="button"
        onClick={handleStudyAll}
        disabled={!canStudyAll}
        title={
          studyAllLoading
            ? t('topBar.loading')
            : totalDue > 0
            ? t('topBar.studyAllLabel', { count: totalDue })
            : t('topBar.noneDue')
        }
        style={!canStudyAll ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        <Play size={14} /> {studyAllLoading ? t('topBar.loading') : t('topBar.studyAll')}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <TopBar title={t('title')} subtitle={subtitleText} rightSlot={rightSlot} />
      <div className="flex-1 overflow-y-auto">
        <div
          style={{
            padding: '22px 28px 40px',
            display: 'grid',
            gridTemplateColumns: '260px 1fr 320px',
            gap: 22,
          }}
        >
          <FlashcardSidebar
            selectedDeckId={selectedDeckId}
            onSelectDeck={handleSelectDeck}
            onNewDeck={() => {
              setEditingDeckId(null)
              setEditorOpen(true)
            }}
            onEditDeck={handleEditDeck}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              minWidth: 0,
            }}
          >
            {!hasDecks ? (
              <div
                className="jl-card"
                style={{
                  padding: 40,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={{ fontSize: 14, color: 'var(--jl-text-soft)' }}>
                  {t('empty.noDecksDescription')}
                </div>
                <button
                  className="jl-btn jl-btn-accent"
                  type="button"
                  onClick={() => {
                    setEditingDeckId(null)
                    setEditorOpen(true)
                  }}
                >
                  <Plus size={14} /> {t('sidebar.newDeck')}
                </button>
              </div>
            ) : sessionActive ? (
              <ReviewSession />
            ) : selectedDeck ? (
              <DeckOverview
                deck={selectedDeck}
                dueCardsCount={dueCards?.length ?? 0}
                isDueLoading={dueCards === undefined}
                onStartReview={handleStartReview}
                onEditDeck={() => handleEditDeck(selectedDeck.id)}
                onAddCard={() => setCardEditorOpen(true)}
              />
            ) : (
              <div
                className="jl-card"
                style={{
                  padding: 40,
                  textAlign: 'center',
                  color: 'var(--jl-text-faint)',
                  fontSize: 14,
                }}
              >
                {t('empty.selectDeck')}
              </div>
            )}
          </div>

          <FlashcardStatsRail deckId={selectedDeckId} />
        </div>
      </div>
      <DeckEditor
        deck={editingDeck}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingDeckId(null)
        }}
      />
      {selectedDeckId && (
        <CardEditor
          deckId={selectedDeckId}
          open={cardEditorOpen}
          onClose={() => setCardEditorOpen(false)}
        />
      )}
    </div>
  )
}

interface DeckOverviewProps {
  deck: {
    id: string
    name: string
    description: string | null
    card_count: number
    due_count: number
    new_count: number
  }
  dueCardsCount: number
  isDueLoading: boolean
  onStartReview: () => void
  onEditDeck: () => void
  onAddCard: () => void
}

function DeckOverview({
  deck,
  dueCardsCount,
  isDueLoading,
  onStartReview,
  onEditDeck,
  onAddCard,
}: DeckOverviewProps) {
  const t = useTranslations('flashcards.deckOverview')
  const tCommon = useTranslations('common')
  const noDue = dueCardsCount === 0 && !isDueLoading
  const canStart = dueCardsCount > 0 && !isDueLoading

  return (
    <div
      className="jl-card"
      style={{
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--jl-text)' }}>
          {deck.name}
        </div>
        {deck.description && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--jl-text-soft)',
              marginTop: 4,
            }}
          >
            {deck.description}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {[
          { label: t('totalLabel'), value: deck.card_count, tone: 'var(--jl-text)' },
          { label: t('dueNowLabel'), value: deck.due_count, tone: 'var(--jl-accent-strong)' },
          { label: t('newLabel'), value: deck.new_count, tone: 'var(--jl-info)' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              padding: '14px 10px',
              borderRadius: 10,
              background: 'var(--jl-bg-sunken)',
              border: '1px solid var(--jl-border)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: stat.tone,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--jl-text-faint)', marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={onStartReview}
          disabled={!canStart}
          className="jl-btn jl-btn-accent"
          style={{
            justifyContent: 'center',
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            opacity: canStart ? 1 : 0.5,
            cursor: canStart ? 'pointer' : 'not-allowed',
          }}
        >
          {isDueLoading
            ? tCommon('loading')
            : noDue
            ? `✓ ${t('allCaughtUp')}`
            : t('startReview', { count: dueCardsCount })}
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onAddCard}
            className="jl-btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t('addCard')}
          </button>
          <button
            type="button"
            onClick={onEditDeck}
            className="jl-btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t('editDeck')}
          </button>
          <Link
            href={`/flashcards/${deck.id}`}
            className="jl-btn"
            style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
          >
            {t('browseCards')}
          </Link>
        </div>
      </div>
    </div>
  )
}
