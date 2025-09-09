import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const CommissionCreateSchema = z.object({
  artistId: z.string().trim().refine((v) => ObjectId.isValid(v), 'Invalid artist id'),
  title: z.string().trim().min(3).max(120).optional(),
  brief: z.string().trim().min(10, 'Please provide a short brief (min 10 chars)').max(2000),
  budget: z
    .preprocess((v) => {
      if (v == null) return undefined
      if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
      if (typeof v === 'string') {
        const s = v.trim()
        if (s === '') return undefined
        const n = Number(s)
        return Number.isFinite(n) ? n : undefined
      }
      return undefined
    }, z.number().nonnegative('Budget must be a positive number'))
    .optional(),
  referenceUrls: z
    .preprocess((v) => {
      if (v == null) return undefined
      if (Array.isArray(v)) return v
      if (typeof v === 'string') {
        const lines = v
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
        return lines
      }
      return undefined
    }, z.array(z.string().url()).max(10))
    .optional(),
  dueDate: z
    .preprocess((v) => {
      if (v == null || v === '') return undefined
      if (typeof v === 'string') {
        const d = new Date(v)
        return Number.isNaN(d.getTime()) ? undefined : d
      }
      return v
    }, z.date())
    .optional(),
})

export const CommissionStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'ACCEPTED', 'DECLINED', 'COMPLETED']),
})

