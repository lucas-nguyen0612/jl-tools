export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-muted h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card h-24 rounded-xl border" />
        ))}
      </div>
    </div>
  )
}
