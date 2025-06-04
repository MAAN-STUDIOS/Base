import mysql from 'mysql2/promise';
import failureCheck from "../core/utils/failureCheck.js";
import get_logger from "../core/utils/logger.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.dev
dotenv.config({ path: path.resolve(__dirname, '../.env.dev') });

const logger = get_logger("DB");

/**
 * @type {import('mysql2/promise')}
 */
let pool;

/**
 * Initialize the database connection pool
 */
async function initDB() {
    const dbConfig = process.env.DATABASE_URL
        ? {
            uri: process.env.DATABASE_URL,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 10
        }
        : {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_ROOT_PASSWORD || process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 10,
        };
    failureCheck.atObjectNullSafe(dbConfig, 'Missing database configuration', logger);

    try {
        pool = mysql.createPool(dbConfig);

        const connection = await pool.getConnection();
        logger.info('Database connection established successfully');
        connection.release();

        return pool;
    } catch (error) {
        logger.error(`Failed to initialize database: ${error.message}`);
        throw error;
    }
}

/**
 * Execute a database query
 * @param {String} sql - SQL query to execute
 * @param {Array} params - Parameters for the query
 * @returns {Promise} Query result
 */
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        logger.error(`Query error: ${error.message}`);
        throw error;
    }
}

async function connectDB() {
    try {
        logger.info("Starting db.");
        await initDB();
    } catch (err) {
        logger.error("Initial DB init failed:", err);
    }

    if (process.env.DEBUG) {
        await failureCheck.atDBConnection(pool, query, initDB, logger);
    }
}

process.on('SIGINT', async () => {
    if (pool) {
        await pool.end();
        logger.info('MySQL pool closed');
    }
    process.exit(0);
});


export default {
    query,
    pool,
    connect: connectDB
};