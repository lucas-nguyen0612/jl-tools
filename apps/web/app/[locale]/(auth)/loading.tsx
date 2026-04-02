export default function AuthLoading() {
  return (
    <div className="bg-background flex min-h-dvh animate-pulse items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-muted h-12 w-12 rounded-2xl" />
          <div className="bg-muted h-6 w-24 rounded" />
        </div>
        <div className="bg-card h-64 rounded-xl border" />
      </div>
    </div>
  )
}
