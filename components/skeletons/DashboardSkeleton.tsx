import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* HeroCard skeleton */}
      <div
        className="rounded-xl p-4 space-y-4"
        style={{ background: 'var(--jl-bg-raised)', border: '1px solid var(--jl-line)' }}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* 3 tool cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--jl-bg-raised)', border: '1px solid var(--jl-line)' }}
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>

      {/* 4 stat cards skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'var(--jl-bg-raised)', border: '1px solid var(--jl-line)' }}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
