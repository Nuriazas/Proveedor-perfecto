import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateOrderService = async (userId,
                        updateOrderId,
                        updateData) => {
    

    try {
        const pool = await getPool();
        const { status } = updateData;

        // Verificar que la orden existe y pertenece al usuario
        const [order] = await pool.query(
            `SELECT o.*, s.user_id as freelancer_id 
            FROM orders o 
            JOIN services s ON o.services_id = s.id 
            WHERE o.id = ? AND (o.client_id = ? OR s.user_id = ?)`,
            [updateOrderId, userId, userId]
        );
        console.log("Resultado de SELECT para verificar orden:", order);

        if (order.length === 0) {
            throw generateErrorsUtils("Orden no encontrada o no tienes permisos", 404);
        }

        // Verificar que el estado es válido
        const validStatuses = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw generateErrorsUtils("Estado no válido", 400);
        }

        // Actualizar la orden
        await pool.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [status, updateOrderId]
        );

        // Crear notificación para el otro usuario
        const notificationUserId = order[0].client_id === userId ? 
            order[0].freelancer_id : order[0].client_id;

        const statusMessages = {
            'in_progress': 'La orden ha comenzado',
            'delivered': 'La orden ha sido entregada',
            'completed': 'La orden ha sido completada',
            'cancelled': 'La orden ha sido cancelada'
        };

        const notificationStatus = {
            'in_progress': 'order_in_progress',
            'delivered': 'order_delivered',
            'completed': 'order_completed',
            'cancelled': 'order_cancelled'
        };

        if (statusMessages[status]) {
            await pool.query(
                `INSERT INTO notification (
                    user_id,
                    type,
                    content,
                    status,
                    is_read,
                    created_at
                ) VALUES (?, 'order', ?, ?, false, NOW())`,
                [notificationUserId, `Orden #${updateOrderId}: ${statusMessages[status]}`, notificationStatus[status]]
            );
        }

        return {
            updateOrderId,
            status,
            message: statusMessages[status] || 'Estado actualizado'
        };
    } catch (error) {
        throw generateErrorsUtils(
            "Error al actualizar la orden",
            error.httpStatus || 500
        );
    }
};

export default updateOrderService; 