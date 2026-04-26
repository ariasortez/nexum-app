import { AppError } from '../lib/app-error.js'

export const providerErrors = {
  profileNotFound: () => new AppError(404, 'Provider profile not found', 'PROVIDER_PROFILE_NOT_FOUND'),
  updateProfileFailed: () => new AppError(500, 'Failed to update profile', 'PROVIDER_UPDATE_PROFILE_FAILED'),
  invalidSubcategoryIds: () => new AppError(400, 'Invalid subcategory IDs', 'PROVIDER_INVALID_SUBCATEGORY_IDS'),
  tooManyMainCategories: () => new AppError(400, 'Subcategories must belong to at most 5 main categories', 'PROVIDER_TOO_MANY_MAIN_CATEGORIES'),
  tooManySubcategories: () => new AppError(400, 'Cannot have more than 10 subcategories', 'PROVIDER_TOO_MANY_SUBCATEGORIES'),
  updateCategoriesFailed: () => new AppError(500, 'Failed to update categories', 'PROVIDER_UPDATE_CATEGORIES_FAILED'),
  fetchCategoriesFailed: () => new AppError(500, 'Failed to fetch categories', 'PROVIDER_FETCH_CATEGORIES_FAILED'),
  fetchWorkPostsFailed: () => new AppError(500, 'Failed to fetch work posts', 'PROVIDER_FETCH_WORK_POSTS_FAILED'),
  workPostNotFound: () => new AppError(404, 'Work post not found', 'PROVIDER_WORK_POST_NOT_FOUND'),
  subcategoryNotRegistered: () => new AppError(400, 'Subcategory must be one of your registered categories', 'PROVIDER_SUBCATEGORY_NOT_REGISTERED'),
  createWorkPostFailed: () => new AppError(500, 'Failed to create work post', 'PROVIDER_CREATE_WORK_POST_FAILED'),
  notAuthorized: () => new AppError(403, 'Not authorized', 'PROVIDER_FORBIDDEN'),
  updateWorkPostFailed: () => new AppError(500, 'Failed to update work post', 'PROVIDER_UPDATE_WORK_POST_FAILED'),
  deleteWorkPostFailed: () => new AppError(500, 'Failed to delete work post', 'PROVIDER_DELETE_WORK_POST_FAILED'),
  generateUploadUrlFailed: () => new AppError(500, 'Failed to generate upload URL', 'PROVIDER_GENERATE_UPLOAD_URL_FAILED'),
}
