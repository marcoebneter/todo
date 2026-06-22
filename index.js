import Database from "./code/db/database.js";
import app from "./code/app.js";
import appConfig from "./code/conf.js";

const port = appConfig.server.port;

await Database.init();

app.listen(port, () => {
    console.log(`Todo app listening at http://localhost:${port}`);
});
