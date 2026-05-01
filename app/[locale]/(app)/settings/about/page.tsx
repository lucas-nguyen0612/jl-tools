import { getTranslations } from 'next-intl/server'
import { TopBar } from '@/components/layout/TopBar'
import { MobileBackLink } from '@/components/settings/MobileBackLink'
import { AboutSection } from '@/components/settings/AboutSection'

export default async function SettingsAboutPage() {
  const t = await getTranslations('settings.about')
  return (
    <div className="flex flex-col h-full">
      <MobileBackLink />
      <TopBar title={t('title')} />
      <AboutSection />
    </div>
  )
}
