export const XP_PER_RATING = { 0: 0, 1: 1, 2: 2, 3: 3 } as const
export const SESSION_BONUS_XP = 15
export const SESSION_BONUS_THRESHOLD = 50
export const DECK_COLORS = ['amber', 'sky', 'violet', 'emerald', 'rose', 'orange'] as const

export const DECK_COLOR_MAP: Record<string, string> = {
  amber: '#f59e0b',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  emerald: '#10b981',
  rose: '#f43f5e',
  orange: '#f97316',
}
