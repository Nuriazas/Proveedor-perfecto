import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateServiceService = async (
	title,
	description,
	price,
	delivery_time_days,
	place,
	serviceId,
	userId
) => {
	const pool = await getPool();

	try {
		// 1. Verificamos que el servicio exista y pertenezca al usuario logueado
		const [service] = await pool.query(
			"SELECT user_id FROM services WHERE id = ?", // ✅ Campo correcto
			[serviceId] // ✅ Parámetro correcto
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

		// 2. Actualizamos el servicio
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
		`; // ✅ Query corregida - solo un WHERE

		const [result] = await pool.execute(query, [
			title,
			description,
			price,
			delivery_time_days,
			place,
			serviceId // ✅ Solo serviceId al final
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