import { SettingsNav } from '@/components/settings/SettingsNav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <SettingsNav />
      <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
    </div>
  )
}
