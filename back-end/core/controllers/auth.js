import db from '../../config/db.js';
import { generateToken, verifyToken, refreshAccessToken } from '../middleware/auth.js';
import get_logger from "../utils/logger.js";
import failureCheck from "../utils/failureCheck.js";


const logger = get_logger("CONTROLLER-AUTH");


export class AuthController {
    static async login(req, res) {
        if (!req.body) {
            return res.status(400).send({ error: 'No body provided' });
        }
        const body = req.body || {};

        if (!body.email || !body.password) {
            return res.status(400).send({ error: 'Email and password are required' });
        }

        try {
            const user = await db.query('SELECT * FROM cosmonavt_user WHERE email = ? AND password = ?', [body.email, body.password]);
            if (user.length === 0) {
                return res.status(401).send({ error: 'Invalid email or password' });
            }

            const token = generateToken(user[0]);
            res.status(200).send({ token, user: { id: user[0].id, email: user[0].email, name: user[0].name, accessLevel: user[0]?.access_level } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).send({ error: 'Internal server error' });
        }

        failureCheck.atNoRespondSendGuard(res, logger);
    }

    static async register(req, res) {
        if (!req.body) {
            return res.status(400).send({ error: 'No body provided' });
        }
        const body = req.body || {};

        if (!body.email || !body.password || !body.name) {
            return res.status(400).send({ error: 'Name, email and password are required' });
        }

        try {
            // Check if user already exists
            const existingUser = await db.query('SELECT * FROM cosmonavt_user WHERE email = ?', [body.email]);
            if (existingUser.length > 0) {
                return res.status(409).send({ error: 'User already exists' });
            }

            // Insert new user
            const result = await db.query(
                'INSERT INTO cosmonavt_user (name, email, password) VALUES (?, ?, ?)',
                [body.name, body.email, body.password]
            );

            if (result.affectedRows === 0) {
                return res.status(500).send({ error: 'Failed to create user' });
            }

            // Generate token for the new user
            const token = generateToken({
                id: result.insertId,
                email: body.email,
                name: body.name
            });

            res.status(201).send({
                token,
                user: {
                    id: result.insertId,
                    email: body.email,
                    name: body.name
                }
            });
        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    }

    static async verifyToken(req, res) {
        const body = req.body || {};
        let token = (body.token || req.headers.authorization).toString();
        token = token.includes("Bearer") ? token.split(' ')[1] : token;

        if (!token) {
            return res.status(401).send({ error: 'No token provided' });
        }

        try {
            const user = verifyToken(token);
            //logger.debug("Token Verified");
            if (!user) {
                return res.status(401).send({ error: 'Invalid token' });
            }

            try {
                logger.debug("Verifying player id...")
                const player = await db.query(
                    `SELECT *
                     FROM player
                     WHERE id = ?`,
                    [user.id]);

                if (!player || player.length === 0) {
                    logger.warn(`No player found for ${user.id}`);
                    res.status(404).send({ error: 'No user founded' });
                }

                logger.debug("Player ID verified");
                res.status(200).send({});
            } catch (err) {
                logger.error(err.message);
                res.status(500).send(err);
            }
        } catch (error) {
            logger.error('Token verification failed:', error);
            res.status(500).send({ error: 'Failed to verify token' });
        }

        failureCheck.atNoRespondSendGuard(res, logger);
    }

    // No work because bad logic
    static async refreshAccessToken(req, res) {
        try {
            const newToken = await refreshAccessToken(req, res);
            res.status(200).send(newToken);
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            res.status(500).send({ error: 'Failed to refresh access token' });
        }
    }
}
