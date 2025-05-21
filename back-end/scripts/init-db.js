import DatabaseManager from '../core/database/DatabaseManager.js';
import { get_logger } from '#utils';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = get_logger("DB_INIT");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
    try {
        // Connect to database
        await DatabaseManager.connect();

        // Read and execute schema
        const schemaPath = path.join(__dirname, '../database/schemas/init.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await DatabaseManager.transaction(async (connection) => {
            const statements = schema.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
        });

        // Read and execute seed data
        const seedPath = path.join(__dirname, '../database/seeds/initial_data.sql');
        const seed = await fs.readFile(seedPath, 'utf8');
        await DatabaseManager.transaction(async (connection) => {
            const statements = seed.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
        });

        logger.info('Database initialized successfully');
        return true;
    } catch (error) {
        logger.error(`Database initialization failed: ${error.message}`);
        throw error;
    } finally {
        await DatabaseManager.disconnect();
    }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default initializeDatabase; 