class NotesView {
    constructor() {
        this.noteEditForm = document.getElementById("frm-note-edit");
        this.noteTitle = document.getElementById("note-title");
        this.noteContent = document.getElementById("note-content");
        this.noteDueDate = document.getElementById("note-due-date");
        this.priorityEmojis = document.querySelectorAll(".priority-emoji");
        this.sortSelect = document.getElementById("sort-select");
        this.showCompletedCheckbox = document.getElementById("show-completed");
        this.cancelEditButton = document.getElementById("btn-cancel-edit");
        this.notesMount = document.getElementById("notes-mount");
        this.formErrorMount = document.getElementById("form-error-mount");
        this.saveButtonMount = document.getElementById("save-button-mount");
        this.formError = document.getElementById("form-error");
        this.notesTemplate = null;
    }

    async init() {
        await this.loadTemplates();
    }

    async loadTemplates() {
        if (!window.Handlebars) {
            return null;
        }

        const response = await fetch("templates/notes-list.hbs", { method: "GET" });
        if (!response.ok) {
            throw new Error("Template konnte nicht geladen werden.");
        }

        const templateSource = await response.text();
        this.notesTemplate = window.Handlebars.compile(templateSource);
    }

    // Escape dynamic user-facing text before writing it into existing DOM nodes.
    escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    formatDueDateForInput(value) {
        if (!value) {
            return "";
        }

        const m = window.moment?.(value, ["YYYY-MM-DD", "DD.MM.YYYY"], true);
        return m && m.isValid() ? m.format("YYYY-MM-DD") : "";
    }

    bindFormSubmit(handler) {
        this.noteEditForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handler({
                title: this.noteTitle.value,
                content: this.noteContent.value,
                dueAt: this.noteDueDate.value || null,
            });
        });
    }

    bindCancelEdit(handler) {
        this.cancelEditButton.addEventListener("click", () => {
            handler();
        });
    }

    bindPriorityChange(handler) {
        this.priorityEmojis.forEach((emoji) => {
            emoji.addEventListener("click", (event) => {
                event.preventDefault();
                const priority = Number(emoji.dataset.priority);
                if (Number.isInteger(priority) && priority >= 1 && priority <= 3) {
                    handler(priority);
                    this.updatePriorityEmojis(priority);
                }
            });
        });
    }

    updatePriorityEmojis(selectedPriority) {
        this.priorityEmojis.forEach((emoji) => {
            const priority = Number(emoji.dataset.priority);
            emoji.classList.toggle("priority-active", priority <= selectedPriority);
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
        if (!this.notesTemplate) {
            this.notesMount.innerHTML =
                '<p id="empty-state" class="empty-state">Template konnte nicht geladen werden.</p>';
            return;
        }

        this.notesMount.innerHTML = this.notesTemplate({
            hasNotes: notes.length > 0,
            notes,
        });
    }

    renderError(message) {
        const safeMessage = this.escapeHtml(message);
        this.formErrorMount.classList.toggle("visually-hidden", safeMessage === "");

        if (this.formError) {
            this.formError.textContent = safeMessage;
        }
    }

    renderFormState({ isEditing, note, selectedPriority = 2 }) {
        const saveButton = this.saveButtonMount.querySelector("#save-button");
        if (saveButton) {
            saveButton.textContent = isEditing ? "Aktualisieren" : "Speichern";
        }

        if (isEditing && note) {
            this.noteTitle.value = note.title;
            this.noteContent.value = note.content;
            this.noteDueDate.value = this.formatDueDateForInput(note.dueAt);
            this.cancelEditButton.hidden = false;
            this.updatePriorityEmojis(selectedPriority);
            this.noteTitle.focus();
            return;
        }

        this.noteEditForm.reset();
        this.noteDueDate.value = "";
        this.cancelEditButton.hidden = true;
        this.updatePriorityEmojis(selectedPriority);
    }

    applyFilterState({ sort, showCompleted }) {
        this.sortSelect.value = sort;
        this.showCompletedCheckbox.checked = showCompleted;
    }
}

export default NotesView;
