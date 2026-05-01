'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkline } from '@/components/rpg/Sparkline'
import type {
  WeeklyData,
  WeeklyXPData,
} from '@/features/gamification/dashboard-queries'

function formatDelta(thisVal: number, lastVal: number): { label: string; positive: boolean } {
  if (lastVal === 0) {
    if (thisVal === 0) return { label: '—', positive: true }
    return { label: '+100%', positive: true }
  }
  const pct = Math.round(((thisVal - lastVal) / lastVal) * 100)
  if (pct === 0) return { label: '±0%', positive: true }
  return { label: `${pct > 0 ? '+' : ''}${pct}%`, positive: pct >= 0 }
}

function formatFocusTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

interface WeeklyStatsProps {
  thisWeek: WeeklyData
  lastWeek: WeeklyData
  weeklyXP: WeeklyXPData
}

interface MiniStatCardProps {
  label: string
  value: string
  delta: { label: string; positive: boolean }
  sparkData: number[]
}

function MiniStatCard({ label, value, delta, sparkData }: MiniStatCardProps) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: 'var(--jl-bg-sunken)',
        border: '1px solid var(--jl-line-soft, var(--jl-line))',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--jl-text-soft)' }}>{label}</div>
      <div
        style={{
          fontFamily: 'var(--jl-font-display)',
          fontSize: 22,
          marginTop: 4,
          lineHeight: 1,
          color: 'var(--jl-text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 8,
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: delta.positive
              ? 'var(--jl-success, #22c55e)'
              : 'var(--jl-danger, #ef4444)',
          }}
        >
          {delta.label}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <Sparkline
            data={sparkData.length >= 2 ? sparkData : [0, 0]}
            width={60}
            height={24}
            color={delta.positive ? 'var(--jl-success, #22c55e)' : 'var(--jl-danger, #ef4444)'}
          />
        </div>
      </div>
    </div>
  )
}

export const WeeklyStats: FC<WeeklyStatsProps> = ({ thisWeek, lastWeek, weeklyXP }) => {
  const t = useTranslations('dashboard.weeklyStats')
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
          {t('title')}
        </h2>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--jl-text-faint)',
          }}
        >
          {fmt(weekStart)} — {fmt(weekEnd)}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        <MiniStatCard
          label={t('focusHours')}
          value={formatFocusTime(thisWeek.focusMinutes)}
          delta={formatDelta(thisWeek.focusMinutes, lastWeek.focusMinutes)}
          sparkData={thisWeek.dailyFocusMinutes}
        />
        <MiniStatCard
          label={t('xpEarned')}
          value={weeklyXP.thisWeek.toLocaleString()}
          delta={formatDelta(weeklyXP.thisWeek, weeklyXP.lastWeek)}
          sparkData={weeklyXP.daily}
        />
        <MiniStatCard
          label={t('habitsDone')}
          value={String(thisWeek.habits)}
          delta={formatDelta(thisWeek.habits, lastWeek.habits)}
          sparkData={thisWeek.dailyHabits}
        />
        <MiniStatCard
          label={t('cardsReviewed')}
          value={String(thisWeek.cardsReviewed)}
          delta={formatDelta(thisWeek.cardsReviewed, lastWeek.cardsReviewed)}
          sparkData={thisWeek.dailyCards}
        />
      </div>
    </div>
  )
}
