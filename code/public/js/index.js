import NotesUiController from "./controllers/notes-ui-controller.js";
import NotesView from "./views/notes-view.js";

window.moment?.locale("de-ch");

const view = new NotesView();
await view.init();
const controller = new NotesUiController(view);

await controller.init();
