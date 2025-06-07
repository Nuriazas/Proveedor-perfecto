import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const saveOrderDelivery = async (orderId, deliveryUrl, userId, message = null) => {
    try {
        const pool = await getPool();

        // Insertar el URL en orders_deliveries (puedes añadir más campos si quieres)
        const [result] = await pool.query(
            `INSERT INTO order_deliveries (order_id, message, user_id, file_url, delivered_at)
            VALUES (?, ?,?, ?, NOW())`,
            [orderId, userId, deliveryUrl, message]
        );

        return {
            deliveryId: result.insertId,
            orderId,
            userId,
            deliveryUrl,
            message,
            deliveredAt: new Date()
        };
    } catch (error) {
        throw generateErrorsUtils("Error al guardar la entrega", error.httpStatus || 500);
    }
};

export default saveOrderDelivery;
