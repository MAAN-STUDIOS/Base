import db from '../../config/db.js';

export class HumanGame {
    static async get_viewHumanGame(req, res){
        try {
            const data = await db.query('SELECT * FROM view_human_view_game');
            res.json(data);
        } catch (err) {
            console.error('Error in get_player:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}