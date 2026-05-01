import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { EmailChangeForm } from './EmailChangeForm'
import { PasswordChangeForm } from './PasswordChangeForm'
import { DeleteAccountDialog } from './DeleteAccountDialog'
import { LogoutButton } from '@/components/features/logout-button'

export async function AccountSection() {
  const t = await getTranslations('settings.account')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profileData } = await (supabase
    .from('profiles')
    .select('character_name')
    .eq('user_id', user.id)
    .maybeSingle() as unknown as Promise<{
      data: { character_name: string } | null
      error: { message: string } | null
    }>)

  const email = user.email ?? ''
  const characterName = profileData?.character_name ?? ''

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        padding: '22px 28px 40px',
        maxWidth: 720,
      }}
    >
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <header>
          <h2
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--jl-text)',
              margin: 0,
            }}
          >
            {t('emailTitle')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--jl-text-soft)', margin: '4px 0 0' }}>
            {t('emailCurrent', { email })}
          </p>
        </header>
        <EmailChangeForm currentEmail={email} />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <header>
          <h2
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--jl-text)',
              margin: 0,
            }}
          >
            {t('passwordTitle')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--jl-text-soft)', margin: '4px 0 0' }}>
            {t('passwordDescription')}
          </p>
        </header>
        <PasswordChangeForm />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <header>
          <h2
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--jl-text)',
              margin: 0,
            }}
          >
            {t('signOutTitle')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--jl-text-soft)', margin: '4px 0 0' }}>
            {t('signOutDescription')}
          </p>
        </header>
        <LogoutButton variant="outline" style={{ alignSelf: 'flex-start' }}>
          {t('signOutCta')}
        </LogoutButton>
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          borderTop: '1px solid var(--jl-border)',
          paddingTop: 24,
        }}
      >
        <header>
          <h2
            style={{
              fontFamily: 'var(--jl-font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--jl-danger, #ef4444)',
              margin: 0,
            }}
          >
            {t('deleteAccount.title')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--jl-text-soft)', margin: '4px 0 0' }}>
            {t('deleteAccount.description')}
          </p>
        </header>
        <DeleteAccountDialog characterName={characterName} />
      </section>
    </div>
  )
}
