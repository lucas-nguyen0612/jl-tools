'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Progress } from '@/components/ui/progress'
import { LEVEL_THRESHOLDS, LEVEL_TITLES } from '@/lib/constants/levels'

const LEVELS = LEVEL_THRESHOLDS.map((threshold, i) => ({
  level: i + 1,
  threshold,
  title: LEVEL_TITLES[i + 1] ?? { vi: '', en: '' },
}))

export function XpBar() {
  const { profile } = useAuth()
  const prevXpRef = useRef(profile?.total_xp_earned ?? 0)
  const [animatedXp, setAnimatedXp] = useState(profile?.total_xp_earned ?? 0)
  const [animating, setAnimating] = useState(false)

  const totalXp = profile?.total_xp_earned ?? 0
  const level = profile?.current_level ?? 1
  const locale = profile?.locale ?? 'en'

  // Animate XP bar when XP changes
  useEffect(() => {
    if (totalXp > prevXpRef.current) {
      setAnimating(true)
      const diff = totalXp - prevXpRef.current
      const steps = 20
      let step = 0
      const interval = setInterval(() => {
        step++
        setAnimatedXp(Math.round(prevXpRef.current + (diff * step) / steps))
        if (step >= steps) {
          clearInterval(interval)
          setAnimatedXp(totalXp)
          setAnimating(false)
        }
      }, 25)
      prevXpRef.current = totalXp
      return () => clearInterval(interval)
    }
    prevXpRef.current = totalXp
    setAnimatedXp(totalXp)
  }, [totalXp])

  const currentThreshold = LEVELS[level - 1]?.threshold ?? 0
  const nextThreshold = LEVELS[level]?.threshold ?? LEVELS[LEVELS.length - 1].threshold
  const xpInLevel = animatedXp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100

  const title = LEVELS[level - 1]?.title[locale as 'en' | 'vi'] ?? 'Rookie'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">XP</span>
        <span
          className={`font-tabular font-semibold transition-all ${animating ? 'text-primary scale-105' : ''}`}
        >
          {animatedXp} XP
        </span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-2" />
        {animating && (
          <div
            className="bg-primary/30 absolute inset-0 animate-pulse rounded-full"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{title}</span>
        <span className="text-muted-foreground">
          {xpNeeded - xpInLevel} XP to Level {level + 1}
        </span>
      </div>
    </div>
  )
}
