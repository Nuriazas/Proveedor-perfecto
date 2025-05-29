import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Controlador para obtener el perfil del usuario autenticado
const getProfile = async (req, res, next) => {
	try {
		const pool = await getPool();

		// Realiza una consulta para obtener los datos del usuario
		// utilizando el ID que viene en el token (ya cargado en req.user por el middleware de autenticación)
		const [rows] = await pool.query(
			`SELECT id, name, firstName, lastName, email, avatar, active, role,
				bio, experience, portfolio_url, location, language, created_at
			 FROM users WHERE id = ?`,
			[req.user.id]
		);
		
		// Si no se encuentra ningún usuario con ese ID, se lanza un error 404
		if (rows.length === 0) {
			throw generateErrorsUtils("Usuario no encontrado", 404);
		}

		res.status(200).json({
			status: "ok",
			data: rows[0],
		});
	} catch (error) {
		// En caso de error, se pasa al middleware de manejo de errores
		next(error);
	}
};

export default getProfile;
