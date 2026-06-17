import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

const port = Number(process.env.PORT) || 3000;
const baseUrl = "http://127.0.0.1:" + port;

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function parseJsonSafe(response) {
    return response.json().catch(() => ({}));
}

function assertOptionAError(body, expectedCode, context) {
    assert(typeof body === "object" && body !== null, `${context}: response body must be an object.`);
    assert(typeof body.error === "object" && body.error !== null, `${context}: body.error must be an object.`);
    assert(body.error.code === expectedCode, `${context}: expected error code ${expectedCode}.`);
    assert(
        typeof body.error.message === "string" && body.error.message.length > 0,
        `${context}: error.message must be a non-empty string.`,
    );
}

function step(label) {
    console.log(`[smoke] ${label}`);
}

async function waitForServer(timeoutMs = 8000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        try {
            const response = await fetch(`${baseUrl}/api/notes?sort=oldest&activeOnly=true`);
            if (response.ok) {
                return;
            }
        } catch {
            // Server might still be booting up; retry until timeout.
        }
        await delay(200);
    }

    throw new Error("Server did not start in time.");
}

async function run() {
    const server = spawn("node", ["code/server/server.js"], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
    });

    server.stdout.on("data", () => {});
    server.stderr.on("data", (chunk) => {
        process.stderr.write(chunk);
    });

    try {
        await waitForServer();
        step("server is reachable");

        step("validation: reject invalid title on create");
        const invalidCreateResponse = await fetch(`${baseUrl}/api/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: 123, content: "invalid title type" }),
        });
        assert(invalidCreateResponse.status === 400, "POST /api/notes invalid title should return 400.");
        const invalidCreateBody = await parseJsonSafe(invalidCreateResponse);
        assertOptionAError(invalidCreateBody, "VALIDATION_ERROR", "POST /api/notes invalid title");

        step("create: create note");
        const createResponse = await fetch(`${baseUrl}/api/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Smoke Test", content: "created by smoke test" }),
        });
        assert(createResponse.status === 201, "POST /api/notes should return 201.");

        const createdNote = await createResponse.json();
        assert(createdNote.title === "Smoke Test", "Created note title mismatch.");

        step("validation: reject invalid completed in put");
        const invalidReplaceResponse = await fetch(`${baseUrl}/api/notes/${createdNote.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Smoke Test",
                content: "update",
                completed: "false",
            }),
        });
        assert(invalidReplaceResponse.status === 400, "PUT /api/notes/:id invalid completed should return 400.");
        const invalidReplaceBody = await parseJsonSafe(invalidReplaceResponse);
        assertOptionAError(invalidReplaceBody, "VALIDATION_ERROR", "PUT /api/notes/:id invalid completed");

        step("validation: reject empty patch payload");
        const noFieldsPatchResponse = await fetch(`${baseUrl}/api/notes/${createdNote.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        assert(noFieldsPatchResponse.status === 400, "PATCH /api/notes/:id with empty body should return 400.");
        const noFieldsPatchBody = await parseJsonSafe(noFieldsPatchResponse);
        assertOptionAError(noFieldsPatchBody, "VALIDATION_ERROR", "PATCH /api/notes/:id empty body");

        step("update: patch completed=true");
        const patchResponse = await fetch(`${baseUrl}/api/notes/${createdNote.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
        });
        assert(patchResponse.status === 200, "PATCH /api/notes/:id should return 200.");

        step("not found: patch unknown note");
        const notFoundPatchResponse = await fetch(`${baseUrl}/api/notes/9999999`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
        });
        assert(notFoundPatchResponse.status === 404, "PATCH /api/notes/:id for unknown note should return 404.");
        const notFoundPatchBody = await parseJsonSafe(notFoundPatchResponse);
        assertOptionAError(notFoundPatchBody, "NOT_FOUND", "PATCH /api/notes/:id not found");

        step("filter: activeOnly excludes completed notes");
        const activeResponse = await fetch(`${baseUrl}/api/notes?sort=oldest&activeOnly=true`);
        const activeNotes = await activeResponse.json();
        assert(
            !activeNotes.some((note) => note.id === createdNote.id),
            "Completed note must not be returned when activeOnly=true.",
        );

        step("delete: soft delete note");
        const deleteResponse = await fetch(`${baseUrl}/api/notes/${createdNote.id}`, {
            method: "DELETE",
        });
        assert(deleteResponse.status === 204, "DELETE /api/notes/:id should return 204.");

        step("validation: reject invalid id on delete");
        const invalidDeleteResponse = await fetch(`${baseUrl}/api/notes/abc`, {
            method: "DELETE",
        });
        assert(invalidDeleteResponse.status === 400, "DELETE /api/notes/:id invalid id should return 400.");
        const invalidDeleteBody = await parseJsonSafe(invalidDeleteResponse);
        assertOptionAError(invalidDeleteBody, "VALIDATION_ERROR", "DELETE /api/notes/:id invalid id");

        step("list: soft-deleted note not returned");
        const allResponse = await fetch(`${baseUrl}/api/notes?sort=oldest&activeOnly=false`);
        const allNotes = await allResponse.json();
        assert(
            !allNotes.some((note) => note.id === createdNote.id),
            "Soft-deleted note must not appear in list endpoint.",
        );

        console.log("Smoke test passed.");
    } finally {
        server.kill();
        await delay(300);
    }
}

run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
