import { AppError } from '../lib/app-error.js'

export const authErrors = {
  emailAlreadyRegistered: () => new AppError(409, 'Email already registered', 'AUTH_EMAIL_ALREADY_REGISTERED'),
  invalidAuthProviderResponse: (message: string) => new AppError(400, message, 'AUTH_PROVIDER_ERROR'),
  createUserFailed: () => new AppError(500, 'Failed to create user', 'AUTH_CREATE_USER_FAILED'),
  createProfileFailed: (details?: unknown) => new AppError(500, 'Failed to create profile', 'AUTH_CREATE_PROFILE_FAILED', details),
  roleNotConfigured: (role: 'client' | 'provider', details?: unknown) =>
    new AppError(500, `Role "${role}" is not configured in user_roles`, 'AUTH_ROLE_NOT_CONFIGURED', details),
  createProviderProfileFailed: (details?: unknown) =>
    new AppError(500, 'Failed to create provider profile', 'AUTH_CREATE_PROVIDER_PROFILE_FAILED', details),
  assignCategoriesFailed: (details?: unknown) =>
    new AppError(500, 'Failed to assign categories', 'AUTH_ASSIGN_CATEGORIES_FAILED', details),
  invalidSubcategoryIds: () => new AppError(400, 'Invalid subcategory IDs', 'AUTH_INVALID_SUBCATEGORY_IDS'),
  tooManyMainCategories: () => new AppError(400, 'Subcategories must belong to at most 5 main categories', 'AUTH_TOO_MANY_MAIN_CATEGORIES'),
  registrationFailed: (message: string, details?: unknown) => new AppError(500, message, 'AUTH_REGISTRATION_FAILED', details),
  invalidCredentials: () => new AppError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS'),
  missingRefreshToken: () => new AppError(401, 'Missing refresh token', 'AUTH_MISSING_REFRESH_TOKEN'),
  invalidRefreshToken: () => new AppError(401, 'Invalid or expired refresh token', 'AUTH_INVALID_REFRESH_TOKEN'),
  refreshSessionFailed: (details?: unknown) => new AppError(500, 'Failed to refresh session', 'AUTH_REFRESH_SESSION_FAILED', details),
  logoutFailed: (details?: unknown) => new AppError(500, 'Failed to logout', 'AUTH_LOGOUT_FAILED', details),
  profileNotFound: () => new AppError(404, 'Profile not found', 'AUTH_PROFILE_NOT_FOUND'),
  updateProfileFailed: () => new AppError(500, 'Failed to update profile', 'AUTH_UPDATE_PROFILE_FAILED'),
  userNotFound: () => new AppError(404, 'User not found', 'AUTH_USER_NOT_FOUND'),
  currentPasswordIncorrect: () => new AppError(400, 'Current password is incorrect', 'AUTH_CURRENT_PASSWORD_INCORRECT'),
  changePasswordFailed: () => new AppError(500, 'Failed to change password', 'AUTH_CHANGE_PASSWORD_FAILED'),
  forgotPasswordFailed: (message: string) => new AppError(400, message, 'AUTH_FORGOT_PASSWORD_FAILED'),
  resetPasswordFailed: () => new AppError(500, 'Failed to reset password', 'AUTH_RESET_PASSWORD_FAILED'),
}
