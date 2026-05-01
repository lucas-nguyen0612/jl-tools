'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { XP_PER_POMODORO } from '@/features/gamification/constants'

interface ToolCardProps {
  icon: string
  title: string
  status: string
  meta: string
  ctaLabel: string
  href: string
  active?: boolean
  urgent?: boolean
  progress?: number
}

function ToolCard({
  icon,
  title,
  status,
  meta,
  ctaLabel,
  href,
  active,
  urgent,
  progress,
}: ToolCardProps) {
  return (
    <div
      className="rounded-2xl"
      style={{
        padding: 16,
        background: 'var(--jl-bg-raised)',
        border: active
          ? '1px solid color-mix(in oklch, var(--jl-accent) 45%, transparent)'
          : '1px solid var(--jl-line)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: urgent
              ? 'color-mix(in oklch, var(--jl-legendary, #f59e0b) 18%, var(--jl-bg-raised))'
              : 'var(--jl-accent-soft)',
            color: urgent ? 'var(--jl-legendary, #f59e0b)' : 'var(--jl-accent-ink)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--jl-text)' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>{status}</div>
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: 'var(--jl-text-soft)',
          margin: '12px 0 10px',
        }}
      >
        {meta}
      </div>

      {progress !== undefined && (
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: 'var(--jl-bg-sunken)',
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: `${Math.min(100, progress * 100)}%`,
              height: '100%',
              background: 'var(--jl-accent-strong)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}

      <Link
        href={href}
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          padding: '7px 0',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          background: urgent
            ? 'color-mix(in oklch, var(--jl-legendary, #f59e0b) 18%, var(--jl-bg-raised))'
            : active
            ? 'var(--jl-accent-soft)'
            : 'var(--jl-bg-sunken)',
          color: urgent
            ? 'var(--jl-legendary, #f59e0b)'
            : active
            ? 'var(--jl-accent-ink)'
            : 'var(--jl-text-soft)',
          border: '1px solid var(--jl-line-soft, var(--jl-line))',
          transition: 'all 0.15s ease',
        }}
      >
        {ctaLabel} →
      </Link>
    </div>
  )
}

interface ToolGridProps {
  pomodoroCount: number
  habitsDoneToday: number
  totalHabits: number
  flashcardsDue: number
}

export const ToolGrid: FC<ToolGridProps> = ({
  pomodoroCount,
  habitsDoneToday,
  totalHabits,
  flashcardsDue,
}) => {
  const t = useTranslations('dashboard.toolGrid')
  const habitsProgress = totalHabits > 0 ? habitsDoneToday / totalHabits : 0
  const habitsAllDone = habitsDoneToday === totalHabits && totalHabits > 0

  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
          {t('title')}
        </h2>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--jl-text-faint)' }}>
          {t('active', { count: 3 })}
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        <ToolCard
          icon="⏱"
          title={t('pomodoroTitle')}
          status={
            pomodoroCount > 0
              ? t('pomodoroSessionsToday', { count: pomodoroCount })
              : t('pomodoroReady')
          }
          meta={
            pomodoroCount > 0
              ? t('pomodoroXpEarned', { xp: pomodoroCount * XP_PER_POMODORO })
              : t('pomodoroStartFocus')
          }
          ctaLabel={t('pomodoroCta')}
          href="/pomodoro"
          active
        />
        <ToolCard
          icon="🔥"
          title={t('habitsTitle')}
          status={t('habitsStatus', { done: habitsDoneToday, total: totalHabits })}
          meta={habitsAllDone ? t('habitsAllDone') : t('habitsKeepStreak')}
          ctaLabel={t('habitsCta')}
          href="/habits"
          progress={habitsProgress}
        />
        <ToolCard
          icon="🃏"
          title={t('flashcardsTitle')}
          status={
            flashcardsDue > 0
              ? t('flashcardsDue', { count: flashcardsDue })
              : t('flashcardsAllCaughtUp')
          }
          meta={flashcardsDue > 0 ? t('flashcardsAwaiting') : t('flashcardsNoneDue')}
          ctaLabel={t('flashcardsCta')}
          href="/flashcards"
        />
      </div>
    </section>
  )
}
