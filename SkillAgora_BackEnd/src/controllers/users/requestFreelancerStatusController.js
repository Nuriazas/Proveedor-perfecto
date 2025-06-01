// Controller Endpoint para solicitar status freelancer

import requestFreelancerStatusService from "../../services/users/requestFreelancerStatusService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Controlador para manejar la solicitud de estatus de freelancer

const requestFreelancerStatusController = async (req, res, next) => {
	try {
		// Extraemos el userId de los parámetros de la URL usando destructuring
		const { userId } = req.params;
		// Le pasamos el userId extraído de los parámetros
		const requestId = await requestFreelancerStatusService(userId);

		// Enviamos la respuesta al cliente
		res.status(201).json({
			status: "success",
			message: "Request for freelancer status submitted successfully",
			data: requestId,
		});

		if(!res.status) {
			throw generateErrorsUtils("Error al enviar la solicitud de estatus freelancer", 500);
		}
	} catch (error) {
		console.error(error);
		res.status(error.httpStatus || 500).json({
			status: "error",
			message: error.message,
		});
	}
};
export default requestFreelancerStatusController;
