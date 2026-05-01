'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { SessionSummary as SessionSummaryType } from '@/features/flashcards/types'

interface SessionSummaryProps {
  summary: SessionSummaryType
  onRestart: () => void
  onBack: () => void
  submitState: 'pending' | 'success' | 'error'
  submitError: string | null
}

export function SessionSummary({
  summary,
  onRestart,
  onBack,
  submitState,
  submitError,
}: SessionSummaryProps) {
  const t = useTranslations('flashcards.review')
  const tRating = useTranslations('flashcards.review.rating')

  const isPending = submitState === 'pending'
  const isError = submitState === 'error'
  const hasFailures = summary.failedCount > 0
  const xpIsConfirmed = summary.xpFromServer !== null

  return (
    <div
      className="rounded-xl p-4 flex flex-col items-center gap-6"
      style={{
        background: 'var(--jl-bg-elevated)',
        border: '1px solid var(--jl-border)',
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--jl-text-faint)', marginBottom: 8 }}>
          {t('completeBadge')}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: 'var(--jl-accent-strong)',
            lineHeight: 1,
            fontFamily: 'var(--font-display)',
          }}
        >
          {summary.retentionRate}%
        </div>
        <div style={{ fontSize: 13, color: 'var(--jl-text-soft)', marginTop: 6 }}>{t('retentionRate')}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 20,
            background: 'color-mix(in oklch, var(--jl-accent-strong) 15%, transparent)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--jl-accent-strong)',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? t('xpSaving') : t('xpEarned', { xp: summary.xpEarned })}
          {xpIsConfirmed && !isPending && (
            <span
              title="Confirmed by server"
              style={{ fontSize: 11, color: 'var(--jl-success)' }}
            >
              ✓
            </span>
          )}
        </div>
        {summary.sessionBonus > 0 && !isPending && (
          <div style={{ fontSize: 11, color: 'var(--jl-text-soft)' }}>
            {t('sessionBonus', { xp: summary.sessionBonus })}
          </div>
        )}
      </div>

      {(isError || hasFailures) && !isPending && (
        <div
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            background: 'color-mix(in oklch, var(--jl-danger) 10%, transparent)',
            border: '1px solid color-mix(in oklch, var(--jl-danger) 40%, transparent)',
            color: 'var(--jl-danger)',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {isError
            ? t('errorSaving', { error: submitError ?? 'Unknown error' })
            : t('partialFail', { failed: summary.failedCount, total: summary.total })}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          width: '100%',
        }}
      >
        {[
          { key: 'again' as const, count: summary.again, color: 'var(--jl-danger)' },
          { key: 'hard' as const, count: summary.hard, color: 'var(--jl-warn)' },
          { key: 'good' as const, count: summary.good, color: 'var(--jl-success)' },
          { key: 'easy' as const, count: summary.easy, color: 'var(--jl-info)' },
        ].map(item => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 8px',
              borderRadius: 10,
              background: 'var(--jl-bg-sunken)',
              border: '1px solid var(--jl-border)',
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: item.color,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
              }}
            >
              {item.count}
            </span>
            <span style={{ fontSize: 10, color: 'var(--jl-text-faint)' }}>{tRating(item.key)}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: 'var(--jl-text-soft)' }}>
        {t('totalReviewed', { total: summary.total })}
      </div>

      <div className="flex gap-3 w-full">
        <Button
          onClick={onRestart}
          style={{
            flex: 1,
            background: 'var(--jl-accent-strong)',
            color: '#fff',
            border: 'none',
          }}
        >
          {t('studyAgain')}
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          style={{ flex: 1 }}
        >
          {t('backToDecks')}
        </Button>
      </div>
    </div>
  )
}
