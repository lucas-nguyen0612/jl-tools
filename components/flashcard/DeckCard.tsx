'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Deck } from '@/features/flashcards/types'
import { DECK_COLOR_MAP } from '@/features/flashcards/constants'

interface DeckCardProps {
  deck: Deck
  onStudy: () => void
  onEdit: () => void
  onDelete: () => void
}

export function DeckCard({ deck, onStudy, onEdit, onDelete }: DeckCardProps) {
  const t = useTranslations('flashcards.deck')
  const tSidebar = useTranslations('flashcards.sidebar')
  const tCommon = useTranslations('common')
  const colorHex = DECK_COLOR_MAP[deck.color] ?? deck.color
  const hasDue = deck.due_count > 0

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--jl-bg-elevated)',
        border: '1px solid var(--jl-border)',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: 4,
          background: colorHex,
          width: '100%',
        }}
      />

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/flashcards/${deck.id}`}
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--jl-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 2,
                textDecoration: 'none',
              }}
            >
              {deck.name}
            </Link>
            {deck.description && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--jl-text-soft)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {deck.description}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--jl-text-faint)',
                  cursor: 'pointer',
                  fontSize: 18,
                  flexShrink: 0,
                }}
                aria-label="Deck options"
              >
                ···
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/flashcards/${deck.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {tSidebar('manageCards')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>{tSidebar('editDeck')}</DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                style={{ color: '#ef4444' }}
              >
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'var(--jl-text-faint)',
            marginTop: 8,
            marginBottom: 10,
          }}
        >
          {t('cardCount', { cards: deck.card_count, newCards: deck.new_count })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          {hasDue ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 20,
                padding: '0 7px',
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 600,
                background: colorHex,
                color: '#fff',
                border: `1px solid ${colorHex}`,
              }}
            >
              {t('dueCount', { count: deck.due_count })}
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--jl-success)',
              }}
            >
              {tSidebar('allCaughtUp')}
            </span>
          )}

          <Button
            onClick={onStudy}
            disabled={!hasDue}
            size="sm"
            style={{
              background: hasDue ? 'var(--jl-accent-strong)' : 'var(--jl-bg-sunken)',
              color: hasDue ? '#fff' : 'var(--jl-text-faint)',
              border: 'none',
              fontSize: 12,
              height: 28,
              padding: '0 12px',
            }}
          >
            Study
          </Button>
        </div>
      </div>
    </div>
  )
}
