'use client'
import { useEffect, useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SessionData {
  date: string   // YYYY-MM-DD
  label: string  // 3-letter weekday
  count: number
  isToday: boolean
}

/** Build the last 14 days, count sessions per day */
function groupByDate(sessions: Array<{ started_at: string }>): SessionData[] {
  const todayStr = new Date().toISOString().split('T')[0]
  const days: SessionData[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      count: 0,
      isToday: dateStr === todayStr,
    })
  }
  sessions.forEach(s => {
    const date = s.started_at.split('T')[0]
    const day = days.find(d => d.date === date)
    if (day) day.count++
  })
  return days
}

const BAR_MAX_H = 80

export function SessionHistoryChart() {
  const t = useTranslations('pomodoro.historyChart')
  const [days, setDays] = useState<SessionData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - 13)
        const from = fromDate.toISOString().split('T')[0]
        const to = new Date().toISOString().split('T')[0]

        const res = await fetch(`/api/pomodoro/sessions?from=${from}&to=${to}`)
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()
        const sessions = Array.isArray(json) ? json : (json.sessions ?? [])
        setDays(groupByDate(sessions))
      } catch {
        setDays(groupByDate([]))
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const maxCount = days ? Math.max(...days.map(d => d.count), 1) : 1
  const total = days ? days.reduce((s, d) => s + d.count, 0) : 0
  const avg = days ? (total / 14).toFixed(1) : '—'
  const best = days ? Math.max(...days.map(d => d.count)) : 0

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BarChart2 size={14} color="var(--jl-text-faint)" />
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{t('title')}</h3>
        {isOffline && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--jl-text-faint)' }}>
            {t('offline')}
          </span>
        )}
      </div>

      {loading ? (
        /* Skeleton shimmer */
        <div
          style={{
            height: 100,
            borderRadius: 6,
            background: 'var(--jl-bg-sunken)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, transparent 0%, var(--jl-line-soft) 50%, transparent 100%)',
              animation: 'jl-shimmer 1.4s infinite',
            }}
          />
        </div>
      ) : (
        /* Bar chart */
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 100 }}>
          {days!.map((day, i) => {
            const barH = day.count === 0 ? 4 : Math.max(4, (day.count / maxCount) * BAR_MAX_H)
            const showLabel = i % 2 === 0 || day.isToday
            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'flex-end',
                  height: '100%',
                }}
                title={`${day.date}: ${day.count}`}
              >
                <div
                  style={{
                    width: '100%',
                    height: barH,
                    borderRadius: 4,
                    background: day.isToday
                      ? 'var(--jl-accent)'
                      : 'color-mix(in oklch, var(--jl-accent) 60%, transparent)',
                    border: day.count === 0 ? '1px solid var(--jl-line-soft)' : 'none',
                    transition: 'height 0.3s ease',
                    minHeight: 4,
                  }}
                />
                <span
                  style={{
                    fontSize: 8,
                    color: day.isToday ? 'var(--jl-accent)' : 'var(--jl-text-faint)',
                    fontWeight: day.isToday ? 700 : 400,
                    whiteSpace: 'nowrap',
                    opacity: showLabel ? 1 : 0,
                  }}
                >
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 18,
          marginTop: 14,
          fontSize: 11,
          color: 'var(--jl-text-soft)',
        }}
      >
        <span>
          {t('avg')}{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--jl-text)' }}>
            {loading ? '—' : avg}
          </strong>{' '}
          {t('perDay')}
        </span>
        <span>
          {t('best')}{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--jl-text)' }}>
            {loading ? '—' : best}
          </strong>
        </span>
      </div>

      <style>{`
        @keyframes jl-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  )
}
