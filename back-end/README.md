# Cosmonavt Backend

## Welcome!!
> **TIP: Read through this article if you ever feel lost about the project !!**

## Index

- [Tech Stack](#tech-stack)
- [Contribution Guidelines](#contribution-guidelines)
  - [How to Set Up the Project](#how-to-set-up-the-project)
  - [Import System](#import-system)
  - [Registering Modules](#registering-modules)
  - [Registering New Functions](#registering-new-functions)
  - [Registering New Modules](#registering-new-modules)
  - [Where to Place Features](#where-to-place-features)
  - [Branching & PR Policy](#branching--pr-policy)
- [Project Structure](#project-structure)
- [General Flow](#general-flow)
- [Notes](#notes)

---

## Tech Stack

- **Node.js** v20+
- **Socket.IO** Real-time communication
- **Express** REST API
- **MySQL** Database
- **npm** Package management
- **dotenv** Environmental files
- **jsonwebtoken (JWT)** Authentication
- **bcrypt** Password Hashing
- **mysql2** Database connection

## Contribution Guidelines

### How to Set Up the Project

1. Clone the repository and checkout a feature branch:
   ```sh
   git checkout -b fr-<issue-number>-<feature-name>
   ```
2. Copy the `.env.develop` to `.env.dev` and adjust as needed.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

### How to Set Up the Backend and dataBase (Docker)

Make sure you have docker installed 
> TIP: You can install docker here: https://www.docker.com/products/docker-desktop/

1.  **Navigate to the database directory**:
   ```sh
   cd back-end/db
   ```
2. Copy the `.env.develop` to `.env.dev` and adjust as needed.
     - # ——— Configuración de MySQL (Docker) ———
     - DB_HOST=localhost
     - DB_PORT=3307
     - DB_USER=appuser
     - DB_PASSWORD=MyDevelopmentPassword
     - DB_DATABASE=cosmonavt

     - # ——— Configuración del servidor Node ———
     - PORT=8000
     - DEBUG=true
     - API_URL=http://localhost:8000/
     - FRONTEND_URL=http://localhost:5173/
     - JWT_SECRET=cosmonavt_secret_key

     - COMPOSE_PROJECT_NAME=socketapp
     - TZ=UTC
2.5 If you get this error " Ports are not available: exposing port TCP 0.0.0.0:3306 -> 0.0.0.0:0: listen tcp 0.0.0.0:3306: bind: address already in use" 
   - Modify  compose.develop.yml to use Ports:  - "3307:3306"

3. Run:
   ```sh
  docker compose -f compose.develop.yml up -d
   ```
4. Go back and start the backend:
   ```sh
   cd ..
   npm install
   npm run dev
   ```


### Import System

- Uses **ES Modules** and the `#` alias for root imports.
- Each module directory contains a `module.js` file that re-exports its features
(Similar to python modules with `__init__.py`).

**Import features using:**

```js
import { feature } from "#module";
```

**Available modules**

- `#` at `.`
- `#core` at `./core/module.js`
- `#utils` at `./core/utils/module.js`
- `#engine` at `./core/engine/module.js`
- `#router` at `./core/router/module.js`
- `#socket` at `./core/socket/module.js`
- `#models` at `./core/models/module.js`
- `#objects` at `./core/objects/module.js`
- `#controllers` at `./core/controllers/module.j`"

### Registering Modules

- Place new modules in their own directory under `core/` or `/`.
- Implement your logic and export it in the module file.
- In `module.js`, re-export all public functions/classes:
  ```js
  export * as allExports from "./featureA";              // Re-Export all the file exports
  export { default as defaultExport } from "./featureB"; // Re-Export only the default export as a name export
  export { nameExport } from "./featureC";               // Re-Export single name import
  ```

> **INFO:** To learn more about named vs. default (unnamed) exports in ES Modules, see:  
        https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export#description
  
> **TIP:** In your `.vscode/setting.json` add the following lines to get better experience: 

 ```
 {
  Rest of your config...
  
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative"
}
```

This tells VSCode to always prefer non-relative imports like aliases or packages.

### Registering New Functions

- Add your function in the relevant module file.
- Export it, then ensure it is re-exported in `module.js`.
- Use the `#` import syntax to use it elsewhere.

### Registering New Modules

1. Create a new directory for your module in `core/`.
2. Add a `module.js` file inside your new module directory and re-export your features.
3. In `package.json`, add a new alias under `imports` (is at the bottom):
   - Key: `#<your-module>`
   - Value: Path to your `module.js` (e.g., `./core/<your-module>/module.js`)
4. Update `jsconfig.json` to include your new alias for editor support.
5. Import your module using the `#` alias anywhere in the project (except in the within the module itself, as it 
   may cause a circular dependency issue).

### Where to Place Features

- **Socket handlers:** `core/sockets/`
- **Controllers:** `core/controllers/`
- **Database models:** `core/models/`
- **Utilities:** `core/utils/`
- **Video game engine:** `core/engine/`
- **Middleware (eg auth):** `core/middleware/`
- **API Routes** `core/router/`
- **New features:** Create a new directory under `core/` or `/` as appropriate.

### Branching & PR Policy

- **Always** create a feature branch (`fr-<issue-id>-<issue-name>`) for new work.
- **Always** submit a Pull Request (PR) for review before merging to main branches.

---

## Project Structure

```
back-end/
|
├── index.js          # Main appication entry point
│
├── core/             # Main modules and shared logic
|   |
│   ├── app.js            # App setup
│   ├── server.js         # Server setup
│   ├── controllers/      # Route controllers
│   ├── engine/           # Game engine logic
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── router/           # API routes
│   ├── sockets/          # Socket.IO event handlers
│   └── utils/            # Utility functions
│
├── config/           # Configuration files
├── assets/           # Static assets
│
├── .env.develop      # Example environment variables
├── package.json      # npm configuration
├── jsconfig.json     # Editor config
└── README.md         # Project documentation
```

> **NOTE:** Each module contains a `module.js` for re-exporting.

**Feature placement**: 
Place new features in the most relevant directory or create a new one.

- **Socket handlers:** `core/sockets/`
- **Controllers:** `core/controllers/`
- **Database models:** `core/models/`
- **Utilities:** `core/utils/`
- **Video game engine:** `core/engine/`
- **Middleware (eg auth):** `core/middleware/`
- **API Routes** `core/router/`
- **New features:** Create a new directory under `core/` or `/` as appropriate.

## General Flow

- **Sockets**: Event handlers in `sockets/`, registered in the main server file.
- **API**: REST endpoints in `router/` and logic in `controllers/`.
- **Database**: Models in `models/`, using SQL and environment variables.


Follow these guidelines to keep the project organized and maintainable.

---

## Notes

Each solo project (flood / human edition) maintains its own db and its must me maintain on its own fork of the base 
repository