import { Skeleton } from '@/components/ui/skeleton'

export function CharacterSheetSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Avatar circle + name */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          {/* Name line */}
          <Skeleton className="h-5 w-40" />
          {/* Level line */}
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* XP bar */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* 4 stat bars */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
