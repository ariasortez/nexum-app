import { AppError } from '../lib/app-error.js'

export const categoryErrors = {
  fetchCategoriesFailed: () => new AppError(500, 'Failed to fetch categories', 'CATEGORY_FETCH_FAILED'),
  categoryNotFound: () => new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND'),
}
