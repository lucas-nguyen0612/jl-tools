import { Flame, Plus } from 'lucide-react'

interface NoHabitsCTAProps {
  onCreateHabit: () => void
}

export function NoHabitsCTA({ onCreateHabit }: NoHabitsCTAProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ background: 'var(--jl-danger-soft, color-mix(in oklch, var(--jl-danger) 15%, transparent))' }}
      >
        <Flame size={28} style={{ color: 'var(--jl-danger)' }} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--jl-text)' }}>
          No habits tracked yet
        </h3>
        <p className="text-sm" style={{ color: 'var(--jl-text-soft)' }}>
          Build your first habit and start your streak
        </p>
      </div>
      <button
        onClick={onCreateHabit}
        className="flex items-center gap-2 py-2 px-5 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
        style={{
          background: 'var(--jl-accent-strong)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Plus size={16} />
        Add Habit
      </button>
    </div>
  )
}
