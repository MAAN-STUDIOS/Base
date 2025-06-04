import db from '../../config/db.js';

export class AdminController {
    static async get_Admin(req, res) {
        const { id } = req.params;

        try {
            const [rows] = await db.query(
                `SELECT * FROM viewAdmin WHERE id = ?`, 
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Admin no encontrado' });
            }

            //Si existe, devolver el primer objeto (rows[0])
            return res.status(200).json(rows[0]);
            } catch (error) {
                console.error(`Error obteniendo Admin con id=${id}:`, error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
//Hola aquí esta mi endpoint 