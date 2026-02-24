import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    details?: unknown;
}
/**
 * Global error handler middleware.
 * HTML istekleri için 404 sayfası render eder; API istekleri için JSON döner.
 */
export declare function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void;
/**
 * Wraps async route handlers to forward errors to next().
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Creates an error with a status code.
 */
export declare function createError(message: string, statusCode?: number, details?: unknown): AppError;
//# sourceMappingURL=errorHandler.d.ts.map