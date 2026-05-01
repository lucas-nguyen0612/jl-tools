import { createClient, getUser } from '@/lib/supabase/server'
import { AvatarUpload } from './AvatarUpload'
import { DisplayNameForm } from './DisplayNameForm'

export async function ProfileSection() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from('profiles')
    .select('character_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  const profile = profileRaw as { character_name: string; avatar_url: string | null } | null

  const characterName = profile?.character_name ?? ''
  const avatarUrl = profile?.avatar_url ?? null
  const email = user.email ?? ''

  return (
    <div
      style={{
        maxWidth: 560,
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      {/* Avatar */}
      <section>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--jl-text-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          Avatar
        </div>
        <AvatarUpload userId={user.id} currentAvatarUrl={avatarUrl} />
      </section>

      {/* Display name */}
      <section>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--jl-text-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          Display name
        </div>
        <DisplayNameForm userId={user.id} initialValue={characterName} />
      </section>

      {/* Email (read-only) */}
      <section>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--jl-text-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          Email
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--jl-bg-sunken)',
            border: '1px solid var(--jl-line-soft)',
            fontSize: 14,
            color: 'var(--jl-text-soft)',
          }}
        >
          {email}
        </div>
        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: 'var(--jl-text-faint)',
          }}
        >
          Email cannot be changed here. Use Account settings to update your email.
        </p>
      </section>
    </div>
  )
}
