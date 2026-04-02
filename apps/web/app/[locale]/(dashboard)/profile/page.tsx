import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { User, Globe, Palette, ChevronRight } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
      </div>

      {/* Profile card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="border-primary/20 h-16 w-16 border-2">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                U
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">User</p>
              <p className="text-muted-foreground text-sm">user@example.com</p>
            </div>
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* XP / Level */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-amber-500">⚡</span> {t('gamification.progress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{t('profile.level')} 1</p>
              <p className="text-muted-foreground text-sm">Rookie</p>
            </div>
            <div className="text-right">
              <p className="font-tabular text-lg font-semibold">0 XP</p>
              <p className="text-muted-foreground text-xs">Total earned</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress to Level 2</span>
              <span className="font-medium">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border-0 shadow-sm">
        <CardContent className="divide-border divide-y p-0">
          {/* Language */}
          <div className="flex items-center gap-4 p-4">
            <Globe className="text-muted-foreground h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t('profile.language')}</p>
              <p className="text-muted-foreground text-xs capitalize">
                {locale === 'vi' ? 'Tiếng Việt' : 'English'}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </div>

          {/* Theme */}
          <div className="flex items-center gap-4 p-4">
            <Palette className="text-muted-foreground h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t('profile.theme')}</p>
              <p className="text-muted-foreground text-xs capitalize">system</p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </div>

          {/* Dark mode toggle (client-side) */}
          <div className="flex items-center gap-4 p-4">
            <User className="text-muted-foreground h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-muted-foreground text-xs">Toggle dark/light</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
      >
        {t('auth.logout')}
      </Button>
    </div>
  )
}
