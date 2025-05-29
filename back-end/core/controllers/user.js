export class UserController {
    static async get_user(req, res) {
        req.id = req.id || {};

        res.status(200).send(req.id);
    }
}