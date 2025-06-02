import db from '../../config/db.js';

export class ConfigController {
    static async get_config(req, res) {
        const id = req.params.id;

        try {
            const [rows] = await db.query(
                `SELECT * FROM view_config WHERE id = ?`,
                [id]
            );
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error in get_config:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
