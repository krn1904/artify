import { z } from 'zod'

export const UserProfileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120).optional(),
  avatarUrl: z
    .string()
    .trim()
    .url('Avatar URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  bio: z.string().trim().max(1000, 'Bio must be 1000 characters or fewer').optional().or(z.literal('')),
  role: z.enum(['CUSTOMER', 'ARTIST']).optional(),
})

