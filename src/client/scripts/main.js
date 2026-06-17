import NotesController from "./controllers/notesController.js";
import NotesView from "./views/notesView.js";

const view = new NotesView();
const controller = new NotesController(view);

await controller.init();
