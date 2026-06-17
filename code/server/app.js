import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import notesRoutes from "./routes/notesRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/notes", notesRoutes);
app.use(errorHandler);

export default app;
