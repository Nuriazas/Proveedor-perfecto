// Importamos el servicio que obtiene las categorías de la base de datos
import getCategoriesService from "../../services/servicesServices/getCategoriesService.js";

// Controlador para manejar la petición de obtener categorías
const getCategoriesController = async (req, res, next) => {
	try {
		// Llamamos al servicio para obtener las categorías
		const categories = await getCategoriesService();

		// Enviamos respuesta exitosa con las categorías
		res.status(200).json({
			success: true,
			data: categories,
		});
	} catch (error) {
		// Si hay error, lo pasamos al middleware de errores
		next(error);
	}
};

export default getCategoriesController;

// ¿Qué hace este controlador?
// 1. Recibe una petición HTTP
// 2. Llama al servicio para obtener datos
// 3. Devuelve respuesta JSON al cliente
// 4. Maneja errores si algo sale mal
