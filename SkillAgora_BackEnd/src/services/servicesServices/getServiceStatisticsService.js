// Servicio Endpoint de detalle de un producto o servicio

// Importamos la función para obtener la conexión a la base de datos
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import priceUtils from "../../utils/priceUtils.js";

// Este servicio obtiene estadísticas de los servicios disponibles en la base de datos
const getServiceStatisticsService = async () => {
	try {
		// Obtenemos la conexión al pool de la base de datos
		const pool = await getPool();

		// 1. Estadísticas globales
		// Consulta que obtiene el total de servicios, precio promedio, mínimo, máximo
		// y tiempo promedio de entrega
		const statsQuery = `
			SELECT 
				COUNT(*) AS total_services,
				AVG(price) AS average_price,
				MIN(price) AS min_price,
				MAX(price) AS max_price,
				AVG(delivery_time_days) AS average_delivery_time
			FROM services
		`;

		// Consulta que obtiene la información del servicio más reciente
		const lastServiceQuery = `
			SELECT 
				user_id AS userId,
				place,
				title,
				description,
				created_at AS serviceCreationDate
			FROM services
			ORDER BY created_at DESC
			LIMIT 1
		`;

		// Ejecutamos ambas consultas
		const [[stats]] = await pool.execute(statsQuery);
		const [[lastService]] = await pool.execute(lastServiceQuery);

		// Devolvemos los resultados formateados como objeto
		return {
			// Convertimos el total de servicios a número entero (por si viene como string o null)
			total_services: parseInt(stats.total_services || 0),
			// Convertimos el precio promedio a número decimal con 2 decimales (si viene null usamos 0)
			average_price: parseFloat(stats.average_price || 0).toFixed(2),
			average_price_formatted: priceUtils.formatPrice(stats.average_price, 'USD'),
			// Convertimos el precio mínimo a número decimal con 2 decimales
			min_price: parseFloat(stats.min_price || 0).toFixed(2),
			min_price_formatted: priceUtils.formatPrice(stats.min_price, 'USD'),
			// Convertimos el precio máximo a número decimal con 2 decimales
			max_price: parseFloat(stats.max_price || 0).toFixed(2),
			max_price_formatted: priceUtils.formatPrice(stats.max_price, 'USD'),
			// Redondeamos el tiempo promedio de entrega al número entero más cercano
			average_delivery_time: Math.round(stats.average_delivery_time || 0),
			// Añadimos los datos del último servicio (desestructurado del objeto lastService)
			...lastService,
		};
	} catch (error) {
		throw generateErrorsUtils("Error fetching service statistics.", 500, error);
	}
};

export default getServiceStatisticsService;
