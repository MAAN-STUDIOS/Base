export class User {
    get_user(req, res) {
        req.user = req.user || {};

        res.status(200).send(req.user);
    }
}