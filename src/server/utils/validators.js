/**
 * Utility functions for validation across controllers and middleware.
 * Handles ID parsing, title validation, and content validation.
 */

/**
 * Parse and validate a numeric ID.
 * @param {any} rawId - The raw ID value from request params
 * @returns {number|null} - Valid positive integer or null if invalid
 */
function parseId(rawId) {
    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Parse and validate a required title string.
 * @param {any} value - The title value to validate
 * @returns {string|null} - Trimmed non-empty string or null if invalid
 */
function parseRequiredTitle(value) {
    if (typeof value !== "string" || value.trim().length === 0) {
        return null;
    }
    return value.trim();
}

/**
 * Parse an optional content string.
 * @param {any} value - The content value to parse
 * @returns {string} - Trimmed string or empty string if not a string
 */
function parseOptionalContent(value) {
    return typeof value === "string" ? value.trim() : "";
}

export { parseId, parseRequiredTitle, parseOptionalContent };
