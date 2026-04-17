import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { env } from '../config/env.js'

interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${err.message}`, err.stack)

  if (err instanceof HTTPException) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
      },
    }
    return c.json(response, err.status)
  }

  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
      },
    }
    return c.json(response, 400)
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      details: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  }
  return c.json(response, 500)
}
