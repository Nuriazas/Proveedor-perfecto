// Servicio Endpoint para aceptar status freelancer (administrador)

// Importamos la función para obtener conexión a la base de datos
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para aceptar solicitud de freelancer
const acceptFreelancerRequestService = async (notificationId, adminId) => {
	try {
		console.log('🔄 Admin ID:', adminId, 'aceptando solicitud de freelancer, notificación ID:', notificationId);
		
		const pool = await getPool();
		
		// Verificar que la notificación existe y es del admin
		const [notification] = await pool.query(
			`SELECT * FROM notification WHERE id = ? AND user_id = ? AND type = 'contact_request' AND content LIKE '%solicita ser freelancer%'`,
			[notificationId, adminId]
		);
		
		if (notification.length === 0) {
			throw generateErrorsUtils('Notificación de solicitud de freelancer no encontrada', 404);
		}
		
		const notif = notification[0];
		console.log('✅ Notificación encontrada:', notif);
		
		// Obtener el ID del usuario que solicitó ser freelancer
		const senderId = notif.sender_id;
		
		if (!senderId) {
			throw generateErrorsUtils('ID del solicitante no encontrado', 400);
		}
		
		console.log('👤 Usuario solicitante ID:', senderId);
		
		// Actualizar el rol del usuario a 'freelancer'
		const [updateResult] = await pool.query(
			`UPDATE users SET role = 'freelancer' WHERE id = ?`,
			[senderId]
		);
		
		if (updateResult.affectedRows === 0) {
			throw generateErrorsUtils('Usuario no encontrado', 404);
		}
		
		console.log('✅ Rol actualizado a freelancer');
		
		// Marcar la notificación como leída y actualizar el estado
		await pool.query(
			`UPDATE notification SET status = 'contact_request_accepted', is_read = true WHERE id = ?`,
			[notificationId]
		);
		
		console.log('✅ Notificación marcada como aceptada');
		
		// Crear notificación para el usuario informándole que fue aceptado
		await pool.query(
			`INSERT INTO notification (user_id, sender_id, type, content, status, is_read, created_at)
			 VALUES (?, NULL, 'contact_request', ?, 'contact_request_accepted', false, NOW())`,
			[senderId, 'notification.freelancerAccepted']
		);
		
		console.log('✅ Notificación de aceptación enviada al usuario');
		
		return {
			success: true,
			message: 'Solicitud de freelancer aceptada correctamente'
		};
		
	} catch (error) {
		console.error('❌ Error en acceptFreelancerRequestService:', error);
		if (error.httpStatus) {
			throw error;
		}
		throw generateErrorsUtils('Error interno del servidor', 500);
	}
};

export default acceptFreelancerRequestService;
