// Controller Endpoint para aceptar el registro de un proveedor (administrador)

// Importamos el servicio que acepta el registro del freelancer
import acceptFreelancerRegisterService from "../../services/adminsServices/acceptFreelancerRequestService.js";

// Importamos utilidad para generar errores personalizados
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Controlador para aceptar solicitud de freelancer
import acceptFreelancerRequestService from "../../services/adminsServices/acceptFreelancerRequestService.js";

// Controlador para aceptar el registro de un usuario como freelancer
const acceptFreelancerRegisterController = async (req, res, next) => {
	try {
		// Obtenemos el ID del usuario desde los parámetros de la URL
		const { id } = req.params;

		// Validamos que se haya proporcionado el ID
		if (!id) {
			throw generateErrorsUtils("Falta el ID del usuario", 400);
		}

		// Validamos que el usuario que hace la petición sea admin
		if (req.user.is_admin) {
			return res.status(403).json({
				status: "error",
				message: "No tienes permisos para aceptar registros de freelancer",
			});
		}

		// Llamamos al servicio que actualiza el rol del usuario a 'freelancer'
		const userUpdatedToFreelancer = await acceptFreelancerRegisterService(id);

		// Enviamos respuesta con el usuario actualizado y un mensaje de éxito
		res.send({
			status: "ok",
			data: {
				user: userUpdatedToFreelancer,
				message: `${userUpdatedToFreelancer.name} role has succefully been updated to "freelancer"`,
			},
		});
	} catch (error) {
		next(error);
	}
};

// Controlador para aceptar solicitud de freelancer
const acceptFreelancerRequestController = async (req, res, next) => {
	try {
		console.log('🔄 Controlador: Aceptando solicitud de freelancer...');
		
		const notificationId = req.params.notificationId;
		const adminId = req.user.id;
		
		console.log('📝 Datos recibidos:', { notificationId, adminId });
		
		const result = await acceptFreelancerRequestService(notificationId, adminId);
		
		console.log('✅ Controlador: Solicitud aceptada correctamente');
		
		res.status(200).json({
			status: "ok",
			data: result
		});
		
	} catch (error) {
		console.error('❌ Error en acceptFreelancerRequestController:', error);
		next(error);
	}
};

export default acceptFreelancerRequestController;
