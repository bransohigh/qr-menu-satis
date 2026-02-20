import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

/**
 * Global error handler middleware.
 * Catches all errors passed through next(err) and returns a consistent JSON response.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    error: {
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

/**
 * Wraps async route handlers to forward errors to next().
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * Creates an error with a status code.
 */
export function createError(message: string, statusCode = 500, details?: unknown): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.details = details;
  return err;
}
