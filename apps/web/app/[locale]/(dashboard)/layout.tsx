import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
