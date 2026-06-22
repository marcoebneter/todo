/**
 * NoteService - Business logic layer for note operations.
 * Sits between controller and model to encapsulate complex operations.
 * Handles data transformations, validation orchestration, and model calls.
 */

import NoteModel from "../models/note-model.js";

class NoteService {
    /**
     * List all notes with optional filtering and sorting.
     * Business logic: filters by completion status and sorts results.
     *
     * @param {Object} options - Filter and sort options
     * @param {string} options.sort - Sort order: "oldest", "newest", "priority", or "dueDate" (default: "oldest")
     * @param {boolean} options.activeOnly - Show only active (not completed) notes (default: false)
     * @returns {Promise<Array>} - Filtered and sorted array of note objects
     */
    async listNotes({ sort = "oldest", activeOnly = false } = {}) {
        // Retrieve all notes from database
        let notes = await NoteModel.list();

        // Filter: active notes only
        if (activeOnly) {
            notes = notes.filter((note) => !note.completed);
        }

        // Sort
        if (sort === "priority") {
            notes.sort((a, b) => {
                const priorityDiff = (b.priority || 2) - (a.priority || 2);
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        } else if (sort === "dueDate") {
            notes.sort((a, b) => {
                // Notes with due date first, then by due date
                if (a.dueAt === null && b.dueAt === null) {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
                if (a.dueAt === null) return 1;
                if (b.dueAt === null) return -1;
                const dueDateDiff = new Date(a.dueAt) - new Date(b.dueAt);
                if (dueDateDiff !== 0) return dueDateDiff;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        } else if (sort === "newest") {
            notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            // "oldest" (default)
            notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        return notes;
    }

    /**
     * Create a new note.
     * @param {string} title - Note title (required, non-empty)
     * @param {string} content - Note content (optional)
     * @param {number} priority - Note priority 1-3 (optional, default 2)
     * @param {string|null} dueDate - Due date in ISO format YYYY-MM-DD (optional, default null)
     * @returns {Promise<Object>} - Created note object
     * @throws {Error} - If creation fails
     */
    async createNote(title, content = "", priority = 2, dueDate = null) {
        return await NoteModel.create({ title, content, priority, dueAt: dueDate });
    }

    /**
     * Replace an entire note (PUT operation).
     * @param {number} id - Note ID
     * @param {string} title - New title (required, non-empty)
     * @param {string} content - New content
     * @param {boolean} completed - New completed status
     * @param {number} priority - New priority 1-3
     * @param {string|null} dueDate - Due date in ISO format YYYY-MM-DD (optional, default null)
     * @returns {Promise<Object|null>} - Updated note or null if not found
     * @throws {Error} - If update fails
     */
    async updateNote(id, title, content = "", completed = false, priority = 2, dueDate = null) {
        return await NoteModel.replace(id, { title, content, completed, priority, dueAt: dueDate });
    }

    /**
     * Partially update a note (PATCH operation).
     * @param {number} id - Note ID
     * @param {Object} payload - Fields to update (title, content, completed)
     * @returns {Promise<Object>} - Result with note and hasUpdates flag
     * @throws {Error} - If update fails
     */
    async patchNote(id, payload) {
        return await NoteModel.patch(id, payload);
    }

    /**
     * Soft delete a note (mark as deleted).
     * @param {number} id - Note ID
     * @returns {Promise<boolean>} - True if deleted, false if not found
     * @throws {Error} - If deletion fails
     */
    async deleteNote(id) {
        return await NoteModel.softDelete(id);
    }

    /**
     * Get a note by ID.
     * @param {number} id - Note ID
     * @returns {Promise<Object|null>} - Note object or null if not found
     * @throws {Error} - If query fails
     */
    async getNoteById(id) {
        return await NoteModel.findById(id);
    }
}

export default NoteService;
