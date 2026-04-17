import { z } from 'zod'

export const creditTransactionTypeSchema = z.enum(['purchase', 'spend', 'refund', 'bonus'])

export const creditTransactionSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  type: creditTransactionTypeSchema,
  amount: z.number().int(),
  description: z.string().nullable(),
  reference_id: z.string().uuid().nullable(),
  created_at: z.string().nullable(),
})

export const purchaseCreditsSchema = z.object({
  amount: z.number().int().positive().min(1).max(1000),
  payment_reference: z.string().min(1).max(100),
})

export type CreditTransactionType = z.infer<typeof creditTransactionTypeSchema>
export type CreditTransaction = z.infer<typeof creditTransactionSchema>
export type PurchaseCredits = z.infer<typeof purchaseCreditsSchema>
