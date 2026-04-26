import { supabaseAdmin } from '../lib/supabase.js'
import type { UploadDocument, ReviewVerification } from '../schemas/index.js'
import { verificationErrors } from '../errors/verification.errors.js'

export async function getProviderByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_profiles')
    .select('id, verification_status')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw verificationErrors.providerProfileNotFound()
  }

  return data
}

export async function getVerificationDocuments(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('verification_documents')
    .select('*')
    .eq('provider_id', providerId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw verificationErrors.fetchDocumentsFailed()
  }

  return data
}

export async function uploadDocument(providerId: string, input: UploadDocument) {
  const { data: existing } = await supabaseAdmin
    .from('verification_documents')
    .select('id')
    .eq('provider_id', providerId)
    .eq('document_type', input.document_type)
    .single()

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('verification_documents')
      .update({
        file_url: input.file_url,
        file_name: input.file_name,
        uploaded_at: new Date().toISOString(),
        verified: null,
        verified_at: null,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw verificationErrors.updateDocumentFailed()
    }

    return data
  }

  const { data, error } = await supabaseAdmin
    .from('verification_documents')
    .insert({
      provider_id: providerId,
      document_type: input.document_type,
      file_url: input.file_url,
      file_name: input.file_name,
    })
    .select()
    .single()

  if (error) {
    throw verificationErrors.uploadDocumentFailed()
  }

  return data
}

export async function deleteDocument(providerId: string, documentId: string) {
  const { data: existing } = await supabaseAdmin
    .from('verification_documents')
    .select('id, provider_id')
    .eq('id', documentId)
    .single()

  if (!existing) {
    throw verificationErrors.documentNotFound()
  }

  if (existing.provider_id !== providerId) {
    throw verificationErrors.notAuthorized()
  }

  const { error } = await supabaseAdmin
    .from('verification_documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    throw verificationErrors.deleteDocumentFailed()
  }

  return { success: true }
}

export async function submitForReview(providerId: string) {
  const { data: documents } = await supabaseAdmin
    .from('verification_documents')
    .select('document_type')
    .eq('provider_id', providerId)

  if (!documents || documents.length === 0) {
    throw verificationErrors.noDocumentsUploaded()
  }

  const requiredTypes = ['id_front', 'id_back', 'selfie'] as const
  const uploadedTypes = documents.map(d => d.document_type)
  const missing = requiredTypes.filter(t => !uploadedTypes.includes(t))

  if (missing.length > 0) {
    throw verificationErrors.missingRequiredDocuments(missing)
  }

  const { error } = await supabaseAdmin
    .from('provider_profiles')
    .update({ verification_status: 'in_review' })
    .eq('id', providerId)

  if (error) {
    throw verificationErrors.submitForReviewFailed()
  }

  return { message: 'Submitted for review' }
}

export async function getVerificationStatus(providerId: string) {
  const { data: provider, error: providerError } = await supabaseAdmin
    .from('provider_profiles')
    .select('verification_status, verification_notes, verified_at')
    .eq('id', providerId)
    .single()

  if (providerError || !provider) {
    throw verificationErrors.providerNotFound()
  }

  const { data: documents } = await supabaseAdmin
    .from('verification_documents')
    .select('document_type, verified, uploaded_at')
    .eq('provider_id', providerId)

  return {
    status: provider.verification_status,
    notes: provider.verification_notes,
    verified_at: provider.verified_at,
    documents: documents || [],
  }
}

export async function getPendingVerifications(page: number, limit: number) {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('provider_profiles')
    .select(`
      id,
      slug,
      business_name,
      verification_status,
      created_at,
      user:profiles (
        full_name,
        email:id
      ),
      documents:verification_documents (
        id,
        document_type,
        file_url,
        uploaded_at
      )
    `, { count: 'exact' })
    .eq('verification_status', 'in_review')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    throw verificationErrors.fetchVerificationsFailed()
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  }
}

export async function reviewProvider(
  providerId: string,
  adminId: string,
  input: ReviewVerification
) {
  const { data: provider } = await supabaseAdmin
    .from('provider_profiles')
    .select('verification_status')
    .eq('id', providerId)
    .single()

  if (!provider) {
    throw verificationErrors.providerNotFound()
  }

  if (provider.verification_status !== 'in_review') {
    throw verificationErrors.providerNotInReview()
  }

  const baseUpdate = {
    verification_status: input.status as 'approved' | 'rejected',
    verification_notes: input.notes || null,
    reviewed_by: adminId,
  }

  const updateData = input.status === 'approved'
    ? { ...baseUpdate, verified: true, verified_at: new Date().toISOString() }
    : baseUpdate

  const { error } = await supabaseAdmin
    .from('provider_profiles')
    .update(updateData)
    .eq('id', providerId)

  if (error) {
    throw verificationErrors.updateVerificationFailed()
  }

  if (input.status === 'approved') {
    await supabaseAdmin
      .from('verification_documents')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('provider_id', providerId)
  }

  return {
    message: `Provider ${input.status}`,
    status: input.status,
  }
}

export async function generateUploadUrl(providerId: string, fileName: string) {
  const fileExt = fileName.split('.').pop()
  const filePath = `verifications/${providerId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUploadUrl(filePath)

  if (error) {
    throw verificationErrors.generateUploadUrlFailed()
  }

  return {
    upload_url: data.signedUrl,
    file_path: filePath,
    public_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`,
  }
}
