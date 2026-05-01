import { Timer, Play } from 'lucide-react'

interface NoPomodoroSessionsCTAProps {
  onStartSession: () => void
}

export function NoPomodoroSessionsCTA({ onStartSession }: NoPomodoroSessionsCTAProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ background: 'var(--jl-accent-soft)' }}
      >
        <Timer size={28} style={{ color: 'var(--jl-accent-strong)' }} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--jl-text)' }}>
          No sessions yet today
        </h3>
        <p className="text-sm" style={{ color: 'var(--jl-text-soft)' }}>
          Start your first Pomodoro to earn XP
        </p>
      </div>
      <button
        onClick={onStartSession}
        className="flex items-center gap-2 py-2 px-5 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
        style={{
          background: 'var(--jl-accent-strong)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Play size={16} />
        Start Focus
      </button>
    </div>
  )
}
