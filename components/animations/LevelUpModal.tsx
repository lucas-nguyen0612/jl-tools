'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/rpg/Avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { onAppEvent } from '@/lib/events'

interface LevelUpData {
  oldLevel: number
  newLevel: number
}

export function LevelUpModal() {
  const [data, setData] = useState<LevelUpData | null>(null)

  useEffect(() => {
    return onAppEvent('jl:levelup', detail => {
      if (detail) setData(detail)
    })
  }, [])

  return (
    <Dialog open={!!data} onOpenChange={() => setData(null)}>
      <DialogContent className="text-center" style={{ maxWidth: 400 }}>
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                <Avatar level={data.newLevel} size={96} />
              </motion.div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--jl-font-display)',
                    fontSize: 28,
                    fontWeight: 600,
                    color: 'var(--jl-accent-strong)',
                  }}
                >
                  Level Up!
                </div>
                <div style={{ color: 'var(--jl-text-soft)', marginTop: 4 }}>
                  {data.oldLevel} →{' '}
                  <strong style={{ color: 'var(--jl-text)' }}>{data.newLevel}</strong>
                </div>
              </div>
              <button
                onClick={() => setData(null)}
                className="px-6 py-2 rounded-jl font-medium text-white"
                style={{ background: 'var(--jl-accent-strong)' }}
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
