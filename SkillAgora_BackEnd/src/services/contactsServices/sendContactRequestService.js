// Servicio para enviar solicitudes de contacto a proveedores

import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const sendContactRequestService = async (userId, providerId, message) => {
  try {
    console.log("🔧 SERVICIO - userId (sender):", userId);
    console.log("🔧 SERVICIO - providerId (receiver):", providerId);
    console.log("🔧 SERVICIO - message:", message);
    const pool = await getPool();

    // Verificar que el proveedor existe y es freelancer
    const [provider] = await pool.query(
      `SELECT id, name FROM users WHERE id = ?`,
      [providerId]
    );

    if (provider.length === 0) {
      throw generateErrorsUtils("El proveedor no existe", 404);
    }
    if (!Number.isInteger(providerId)) {
      throw generateErrorsUtils("ID del proveedor inválido", 400);
    }

    // Verificar que el usuario no se está enviando un mensaje a sí mismo
    if (userId === providerId) {
      throw generateErrorsUtils(
        "No puedes enviarte un mensaje a ti mismo",
        400
      );
    }

    // ✅ ACTUALIZADO: Incluir sender_id en la notificación
    const [result] = await pool.query(
      `INSERT INTO notification (user_id, sender_id, type, content, is_read) 
     VALUES (?, ?, 'contact_request', ?, false)`,
      [providerId, userId, `Nuevo mensaje de contacto: ${message}`]
    );

    // ✅ ACTUALIZADO: También en el historial (opcional)
    await pool.query(
      `INSERT INTO notification_history (user_id, type, content) 
             VALUES (?, 'contact_request', ?)`,
      [
        providerId,
        `Nuevo mensaje de contacto de usuario ID: ${userId} - ${message}`,
      ]
    );

    return {
      notificationId: result.insertId,
      providerName: provider[0].name,
    };
  } catch (error) {
    throw generateErrorsUtils(
      "Error al enviar la solicitud de contacto",
      error.httpStatus || 500
    );
  }
};

export default sendContactRequestService;
