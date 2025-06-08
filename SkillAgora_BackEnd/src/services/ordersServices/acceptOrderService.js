import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const acceptOrderService = async (orderId, userId) => {
	try {
		const pool = await getPool();

		// Obtenemos la orden para validar que el userId es freelancer asignado
		const [orders] = await pool.query(
			`SELECT freelancer_id, status FROM orders WHERE id = ?`,
			[orderId]
		);

		if (orders.length === 0) {
			throw generateErrorsUtils("Orden no encontrada", 404);
		}

		const order = orders[0];

		if (order.freelancer_id !== userId) {
			throw generateErrorsUtils(
				"No tienes permisos para aceptar esta orden",
				403
			);
		}

		if (order.status !== "pending") {
			throw generateErrorsUtils("La orden no está en estado pendiente", 400);
		}

		await pool.query(`UPDATE orders SET status = 'in_progress' WHERE id = ?`, [
			orderId,
		]);

		// Opcional: devolver la orden actualizada
		return { ...order, status: "in_progress" };
	} catch (error) {
		throw generateErrorsUtils("Error al aceptar la orden", 500);
	}
};

export default acceptOrderService;
