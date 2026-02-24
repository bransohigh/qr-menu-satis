import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

/**
 * Global error handler middleware.
 * HTML istekleri için 404 sayfası render eder; API istekleri için JSON döner.
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

  // HTML isteği ve 404 ise Türkçe sayfa göster
  if (statusCode === 404 && req.accepts('html')) {
    res.status(404).render('hata/404');
    return;
  }

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
