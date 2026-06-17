/**
 * NoteService - Business logic layer for note operations.
 * Sits between controller and model to encapsulate complex operations.
 * Handles data transformations, validation orchestration, and model calls.
 */

import NoteModel from "../models/noteModel.js";

class NoteService {
    /**
     * List all notes with optional filtering.
     * @param {Object} options - Filter options
     * @param {string} options.sort - Sort order: "oldest" or "newest" (default: "oldest")
     * @param {boolean} options.activeOnly - Show only active (not completed) notes (default: false)
     * @returns {Promise<Array>} - Array of note objects
     */
    async listNotes({ sort = "oldest", activeOnly = false } = {}) {
        return await NoteModel.list({ sort, activeOnly });
    }

    /**
     * Create a new note.
     * @param {string} title - Note title (required, non-empty)
     * @param {string} content - Note content (optional)
     * @param {number} priority - Note priority 1-3 (optional, default 2)
     * @returns {Promise<Object>} - Created note object
     * @throws {Error} - If creation fails
     */
    async createNote(title, content = "", priority = 2) {
        return await NoteModel.create({ title, content, priority });
    }

    /**
     * Replace an entire note (PUT operation).
     * @param {number} id - Note ID
     * @param {string} title - New title (required, non-empty)
     * @param {string} content - New content
     * @param {boolean} completed - New completed status
     * @param {number} priority - New priority 1-3
     * @returns {Promise<Object|null>} - Updated note or null if not found
     * @throws {Error} - If update fails
     */
    async updateNote(id, title, content = "", completed = false, priority = 2) {
        return await NoteModel.replace(id, { title, content, completed, priority });
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
