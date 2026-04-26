import { AppError } from '../lib/app-error.js'

export const requestErrors = {
  fetchRequestsFailed: () => new AppError(500, 'Failed to fetch requests', 'REQUEST_FETCH_FAILED'),
  requestNotFound: () => new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND'),
  createRequestFailed: () => new AppError(500, 'Failed to create request', 'REQUEST_CREATE_FAILED'),
  updateNotAuthorized: () => new AppError(403, 'Not authorized to update this request', 'REQUEST_UPDATE_FORBIDDEN'),
  deleteNotAuthorized: () => new AppError(403, 'Not authorized to delete this request', 'REQUEST_DELETE_FORBIDDEN'),
  updateOnlyOpen: () => new AppError(400, 'Can only update open requests', 'REQUEST_UPDATE_ONLY_OPEN'),
  updateRequestFailed: () => new AppError(500, 'Failed to update request', 'REQUEST_UPDATE_FAILED'),
  deleteRequestFailed: () => new AppError(500, 'Failed to delete request', 'REQUEST_DELETE_FAILED'),
}
