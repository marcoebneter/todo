/**
 * NoteModel - Data persistence layer for notes.
 * Handles raw database queries, row-to-object mapping, and CRUD operations.
 * All business logic (filtering, sorting) is handled by the service layer.
 * All input validation is done by utils/validators.js.
 */

import Database from "../db/database.js";

/**
 * Map database row to note object.
 * @param {Object} row - Database row from sqlite3
 * @returns {Object} - Mapped note object with camelCase keys
 */
function mapNote(row) {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        completed: Boolean(row.completed),
        priority: row.priority || 2,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        dueAt: row.due_at || null,
    };
}

async function findById(id) {
    const row = await Database.get(
        `SELECT id, title, content, completed, priority, created_at, updated_at, due_at
         FROM notes
         WHERE id = ? AND deleted_at IS NULL`,
        [id],
    );

    return row ? mapNote(row) : null;
}

/**
 * Retrieve all non-deleted notes (raw from database).
 * Filtering and sorting handled by service layer.
 * @returns {Promise<Array>} - All non-deleted notes
 */
async function list() {
    const rows = await Database.all(
        `SELECT id, title, content, completed, priority, created_at, updated_at, due_at
         FROM notes
         WHERE deleted_at IS NULL`,
    );

    return rows.map(mapNote);
}

async function create({ title, content, priority = 2, dueAt = null }) {
    const result = await Database.run(
        `INSERT INTO notes (title, content, priority, completed, created_at, updated_at, due_at)
         VALUES (?, ?, ?, 0, datetime('now'), datetime('now'), ?)`,
        [title, content, priority, dueAt],
    );

    return findById(result.lastID);
}

async function replace(id, { title, content, completed, priority = 2, dueAt = null }) {
    const result = await Database.run(
        `UPDATE notes
         SET title = ?, content = ?, completed = ?, priority = ?, due_at = ?, updated_at = datetime('now')
         WHERE id = ? AND deleted_at IS NULL`,
        [title, content, completed ? 1 : 0, priority, dueAt, id],
    );

    return result.changes === 0 ? null : findById(id);
}

async function patch(id, payload) {
    const updates = [];
    const params = [];

    if (Object.hasOwn(payload, "completed")) {
        updates.push("completed = ?");
        params.push(payload.completed === true ? 1 : 0);
    }

    if (Object.hasOwn(payload, "title")) {
        updates.push("title = ?");
        params.push(payload.title);
    }

    if (Object.hasOwn(payload, "content")) {
        updates.push("content = ?");
        params.push(payload.content);
    }

    if (Object.hasOwn(payload, "priority")) {
        updates.push("priority = ?");
        params.push(payload.priority);
    }

    if (Object.hasOwn(payload, "dueAt")) {
        updates.push("due_at = ?");
        params.push(payload.dueAt);
    }

    if (updates.length === 0) {
        return { note: null, hasUpdates: false };
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    const result = await Database.run(
        `UPDATE notes
         SET ${updates.join(", ")}
         WHERE id = ? AND deleted_at IS NULL`,
        params,
    );

    if (result.changes === 0) {
        return { note: null, hasUpdates: true };
    }

    const note = await findById(id);
    return { note, hasUpdates: true };
}

async function softDelete(id) {
    const result = await Database.run(
        `UPDATE notes
         SET deleted_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ? AND deleted_at IS NULL`,
        [id],
    );

    return result.changes > 0;
}

const NoteModel = {
    list,
    create,
    replace,
    patch,
    softDelete,
    findById,
};

export default NoteModel;
