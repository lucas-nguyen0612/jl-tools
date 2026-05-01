import { z } from 'zod'

export const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  accent_hue: z.number().int().min(0).max(360),
})

export type AppearanceInput = z.infer<typeof appearanceSchema>
