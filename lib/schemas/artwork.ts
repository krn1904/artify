import { z } from 'zod'

// API body schema (accepts tags as array or comma string)
export const ArtworkCreateBodySchema = z.object({
  title: z.string().trim().min(3, 'Title too short').max(120),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  price: z.preprocess((v) => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }, z.number().nonnegative('Price must be non-negative')),
  description: z.string().trim().max(2000).optional(),
  tags: z
    .preprocess((v) => {
      if (Array.isArray(v)) return v
      if (typeof v === 'string') {
        return v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return []
    }, z.array(z.string()).max(5, 'Up to 5 tags'))
    .optional(),
})

// Form schema (accepts tags as comma string and transforms to array)
export const ArtworkCreateFormSchema = z.object({
  title: z.string().trim().min(3, 'Title too short').max(120),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  price: z.preprocess((v) => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }, z.number().nonnegative('Price must be non-negative')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  tags: z
    .string()
    .trim()
    .max(200)
    .transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 5)),
})

