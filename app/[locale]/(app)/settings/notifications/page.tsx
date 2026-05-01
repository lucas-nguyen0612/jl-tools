import { getTranslations } from 'next-intl/server'
import { TopBar } from '@/components/layout/TopBar'
import { MobileBackLink } from '@/components/settings/MobileBackLink'
import { NotificationsSection } from '@/components/settings/NotificationsSection'

export default async function SettingsNotificationsPage() {
  const t = await getTranslations('settings.notifications')
  return (
    <div className="flex flex-col h-full">
      <MobileBackLink />
      <TopBar title={t('title')} />
      <NotificationsSection />
    </div>
  )
}
