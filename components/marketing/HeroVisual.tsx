import { Pause, SkipForward, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar } from '@/components/rpg/Avatar'
import { XPBar } from '@/components/rpg/XPBar'

const HEAT_DATA = [
  4, 2, 0, 3, 1, 4, 3, 0, 2, 4, 1, 3, 4, 2, 0, 1, 3, 4, 2, 3, 1, 0, 4, 2, 3, 1, 4, 0, 3, 2,
  1, 4, 3, 2, 1, 4, 0, 3, 2, 4, 1, 0, 3, 4, 2, 1, 3, 0, 4, 2, 3, 1, 4, 2, 0, 3, 4, 1, 2, 3,
  0, 4, 1, 3, 2, 4, 0, 3, 1, 2, 4, 0, 3, 2, 4, 1, 3, 0, 2, 4, 3, 1, 0, 4, 2, 3, 1, 4, 0, 3,
  2, 1, 4, 3, 0, 2, 4, 1, 3, 0, 2, 4, 1, 3, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 4, 2, 0, 3, 4, 1,
  2, 3, 0, 4, 1, 2, 3, 4, 0, 2, 3, 1, 4, 2, 3, 0, 1, 4, 2, 3, 1, 0, 4, 3, 2, 1, 4, 0, 3, 2,
  4, 1, 0, 3,
]

function DemoHeatmap() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 22 }).map((_, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Array.from({ length: 7 }).map((_, di) => {
            const intensity = HEAT_DATA[(wi * 7 + di) % HEAT_DATA.length]
            return (
              <div
                key={di}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background:
                    intensity === 0
                      ? 'var(--jl-bg-sunken)'
                      : `color-mix(in oklch, var(--jl-accent-strong) ${intensity * 25}%, var(--jl-bg-sunken))`,
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function HeroVisual() {
  const tPomodoro = useTranslations('pomodoro')
  return (
    <div style={{ position: 'relative', height: 530 }}>
      {/* Back card: heatmap */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 60,
          width: 370,
          padding: 16,
          borderRadius: 'var(--jl-r-lg)',
          background: 'var(--jl-bg-raised)',
          border: '1px solid var(--jl-line-soft)',
          boxShadow: 'var(--jl-shadow)',
          transform: 'rotate(-3deg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--jl-accent-strong)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--jl-text)' }}>Deep Work streak</span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--jl-font-mono)',
              fontSize: 13,
              color: 'var(--jl-text)',
            }}
          >
            47 days
          </span>
        </div>
        <DemoHeatmap />
      </div>

      {/* Mid card: pomodoro timer */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: 10,
          width: 290,
          padding: 16,
          borderRadius: 'var(--jl-r-lg)',
          background: 'var(--jl-bg-raised)',
          border: '1px solid var(--jl-line-soft)',
          boxShadow: 'var(--jl-shadow)',
          transform: 'rotate(2deg)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--jl-text-faint)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Focus · Session 3 of 4
        </div>
        <div
          style={{
            fontFamily: 'var(--jl-font-display)',
            fontSize: 76,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--jl-text)',
          }}
        >
          17:42
        </div>
        <div style={{ marginTop: 14 }}>
          <XPBar currentXP={742} maxXP={1000} level={8} compact />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--jl-r)',
              background: 'var(--jl-accent-strong)',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Pause size={14} /> {tPomodoro('controls.pause')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRadius: 'var(--jl-r)',
              border: '1px solid var(--jl-line)',
              background: 'var(--jl-bg-raised)',
              color: 'var(--jl-text)',
            }}
          >
            <SkipForward size={14} />
          </div>
        </div>
      </div>

      {/* Front card: level-up toast */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 10,
          width: 315,
          padding: 16,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          borderRadius: 'var(--jl-r-lg)',
          border: '1px solid color-mix(in oklch, var(--jl-accent) 50%, transparent)',
          background: 'color-mix(in oklch, var(--jl-accent-soft) 60%, var(--jl-bg-raised))',
          boxShadow: 'var(--jl-shadow)',
        }}
      >
        <Avatar level={15} size={56} />
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--jl-accent-ink)',
              fontWeight: 600,
            }}
          >
            Level up!
          </div>
          <div
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 20,
              lineHeight: 1.1,
              marginTop: 2,
              color: 'var(--jl-text)',
            }}
          >
            Lv 14 → 15
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--jl-text-soft)', marginTop: 4 }}>
            Unlocked: <strong>Forest Soundscape</strong>
          </div>
        </div>
      </div>

      {/* Badge decoration */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          right: 10,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--jl-epic)',
          color: 'white',
          display: 'grid',
          placeItems: 'center',
          transform: 'rotate(12deg)',
          boxShadow: 'var(--jl-shadow-lg)',
          fontFamily: 'var(--jl-font-display)',
          fontSize: 11,
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        <div>
          <Trophy size={18} style={{ margin: '0 auto 3px' }} />
          <div>Rare</div>
          <div>Badge</div>
        </div>
      </div>
    </div>
  )
}
