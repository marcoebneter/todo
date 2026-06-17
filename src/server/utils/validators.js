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
    if (typeof value !== "string") {
        return {
            ok: false,
            message: "Title must be a string.",
            details: { field: "title" },
        };
    }

    const title = value.trim();
    if (title.length === 0) {
        return {
            ok: false,
            message: "Title is required.",
            details: { field: "title" },
        };
    }

    return { ok: true, value: title };
}

/**
 * Parse an optional content string.
 * @param {any} value - The content value to parse
 * @returns {string} - Trimmed string or empty string if not a string
 */
function parseOptionalContent(value) {
    if (value === undefined) {
        return { ok: true, value: "" };
    }

    if (typeof value !== "string") {
        return {
            ok: false,
            message: "Content must be a string.",
            details: { field: "content" },
        };
    }

    return { ok: true, value: value.trim() };
}

function parseOptionalCompleted(value) {
    if (value === undefined) {
        return { ok: true, value: false };
    }

    if (typeof value !== "boolean") {
        return {
            ok: false,
            message: "Completed must be a boolean.",
            details: { field: "completed" },
        };
    }

    return { ok: true, value };
}

export { parseId, parseRequiredTitle, parseOptionalContent, parseOptionalCompleted };
