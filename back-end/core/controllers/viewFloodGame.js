import db from '../../config/db.js';

export class HumanGame {
    static async get_viewFloodGame(req, res){
        try {
            const data = await db.query('SELECT * FROM view_flood_view_game');
            res.json(data);
        } catch (err) {
            console.error('Error in get_viewFloodGame:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}