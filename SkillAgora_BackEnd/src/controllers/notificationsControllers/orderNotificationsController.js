import {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    updateOrderService,
    deleteOrderService
} from "../../services/notificationsServices/index.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const orderNotificationsController = async (req, res, next) => {
    try {
        const { action } = req.params;
        const userId = req.user.id;

        switch (action) {
            case 'create':
                const { services_id, total_price, currency_code } = req.body;

                if (!services_id || !total_price) {
                    throw generateErrorsUtils("Faltan campos requeridos", 400);
                }

                const newOrder = await createOrderService(
                    userId,
                    services_id,
                    total_price,
                    currency_code
                );

                res.status(201).send({
                    status: "ok",
                    message: "Orden creada exitosamente",
                    data: newOrder
                });
                break;

            case 'get':
                const { status, page = 1, limit = 10 } = req.query;
                const orders = await getOrdersService(userId, status, page, limit);
                
                res.status(200).send({
                    status: "ok",
                    data: orders
                });
                break;

            case 'getById':
                const { orderId } = req.params;
                const order = await getOrderByIdService(userId, orderId);
                
                res.status(200).send({
                    status: "ok",
                    data: order
                });
                break;

            case 'update':
                const { orderId: updateOrderId } = req.params;
                const updateData = req.body;

                if (Object.keys(updateData).length === 0) {
                    throw generateErrorsUtils("No hay datos para actualizar", 400);
                }

                const updatedOrder = await updateOrderService(
                    userId,
                    updateOrderId,
                    updateData
                );

                res.status(200).send({
                    status: "ok",
                    message: "Orden actualizada exitosamente",
                    data: updatedOrder
                });
                break;

            case 'delete':
                const { orderId: deleteOrderId } = req.params;
                await deleteOrderService(userId, deleteOrderId);

                res.status(200).send({
                    status: "ok",
                    message: "Orden eliminada exitosamente"
                });
                break;

            default:
                throw generateErrorsUtils("Acción no válida", 400);
        }
    } catch (error) {
        next(error);
    }
};

export default orderNotificationsController; 