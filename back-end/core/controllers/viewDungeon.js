import db from '../../config/db.js';

export class ViewDungeon {
    static async get_viewDungeon(req, res){
        try {
            const data = await db.query('SELECT * FROM view_dungeon');
            res.json(data);
        } catch (err) {
            console.error('Error in get_view_dungeon:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}