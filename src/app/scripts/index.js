const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const saveButton = document.getElementById("save-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const sortSelect = document.getElementById("sort-select");
const showCompletedCheckbox = document.getElementById("show-completed");
const emptyState = document.getElementById("empty-state");
const formError = document.getElementById("form-error");

const state = {
    notes: [],
    sort: "oldest",
    showCompleted: false,
    editingNoteId: null,
    editingNoteCompleted: false,
};

function formatDate(value) {
    return new Date(value).toLocaleString("de-CH", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

async function fetchNotes() {
    const query = new URLSearchParams({
        sort: state.sort,
        activeOnly: String(!state.showCompleted),
    });

    const response = await fetch(`/api/notes?${query.toString()}`);
    if (!response.ok) {
        throw new Error("Notizen konnten nicht geladen werden.");
    }

    state.notes = await response.json();
}

function setEditMode(note) {
    if (!note) {
        state.editingNoteId = null;
        state.editingNoteCompleted = false;
        noteForm.reset();
        saveButton.textContent = "Speichern";
        cancelEditButton.hidden = true;
        formError.textContent = "";
        return;
    }

    state.editingNoteId = note.id;
    state.editingNoteCompleted = note.completed;
    noteTitle.value = note.title;
    noteContent.value = note.content;
    saveButton.textContent = "Aktualisieren";
    cancelEditButton.hidden = false;
    noteTitle.focus();
}

function renderNotes() {
    notesList.innerHTML = "";
    emptyState.hidden = state.notes.length > 0;

    for (const note of state.notes) {
        const item = document.createElement("li");
        item.className = "note-item";
        if (note.completed) {
            item.classList.add("is-completed");
        }

        const header = document.createElement("div");
        header.className = "note-header";

        const titleRow = document.createElement("div");
        titleRow.className = "note-title-row";

        const completedToggle = document.createElement("input");
        completedToggle.type = "checkbox";
        completedToggle.checked = note.completed;
        completedToggle.setAttribute("aria-label", "Notiz als abgeschlossen markieren");
        completedToggle.addEventListener("change", async () => {
            await toggleCompleted(note.id, completedToggle.checked);
        });

        const title = document.createElement("h2");
        title.textContent = note.title;

        titleRow.append(completedToggle, title);

        const dateLabel = document.createElement("small");
        dateLabel.textContent = `Erstellt: ${formatDate(note.createdAt)}`;

        header.append(titleRow, dateLabel);

        const content = document.createElement("p");
        content.textContent = note.content || "(keine Beschreibung)";

        const actions = document.createElement("div");
        actions.className = "note-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "secondary";
        editButton.textContent = "Bearbeiten";
        editButton.addEventListener("click", () => setEditMode(note));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "danger";
        deleteButton.textContent = "Archivieren";
        deleteButton.addEventListener("click", async () => {
            await softDeleteNote(note.id);
        });

        actions.append(editButton, deleteButton);
        item.append(header, content, actions);
        notesList.append(item);
    }
}

async function refreshNotes() {
    try {
        await fetchNotes();
        renderNotes();
    } catch (error) {
        formError.textContent = error.message;
    }
}

async function saveNote(event) {
    event.preventDefault();
    formError.textContent = "";

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title) {
        formError.textContent = "Titel ist ein Pflichtfeld.";
        return;
    }

    const payload = {
        title,
        content,
        completed: state.editingNoteCompleted,
    };

    const isEditing = state.editingNoteId !== null;
    const endpoint = isEditing ? `/api/notes/${state.editingNoteId}` : "/api/notes";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        formError.textContent = body.error || "Speichern fehlgeschlagen.";
        return;
    }

    setEditMode(null);
    await refreshNotes();
}

async function toggleCompleted(id, completed) {
    const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
        formError.textContent = "Status konnte nicht aktualisiert werden.";
        await refreshNotes();
        return;
    }

    if (state.editingNoteId === id) {
        state.editingNoteCompleted = completed;
    }

    await refreshNotes();
}

async function softDeleteNote(id) {
    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!response.ok) {
        formError.textContent = "Archivieren fehlgeschlagen.";
        return;
    }

    if (state.editingNoteId === id) {
        setEditMode(null);
    }

    await refreshNotes();
}

noteForm.addEventListener("submit", saveNote);
cancelEditButton.addEventListener("click", () => setEditMode(null));
sortSelect.addEventListener("change", async (event) => {
    state.sort = event.target.value;
    await refreshNotes();
});
showCompletedCheckbox.addEventListener("change", async (event) => {
    state.showCompleted = event.target.checked;
    await refreshNotes();
});

sortSelect.value = state.sort;
showCompletedCheckbox.checked = state.showCompleted;
await refreshNotes();
