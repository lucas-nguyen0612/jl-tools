'use client'

import { useTranslations } from 'next-intl'

const HABIT_ICONS = [
  '🏃',
  '💪',
  '📚',
  '🧘',
  '💧',
  '🥗',
  '😴',
  '🧹',
  '💻',
  '🎨',
  '🎵',
  '✍️',
  '📱',
  '🌱',
  '🧠',
  '💊',
  '🚿',
  '🦷',
  '🛏️',
  '📝',
  '🎯',
  '🏋️',
  '🚴',
  '⏰',
]

interface HabitIconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function HabitIconPicker({ value, onChange }: HabitIconPickerProps) {
  const t = useTranslations('habits')

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('icon') ?? 'Icon'}</label>
      <div className="grid grid-cols-8 gap-1">
        {HABIT_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all ${
              value === icon
                ? 'bg-primary text-primary-foreground scale-110'
                : 'bg-muted hover:bg-accent hover:scale-105'
            }`}
            aria-label={icon}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}
