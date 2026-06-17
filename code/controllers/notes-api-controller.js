/**
 * NotesController - HTTP request handler for note operations.
 * Class-based controller following MVC pattern.
 * Validates requests, delegates business logic to NoteService, formats responses.
 */

import NoteService from "../services/note-service.js";
import { successResponse, createdResponse, errorResponse } from "../utils/response-handler.js";
import {
    parseRequiredTitle,
    parseOptionalContent,
    parseOptionalCompleted,
    parseOptionalPriority,
    parseOptionalDueDate,
} from "../utils/validators.js";
import {
    ensureValidId,
    handleValidationResult,
    buildPatchPayload,
    sendNotFoundIfMissing,
} from "./controller-helpers.js";

class NotesApiController {
    constructor() {
        this.noteService = new NoteService();
    }

    /**
     * GET /api/notes - List all notes with optional filtering.
     * Query params:
     *   - sort: "oldest" (default), "newest", or "priority"
     *   - activeOnly: "true" to show only uncompleted notes
     */
    async list(req, res, next) {
        try {
            const sort = ["newest", "priority", "dueDate"].includes(req.query.sort) ? req.query.sort : "oldest";
            const activeOnly = req.query.activeOnly === "true";

            const notes = await this.noteService.listNotes({
                sort,
                activeOnly,
            });
            successResponse(res, notes);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/notes - Create a new note.
     * Body: { title: string (required), content?: string, priority?: 1-3, dueAt?: string (ISO format YYYY-MM-DD) }
     */
    async create(req, res, next) {
        try {
            const titleResult = parseRequiredTitle(req.body.title);
            const contentResult = parseOptionalContent(req.body.content);
            const priorityResult = parseOptionalPriority(req.body.priority);
            const dueDateResult = parseOptionalDueDate(req.body.dueAt);

            if (!handleValidationResult(res, titleResult)) return;
            if (!handleValidationResult(res, contentResult)) return;
            if (!handleValidationResult(res, priorityResult)) return;
            if (!handleValidationResult(res, dueDateResult)) return;

            const note = await this.noteService.createNote(
                titleResult.value,
                contentResult.value,
                priorityResult.value,
                dueDateResult.value,
            );
            createdResponse(res, note);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/notes/:id - Replace an entire note.
     * Params: id (positive integer)
     * Body: { title: string (required), content?: string, completed?: boolean, priority?: 1-3, dueAt?: string (ISO format YYYY-MM-DD) }
     */
    async replace(req, res, next) {
        try {
            const id = ensureValidId(req.params.id, res);
            if (id === null) return;

            const titleResult = parseRequiredTitle(req.body.title);
            const contentResult = parseOptionalContent(req.body.content);
            const completedResult = parseOptionalCompleted(req.body.completed);
            const priorityResult = parseOptionalPriority(req.body.priority);
            const dueDateResult = parseOptionalDueDate(req.body.dueAt);

            if (!handleValidationResult(res, titleResult)) return;
            if (!handleValidationResult(res, contentResult)) return;
            if (!handleValidationResult(res, completedResult)) return;
            if (!handleValidationResult(res, priorityResult)) return;
            if (!handleValidationResult(res, dueDateResult)) return;

            const note = await this.noteService.updateNote(
                id,
                titleResult.value,
                contentResult.value,
                completedResult.value,
                priorityResult.value,
                dueDateResult.value,
            );

            if (sendNotFoundIfMissing(res, "Note", note)) return;

            successResponse(res, note);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notes/:id - Partially update a note.
     * Params: id (positive integer)
     * Body: { title?: string, content?: string, completed?: boolean, priority?: 1-3 }
     */
    async patch(req, res, next) {
        try {
            const id = ensureValidId(req.params.id, res);
            if (id === null) return;

            const buildResult = buildPatchPayload(req.body, res);
            if (!buildResult.ok) return;

            if (!buildResult.hasUpdates) {
                return errorResponse(
                    res,
                    {
                        code: "VALIDATION_ERROR",
                        message: "No valid fields to update.",
                        details: { fields: ["title", "content", "completed", "priority", "dueAt"] },
                    },
                    400,
                );
            }

            const result = await this.noteService.patchNote(id, buildResult.payload);

            if (sendNotFoundIfMissing(res, "Note", result.note)) return;

            successResponse(res, result.note);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/notes/:id - Soft delete a note.
     * Params: id (positive integer)
     * Returns: 204 No Content on success
     */
    async softDelete(req, res, next) {
        try {
            const id = ensureValidId(req.params.id, res);
            if (id === null) return;

            const deleted = await this.noteService.deleteNote(id);

            if (!deleted) {
                return sendNotFoundIfMissing(res, "Note", deleted);
            }

            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }
}

export default NotesApiController;
