import {verifyToken} from '../middleware/auth.js';
import { Game } from "../engine/engine.js";

export class GameController {
    constructor() {
        this.game = null;
    }
    static async startGame(req, res) {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = req.headers.authorization;
        const user = verifyToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (!req.params.name || !req.params.description || !req.params.seed) {
            return res.status(400).json({ error: 'Missing required parameters: name, description, seed' });
        }
        const player = await query('SELECT * FROM view_player WHERE id = ?', [user.id]);
        if (player.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        try {
            gameStarter(req.params.name, req.params.description, req.params.seed);
            res.status(200).json({ message: 'Game started successfully' });
        } catch (error) {
            console.error('Error starting game:', error);
            res.status(500).json({ error: 'Failed to start game' });
        }
    }

    gameStarter(name, description, seed){
        if (this.game.status === "running") {
            return new Error("Game is already running.");
        }
        this.game = new Game(
            {
                name: name,
                description: description,
                seed: seed
            }
        );
    }


   




}