import { getTranslations } from 'next-intl/server'
import { TopBar } from '@/components/layout/TopBar'
import { MobileBackLink } from '@/components/settings/MobileBackLink'
import { AppearanceSection } from '@/components/settings/AppearanceSection'

export default async function SettingsAppearancePage() {
  const t = await getTranslations('settings.appearance')
  return (
    <div className="flex flex-col h-full">
      <MobileBackLink />
      <TopBar title={t('title')} />
      <AppearanceSection />
    </div>
  )
}
