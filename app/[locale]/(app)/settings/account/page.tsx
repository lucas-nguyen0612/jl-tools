import { getTranslations } from 'next-intl/server'
import { TopBar } from '@/components/layout/TopBar'
import { MobileBackLink } from '@/components/settings/MobileBackLink'
import { AccountSection } from '@/components/settings/AccountSection'

export default async function SettingsAccountPage() {
  const t = await getTranslations('settings.account')
  return (
    <div className="flex flex-col h-full">
      <MobileBackLink />
      <TopBar title={t('title')} />
      <AccountSection />
    </div>
  )
}
