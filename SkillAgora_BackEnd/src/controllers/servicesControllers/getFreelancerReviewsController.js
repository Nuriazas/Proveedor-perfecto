import getFreelancerReviewsService from "../../services/servicesServices/getFreelancerReviewsServices.js";

// Controlador para obtener todas las valoraciones de un freelancer
const getFreelancerReviewsController = async (req, res) => {
	try {
		const { freelancer_id } = req.params;

		const result = await getFreelancerReviewsService(freelancer_id);

		res.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error al obtener las valoraciones:", error);
		res.status(error.httpStatus || 500).json({
			success: false,
			message: error.message || "Error al obtener las valoraciones",
		});
	}
};

// Este controlador maneja la obtención de todas las reseñas de un freelancer.
// Funcionalidades principales:
// - Recibe la petición HTTP y extrae el ID del freelancer
// - Utiliza el servicio para obtener los datos
// - Maneja los errores y formatea la respuesta

export default getFreelancerReviewsController;
