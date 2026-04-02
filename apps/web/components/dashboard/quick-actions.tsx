'use client'

import Link from 'next/link'
import { Timer, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuickActionsProps {
  locale: string
}

export function QuickActions({ locale }: QuickActionsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-0 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4 text-indigo-500" />
            Pomodoro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`/${locale}/pomodoro`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Timer className="h-4 w-4" />
            Start Pomodoro
          </Link>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4 text-emerald-500" />
            Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`/${locale}/habits`}
            className="border-border bg-background hover:bg-accent flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors"
          >
            <CheckSquare className="h-4 w-4" />
            Check Habits
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
