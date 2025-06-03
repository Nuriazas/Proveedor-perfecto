// Controlador para enviar solicitudes de contacto a proveedores

import sendContactRequestService from "../../services/notificationsServices/sendContactRequestService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const sendContactRequestController = async (req, res, next) => {
    try {
        const { providerId, message } = req.body;
        const userId = req.user.id; // Asumiendo que el usuario está autenticado

        // Validar que se proporcionaron todos los datos necesarios
        if (!providerId || !message) {
            throw generateErrorsUtils("Faltan datos requeridos", 400);
        }

        // Validar que el mensaje no esté vacío
        if (message.trim().length === 0) {
            throw generateErrorsUtils("El mensaje no puede estar vacío", 400);
        }

        // Llamar al servicio para procesar la solicitud
        const result = await sendContactRequestService(userId, providerId, message);

        // Enviar respuesta exitosa
        res.status(201).json({
            status: "success",
            message: "Solicitud de contacto enviada exitosamente",
            data: {
                notificationId: result.notificationId,
                providerName: result.providerName
            }
        });
    } catch (error) {
        next(error);
    }
};

export default sendContactRequestController;


// RESUMEN:
// Este controlador gestiona las peticiones HTTP para enviar mensajes de contacto.
// Valida los datos de entrada, procesa la solicitud a través del servicio
// y devuelve una respuesta apropiada al cliente.
