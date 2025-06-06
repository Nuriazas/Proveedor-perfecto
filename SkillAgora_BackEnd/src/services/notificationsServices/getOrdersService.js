import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getOrdersService = async (userId, filters = {}) => {
    try {
        const pool = await getPool();

        let query = `
            SELECT 
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
            WHERE 1=1
        `;
        const queryParams = [];

        // Filtrar por usuario (cliente o freelancer)
        if (filters.role === 'client') {
            query += " AND o.client_id = ?";
            queryParams.push(userId);
        } else if (filters.role === 'freelancer') {
            query += " AND o.freelancer_id = ?";
            queryParams.push(userId);
        } else {
            query += " AND (o.client_id = ? OR o.freelancer_id = ?)";
            queryParams.push(userId, userId);
        }

        // Filtrar por estado
        if (filters.status) {
            const validStatuses = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'];
            if (!validStatuses.includes(filters.status)) {
                throw generateErrorsUtils("Estado no válido", 400);
            }
            query += " AND o.status = ?";
            queryParams.push(filters.status);
        }

        // Ordenar por fecha de creación
        query += " ORDER BY o.ordered_at DESC";

        const [orders] = await pool.query(query, queryParams);

        return orders;
    } catch (error) {
        throw generateErrorsUtils(
            "Error al obtener las órdenes",
            error.httpStatus || 500
        );
    }
};

export default getOrdersService; 