// Ruta: SkillAgora_BackEnd/src/services/entries/gigsService.js

// Importamos la función que nos da la conexión a la base de datos
import getPool from "../../db/getPool.js";
import priceUtils from "../../utils/priceUtils.js";

// Servicio para obtener servicios populares/destacados ordenados por popularidad
const getFeaturedServices = async () => {
	let pool;

	try {
		// Obtenemos la conexión a la base de datos
		pool = await getPool();

		// Query SQL compleja que obtiene servicios con toda su información
		const query = `
            SELECT 
                s.id,
                s.title,
                s.price,
                s.delivery_time_days,
                u.name as freelancer_name,
                c.name as category_name,
                (SELECT sm.media_url
                FROM service_media sm
                WHERE sm.service_id = s.id AND sm.type = 'image'
                LIMIT 1) as main_image,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(DISTINCT o.id) as total_orders
            FROM services s
            INNER JOIN users u ON s.user_id = u.id
            INNER JOIN categories c ON s.category_id = c.id
            LEFT JOIN orders o ON s.id = o.services_id
            LEFT JOIN reviews r ON o.id = r.order_id
            GROUP BY s.id, s.title, s.price, s.delivery_time_days, u.name, c.name
            ORDER BY total_orders DESC, rating DESC, s.created_at DESC
        `;

		// Explicación del SQL:
		// - SELECT: obtenemos datos del servicio, freelancer, categoría, imagen, rating y órdenes
		// - INNER JOIN: unimos servicios con usuarios y categorías (datos obligatorios)
		// - LEFT JOIN: unimos con órdenes y reviews (pueden no existir)
		// - Subconsulta: obtenemos la primera imagen de cada servicio
		// - COALESCE: si no hay rating, ponemos 0
		// - GROUP BY: agrupamos para calcular promedios y conteos
		// - ORDER BY: ordenamos por popularidad (más órdenes primero)

		// Ejecutamos la consulta en la base de datos
		const [featuredServices] = await pool.execute(query);

		// Procesamiento post-consulta: formateamos el rating y agregamos precio formateado
		featuredServices.forEach((service) => {
			service.rating = parseFloat(service.rating).toFixed(1);
			// Agregar precio formateado con símbolo de dólar
			service.price_formatted = priceUtils.formatPrice(service.price, 'USD');
			// Mantener el precio original como número para cálculos
			service.price_number = parseFloat(service.price) || 0;
		});

		// Devolvemos los servicios destacados al controlador
		return featuredServices;
	} catch (error) {
		// Si hay error, lo mostramos en consola para debugging
		console.error("Error al obtener servicios destacados:", error);

		// Re-lanzamos el error para que el controlador lo maneje
		throw error;
	}
};

export default getFeaturedServices;

// ¿Qué hace este servicio?
// 1. Ejecuta una consulta SQL muy compleja con múltiples JOINS
// 2. Obtiene servicios con datos del freelancer, categoría, imagen y estadísticas
// 3. Calcula el rating promedio y cuenta las órdenes totales
// 4. Ordena por popularidad (más pedidos = más destacado)
// 5. Formatea los datos antes de devolverlos
