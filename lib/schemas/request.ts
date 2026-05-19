import { z } from 'zod'

const objectIdPattern = /^[a-f\d]{24}$/i

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const RequestCreateSchema = z.object({
  artistId: z.string().trim().regex(objectIdPattern, 'Invalid artist id'),
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
    }, z.number().nonnegative('Budget must be a positive number')),
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
        return parseDateInput(v)
      }
      return v
    }, z.date().refine((d) => d >= startOfToday(), 'Due date cannot be before today').optional()),
})

export const RequestStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'ACCEPTED', 'DECLINED', 'COMPLETED']),
})
