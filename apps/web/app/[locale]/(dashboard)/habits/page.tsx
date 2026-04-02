import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Flame } from 'lucide-react'
import Link from 'next/link'

export default async function HabitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('habits.myHabits')}</h1>
          <p className="text-muted-foreground mt-1">{t('habits.today')}</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t('habits.addHabit')}
        </Button>
      </div>

      {/* Empty state */}
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
            <Flame className="text-muted-foreground h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="font-semibold">{t('habits.noHabitsYet')}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t('habits.createFirst')}</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t('habits.addHabit')}
          </Button>
        </CardContent>
      </Card>

      {/* Habit list placeholder */}
      <div className="space-y-3">{/* Habit items would go here */}</div>
    </div>
  )
}
