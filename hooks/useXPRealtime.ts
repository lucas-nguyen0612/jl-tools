'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { emitAppEvent } from '@/lib/events'

export function useXPRealtime(userId: string | null) {
  const { level } = useUserStore()

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel('character-stats-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'character_stats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const stats = payload.new as {
            level: number
            total_xp: number
            xp_in_current_level: number
          }

          const oldLevel = level

          if (stats.level > oldLevel) {
            emitAppEvent('jl:levelup', { oldLevel, newLevel: stats.level })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
