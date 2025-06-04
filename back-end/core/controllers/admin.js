import db from '../../config/db.js';

export class AdminController {
    static async get_Admin(req, res) {
        const id = req.params.id;

        try {
            const [rows] = await db.query(
                `SELECT * FROM view_admin WHERE id = ?`,
                [id]
            );
            res.status(200).json(rows);
            } catch (error) {
                console.error('Error in view_admin:', error);
                res.status(500).send('Internal Server Error');
        }
    }
}
