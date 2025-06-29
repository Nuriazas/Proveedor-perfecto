import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getOrdersService = async (userId, filters = {}) => {
  try {
    const pool = await getPool();

    let query = `
      SELECT 
          o.id,
          o.client_id,
          o.services_id,
          o.freelancer_id,
          o.status,
          o.total_price,
          o.ordered_at,
          o.currency_code,
          s.title as service_title,
          client.name as client_name,
          client.lastName as client_lastName,
          client.email as client_email
      FROM orders o
      LEFT JOIN services s ON o.services_id = s.id
      LEFT JOIN users client ON o.client_id = client.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Filtrar por usuario (cliente o freelancer)
    if (filters.role === "client") {
      query += " AND o.client_id = ?";
      queryParams.push(userId);
    } else if (filters.role === "freelancer") {
      query += " AND o.freelancer_id = ?";
      queryParams.push(userId);
    } else {
      // Por defecto mostrar todas las órdenes del usuario
      query += " AND (o.client_id = ? OR o.freelancer_id = ?)";
      queryParams.push(userId, userId);
    }

    // Filtrar por estado
    if (filters.status) {
      const validStatuses = [
        "pending",
        "in_progress",
        "delivered",
        "completed",
        "cancelled",
      ];
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
    console.error("❌ ERROR en getOrdersService:", error);
    throw generateErrorsUtils(
      "Error al obtener las órdenes",
      error.httpStatus || 500
    );
  }
};

export default getOrdersService;
