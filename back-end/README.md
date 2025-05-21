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

# Game Database System

This document provides comprehensive documentation for the game's database system, which handles all persistent data storage for the game including user management, game sessions, locations, fragments, and player progress.

## Table of Contents
- [Overview](#overview)
- [Database Schema](#database-schema)
- [Database Manager](#database-manager)
- [Initialization](#initialization)
- [Environment Setup](#environment-setup)
- [Usage Examples](#usage-examples)
- [Maintenance](#maintenance)

## Overview

The database system is built using MySQL and provides a robust foundation for storing and managing game data. It includes features such as:
- User authentication and management
- Game session tracking
- Location and fragment management
- Player progress tracking
- Game statistics
- Automatic updates via triggers
- Transaction safety
- Backup and restore capabilities
- Migration system

## Database Schema

### Core Tables

#### Users (`users`)
Stores user account information:
- `id`: Unique identifier
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `last_login`: Last login timestamp
- `is_active`: Account status

#### Game Sessions (`game_sessions`)
Tracks active game sessions:
- `id`: Unique identifier
- `user_id`: Reference to users table
- `start_time`: Session start timestamp
- `end_time`: Session end timestamp
- `status`: Session status (active/completed/abandoned)
- `current_location_id`: Current location reference

#### Locations (`locations`)
Stores game locations:
- `id`: Unique identifier
- `name`: Location name
- `description`: Location description
- `is_accessible`: Access status
- `created_at`: Creation timestamp

#### Fragments (`fragments`)
Contains game content fragments:
- `id`: Unique identifier
- `location_id`: Reference to locations table
- `content`: Fragment content
- `order_index`: Display order
- `is_required`: Required status
- `created_at`: Creation timestamp

#### Player Progress (`player_progress`)
Tracks player achievements:
- `id`: Unique identifier
- `user_id`: Reference to users table
- `fragment_id`: Reference to fragments table
- `discovered_at`: Discovery timestamp
- `is_completed`: Completion status

#### Game Statistics (`game_statistics`)
Maintains player statistics:
- `id`: Unique identifier
- `user_id`: Reference to users table
- `total_play_time`: Total time played
- `fragments_discovered`: Number of discovered fragments
- `locations_visited`: Number of visited locations
- `last_updated`: Last update timestamp

### Automatic Updates

The system includes triggers for automatic statistics updates:
- `after_fragment_discovery`: Updates fragment discovery count
- `after_location_visit`: Updates location visit count

## Database Manager

The `DatabaseManager` class provides a comprehensive interface for database operations:

### Core Methods
```javascript
async connect()      // Establishes database connection
async disconnect()   // Closes database connection
async healthCheck()  // Verifies database health
```

#### Data Management
```javascript
async backup(backupPath)    // Creates database backup
async restore(backupPath)   // Restores from backup
async transaction(callback) // Executes transaction
```

#### Migration System
```javascript
async runMigrations() // Executes pending migrations
```

## Initialization

The database can be initialized using the provided script:

```bash
cd back-end
node scripts/init-db.js
```

This script:
1. Creates the database schema
2. Sets up all required tables
3. Loads initial seed data
4. Configures triggers and indexes

## Environment Setup

Create a `.env` file in the back-end directory with the following variables:

```env
DB_HOST=localhost
DB_USER=your_user
DB_ROOT_PASSWORD=your_password
DB_DATABASE=game_db
DB_PORT=3306
```

## Usage Examples

### Basic Database Operations

```javascript
import DatabaseManager from './core/database/DatabaseManager';

// Connect to database
await DatabaseManager.connect();

// Execute transaction
await DatabaseManager.transaction(async (connection) => {
    // Your database operations here
});

// Create backup
const backupPath = await DatabaseManager.backup('./backups');

// Restore from backup
await DatabaseManager.restore('./backups/backup-2024-03-21.sql');

// Check database health
const isHealthy = await DatabaseManager.healthCheck();
```

### Running Migrations

```javascript
// Run all pending migrations
await DatabaseManager.runMigrations();
```

## Maintenance

### Backup Strategy
- Regular backups should be scheduled
- Store backups in a secure location
- Test restore procedures periodically

### Performance Optimization
- Monitor query performance
- Use appropriate indexes
- Regular maintenance of statistics

### Security Considerations
- Use strong passwords
- Implement connection pooling
- Regular security audits
- Keep dependencies updated

## Contributing

When making changes to the database:
1. Create a new migration file
2. Test changes in development
3. Update documentation
4. Follow the established naming conventions

## Support

For issues or questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue if needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.