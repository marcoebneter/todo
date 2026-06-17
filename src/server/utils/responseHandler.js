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
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function errorResponse(res, message, statusCode = 400) {
    res.status(statusCode).json({ error: message });
}

/**
 * Format a not found error response (404).
 * @param {Express.Response} res - Express response object
 * @param {string} resource - The resource that was not found
 */
function notFoundResponse(res, resource = "Resource") {
    res.status(404).json({ error: `${resource} not found.` });
}

export { successResponse, createdResponse, errorResponse, notFoundResponse };
