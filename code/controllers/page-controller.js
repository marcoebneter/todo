import NoteService from "../services/note-service.js";
import moment from "moment";

moment.locale("de-ch");

class PageController {
    constructor() {
        this.noteService = new NoteService();
    }

    renderIndex(req, res) {
        res.render("index", { pageTitle: "Todo App" });
    }

    formatDate(value) {
        const date = moment(value);
        return date.isValid() ? date.format("DD.MM.YYYY HH:mm") : "";
    }

    formatDateOnly(value) {
        const date = moment(value, ["YYYY-MM-DD", "DD.MM.YYYY"], true);
        return date.isValid() ? date.format("DD.MM.YYYY") : "";
    }

    async renderNotesPartial(req, res, next) {
        try {
            const sort = ["newest", "priority", "dueDate"].includes(req.query.sort) ? req.query.sort : "oldest";
            const activeOnly = req.query.activeOnly === "true";

            const notes = await this.noteService.listNotes({ sort, activeOnly });
            const templateNotes = notes.map((note) => ({
                ...note,
                createdAtLabel: this.formatDate(note.createdAt),
                dueDateLabel: note.dueAt ? this.formatDateOnly(note.dueAt) : null,
                contentLabel: note.content || "(keine Beschreibung)",
                priorityClass: `priority-${note.priority || 2}`,
                priorityAtLeast1: (note.priority || 2) >= 1,
                priorityAtLeast2: (note.priority || 2) >= 2,
                priorityAtLeast3: (note.priority || 2) >= 3,
            }));

            res.render("partials/notes-list", {
                layout: false,
                hasNotes: templateNotes.length > 0,
                notes: templateNotes,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default PageController;
