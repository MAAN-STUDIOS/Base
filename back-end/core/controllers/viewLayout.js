import db from '../../config/db.js';

export class ViewLayout {
    static async get_viewLayout(req, res){
        try {
            const data = await db.query('SELECT * FROM view_layout');
            res.json(data);
        } catch (err) {
            console.error('Error in get_viewLayout:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}