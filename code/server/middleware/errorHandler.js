/**
 * Global error handling middleware for Express.
 * Catches all errors thrown in route handlers and formats them consistently.
 * Must be registered LAST in the middleware chain (after all routes).
 */

import { errorResponse } from "../utils/responseHandler.js";

/**
 * Express error handling middleware.
 * @param {Error} error - The error object
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Function} _next - Express next function
 */
function errorHandler(error, req, res, _next) {
    console.error("Error:", error.message || error);

    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
        return errorResponse(
            res,
            {
                code: "INTERNAL_ERROR",
                message: "An unexpected error occurred. Please try again later.",
            },
            500,
        );
    }

    return errorResponse(
        res,
        {
            code: error.code || "VALIDATION_ERROR",
            message: error.message || "Request validation failed.",
            details: error.details,
        },
        statusCode,
    );
}

export default errorHandler;
