/**
 * NotesController - HTTP request handler for note operations.
 * Class-based controller following MVC pattern.
 * Validates requests, delegates business logic to NoteService, formats responses.
 */

import NoteService from "../services/noteService.js";
import { successResponse, createdResponse, errorResponse, notFoundResponse } from "../utils/responseHandler.js";
import { parseId, parseRequiredTitle, parseOptionalContent } from "../utils/validators.js";

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
            const title = parseRequiredTitle(req.body.title);
            const content = parseOptionalContent(req.body.content);

            if (!title) {
                return errorResponse(res, "Title is required.", 400);
            }

            const note = await this.noteService.createNote(title, content);
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
            const title = parseRequiredTitle(req.body.title);
            const content = parseOptionalContent(req.body.content);
            const completed = Boolean(req.body.completed);

            if (!id) {
                return errorResponse(res, "Invalid note id.", 400);
            }

            if (!title) {
                return errorResponse(res, "Title is required.", 400);
            }

            const note = await this.noteService.updateNote(id, title, content, completed);

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
                return errorResponse(res, "Invalid note id.", 400);
            }

            const payload = {};

            if (Object.hasOwn(req.body, "completed")) {
                payload.completed = req.body.completed === true;
            }

            if (Object.hasOwn(req.body, "title")) {
                const title = parseRequiredTitle(req.body.title);
                if (!title) {
                    return errorResponse(res, "Title is required.", 400);
                }
                payload.title = title;
            }

            if (Object.hasOwn(req.body, "content")) {
                payload.content = parseOptionalContent(req.body.content);
            }

            const result = await this.noteService.patchNote(id, payload);

            if (!result.hasUpdates) {
                return errorResponse(res, "No valid fields to update.", 400);
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
                return errorResponse(res, "Invalid note id.", 400);
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
