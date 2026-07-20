import { AppError } from '../lib/app-error.js'

export const requestErrors = {
  fetchRequestsFailed: () => new AppError(500, 'Failed to fetch requests', 'REQUEST_FETCH_FAILED'),
  requestNotFound: () => new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND'),
  createRequestFailed: (details?: unknown) => new AppError(500, 'Failed to create request', 'REQUEST_CREATE_FAILED', details),
  clientProfileNotFound: () => new AppError(404, 'Client profile not found', 'REQUEST_CLIENT_PROFILE_NOT_FOUND'),
  clientLocationRequired: () => new AppError(400, 'Complete your profile location before creating a request', 'REQUEST_CLIENT_LOCATION_REQUIRED'),
  updateNotAuthorized: () => new AppError(403, 'Not authorized to update this request', 'REQUEST_UPDATE_FORBIDDEN'),
  readNotAuthorized: () => new AppError(403, 'Not authorized to view this request', 'REQUEST_READ_FORBIDDEN'),
  deleteNotAuthorized: () => new AppError(403, 'Not authorized to delete this request', 'REQUEST_DELETE_FORBIDDEN'),
  updateOnlyOpen: () => new AppError(400, 'Can only update open requests', 'REQUEST_UPDATE_ONLY_OPEN'),
  updateRequestFailed: () => new AppError(500, 'Failed to update request', 'REQUEST_UPDATE_FAILED'),
  deleteRequestFailed: () => new AppError(500, 'Failed to delete request', 'REQUEST_DELETE_FAILED'),
  providerNoCategoriesConfigured: () => new AppError(400, 'Configure your service categories before viewing available requests', 'REQUEST_PROVIDER_NO_CATEGORIES'),
  invalidPhotoFormat: () => new AppError(400, 'Invalid photo format. Allowed: jpg, jpeg, png, webp, heic', 'REQUEST_INVALID_PHOTO_FORMAT'),
  generateUploadUrlFailed: () => new AppError(500, 'Failed to generate upload URL', 'REQUEST_UPLOAD_URL_FAILED'),
}
