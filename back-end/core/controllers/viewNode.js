import db from '../../config/db.js';

export class ViewNode {
    static async get_viewNode(req, res){
        try {
            const data = await db.query('SELECT * FROM view_node');
            res.json(data);
        } catch (err) {
            console.error('Error in get_viewNode:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}