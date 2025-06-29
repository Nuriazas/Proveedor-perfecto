import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import priceUtils from "../../utils/priceUtils.js";

const getServiceDetailsByIdService = async (serviceId) => {
	try {
		const pool = await getPool();

		const query = `
            SELECT 
				s.id AS service_id,
				s.user_id AS user_id,
				s.category_id AS category_id,
				s.place,
				s.title,
				s.description,
				s.price,
				s.delivery_time_days,
				s.created_at,
				u.name AS user_name,
				u.avatar AS user_avatar,
				c.name AS category_name,
				(
					SELECT JSON_ARRAYAGG(
						JSON_OBJECT('media_url', sm.media_url, 'type', sm.type)
					)
					FROM service_media sm
					WHERE sm.service_id = s.id
				) AS media
			FROM services s
			JOIN users u ON s.user_id = u.id
			JOIN categories c ON s.category_id = c.id
			WHERE s.id = ?
            `;
			

		const [rows] = await pool.query(query, [serviceId]);

		if (rows.length === 0) {
			throw generateErrorsUtils("Service not found", 404);
		}

		// Procesar el resultado para agregar precio formateado
		const service = rows[0];
		const processedService = {
			...service,
			// Agregar precio formateado con símbolo de dólar
			price_formatted: priceUtils.formatPrice(service.price, 'USD'),
			// Mantener el precio original como número para cálculos
			price_number: parseFloat(service.price) || 0
		};

		console.log("🔍 Resultado de getServiceDetailsByIdService:", processedService);

		return processedService;
	} catch (error) {
		console.error("❌ Error en getServiceDetailsByIdService:", error);
		throw error;
	}
};

export default getServiceDetailsByIdService;
