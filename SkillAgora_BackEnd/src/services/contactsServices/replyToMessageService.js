import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const replyToMessageService = async (messageId, replyContent, currentUserId) => {
  try {
    console.log("🔧 SERVICIO REPLY - messageId:", messageId);
    console.log("🔧 SERVICIO REPLY - replyContent:", replyContent);
    console.log("🔧 SERVICIO REPLY - currentUserId:", currentUserId);

    const pool = await getPool();

    const [originalMessage] = await pool.query(
      `SELECT 
        n.id,
        n.sender_id,
        n.user_id,
        n.content,
        sender.name AS sender_name,
        sender.lastName AS sender_lastName
      FROM notification n
      LEFT JOIN users sender ON n.sender_id = sender.id
      WHERE n.id = ?`,
      [messageId]
    );

    if (originalMessage.length === 0) {
      throw generateErrorsUtils("Mensaje no encontrado", 404);
    }

    const message = originalMessage[0];
    const originalSenderId = message.sender_id;

    console.log("🔧 SERVICIO REPLY - Mensaje original encontrado:", message);
    console.log("🔧 SERVICIO REPLY - Responder a usuario ID:", originalSenderId);

    if (currentUserId === originalSenderId) {
      throw generateErrorsUtils("No puedes responderte a ti mismo", 400);
    }

    const [targetUser] = await pool.query(
      `SELECT id, name, lastName FROM users WHERE id = ?`,
      [originalSenderId]
    );

    if (targetUser.length === 0) {
      throw generateErrorsUtils("El usuario destinatario no existe", 404);
    }

    const [currentUser] = await pool.query(
      `SELECT id, name, lastName FROM users WHERE id = ?`,
      [currentUserId]
    );

    if (currentUser.length === 0) {
      throw generateErrorsUtils("Usuario actual no encontrado", 404);
    }

    console.log("🔧 SERVICIO REPLY - Usuario destinatario:", targetUser[0]);
    console.log("🔧 SERVICIO REPLY - Usuario actual:", currentUser[0]);

    const [result] = await pool.query(
      `INSERT INTO notification (user_id, sender_id, type, content, is_read) 
       VALUES (?, ?, 'contact_request', ?, false)`,
      [originalSenderId, currentUserId, `Respuesta: ${replyContent}`]
    );

    console.log("🔧 SERVICIO REPLY - Notificación creada con ID:", result.insertId);

    await pool.query(
      `INSERT INTO notification_history (user_id, sender_id, type, content) 
       VALUES (?, ?, 'contact_request', ?)`,
      [
        originalSenderId,
        currentUserId,
        `Respuesta de ${currentUser[0].name} ${currentUser[0].lastName || ''}: ${replyContent}`
      ]
    );

    console.log("🔧 SERVICIO REPLY - Historial creado correctamente");

    return {
      notificationId: result.insertId,
      recipientName: `${targetUser[0].name} ${targetUser[0].lastName || ''}`.trim(),
      originalMessageId: messageId
    };

  } catch (error) {
    console.error("❌ ERROR en replyToMessageService:", error);
    throw generateErrorsUtils(
      "Error al enviar la respuesta: " + error.message,
      error.httpStatus || 500
    );
  }
};

export default replyToMessageService;
