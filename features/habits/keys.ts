export const habitsKeys = {
  all: ['habits'] as const,
  list: () => [...habitsKeys.all, 'list'] as const,
  withStatus: (userId: string) => [...habitsKeys.all, 'withStatus', userId] as const,
  heatmap: (userId: string) => [...habitsKeys.all, 'heatmap', userId] as const,
  note: (userId: string, date: string) => [...habitsKeys.all, 'note', userId, date] as const,
} as const
