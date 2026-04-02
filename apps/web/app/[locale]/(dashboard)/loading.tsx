export default function LayoutLoading() {
  return (
    <div className="bg-background flex min-h-dvh">
      {/* Desktop sidebar skeleton */}
      <div className="bg-surface-1 hidden w-64 shrink-0 animate-pulse lg:flex">
        <div className="flex flex-1 flex-col">
          <div className="bg-muted/50 h-20" />
          <div className="flex-1 space-y-3 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted/50 h-11 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <main className="flex-1 space-y-6 px-4 py-6">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card h-24 animate-pulse rounded-xl border" />
          ))}
        </div>
      </main>
    </div>
  )
}
