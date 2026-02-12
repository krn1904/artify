import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const FavoriteToggleSchema = z.object({
  artworkId: z.string().refine((v) => ObjectId.isValid(v), 'Invalid artworkId')
})
