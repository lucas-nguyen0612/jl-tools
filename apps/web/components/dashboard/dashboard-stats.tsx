'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Timer, CheckCircle, Zap, Flame } from 'lucide-react'

interface DashboardStatsProps {
  sessionsToday: number
  habitsToday: number
  xpToday: number
  locale: string
}

export function DashboardStats({ sessionsToday, habitsToday, xpToday }: DashboardStatsProps) {
  const t = useTranslations('dashboard')

  const stats = [
    {
      icon: Timer,
      label: t('sessionsCompleted'),
      value: sessionsToday,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      icon: CheckCircle,
      label: t('habitsCompleted'),
      value: habitsToday,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      icon: Zap,
      label: t('xpEarned'),
      value: xpToday,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="font-tabular text-2xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground truncate text-xs">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
