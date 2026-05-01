import { z } from 'zod'

export const emailUpdateSchema = z.object({
  new_email: z.string().email('Invalid email address'),
})

export type EmailUpdateInput = z.infer<typeof emailUpdateSchema>

export const passwordUpdateSchema = z
  .object({
    current_password: z.string().min(8, 'Current password must be at least 8 characters'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: 'New password must differ from current',
    path: ['new_password'],
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>

export const deleteAccountSchema = z.object({
  character_name_confirm: z.string().min(1, 'Display name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
