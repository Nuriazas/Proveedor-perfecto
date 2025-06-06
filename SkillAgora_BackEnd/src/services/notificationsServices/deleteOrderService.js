import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const deleteOrderService = async (orderId, userId) => {
    try {
        const pool = await getPool();

        // Verificar que la orden existe y pertenece al usuario
        const [order] = await pool.query(
            `SELECT o.*, s.user_id as freelancer_id 
            FROM orders o 
            JOIN services s ON o.services_id = s.id 
            WHERE o.id = ? AND (o.client_id = ? OR s.user_id = ?)`,
            [orderId, userId, userId]
        );

        if (order.length === 0) {
            throw generateErrorsUtils("Orden no encontrada o no tienes permisos", 404);
        }

        // Verificar que la orden no esté en un estado que no permita eliminación
        const nonDeletableStatuses = ['completed', 'in_progress', 'delivered'];
        if (nonDeletableStatuses.includes(order[0].status)) {
            throw generateErrorsUtils(
                "No se puede eliminar una orden en estado " + order[0].status,
                400
            );
        }

        // Eliminar la orden
        await pool.query("DELETE FROM orders WHERE id = ?", [orderId]);

        // Crear notificación para el otro usuario
        const notificationUserId = order[0].client_id === userId ? 
            order[0].freelancer_id : order[0].client_id;

        await pool.query(
            `INSERT INTO notification (
                user_id,
                type,
                content,
                status,
                is_read,
                created_at
            ) VALUES (?, 'order', ?, 'order_cancelled', false, NOW())`,
            [notificationUserId, `La orden #${orderId} ha sido eliminada`]
        );

        return {
            message: "Orden eliminada correctamente",
            orderId
        };
    } catch (error) {
        throw generateErrorsUtils(
            "Error al eliminar la orden",
            error.httpStatus || 500
        );
    }
};

export default deleteOrderService; 