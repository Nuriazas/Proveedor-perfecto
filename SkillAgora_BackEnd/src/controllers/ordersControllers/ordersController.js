import {
	createOrderService,
	getOrdersService,
	getOrderByIdService,
	updateOrderService,
	deleteOrderService,
	acceptOrderService,
	saveOrderDelivery,
} from "../../services/ordersServices/index.js";
import { checkOrderStatusService } from "../../services/ordersServices/createOrderService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import getServiceDetailsByIdService from "../../services/servicesServices/getServiceDetailsByIdService.js";

const ordersController = async (req, res, next) => {
	try {
		const { action } = req.params;
		const userId = req.user.id;

		switch (action) {
			case "create": {
				const { serviceId } = req.params;

				if (!serviceId) {
					throw generateErrorsUtils("Falta el ID del servicio", 400);
				}

				// Obtener el servicio de la BD
				const service = await getServiceDetailsByIdService(serviceId);
				if (!service) {
					throw generateErrorsUtils("Servicio no encontrado", 404);
				}

				const total_price = service.price;
				const currency_code = service.currency_code || "USD";

				const newOrder = await createOrderService(
					userId,
					serviceId,  // CORREGIDO: Ya no se pasa como array
					total_price,
					currency_code
				);

				res.status(201).send({
					status: "ok",
					message: "Orden creada exitosamente",
					data: newOrder,
				});
				break;
			}

			case "accept": {
				const { orderId: acceptOrderId } = req.params;

				const acceptedOrder = await acceptOrderService(acceptOrderId, userId);

				res.status(200).send({
					status: "ok",
					message: "Orden aceptada exitosamente",
					data: acceptedOrder,
				});
				break;
			}

			case "get": {
				const { status, page = 1, limit = 10 } = req.query;

				const orders = await getOrdersService(userId, status, page, limit);

				res.status(200).send({
					status: "ok",
					data: orders,
				});
				break;
			}

			case "checkStatus": {
				const { serviceId } = req.params;

				if (!serviceId) {
					throw generateErrorsUtils("Falta el ID del servicio", 400);
				}

				const orderStatus = await checkOrderStatusService(userId, serviceId);

				res.status(200).send({
					status: "ok",
					data: orderStatus
				});
				break;
			}

			case "getById": {
				const { orderId } = req.params;

				const order = await getOrderByIdService(userId, orderId);

				res.status(200).send({
					status: "ok",
					data: order,
				});
				break;
			}

			case "update": {
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
					data: updatedOrder,
				});
				break;
			}

			case "delivered": {
				const { orderId } = req.params;
				const { deliveryUrl } = req.body;

				if (!deliveryUrl) {
					throw generateErrorsUtils(
						"Debe proporcionar la URL de la entrega",
						400
					);
				}

				const deliveryRecord = await saveOrderDelivery(
					orderId,
					deliveryUrl,
					userId
				);

				await updateOrderService(userId, orderId, { status: "delivered" });

				res.status(200).send({
					status: "ok",
					message: "Entrega registrada correctamente",
					data: deliveryRecord,
				});
				break;
			}

			case "delete": {
				const { orderId: deleteOrderId } = req.params;

				await deleteOrderService(userId, deleteOrderId);

				res.status(200).send({
					status: "ok",
					message: "Orden eliminada exitosamente",
				});
				break;
			}

			default:
				throw generateErrorsUtils("Acción no válida", 400);
		}
	} catch (error) {
		next(error);
	}
};

export default ordersController;