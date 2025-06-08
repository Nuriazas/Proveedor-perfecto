// services/notifications/acceptContactRequestService.js
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const acceptContactRequestService = async (notificationId, userId) => {
	const pool = await getPool();

	// Verificamos que exista esa notificación y le pertenezca al usuario
	const [notification] = await pool.query(
		`
		SELECT * FROM notification 
		WHERE id = ? AND user_id = ? AND type = 'contact_request'
	`,
		[notificationId, userId]
	);
	console.log("Depuración servicio aceptar solicitud de contacto:", {
		notificationId,
		userId,
		notification,
	});
	

	if (notification.length === 0) {
		throw generateErrorsUtils("Solicitud de contacto no encontrada", 404);
	}

	// Actualizamos el estado a aceptado
	await pool.query(
		`
		UPDATE notification
		SET status = 'contact_request_accepted', is_read = TRUE
		WHERE id = ?
	`,
		[notificationId]
	);

	// Actualizamos el estado a aceptado
	await pool.query(
		`
		UPDATE notification_history
		SET status = 'contact_request_accepted'
		WHERE id = ?
	`,
		[userId]
	);

	return;
};

export default acceptContactRequestService;