/**
 * NoteModel - Data persistence layer for notes.
 * Handles database queries and data mapping.
 * All validation logic has been moved to utils/validators.js.
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function findById(id) {
    const row = await Database.get(
        `SELECT id, title, content, completed, created_at, updated_at
         FROM notes
         WHERE id = ? AND deleted_at IS NULL`,
        [id],
    );

    return row ? mapNote(row) : null;
}

async function list({ sort = "oldest", activeOnly = false }) {
    const whereParts = ["deleted_at IS NULL"];

    if (activeOnly) {
        whereParts.push("completed = 0");
    }

    const rows = await Database.all(
        `SELECT id, title, content, completed, created_at, updated_at
         FROM notes
         WHERE ${whereParts.join(" AND ")}
         ORDER BY datetime(created_at) ${sort === "oldest" ? "ASC" : "DESC"}, id ASC`,
    );

    return rows.map(mapNote);
}

async function create({ title, content }) {
    const result = await Database.run(
        `INSERT INTO notes (title, content, completed, created_at, updated_at)
         VALUES (?, ?, 0, datetime('now'), datetime('now'))`,
        [title, content],
    );

    return findById(result.lastID);
}

async function replace(id, { title, content, completed }) {
    const result = await Database.run(
        `UPDATE notes
         SET title = ?, content = ?, completed = ?, updated_at = datetime('now')
         WHERE id = ? AND deleted_at IS NULL`,
        [title, content, completed ? 1 : 0, id],
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
