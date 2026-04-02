'use client'

import { useTranslations } from 'next-intl'

const HABIT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

interface HabitColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function HabitColorPicker({ value, onChange }: HabitColorPickerProps) {
  const t = useTranslations('habits')

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('color') ?? 'Color'}</label>
      <div className="flex flex-wrap gap-2">
        {HABIT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-8 w-8 rounded-full transition-all ${
              value === color
                ? 'ring-offset-background scale-110 ring-2 ring-offset-2'
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
            aria-label={color}
          />
        ))}
      </div>
    </div>
  )
}
