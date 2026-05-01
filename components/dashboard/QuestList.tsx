'use client'

import { type FC, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { UserQuestWithQuest } from '@/features/gamification/queries'

function formatCountdown(): string {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

const TOOL_ICON: Record<string, string> = {
  pomodoro: '⏱',
  habit: '🔥',
  flashcard: '🧠',
  any: '⚔',
}

interface QuestListProps {
  quests: UserQuestWithQuest[]
}

export const QuestList: FC<QuestListProps> = ({ quests }) => {
  const t = useTranslations('dashboard.quests')
  const [countdown, setCountdown] = useState(formatCountdown())

  useEffect(() => {
    const id = setInterval(() => setCountdown(formatCountdown()), 60_000)
    return () => clearInterval(id)
  }, [])

  const allDone = quests.length > 0 && quests.every(q => q.is_completed)

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        padding: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 16 }}>⚔</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--jl-text)' }}>
          {t('title')}
        </h2>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            fontWeight: 500,
            padding: '3px 8px',
            borderRadius: 8,
            background: 'var(--jl-bg-sunken)',
            color: 'var(--jl-text-soft)',
          }}
        >
          {t('resetsIn', { time: countdown })}
        </span>
      </div>

      {/* Empty */}
      {quests.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0',
            color: 'var(--jl-text-faint)',
            fontSize: 13,
          }}
        >
          {t('empty')}
        </div>
      )}

      {/* All done */}
      {allDone && (
        <div
          style={{
            textAlign: 'center',
            padding: '12px 0 4px',
            color: 'var(--jl-success, #22c55e)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {t('allDone')}
        </div>
      )}

      {/* Quest rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {quests.map(uq => {
          const quest = uq.quest
          const pct = quest.target_value > 0
            ? Math.min(1, uq.current_value / quest.target_value)
            : 0
          const icon = TOOL_ICON[quest.tool] ?? '⚔'

          return (
            <div
              key={uq.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 80px',
                gap: 12,
                alignItems: 'center',
                padding: '10px 6px',
                opacity: uq.is_completed ? 0.55 : 1,
                borderBottom: '1px dashed var(--jl-line-soft, var(--jl-line))',
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: uq.is_completed
                    ? 'var(--jl-success, #22c55e)'
                    : 'var(--jl-bg-sunken)',
                  border: uq.is_completed
                    ? '1px solid var(--jl-success, #22c55e)'
                    : '1px solid var(--jl-line)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontSize: 12,
                }}
              >
                {uq.is_completed ? '✓' : icon}
              </div>

              {/* Title + progress */}
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: uq.is_completed ? 'line-through' : 'none',
                    color: 'var(--jl-text)',
                  }}
                >
                  {quest.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--jl-text-faint)',
                    marginTop: 2,
                  }}
                >
                  {t('xpReward', { xp: quest.xp_reward })}
                </div>
                {!uq.is_completed && (
                  <div
                    style={{
                      height: 4,
                      borderRadius: 999,
                      background: 'var(--jl-bg-sunken)',
                      overflow: 'hidden',
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${pct * 100}%`,
                        height: '100%',
                        background: 'var(--jl-accent-strong)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Progress label */}
              <div style={{ textAlign: 'right' }}>
                {uq.is_completed ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--jl-success, #22c55e)',
                      fontWeight: 600,
                    }}
                  >
                    {t('claimed')}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--jl-text-soft)' }}>
                    {uq.current_value}/{quest.target_value}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
