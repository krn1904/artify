import { z } from 'zod'

const objectIdPattern = /^[a-f\d]{24}$/i

export const FavoriteToggleSchema = z.object({
  artworkId: z.string().trim().regex(objectIdPattern, 'Invalid artworkId')
})
