import Database from "./db/database.js";
import app from "./app.js";
const port = Number(process.env.PORT) || 3000;

await Database.init();

app.listen(port, () => {
    console.log(`Todo app listening at http://localhost:${port}`);
});
