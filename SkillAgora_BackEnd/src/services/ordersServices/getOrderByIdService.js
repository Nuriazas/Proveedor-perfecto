import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getOrderByIdService = async (orderId, userId) => {
	try {
		const pool = await getPool();

		const [order] = await pool.query(
			`SELECT 
                o.*,
                s.title as service_title,
                s.description as service_description,
                c.name as client_name,
                c.lastName as client_lastname,
                f.name as freelancer_name,
                f.lastName as freelancer_lastname
            FROM orders o
            JOIN services s ON o.services_id = s.id
            JOIN users c ON o.client_id = c.id
            JOIN users f ON o.freelancer_id = f.id
            WHERE o.id = ? AND (o.client_id = ? OR o.freelancer_id = ?)`,
			[orderId, userId, userId]
		);

		if (order.length === 0) {
			throw generateErrorsUtils(
				"Orden no encontrada o no tienes permisos",
				404
			);
		}

		return order[0];
	} catch (error) {
		throw generateErrorsUtils(
			"Error al obtener la orden",
			error.httpStatus || 500
		);
	}
};

export default getOrderByIdService;
