import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
      </div>
      <ProfileForm />
    </div>
  )
}
