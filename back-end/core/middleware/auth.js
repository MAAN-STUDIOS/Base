import jwt from 'jsonwebtoken';
import get_logger from "../utils/logger.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.dev
dotenv.config({ path: path.resolve(__dirname, '../../.env.dev') });

const logger = get_logger("AUTH");
const JWT_SECRET = process.env.JWT_SECRET || 'cosmonavt_secret_key'; // Fallback for development
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '360d';
const REFRESH_TOKEN_EXPIRY = '80d';


/**
 * Generate an authentication token for a user
 * @param {Object} user - User information to encode in the token
 * @returns {String||null} JWT token
 */
function generateToken(user) {
    if (!user || !user.id) {
        logger.error('Cannot generate token: Invalid user data');
        return null;
    }
    logger.debug(`Generating token for user ID: ${user.id}`);

    const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        accessLevel: user.accessLevel ? user.accessLevel : undefined
    };

    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Generate a refresh token for a user
 * @param {Object} user - User information to encode in the token
 * @returns {String||null} Refresh JWT token
 */
function generateRefreshToken(user) {
    if (!user || !user.id) {
        logger.error('Cannot generate refresh token: Invalid user data');
        return null;
    }

    logger.debug(`Generating refresh token for user ID: ${user.id}`);

    const tokenPayload = {
        id: user.id,
        username: user.username,
        tokenType: 'refresh'
    };

    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Middleware to authenticate API requests using JWT
 */
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            logger.warn('Authentication failed: No authorization header');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            logger.warn('Authentication failed: No token in authorization header');
            return res.status(401).json({ message: 'Authentication token required' });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    logger.warn(`Authentication failed: Token expired`);
                    return res.status(401).json({ message: 'Token expired', expired: true });
                }

                logger.warn(`Authentication failed: ${err.message}`);
                return res.status(403).json({ message: 'Invalid token' });
            }

            logger.debug(`User ${user.id} authenticated successfully`);
            req.user = user;

            if (user.id && !isNaN(parseInt(user.id))) {
                req.user.id = parseInt(user.id);
            } else {
                logger.warn('Invalid user ID');
                req.user.id = null;
            }

            next();
        });
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);
        return res.status(500).json({ message: 'Authentication processing failed' });
    }
}

/**
 * Verify and decode a provided token
 */
function verifyToken(token) {
    try {
        logger.debug("Verifying token");
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        return null;
    }
}

/**
 * Refresh an expired access token using a valid refresh token
 */
function refreshAccessToken(req, res) {
    const refreshToken = req.body.refreshToken || req.headers.authorization;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        if (decoded.tokenType !== 'refresh') {
            logger.warn('Invalid refresh token type');
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const user = { id: decoded.id };
        const newAccessToken = generateToken(user);

        logger.info(`Access token refreshed for user ${user.id}`);
        return res.json({ token: newAccessToken });
    } catch (error) {
        logger.error(`Token refresh failed: ${error.message}`);
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
}


export {
    generateToken,
    generateRefreshToken,
    authenticateToken,
    verifyToken,
    refreshAccessToken
};