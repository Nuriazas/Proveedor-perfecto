import getpool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getContactRequestNotificationsService = async (userId) => {
  try {
    console.log("🗄️ Servicio notifications - userId:", userId);

    const pool = await getpool();

    // Query con JOIN para obtener el nombre del remitente
    const query = `
            SELECT 
                n.id,
                n.user_id,
                n.content,
                n.type,
                n.status,
                n.is_read,
                n.email_sent,
                n.email_sent_at,
                n.created_at,
                sender.name AS sender_name,
                sender.lastName AS sender_lastName,
                sender.email AS sender_email
            FROM notification n
            LEFT JOIN users sender ON n.sender_id = sender.id
            WHERE n.user_id = ? AND n.type = 'contact_request'
            ORDER BY n.created_at DESC
        `;

    console.log("📝 Query:", query);
    console.log("🔗 Parámetros:", [userId]);

    const [notifications] = await pool.execute(query, [userId]);

    console.log("📊 Contact requests encontradas:", notifications.length);

    // Formatear resultados con nombre del remitente
    const result = notifications.map((notification) => ({
      id: notification.id,
      userId: notification.user_id,
      content: notification.content,
      senderName: notification.sender_name,
      senderLastName: notification.sender_lastName,
      senderEmail: notification.sender_email,
      type: notification.type,
      status: notification.status,
      isRead: notification.is_read,
      emailSent: notification.email_sent,
      emailSentAt: notification.email_sent_at,
      createdAt: notification.created_at,
    }));

    console.log("✅ Contact requests con nombres:", result);
    return result;
  } catch (error) {
    console.error("❌ ERROR en servicio:", error);
    throw generateErrorsUtils(
      "Error fetching contact request notifications: " + error.message,
      500
    );
  }
};

export default getContactRequestNotificationsService;
