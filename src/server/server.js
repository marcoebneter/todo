import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import database from "./db/database.js";
import notesRoutes from "./routes/notesRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));
app.use("/api/notes", notesRoutes);
app.use(errorHandler);

await database.init();

app.listen(port, () => {
    console.log(`Todo app listening at http://localhost:${port}`);
});
