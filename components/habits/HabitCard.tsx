'use client'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StreakBadge } from './StreakBadge'
import { CheckInButton } from './CheckInButton'
import type { HabitWithStatus } from '@/features/habits/types'

interface HabitCardProps {
  habit: HabitWithStatus
  onToggle: (habitId: string, date: string) => void
  onEdit: (habit: HabitWithStatus) => void
  onDelete: (habitId: string) => void
  isToggling: boolean
  date: string
  yesterdayDate?: string
  isRetroWindow?: boolean
  isTogglingYesterday?: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  health: '💊',
  fitness: '💪',
  learning: '📚',
  productivity: '⚡',
  mindfulness: '🧘',
  other: '✨',
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#22c55e',
  fitness: '#f97316',
  learning: '#3b82f6',
  productivity: '#eab308',
  mindfulness: '#14b8a6',
  other: '#8b5cf6',
}

export const HabitCard: FC<HabitCardProps> = ({
  habit,
  onToggle,
  onEdit,
  onDelete,
  isToggling,
  date,
  yesterdayDate,
  isRetroWindow = false,
  isTogglingYesterday = false,
}) => {
  const t = useTranslations('habits.card')
  const tCommon = useTranslations('common')
  const icon = CATEGORY_ICONS[habit.category] ?? '✨'
  const categoryColor = CATEGORY_COLORS[habit.category] ?? '#6b7280'

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3"
      style={{
        background: 'var(--jl-bg-elevated)',
        border: '1px solid var(--jl-border)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 12,
        paddingBottom: isRetroWindow && yesterdayDate ? 36 : 12,
      }}
    >
      {/* Color swatch bar */}
      <div
        style={{
          width: 4,
          alignSelf: 'stretch',
          borderRadius: 4,
          background: habit.color,
          flexShrink: 0,
        }}
      />

      {/* Icon */}
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{icon}</span>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--jl-text)',
            margin: 0,
          }}
        >
          {habit.name}
        </p>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: categoryColor,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {habit.category}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StreakBadge streak={habit.current_streak} size="sm" />

        <CheckInButton
          checked={habit.checked_today}
          loading={isToggling}
          color={habit.color}
          onToggle={() => onToggle(habit.id, date)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center rounded-md"
              style={{
                width: 28,
                height: 28,
                color: 'var(--jl-text-faint)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
              }}
              aria-label={t('options')}
            >
              ···
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(habit)}>
              {tCommon('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(habit.id)}
              style={{ color: '#ef4444' }}
            >
              {tCommon('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Retroactive yesterday check-in */}
      {isRetroWindow && yesterdayDate && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 6,
            padding: '4px 12px',
            background: 'color-mix(in oklch, var(--jl-accent-soft) 60%, transparent)',
            borderTop: '1px solid var(--jl-line-soft)',
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--jl-text-faint)' }}>{t('yesterday')}</span>
          <CheckInButton
            checked={habit.checked_yesterday}
            loading={isTogglingYesterday}
            color={habit.color}
            onToggle={() => onToggle(habit.id, yesterdayDate)}
          />
        </div>
      )}
    </div>
  )
}
