import db from '../../config/db.js';

export class UserController {
    static async get_user(req, res) {
        try {
            const user = await db.query(
                `SELECT *
                 FROM cosmonavt_user
                 WHERE id = ?`,
                [req.user.id]);

            res.status(200).send(user[0]);
        } catch (err) {
            res.status(500).send(err);
        }
    }
}