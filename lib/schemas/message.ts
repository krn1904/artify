import { z } from 'zod'

export const TextMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
})

export const BidProposalCreateSchema = z.object({
  type: z.literal('bid_proposal'),
  amount: z.number().positive('Amount must be a positive number'),
})

export const BidProposalResponseSchema = z.object({
  action: z.enum(['accepted', 'declined']),
})
