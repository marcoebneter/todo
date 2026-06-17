<div align="center">

<h1>📝 Todo / Notes App</h1>

<p>A full-stack Todo and Notes application built with <strong>Express</strong>, <strong>SQLite</strong> and <strong>Handlebars</strong> — structured around the <strong>MVC pattern</strong> on both server and client.</p>

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Handlebars](https://img.shields.io/badge/Handlebars-CDN-f0772b?logo=handlebarsdotjs&logoColor=white)](https://handlebarsjs.com)
[![Vitest](https://img.shields.io/badge/Vitest-tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![ESLint](https://img.shields.io/badge/ESLint-linted-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE.md)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)
- [Error Format](#-error-format)
- [Testing](#-testing)
- [Git Hooks](#-git-hooks)
- [License](#-license)

---

## 🧩 About the Project

A lightweight but well-structured notes and todo application. Notes can be created, edited, toggled as completed, and soft-deleted (archived). The app demonstrates the **MVC pattern** on both the server (Express) and the client (plain JS modules + Handlebars templates).

---

## ✨ Features

- ✅ Create, edit, complete, and archive notes
- 🔃 Sort notes by oldest or newest
- 🔍 Filter to show only active (incomplete) notes
- 🗃️ Soft Delete — entries are archived, not permanently removed
- 💾 Persistent storage via SQLite (`data/notes.db`)
- 🌙 Dark/light mode toggle with OS preference support
- 🛡️ Structured API error responses (Option A format)
- 🧪 Vitest API tests + smoke tests for full contract coverage

---

## 🛠️ Tech Stack

| Layer            | Technology          |
| ---------------- | ------------------- |
| Runtime          | Node.js 18+         |
| Server Framework | Express 5           |
| Database         | SQLite (`sqlite3`)  |
| Client Rendering | Handlebars (CDN)    |
| Client Scripting | Plain JS ES Modules |
| Testing          | Vitest + Supertest  |
| Linting          | ESLint + Prettier   |
| Git Hooks        | Husky + lint-staged |

---

## 🏗️ Architecture

The application follows the **MVC pattern on both server and client**.

### Server MVC

| File                                        | Responsibility                                                      |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `src/server/app.js`                         | Express app setup — middleware, routes, static files, error handler |
| `src/server/server.js`                      | Process entry point — DB init and `app.listen`                      |
| `src/server/routes/notesRoutes.js`          | API route definitions for `/api/notes`                              |
| `src/server/controllers/notesController.js` | HTTP request validation and response formatting                     |
| `src/server/services/noteService.js`        | Business logic between controller and model                         |
| `src/server/models/noteModel.js`            | SQL queries and data mapping                                        |
| `src/server/db/database.js`                 | SQLite connection, query helpers, schema init                       |
| `src/server/middleware/errorHandler.js`     | Global error handler                                                |
| `src/server/utils/responseHandler.js`       | Consistent API response helpers                                     |
| `src/server/utils/validators.js`            | Strict typed input validators                                       |

### Client MVC

| File                                                | Responsibility                                      |
| --------------------------------------------------- | --------------------------------------------------- |
| `src/client/scripts/main.js`                        | Client bootstrap — wires view and controller        |
| `src/client/scripts/controllers/notesController.js` | UI state management and event orchestration         |
| `src/client/scripts/views/notesView.js`             | Handlebars template rendering and DOM event binding |
| `src/client/scripts/models/notesApi.js`             | All `fetch` calls to the server API                 |
| `src/client/scripts/theme.js`                       | Dark/light mode logic                               |

> Handlebars templates are defined inline in `src/client/index.html` and compiled at runtime via CDN.

---

## 📁 Project Structure

```text
todo/
├── data/
│   └── notes.db
├── scripts/
│   └── smoke-test.mjs
├── src/
│   ├── client/
│   │   ├── index.html
│   │   ├── global.css
│   │   └── scripts/
│   │       ├── controllers/
│   │       │   └── notesController.js
│   │       ├── models/
│   │       │   └── notesApi.js
│   │       ├── views/
│   │       │   └── notesView.js
│   │       ├── main.js
│   │       └── theme.js
│   └── server/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       │   └── notesController.js
│       ├── db/
│       │   └── database.js
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── models/
│       │   └── noteModel.js
│       ├── routes/
│       │   └── notesRoutes.js
│       ├── services/
│       │   └── noteService.js
│       └── utils/
│           ├── responseHandler.js
│           └── validators.js
└── tests/
    └── notes.api.spec.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org)

### Installation

```bash
git clone <repo-url>
cd todo
npm install
```

### Run the app

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development mode (auto reload)

```bash
npm run dev
```

| Process      | URL                     | Description                          |
| ------------ | ----------------------- | ------------------------------------ |
| Backend      | `http://localhost:3000` | Express server with `nodemon`        |
| Live Preview | `http://localhost:3001` | `browser-sync` proxy with hot reload |

---

## 📜 Available Scripts

| Script                      | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `npm start`                 | Start the production server                         |
| `npm run dev`               | Start backend + live reload proxy                   |
| `npm run lint`              | Run ESLint checks                                   |
| `npm run lint:fix`          | Auto-fix ESLint issues                              |
| `npm run format`            | Format all files with Prettier                      |
| `npm run format:check`      | Check formatting without writing                    |
| `npm run test:server`       | Run Vitest API tests                                |
| `npm run test:server:watch` | Run Vitest in watch mode                            |
| `npm run smoke`             | Run end-to-end smoke test                           |
| `npm run verify`            | Full quality gate: `lint` + `test:server` + `smoke` |

---

## 📡 API Reference

Base URL: `http://localhost:3000/api`

| Method   | Endpoint                                            | Description                          |
| -------- | --------------------------------------------------- | ------------------------------------ |
| `GET`    | `/notes?sort=oldest\|newest&activeOnly=true\|false` | List all notes with optional filters |
| `POST`   | `/notes`                                            | Create a new note                    |
| `PUT`    | `/notes/:id`                                        | Replace a full note                  |
| `PATCH`  | `/notes/:id`                                        | Partially update a note              |
| `DELETE` | `/notes/:id`                                        | Soft delete (archive) a note         |

### Request body — POST / PUT

```json
{
    "title": "My Note",
    "content": "Optional description",
    "completed": false
}
```

---

## 🛡️ Error Format

All error responses follow the **Option A** structure:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Title must be a string.",
        "details": {
            "field": "title"
        }
    }
}
```

| Code               | HTTP Status | When                            |
| ------------------ | ----------- | ------------------------------- |
| `VALIDATION_ERROR` | `400`       | Invalid or missing input fields |
| `NOT_FOUND`        | `404`       | Resource does not exist         |
| `INTERNAL_ERROR`   | `500`       | Unexpected server error         |

---

## 🧪 Testing

### Vitest API Tests

Unit/integration tests for the server API using **Vitest** + **Supertest**.
Each test run uses an isolated SQLite database (`data/notes.vitest.db`) that is cleaned up after the suite.

```bash
npm run test:server
```

Coverage includes:

- ✅ Successful note creation (`201`)
- ✅ Option A `VALIDATION_ERROR` for invalid title type
- ✅ Option A `VALIDATION_ERROR` for non-boolean `completed` in `PUT`
- ✅ Option A `NOT_FOUND` for unknown note `PATCH`
- ✅ Soft delete hides note from list endpoint

### Smoke Test

End-to-end test that boots the real server, runs all API flows, and shuts down.

```bash
npm run smoke
```

Verifies:

- Full create → patch → filter → delete → list flow
- `VALIDATION_ERROR` shape on bad input (title type, completed type, empty patch, invalid id)
- `NOT_FOUND` shape for unknown resource
- `activeOnly` filter excludes completed notes
- Soft-deleted notes do not appear in any list

---

## 🔗 Git Hooks

The project uses [Husky](https://typicode.github.io/husky) and [lint-staged](https://github.com/lint-staged/lint-staged).

| Hook         | Runs                                             |
| ------------ | ------------------------------------------------ |
| `pre-commit` | `lint-staged` → `lint` → `test:server` → `smoke` |
| `pre-push`   | `verify` (`lint` + `test:server` + `smoke`)      |

If hooks are missing locally:

```bash
npm run prepare
```

---

## 📄 License

Distributed under the ISC License. See [`LICENSE.md`](LICENSE.md) for more information.

---

<div align="center">
  <p>Made with ❤️ for the CAS Frontend Engineering course</p>
</div>
