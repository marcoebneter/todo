function createApiError(response, body, fallbackMessage) {
    const message = body?.error?.message || fallbackMessage;
    const error = new Error(message);
    error.code = body?.error?.code || "REQUEST_ERROR";
    error.status = response.status;
    error.details = body?.error?.details;
    return error;
}

async function request(url, options, fallbackMessage) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw createApiError(response, body, fallbackMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function listNotes({ sort, showCompleted }) {
    const query = new URLSearchParams({
        sort,
        activeOnly: String(!showCompleted),
    });

    return request(`/api/notes?${query.toString()}`, { method: "GET" }, "Notizen konnten nicht geladen werden.");
}

async function createNote(payload) {
    return request(
        "/api/notes",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        },
        "Speichern fehlgeschlagen.",
    );
}

async function replaceNote(id, payload) {
    return request(
        `/api/notes/${id}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        },
        "Speichern fehlgeschlagen.",
    );
}

async function patchNote(id, payload) {
    return request(
        `/api/notes/${id}`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        },
        "Status konnte nicht aktualisiert werden.",
    );
}

async function deleteNote(id) {
    return request(`/api/notes/${id}`, { method: "DELETE" }, "Archivieren fehlgeschlagen.");
}

export { listNotes, createNote, replaceNote, patchNote, deleteNote };
