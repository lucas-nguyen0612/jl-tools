'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DeckStats } from '@/components/flashcard/DeckStats'
import { ForecastChart } from '@/components/flashcard/ForecastChart'
import { CardEditor } from '@/components/flashcard/CardEditor'
import { useDeckCards, useDecks, useDeleteCard } from '@/hooks/useFlashcards'
import type { FlashCard } from '@/features/flashcards/types'

interface DeckDetailClientProps {
  deckId: string
}

export function DeckDetailClient({ deckId }: DeckDetailClientProps) {
  const t = useTranslations('flashcards')
  const tCommon = useTranslations('common')
  const { data: cards, isLoading: cardsLoading } = useDeckCards(deckId)
  const { data: decks } = useDecks()
  const deleteCard = useDeleteCard()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<FlashCard | undefined>(undefined)

  const deck = decks?.find(d => d.id === deckId)
  const cardList = cards ?? []

  const handleEditCard = (card: FlashCard) => {
    setEditingCard(card)
    setEditorOpen(true)
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm(t('card.deleteConfirm'))) return
    await deleteCard.mutateAsync({ id: cardId, deckId })
  }

  const handleNewCard = () => {
    setEditingCard(undefined)
    setEditorOpen(true)
  }

  if (cardsLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/flashcards"
          style={{ fontSize: 13, color: 'var(--jl-text-soft)', textDecoration: 'none' }}
        >
          ← {t('deckDetail.decksLink')}
        </Link>
        {deck && (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--jl-text)' }}>
            {deck.name}
          </span>
        )}
      </div>

      {/* Stats grid */}
      {deck && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DeckStats deck={deck} cards={cardList} />
          <ForecastChart cards={cardList} />
        </div>
      )}

      {/* Start Study CTA */}
      <Link
        href={`/flashcards/${deckId}/study`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 20px',
          borderRadius: 12,
          background: deck && deck.due_count > 0 ? 'var(--jl-accent-strong)' : 'var(--jl-bg-sunken)',
          color: deck && deck.due_count > 0 ? '#fff' : 'var(--jl-text-faint)',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          pointerEvents: deck && deck.due_count === 0 ? 'none' : 'auto',
        }}
      >
        {deck && deck.due_count > 0
          ? t('deckDetail.studyCta', { count: deck.due_count })
          : t('deckDetail.allCaughtUp')}
      </Link>

      {/* Card list */}
      <div className="flex flex-col gap-2">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--jl-text)' }}>
            {t('deckDetail.cardsHeader', { count: cardList.length })}
          </span>
          <Button
            size="sm"
            onClick={handleNewCard}
            style={{
              background: 'var(--jl-accent-strong)',
              color: '#fff',
              border: 'none',
              fontSize: 12,
            }}
          >
            {t('deckDetail.addCardCta')}
          </Button>
        </div>

        {cardList.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: 'var(--jl-bg-elevated)',
              border: '1px solid var(--jl-border)',
            }}
          >
            <p style={{ fontSize: 14, color: 'var(--jl-text-faint)', margin: 0 }}>
              {t('empty.noCardsYet')}
            </p>
          </div>
        ) : (
          cardList.map(card => (
            <div
              key={card.id}
              className="rounded-xl p-4"
              style={{
                background: 'var(--jl-bg-elevated)',
                border: '1px solid var(--jl-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--jl-text)', marginBottom: 4 }}>
                    {card.front}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--jl-text-soft)' }}>{card.back}</div>
                  {card.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {card.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: 'var(--jl-bg-sunken)',
                            border: '1px solid var(--jl-border)',
                            color: 'var(--jl-text-faint)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleEditCard(card)}
                    style={{
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--jl-border)',
                      background: 'transparent',
                      color: 'var(--jl-text-soft)',
                      cursor: 'pointer',
                    }}
                  >
                    {tCommon('edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    style={{
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid transparent',
                      background: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    {tCommon('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CardEditor
        deckId={deckId}
        card={editingCard}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingCard(undefined)
        }}
      />
    </div>
  )
}
