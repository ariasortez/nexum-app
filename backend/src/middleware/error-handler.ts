import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { env } from '../config/env.js'
import { AppError } from '../lib/app-error.js'
import type { ApiErrorResponse } from '@fixo/contracts/api'

function statusToErrorCode(status: number): string {
  const statusCodeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
  }

  return statusCodeMap[status] ?? `HTTP_${status}`
}

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${err.message}`, err.stack)

  if (err instanceof HTTPException) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: statusToErrorCode(err.status),
      },
    }
    return c.json(response, err.status)
  }

  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code ?? statusToErrorCode(err.status),
        details: err.details,
      },
    }
    return c.json(response, err.status)
  }

  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
      },
    }
    return c.json(response, 400)
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_SERVER_ERROR',
      details: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  }
  return c.json(response, 500)
}
