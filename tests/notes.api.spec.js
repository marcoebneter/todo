import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { rm } from "fs/promises";
import app from "../code/app.js";
import Database from "../code/db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.join(__dirname, "..", "data", "notes.vitest.db");

process.env.NOTES_DB_PATH = testDbPath;

describe("notes api", () => {
    beforeAll(async () => {
        await Database.init();
    });

    beforeEach(async () => {
        await Database.run("DELETE FROM notes WHERE id > 0");
    });

    afterAll(async () => {
        await Database.close();
        await rm(testDbPath, { force: true });
    });

    it("creates a note", async () => {
        const response = await request(app).post("/api/notes").send({
            title: "Vitest Note",
            content: "created in test",
        });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe("Vitest Note");
        expect(response.body.completed).toBe(false);
        // default priority should be 2 (medium)
        expect(response.body.priority).toBe(2);
        // due date is optional and should be null when not provided
        expect(response.body.dueAt).toBeNull();
        expect(typeof response.body.id).toBe("number");
    });

    it("creates a note with due date and custom priority", async () => {
        const due = "2026-06-18";
        const response = await request(app).post("/api/notes").send({
            title: "Due Note",
            content: "has due date",
            priority: 3,
            dueAt: due,
        });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe("Due Note");
        expect(response.body.priority).toBe(3);
        expect(response.body.dueAt).toBe(due);
    });

    it("sorts notes by due date with undated notes last", async () => {
        const later = await request(app).post("/api/notes").send({
            title: "Later",
            content: "later due date",
            dueAt: "2026-06-20",
        });

        const undated = await request(app).post("/api/notes").send({
            title: "No Due Date",
            content: "no date",
        });

        const earlier = await request(app).post("/api/notes").send({
            title: "Earlier",
            content: "earlier due date",
            dueAt: "2026-06-18",
        });

        expect(later.status).toBe(201);
        expect(undated.status).toBe(201);
        expect(earlier.status).toBe(201);

        const listed = await request(app).get("/api/notes?sort=dueDate&activeOnly=false");

        expect(listed.status).toBe(200);
        expect(listed.body.map((note) => note.title)).toEqual(["Earlier", "Later", "No Due Date"]);
    });

    it("returns Option A validation error for non-string title", async () => {
        const response = await request(app).post("/api/notes").send({
            title: 123,
            content: "invalid",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "Title must be a string.",
                details: { field: "title" },
            },
        });
    });

    it("rejects PUT payload where completed is not boolean", async () => {
        const created = await request(app).post("/api/notes").send({ title: "A", content: "B" });

        const response = await request(app).put(`/api/notes/${created.body.id}`).send({
            title: "A",
            content: "B",
            completed: "false",
        });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("VALIDATION_ERROR");
        expect(response.body.error.details).toEqual({ field: "completed" });
    });

    it("returns not found for patching unknown note", async () => {
        const response = await request(app).patch("/api/notes/999999").send({ completed: true });

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("soft deletes note and hides it from list", async () => {
        const created = await request(app).post("/api/notes").send({ title: "To delete", content: "x" });

        const deleted = await request(app).delete(`/api/notes/${created.body.id}`);
        expect(deleted.status).toBe(204);

        const listed = await request(app).get("/api/notes?sort=oldest&activeOnly=false");
        expect(listed.status).toBe(200);
        expect(listed.body.some((note) => note.id === created.body.id)).toBe(false);
    });
});
