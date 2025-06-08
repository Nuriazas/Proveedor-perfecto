// Controller Endpoint para aceptar el registro de un proveedor (administrador)

// Importamos el servicio que acepta el registro del freelancer
import acceptFreelancerRegisterService from "../../services/adminsServices/acceptFreelancerRequestService.js";

// Importamos utilidad para generar errores personalizados
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

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

export default acceptFreelancerRegisterController;
