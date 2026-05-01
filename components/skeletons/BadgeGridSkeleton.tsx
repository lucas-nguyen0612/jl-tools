import { Skeleton } from '@/components/ui/skeleton'

export function BadgeGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  )
}
