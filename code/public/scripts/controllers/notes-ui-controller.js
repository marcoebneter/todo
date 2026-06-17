import { listNotes, createNote, replaceNote, patchNote, deleteNote, fetchNotesMarkup } from "../services/notes-api.js";

function normalizeDueDateInput(value) {
    if (!value || value.trim() === "") {
        return { ok: true, value: null };
    }

    const raw = value.trim();
    const m = window.moment?.(raw, ["DD.MM.YYYY", "YYYY-MM-DD"], true);
    if (!m || !m.isValid()) {
        return { ok: false };
    }

    return { ok: true, value: m.format("YYYY-MM-DD") };
}

class NotesUiController {
    constructor(view) {
        this.view = view;
        this.state = {
            notes: [],
            sort: "oldest",
            showCompleted: false,
            editingNoteId: null,
            editingNoteCompleted: false,
            selectedPriority: 2,
        };
    }

    async init() {
        this.view.applyFilterState({
            sort: this.state.sort,
            showCompleted: this.state.showCompleted,
        });
        this.view.renderFormState({ isEditing: false, note: null, selectedPriority: this.state.selectedPriority });
        this.view.renderError("");

        this.view.bindFormSubmit(async (payload) => this.saveNote(payload));
        this.view.bindCancelEdit(() => this.setEditMode(null));
        this.view.bindPriorityChange((priority) => {
            this.state.selectedPriority = priority;
        });
        this.view.bindSortChange(async (sort) => {
            this.state.sort = sort;
            await this.refreshNotes();
        });
        this.view.bindShowCompletedChange(async (showCompleted) => {
            this.state.showCompleted = showCompleted;
            await this.refreshNotes();
        });
        this.view.bindListActions({
            onEdit: (id) => this.setEditMode(this.findNote(id)),
            onDelete: async (id) => this.softDeleteNote(id),
            onToggle: async (id, completed) => this.toggleCompleted(id, completed),
        });

        await this.refreshNotes();
    }

    findNote(id) {
        return this.state.notes.find((note) => note.id === id) || null;
    }

    setEditMode(note) {
        if (!note) {
            this.state.editingNoteId = null;
            this.state.editingNoteCompleted = false;
            this.state.selectedPriority = 2;
            this.view.renderFormState({ isEditing: false, note: null, selectedPriority: 2 });
            this.view.renderError("");
            return;
        }

        this.state.editingNoteId = note.id;
        this.state.editingNoteCompleted = note.completed;
        this.state.selectedPriority = note.priority || 2;
        this.view.renderFormState({ isEditing: true, note, selectedPriority: note.priority || 2 });
        this.view.renderError("");
    }

    async refreshNotes() {
        try {
            this.state.notes = await listNotes({
                sort: this.state.sort,
                showCompleted: this.state.showCompleted,
            });
            const notesMarkup = await fetchNotesMarkup({
                sort: this.state.sort,
                showCompleted: this.state.showCompleted,
            });
            this.view.renderNotesMarkup(notesMarkup);
        } catch (error) {
            this.view.renderError(error.message);
        }
    }

    async saveNote(formPayload) {
        this.view.renderError("");

        const title = formPayload.title.trim();
        const content = formPayload.content.trim();
        const dueDateResult = normalizeDueDateInput(formPayload.dueAt);

        if (!title) {
            this.view.renderError("Titel ist ein Pflichtfeld.");
            return;
        }

        if (!dueDateResult.ok) {
            this.view.renderError("Fälligkeitsdatum ist ungültig.");
            return;
        }

        const payload = {
            title,
            content,
            completed: this.state.editingNoteCompleted,
            priority: this.state.selectedPriority,
            dueAt: dueDateResult.value,
        };

        try {
            if (this.state.editingNoteId === null) {
                await createNote(payload);
            } else {
                await replaceNote(this.state.editingNoteId, payload);
            }

            this.setEditMode(null);
            await this.refreshNotes();
        } catch (error) {
            this.view.renderError(error.message || "Speichern fehlgeschlagen.");
        }
    }

    async toggleCompleted(id, completed) {
        try {
            await patchNote(id, { completed });

            if (this.state.editingNoteId === id) {
                this.state.editingNoteCompleted = completed;
            }

            await this.refreshNotes();
        } catch (error) {
            this.view.renderError(error.message || "Status konnte nicht aktualisiert werden.");
            await this.refreshNotes();
        }
    }

    async softDeleteNote(id) {
        try {
            await deleteNote(id);

            if (this.state.editingNoteId === id) {
                this.setEditMode(null);
            }

            await this.refreshNotes();
        } catch (error) {
            this.view.renderError(error.message || "Archivieren fehlgeschlagen.");
        }
    }
}

export default NotesUiController;
