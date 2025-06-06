import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const createOrderService = async (userId, services_id, total_price, currency_code = 'USD') => {
    try {
        const pool = await getPool();

        // Verificar que el servicio existe y obtener el freelancer_id
        const [service] = await pool.query(
            "SELECT id, user_id as freelancer_id FROM services WHERE id = ?",
            [services_id]
        );

        if (service.length === 0) {
            throw generateErrorsUtils("El servicio no existe", 404);
        }

        // Crear la orden
        const [result] = await pool.query(
            `INSERT INTO orders (
                client_id,
                services_id,
                freelancer_id,
                status,
                total_price,
                currency_code,
                ordered_at
            ) VALUES (?, ?, ?, 'pending', ?, ?, NOW())`,
            [userId, services_id, service[0].freelancer_id, total_price, currency_code]
        );

        // Crear notificación para el freelancer
        await pool.query(
            `INSERT INTO notification (
                user_id,
                type,
                content,
                status,
                is_read,
                created_at
            ) VALUES (?, 'order', ?, 'order_placed', false, NOW())`,
            [service[0].freelancer_id, `Nueva orden recibida para el servicio #${services_id}`]
        );

        return {
            orderId: result.insertId,
            services_id,
            freelancer_id: service[0].freelancer_id,
            total_price,
            currency_code,
            status: 'pending',
            ordered_at: new Date()
        };
    } catch (error) {
        throw generateErrorsUtils(
            "Error al crear la orden",
            error.httpStatus || 500
        );
    }
};

export default createOrderService; 