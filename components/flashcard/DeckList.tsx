'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDecks, useDeleteDeck } from '@/hooks/useFlashcards'
import { DeckCard } from './DeckCard'
import { DeckEditor } from './DeckEditor'
import type { Deck } from '@/features/flashcards/types'

export function DeckList() {
  const t = useTranslations('flashcards.empty')
  const tDeck = useTranslations('flashcards.deck')
  const router = useRouter()
  const { data: decks, isLoading } = useDecks()
  const deleteDeck = useDeleteDeck()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined)

  const handleStudy = (deckId: string) => {
    router.push(`/flashcards/${deckId}/study`)
  }

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck)
    setEditorOpen(true)
  }

  const handleDelete = async (deckId: string) => {
    if (!confirm(tDeck('deleteConfirm'))) return
    await deleteDeck.mutateAsync(deckId)
  }

  const handleNewDeck = () => {
    setEditingDeck(undefined)
    setEditorOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  const deckList = decks ?? []

  return (
    <div className="flex flex-col gap-4">
      {deckList.length === 0 ? (
        <div
          className="rounded-xl p-4 flex flex-col items-center gap-3"
          style={{
            background: 'var(--jl-bg-elevated)',
            border: '1px solid var(--jl-border)',
          }}
        >
          <span style={{ fontSize: 40 }}>📇</span>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--jl-text)', margin: 0 }}>
            {t('noDecks')}
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--jl-text-faint)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {t('noDecksDescription')}
          </p>
          <Button
            onClick={handleNewDeck}
            style={{
              background: 'var(--jl-accent-strong)',
              color: '#fff',
              border: 'none',
              marginTop: 4,
            }}
          >
            {t('createFirstDeck')}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {deckList.map(deck => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStudy={() => handleStudy(deck.id)}
                onEdit={() => handleEdit(deck)}
                onDelete={() => handleDelete(deck.id)}
              />
            ))}
          </div>

          <Button
            onClick={handleNewDeck}
            variant="outline"
            style={{ width: '100%' }}
          >
            + {tDeck('newTitle')}
          </Button>
        </>
      )}

      <DeckEditor
        deck={editingDeck}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingDeck(undefined)
        }}
      />
    </div>
  )
}
