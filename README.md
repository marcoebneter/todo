# Todo / Notizen App

Eine Todo- und Notizen-App mit Express, SQLite und Handlebars-Rendering im Browser.

## Zielarchitektur (MVC auf Server und Client)

Die Anwendung nutzt MVC auf beiden Seiten:

- **Server MVC**
    - `src/server/routes/notesRoutes.js`: API-Endpunkte und Routing
    - `src/server/controllers/notesController.js`: HTTP-Validierung und Antwortlogik
    - `src/server/services/noteService.js`: Business-Logik zwischen Controller und Model
    - `src/server/models/noteModel.js`: SQL-nahe Datenzugriffe
    - `src/server/db/database.js`: SQLite Initialisierung und Query-Helper
- **Client MVC**
    - `src/client/scripts/models/notesApi.js`: API-Kommunikation (`fetch`)
    - `src/client/scripts/views/notesView.js`: UI-Rendering mit Handlebars (CDN)
    - `src/client/scripts/controllers/notesController.js`: UI-State und Event-Orchestrierung
    - `src/client/scripts/main.js`: Client-Bootstrap

Server-Bootstrap ist separat gehalten:

- `src/server/app.js`: Express App-Konfiguration (Middleware, Static Files, Routes, Error Handler)
- `src/server/server.js`: Prozessstart (`Database.init`, `app.listen`)

## Features

- Notizen erstellen, bearbeiten, abhaken und archivieren
- Sortierung (`oldest` / `newest`)
- Filter fuer aktive Notizen (`activeOnly`)
- Soft Delete (Eintraege werden markiert statt hart geloescht)
- Persistenz in `data/notes.db`
- Strukturierte API-Fehlerantworten (Option A)

## Technologie

- Node.js + Express
- SQLite (`sqlite3`)
- Vanilla JS Modules im Client
- Handlebars via CDN fuer dynamisches Rendering

## Voraussetzungen

- Node.js 18+

## Installation

```bash
npm install
```

## App starten

```bash
npm start
```

Standard-URL: `http://localhost:3000`

## Entwicklung (Auto Reload)

```bash
npm run dev
```

- `backend:watch`: startet Server mit `nodemon`
- `frontend:live`: startet `browser-sync` Proxy auf `http://localhost:3001`

## Qualitaetschecks

```bash
npm run lint
npm run smoke
npm run verify
```

- `lint`: ESLint Checks
- `smoke`: End-to-End Smoke Test gegen laufenden Server
- `verify`: `lint` + `smoke`

## API Uebersicht

- `GET /api/notes?sort=oldest|newest&activeOnly=true|false`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id`

## API Fehlerformat (Option A)

Alle Fehlerantworten folgen diesem Format:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Title is required.",
        "details": {
            "field": "title"
        }
    }
}
```

Verwendete Codes:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `INTERNAL_ERROR`

Hinweis: HTTP-Statuscodes bleiben kompatibel zum bisherigen Verhalten (z. B. `201`, `200`, `204`, `400`, `404`).

## Smoke Test Abdeckung

`scripts/smoke-test.mjs` prueft:

- gueltiger Create/Patch/Delete Flow
- Filter-Verhalten (`activeOnly=true`)
- Soft Delete Sichtbarkeit
- Validation Errors mit Option-A-Shape
- Not-Found Fehler mit Option-A-Shape

## Handlebars im Client

Handlebars wird ueber CDN in `src/client/index.html` geladen.
Templates sind in derselben HTML-Datei abgelegt und werden in `notesView` kompiliert:

- `#notes-template`
- `#form-error-template`
- `#save-button-template`

## Projektstruktur (Kurz)

```text
src/
  client/
	index.html
	scripts/
	  controllers/notesController.js
	  models/notesApi.js
	  views/notesView.js
	  main.js
	  theme.js
  server/
	app.js
	server.js
	routes/notesRoutes.js
	controllers/notesController.js
	services/noteService.js
	models/noteModel.js
	middleware/errorHandler.js
	db/database.js
	utils/responseHandler.js
	utils/validators.js
scripts/
  smoke-test.mjs
```

## Git Hooks

Das Projekt verwendet Husky + lint-staged.

Falls Hooks lokal fehlen:

```bash
npm run prepare
```
