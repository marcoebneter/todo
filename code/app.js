import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import notesRoutes from "./routes/notes-routes.js";
import pageRoutes from "./routes/page-routes.js";
import errorHandler from "./middleware/error-handler.js";
import { handlebarHelpers } from "./utils/handlebar-util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "default",
        helpers: {
            ...handlebarHelpers,
        },
    }),
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(pageRoutes);
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/notes", notesRoutes);
app.use(errorHandler);

export default app;
