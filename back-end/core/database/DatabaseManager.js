import { pool, query } from '../../config/db.js';
import { get_logger } from '#utils';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = get_logger("DATABASE_MANAGER");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class DatabaseManager {
    constructor() {
        this.pool = pool;
    }

    /**
     * Connect to the database
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            const connection = await this.pool.getConnection();
            logger.info('Database connection established');
            connection.release();
            return true;
        } catch (error) {
            logger.error(`Connection error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Disconnect from the database
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            await this.pool.end();
            logger.info('Database connection closed');
            return true;
        } catch (error) {
            logger.error(`Disconnection error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check database health
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        try {
            await query('SELECT 1');
            return true;
        } catch (error) {
            logger.error(`Health check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Create a database backup
     * @param {string} backupPath - Path to save the backup
     * @returns {Promise<string>} - Path to the backup file
     */
    async backup(backupPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const fullPath = path.join(backupPath, filename);

        try {
            // Get all tables
            const tables = await query('SHOW TABLES');

            let backupContent = '';

            // Generate backup for each table
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                const createTable = await query(`SHOW CREATE TABLE ${tableName}`);
                const tableData = await query(`SELECT * FROM ${tableName}`);

                backupContent += `\n-- Table: ${tableName}\n`;
                backupContent += `${Object.values(createTable[0])[1]};\n\n`;

                if (tableData.length > 0) {
                    backupContent += `INSERT INTO ${tableName} VALUES\n`;
                    backupContent += tableData.map(row =>
                        `(${Object.values(row).map(val =>
                            val === null ? 'NULL' :
                                typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` :
                                    val
                        ).join(', ')})`
                    ).join(',\n') + ';\n';
                }
            }

            await fs.writeFile(fullPath, backupContent);
            logger.info(`Backup created at: ${fullPath}`);
            return fullPath;
        } catch (error) {
            logger.error(`Backup failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Restore database from backup
     * @param {string} backupPath - Path to the backup file
     * @returns {Promise<void>}
     */
    async restore(backupPath) {
        try {
            const backupContent = await fs.readFile(backupPath, 'utf8');
            const statements = backupContent.split(';').filter(stmt => stmt.trim());

            for (const statement of statements) {
                if (statement.trim()) {
                    await query(statement);
                }
            }

            logger.info(`Database restored from: ${backupPath}`);
            return true;
        } catch (error) {
            logger.error(`Restore failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute a transaction
     * @param {Function} callback - Function containing transaction operations
     * @returns {Promise<any>}
     */
    async transaction(callback) {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();

        try {
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Run database migrations
     * @returns {Promise<void>}
     */
    async runMigrations() {
        try {
            // Create migrations table if it doesn't exist
            await query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(255) NOT NULL,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Get all migration files
            const migrationsDir = path.join(__dirname, '../../database/migrations');
            const files = await fs.readdir(migrationsDir);
            const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

            // Get executed migrations
            const executedMigrations = await query('SELECT name FROM migrations');
            const executedNames = executedMigrations.map(m => m.name);

            // Run pending migrations
            for (const file of sqlFiles) {
                if (!executedNames.includes(file)) {
                    const filePath = path.join(migrationsDir, file);
                    const migration = await fs.readFile(filePath, 'utf8');

                    await this.transaction(async (connection) => {
                        await connection.query(migration);
                        await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
                    });

                    logger.info(`Migration executed: ${file}`);
                }
            }
        } catch (error) {
            logger.error(`Migration failed: ${error.message}`);
            throw error;
        }
    }
}

export default new DatabaseManager(); 