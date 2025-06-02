import mysql from 'mysql2/promise';
import failureCheck from "../core/utils/failureCheck.js";
import get_logger from "../core/utils/logger.js";

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
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        };

    failureCheck.atObjectNullSafe(dbConfig, 'Missing database configuration', logger);

    try {
        console.log('Creating database pool with config:',
            process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual parameters');

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

async function connectDB() {
    try {
        logger.info("Starting db.");
        await initDB();
    } catch (err) {
        logger.error("Initial DB init failed:", err);
        process.exit(1); // Exit if database connection fails
    }

    if (process.env.DEBUG) {
        try {
            await failureCheck.atDBConnection(pool, query, initDB, logger);
        } catch (debugError) {
            logger.error('Debug check failed:', debugError);
        }
    }
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


export default {
    query,
    pool,
    connect: connectDB
};