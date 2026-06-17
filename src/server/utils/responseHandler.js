/**
 * Utility functions for consistent API response formatting.
 * Ensures all responses follow a uniform structure across the application.
 */

/**
 * Format a successful response.
 * @param {Express.Response} res - Express response object
 * @param {any} data - The data to return
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function successResponse(res, data, statusCode = 200) {
    res.status(statusCode).json(data);
}

/**
 * Format a created response (201).
 * @param {Express.Response} res - Express response object
 * @param {any} data - The created resource data
 */
function createdResponse(res, data) {
    res.status(201).json(data);
}

/**
 * Format an error response.
 * @param {Express.Response} res - Express response object
 * @param {Object} error - Error payload
 * @param {string} error.code - Machine-readable error code
 * @param {string} error.message - Human-readable error message
 * @param {Object} [error.details] - Optional extra details
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function errorResponse(res, error, statusCode = 400) {
    const payload = {
        code: error?.code || "VALIDATION_ERROR",
        message: error?.message || "Request validation failed.",
    };

    if (error?.details !== undefined) {
        payload.details = error.details;
    }

    res.status(statusCode).json({ error: payload });
}

/**
 * Format a not found error response (404).
 * @param {Express.Response} res - Express response object
 * @param {string} resource - The resource that was not found
 * @param {Object} [details] - Optional details payload
 */
function notFoundResponse(res, resource = "Resource", details = undefined) {
    return errorResponse(
        res,
        {
            code: "NOT_FOUND",
            message: `${resource} not found.`,
            details,
        },
        404,
    );
}

export { successResponse, createdResponse, errorResponse, notFoundResponse };
