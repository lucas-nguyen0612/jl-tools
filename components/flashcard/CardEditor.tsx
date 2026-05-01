'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useCreateCard, useUpdateCard } from '@/hooks/useFlashcards'
import type { FlashCard } from '@/features/flashcards/types'

interface CardEditorProps {
  deckId: string
  card?: FlashCard
  open: boolean
  onClose: () => void
}

export function CardEditor({ deckId, card, open, onClose }: CardEditorProps) {
  const t = useTranslations('flashcards.card')
  const tCommon = useTranslations('common')
  const tErr = useTranslations('errors.validation')

  const cardSchema = z.object({
    front: z.string().min(1, tErr('frontRequired')),
    back: z.string().min(1, tErr('backRequired')),
    tags: z.string(),
  })

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createCard = useCreateCard()
  const updateCard = useUpdateCard()

  const isEdit = !!card
  const isPending = createCard.isPending || updateCard.isPending

  useEffect(() => {
    if (open) {
      setFront(card?.front ?? '')
      setBack(card?.back ?? '')
      setTags(card?.tags?.join(', ') ?? '')
      setErrors({})
    }
  }, [open, card])

  const handleSubmit = async () => {
    const parsed = cardSchema.safeParse({ front, back, tags })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    const tagList = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    try {
      if (isEdit && card) {
        await updateCard.mutateAsync({
          id: card.id,
          deckId,
          data: { front, back, tags: tagList },
        })
      } else {
        await createCard.mutateAsync({
          deck_id: deckId,
          front,
          back,
          tags: tagList,
        })
      }
      onClose()
    } catch {
      // error displayed via mutation.error below
    }
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('editTitle') : t('newTitle')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-front">{t('front')}</Label>
            <textarea
              id="card-front"
              value={front}
              onChange={e => setFront(e.target.value)}
              rows={4}
              placeholder={t('frontPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${errors.front ? '#ef4444' : 'var(--jl-border)'}`,
                background: 'var(--jl-bg-sunken)',
                color: 'var(--jl-text)',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {errors.front && (
              <p style={{ fontSize: 12, color: '#ef4444' }}>{errors.front}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-back">{t('back')}</Label>
            <textarea
              id="card-back"
              value={back}
              onChange={e => setBack(e.target.value)}
              rows={4}
              placeholder={t('backPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${errors.back ? '#ef4444' : 'var(--jl-border)'}`,
                background: 'var(--jl-bg-sunken)',
                color: 'var(--jl-text)',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {errors.back && (
              <p style={{ fontSize: 12, color: '#ef4444' }}>{errors.back}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-tags">{t('tagsLabel')}</Label>
            <input
              id="card-tags"
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder={t('tagsPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--jl-border)',
                background: 'var(--jl-bg-sunken)',
                color: 'var(--jl-text)',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {(createCard.error || updateCard.error) && (
          <p style={{ fontSize: 12, color: '#ef4444', padding: '0 4px' }}>
            {(createCard.error || updateCard.error)?.message}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              background: 'var(--jl-accent-strong)',
              color: '#fff',
              border: 'none',
            }}
          >
            {isPending ? t('saving') : isEdit ? t('save') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
