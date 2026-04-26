export type AppErrorStatus =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500

export class AppError extends Error {
  constructor(
    public status: AppErrorStatus,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}
