import db from '../../config/db.js';

export class ViewGameController{
    static async get_viewGame(req, res){
        try {
            const data = await db.query('SELECT * FROM view_human_view_game');
            res.json(data);
        } catch (error) {
            console.error('Error in get_viewGame:', error);
            res.status(500).send('Internal Server Error');
        }
    }

}