/**
 * NotesController - HTTP request handler for note operations.
 * Class-based controller following MVC pattern.
 * Validates requests, delegates business logic to NoteService, formats responses.
 */

import NoteService from "../services/noteService.js";
import { successResponse, createdResponse, errorResponse, notFoundResponse } from "../utils/responseHandler.js";
import { parseId, parseRequiredTitle, parseOptionalContent, parseOptionalCompleted } from "../utils/validators.js";

class NotesController {
    constructor() {
        this.noteService = new NoteService();
    }

    /**
     * GET /api/notes - List all notes with optional filtering.
     * Query params:
     *   - sort: "oldest" (default) or "newest"
     *   - activeOnly: "true" to show only uncompleted notes
     */
    async list(req, res, next) {
        try {
            const sort = req.query.sort === "newest" ? "newest" : "oldest";
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
     * Body: { title: string (required), content?: string }
     */
    async create(req, res, next) {
        try {
            const titleResult = parseRequiredTitle(req.body.title);
            const contentResult = parseOptionalContent(req.body.content);

            if (!titleResult.ok) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: titleResult.message, details: titleResult.details },
                    400,
                );
            }

            if (!contentResult.ok) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: contentResult.message, details: contentResult.details },
                    400,
                );
            }

            const note = await this.noteService.createNote(titleResult.value, contentResult.value);
            createdResponse(res, note);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/notes/:id - Replace an entire note.
     * Params: id (positive integer)
     * Body: { title: string (required), content?: string, completed?: boolean }
     */
    async replace(req, res, next) {
        try {
            const id = parseId(req.params.id);
            const titleResult = parseRequiredTitle(req.body.title);
            const contentResult = parseOptionalContent(req.body.content);
            const completedResult = parseOptionalCompleted(req.body.completed);

            if (!id) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: "Invalid note id.", details: { field: "id" } },
                    400,
                );
            }

            if (!titleResult.ok) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: titleResult.message, details: titleResult.details },
                    400,
                );
            }

            if (!contentResult.ok) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: contentResult.message, details: contentResult.details },
                    400,
                );
            }

            if (!completedResult.ok) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: completedResult.message, details: completedResult.details },
                    400,
                );
            }

            const note = await this.noteService.updateNote(
                id,
                titleResult.value,
                contentResult.value,
                completedResult.value,
            );

            if (!note) {
                return notFoundResponse(res, "Note");
            }

            successResponse(res, note);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notes/:id - Partially update a note.
     * Params: id (positive integer)
     * Body: { title?: string, content?: string, completed?: boolean }
     */
    async patch(req, res, next) {
        try {
            const id = parseId(req.params.id);

            if (!id) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: "Invalid note id.", details: { field: "id" } },
                    400,
                );
            }

            const payload = {};

            if (Object.hasOwn(req.body, "completed")) {
                const completedResult = parseOptionalCompleted(req.body.completed);
                if (!completedResult.ok) {
                    return errorResponse(
                        res,
                        {
                            code: "VALIDATION_ERROR",
                            message: completedResult.message,
                            details: completedResult.details,
                        },
                        400,
                    );
                }
                payload.completed = completedResult.value;
            }

            if (Object.hasOwn(req.body, "title")) {
                const titleResult = parseRequiredTitle(req.body.title);
                if (!titleResult.ok) {
                    return errorResponse(
                        res,
                        { code: "VALIDATION_ERROR", message: titleResult.message, details: titleResult.details },
                        400,
                    );
                }
                payload.title = titleResult.value;
            }

            if (Object.hasOwn(req.body, "content")) {
                const contentResult = parseOptionalContent(req.body.content);
                if (!contentResult.ok) {
                    return errorResponse(
                        res,
                        { code: "VALIDATION_ERROR", message: contentResult.message, details: contentResult.details },
                        400,
                    );
                }
                payload.content = contentResult.value;
            }

            const result = await this.noteService.patchNote(id, payload);

            if (!result.hasUpdates) {
                return errorResponse(
                    res,
                    {
                        code: "VALIDATION_ERROR",
                        message: "No valid fields to update.",
                        details: { fields: ["title", "content", "completed"] },
                    },
                    400,
                );
            }

            if (!result.note) {
                return notFoundResponse(res, "Note");
            }

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
            const id = parseId(req.params.id);

            if (!id) {
                return errorResponse(
                    res,
                    { code: "VALIDATION_ERROR", message: "Invalid note id.", details: { field: "id" } },
                    400,
                );
            }

            const deleted = await this.noteService.deleteNote(id);

            if (!deleted) {
                return notFoundResponse(res, "Note");
            }

            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }
}

export default NotesController;
