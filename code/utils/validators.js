/**
 * Input validators for note API endpoints.
 * Each parser returns a result object with `ok` flag, `value` on success, or `message` + `details` on error.
 * Follows Option A error format for API responses.
 */

import moment from "moment";

/**
 * Parse and validate a numeric ID from request params.
 *
 * @param {any} rawId - The raw ID value from request parameters
 * @returns {number|null} - Valid positive integer, or null if invalid
 */
function parseId(rawId) {
    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Parse and validate a required title string.
 *
 * @param {any} value - The title value to validate
 * @returns {{ok: boolean, value?: string, message?: string, details?: object}}
 *   - On success: { ok: true, value: "trimmed title" }
 *   - On error: { ok: false, message: "...", details: { field: "title" } }
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
 *
 * @param {any} value - The content value to parse (optional)
 * @returns {{ok: boolean, value?: string, message?: string, details?: object}}
 *   - On success: { ok: true, value: "trimmed content or empty string" }
 *   - On error: { ok: false, message: "...", details: { field: "content" } }
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

/**
 * Parse an optional completed boolean flag.
 *
 * @param {any} value - The completed value to parse (optional)
 * @returns {{ok: boolean, value?: boolean, message?: string, details?: object}}
 *   - On success: { ok: true, value: true|false }
 *   - On error: { ok: false, message: "...", details: { field: "completed" } }
 *   - Default (undefined): { ok: true, value: false }
 */
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

/**
 * Parse and validate an optional priority (1-3).
 *
 * @param {any} value - The priority value to parse (optional)
 * @returns {{ok: boolean, value?: number, message?: string, details?: object}}
 *   - On success: { ok: true, value: 1|2|3 }
 *   - On error: { ok: false, message: "...", details: { field: "priority" } }
 *   - Default (undefined): { ok: true, value: 2 } (medium priority)
 */
function parseOptionalPriority(value) {
    if (value === undefined) {
        return { ok: true, value: 2 }; // Default to medium priority
    }

    const priority = Number(value);
    if (!Number.isInteger(priority) || priority < 1 || priority > 3) {
        return {
            ok: false,
            message: "Priority must be 1, 2, or 3.",
            details: { field: "priority" },
        };
    }

    return { ok: true, value: priority };
}

/**
 * Parse and validate an optional due date.
 *
 * Accepts ISO format (YYYY-MM-DD) or Swiss format (DD.MM.YYYY).
 * Empty/undefined values return null (not required).
 *
 * @param {any} value - The due date value to parse (optional)
 * @returns {{ok: boolean, value?: string|null, message?: string, details?: object}}
 *   - On success: { ok: true, value: "YYYY-MM-DD" or null }
 *   - On error: { ok: false, message: "...", details: { field: "dueAt" } }
 */
function parseOptionalDueDate(value) {
    // Empty string or undefined = null (not required)
    if (value === undefined || value === null || value === "") {
        return { ok: true, value: null };
    }

    if (typeof value !== "string") {
        return {
            ok: false,
            message: "Due date must be a string in ISO format (YYYY-MM-DD) or CH format (DD.MM.YYYY).",
            details: { field: "dueAt" },
        };
    }

    const trimmed = value.trim();
    if (trimmed === "") {
        return { ok: true, value: null };
    }

    // Try strict ISO parsing first (YYYY-MM-DD)
    let m = moment(trimmed, "YYYY-MM-DD", true);
    if (m.isValid()) {
        return { ok: true, value: m.format("YYYY-MM-DD") };
    }

    // Try Swiss format DD.MM.YYYY
    m = moment(trimmed, "DD.MM.YYYY", true);
    if (m.isValid()) {
        return { ok: true, value: m.format("YYYY-MM-DD") };
    }

    // Try generic ISO / datetime parsing as a last resort
    m = moment(trimmed);
    if (m.isValid()) {
        return { ok: true, value: m.utc().format("YYYY-MM-DD") };
    }

    return {
        ok: false,
        message: "Due date is not a valid date.",
        details: { field: "dueAt" },
    };
}

export {
    parseId,
    parseRequiredTitle,
    parseOptionalContent,
    parseOptionalCompleted,
    parseOptionalPriority,
    parseOptionalDueDate,
};
