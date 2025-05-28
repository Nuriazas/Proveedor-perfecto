import getPool from "../../db/getPool.js";

// Servicio para obtener estadísticas de los servicios
const getServiceStatisticsService = async () => {
	try {
		const pool = await getPool();

		// 1. Estadísticas globales
		const statsQuery = `
			SELECT 
				COUNT(*) AS total_services,
				AVG(price) AS average_price,
				MIN(price) AS min_price,
				MAX(price) AS max_price,
				AVG(delivery_time_days) AS average_delivery_time
			FROM services
		`;

		// 2. Último servicio
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

		const [[stats]] = await pool.execute(statsQuery);
		const [[lastService]] = await pool.execute(lastServiceQuery);

		return {
			total_services: parseInt(stats.total_services || 0),
			average_price: parseFloat(stats.average_price || 0).toFixed(2),
			min_price: parseFloat(stats.min_price || 0).toFixed(2),
			max_price: parseFloat(stats.max_price || 0).toFixed(2),
			average_delivery_time: Math.round(stats.average_delivery_time || 0),
			...lastService,
		};
	} catch (error) {
		console.error("Error en getServiceStatisticsService:", error);
		throw error;
	}
};
export default getServiceStatisticsService;