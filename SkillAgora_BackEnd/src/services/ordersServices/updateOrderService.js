import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateOrderService = async (userId, updateOrderId, updateData) => {
  try {
    const pool = await getPool();

    console.log("🔧 DEBUG updateOrderService:");
    console.log("🔧 Order ID:", updateOrderId, typeof updateOrderId);
    console.log("🔧 User ID:", userId, typeof userId);

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await pool.query(
      `SELECT o.*, s.user_id as freelancer_id 
            FROM orders o 
            JOIN services s ON o.services_id = s.id 
            WHERE o.id = ? AND (o.client_id = ? OR s.user_id = ?)`,
      [updateOrderId, userId, userId]
    );

    if (order.length === 0) {
      throw generateErrorsUtils(
        "Orden no encontrada o no tienes permisos",
        404
      );
    }

    // Construir query dinámicamente
    const updateFields = [];
    const updateValues = [];

    // Manejar status
    if (updateData.status) {
      const validStatuses = [
        "pending",
        "in_progress", 
        "delivered",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(updateData.status)) {
        throw generateErrorsUtils("Estado no válido", 400);
      }
      updateFields.push("status = ?");
      updateValues.push(updateData.status);
    }

    // Manejar delivery_url
    if (updateData.delivery_url) {
      updateFields.push("delivery_url = ?");
      updateValues.push(updateData.delivery_url);
    }

    // Manejar delivered_at
    if (updateData.delivered_at) {
      updateFields.push("delivered_at = ?");
      updateValues.push(updateData.delivered_at);
    }

    // Si es delivered y no se especifica delivered_at, usar NOW()
    if (updateData.status === 'delivered' && !updateData.delivered_at) {
      updateFields.push("delivered_at = NOW()");
    }

    if (updateFields.length === 0) {
      throw generateErrorsUtils("No hay campos para actualizar", 400);
    }

    // Ejecutar update
    updateValues.push(updateOrderId);
    const updateQuery = `UPDATE orders SET ${updateFields.join(", ")} WHERE id = ?`;
    
    console.log("🔧 Query de actualización:", updateQuery);
    console.log("🔧 Valores:", updateValues);
    
    await pool.query(updateQuery, updateValues);

    // Crear notificaciones solo si se actualiza el status
    if (updateData.status) {
      const notificationUserId =
        order[0].client_id === userId
          ? order[0].freelancer_id
          : order[0].client_id;

      const statusMessages = {
        in_progress: "La orden ha comenzado",
        delivered: "La orden ha sido entregada",
        completed: "La orden ha sido completada",
        cancelled: "La orden ha sido cancelada",
      };

      const notificationStatus = {
        in_progress: "order_in_progress",
        delivered: "order_delivered",
        completed: "order_completed",
        cancelled: "order_cancelled",
      };

      if (statusMessages[updateData.status]) {
        await pool.query(
          `INSERT INTO notification (
                        user_id,
                        type,
                        content,
                        status,
                        is_read,
                        created_at
                    ) VALUES (?, 'order', ?, ?, false, NOW())`,
          [
            notificationUserId,
            `Orden #${updateOrderId}: ${statusMessages[updateData.status]}`,
            notificationStatus[updateData.status],
          ]
        );
      }

      if (updateData.status === "delivered") {
        await pool.query(
          `INSERT INTO notification (
              user_id,
              type,
              content,
              status,
              is_read,
              created_at
          ) VALUES (?, 'review', ?, 'review_received', false, NOW())`,
          [
            order[0].client_id,
            `Your order ${updateOrderId} has been delivered. Don't forget to leave your review!`,
          ]
        );
      }
    }

    const statusMessages = {
    in_progress: "La orden ha comenzado",
    delivered: "La orden ha sido entregada", 
    completed: "La orden ha sido completada",
    cancelled: "La orden ha sido cancelada",
    };

    return {
        updateOrderId,
        status: updateData.status,
        delivery_url: updateData.delivery_url,
        message: updateData.status ? (statusMessages[updateData.status] || "Estado actualizado") : "Orden actualizada",
    };
  } catch (error) {

    throw generateErrorsUtils(
      error.message || "Error al actualizar la orden",
      error.httpStatus || 500
    );
  }
};

export default updateOrderService;