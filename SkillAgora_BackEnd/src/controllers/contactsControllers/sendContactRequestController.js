// Controlador para enviar solicitudes de contacto a proveedores

import sendContactRequestService from "../../services/contactsServices/sendContactRequestService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const sendContactRequestController = async (req, res, next) => {
   try {
   	// ✅ CAMBIO IMPORTANTE: providerId ahora es realmente serviceId
   	const { providerId: serviceId, message } = req.body;
   	
   	// ✅ AGREGAR DEBUG COMPLETO
    console.log("🎯 CONTROLADOR - ¡SE EJECUTÓ!"); 
   console.log("🎯 CONTROLADOR - req.user:", req.user);
   console.log("🎯 CONTROLADOR - req.body:", req.body);
   console.log("🔧 CONTROLADOR - serviceId extraído:", serviceId);
   	
   	const senderId = req.user?.id; // ✅ Usar optional chaining
   	
   	console.log("🔧 CONTROLADOR - senderId extraído:", senderId);

   	// ✅ VALIDAR QUE req.user EXISTE
   	if (!req.user) {
   		throw generateErrorsUtils("Usuario no autenticado - req.user no disponible", 401);
   	}
   	
   	// ✅ VALIDAR QUE req.user.id EXISTE
   	if (!senderId) {
   		throw generateErrorsUtils("ID de usuario no disponible en el token", 401);
   	}

   	// Validar que se proporcionaron todos los datos necesarios
   	if (!serviceId || !message) {
   		throw generateErrorsUtils("Faltan datos requeridos (serviceId y message)", 400);
   	}

   	// Validar que el mensaje no esté vacío
   	if (message.trim().length === 0) {
   		throw generateErrorsUtils("El mensaje no puede estar vacío", 400);
   	}

   	// ✅ CAMBIO CRÍTICO: Ahora pasamos serviceId en lugar de providerId
   	// El servicio se encargará de obtener el user_id del owner del servicio
   	console.log("🔧 CONTROLADOR - Llamando servicio con:", { senderId, serviceId, message });
   	const result = await sendContactRequestService(senderId, serviceId, message);
   	console.log("🔧 CONTROLADOR - Resultado del servicio:", result);

   	// Enviar respuesta exitosa
   	res.status(201).json({
   		status: "success",
   		message: "Solicitud de contacto enviada exitosamente",
   		data: {
   			notificationId: result.notificationId,
   			providerName: result.providerName,
   		},
   	});
   } catch (error) {
   	console.error("❌ ERROR en controlador:", error);
   	next(error);
   }
};

export default sendContactRequestController;