import { z } from 'zod'

export const verificationStatusSchema = z.enum(['pending', 'in_review', 'approved', 'rejected'])

export const documentTypeSchema = z.enum(['id_front', 'id_back', 'selfie', 'business_license', 'other'])

export const verificationDocumentSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  document_type: documentTypeSchema,
  file_url: z.string().url(),
  file_name: z.string(),
  uploaded_at: z.string(),
  verified: z.boolean().nullable(),
  verified_at: z.string().nullable(),
  notes: z.string().nullable(),
})

export const uploadDocumentSchema = z.object({
  document_type: documentTypeSchema,
  file_url: z.string().url(),
  file_name: z.string().min(1).max(255),
})

export const reviewVerificationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional(),
})

export type VerificationStatus = z.infer<typeof verificationStatusSchema>
export type DocumentType = z.infer<typeof documentTypeSchema>
export type VerificationDocument = z.infer<typeof verificationDocumentSchema>
export type UploadDocument = z.infer<typeof uploadDocumentSchema>
export type ReviewVerification = z.infer<typeof reviewVerificationSchema>
