import { getTranslations } from 'next-intl/server'
import { TopBar } from '@/components/layout/TopBar'
import { MobileBackLink } from '@/components/settings/MobileBackLink'
import { ProfileSection } from '@/components/settings/ProfileSection'

export const metadata = {
  title: 'Profile — JL-Tools',
}

export default async function ProfileSettingsPage() {
  const t = await getTranslations('settings.profile')
  return (
    <div className="flex flex-col h-full">
      <MobileBackLink />
      <TopBar
        title={t('title')}
        subtitle={t('subtitle')}
      />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '24px 28px 40px' }}
      >
        <ProfileSection />
      </div>
    </div>
  )
}
