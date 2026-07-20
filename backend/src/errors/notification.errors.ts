import { AppError } from '../lib/app-error.js'

export const notificationErrors = {
  fetchFailed: () => new AppError(500, 'Failed to fetch notifications', 'NOTIFICATION_FETCH_FAILED'),
  createFailed: (details?: unknown) => new AppError(500, 'Failed to create notification', 'NOTIFICATION_CREATE_FAILED', details),
  updateFailed: (details?: unknown) => new AppError(500, 'Failed to update notification', 'NOTIFICATION_UPDATE_FAILED', details),
  notFound: () => new AppError(404, 'Notification not found', 'NOTIFICATION_NOT_FOUND'),
}
