// Servicio Endpoint lista solicitudes de contacto

// Importamos la función para obtener la conexión a la base de datos
import getpool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio que obtiene las notificaciones de solicitudes de contacto no leídas
const getContactRequestNotificationsService = async () => {
	try {
		const pool = await getpool();

		// Consulta que selecciona todas las notificaciones de tipo 'message' que no han sido leídas
		// Se hace join con la tabla de usuarios para obtener más información si se necesitara
		// const query = `
        // SELECT * FROM notification n
        // JOIN users u ON n.user_id = u.id
        // ORDER BY n.created_at DESC
        // `;

		 const query = `
        SELECT * FROM notification n
        JOIN users u ON n.user_id = u.id
        WHERE n.user_id = ?  // Filtrar por usuario
        ORDER BY n.created_at DESC
        `; 

		// Ejecutamos la consulta
		const [notifications] = await pool.execute(query);

		// Formateamos los resultados para devolver solo los campos necesarios
		const result = notifications.map((notification) => ({
			id: notification.id,
			userId: notification.user_id,
			content: notification.content,
			type: notification.type,
			isRead: notification.is_read,
			emailSent: notification.email_sent,
			emailSentAt: notification.email_sent_at,
			createdAt: notification.created_at,
		}));

		// Devolvemos el array con las notificaciones formateadas
		return result;
	} catch (error) {
		throw generateErrorsUtils(
			"Error fetching contact request notifications:",
			500 + error
		);
	}
};

export default getContactRequestNotificationsService;
