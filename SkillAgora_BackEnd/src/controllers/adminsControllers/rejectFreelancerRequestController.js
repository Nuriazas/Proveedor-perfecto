// Controlador para rechazar solicitud de freelancer
import rejectFreelancerRequestService from "../../services/adminsServices/rejectFreelancerRequestService.js";

const rejectFreelancerRequestController = async (req, res, next) => {
	try {
		console.log('🔄 Controlador: Rechazando solicitud de freelancer...');
		
		const notificationId = req.params.notificationId;
		const adminId = req.user.id;
		
		console.log('📝 Datos recibidos:', { notificationId, adminId });
		
		const result = await rejectFreelancerRequestService(notificationId, adminId);
		
		console.log('✅ Controlador: Solicitud rechazada correctamente');
		
		res.status(200).json({
			status: "ok",
			data: result
		});
		
	} catch (error) {
		console.error('❌ Error en rejectFreelancerRequestController:', error);
		next(error);
	}
};

export default rejectFreelancerRequestController; 