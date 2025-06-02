// Servicio Endpoint para solicitar status freelancer

import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para solicitar el estatus de freelancer
const requestFreelancerStatusService = async (userId) => {
	try {
		// Obtenemos la conexión a la base de datos desde el pool de conexiones
		const pool = await getPool();
		// Verificar si ya tiene una solicitud pendiente
		const [existing] = await pool.query(
			`SELECT * FROM freelancer_requests WHERE user_id = ?`,
			[userId]
		);

		// Si ya existe una solicitud pendiente, lanzamos un error
		if (existing.length > 0) {
			throw generateErrorsUtils("Ya tienes una solicitud pendiente", 400);
		}

		// Si no hay solicitudes pendientes, creamos una nueva
		// Insertamos un nuevo registro en la tabla freelancer_requests
		// El [result] destructura el resultado de la operación INSERT
		const [result] = await pool.query(
			`INSERT INTO freelancer_requests (user_id, status) VALUES (?, 'pending')`,
			[userId] // El ID del usuario que hace la solicitud
		);

		// Retornamos el ID autogenerado de la solicitud recién creada
		return result.insertId;
	} catch (error) {
		if (error.httpStatus) {
			throw error;
		}
	}
};

export default requestFreelancerStatusService;
