import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import priceUtils from "../../utils/priceUtils.js";

const getAllServicesService = async () => {
	try {
		const pool = await getPool();
		const query = `
            SELECT 
                s.id,
                s.title,
                s.description,
                s.price,
                s.created_at,
                s.delivery_time_days,
                s.place,
                s.user_id,
                u.name AS user_name,
                u.email AS user_email,
                u.avatar AS user_avatar,
                c.name AS category_name,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COUNT(r.id) AS review_count,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT('media_url', CONCAT('http://localhost:3000/uploads/', sm.media_url), 'type', sm.type))
                    FROM service_media sm
                    WHERE sm.service_id = s.id
                ) AS media
            FROM services s
            JOIN users u ON s.user_id = u.id
            JOIN categories c ON s.category_id = c.id
            LEFT JOIN reviews r ON s.id = r.service_id
            GROUP BY s.id, s.title, s.description, s.price, s.created_at, 
                     s.delivery_time_days, s.place, s.user_id, u.name, 
                     u.email, u.avatar, c.name
            ORDER BY s.created_at DESC
        `;

		const [rows] = await pool.execute(query);
		const processedRows = rows.map(row => ({
			...row,
			media: row.media || [], // Si media es null, usar array vacío
			rating: parseFloat(row.average_rating) || 0,
			reviews: parseInt(row.review_count) || 0,
			// Agregar precio formateado con símbolo de dólar
			price_formatted: priceUtils.formatPrice(row.price, 'USD'),
			// Mantener el precio original como número para cálculos
			price_number: parseFloat(row.price) || 0
		}));

		return processedRows;
	} catch (error) {
		console.error("Error in getAllServicesService:", error);
		throw generateErrorsUtils("Error retrieving services", 500);
	}
};

export default getAllServicesService;