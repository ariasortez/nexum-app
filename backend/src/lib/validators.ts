import { zValidator } from '@hono/zod-validator'
import type { z } from 'zod'
import { AppError } from './app-error.js'

function validationHook(result: { success: boolean; error?: z.ZodError }) {
  if (!result.success && result.error) {
    throw new AppError(400, 'Validation error', 'VALIDATION_ERROR', result.error.flatten())
  }
}

export function validateJson<T extends z.ZodTypeAny>(schema: T) {
  return zValidator('json', schema, validationHook)
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return zValidator('query', schema, validationHook)
}
