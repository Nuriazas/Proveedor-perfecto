// Importamos el servicio necesario
import createReviewService from "../../services/servicesServices/CreateReviewService.js";

// Controlador para crear una nueva valoración de un servicio
const createReviewController = async (req, res) => {
	try {
		// Extraemos los datos necesarios del request
		const {service_id} = req.params;
		const { rating, comment } = req.body;
		const reviewer_id = req.user.id;

		// Llamamos al servicio para crear la valoración
		const result = await createReviewService(
			
			service_id,
			reviewer_id,
			rating,
			comment
		);

		// Enviamos la respuesta exitosa
		res.status(201).json(result);
	} catch (error) {
		// Si hay error, lo mostramos en consola para debugging
		console.error("Error al crear la valoración:", error);

		// Enviamos la respuesta de error
		res.status(error.httpStatus || 500).json({
			success: false,
			message: error.message || "Error al crear la valoración",
		});
	}
};

// Este controlador maneja la creación de nuevas reseñas para servicios.
// Funcionalidades principales:
// - Recibe los datos de la valoración del request
// - Utiliza el servicio createReviewService para procesar la valoración
// - Maneja las respuestas exitosas y los errores
// - Devuelve el resultado al cliente

export default createReviewController;
