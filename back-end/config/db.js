import dotenv from 'dotenv';

// Load environment variables FIRST
const envFile = `.env.${process.env.NODE_ENV || 'dev'}`;
console.log(`Loading environment file: ${envFile}`);
dotenv.config({ path: envFile });

// Now import everything else AFTER loading env vars
import mysql from 'mysql2/promise';
import { get_logger, failureCheck } from "#utils";

// Debug: Check what was loaded
console.log('Environment loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const logger = get_logger("DATABASE");

// Use DATABASE_URL if available, otherwise fall back to individual variables
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
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      };

// Validate configuration
if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required when using URL-based configuration');
    }
} else {
    failureCheck.atObjectNullSafe(dbConfig, 'Missing database configuration');
}

/**
 * @type {import('mysql2/promise').Pool}
 */
let pool;

/**
 * Initialize the database connection pool
 */
async function initDB() {
    try {
        console.log('Creating database pool with config:', 
            process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual parameters');
        
        pool = mysql.createPool(dbConfig);

        const connection = await pool.getConnection();
        logger.info('Database connection established successfully');
        
        // Test the connection
        const [rows] = await connection.execute('SELECT 1 as test');
        logger.info('Database test query successful:', rows);
        
        connection.release();
        return pool;
    } catch (error) {
        logger.error(`Failed to initialize database: ${error.message}`);
        throw error;
    }
}

/**
 * Execute a database query
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the query
 * @returns {Promise} Query result
 */
async function query(sql, params = []) {
    try {
        if (!pool) {
            logger.warn('Pool not initialized, initializing now...');
            await initDB();
        }
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        logger.error(`Query error: ${error.message}`);
        logger.error(`SQL: ${sql}`);
        logger.error(`Params: ${JSON.stringify(params)}`);
        throw error;
    }
}

/**
 * Get a connection from the pool
 * @returns {Promise} Database connection
 */
async function getConnection() {
    if (!pool) {
        await initDB();
    }
    return await pool.getConnection();
}

// Initialize database
(async () => {
    try {
        await initDB();
    } catch (err) {
        logger.error("Initial DB init failed:", err);
        process.exit(1); // Exit if database connection fails
    }
})();

// Debug check
if (process.env.DEBUG) {
    (async () => {
        try {
            await failureCheck.atDBConnection(pool, query, initDB, logger);
        } catch (debugError) {
            logger.error('Debug check failed:', debugError);
        }
    })();
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Closing database connections...`);
    if (pool) {
        try {
            await pool.end();
            logger.info('MySQL pool closed gracefully');
        } catch (error) {
            logger.error('Error closing MySQL pool:', error);
        }
    }
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export {
    query,
    pool,
    getConnection,
    initDB
};