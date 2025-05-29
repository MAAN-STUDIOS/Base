import {db} from '#config';

export class UserController {
    static async get_user(req, res) {
        req.id = req.id || {};

        db.run(`SELECT * FROM cosmonavt_users WHERE id=${req.id}`);
        res.status(200).send(req.id);
    }
}