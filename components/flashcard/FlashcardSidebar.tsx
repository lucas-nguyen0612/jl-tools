'use client'

import type { ReactElement } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Check, Plus } from 'lucide-react'
import { useDecks, useDeleteDeck } from '@/hooks/useFlashcards'
import { DECK_COLOR_MAP } from '@/features/flashcards/constants'
import type { Deck } from '@/features/flashcards/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FlashcardSidebarProps {
  selectedDeckId: string | null
  onSelectDeck: (deckId: string) => void
  onNewDeck: () => void
  onEditDeck: (deckId: string) => void
}

export function FlashcardSidebar({
  selectedDeckId,
  onSelectDeck,
  onNewDeck,
  onEditDeck,
}: FlashcardSidebarProps): ReactElement {
  const t = useTranslations('flashcards.sidebar')
  const tDeck = useTranslations('flashcards.deck')
  const tCommon = useTranslations('common')
  const { data: decks, isLoading } = useDecks()
  const deleteDeck = useDeleteDeck()

  const handleDelete = async (deck: Deck) => {
    const ok = confirm(tDeck('deleteConfirmNamed', { name: deck.name, count: deck.card_count }))
    if (!ok) return
    await deleteDeck.mutateAsync(deck.id)
  }

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--jl-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          padding: '0 4px',
        }}
      >
        {t('title')}
      </div>

      {isLoading ? (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--jl-bg-sunken)',
                height: 74,
                borderRadius: 12,
              }}
            />
          ))}
        </>
      ) : !decks || decks.length === 0 ? (
        <>
          <div
            style={{
              fontSize: 13,
              color: 'var(--jl-text-faint)',
              padding: '12px 4px',
              textAlign: 'center',
            }}
          >
            {t('noDecks')}
          </div>
          <button
            type="button"
            className="jl-btn"
            style={{ justifyContent: 'center', width: '100%' }}
            onClick={onNewDeck}
          >
            <Plus size={13} /> {t('newDeck')}
          </button>
        </>
      ) : (
        <>
          {decks.map((deck: Deck) => {
            const isActive = selectedDeckId === deck.id
            const deckColor = DECK_COLOR_MAP[deck.color] ?? deck.color
            return (
              <div
                key={deck.id}
                className="jl-card"
                role="button"
                tabIndex={0}
                aria-label={t('selectAria', { name: deck.name })}
                aria-pressed={isActive}
                onClick={() => onSelectDeck(deck.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectDeck(deck.id)
                  }
                }}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: isActive
                    ? '1px solid color-mix(in oklch, var(--jl-accent) 45%, transparent)'
                    : undefined,
                  background: isActive ? 'var(--jl-accent-soft)' : 'var(--jl-bg-raised)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: deckColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {deck.name}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        aria-label={t('optionsAria', { name: deck.name })}
                        style={{
                          width: 22,
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--jl-text-faint)',
                          cursor: 'pointer',
                          fontSize: 14,
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        ⋯
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/flashcards/${deck.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {t('browseCards')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditDeck(deck.id)}>
                        {t('renameEdit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(deck)}
                        style={{ color: '#ef4444' }}
                      >
                        {tCommon('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--jl-text-faint)',
                    marginBottom: 8,
                  }}
                >
                  {tDeck('cardCount', { cards: deck.card_count, newCards: deck.new_count })}
                </div>

                {deck.due_count > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      className="jl-chip"
                      style={{
                        height: 20,
                        fontSize: 10,
                        padding: '0 7px',
                        background: deckColor,
                        borderColor: deckColor,
                        color: 'white',
                      }}
                    >
                      {tDeck('dueCount', { count: deck.due_count })}
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--jl-success)',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={11} style={{ verticalAlign: 'middle' }} /> {t('allCaughtUp')}
                  </span>
                )}
              </div>
            )
          })}
          <button
            type="button"
            className="jl-btn"
            style={{ justifyContent: 'center', width: '100%' }}
            onClick={onNewDeck}
          >
            <Plus size={13} /> {t('newDeck')}
          </button>
        </>
      )}
    </aside>
  )
}
