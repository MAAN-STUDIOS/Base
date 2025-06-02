import db from '../../config/db.js';

export class UserController {
    static async get_user(req, res) {
        req.id = req.id || {};

        await db.query(`SELECT *
                         FROM cosmonavt_users
                         WHERE id = ${req.id}`, []);
        res.status(200).send(req.id);
    }
}