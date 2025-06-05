import db from '../../config/db.js';
import { generateToken } from "../middleware/auth.js";
import get_logger from "../utils/logger.js";


const logger = get_logger("CONTROLLER-PLAYER");


export class PlayerController {
    static async get_player(req, res) {
        const id = req.params.id;

        try {
            const [rows] = await db.query(
                `SELECT * FROM view_player WHERE id = ?`,
                [id]
            );
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error in get_player:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async create_player(req, res) {
        const body = req.body || {};

        if (!body.email || !body.password || !body.name) {
            return res.status(400).send({ error: 'Name, email and password are required' });
        }

        try {
            const existingUser = await db.query(
                'SELECT * FROM cosmonavt_user WHERE email = ?',
                [body.email]
            );

            if (existingUser.length > 0) {
                return res.status(409).send({ error: 'User already exists' });
            }

            const result = await db.query(
                'INSERT INTO cosmonavt_user (name, email, password) VALUES (?, ?, ?)',
                [body.name, body.email, body.password]
            );

            if (result.affectedRows === 0) {
                const msg  = 'Failed to create user';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }

            const user = await db.query(
                'INSERT INTO player (user_id) VALUES (?)',
                [result.insertId],
            );

            if (result.affectedRows === 0) {
                const msg  = 'Failed to create player';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }

            const token = generateToken({
                id: user.insertId,
                email: body.email,
                name: body.name
            });

            logger.info(`PLayer created width id ${user.insertId}`);
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
}