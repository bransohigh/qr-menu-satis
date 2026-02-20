"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.createError = createError;
/**
 * Global error handler middleware.
 * Catches all errors passed through next(err) and returns a consistent JSON response.
 */
function errorHandler(err, _req, res, _next) {
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
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
/**
 * Creates an error with a status code.
 */
function createError(message, statusCode = 500, details) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.details = details;
    return err;
}
//# sourceMappingURL=errorHandler.js.map