import sqlite3 from "sqlite3";
import path from "path";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "..", "..", "data");
const dbPath = path.join(dataDir, "notes.db");
const sqlite = sqlite3.verbose();

let db;

function getDb() {
    if (!db) {
        throw new Error("Database is not initialized.");
    }
    return db;
}

function withDb(executor) {
    return new Promise((resolve, reject) => {
        try {
            const instance = getDb();
            executor(instance, resolve, reject);
        } catch (error) {
            reject(error);
        }
    });
}

function run(sql, params = []) {
    return withDb((instance, resolve, reject) => {
        instance.run(sql, params, function onRun(error) {
            if (error) {
                reject(error);
                return;
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return withDb((instance, resolve, reject) => {
        instance.get(sql, params, (error, row) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return withDb((instance, resolve, reject) => {
        instance.all(sql, params, (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(rows);
        });
    });
}

async function init() {
    await mkdir(dataDir, { recursive: true });
    db = new sqlite.Database(dbPath);

    await run(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL CHECK(length(trim(title)) > 0),
            content TEXT NOT NULL DEFAULT '',
            completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            deleted_at TEXT
        )
    `);
}

const database = {
    init,
    run,
    get,
    all,
    dbPath,
};

export default database;
