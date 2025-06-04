import db from '../../config/db.js';

export class viewChunk {
    static async get_viewChunk(req, res){
        try {
            const data = await db.query('SELECT * FROM view_chunk');
            res.json(data);
        } catch (err) {
            console.error('Error in get_viewChunk:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}