'use client'

import React, { type FC } from 'react'
import { format, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns'

interface HeatmapProps {
  data: { date: string; count: number }[]
  weeks?: number
}

function getIntensity(count: number, max: number): number {
  if (count === 0) return 0
  if (max === 0) return 0
  return Math.ceil((count / max) * 4)
}

export const Heatmap: FC<HeatmapProps> = React.memo(function Heatmap({ data, weeks = 26 }) {
  const today = new Date()
  const startDate = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 })
  const max = Math.max(...data.map(d => d.count), 1)

  const grid: Date[][] = []
  for (let w = 0; w < weeks; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(addDays(startDate, w * 7 + d))
    }
    grid.push(week)
  }

  function getCellColor(date: Date): string {
    const entry = data.find(d => isSameDay(new Date(d.date), date))
    const intensity = entry ? getIntensity(entry.count, max) : 0
    if (intensity === 0) return 'var(--jl-bg-sunken)'
    return `color-mix(in oklch, var(--jl-accent-strong) ${intensity * 25}%, var(--jl-bg-sunken))`
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ display: 'flex', gap: 3 }}>
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={`${format(day, 'MMM d')} · ${data.find(d => isSameDay(new Date(d.date), day))?.count ?? 0}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: getCellColor(day),
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})
