// Controller Endpoint lista solicitudes de contacto

// Importamos el servicio que obtiene las notificaciones de solicitudes de contacto
import getContactRequestNotificationsService from "../../services/contactsServices/getContactRequestNotificationsService.js";

// Controlador para manejar la petición de notificaciones de contacto
const getContactRequestNotificationsController = async (req, res, next) => {
  try {
    // Llamamos al servicio para obtener las notificaciones
    const userId = req.user.id;
    const results = await getContactRequestNotificationsService(userId);

    // Enviamos respuesta exitosa con los resultados obtenidos
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export default getContactRequestNotificationsController;
