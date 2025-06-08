import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getServiceDetailsByIdService = async (serviceId) => {
	try {
		const pool = await getPool();

		const query = `
            SELECT 
            s.id, s.user_id, s.category_id, s.place, s.title, s.description, s.price, s.delivery_time_days, s.created_at,
            u.name as user_name, u.avatar as user_avatar,
            c.name as category_name,
            -- obtener media (imagenes/videos) relacionados
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('media_url', sm.media_url, 'type', sm.type)) FROM service_media sm WHERE sm.service_id = s.id) as media
            FROM services s
            JOIN users u ON s.user_id = u.id
            JOIN categories c ON s.category_id = c.id
            WHERE s.id = ?
            `;

		const [rows] = await pool.query(query, [serviceId]);

		if (rows.length === 0) {
			throw generateErrorsUtils("Service not found", 404);
		}

		return rows[0];
	} catch (error) {}
};

export default getServiceDetailsByIdService;
