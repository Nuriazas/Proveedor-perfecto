import {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    updateOrderService,
    deleteOrderService,
    acceptOrderService
} from "../../services/notificationsServices/index.js";
import saveOrderDelivery from "../../services/notificationsServices/saveOrderDelivery.js";
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

            // Ruta que acepta una orden

            case 'accept': {
            const { orderId: acceptOrderId } = req.params;

            const acceptedOrder = await acceptOrderService(acceptOrderId);

            res.status(200).send({
                status: "ok",
                message: "Orden aceptada exitosamente",
                data: acceptedOrder
            });
            break;
}

            // Ruta que trae una orden (detalles)

            case 'get':
                const { status, page = 1, limit = 10 } = req.query;
                const orders = await getOrdersService(userId, status, page, limit);
                
                res.status(200).send({
                    status: "ok",
                    data: orders
                });
                break;

            // Ruta que trae una orden por id

            case 'getById':
                const { orderId } = req.params;
                const order = await getOrderByIdService(userId, orderId);
                
                res.status(200).send({
                    status: "ok",
                    data: order
                });
                break;

                case 'accepted':
                    const newStatus = "completed"

                    const newStatusResult = await getOrdersService()

                // Ruta que actualiza una orden. Pide un objeto updateData por body y orderId por params(link).
                // Si el objeto no trae nada, lanza error
                // segun la linia 93, el objeto tiene que traer status
                
                case 'update':
                    const { orderId: updateOrderId } = req.params;
                    // Por el body tiene que traer el nuevo estado
                    const updateData = req.body;
                    // console.log("Datos recibidos para actualizar:", updateData);


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
            case 'delivered': {
                const { orderId } = req.params;
                const { deliveryUrl } = req.body;
                const userId = req.user.id;

                if (!deliveryUrl) {
                    throw generateErrorsUtils("Debe proporcionar la URL de la entrega", 400);
                }

                // Aquí llamas a un servicio que guarde en orders_deliveries el URL para la orden
                const deliveryRecord = await saveOrderDelivery(orderId, deliveryUrl, userId);

                // También puedes actualizar el estado de la orden a 'delivered' si quieres
                await updateOrderService(userId, orderId, { status: 'delivered' });

                res.status(200).send({
                    status: "ok",
                    message: "Entrega registrada correctamente",
                    data: deliveryRecord
                });
                break;
            }

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