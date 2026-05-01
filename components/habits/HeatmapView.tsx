'use client'

import React, { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Heatmap } from '@/components/rpg/Heatmap'
import { Skeleton } from '@/components/ui/skeleton'

interface HeatmapViewProps {
  data: { date: string; count: number }[]
  isLoading: boolean
}

const INTENSITY_STEPS = [
  { label: '0', intensity: 0 },
  { label: '1', intensity: 1 },
  { label: '2', intensity: 2 },
  { label: '3', intensity: 3 },
  { label: '4+', intensity: 4 },
]

export const HeatmapView: FC<HeatmapViewProps> = React.memo(function HeatmapView({ data, isLoading }) {
  const t = useTranslations('habits.heatmap')

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--jl-bg-elevated)',
        border: '1px solid var(--jl-border)',
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--jl-text-faint)',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {t('title')}
      </p>

      {isLoading ? (
        <div className="flex gap-1">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} style={{ width: 12, height: 12, borderRadius: 3 }} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Heatmap data={data} weeks={26} />
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>{t('less')}</span>
        <div className="flex gap-1">
          {INTENSITY_STEPS.map(({ intensity, label }) => (
            <div
              key={intensity}
              title={label}
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: intensity === 0
                  ? 'var(--jl-bg-sunken)'
                  : `color-mix(in oklch, var(--jl-accent-strong) ${intensity * 25}%, var(--jl-bg-sunken))`,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--jl-text-faint)' }}>{t('more')}</span>
      </div>
    </div>
  )
})
