import NotesUiController from "./controllers/notes-ui-controller.js";
import NotesView from "./views/notes-view.js";

const view = new NotesView();
const controller = new NotesUiController(view);

await controller.init();
