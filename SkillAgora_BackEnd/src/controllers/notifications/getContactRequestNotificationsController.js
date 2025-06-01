// Controller Endpoint lista solicitudes de contacto

// Importamos el servicio que obtiene las notificaciones de solicitudes de contacto
import getContactRequestNotificationsService from "../../services/notifications/getContactRequestNotificationsService.js";

// Controlador para manejar la petición de notificaciones de contacto
const getContactRequestNotificationsController = async (req, res, next) => {
	try {
		// Llamamos al servicio para obtener las notificaciones
		const results = await getContactRequestNotificationsService();

		// Enviamos respuesta exitosa con los resultados obtenidos
		res.status(200).json({ success: true, data: results });
	} catch (error) {
		next(error);
	}
};

export default getContactRequestNotificationsController;
