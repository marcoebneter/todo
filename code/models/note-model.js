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

async function list({ sort = "oldest", activeOnly = false }) {
    const whereParts = ["deleted_at IS NULL"];

    if (activeOnly) {
        whereParts.push("completed = 0");
    }

    let orderClause;
    if (sort === "priority") {
        orderClause = "ORDER BY priority DESC, datetime(created_at) ASC, id ASC";
    } else if (sort === "dueDate") {
        orderClause =
            "ORDER BY CASE WHEN due_at IS NULL THEN 1 ELSE 0 END, due_at ASC, datetime(created_at) ASC, id ASC";
    } else {
        orderClause = `ORDER BY datetime(created_at) ${sort === "oldest" ? "ASC" : "DESC"}, id ASC`;
    }

    const rows = await Database.all(
        `SELECT id, title, content, completed, priority, created_at, updated_at, due_at
         FROM notes
         WHERE ${whereParts.join(" AND ")}
         ${orderClause}`,
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
