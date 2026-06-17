import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { rm } from "fs/promises";
import app from "../src/server/app.js";
import Database from "../src/server/db/database.js";

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
        expect(typeof response.body.id).toBe("number");
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
