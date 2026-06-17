class NotesView {
    constructor() {
        this.noteEditForm = document.getElementById("frm-note-edit");
        this.noteTitle = document.getElementById("note-title");
        this.noteContent = document.getElementById("note-content");
        this.sortSelect = document.getElementById("sort-select");
        this.showCompletedCheckbox = document.getElementById("show-completed");
        this.cancelEditButton = document.getElementById("btn-cancel-edit");
        this.notesMount = document.getElementById("notes-mount");
        this.formErrorMount = document.getElementById("form-error-mount");
        this.saveButtonMount = document.getElementById("save-button-mount");

        const handlebars = window.Handlebars;
        this.notesTemplate = handlebars.compile(document.getElementById("notes-template").innerHTML);
        this.errorTemplate = handlebars.compile(document.getElementById("form-error-template").innerHTML);
        this.saveButtonTemplate = handlebars.compile(document.getElementById("save-button-template").innerHTML);
    }

    formatDate(value) {
        return new Date(value).toLocaleString("de-CH", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    bindFormSubmit(handler) {
        this.noteEditForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handler({
                title: this.noteTitle.value,
                content: this.noteContent.value,
            });
        });
    }

    bindCancelEdit(handler) {
        this.cancelEditButton.addEventListener("click", () => {
            handler();
        });
    }

    bindSortChange(handler) {
        this.sortSelect.addEventListener("change", async (event) => {
            await handler(event.target.value);
        });
    }

    bindShowCompletedChange(handler) {
        this.showCompletedCheckbox.addEventListener("change", async (event) => {
            await handler(event.target.checked);
        });
    }

    bindListActions({ onEdit, onDelete, onToggle }) {
        this.notesMount.addEventListener("click", async (event) => {
            const actionElement = event.target.closest("[data-action]");
            if (!actionElement) {
                return;
            }

            const id = Number(actionElement.dataset.id);
            if (!Number.isInteger(id)) {
                return;
            }

            if (actionElement.dataset.action === "edit") {
                onEdit(id);
                return;
            }

            if (actionElement.dataset.action === "delete") {
                await onDelete(id);
            }
        });

        this.notesMount.addEventListener("change", async (event) => {
            const toggle = event.target.closest("[data-action='toggle']");
            if (!toggle) {
                return;
            }

            const id = Number(toggle.dataset.id);
            if (!Number.isInteger(id)) {
                return;
            }

            await onToggle(id, toggle.checked);
        });
    }

    renderNotes(notes) {
        const templateNotes = notes.map((note) => ({
            ...note,
            createdAtLabel: this.formatDate(note.createdAt),
            contentLabel: note.content || "(keine Beschreibung)",
        }));

        this.notesMount.innerHTML = this.notesTemplate({
            notes: templateNotes,
            hasNotes: templateNotes.length > 0,
        });
    }

    renderError(message) {
        this.formErrorMount.classList.toggle("visually-hidden", message === "");
        this.formErrorMount.innerHTML = this.errorTemplate({ message });
    }

    renderFormState({ isEditing, note }) {
        this.saveButtonMount.innerHTML = this.saveButtonTemplate({
            saveLabel: isEditing ? "Aktualisieren" : "Speichern",
        });

        if (isEditing && note) {
            this.noteTitle.value = note.title;
            this.noteContent.value = note.content;
            this.cancelEditButton.hidden = false;
            this.noteTitle.focus();
            return;
        }

        this.noteEditForm.reset();
        this.cancelEditButton.hidden = true;
    }

    applyFilterState({ sort, showCompleted }) {
        this.sortSelect.value = sort;
        this.showCompletedCheckbox.checked = showCompleted;
    }
}

export default NotesView;
