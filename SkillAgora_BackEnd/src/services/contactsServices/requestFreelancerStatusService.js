// Servicio Endpoint para solicitar status freelancer

import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para solicitar el estatus de freelancer
const requestFreelancerStatusService = async (userId) => {
	try {
		console.log('🔄 Usuario ID:', userId, 'solicita ser freelancer');
		
		const pool = await getPool();
		
		// Obtener datos del usuario
		const [userRows] = await pool.query(
			`SELECT id, name, lastName FROM users WHERE id = ?`,
			[userId]
		);
		
		if (userRows.length === 0) {
			throw generateErrorsUtils('Usuario no encontrado', 404);
		}
		
		const user = userRows[0];
		
		// Crear notificación para el admin
		const [result] = await pool.query(
			`INSERT INTO notification (user_id, sender_id, type, content, status, is_read, created_at)
			 VALUES (1, ?, 'contact_request', ?, 'contact_request_pending', false, NOW())`,
			[userId, `${user.name} ${user.lastName || ''}`.trim() + ' solicita ser freelancer']
		);
		
		console.log('✅ Notificación creada con ID:', result.insertId);
		
		return {
			success: true,
			message: 'Solicitud enviada correctamente'
		};
		
	} catch (error) {
		console.error('❌ Error:', error);
		if (error.httpStatus) {
			throw error;
		}
		throw generateErrorsUtils('Error interno del servidor', 500);
	}
};

export default requestFreelancerStatusService;
