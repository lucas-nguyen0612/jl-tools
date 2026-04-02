'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/providers/theme-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { updateProfile } from '@/lib/actions/profile'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Globe, Palette, User, LogOut } from 'lucide-react'
import { toast } from '@/components/ui/sonner'

export function ProfileForm() {
  const t = useTranslations('profile')
  const tAuth = useTranslations('auth')
  const router = useRouter()
  const { profile, signOut, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [locale, setLocale] = useState(profile?.locale ?? 'en')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('locale', locale)
    formData.set('theme', theme)

    startTransition(async () => {
      const result = await updateProfile({ success: false, error: null }, formData)
      if (result.success) {
        toast({ title: t('saved'), variant: 'success' })
        setTheme(theme as 'light' | 'dark' | 'system')
        await refreshProfile()
        router.refresh()
      } else {
        setError(result.error ?? 'Something went wrong')
        if (result.error) {
          toast({ title: result.error, variant: 'error' })
        }
      }
    })
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-5">
        <Avatar className="border-primary/20 h-16 w-16 border-2">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {(displayName || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{displayName || 'User'}</p>
          <p className="text-muted-foreground truncate text-sm">{profile?.email}</p>
        </div>
      </div>

      {/* XP / Level */}
      <div className="bg-card border-border rounded-xl border p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-amber-500">⚡</span>
          <h3 className="font-semibold">
            {t('xp')} & {t('level')}
          </h3>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">
              {t('level')} {profile?.current_level ?? 1}
            </p>
            <p className="text-muted-foreground text-sm">Rookie</p>
          </div>
          <div className="text-right">
            <p className="font-tabular text-lg font-semibold">{profile?.total_xp_earned ?? 0} XP</p>
            <p className="text-muted-foreground text-xs">Total earned</p>
          </div>
        </div>
      </div>

      {/* Settings form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display name */}
        <div className="bg-card border-border space-y-3 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-4 w-4" />
            <Label className="text-sm font-medium">{t('displayName')}</Label>
          </div>
          <Input
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />
        </div>

        {/* Language */}
        <div className="bg-card border-border space-y-3 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <Globe className="text-muted-foreground h-4 w-4" />
            <Label className="text-sm font-medium">{t('language')}</Label>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'en', label: 'English' },
              { value: 'vi', label: 'Tiếng Việt' },
            ].map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => setLocale(lang.value)}
                className={`h-10 flex-1 rounded-lg border text-sm font-medium transition-all ${
                  locale === lang.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="bg-card border-border space-y-3 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <Palette className="text-muted-foreground h-4 w-4" />
            <Label className="text-sm font-medium">{t('theme')}</Label>
          </div>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTheme(th)}
                className={`h-10 flex-1 rounded-lg border text-sm font-medium capitalize transition-all ${
                  theme === th
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                }`}
              >
                {t(th)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isPending}>
          {t('saved')}
        </Button>
      </form>

      <Separator />

      {/* Logout */}
      <Button
        variant="outline"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 w-full"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        {tAuth('logout')}
      </Button>
    </div>
  )
}
