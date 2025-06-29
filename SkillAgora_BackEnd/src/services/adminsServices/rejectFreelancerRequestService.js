// Servicio para rechazar solicitud de freelancer
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const rejectFreelancerRequestService = async (notificationId, adminId) => {
	try {
		console.log('🔄 Admin ID:', adminId, 'rechazando solicitud de freelancer, notificación ID:', notificationId);
		
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
		
		// Marcar la notificación como leída y actualizar el estado a rechazado
		await pool.query(
			`UPDATE notification SET status = 'contact_request_rejected', is_read = true WHERE id = ?`,
			[notificationId]
		);
		
		console.log('✅ Notificación marcada como rechazada');
		
		// Crear notificación para el usuario informándole que fue rechazado
		await pool.query(
			`INSERT INTO notification (user_id, sender_id, type, content, status, is_read, created_at)
			 VALUES (?, NULL, 'contact_request', ?, 'contact_request_rejected', false, NOW())`,
			[senderId, 'notification.freelancerRejected']
		);
		
		console.log('✅ Notificación de rechazo enviada al usuario');
		
		return {
			success: true,
			message: 'Solicitud de freelancer rechazada correctamente'
		};
		
	} catch (error) {
		console.error('❌ Error en rejectFreelancerRequestService:', error);
		if (error.httpStatus) {
			throw error;
		}
		throw generateErrorsUtils('Error interno del servidor', 500);
	}
};

export default rejectFreelancerRequestService; 