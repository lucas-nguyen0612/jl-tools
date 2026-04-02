export default function LoadingPage() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-48 rounded-lg" />
        <div className="bg-muted h-4 w-32 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
