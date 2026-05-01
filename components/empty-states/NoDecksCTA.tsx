import { BookOpen, Plus } from 'lucide-react'

interface NoDecksCTAProps {
  onCreateDeck: () => void
}

export function NoDecksCTA({ onCreateDeck }: NoDecksCTAProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ background: 'var(--jl-accent-soft)' }}
      >
        <BookOpen size={28} style={{ color: 'var(--jl-accent-strong)' }} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--jl-text)' }}>
          No decks yet
        </h3>
        <p className="text-sm" style={{ color: 'var(--jl-text-soft)' }}>
          Create your first deck to start learning
        </p>
      </div>
      <button
        onClick={onCreateDeck}
        className="flex items-center gap-2 py-2 px-5 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
        style={{
          background: 'var(--jl-accent-strong)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Plus size={16} />
        Create Deck
      </button>
    </div>
  )
}
