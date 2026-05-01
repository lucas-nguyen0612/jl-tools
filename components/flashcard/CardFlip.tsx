'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface CardFlipProps {
  front: string
  back: string
  isFlipped: boolean
  onFlip: () => void
  deckName?: string
  tags?: string[]
}

export function CardFlip({ front, back, isFlipped, onFlip, deckName, tags }: CardFlipProps) {
  const t = useTranslations('flashcards.card')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space' && e.key !== ' ') return

      const active = document.activeElement
      if (active) {
        const tag = active.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        if (active.getAttribute('contenteditable') !== null && active.getAttribute('contenteditable') !== 'false') return
      }

      e.preventDefault()
      onFlip()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFlip])

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    padding: '0 8px',
    height: 20,
    fontSize: 10,
    background: 'var(--jl-bg-raised)',
    border: '1px solid var(--jl-border)',
    color: 'var(--jl-text-soft)',
  }

  return (
    <div
      onClick={onFlip}
      style={{
        perspective: 1500,
        height: 380,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.3, 0.8, 0.4, 1.2)',
          transform: isFlipped ? 'rotateX(180deg)' : 'none',
        }}
      >
        {/* Front face */}
        <div
          className="rounded-xl"
          style={{
            position: 'absolute',
            inset: 0,
            padding: 40,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--jl-bg-elevated)',
            border: '1px solid var(--jl-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--jl-accent-strong)',
                flexShrink: 0,
              }}
            />
            {deckName && (
              <span style={{ fontSize: 11, color: 'var(--jl-text-soft)' }}>{deckName}</span>
            )}
            <span style={{ fontSize: 10, color: 'var(--jl-text-faint)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
              {t('frontHint')}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: '0 40px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--jl-text-faint)',
                  marginBottom: 14,
                }}
              >
                {t('questionLabel')}
              </div>
              <div
                style={{
                  fontSize: 28,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  color: 'var(--jl-text)',
                  fontWeight: 600,
                }}
              >
                {front}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {tags && tags.length > 0 && (
              <>
                {tags.map((tag) => (
                  <span key={tag} style={chipStyle}>
                    #{tag}
                  </span>
                ))}
              </>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--jl-text-faint)' }}>
              {t('flipHint')}
            </span>
          </div>
        </div>

        {/* Back face */}
        <div
          className="rounded-xl"
          style={{
            position: 'absolute',
            inset: 0,
            padding: 40,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--jl-bg-elevated)',
            border: '1px solid var(--jl-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--jl-success)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: 'var(--jl-text-faint)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
              {t('backHint')}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: '0 40px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--jl-text-faint)',
                  marginBottom: 14,
                }}
              >
                {t('answerLabel')}
              </div>
              <div
                style={{
                  fontSize: 20,
                  lineHeight: 1.5,
                  color: 'var(--jl-text)',
                  maxWidth: 560,
                  margin: '0 auto',
                }}
              >
                {back}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--jl-text-faint)', textAlign: 'center' }}>
            {t('rateHint')}
          </div>
        </div>
      </div>
    </div>
  )
}
