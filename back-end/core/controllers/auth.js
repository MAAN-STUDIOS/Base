import { query } from '../../config/db.js';
import {generateToken, verifyToken, refreshAccessToken} from '../middleware/auth.js';


export class AuthController {
    static async login(req, res) {
        if (!req.body) {
            return res.status(400).send({ error: 'No body provided' });
        }
        const body = req.body || {};
        
        if (!body.email || !body.password) {
            return res.status(400).send({ error: 'No body provided' });
        }
        const user = await query('SELECT * FROM cosmonavt_user WHERE email = ? AND password = ?', [body.email, body.password]);
        if (user.length === 0) {
            return res.status(401).send({ error: 'Invalid username or password' });
        }

        
        const token = generateToken(user[0]);
        console.log(token);
        res.status(200).send(token);
    }
    static async register(req, res) {
        if (!req.body) {
            return res.status(400).send({ error: 'No body provided' });
        }
        const body = req.body || {};
        
        if (!body.email || !body.password) {
            return res.status(400).send({ error: 'No body provided' });
        }
        
        const existingUser = await query('SELECT * FROM cosmonavt_user WHERE email = ?', [body.email]);
        if (existingUser.length > 0) {
            return res.status(409).send({ error: 'User already exists' });
        }
        
        const newUser = await query('INSERT INTO cosmonavt_user (nombre, email, password) VALUES (?, ?, ?)', [body.nombre, body.email, body.password]);
        if (newUser.affectedRows === 0) {
            return res.status(500).send({ error: 'Failed to create user' });
        }
        
        const token = generateToken({ id: newUser.insertId, email: body.email });
        res.status(201).send(token);
    }
    static async verifyToken(req, res){
        
        const body = req.body || {};
        const token = body.token || req.headers.authorization;
        
        if (!token) {
            return res.status(401).send({ error: 'No token provided' });
        }
        
        try {
            const user = verifyToken(token);
            if (!user) {
                return res.status(401).send({ error: 'Invalid token' });
            }
            res.status(200).send({ user });
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(500).send({ error: 'Failed to verify token' });
        }
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
