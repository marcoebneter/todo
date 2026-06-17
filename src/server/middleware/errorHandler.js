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
    const message = error.message || "An unexpected error occurred. Please try again later.";

    errorResponse(res, message, statusCode);
}

export default errorHandler;
