// Importamos el servicio que se encargará de consultar la base de datos
import getAllServicesByFiltersService from "../../services/servicesServices/getAllServicesByFiltersService.js";

// Función controladora que recibe la petición HTTP y llama al servicio
const getAllServicesByFiltersController = async (req, res, next) => {
	try {
		// Obtenemos todos los filtros enviados por query string (desde el cliente)
		const filters = {
			category: req.query.category,
			place: req.query.place,
			minPrice: req.query.minPrice,
			maxPrice: req.query.maxPrice,
			orderBy: req.query.orderBy,
			orderDirection: req.query.orderDirection,
			limit: req.query.limit,
			offset: req.query.offset,
		};

		// Llamamos al servicio pasando los filtros
		const services = await getAllServicesByFiltersService(filters);

		// Enviamos la respuesta al cliente con los datos
		res.send({
			status: "ok",
			data: services,
		});
	} catch (error) {
		// Si ocurre un error, lo pasamos al middleware de errores
		next(error);
	}
};

export default getAllServicesByFiltersController;
