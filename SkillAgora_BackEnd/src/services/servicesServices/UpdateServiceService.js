// Servicio Endpoint Actualización servicio/producto

// Importamos el pool de conexión a la base de datos
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para actualizar los datos de un servicio específico
const updateServiceService = async (
	id,
	title,
	description,
	price,
	delivery_time_days,
	place,
	category_id
) => {
	const pool = await getPool();

	try {
		// Consulta SQL para actualizar los campos del servicio
		const query = `
			UPDATE services
			SET 
				title = ?, 
				description = ?, 
				price = ?, 
				delivery_time_days = ?, 
				place = ?, 
				category_id = ?, 
				updated_at = NOW()
			WHERE id = ?
		`;
		const [result] = await pool.execute(query, [
			title,
			description,
			price,
			delivery_time_days,
			place,
			category_id,
			id,
		]);

		// Si no se actualizó ninguna fila, es porque el ID no existe
		if (result.affectedRows === 0) {
			throw generateErrorsUtils(
				"Cannot find a service with the specified ID.",
				404
			);
		}

		// Si se actualizó correctamente, devolvemos el resultado
		return result;
	} catch (error) {
		// Lanzamos el error para que lo maneje el controlador
		throw generateErrorsUtils("Error updating service: ", 500 + error);
	}
};

export default updateServiceService;
