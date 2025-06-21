// Servicio para enviar solicitudes de contacto a proveedores

import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const sendContactRequestService = async (senderId, serviceId, message) => {
 try {
   console.log("🔧 SERVICIO - senderId (sender):", senderId, "tipo:", typeof senderId);
   console.log("🔧 SERVICIO - serviceId (service):", serviceId, "tipo:", typeof serviceId);
   console.log("🔧 SERVICIO - message:", message);

   // Convertir serviceId a número si viene como string
   const serviceIdNum = parseInt(serviceId);
   const senderIdNum = parseInt(senderId);

   console.log("🔧 SERVICIO - serviceId convertido:", serviceIdNum, "tipo:", typeof serviceIdNum);
   console.log("🔧 SERVICIO - senderId convertido:", senderIdNum, "tipo:", typeof senderIdNum);

   // Validar que las conversiones fueron exitosas
   if (isNaN(serviceIdNum)) {
     throw generateErrorsUtils("ID del servicio inválido", 400);
   }

   if (isNaN(senderIdNum)) {
     throw generateErrorsUtils("ID del remitente inválido", 400);
   }

   const pool = await getPool();

   // ✅ OBTENER EL USER_ID DEL SERVICIO
   const [serviceResult] = await pool.query(
     `SELECT user_id, title FROM services WHERE id = ?`,
     [serviceIdNum]
   );

   if (serviceResult.length === 0) {
     throw generateErrorsUtils("El servicio no existe", 404);
   }

   const receiverId = serviceResult[0].user_id;
   const serviceTitle = serviceResult[0].title;

   console.log("🔧 SERVICIO - receiverId obtenido del servicio:", receiverId);
   console.log("🔧 SERVICIO - título del servicio:", serviceTitle);

   // Verificar que el usuario no se está enviando un mensaje a sí mismo
   if (senderIdNum === receiverId) {
     throw generateErrorsUtils(
       "No puedes enviarte un mensaje a ti mismo",
       400
     );
   }

   // Verificar que el proveedor existe
   const [provider] = await pool.query(
     `SELECT id, name FROM users WHERE id = ?`,
     [receiverId]
   );

   if (provider.length === 0) {
     throw generateErrorsUtils("El proveedor no existe", 404);
   }

   console.log("🔧 SERVICIO - Proveedor encontrado:", provider[0]);

   // Insertar la notificación
   const [result] = await pool.query(
     `INSERT INTO notification (user_id, sender_id, type, content, is_read) 
      VALUES (?, ?, 'contact_request', ?, false)`,
     [receiverId, senderIdNum, `Nuevo mensaje de contacto: ${message}`]
   );

   console.log("🔧 SERVICIO - Notificación insertada con ID:", result.insertId);

   // También en el historial (sin sender_id si no existe)
   await pool.query(
     `INSERT INTO notification_history (user_id, type, content) 
      VALUES (?, 'contact_request', ?)`,
     [
       receiverId,
       `Nuevo mensaje de contacto de ${provider[0].name} (ID: ${senderIdNum}) - ${message}`,
     ]
   );

   console.log("🔧 SERVICIO - Historial insertado correctamente");

   return {
     notificationId: result.insertId,
     providerName: provider[0].name,
   };
 } catch (error) {
   console.log("❌ ERROR en servicio:", error);
   throw generateErrorsUtils(
     "Error al enviar la solicitud de contacto",
     error.httpStatus || 500
   );
 }
};

export default sendContactRequestService;