import { Skeleton } from '@/components/ui/skeleton'

export function DeckListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--jl-bg-raised)',
            border: '1px solid var(--jl-line)',
          }}
        >
          {/* Color strip placeholder */}
          <Skeleton className="h-2 w-full rounded-none" />
          <div className="p-4 space-y-3">
            {/* Title line */}
            <Skeleton className="h-5 w-2/3" />
            {/* Subtitle line */}
            <Skeleton className="h-3 w-1/3" />
            {/* Button placeholder */}
            <div className="flex justify-end pt-1">
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
