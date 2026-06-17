/**
 * Utility functions for validation across controllers and middleware.
 * Handles ID parsing, title validation, and content validation.
 */

import moment from "moment";

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

/**
 * Parse an optional priority value (1-3).
 * @param {any} value - The priority value to parse
 * @returns {Object} - Result object with ok flag and value or error details
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
 * Parse an optional due date (ISO format YYYY-MM-DD).
 * @param {any} value - The due date value to parse
 * @returns {Object} - Result object with ok flag and value (null if empty) or error details
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
