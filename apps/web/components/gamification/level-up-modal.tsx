'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LEVEL_TITLES } from '@/lib/constants/levels'
import { Zap, Trophy } from 'lucide-react'

interface LevelUpModalProps {
  open: boolean
  newLevel: number
  locale?: string
  onClose: () => void
}

export function LevelUpModal({ open, newLevel, locale = 'en', onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (open) {
      setShow(true)
    } else {
      // Delay close for exit animation
      const t = setTimeout(() => setShow(false), 400)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!show) return null

  const title = LEVEL_TITLES[newLevel]?.[locale as 'en' | 'vi'] ?? 'Level Up!'
  const prevTitle = LEVEL_TITLES[newLevel - 1]?.[locale as 'en' | 'vi'] ?? ''

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-0 text-center sm:max-w-sm">
        <div className="relative z-10 space-y-4 py-6">
          {/* Animated glow effect */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 animate-pulse rounded-full bg-amber-400/20 blur-2xl" />
          </div>

          {/* Trophy icon */}
          <div className="relative z-10 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>

          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 animate-bounce text-amber-500" />
              <DialogTitle className="text-2xl font-bold">Level {newLevel}!</DialogTitle>
              <Zap
                className="h-5 w-5 animate-bounce text-amber-500"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            <DialogDescription className="text-foreground text-base font-medium">
              {title}
            </DialogDescription>
          </DialogHeader>

          <p className="text-muted-foreground text-sm">
            {prevTitle ? `You&apos;ve evolved from ${prevTitle}!` : 'Keep going!'}
          </p>

          {/* Level badge */}
          <div className="flex justify-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
              {newLevel}
            </div>
          </div>

          <p className="text-muted-foreground text-xs">Keep completing sessions to level up!</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
