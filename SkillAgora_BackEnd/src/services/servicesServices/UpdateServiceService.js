import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateServiceService = async (
	id,
	title,
	description,
	price,
	delivery_time_days,
	place,
	userId // <-- ahora recibimos el userId del token
) => {
	const pool = await getPool();

	try {
		// 1. Verificamos que el servicio exista y pertenezca al usuario logueado
		const [service] = await pool.query(
			"SELECT user_id FROM services WHERE id = ?",
			[id]
		);

		if (service.length === 0) {
			throw generateErrorsUtils("Service not found.", 404);
		}

		if (service[0].user_id !== userId) {
			throw generateErrorsUtils(
				"Unauthorized: You don't own this service.",
				403
			);
		}

		// 2. Actualizamos el servicio (sin category_id)
		const query = `
			UPDATE services
			SET 
				title = ?, 
				description = ?, 
				price = ?, 
				delivery_time_days = ?, 
				place = ?, 
				updated_at = NOW()
			WHERE id = ?
		`;

		const [result] = await pool.execute(query, [
			title,
			description,
			price,
			delivery_time_days,
			place,
			id,
		]);

		if (result.affectedRows === 0) {
			throw generateErrorsUtils("Update failed: Service not updated.", 500);
		}

		return result;
	} catch (error) {
		throw generateErrorsUtils("Error updating service: " + error.message, 500);
	}
};

export default updateServiceService;
