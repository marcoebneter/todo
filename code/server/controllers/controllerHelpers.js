/**
 * controllerHelpers.js
 * Helper functions to reduce duplicated validation and response logic in controllers.
 */

import {
    parseOptionalCompleted,
    parseOptionalContent,
    parseOptionalPriority,
    parseOptionalDueDate,
    parseRequiredTitle,
    parseId,
} from "../utils/validators.js";
import { errorResponse, notFoundResponse } from "../utils/responseHandler.js";

/**
 * Validate and parse an id parameter. Sends a validation error response when invalid.
 * @param {any} idParam
 * @param {object} res
 * @returns {number|null} parsed id or null when invalid (response already sent)
 */
export function ensureValidId(idParam, res) {
    const id = parseId(idParam);
    if (!id) {
        errorResponse(res, { code: "VALIDATION_ERROR", message: "Invalid note id.", details: { field: "id" } }, 400);
        return null;
    }
    return id;
}

/**
 * If a validator result is not ok, send the standardized validation error response.
 * @param {object} res
 * @param {{ok:boolean,message?:string,details?:object}} result
 * @returns {boolean} true when ok, false when an error response was sent
 */
export function handleValidationResult(res, result) {
    if (!result || !result.ok) {
        const message = result ? result.message : "Invalid input.";
        const details = result ? result.details : undefined;
        errorResponse(res, { code: "VALIDATION_ERROR", message, details }, 400);
        return false;
    }
    return true;
}

/**
 * Build the payload for a PATCH request. Validates each present field and sends
 * a validation error response when a field is invalid.
 * @param {object} body
 * @param {object} res
 * @returns {{ok:boolean,payload?:object,hasUpdates?:boolean}}
 */
export function buildPatchPayload(body, res) {
    const payload = {};

    if (Object.hasOwn(body, "completed")) {
        const completedResult = parseOptionalCompleted(body.completed);
        if (!completedResult.ok) {
            errorResponse(
                res,
                { code: "VALIDATION_ERROR", message: completedResult.message, details: completedResult.details },
                400,
            );
            return { ok: false };
        }
        payload.completed = completedResult.value;
    }

    if (Object.hasOwn(body, "title")) {
        const titleResult = parseRequiredTitle(body.title);
        if (!titleResult.ok) {
            errorResponse(
                res,
                { code: "VALIDATION_ERROR", message: titleResult.message, details: titleResult.details },
                400,
            );
            return { ok: false };
        }
        payload.title = titleResult.value;
    }

    if (Object.hasOwn(body, "content")) {
        const contentResult = parseOptionalContent(body.content);
        if (!contentResult.ok) {
            errorResponse(
                res,
                { code: "VALIDATION_ERROR", message: contentResult.message, details: contentResult.details },
                400,
            );
            return { ok: false };
        }
        payload.content = contentResult.value;
    }

    if (Object.hasOwn(body, "priority")) {
        const priorityResult = parseOptionalPriority(body.priority);
        if (!priorityResult.ok) {
            errorResponse(
                res,
                { code: "VALIDATION_ERROR", message: priorityResult.message, details: priorityResult.details },
                400,
            );
            return { ok: false };
        }
        payload.priority = priorityResult.value;
    }

    if (Object.hasOwn(body, "dueAt")) {
        const dueDateResult = parseOptionalDueDate(body.dueAt);
        if (!dueDateResult.ok) {
            errorResponse(
                res,
                { code: "VALIDATION_ERROR", message: dueDateResult.message, details: dueDateResult.details },
                400,
            );
            return { ok: false };
        }
        payload.dueAt = dueDateResult.value;
    }

    const hasUpdates = Object.keys(payload).length > 0;
    return { ok: true, payload, hasUpdates };
}

/**
 * Send a not found response for the given entity when value is falsy.
 * Returns true if a response was sent.
 */
export function sendNotFoundIfMissing(res, entity, value) {
    if (!value) {
        notFoundResponse(res, entity);
        return true;
    }
    return false;
}
