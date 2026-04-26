import { AppError } from '../lib/app-error.js'

export const verificationErrors = {
  providerProfileNotFound: () => new AppError(404, 'Provider profile not found', 'VERIFICATION_PROVIDER_PROFILE_NOT_FOUND'),
  fetchDocumentsFailed: () => new AppError(500, 'Failed to fetch documents', 'VERIFICATION_FETCH_DOCUMENTS_FAILED'),
  updateDocumentFailed: () => new AppError(500, 'Failed to update document', 'VERIFICATION_UPDATE_DOCUMENT_FAILED'),
  uploadDocumentFailed: () => new AppError(500, 'Failed to upload document', 'VERIFICATION_UPLOAD_DOCUMENT_FAILED'),
  documentNotFound: () => new AppError(404, 'Document not found', 'VERIFICATION_DOCUMENT_NOT_FOUND'),
  notAuthorized: () => new AppError(403, 'Not authorized', 'VERIFICATION_FORBIDDEN'),
  deleteDocumentFailed: () => new AppError(500, 'Failed to delete document', 'VERIFICATION_DELETE_DOCUMENT_FAILED'),
  noDocumentsUploaded: () => new AppError(400, 'No documents uploaded', 'VERIFICATION_NO_DOCUMENTS_UPLOADED'),
  missingRequiredDocuments: (missing: string[]) => new AppError(400, `Missing required documents: ${missing.join(', ')}`, 'VERIFICATION_MISSING_REQUIRED_DOCUMENTS'),
  submitForReviewFailed: () => new AppError(500, 'Failed to submit for review', 'VERIFICATION_SUBMIT_FAILED'),
  providerNotFound: () => new AppError(404, 'Provider not found', 'VERIFICATION_PROVIDER_NOT_FOUND'),
  fetchVerificationsFailed: () => new AppError(500, 'Failed to fetch verifications', 'VERIFICATION_FETCH_VERIFICATIONS_FAILED'),
  providerNotInReview: () => new AppError(400, 'Provider is not in review', 'VERIFICATION_PROVIDER_NOT_IN_REVIEW'),
  updateVerificationFailed: () => new AppError(500, 'Failed to update verification', 'VERIFICATION_UPDATE_FAILED'),
  generateUploadUrlFailed: () => new AppError(500, 'Failed to generate upload URL', 'VERIFICATION_GENERATE_UPLOAD_URL_FAILED'),
}
