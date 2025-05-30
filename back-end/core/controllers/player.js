import db from '../../config/db.js';

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
}