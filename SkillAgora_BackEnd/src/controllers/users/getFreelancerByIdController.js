// Importamos el servicio que obtiene un freelancer específico por su ID
import getFreelancerById from "../../services/users/getFreelancerById.js";

// Controlador para manejar la petición de obtener un freelancer por ID
async function getFreelancerByIdController(req, res) {
	try {
		// Extraemos el ID del freelancer desde los parámetros de la URL
		const { id } = req.params;

		// Llamamos al servicio pasándole el ID para buscar el freelancer
		const freelancer = await getFreelancerById(id);

		// Log para debugging (ver qué freelancer encontramos)
		console.log(`Freelancer ID: ${id}`, freelancer);

		// Verificamos si el freelancer existe
		if (!freelancer) {
			// Si no existe, devolvemos error 404 (No encontrado)
			return res.status(404).json({
				success: false,
				message: "Freelancer no encontrado",
			});
		}

		// Si existe, enviamos respuesta exitosa con los datos del freelancer
		res.json({
			success: true,
			data: freelancer,
		});
	} catch (error) {
		// Si hay error, enviamos respuesta de error con mensaje
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

export default getFreelancerByIdController;

// ¿Qué hace este controlador?
// 1. Recibe una petición HTTP con un ID en la URL
// 2. Extrae el ID de los parámetros de la petición
// 3. Busca el freelancer específico usando el ID
// 4. Valida si existe y devuelve error 404 si no lo encuentra
// 5. Devuelve los datos del freelancer si lo encuentra
